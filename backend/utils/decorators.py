"""Utility decorators."""
import time
import functools
import logging
from typing import Callable

logger = logging.getLogger(__name__)


def log_execution_time(func: Callable) -> Callable:
    """Log the execution time of a function."""
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = await func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        logger.debug(f"{func.__name__} executed in {elapsed:.4f}s")
        return result
    return wrapper
