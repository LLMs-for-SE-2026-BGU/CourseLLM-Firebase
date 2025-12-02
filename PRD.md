# CourseWise – How to Run (Local)

## 1. Purpose

How to run the app locally: Firebase emulators + Python backend + Next.js frontend.

---

## 2. Environment config (`.env.local`)

1. From the **project root folder** (main folder of the repo), copy the example file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in the Firebase web config using the values from  
   **Firebase Console → Project settings → General → SDK setup & configuration**:

   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

3. Make sure the Firebase project id is the same in all of these places:

   - `.firebaserc` → `projects.default`
   - `.env.local` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `.env.local` → `FIREBASE_PROJECT_ID`

4. Leave the emulator host variables as in `.env.local.example`:

   - `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`
   - `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`
   - `FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199`

---

## 3. Prerequisites

- Node.js (LTS) + npm / pnpm
- Python 3.x
- Firebase CLI:
  ```bash
  npm install -g firebase-tools
  firebase login
  ```
- From the **project root folder**:
  ```bash
  python -m venv .venv

  # Windows
  .venv\Scripts\activate
  # macOS / Linux
   source .venv/bin/activate

  pip install -r requirements.txt
  npm install
  ```

---

## 4. Run (3 terminals)

> **Note:** All commands in this section should be run from the **main folder of the project**  
> (the folder that contains `package.json`, `firebase.json`, and `README.md`).

### 4.1 Terminal 1 – Firebase Emulators

In **Terminal 1**:

```bash
firebase emulators:start
```

- Firestore emulator: `127.0.0.1:8080`
- Storage emulator: `127.0.0.1:9199`
- Auth emulator: `127.0.0.1:9099`
- Emulator UI: `http://127.0.0.1:4000`

Leave this running.

---

### 4.2 Terminal 2 – Python Backend (DSPy API)

In **Terminal 2**, with the virtualenv activated:

```bash
# Windows:
   .venv\Scripts\activate
# macOS / Linux:
   source .venv/bin/activate

uvicorn src.ai.dspy.api:app --reload --port 8001
```

Backend runs at: `http://127.0.0.1:8001`

---

### 4.3 Terminal 3 – Next.js Frontend

In **Terminal 3**:

```bash
npm run dev
```

The dev script is configured to run on port **9002**, so the frontend is at:

- `http://localhost:9002`

---

## 5. Ports Summary

- Emulator UI: `http://127.0.0.1:4000`
- Firestore emulator: `127.0.0.1:8080`
- Storage emulator: `127.0.0.1:9199`
- Auth emulator: `127.0.0.1:9099`
- Backend (DSPy API): `http://127.0.0.1:8001`
- Frontend (Next.js dev): `http://localhost:9002`

---

## 6. Dependencies (high level)

### JavaScript / Next.js

Main dependencies are defined in `package.json`:

- **Core:** `next`, `react`, `react-dom`
- **UI & forms:** `@radix-ui/*`, `lucide-react`, `react-hook-form`, `zod`, `tailwind-merge`, `tailwindcss-animate`
- **Firebase & Genkit:** `firebase`, `firebase-admin`, `genkit`, `@genkit-ai/next`, `@genkit-ai/google-genai`
- **Other helpers:** see full list in `package.json`

### Python backend

Python dependencies are defined in `requirements.txt`:

- `dspy-ai`
- `google-generativeai`
- `fastapi`
- `uvicorn[standard]`
- `pydantic`
- `python-dotenv`

### External services / tools

- **Firebase** (Auth, Firestore, Storage, Emulators, Firebase CLI)
- **Google / Gemini** API (for LLM calls, via Genkit and `google-generativeai`)
- **Node.js + npm** (for the frontend, Next.js)
- **Python 3.x** (for the DSPy backend)

---

## 7. DSPy Backend API (overview)

The Python backend exposes a small HTTP API (FastAPI) on `http://127.0.0.1:8001`.  
The Next.js app calls these endpoints via server actions in  
`src/app/student/courses/[courseId]/dspy-actions.ts`.

All endpoints are **POST** and use JSON.

### 7.1 `POST /answer`

- **Purpose:** Answer a student’s question about a course.
- **Request body (simplified):**
  - `courseId`: string
  - `question`: string
  - optional metadata (e.g., context, user id)
- **Response (simplified):**
  - `answer`: string
  - optional: `reasoning`, `sources`

### 7.2 `POST /assess`

- **Purpose:** Assess a student’s free-text answer.
- **Request body (simplified):**
  - `courseId`: string
  - `question`: string
  - `studentAnswer`: string
- **Response (simplified):**
  - `score`: number (e.g., 0–100 or 0–1)
  - `feedback`: string

### 7.3 `POST /summarize`

- **Purpose:** Summarize course content or a given text.
- **Request body (simplified):**
  - `courseId`: string
  - `content`: string
- **Response (simplified):**
  - `summary`: string

### 7.4 `POST /quiz`

- **Purpose:** Generate quiz questions for a course.
- **Request body (simplified):**
  - `courseId`: string
  - optional: `numQuestions`: number
- **Response (simplified):**
  - `questions`: array of question objects (e.g., `text`, `options`, `correctOptionIndex`)

For exact schemas, see the Pydantic models in `src/ai/dspy/api.py`.  
For usage examples, see the server actions in  
`src/app/student/courses/[courseId]/dspy-actions.ts`.
