# Research: AI-Driven Learning Path Generator (Phase 0)

**Created**: 2026-05-28  
**Status**: Complete — All unknowns resolved  
**Scope**: Content curation APIs, LLM capabilities, session management, database design  

---

## Research Findings

### 1. Content Curation via Free-Tier APIs

**Unknown**: How to access YouTube and Wikipedia content without paid APIs or web scraping?

**Decision**: Use free-tier APIs with quota tracking
- **YouTube Data API**: Free tier provides ~10,000 queries/day quota; suitable for MVP
- **Wikipedia API (MediaWiki)**: Unlimited public API queries; stable + reliable
- **Implementation Strategy**: 
  1. Use Wikipedia API as primary (unlimited + reliable)
  2. Use YouTube Data API as secondary (with quota enforcement)
  3. Cache curated resources per topic for 30 days to minimize quota usage
  4. Implement rate limiting at application level to respect quota boundaries

**Rationale**: Aligns with zero-cost constraint; free quotas sufficient for MVP user volume

**API Examples**:
```
YouTube Search: https://www.googleapis.com/youtube/v3/search?q={query}&key={API_KEY}
Wikipedia Search: https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={query}&format=json
```

**Next Steps**: Acquire API keys during backend setup; document quota tracking in code

---

### 2. LLM Provider for Agent Orchestration

**Unknown**: Which LLM provider for Curator, Examiner, Evaluator agents?

**Decision**: Use Google Gemini as the primary LLM with an open-source fallback.
- **Primary (Recommended)**: Google Gemini via Google Cloud / Gemini API
  - Pros: High-quality generation for MCQs and gap analyses; robust model family
  - Cons: Requires Google Cloud/Gemini access and quota monitoring
- **Fallback**: Open-source LLM (Llama 2 via Ollama or HuggingFace) for zero-cost local inference
  - Pros: No API cost; can run locally
  - Cons: Lower quality outputs; may require GPU/inference resources

**Chosen for MVP**: Google Gemini (primary); fallback to open-source LLM if Gemini access is unavailable. Monitor quota and usage.

**Prompt Engineering**:
- **Curator Agent**: "Given this topic, list 5 learning steps with estimated time each. Then find 2-3 relevant resources from {resource_urls}"
- **Examiner Agent**: "Create 3-5 MCQs for this learning step: {step_content}. Format: question, 4 options, correct answer, explanation"
- **Evaluator Agent**: "Analyze these MCQ answers: {answers}. Identify weak concepts and recommend 2-3 resources to review"

---

### 3. Session Management & State

**Unknown**: How to manage learner sessions without persistent user accounts?

**Decision**: Anonymous/stateless session model using browser session storage
- **Frontend Session Storage**: Learner data (current path, assessment progress) stored in browser localStorage
- **Backend Session Tokens**: Optional session ID (UUID) included in API requests for server-side request logging (not for persistence)
- **Data Lifecycle**: 
  - Session exists for browser session lifetime
  - Session data lost on browser close
  - Optional: Add "Export as JSON" feature to let users save progress manually
- **Privacy**: No user data persists after session; no user database required in MVP

**Rationale**: Minimal scope; fastest MVP delivery; enables future account addition without major refactoring

---

### 4. Database Schema Design

**Unknown**: How to model learning paths, steps, assessments, and resources in SQLite?

**Decision**: Normalized schema with 4 core tables + junction tables for many-to-many relationships

**Core Entities**:
1. **roadmaps**: (id, session_id, topic_name, created_at, steps_count)
2. **tasks** (formerly "steps"): (id, roadmap_id, order, title, description, duration_minutes, completed_at)
3. **assessments**: (id, task_id, taken_at, score, attempts)
4. **user_sessions**: (id, created_at, last_activity, device_info)

**Junction/Support Tables**:
- **resources**: (id, task_id, url, title, source, type) — links resources to steps
- **mcqs**: (id, assessment_id, question, options_json, correct_answer, explanation)
- **gap_analyses**: (id, assessment_id, weak_concepts_json, recommendations_json, generated_at)

**Design Decisions**:
- Denormalize `steps_count` in roadmaps table for quick retrieval
- Store JSON arrays (options, recommendations) as TEXT with JSON validation in application layer
- Use timestamps (created_at, completed_at) for audit trails
- No foreign key constraints enforced at DB level (simpler SQLite queries); enforce in application

