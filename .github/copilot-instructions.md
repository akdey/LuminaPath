<!-- SPECKIT START -->
## Project Context: LuminaPath

**Current Phase**: Implementation Planning (Phase 1 Design Complete)

**Feature**: AI-Driven Personalized Learning Path Generator  
**Branch**: `001-ai-learning-path-generator`  
**Plan**: [specs/001-ai-learning-path-generator/plan.md](../specs/001-ai-learning-path-generator/plan.md)

**Key Deliverables**:
- **Data Model**: [specs/001-ai-learning-path-generator/data-model.md](../specs/001-ai-learning-path-generator/data-model.md) — SQLAlchemy ORM schema with 7 tables (user_sessions, roadmaps, tasks, resources, assessments, mcqs, gap_analyses)
- **API Contracts**: [specs/001-ai-learning-path-generator/contracts/](../specs/001-ai-learning-path-generator/contracts/) — 3 async FastAPI endpoints (/generate-path, /generate-quiz, /analyze-gaps)
- **Development Setup**: [specs/001-ai-learning-path-generator/quickstart.md](../specs/001-ai-learning-path-generator/quickstart.md) — Backend (Python 3.10+ FastAPI with UV) and Frontend (React 18 + Tailwind CSS)
- **Research**: [specs/001-ai-learning-path-generator/research.md](../specs/001-ai-learning-path-generator/research.md) — Content curation strategy, LLM provider, session management, testing approach

**Technology Stack** (Constitution-Enforced):
**APIs**: YouTube Data API (~10k/day quota), Wikipedia API (unlimited), Google Gemini (primary LLM)

- Anonymous/stateless sessions (no user accounts in MVP)
- Backend-only multi-agent orchestration (Curator, Examiner, Evaluator agents)
- Frontend-backend separation (REST API only)
- Zero-cost infrastructure (free-tier APIs + SQLite file-based persistence)

**Constitution Compliance**: ✅ ALL GATES PASSED (Phase 0 & 1 gates validated)

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
