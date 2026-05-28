<!-- SYNC_IMPACT_REPORT
## Constitution Initialization

**Version**: 0.0.0 → 1.0.0 (MAJOR: Initial constitution establishment)

**Action**: Initial constitution created for LuminaPath project

**Principles Added**:
- I. Zero-Cost Infrastructure Architecture
- II. Frontend-Backend Separation
- III. Technology Stack Compliance (Non-Negotiable)
- IV. Database Purity
- V. Multi-Agent AI Pipeline Architecture

**Sections Added**:
- Core Principles (5 principles)
- Technology Stack Requirements
- Development Workflow & Quality Gates

**Templates Requiring Updates**:
- ✅ [plan-template.md](.specify/templates/plan-template.md) — Review for alignment with tech stack
- ✅ [spec-template.md](.specify/templates/spec-template.md) — Verify scope constraints
- ✅ [tasks-template.md](.specify/templates/tasks-template.md) — Align with architecture principles

**Deferred TODOs**: None
-->

# LuminaPath Constitution

## Core Principles

### I. Zero-Cost Infrastructure Architecture

**MUST constraint**: All infrastructure deployed on LuminaPath runs on zero-cost or minimal-cost tier services exclusively. No paid cloud resources, premium tiers, or services beyond free quotas are permitted. This includes:
- File-based local SQLite for data persistence (no managed databases)
- Serverless or free-tier hosting for backend (e.g., Vercel, Netlify, local deployment)
- No paid APIs or third-party services without explicit documented justification
- All CI/CD pipelines must use free-tier runners (GitHub Actions, etc.)

**Rationale**: Cost-effectiveness is non-negotiable for early-stage product validation and community adoption. Infrastructure decisions cascade into deployment strategy, feature prioritization, and scalability planning.

### II. Frontend-Backend Separation

**MUST enforce**: Strict architectural separation between frontend presentation logic and backend AI execution pipelines. Frontend is exclusively a client-side presentation layer; backend is exclusively a stateless AI orchestration server.
- Frontend MUST NOT contain business logic, data persistence, or multi-agent coordination
- Backend MUST NOT generate UI or presentation artifacts (except JSON/structured responses)
- All cross-tier communication via REST API or async message passing only
- No server-side rendering, session state, or stateful frontend-backend coupling

**Rationale**: Clean separation enables independent scaling, testing, and iteration. Frontend teams own UX; backend teams own AI/logic. Prevents technical debt from tight coupling.

### III. Technology Stack Compliance (Non-Negotiable)

**Mandatory stack**: LuminaPath uses and ONLY uses the following core technologies:
- **Frontend**: React.js for component logic + Tailwind CSS for styling (no alternative UI frameworks)
- **Backend**: Python 3.9+ with FastAPI for REST API (no other web frameworks). Use UV(Ultra Violet) package manager.
- **Database**: SQLite with file-based persistence in project root (no other databases)
- **No exceptions**: No alternative frameworks, runtimes, or databases are permitted without constitutional amendment

**Rationale**: Consistency across the codebase reduces cognitive load, onboarding friction, and maintenance burden. Tight tech choices enable predictable development velocity.

### IV. Database Purity

**MUST enforce**: SQLite is the sole data persistence mechanism; it MUST be file-based (no in-memory), locally stored, and schema-managed via code (migrations tracked in Git).
- Database file path: `./data/lumina.db` (project-relative, committed structure in `.gitignore`)
- All schema changes MUST be version-controlled and reversible
- No external databases, caching layers, or distributed state stores are permitted
- Query performance MUST be optimized via indexing and schema design, not infrastructure scaling

**Rationale**: File-based SQLite eliminates infrastructure dependencies, enables zero-cost deployment, and ensures local development mirrors production exactly.

### V. Multi-Agent AI Pipeline Architecture

