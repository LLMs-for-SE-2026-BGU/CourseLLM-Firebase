import os


def get_env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except Exception:
        return default


CHUNKER_SECRET = os.getenv('CHUNKER_SECRET', 'devsecret')
SERVICE_API_KEY = os.getenv('SERVICE_API_KEY', 'devkey')
DEFAULT_MAX_CHUNK_SIZE = get_env_int('MAX_CHUNK_SIZE', 1000)
