import os
from dotenv import load_dotenv
from groq import Groq
from backend.database import execute_query
import json

load_dotenv()
client = Groq(api_key=os.environ.get("GROQ_API_KEY", "mock_key_for_testing"))

# Schema definition to provide context to the LLM
DATABASE_SCHEMA = """
Tables available:
1. agg_monthly_revenue
   Columns: revenue_month (TIMESTAMP), total_revenue (DOUBLE), total_freight (DOUBLE), total_orders (BIGINT), total_customers (BIGINT)
2. agg_category_performance
   Columns: category_name (VARCHAR), total_revenue (DOUBLE), units_sold (BIGINT)
3. dim_customers
   Columns: customer_id (VARCHAR), customer_unique_id (VARCHAR), zip_code (BIGINT), city (VARCHAR), state (VARCHAR)
4. fact_order_items
   Columns: order_id (VARCHAR), customer_id (VARCHAR), product_id (VARCHAR), seller_id (VARCHAR), order_status (VARCHAR), purchase_timestamp (TIMESTAMP), delivered_timestamp (TIMESTAMP), price (DOUBLE), freight_value (DOUBLE), total_item_value (DOUBLE)
"""

def generate_sql(user_question: str) -> str:
    """Uses Groq to translate a natural language question into SQL."""
    prompt = f"""
You are an expert Data Analyst using DuckDB.
Translate the following user question into a standard SQL query using the provided schema.
Always return ONLY the SQL query, without markdown formatting or explanation.

Schema:
{DATABASE_SCHEMA}

Question: {user_question}
"""
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0,
            max_tokens=500
        )
        sql = response.choices[0].message.content.strip()
        # Clean markdown if LLM includes it despite instructions
        if sql.startswith("```sql"):
            sql = sql[6:]
        if sql.startswith("```"):
            sql = sql[3:]
        if sql.endswith("```"):
            sql = sql[:-3]
        return sql.strip()
    except Exception as e:
        print(f"Error generating SQL: {e}")
        return None

def analyze_results(user_question: str, query: str, data_json: str) -> dict:
    """Uses Groq to analyze SQL results and generate a business summary."""
    prompt = f"""
You are an AI Business Intelligence Analyst.
Analyze the following data returned from a SQL query to answer the user's question.

User Question: {user_question}
SQL Query executed: {query}
Data Results (JSON): {data_json}

Provide a JSON response with the following keys:
- "summary": A brief executive summary (2-3 sentences) answering the question based on the data.
- "insights": An array of 2-3 key findings (bullet points).
- "recommended_chart": A string ("bar", "line", "pie", or "number") suggesting how to visualize this.
"""
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        print(f"Error analyzing results: {e}")
        return {
            "summary": "Could not analyze the results.",
            "insights": ["Data retrieval successful, but LLM analysis failed."],
            "recommended_chart": "table"
        }

def ask_question(question: str) -> dict:
    """End-to-end pipeline: NLQ -> SQL -> Execute -> Analyze."""
    
    # 1. Generate SQL
    sql_query = generate_sql(question)
    if not sql_query:
        return {"error": "Failed to generate SQL"}
        
    print(f"Generated SQL: {sql_query}")
    
    # 2. Execute SQL
    try:
        df = execute_query(sql_query)
        if df is None or len(df) == 0:
            return {"sql": sql_query, "error": "Query returned no results"}
            
        # Limit rows for LLM context to prevent token overflow
        limited_df = df.head(50)
        data_json = limited_df.to_json(orient="records")
        data_records = limited_df.to_dict(orient="records")
        
    except Exception as e:
        return {"sql": sql_query, "error": f"Failed to execute SQL: {str(e)}"}
        
    # 3. Analyze Results
    analysis = analyze_results(question, sql_query, data_json)
    
    return {
        "question": question,
        "sql": sql_query,
        "data": data_records,
        "analysis": analysis
    }
