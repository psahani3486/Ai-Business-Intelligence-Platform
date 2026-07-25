import os
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.schema import MetaData

# Ensure script runs from backend root correctly
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')

def load_data_to_postgres():
    """Initializes a PostgreSQL database by loading raw CSV data into schemas."""
    db_url = os.environ.get("DATABASE_URL")
    if not db_url or not db_url.startswith("postgresql"):
        print("DATABASE_URL is not set to a PostgreSQL string. Skipping migration.")
        return

    print(f"Connecting to PostgreSQL: {db_url.split('@')[-1]}")
    engine = create_engine(db_url)
    
    # Mapping of target Postgres table names to their raw CSV sources
    tables_to_load = {
        "dim_customers": "olist_customers_dataset.csv",
        "dim_products": "olist_products_dataset.csv",
        "product_category_name_translation": "product_category_name_translation.csv",
        "fact_orders": "olist_orders_dataset.csv",
        "fact_order_items": "olist_order_items_dataset.csv"
    }

    with engine.begin() as connection:
        for table_name, csv_filename in tables_to_load.items():
            csv_path = os.path.join(DATA_DIR, csv_filename)
            if not os.path.exists(csv_path):
                print(f"Warning: {csv_path} not found. Skipping table {table_name}.")
                continue
                
            print(f"Loading {csv_filename} into table '{table_name}'...")
            
            # Read CSV efficiently
            df = pd.read_csv(csv_path)
            
            # We use 'replace' to initialize the schema based on the DataFrame structure.
            # In a true enterprise setup, we'd define explicit SQLAlchemy Base models 
            # and use 'append', but this mirrors the DuckDB 'CREATE TABLE AS SELECT' behavior perfectly.
            df.to_sql(table_name, connection, if_exists="replace", index=False)
            
            print(f"✓ Loaded {len(df)} rows into {table_name}")
            
    print("\nPostgreSQL initialization complete. Run the ETL pipeline to generate feature tables.")

if __name__ == "__main__":
    load_data_to_postgres()
