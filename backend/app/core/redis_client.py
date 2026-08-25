import redis
import hashlib
import json
from app.core.config import settings

class RedisClient:
    def __init__(self):
        try:
            self.client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            self.enabled = True
        except Exception as e:
            print(f"⚠️ Redis connection failed: {e}")
            self.enabled = False
            self.client = None

    def get_cache_key(self, query: str) -> str:
        """Generate a deterministic cache key from the query."""
        # Use SHA256 to avoid long keys
        return f"rag:{hashlib.sha256(query.encode()).hexdigest()}"

    def get(self, query: str):
        if not self.enabled:
            return None
        try:
            key = self.get_cache_key(query)
            data = self.client.get(key)
            if data:
                return json.loads(data)
        except Exception as e:
            print(f"Redis get error: {e}")
        return None

    def set(self, query: str, response: dict):
        if not self.enabled:
            return
        try:
            key = self.get_cache_key(query)
            self.client.setex(key, settings.CACHE_TTL, json.dumps(response))
        except Exception as e:
            print(f"Redis set error: {e}")

    def clear(self, pattern: str = "rag:*"):
        """Clear all cache entries matching a pattern (for invalidation)."""
        if not self.enabled:
            return
        try:
            keys = self.client.keys(pattern)
            if keys:
                self.client.delete(*keys)
                print(f"Cleared {len(keys)} cache entries")
        except Exception as e:
            print(f"Redis clear error: {e}")

# Global instance
redis_client = RedisClient()