# Implementation Plan: AI-Driven Personalized Learning Path Generator

**Branch**: `001-ai-learning-path-generator` | **Date**: 2026-05-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-ai-learning-path-generator/spec.md`

**Note**: This plan outlines the technical architecture, database design, API contracts, and implementation roadmap.

## Summary

Build an AI-driven learning path generator where users submit a topic and receive a structured, step-by-step learning roadmap curated from free-tier APIs (YouTube, Wikipedia). Backend uses Python/FastAPI with SQLAlchemy ORM to manage learning paths, assessments, and AI agent orchestration. Three multi-agent pipelines (Curator, Examiner, Evaluator) operate backend-only. Frontend (React + Tailwind) displays paths and assessments via REST API calls. MVP uses anonymous/stateless sessions with SQLite persistence.

## Technical Context

**Language/Version**: Python 3.10+ (FastAPI backend); Node.js 18+ / React 18+ (frontend)

**Primary Dependencies**: 
- Backend: FastAPI, SQLAlchemy ORM, Pydantic, aiohttp (async HTTP client)
- Frontend: React, Tailwind CSS, Vite, axios, React Query
- Package Manager: UV (Python backend), npm/yarn (frontend)

**Storage**: SQLite (file-based, local to project root at `./data/lumina.db`)

**Testing**: 
- Backend: pytest, pytest-asyncio, httpx (async test client)
- Frontend: React Testing Library, Vitest, Playwright (E2E)

**Target Platform**: Web service (REST API + SPA); deployable on serverless (Vercel, Heroku free tier) or local server

**Project Type**: Web service with multi-agent AI orchestration backend and React SPA frontend

**Performance Goals**: 
- Path generation: <30 seconds (p95)
- Assessment generation: <10 seconds (p95)
- Gap analysis: <10 seconds (p95)
- API response time: <500ms (p95, excluding LLM calls)

**Constraints**:
- Zero-cost infrastructure (free-tier APIs only; no paid services)
- YouTube Data API: ~10k queries/day quota
- Wikipedia API: unlimited public queries
- Frontend-backend separation (no server-side rendering, no shared state)

**Scale/Scope**:
- MVP: Single-user per session (anonymous/stateless)
- Initial scope: 1 learning path generation, 1 assessment set per user session
- Concurrent users: 10+ (via stateless design; horizontally scalable)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gates (Phase 0 Entry)

✅ **I. Zero-Cost Infrastructure Architecture**: 
- SQLite file-based persistence ✓
- Free-tier APIs only (YouTube Data API free quota, Wikipedia API unlimited) ✓
- No paid cloud services ✓
- Status: **PASS**

✅ **II. Frontend-Backend Separation**: 
- FastAPI REST API with clear boundaries ✓
- React SPA frontend (presentation only) ✓
- No server-side rendering, no shared state ✓
- Status: **PASS**

✅ **III. Technology Stack Compliance**: 
- Backend: Python 3.10+ + FastAPI ✓
- Frontend: React 18+ + Tailwind CSS ✓
- Package Manager: UV (backend), npm/yarn (frontend) ✓
- Database: SQLite only ✓
- Status: **PASS**

✅ **IV. Database Purity**: 
- SQLite file-based at `./data/lumina.db` ✓
- Schema-managed via SQLAlchemy ORM + migrations ✓
- No external databases ✓
- Status: **PASS**

✅ **V. Multi-Agent AI Pipeline Architecture**: 
- All agent orchestration backend-only (Curator, Examiner, Evaluator) ✓
- Frontend calls `/api/*` endpoints only ✓
- No LLM client libraries in frontend ✓
- Status: **PASS**

**Overall Pre-Phase-0 Gate**: ✅ **ALL GATES PASSED** — proceeding to Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-learning-path-generator/
├── plan.md              # This file (planning output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (research findings)
├── data-model.md        # Phase 1 output (schema design)
├── quickstart.md        # Phase 1 output (dev setup)
├── contracts/           # Phase 1 output (API contracts)
│   ├── generate-path.md
│   ├── generate-quiz.md
│   └── analyze-gaps.md
├── checklists/          # Quality checklists
│   └── requirements.md
└── tasks.md             # Phase 2 output (task list)
```

### Source Code (repository root)

```text
backend/
├── pyproject.toml       # UV/pip dependencies
├── uv.lock              # Dependency lock file
├── src/
│   ├── models/          # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user_sessions.py
│   │   ├── roadmaps.py
│   │   ├── tasks.py
│   │   ├── assessments.py
│   │   └── base.py
│   ├── services/        # Business logic & agent orchestration
│   │   ├── __init__.py
│   │   ├── curator_agent.py
│   │   ├── examiner_agent.py
│   │   ├── evaluator_agent.py
│   │   └── path_generator.py
│   ├── api/             # FastAPI endpoints
│   │   ├── __init__.py
│   │   ├── routes.py
│   │   ├── dependencies.py
│   │   └── schemas.py
│   ├── db/              # Database setup & migrations
│   │   ├── __init__.py
│   │   ├── database.py
│   │   └── migrations/
│   ├── config.py        # Configuration (env vars)
│   ├── logging.py       # Structured logging
│   └── main.py          # FastAPI app initialization
├── tests/
│   ├── conftest.py
│   ├── contract/        # API contract tests
│   │   ├── test_generate_path.py
│   │   ├── test_generate_quiz.py
│   │   └── test_analyze_gaps.py
│   ├── integration/      # E2E workflow tests
│   │   └── test_learning_workflow.py
│   └── unit/            # Service/model tests
│       ├── test_curator_agent.py
│       ├── test_examiner_agent.py
│       └── test_evaluator_agent.py
├── README.md
├── Dockerfile           # For deployment
└── .env.example         # API key template

frontend/
├── package.json
├── vite.config.js
├── tsconfig.json
├── src/
│   ├── components/      # Reusable React components
│   │   ├── TopicInput.jsx
│   │   ├── PathDisplay.jsx
│   │   ├── AssessmentForm.jsx
│   │   └── GapAnalysisReport.jsx
│   ├── pages/           # Page-level components
│   │   ├── Home.jsx
│   │   ├── LearningPath.jsx
│   │   └── Assessment.jsx
│   ├── services/        # API client utilities
│   │   ├── api.js
│   │   └── hooks.js
│   ├── styles/          # Global Tailwind config
│   │   └── globals.css
│   ├── App.jsx
│   └── main.jsx
├── tests/
│   ├── components/      # Component tests
│   ├── integration/      # E2E tests (Playwright)
│   └── setup.js
├── README.md
└── .env.example         # API endpoint template

data/
└── .gitignore           # Exclude lumina.db from git

.gitignore              # Project-wide ignore rules
.github/
├── workflows/           # CI/CD pipelines
│   └── tests.yml
└── copilot-instructions.md
```
---

## Post-Design Constitution Re-Check

*GATE: Phase 1 design complete. Verifying full alignment with LuminaPath Constitution v1.0.0*

### Post-Design Gates (Phase 1 Exit)

✅ **I. Zero-Cost Infrastructure Architecture**: 
- SQLite file-based at `./data/lumina.db` ✓
- Free-tier APIs: YouTube Data API (~10k/day), Wikipedia API (unlimited) ✓
- No managed databases, no paid services, no external infrastructure ✓
- Google Gemini API used as LLM provider (monitor usage and quotas) ✓
- **Status**: **PASS** — Zero-cost constraint maintained

✅ **II. Frontend-Backend Separation**: 
- FastAPI REST API (3 core endpoints: /generate-path, /generate-quiz, /analyze-gaps) ✓
- React SPA frontend (presentation logic only) ✓
- All AI agent orchestration backend-only ✓
- Frontend has zero knowledge of LLM/agent internals ✓
- Cross-tier communication: REST API + JSON only ✓
- **Status**: **PASS** — Complete architectural separation enforced

✅ **III. Technology Stack Compliance**: 
- Backend: Python 3.10+ + FastAPI ✓
- Backend Package Manager: UV ✓
- Frontend: React 18+ + Tailwind CSS + Vite ✓
- Frontend Package Manager: npm/yarn ✓
- Database: SQLite only (no exceptions) ✓
- No alternative frameworks, runtimes, or databases in design ✓
- **Status**: **PASS** — Strict stack compliance verified

✅ **IV. Database Purity**: 
- SQLite file-based local to `./data/lumina.db` ✓
- 7-table normalized schema with migration support ✓
- Schema versioning via migration scripts (tracked in Git) ✓
- No external caching layers, no distributed state stores ✓
- Query optimization via indexing (schema design) ✓
- **Status**: **PASS** — Database purity enforced

✅ **V. Multi-Agent AI Pipeline Architecture**: 
- Curator Agent (backend): Content curation from YouTube + Wikipedia ✓
- Examiner Agent (backend): MCQ generation ✓
- Evaluator Agent (backend): Gap analysis reporting ✓
- All agent state, memory, orchestration: backend-only ✓
- Frontend calls `/api/generate-path`, `/api/generate-quiz`, `/api/analyze-gaps` only ✓
- No LLM client libraries in frontend codebase ✓
- Response streaming: Server-sent events (optional enhancement) ✓
- **Status**: **PASS** — Multi-agent pipeline architecture enforced

**Overall Post-Phase-1 Gate**: ✅ **ALL GATES PASSED** — Constitution fully satisfied

---

## Phase 1 Deliverables Summary

| Artifact | Location | Status | Details |
|----------|----------|--------|---------|
| Research Document | [research.md](research.md) | ✅ Complete | API strategy, LLM selection, session design, testing approach |
| Data Model | [data-model.md](data-model.md) | ✅ Complete | 7 tables, ERD, validation rules, migration strategy |
| API Contracts | [contracts/](contracts/) | ✅ Complete | 3 endpoints with request/response schemas, error handling |
| Quickstart Guide | [quickstart.md](quickstart.md) | ✅ Complete | Backend setup (uv), frontend setup, E2E verification, troubleshooting |
| Project Structure | [plan.md](plan.md#project-structure) | ✅ Complete | Concrete folder layout for backend/frontend/data |
| Agent Context Update | [.github/copilot-instructions.md](../../.github/copilot-instructions.md) | ✅ Complete | Updated with plan reference, tech stack, deliverables |

---

## Phase 2: Task Generation (Next Steps)

**Prerequisites Met**:
- ✅ Specification complete & clarifications resolved
- ✅ Research complete (all unknowns resolved)
- ✅ Data model designed & validated
- ✅ API contracts specified with full request/response schemas
- ✅ Development environment setup documented
- ✅ Constitution gates passed (Phase 1 exit)

**Next Command**: Run `/speckit.tasks` to generate dependency-ordered, story-based development tasks

**Task Grouping**: 
- Phase 1: Shared infrastructure (database, project structure, CI/CD)
- Phase 2-4: User Story 1 (P1): Path generation (tests → models → services → API)
- Phase 5-6: User Story 2 (P2): Assessment generation
- Phase 7-8: User Story 3 (P3): Gap analysis

**Estimated Implementation Timeline**:
- Week 1: Database setup, project scaffolding, Curator Agent
- Week 2: Examiner & Evaluator Agents, API implementation
- Week 3: Frontend components, E2E integration testing
- Week 4: Performance optimization, deployment

---

## Implementation Roadmap

### Milestones

1. **M1 (Week 1)**: Backend foundation + Curator Agent
   - Database schema + migrations
   - SQLAlchemy ORM models
   - Curator Agent service (content curation)
   - `/api/generate-path` endpoint

2. **M2 (Week 2)**: Assessment pipeline
   - Examiner Agent service (MCQ generation)
   - Evaluator Agent service (gap analysis)
   - `/api/generate-quiz` endpoint
   - `/api/analyze-gaps` endpoint
   - Backend unit + contract tests

3. **M3 (Week 3)**: Frontend + integration
   - React component library (TopicInput, PathDisplay, AssessmentForm, GapAnalysisReport)
   - API client utilities
   - E2E workflow tests
   - Frontend unit tests

4. **M4 (Week 4)**: Polish + deployment
   - Performance optimization (caching, query tuning)
   - Observability (logging, monitoring)
   - Documentation (API docs, user guide)
   - Deployment to free-tier hosting (Vercel, Heroku, Railway)

---

## Success Criteria (from Spec)

**Path Generation**:
- ✅ Generate learning path within 30 seconds (p95)
- ✅ Path includes ≥5 sequential steps with resources
- ✅ 80% of generated paths rated useful by users

**Assessment**:
- ✅ Generate 3-5 MCQs within 10 seconds (p95)
- ✅ Score displayed immediately upon submission
- ✅ Support unlimited retakes with score history

**Gap Analysis**:
- ✅ Generate report within 10 seconds (p95) for score <100%
- ✅ Include weak concepts + recommendations
- ✅ Display supplementary resources

**System**:
- ✅ Support ≥10 concurrent path generations
- ✅ Deploy on zero-cost infrastructure
- ✅ Uptime ≥99% in production

---

**Status**: Phase 1 Planning Complete ✅  
**Next Phase**: Phase 2 Task Generation → `/speckit.tasks`

---

**Version**: 1.0.0-draft | **Created**: 2026-05-28 | **Updated**: 2026-05-28
