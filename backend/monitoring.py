import logging
import time
from functools import wraps
from prometheus_client import Histogram, Counter

logger = logging.getLogger(__name__)

# --- Metrics Definitions ---

# Database Latency
DB_LATENCY = Histogram(
    'db_query_latency_seconds',
    'Time spent executing database queries',
    ['query_type']
)

# Model Inference Time
MODEL_INFERENCE_TIME = Histogram(
    'model_inference_latency_seconds',
    'Time spent executing ML model predictions',
    ['model_name']
)

# Forecast Requests
FORECAST_REQUESTS = Counter(
    'forecast_requests_total',
    'Total number of forecast requests',
    ['model_name']
)

# Cache Hit Ratio
CACHE_HITS = Counter(
    'cache_hits_total',
    'Total number of cache hits'
)
CACHE_MISSES = Counter(
    'cache_misses_total',
    'Total number of cache misses'
)

# --- Utilities ---

def track_db_latency(query_type="select"):
    """Decorator to track database query latency."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            with DB_LATENCY.labels(query_type=query_type).time():
                return func(*args, **kwargs)
        return wrapper
    return decorator

def track_inference_time(model_name: str):
    """Decorator to track ML inference latency."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            FORECAST_REQUESTS.labels(model_name=model_name).inc()
            with MODEL_INFERENCE_TIME.labels(model_name=model_name).time():
                return func(*args, **kwargs)
        return wrapper
    return decorator

# A simple in-memory cache decorator to simulate cache hit tracking
_MEM_CACHE = {}

def monitored_cache(expire_seconds=60):
    """A simple caching decorator that tracks hit/miss metrics."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create a simple cache key based on args/kwargs
            key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            if key in _MEM_CACHE:
                entry = _MEM_CACHE[key]
                if time.time() - entry['time'] < expire_seconds:
                    CACHE_HITS.inc()
                    return entry['data']
                    
            CACHE_MISSES.inc()
            result = func(*args, **kwargs)
            _MEM_CACHE[key] = {'data': result, 'time': time.time()}
            return result
        return wrapper
    return decorator