---

### 5. FastAPI Architecture & Async Patterns

**Unknown**: How to structure FastAPI for efficient async LLM calls and concurrent requests?

**Decision**: Async-first architecture with task queues for long-running operations
- **Async Handlers**: All FastAPI endpoints use `async def`
- **Background Tasks**: Use FastAPI BackgroundTasks for LLM calls (Curator, Examiner, Evaluator)
- **Timeouts**: Implement request timeouts:
  - Path generation: 30 seconds
  - Assessment generation: 10 seconds
  - Gap analysis: 10 seconds
- **Streaming**: For long operations, consider Server-Sent Events (SSE) or polling

**Request Flow**:
```
POST /generate-path
  ├─ Validate topic input
  ├─ Check cache (topic already curated?)
  ├─ If cache miss: Enqueue Curator Agent task (async background)
  ├─ Return job_id immediately
  └─ Polling endpoint: GET /generate-path/{job_id} returns status + results

POST /generate-quiz
  ├─ Validate task_id
  ├─ Enqueue Examiner Agent task
  └─ Return assessment + MCQs

POST /analyze-gaps
  ├─ Validate assessment_id
  ├─ Enqueue Evaluator Agent task
  └─ Return gap analysis report
```

---

### 6. Testing Strategy

**Unknown**: How to test LLM-dependent services without API costs or flakiness?

**Decision**: Mock-based testing with recorded responses
- **Unit Tests**: Mock LLM calls with pre-recorded responses; test parsing logic, schema validation
- **Contract Tests**: Test API contract (request/response schemas) with mock data
- **Integration Tests**: Optional real API calls in CI/CD with rate limiting (skip by default)
- **Test Data**: Maintain fixtures with realistic LLM outputs

**Pytest Configuration**:
```python
@pytest.mark.skip_llm_calls  # Skip tests requiring real API calls
def test_examiner_agent_real():
    pass

# Mock-based test (always runs)
@patch('services.examiner_agent.call_llm')
def test_examiner_agent_mock(mock_llm):
    mock_llm.return_value = [...MCQ fixtures...]
    assert results == expected
```

---

## Clarifications Resolved (from Spec Phase)

✅ **Content Curation API**: Chose free-tier APIs (YouTube Data API ~10k/day, Wikipedia API unlimited)  
✅ **User Authentication**: Chose anonymous/stateless model (no persistent accounts in MVP)

---

## Dependencies & Integration Points

| Component | Dependency | Free Option | Cost | Notes |
|-----------|-----------|-------------|------|-------|
| Content APIs | YouTube | YouTube Data API (free tier) | $0 | ~10k queries/day |
| Content APIs | Wikipedia | Wikipedia API | $0 | Unlimited |
| LLM | Gemini | Google Gemini API | monitor usage and quotas | \
| LLM (fallback) | Ollama | Local open-source | $0 | Requires setup |
| Database | SQLite | Built-in | $0 | File-based |
| Hosting | Backend | Vercel/Heroku/Railway free tier | $0 | Function limits |
| Hosting | Frontend | Vercel/Netlify free tier | $0 | Included |

---

## Design Constraints & Trade-offs

| Constraint | Trade-off | Mitigation |
|-----------|-----------|-----------|
| Zero-cost APIs only | Limited query budgets | Aggressive caching (30 days per topic) |
| Anonymous sessions | No user history | Optional export-to-JSON feature for v2 |
| SQLite file-based | Single-server bottleneck | Acceptable for MVP; move to distributed DB in v2 |
| No server-side rendering | Larger JS bundles | Use code splitting + lazy loading in frontend |
| LLM API dependency | Flaky MCQ generation | Implement fallback questions + mock data for testing |

---

## Recommendations

1. **Immediate**: Acquire YouTube Data API key + set up quota monitoring
2. **Week 1**: Design SQLAlchemy models + migrations framework
3. **Week 2**: Implement core services (Curator, Examiner, Evaluator agents)
4. **Week 3**: Build FastAPI endpoints + frontend integration
5. **Week 4**: Testing + performance benchmarking

---

**Next Phase**: Phase 1 Design (data-model.md, API contracts, quickstart.md)
