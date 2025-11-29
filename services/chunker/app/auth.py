from fastapi import Header, HTTPException, Security, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, APIKeyHeader
from typing import Optional

from .config import CHUNKER_SECRET, SERVICE_API_KEY

# Use firebase-admin to verify Firebase ID tokens issued by the project's Auth service.
try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth
    _FIREBASE_AVAILABLE = True
    # Try to initialize the admin SDK with default credentials if not already initialized.
    try:
        firebase_admin.get_app()
    except Exception:
        try:
            firebase_admin.initialize_app()
        except Exception:
            # Initialization may fail if no ADC or credentials provided; keep available flag but
            # verification will raise an informative error at runtime.
            pass
except Exception:
    firebase_admin = None
    firebase_auth = None
    _FIREBASE_AVAILABLE = False

bearer_scheme = HTTPBearer()
api_key_scheme = APIKeyHeader(name='X-API-Key', auto_error=False)


def verify_service_api_key(x_api_key: Optional[str] = Security(api_key_scheme)) -> bool:
    if x_api_key and x_api_key == SERVICE_API_KEY:
        return True
    return False


def _verify_firebase_token(id_token: str) -> dict:
    if not _FIREBASE_AVAILABLE:
        raise HTTPException(status_code=500, detail='Server not configured to verify Firebase tokens')
    try:
        # This will raise if invalid
        decoded = firebase_auth.verify_id_token(id_token)
        return decoded
    except Exception as e:
        raise HTTPException(status_code=401, detail=f'Invalid Firebase token: {e}')


def _verify_local_jwt(token: str) -> dict:
    # Lightweight fallback for development/testing using local HS256 secret
    import jwt
    try:
        payload = jwt.decode(token, CHUNKER_SECRET, algorithms=['HS256'])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail='Invalid authentication token')


def verify_bearer_token(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    token = credentials.credentials
    # Try Firebase verification first (preferred in production)
    if _FIREBASE_AVAILABLE:
        return _verify_firebase_token(token)
    # Otherwise fall back to local HS256 verification
    return _verify_local_jwt(token)


def require_authenticated_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    payload = verify_bearer_token(credentials)
    # The Firebase ID token may not include a 'role' claim by default. We expect the
    # authentication service to include a custom claim 'role' or the caller to include
    # role information in a separate user profile lookup.
    role = payload.get('role')
    if not role:
        # For clarity, return payload but raise a 403 if role is required by the endpoint.
        raise HTTPException(status_code=403, detail='User role not present in token')
    return payload
