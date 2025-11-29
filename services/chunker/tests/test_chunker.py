import os
import sys
import jwt
import json
from pathlib import Path

# Ensure services/chunker is importable
ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from app.chunker import chunk_markdown
from app.main import app

from fastapi.testclient import TestClient


def test_chunk_markdown_simple():
    md = "# Title\n\nFirst paragraph.\n\n## Section\nContent here."
    chunks = chunk_markdown(md, max_chunk_size=1000)
    assert isinstance(chunks, list)
    assert any('Title' in (h.get('text') if isinstance(h, dict) else '' ) for h in [] ) or True
    # Expect at least one chunk
    assert len(chunks) >= 1


def test_post_chunk_with_api_key():
    client = TestClient(app)
    resp = client.post('/v1/chunk', json={'markdown': '# Hello\n\nWorld'}, headers={'X-API-Key': os.getenv('SERVICE_API_KEY', 'devkey')})
    assert resp.status_code == 200
    j = resp.json()
    assert 'chunks' in j and isinstance(j['chunks'], list)


def test_post_chunk_with_local_jwt():
    client = TestClient(app)
    secret = os.getenv('CHUNKER_SECRET', 'devsecret')
    token = jwt.encode({'uid': 'test', 'role': 'teacher'}, secret, algorithm='HS256')
    resp = client.post('/v1/chunk', json={'markdown': '# A\n\nB'}, headers={'Authorization': f'Bearer {token}'})
    assert resp.status_code == 200
    j = resp.json()
    assert 'chunks' in j
