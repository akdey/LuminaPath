# Data Model: AI-Driven Learning Path Generator (Phase 1 Design)

**Created**: 2026-05-28  
**Status**: Complete  
**Schema Version**: 1.0.0  
**Database**: SQLite (file-based at `./data/lumina.db`)

---

## Entity Relationship Diagram (Logical)

```
┌─────────────────────┐
│  user_sessions      │
├─────────────────────┤
│ id (PK)             │
│ created_at          │
│ last_activity       │
│ device_info         │
└──────┬──────────────┘
       │ 1:N
       │
┌──────▼──────────────────────┐
│      roadmaps               │
├─────────────────────────────┤
│ id (PK)                     │
│ session_id (FK)             │
│ topic_name                  │
│ created_at                  │
│ steps_count                 │
│ metadata_json               │
└──────┬──────────────────────┘
       │ 1:N
       │
┌──────▼──────────────────────┐       ┌──────────────────┐
│      tasks                  │◄──────│    resources     │
├─────────────────────────────┤       ├──────────────────┤
│ id (PK)                     │ 1:N   │ id (PK)          │
│ roadmap_id (FK)             │       │ task_id (FK)     │
│ task_order                  │       │ url              │
│ title                       │       │ title            │
│ description                 │       │ source           │
│ duration_minutes            │       │ type             │
│ completed_at                │       │ metadata_json    │
│ created_at                  │       └──────────────────┘
└──────┬──────────────────────┘
       │ 1:N
       │
┌──────▼──────────────────────┐       ┌──────────────────┐
│    assessments              │◄──────│      mcqs        │
├─────────────────────────────┤       ├──────────────────┤
│ id (PK)                     │ 1:N   │ id (PK)          │
│ task_id (FK)                │       │ assessment_id(FK)│
│ taken_at                    │       │ question         │
│ score                       │       │ options_json     │
│ attempts                    │       │ correct_answer   │
│ submitted_at                │       │ explanation      │
└──────┬──────────────────────┘       └──────────────────┘
       │ 1:1
       │
┌──────▼──────────────────────┐
│    gap_analyses             │
├─────────────────────────────┤
│ id (PK)                     │
│ assessment_id (FK)          │
│ weak_concepts_json          │
│ recommendations_json        │
│ generated_at                │
└─────────────────────────────┘
```

---

## Table Schemas

### 1. user_sessions
Anonymous session tracking (no personal data).

```sql
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,  -- UUID
    created_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP NOT NULL,
    device_info TEXT,  -- JSON: {browser, os, user_agent}
    is_active BOOLEAN DEFAULT 1
);
```

**Fields**:
- `id`: Unique session identifier (UUID v4)
- `created_at`: Session start time (ISO 8601)
- `last_activity`: Last API call timestamp (for cleanup)
- `device_info`: JSON object with browser/OS info (optional)
- `is_active`: Soft delete flag (cleanup sessions older than 30 days)

**Indexes**:
```sql
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity);
```

---

### 2. roadmaps
Learning path instances per session.

```sql
CREATE TABLE roadmaps (
    id TEXT PRIMARY KEY,  -- UUID
    session_id TEXT NOT NULL,
    topic_name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    steps_count INTEGER DEFAULT 0,
    metadata_json TEXT,  -- JSON: {curator_version, llm_model, api_cost}
    FOREIGN KEY (session_id) REFERENCES user_sessions(id)
);
```

**Fields**:
- `id`: Unique roadmap identifier (UUID v4)
- `session_id`: Reference to user session (FK)
- `topic_name`: User-entered topic (e.g., "Machine Learning Basics")
- `created_at`: Generation timestamp
- `steps_count`: Denormalized count of tasks (for quick queries)
- `metadata_json`: {curator_version, llm_model, api_cost, cache_hit}

