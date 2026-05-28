# Quickstart: Local Development Setup

**Created**: 2026-05-28  
**Target**: macOS / Linux  
**Duration**: ~15 minutes

---

## Prerequisites

Ensure you have installed:
- **Git**: `git --version` (should be 2.30+)
- **Python**: `python3 --version` (should be 3.10+)
- **Node.js**: `node --version` (should be 18+)
- **UV** (Python package manager): `uv --version` (install from https://astral.sh/uv)

If any are missing, install via Homebrew (macOS):
```bash
brew install git python@3.10 node
pip install uv  # or: curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## Step 1: Clone Repository & Setup

```bash
# Clone (if not already)
git clone https://github.com/YourOrg/LuminaPath.git
cd LuminaPath

# Switch to feature branch (if not already on it)
git checkout 001-ai-learning-path-generator
```

---

## Step 2: Backend Setup

### 2a. Create Python Virtual Environment

```bash
cd backend

# Create virtual environment using uv
uv venv --python=3.10 .venv

# Activate
source .venv/bin/activate
# (On Windows: .venv\Scripts\activate)

# Verify
which python  # Should show .venv/bin/python
python --version  # Should show 3.10.x
```

### 2b. Install Backend Dependencies

```bash
# Install project dependencies (using UV as package manager)
uv pip install -r requirements.txt

# Or use uv sync (if using pyproject.toml + uv.lock)
uv sync
```

**Required Dependencies** (`backend/requirements.txt`):

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
pydantic-settings==2.1.0
aiohttp==3.9.1
python-dotenv==1.0.0
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
```

### 2c. Setup Environment Variables

```bash
# Create .env from template
cp .env.example .env

# Edit and add API keys
nano .env
```

**Required Environment Variables** (`backend/.env`):

```env
# LLM Configuration
GEMINI_API_KEY=...  # Get from Google Cloud / Gemini API credentials
GEMINI_MODEL=gemini-1

# API Keys
YOUTUBE_API_KEY=...  # Get from https://console.cloud.google.com (YouTube Data API v3)

# Database
DATABASE_PATH=../data/lumina.db
DATABASE_URL=sqlite:///./data/lumina.db

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_SECONDS=60
```

### 2d. Initialize Database

```bash
# Create data directory
mkdir -p ../data

# Run migrations (creates schema)
python src/db/database.py  # Or use Alembic if migration framework is set up

# Verify database created
ls -la ../data/lumina.db
```

### 2e. Start Backend Server

```bash
# Run development server
uvicorn src.main:app --reload --port 8000

# Expected output:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Application startup complete
```

**Verify Backend**:
```bash
# In another terminal
curl http://localhost:8000/docs  # OpenAPI docs should load
curl -X POST http://localhost:8000/api/generate-path \
  -H "Content-Type: application/json" \
  -d '{"topic": "Python Basics"}'
```

---

## Step 3: Frontend Setup

### 3a. Install Node Dependencies

```bash
cd ../frontend

# Install with npm or yarn
npm install
# or: yarn install
```

### 3b. Setup Environment Variables

```bash
cp .env.example .env
```

**Required Environment Variables** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:8000/api
VITE_TIMEOUT_MS=30000
```

### 3c. Start Development Server

```bash
# Start Vite dev server
npm run dev
# or: yarn dev

# Expected output:
# VITE v4.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

**Verify Frontend**: Open http://localhost:5173 in browser

---

## Step 4: Verify End-to-End

### 4a. Test Learning Path Generation

```bash
# Terminal 1: Backend running on http://localhost:8000
# Terminal 2: Frontend running on http://localhost:5173

# In frontend (browser console or API test)
const response = await fetch('http://localhost:8000/api/generate-path', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic: 'Machine Learning' })
});
const data = await response.json();
console.log(data);

# Expected: roadmap_id, steps[], resources[], etc.
```

### 4b. Test Quiz Generation & Gap Analysis

```bash
# After generating path, extract task_id from response
# Then generate quiz for a task
const quizResponse = await fetch('http://localhost:8000/api/generate-quiz', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    task_id: '<from-roadmap-steps>',
    session_id: '<from-generate-path-response>'
  })
});
const quiz = await quizResponse.json();
console.log(quiz);

# Submit assessment & analyze gaps
# (See API contracts for exact payloads)
```

---

## Step 5: Run Tests

### Backend Tests

```bash
cd backend

# Unit tests
pytest tests/unit/ -v

# Integration tests (may require real API calls)
pytest tests/integration/ -v --timeout=30

# Contract tests (API schema validation)
pytest tests/contract/ -v

# All tests with coverage
pytest --cov=src tests/ --cov-report=html
```

### Frontend Tests

```bash
cd ../frontend

# Component tests
npm run test

# E2E tests (requires backend running)
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## Step 6: Database Inspection

```bash
# Connect to SQLite database
sqlite3 ../data/lumina.db

# Useful commands
.tables  # List all tables
.schema user_sessions  # View schema for table
SELECT * FROM user_sessions LIMIT 5;  # Query data
.mode column  # Pretty-print results
.quit  # Exit
```

---

## Troubleshooting

### Problem: `ModuleNotFoundError: No module named 'fastapi'`
**Solution**: Ensure virtual environment is activated and dependencies installed:
```bash
source .venv/bin/activate
uv pip install -r requirements.txt
```

### Problem: `GEMINI_API_KEY not found`
**Solution**: Add your API key to `.env`:
```bash
echo "GEMINI_API_KEY=..." >> backend/.env
```

### Problem: `sqlite3.OperationalError: unable to open database file`
**Solution**: Create data directory:
```bash
mkdir -p data
python backend/src/db/database.py
```

### Problem: `CORS error` when frontend calls backend
**Solution**: Backend CORS middleware should be configured. Check `backend/src/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Problem: Frontend shows blank page
**Solution**: Check browser console for errors; ensure `VITE_API_URL` is correct:
```bash
# In frontend/.env
VITE_API_URL=http://localhost:8000/api
```

---

## Development Workflow

### Making Changes

1. **Backend**:
   ```bash
   # Edit file (e.g., src/services/curator_agent.py)
   nano backend/src/services/curator_agent.py
   
   # Uvicorn with --reload auto-restarts on changes
   # Check http://localhost:8000/docs for updated schema
   ```

2. **Frontend**:
   ```bash
   # Edit component (e.g., src/components/TopicInput.jsx)
   nano frontend/src/components/TopicInput.jsx
   
   # Vite HMR (hot module reload) updates instantly
   # Browser page refreshes automatically
   ```

### Testing Changes

```bash
# Backend: Run specific test
pytest backend/tests/contract/test_generate_path.py::test_valid_topic -v

# Frontend: Watch mode for tests
cd frontend && npm run test -- --watch
```

### Committing Changes

```bash
git add .
git commit -m "feat: implement Curator Agent for path generation"
git push origin 001-ai-learning-path-generator
```

---

## API Documentation

While server is running:
- **OpenAPI (Swagger UI)**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Next Steps

1. Review [API Contracts](./contracts/) for endpoint specifications
2. Review [Data Model](./data-model.md) for schema details
3. Check [Research Document](./research.md) for architecture decisions
4. Run `/speckit.tasks` to generate development task list
5. Start implementing tasks from Phase 2

---

**Happy coding! 🎉**
