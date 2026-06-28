# Wonder Toys — OpenAI Agents SDK Python (No Observability)

The OpenAI Agents SDK variant of the Wonder Toys shopping agent, with no
observability instrumentation. A Python/FastAPI backend runs the agent; a
Next.js frontend handles UI and auth and proxies chat to the backend.

## Architecture

- **Python FastAPI backend** (port 8001) — agent, tools, and API
- **Next.js frontend** (port 3000) — UI, auth, proxies chat to the Python backend
- **Agent**: `Agent` / `Runner` from the `agents` package (OpenAI Agents SDK)
- **LLM**: `gpt-5.4-mini` via the OpenAI Responses API (key read from `OPENAI_API_KEY`)
- **Tools**: Python functions decorated with `@function_tool` (see `backend/tools.py`)
- **Streaming**: SSE; the SDK yields `ResponseTextDeltaEvent` chunks
- **Sessions**: Per-user `SQLiteSession` for multi-turn conversation memory
- **Tool context**: `user_id` is injected at runtime via a `contextvar` (`backend/context.py`), never passed through the LLM
- **Vector search**: ChromaDB (port 8000, default embeddings)

## Prerequisites

- **[uv](https://docs.astral.sh/uv/)** — `start.sh` uses it to create the Python venv and install backend deps
- **Node.js + npm** — for the Next.js frontend
- An **OpenAI API key** with access to the model

## Setup

### 1. Create the secrets file

`start.sh` loads environment variables from **`.env.local`** — note the name. A
plain `.env` is **not** read and the backend will start without your keys.

```bash
cp env.example .env.local
```

Then edit `.env.local`:

| Variable | Required? | Notes |
|----------|-----------|-------|
| `OPENAI_API_KEY` | **Yes** | The agent calls `gpt-5.4-mini` via the OpenAI Responses API |
| `NEXTAUTH_SECRET` | **Yes** | Signs the session JWT. If missing, the app throws `JWT_SESSION_ERROR: decryption operation failed`. Generate one: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` for local dev |
| `BACKEND_SECRET` | Recommended | Shared secret between Next.js and the Python backend. Generate: `openssl rand -hex 32`. If left empty the backend runs in open "dev mode" (no auth between the two). |
| `BACKEND_URL` | Yes | `http://localhost:8001` |
| `CHROMA_URL` | Yes | `http://localhost:8000` |
| `ARIZE_*` | No | Present in `env.example` but **unused in this no-observability variant** — leave blank |

### 2. Run

```bash
npm run dev
```

`npm run dev` runs `scripts/start.sh`, which automatically:

1. Starts **ChromaDB** (creating a venv + `uv pip install chromadb` if needed)
2. Creates the backend venv and runs `uv pip install --pre -r backend/requirements.txt` — **you do not need to run `uv` yourself**
3. Indexes the product catalog into ChromaDB (first run only)
4. Runs `npm install` if `node_modules` is missing — **you do not need to run `npm install` yourself**
5. Starts the **Python backend** on `:8001`
6. Starts the **Next.js** dev server on `:3000`

Open <http://localhost:3000>.

## Troubleshooting

| Symptom | Cause / Fix |
|---------|-------------|
| `[next-auth][error][JWT_SESSION_ERROR] decryption operation failed` | `NEXTAUTH_SECRET` is missing or changed. Set it in `.env.local`, then clear the `localhost:3000` cookie (or use a fresh/incognito window) and restart. |
| Backend ignores your keys / starts unconfigured | Your env file is named `.env`, not `.env.local`. `start.sh` only sources `.env.local`. |
| Turbopack: "couldn't find the Next.js package (`next/package.json`)" | `node_modules` is missing — run `npm install`. |
| Product images 404 / broken | `public/product-images` is a symlink to the repo-root `product-images/`. Confirm it resolves: `ls public/product-images/toy-001.png`. |

## Adding Arize observability

This variant ships with **no** tracing. To add it, just tell your coding agent
to **instrument this app with Arize AX** — it will add the OpenInference
instrumentation for the OpenAI Agents SDK and wire up the tracer.

## Key Files

| File | Purpose |
|------|---------|
| `backend/agent.py` | Agent definition, per-user `SQLiteSession`, and SSE streaming |
| `backend/tools.py` | Tool definitions using `@function_tool` |
| `backend/main.py` | FastAPI app with `/chat` endpoint |
| `backend/context.py` | `contextvar` that carries `user_id` into tool calls |
| `backend/chroma_client.py` | ChromaDB vector search client |
| `src/app/api/chat/route.ts` | Next.js proxy to the Python backend |
| `src/components/Chat.tsx` | Chat UI with product card rendering |
| `scripts/start.sh` | Dev startup (ChromaDB + Python deps + backend + Next.js) |