**Indexes**:
```sql
CREATE INDEX idx_roadmaps_session_id ON roadmaps(session_id);
CREATE INDEX idx_roadmaps_topic_name ON roadmaps(topic_name);
CREATE INDEX idx_roadmaps_created_at ON roadmaps(created_at DESC);
```

---

### 3. tasks (Learning Steps)
Individual learning milestones within a roadmap.

```sql
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,  -- UUID
    roadmap_id TEXT NOT NULL,
    task_order INTEGER NOT NULL,  -- 1-based sequential order
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INTEGER,
    completed_at TIMESTAMP,  -- NULL if not completed
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id)
);
```

**Fields**:
- `id`: Unique task identifier (UUID v4)
- `roadmap_id`: Reference to parent roadmap (FK)
- `task_order`: Sequential position in learning path (1, 2, 3, ...)
- `title`: Step title (e.g., "Introduction to Neural Networks")
- `description`: Detailed learning objective
- `duration_minutes`: Estimated time to complete
- `completed_at`: Timestamp when learner marks complete (NULL = not done)
- `created_at`: Task creation timestamp

**Indexes**:
```sql
CREATE UNIQUE INDEX idx_tasks_roadmap_order ON tasks(roadmap_id, task_order);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);
```

---

### 4. resources
Curated learning materials (videos, articles) linked to tasks.

