from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.security import HTTPAuthorizationCredentials
from typing import Optional

from .schemas import ChunkRequest, ChunkResponse, HealthResponse
from .chunker import chunk_markdown
from .config import DEFAULT_MAX_CHUNK_SIZE
from .auth import verify_service_api_key, require_authenticated_user

app = FastAPI(title='Chunker Service', version='0.1.0')


ALLOWED_USER_ROLES = {'teacher', 'admin'}


def auth_dependency(authorization: Optional[str] = Header(None), x_api_key: Optional[str] = Header(None)):
    """Authenticate either via service API key or via user bearer token.

    RBAC policy: If caller uses service API key, allow. If caller authenticates with a user token,
    require that the token contains a role claim in `ALLOWED_USER_ROLES`.
    """
    # If service key present and valid, allow (service-to-service calls)
    if x_api_key:
        if verify_service_api_key(x_api_key):
            return {'service': True}
        else:
            raise HTTPException(status_code=401, detail='Invalid service API key')

    # Otherwise require user token
    if authorization:
        # Adapter: extract token from header value
        token = authorization.split('Bearer ')[-1]
        creds = HTTPAuthorizationCredentials(scheme='Bearer', credentials=token)
        payload = require_authenticated_user(creds)

        role = payload.get('role')
        if role not in ALLOWED_USER_ROLES:
            raise HTTPException(status_code=403, detail='Insufficient role for this operation')
        return payload

    raise HTTPException(status_code=401, detail='Missing authentication')


@app.get('/v1/health', response_model=HealthResponse, summary='Health check')
def health():
    return {'status': 'ok'}


@app.post('/v1/chunk', response_model=ChunkResponse, summary='Chunk Markdown')
def chunk_endpoint(request: ChunkRequest, auth=Depends(auth_dependency)):
    max_size = request.max_chunk_size if request.max_chunk_size is not None else DEFAULT_MAX_CHUNK_SIZE

    chunks = chunk_markdown(request.markdown, max_chunk_size=max_size)
    response_items = [{'content': c['content'], 'header_path': c['header_path']} for c in chunks]
    return {'chunks': response_items}


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    from fastapi.openapi.utils import get_openapi

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        routes=app.routes,
    )

    # Add security schemes for bearer JWT and API Key
    openapi_schema.setdefault('components', {}).setdefault('securitySchemes', {})
    openapi_schema['components']['securitySchemes']['bearerAuth'] = {
        'type': 'http',
        'scheme': 'bearer',
        'bearerFormat': 'JWT'
    }
    openapi_schema['components']['securitySchemes']['ApiKeyAuth'] = {
        'type': 'apiKey',
        'in': 'header',
        'name': 'X-API-Key'
    }

    # Declare that /v1/chunk can be secured by either scheme (note: OpenAPI does not support OR natively,
    # but clients will be able to see the available schemes). We attach both as possible security requirements.
    for path, methods in openapi_schema.get('paths', {}).items():
        if path == '/v1/chunk':
            for method_name, method_spec in methods.items():
                method_spec.setdefault('security', [])
                method_spec['security'].append({'bearerAuth': []})
                method_spec['security'].append({'ApiKeyAuth': []})

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
