import asyncio
import json
import random
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from datetime import datetime

router = APIRouter()

async def order_generator(request: Request):
    """Generates continuous synthetic order events for the SSE stream."""
    categories = ['Bed Bath Table', 'Health Beauty', 'Sports Leisure', 'Computers Accessories', 'Furniture']
    cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre']
    
    while True:
        if await request.is_disconnected():
            break
            
        # Simulate wait time between orders (0.5 to 3 seconds)
        await asyncio.sleep(random.uniform(0.5, 3.0))
        
        # Generate a synthetic live order
        order_event = {
            "order_id": f"LIVE-{random.randint(10000, 99999)}",
            "timestamp": datetime.now().isoformat(),
            "amount": round(random.uniform(15.0, 450.0), 2),
            "category": random.choice(categories),
            "city": random.choice(cities),
            "status": "processing"
        }
        
        # Yield Server-Sent Event formatted string
        yield f"data: {json.dumps(order_event)}\n\n"

@router.get("/live-orders")
async def stream_live_orders(request: Request):
    """Server-Sent Events endpoint pushing live orders to the frontend."""
    return StreamingResponse(order_generator(request), media_type="text/event-stream")
