# Feature Specification: AI-Driven Personalized Learning Path Generator

**Feature Branch**: `001-ai-learning-path-generator`

**Created**: 2026-05-28

**Status**: Draft

**Input**: User description: "Build 'Lumina Path', an AI-driven personalized learning path generator. A user enters a topic, the backend fetches and curates raw instructional videos/articles from platforms like YouTube and Wikipedia using an LLM Curator Agent, and generates a structured, step-by-step roadmap. When tasks are marked complete, an Examiner Agent creates customized MCQ assessments, and an Evaluator Agent returns a gap analysis report for any score below 100%."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Topic Entry & Learning Path Generation (Priority: P1)

Learner submits a topic of interest and receives a structured, step-by-step learning roadmap with recommended resources and milestones.

**Why this priority**: Core MVP feature. Without this, there is no learning path to present to users. Demonstrates end-to-end capability of topic submission → curation → roadmap generation.

**Independent Test**: User can enter a topic and receive a complete learning path with defined steps and estimated completion time.

**Acceptance Scenarios**:

1. **Given** user is on the home page, **When** user enters a topic (e.g., "Machine Learning Basics") and submits, **Then** system displays a structured learning roadmap with at least 5 sequential learning steps within 30 seconds
2. **Given** a learning path is generated, **When** user views the roadmap, **Then** each step includes: step title, description, estimated time, and 2-3 curated learning resources (video/article links)
3. **Given** user generates multiple learning paths, **When** user navigates back to previous topics, **Then** system persists and displays all previously generated paths

---

### User Story 2 - Task Completion & Assessment Generation (Priority: P2)

When learner marks a learning task/step as complete, the Examiner Agent generates customized multiple-choice questions (MCQs) to assess understanding.

**Why this priority**: Validates knowledge acquisition. Without assessments, learning completion lacks verification. Enables gap identification.

**Independent Test**: User can mark a task complete and receive a customized MCQ assessment specific to that step.

**Acceptance Scenarios**:

1. **Given** a learner has completed a learning step, **When** learner clicks "Mark as Complete", **Then** system immediately displays an assessment with 3-5 MCQs relevant to that step's content
2. **Given** an assessment is displayed, **When** learner answers all MCQs and submits, **Then** system displays the score immediately (e.g., "4/5 correct: 80%")
3. **Given** learner has taken assessments on multiple steps, **When** learner views the learning path, **Then** each completed step shows the assessment score and completion badge

---

### User Story 3 - Gap Analysis & Personalized Feedback (Priority: P3)

For any assessment scoring below 100%, the Evaluator Agent generates a detailed gap analysis report identifying weak areas and recommending additional resources.

**Why this priority**: Personalizes learning by addressing knowledge gaps. Improves learning outcomes but is secondary to path generation and assessment mechanics.

**Independent Test**: User scoring below 100% on an assessment receives a gap analysis report with specific recommendations.

**Acceptance Scenarios**:

1. **Given** learner scores below 100% on an MCQ assessment, **When** system processes the results, **Then** learner receives a gap analysis report within 10 seconds listing: (a) concepts not mastered, (b) areas needing review, (c) 2-3 supplementary resources per gap
2. **Given** a gap analysis report is generated, **When** learner clicks on a recommended supplementary resource, **Then** system navigates to that resource (video/article) in a new tab
3. **Given** learner completes recommended supplementary learning and retakes the assessment, **When** learner resubmits answers, **Then** system compares new score to previous score and shows improvement

---

### Edge Cases

