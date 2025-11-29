# Chunker Microservice

This microservice provides a REST API for deterministic, structure-aware Markdown chunking.

Features:
- FastAPI application with OpenAPI/Swagger UI available at `/docs` and `/redoc`.
- Authentication: JWT-based user roles (student/teacher/admin) and an optional `X-API-Key` for service-to-service calls.
- Configurable `MAX_CHUNK_SIZE` via environment variable or per-request override.

Quick start (development):

```bash
# from repository root
cd services/chunker
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
UVICORN_HOST=0.0.0.0 UVICORN_PORT=8000 CHUNKER_SECRET=devsecret SERVICE_API_KEY=devkey uvicorn app.main:app --reload
```

API endpoints:
- `POST /v1/chunk` - Chunk a markdown document. Requires authentication.
- `GET /v1/health` - Health check.

Configuration (env vars):
- `CHUNKER_SECRET` - HS256 secret used to validate local/dev JWTs for testing only.
- `SERVICE_API_KEY` - Optional API key for service-to-service authentication.
- `MAX_CHUNK_SIZE` - Optional integer to set default max chunk characters (default 1000).
- `GOOGLE_APPLICATION_CREDENTIALS` - (Optional) Path to a Google Cloud service account JSON key. If set, the service will use `firebase-admin` to verify Firebase ID tokens issued by the project's Authentication service.

Authentication notes:
- This repository uses Firebase for user authentication (see `src/lib/authService.ts`). The Chunker microservice does NOT call that client-side helper directly (it's a browser/client library). Instead, the microservice verifies Firebase ID tokens server-side using the `firebase-admin` SDK. To enable full Firebase verification in production, provide valid credentials via `GOOGLE_APPLICATION_CREDENTIALS` or use platform-provided application default credentials.
- In development, if `firebase-admin` is not configured, the service will fall back to local HS256 token verification using `CHUNKER_SECRET` (useful for tests), or accept a valid `X-API-Key` for service-to-service calls.

Service-to-service security (recommendation):
- The current prototype accepts a static `X-API-Key` for service-to-service calls. For production deployments we strongly recommend replacing this with platform-managed identities (Workload Identity on GCP, IAM service accounts, or mutual TLS) rather than static API keys. See `SETUP.md` for notes on Workload Identity.

Use the interactive docs at `http://localhost:8000/docs` to explore request/response shapes and try secured endpoints (you can pass `Authorization: Bearer <token>` or `X-API-Key: <key>`).

Running & testing (recommended order)
1) Start the chunker service first (so any callers can reach it).

Option A — Local Python virtualenv (recommended for development):

```bash
# from repo root
cd services/chunker
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# start the chunker (dev keys shown for local testing)
SERVICE_API_KEY=devkey CHUNKER_SECRET=devsecret uvicorn app.main:app --reload --port 8000
```

Option B — Docker (build+run) with `docker-compose` (useful to isolate runtime):

```bash
# from repo root
cd services/chunker
docker compose up --build
```

2) Start the Next.js app (frontend) after the chunker is running.

```bash
# from repo root
export CHUNKER_URL=http://localhost:8000/v1/chunk
export CHUNKER_SERVICE_API_KEY=devkey
npm run dev
```

Notes about order and why we recommend starting chunker first
- The Next app can be built without the chunker running (build step does not call the service).
- However, runtime flows that depend on chunking (the proxy `/api/chunk-proxy` or indexing flows) will fail if chunker is not reachable. Starting chunker first avoids encountering runtime errors during development.

Testing the service
- The repo includes pytest tests for the chunker service located at `services/chunker/tests/`.
	- They exercise the chunker code and the FastAPI endpoints using TestClient.

Run tests:
```bash
cd services/chunker
source .venv/bin/activate       # if you created the venv earlier
pip install pytest
pytest -q
```

Using the Next.js proxy
- For browser-based workflows, call the Next endpoint `POST /api/chunk-proxy` (the server-side Next route will forward to the chunker using a server-side service key). This keeps the chunker internal-only and hides credentials from the browser.

Example cURL (direct to chunker):
```bash
curl -X POST http://localhost:8000/v1/chunk \
	-H "Content-Type: application/json" \
	-H "X-API-Key: devkey" \
	-d '{"markdown":"# Hello\n\nWorld","max_chunk_size":400}'
```

Example cURL (via Next proxy):
```bash
curl -X POST http://localhost:9002/api/chunk-proxy \
	-H "Content-Type: application/json" \
	-d '{"markdown":"# Hello\n\nWorld","max_chunk_size":400}'
```

Production note
- Replace `X-API-Key` with Workload Identity / IAM for service-to-service authentication in production. See `SETUP.md` for guidance.
