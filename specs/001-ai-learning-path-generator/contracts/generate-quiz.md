# API Contract: POST /api/generate-quiz

**Feature**: Assessment Generation  
**Description**: Generates 3-5 context-aware MCQs for a completed learning task using the Examiner Agent  
**Status**: Specification  

---

## Endpoint

```http
POST /api/generate-quiz
Content-Type: application/json
```

---

## Request Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["task_id"],
  "properties": {
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "Learning task/step ID from the roadmap"
    },
    "session_id": {
      "type": "string",
      "format": "uuid",
      "description": "Session identifier (must match roadmap session)"
    },
    "num_questions": {
      "type": "integer",
      "minimum": 3,
      "maximum": 5,
      "default": 4,
      "description": "Number of MCQs to generate"
    }
  }
}
```

**Example**:

```json
{
  "task_id": "650e8400-e29b-41d4-a716-446655440001",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "num_questions": 4
}
```

---

## Response Schema (Success 200 OK)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "assessment_id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique assessment identifier for submission"
    },
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "Confirmed task ID"
    },
    "questions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "question": {
            "type": "string",
            "description": "MCQ question text"
          },
          "options": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "minItems": 4,
            "maxItems": 4,
            "description": "Four answer options (A, B, C, D)"
          },
          "explanation": {
            "type": "string",
            "description": "Explanation (shown after submission)"
          }
        },
        "required": ["id", "question", "options", "explanation"]
      },
      "minItems": 3,
      "maxItems": 5
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "Assessment generation timestamp"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "examiner_version": {
          "type": "string"
        },
        "llm_model": {
          "type": "string"
        }
      }
    }
  },
  "required": ["assessment_id", "task_id", "questions", "created_at"]
}
```

**Example**:

```json
{
  "assessment_id": "750e8400-e29b-41d4-a716-446655440002",
  "task_id": "650e8400-e29b-41d4-a716-446655440001",
  "questions": [
    {
      "id": "850e8400-e29b-41d4-a716-446655440003",
      "question": "What is the primary difference between supervised and unsupervised learning?",
      "options": [
        "Supervised learning requires labeled data; unsupervised does not",
        "Unsupervised learning is always faster than supervised learning",
        "Supervised learning can only use numerical data",
        "There is no difference; the terms are interchangeable"
      ],
      "explanation": "Supervised learning uses labeled training data with known outputs, while unsupervised learning finds patterns in unlabeled data. This is the fundamental distinction."
    },
    {
      "id": "850e8400-e29b-41d4-a716-446655440004",
      "question": "Which of the following is an example of unsupervised learning?",
      "options": [
        "Linear regression on house prices",
        "Customer segmentation via clustering",
        "Image classification with labeled training set",
        "Email spam detection with labeled examples"
      ],
      "explanation": "Customer segmentation via clustering (k-means, hierarchical, etc.) is unsupervised because it groups unlabeled customer data without predefined categories."
    }
  ],
  "created_at": "2026-05-28T10:35:00Z",
    "metadata": {
      "examiner_version": "1.0.0",
    "llm_model": "gemini-1"
  }
}
```

---

## Answer Submission (POST /api/submit-assessment)

```http
POST /api/submit-assessment
Content-Type: application/json
```

**Request**:

```json
{
  "assessment_id": "750e8400-e29b-41d4-a716-446655440002",
  "answers": [
    {
      "question_id": "850e8400-e29b-41d4-a716-446655440003",
      "selected_option_index": 0
    },
    {
      "question_id": "850e8400-e29b-41d4-a716-446655440004",
      "selected_option_index": 1
    }
  ]
}
```

**Response (200 OK)**:

```json
{
  "assessment_id": "750e8400-e29b-41d4-a716-446655440002",
  "score": 50,
  "total_questions": 4,
  "correct_count": 2,
  "incorrect_count": 2,
  "results": [
    {
      "question_id": "850e8400-e29b-41d4-a716-446655440003",
      "selected_index": 0,
      "correct_index": 0,
      "is_correct": true,
      "explanation": "..."
    },
    {
      "question_id": "850e8400-e29b-41d4-a716-446655440004",
      "selected_index": 1,
      "correct_index": 1,
      "is_correct": true,
      "explanation": "..."
    }
  ],
  "submitted_at": "2026-05-28T10:40:00Z"
}
```

---

## Error Responses

### 404 Not Found (Task/Assessment)
```json
{
  "error": "TASK_NOT_FOUND",
  "message": "Learning task not found in your session",
  "details": {
    "task_id": "650e8400-e29b-41d4-a716-446655440001"
  }
}
```

### 409 Conflict (Already Assessed)
```json
{
  "error": "ASSESSMENT_ALREADY_EXISTS",
  "message": "Assessment already exists for this task. Retrieve existing or create new.",
  "details": {
    "existing_assessment_id": "750e8400-e29b-41d4-a716-446655440002"
  }
}
```

### 500 Internal Server Error
```json
{
  "error": "EXAMINER_AGENT_FAILED",
  "message": "Failed to generate assessment. Please try again.",
  "details": {
    "reason": "LLM API rate limit exceeded",
    "retry_possible": true,
    "retry_after_seconds": 30
  }
}
```

---

## Performance Requirements

- **Timeout**: 10 seconds (p95)
- **Response Time**: <3 seconds (p50); <8 seconds (p95)
- **Concurrent Assessments**: Support 10+ simultaneous quiz generations

---

## Implementation Notes

1. **Validation**: Confirm task_id exists in session; verify task is marked as completed (or in-progress)
2. **Question Diversity**: LLM should generate diverse question types (definition, application, analysis)
3. **Option Randomization**: Shuffle correct answer position (0-3) to avoid learner pattern detection
4. **Re-generation**: Allow re-take; generate new questions (or from question bank if implemented)
5. **Storage**: Store MCQ answers in `mcqs` table; track attempts in `assessments.attempts`