- What happens if no curated resources are available for a topic? (System should display a message and suggest related topics)
- How does system handle incomplete assessments? (System allows save-and-resume or auto-saves progress)
- What if user enters a very niche/obscure topic? (System should gracefully handle low-match results and suggest closest matches)
- How does system handle rapid successive topic submissions? (Implement request throttling to avoid redundant API calls)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept freeform text topic input from the learner and validate input is not empty
- **FR-002**: System MUST use the Curator Agent to fetch and curate raw instructional content via free-tier APIs: YouTube Data API (with ~10,000 queries/day quota) and Wikipedia API (unlimited public queries). Query budgets MUST be tracked and enforced per deployment
- **FR-003**: System MUST generate a structured learning path with at least 5 sequential steps, each with a title, description, and estimated duration
- **FR-004**: System MUST associate 2-3 curated resources (links + metadata) with each learning path step
- **FR-005**: System MUST persist learning paths to local SQLite database with topic, steps, resources, and metadata
- **FR-006**: System MUST allow learner to mark individual steps as "Complete" with timestamp tracking
- **FR-007**: System MUST use the Examiner Agent to generate 3-5 context-aware MCQs for any completed step
- **FR-008**: System MUST score assessments immediately upon submission and display percentage score
- **FR-009**: System MUST use the Evaluator Agent to generate a gap analysis report for any assessment scoring below 100%
- **FR-010**: System MUST display gap analysis report with: identified weak concepts, recommended supplementary resources, and estimated remediation time
- **FR-011**: System MUST allow learners to retake assessments and track score history
- **FR-012**: Frontend MUST NOT contain LLM client libraries; all AI agent invocation MUST be backend-only
- **FR-013**: System MUST support at least 10 concurrent learning path generations without degradation

### Non-Functional Requirements

- **NFR-001**: All API responses for path generation MUST complete within 30 seconds
- **NFR-002**: Assessment generation MUST complete within 10 seconds
- **NFR-003**: Gap analysis generation MUST complete within 10 seconds
- **NFR-004**: System MUST be deployable on zero-cost infrastructure (file-based SQLite, free-tier hosting)
- **NFR-005**: System MUST log all LLM agent interactions for debugging and auditing (no sensitive data in logs)

## Success Criteria *(mandatory)*

### Completion Metrics

1. **Path Generation Accuracy**: 80% of generated learning paths are rated by users as "useful" or "comprehensive" for their topic
2. **User Engagement**: Users complete at least 3 steps per generated learning path on average
3. **Assessment Reliability**: Assessment scores correlate with user confidence levels (85%+ correlation)
4. **Speed Benchmarks**:
   - Learning path generation: <30 seconds (p95)
   - MCQ assessment generation: <10 seconds (p95)
   - Gap analysis generation: <10 seconds (p95)
5. **System Availability**: System uptime ≥99% in production
6. **Knowledge Retention**: Users scoring 100% on first attempt complete subsequent assessments 20% faster (indicating learning transfer)
7. **Cost Constraint**: Monthly infrastructure cost ≤ $0 (zero-cost tier only)

## Key Entities *(mandatory)*

### Data Model

- **Topic**: id, name, created_at, user_id
- **LearningPath**: id, topic_id, steps (array), created_at, user_id
- **Step**: id, path_id, title, description, duration_minutes, resources (array), order, completed_at, score
- **Resource**: id, step_id, title, url, type (video|article), source (youtube|wikipedia), metadata
- **Assessment**: id, step_id, mcqs (array), taken_at, score, answers (array)
- **MCQ**: id, assessment_id, question, options (array), correct_answer, explanation
- **GapAnalysis**: id, assessment_id, weak_concepts (array), recommendations (array), generated_at

## Assumptions

1. **Content Availability**: YouTube and Wikipedia APIs/scraping will provide sufficient curated content for most educational topics (validated in research phase)
2. **LLM Capability**: Backend LLM provider (e.g., Google Gemini API, local open-source LLM) will reliably generate coherent MCQs and gap analysis reports
- **User Authentication**: MVP uses anonymous/stateless model. Learners do NOT log in; each browser session maintains independent learning paths via local storage or session cookies. Learning path data persists only within a session; closing browser loses history unless user explicitly exports/saves. Future versions may add optional persistent accounts
4. **Assessment Retry**: Users can retake assessments unlimited times; system tracks history but does not enforce waiting periods
5. **Resource Freshness**: Curated resources are cached per topic for 30 days to balance freshness and API cost; user can force refresh
6. **Scoring Simplicity**: MCQ scoring is straightforward (1 point per correct answer); no weighted scoring or partial credit in MVP

## Out of Scope (MVP)

- Real-time collaborative learning paths
- Adaptive difficulty (assessment difficulty does not adjust based on learner performance)
- Certificate generation or achievement badges
- Mobile-native app (responsive web design only for MVP)
- Instructor/admin dashboard
- Third-party OAuth integration (authentication out of scope for MVP)
- Video playback or transcript generation (links only)
