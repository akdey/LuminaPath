# Development Tasks: AI-Driven Personalized Learning Path Generator

**Branch**: `001-ai-learning-path-generator` | **Date**: 2026-05-28
**Dependencies**: [plan.md](plan.md), [spec.md](spec.md), [data-model.md](data-model.md)

This document breaks down the implementation plan into chronological development increments, mapped cleanly to the `/backend` and `/frontend` directories.

---

## Phase 1: Shared Infrastructure & Backend Foundation (M1)

**Location**: `/backend`

- `[ ]` **Task 1.1**: Initialize database schema and migrations.
  - Set up SQLite connection (`./data/lumina.db`).
  - Configure SQLAlchemy ORM models (`user_sessions`, `roadmaps`, `tasks`, `assessments`, `base`).
  - Create initial alembic migrations for the 7-table normalized schema.
- `[ ]` **Task 1.2**: Project scaffolding and API routing setup.
  - Set up FastAPI app in `main.py` and `config.py`.
  - Create routing structure in `/api/routes.py` and input/output schemas in `/api/schemas.py`.
- `[ ]` **Task 1.3**: Implement the Curator Agent service.
  - Build `curator_agent.py` to handle content curation logic (YouTube, Wikipedia).
  - Integrate with Gemini LLM for AI orchestration.
- `[ ]` **Task 1.4**: Implement Path Generation endpoint.
  - Connect Curator Agent to `/api/generate-path` endpoint.
  - Ensure path generation meets performance goal (<30 seconds p95).
  - Write backend unit and contract tests for the endpoint in `/tests`.

---

## Phase 2: Assessment Pipeline (M2)

**Location**: `/backend`

- `[ ]` **Task 2.1**: Implement Examiner Agent service.
  - Build `examiner_agent.py` for Multiple Choice Question (MCQ) generation.
- `[ ]` **Task 2.2**: Implement Evaluator Agent service.
  - Build `evaluator_agent.py` for gap analysis and report generation.
- `[ ]` **Task 2.3**: Implement Assessment and Gap Analysis endpoints.
  - Connect Examiner Agent to `/api/generate-quiz` endpoint.
  - Connect Evaluator Agent to `/api/analyze-gaps` endpoint.
- `[ ]` **Task 2.4**: Backend test coverage.
  - Write unit tests for Examiner and Evaluator agents.
  - Write contract tests for `/api/generate-quiz` and `/api/analyze-gaps`.
  - Ensure performance constraints are met (<10 seconds p95).

---

## Phase 3: Dedicated Frontend Integration (Google Stitch) (M3)

**Location**: `/frontend`

*This phase imports the high-fidelity UI layout schemas, tokens, and front-end code structures generated directly from the Google Stitch design canvas into the React context layers.*

- `[ ]` **Task 3.1**: Initialize Frontend Foundation & Global Styles.
  - Apply Google Stitch design tokens (colors, typography, spacing, shadows) to Tailwind configuration (`tailwind.config.js`).
  - Update `src/styles/globals.css` with baseline styles and micro-animations defined in Stitch.
- `[ ]` **Task 3.2**: Setup React Context Layers & Layout Schemas.
  - Scaffold global layout wrappers and structural components reflecting Stitch high-fidelity schemas.
  - Set up state management and Context APIs necessary for the learning path and assessments.
- `[ ]` **Task 3.3**: Component Integration & Assembly.
  - Import and adapt Stitch-generated React components:
    - `TopicInput.jsx`: High-fidelity search and entry interface.
    - `PathDisplay.jsx`: Sequential, dynamic step-by-step roadmap UI.
    - `AssessmentForm.jsx`: Interactive MCQ taking experience.
    - `GapAnalysisReport.jsx`: Results layout with supplementary resource views.
- `[ ]` **Task 3.4**: Connect API Client Utilities.
  - Configure `axios` client and React Query hooks (`services/api.js`, `services/hooks.js`) for the `/api/generate-path`, `/api/generate-quiz`, and `/api/analyze-gaps` endpoints.
  - Ensure loading states, error boundaries, and seamless API transitions are visually polished per Stitch designs.

---

## Phase 4: Polish, E2E Testing, and Deployment (M4)

**Location**: `/backend` & `/frontend`

- `[ ]` **Task 4.1**: Comprehensive E2E Testing.
  - Develop Playwright integration tests simulating the full user learning workflow (topic entry -> path generation -> assessment -> gap analysis).
  - Complete React component unit tests (React Testing Library).
- `[ ]` **Task 4.2**: Performance Optimization.
  - Review database query tuning and indexing.
  - Ensure frontend renders smoothly without blocking and follows LCP/INP Core Web Vitals optimization best practices.
- `[ ]` **Task 4.3**: Observability & Documentation.
  - Add structured logging to backend services.
  - Finalize API documentation and developer guides.
- `[ ]` **Task 4.4**: Deployment.
  - Deploy backend to serverless free-tier environment.
  - Deploy frontend to static/Vite hosting (e.g., Vercel) validating stateless, separate tier architectures.