**MUST enforce**: All multi-agent AI execution, orchestration, and LLM coordination happens exclusively in the backend. Frontend has zero knowledge of AI pipeline internals.
- Backend MUST expose high-level AI service endpoints (e.g., `/api/analyze`, `/api/generate`)
- Frontend calls backend endpoints and displays results; no LLM client libraries in frontend
- Agent state, memory, and inter-agent communication MUST be backend-only
- Response streaming (if needed) uses Server-Sent Events or WebSocket, fully managed by backend

**Rationale**: Centralizing AI execution enables consistent prompt engineering, cost control, safety auditing, and version management. Frontend remains lightweight and performant.

## Technology Stack Requirements

**Frontend Stack**:
- React.js (latest stable or LTS) for component architecture
- Tailwind CSS for utility-first styling and responsive design
- Vite or Create React App for bundling and development server
- No additional UI frameworks (e.g., no Vue, Angular, Svelte)
- ESLint + Prettier for code consistency

**Backend Stack**:
- Python 3.9+ runtime environment
- FastAPI framework for REST API (no Django, Flask, or Starlette directly)
- Pydantic for request/response validation
- SQLAlchemy ORM for database abstraction (optional, for schema safety)
- No background job queues; async functions via FastAPI `BackgroundTasks` only
- Standard library `sqlite3` or SQLAlchemy for database access

**Data Persistence**:
- SQLite (file-based, local to project repository)
- Default schema versioning via migration scripts (e.g., Alembic for Python)
- No external data warehouses, message queues, or caching layers

**Development & DevOps**:
- Git for version control (single repository for frontend + backend + schemas)
- GitHub Actions for CI/CD (free tier)
- Local development environment setup via `Makefile` or shell scripts (zero-cost reproducibility)

## Development Workflow & Quality Gates

**Branch Strategy**: 
- `main` branch reflects production-ready code; protected via PR reviews
- Feature branches follow naming convention: `feature/<name>` or `fix/<name>`
- All PRs MUST pass: lint checks, unit tests, API contract tests

**Testing Requirements**:
- Backend: Unit tests for business logic (pytest); integration tests for API endpoints and database queries
- Frontend: Component tests (React Testing Library); E2E smoke tests for critical user journeys
- Minimum test coverage: 70% for backend; 60% for frontend
- All tests MUST pass before merge

**Code Review**:
- All PRs require one approval before merge
- Reviewer MUST verify: stack compliance (no new dependencies), architecture separation (frontend ≠ backend logic), database purity (no external storage), zero-cost constraint validation
- If PR violates constitution, reviewer MUST flag explicitly and suggest amendment process if needed

**Observability & Debugging**:
- Backend logging via Python `logging` module; structured logs to stdout (no external log aggregation)
- API responses include clear error codes and messages (no silent failures)
- Frontend console logs for development; production builds use error tracking (e.g., Sentry free tier)

## Governance

**Constitution Authority**: This constitution supersedes all other project guidelines, code standards, and architectural decisions. In case of conflict, the constitution is the source of truth.

**Amendment Process**:
1. Propose amendment via GitHub issue or PR with clear rationale (e.g., "new tech stack justified by performance analysis")
2. Minimum one week review period; all core team members comment
3. Amendment MUST include: old principle(s), new principle(s), migration plan, PR checklist for affected artifacts
4. Approval requires unanimous consensus (or 2/3 majority if team >3 members)
5. Once approved, update constitution version, merge, and propagate changes to plan/spec/task templates

**Version Policy**: Semantic versioning (MAJOR.MINOR.PATCH)
- MAJOR: Principle removals or stack changes (e.g., React → Vue)
- MINOR: New principles added or expanded guidance
- PATCH: Clarifications, typo fixes, wording improvements

**Compliance Review**:
- Monthly: Review recent PRs for constitution violations; log issues or amendments needed
- Quarterly: Full architecture audit; check if tech stack remains optimal
- All audit findings logged in GitHub issues for transparency

**Use for Runtime Guidance**: Developers and reviewers MUST reference this constitution in code reviews, architecture discussions, and onboarding. Link to specific principles when rejecting PRs or proposing changes.

---

**Version**: 1.0.0 | **Ratified**: 2026-05-28 | **Last Amended**: 2026-05-28