```sql
CREATE TABLE resources (
    id TEXT PRIMARY KEY,  -- UUID
    task_id TEXT NOT NULL,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    source TEXT NOT NULL,  -- 'youtube' | 'wikipedia' | 'other'
    type TEXT NOT NULL,  -- 'video' | 'article'
    metadata_json TEXT,  -- JSON: {duration_sec, author, thumbnail_url, ...}
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

**Fields**:
- `id`: Unique resource identifier (UUID v4)
- `task_id`: Reference to task (FK)
- `url`: Direct link to video/article
- `title`: Resource title
- `source`: Content source API ('youtube', 'wikipedia', 'other')
- `type`: Media type ('video', 'article', 'interactive')
- `metadata_json`: {duration_sec, author, thumbnail_url, published_date, ...}

**Indexes**:
```sql
CREATE INDEX idx_resources_task_id ON resources(task_id);
CREATE INDEX idx_resources_source ON resources(source);
```

---

### 5. assessments
MCQ assessments generated after task completion.

```sql
CREATE TABLE assessments (
    id TEXT PRIMARY KEY,  -- UUID
    task_id TEXT NOT NULL,
    taken_at TIMESTAMP NOT NULL,
    score INTEGER,  -- 0-100 (percentage)
    attempts INTEGER DEFAULT 1,
    submitted_at TIMESTAMP,
    metadata_json TEXT,  -- JSON: {num_questions, examiner_version, ...}
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

**Fields**:
- `id`: Unique assessment identifier (UUID v4)
- `task_id`: Reference to task (FK)
- `taken_at`: Assessment start time
- `score`: Percentage score (0-100); NULL if incomplete
- `attempts`: Number of retakes (default 1)
- `submitted_at`: Submission timestamp
- `metadata_json`: {num_questions, examiner_version, generation_time_ms, ...}

**Indexes**:
```sql
CREATE INDEX idx_assessments_task_id ON assessments(task_id);
CREATE INDEX idx_assessments_score ON assessments(score);
```

---

### 6. mcqs
Multiple-choice questions within assessments.

```sql
CREATE TABLE mcqs (
    id TEXT PRIMARY KEY,  -- UUID
    assessment_id TEXT NOT NULL,
    question TEXT NOT NULL,
    options_json TEXT NOT NULL,  -- JSON: ['option1', 'option2', 'option3', 'option4']
    correct_answer INTEGER NOT NULL,  -- 0-based index into options array
    explanation TEXT,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id)
);
```

**Fields**:
- `id`: Unique MCQ identifier (UUID v4)
- `assessment_id`: Reference to assessment (FK)
- `question`: MCQ question text
- `options_json`: JSON array of 4 options [opt1, opt2, opt3, opt4]
- `correct_answer`: Index of correct option (0-3)
- `explanation`: Why this answer is correct (for feedback)

**Indexes**:
```sql
CREATE INDEX idx_mcqs_assessment_id ON mcqs(assessment_id);
```

---

### 7. gap_analyses
Gap analysis reports for assessments scoring <100%.

```sql
CREATE TABLE gap_analyses (
    id TEXT PRIMARY KEY,  -- UUID
    assessment_id TEXT NOT NULL UNIQUE,
    weak_concepts_json TEXT NOT NULL,  -- JSON: ['concept1', 'concept2', ...]
    recommendations_json TEXT NOT NULL,  -- JSON: [{concept, resources: [{url, title}]}, ...]
    generated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id)
);
```

**Fields**:
- `id`: Unique gap analysis identifier (UUID v4)
- `assessment_id`: Reference to assessment (FK, UNIQUE — one report per assessment)
- `weak_concepts_json`: JSON array of concepts not mastered
- `recommendations_json`: JSON array of {concept, resources} recommendations
- `generated_at`: Generation timestamp

**Indexes**:
```sql
CREATE INDEX idx_gap_analyses_assessment_id ON gap_analyses(assessment_id);
```

---

## Migration Strategy

All schema changes version-controlled via migration scripts in `backend/src/db/migrations/`.

**Migration File Naming**: `001_initial_schema.sql`, `002_add_user_sessions.sql`, etc.

**Example Migration (001_initial_schema.sql)**:

```sql
-- Up
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP NOT NULL,
    device_info TEXT,
    is_active BOOLEAN DEFAULT 1
);

CREATE TABLE roadmaps (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    topic_name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    steps_count INTEGER DEFAULT 0,
    metadata_json TEXT,
    FOREIGN KEY (session_id) REFERENCES user_sessions(id)
);

-- [Additional tables...]

-- Down (Rollback)
DROP TABLE gap_analyses;
DROP TABLE mcqs;
DROP TABLE assessments;
DROP TABLE resources;
DROP TABLE tasks;
DROP TABLE roadmaps;
DROP TABLE user_sessions;
```

---

## Validation Rules (Application Layer)

SQLite enforces minimal constraints; validation happens in SQLAlchemy ORM + Pydantic:

| Field | Validation | Source |
|-------|-----------|--------|
| `roadmaps.topic_name` | Non-empty, max 200 chars | Pydantic |
| `tasks.task_order` | Positive integer, unique per roadmap | Application |
| `assessments.score` | Integer 0-100 | Pydantic |
| `mcqs.correct_answer` | 0-3 (4-option MCQ) | Pydantic |
| `resources.source` | Enum: youtube, wikipedia, other | Pydantic |
| JSON fields | Valid JSON, schema validation | Application |

---

## Database File Management

**Location**: `./data/lumina.db` (project-relative, committed to `.gitignore`)

**Backup & Recovery**:
- No automated backups in MVP (sessions are ephemeral)
- For persistent deployments, daily SQLite snapshots recommended
- Restore via: `sqlite3 lumina.db < backup.sql`

**Size Estimation** (1000 users, 500 roadmaps, 2500 tasks):
- Base schema: ~100 KB
- With data: ~5-10 MB (lean, file-based)
- SQLite handles efficiently; no optimization needed until >100 MB

---

## Schema Versioning

```
PRAGMA user_version;  -- Returns schema version integer (stored in SQLite)
```

**Migration Executor** (Python pseudocode):

```python
def apply_migrations(db_path):
    conn = sqlite3.connect(db_path)
    current_version = conn.execute("PRAGMA user_version;").fetchone()[0]
    
    for version in range(current_version + 1, TARGET_VERSION + 1):
        migration_file = f"migrations/{version:03d}_*.sql"
        execute_migration(conn, migration_file)
        conn.execute(f"PRAGMA user_version = {version};")
    
    conn.commit()
```

---

**Next Phase**: API contracts and quickstart setup guide
