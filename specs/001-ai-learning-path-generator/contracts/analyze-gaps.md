# API Contract: POST /api/analyze-gaps

**Feature**: Gap Analysis & Personalized Feedback  
**Description**: Generates a detailed gap analysis report for assessments scoring below 100% using the Evaluator Agent  
**Status**: Specification  

---

## Endpoint

```http
POST /api/analyze-gaps
Content-Type: application/json
```

---

## Request Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["assessment_id"],
  "properties": {
    "assessment_id": {
      "type": "string",
      "format": "uuid",
      "description": "Assessment ID from quiz submission"
    },
    "session_id": {
      "type": "string",
      "format": "uuid",
      "description": "Session identifier"
    }
  }
}
```

**Example**:

```json
{
  "assessment_id": "750e8400-e29b-41d4-a716-446655440002",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Response Schema (Success 200 OK)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "gap_analysis_id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique gap analysis report ID"
    },
    "assessment_id": {
      "type": "string",
      "format": "uuid"
    },
    "score": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100,
      "description": "Assessment score percentage"
    },
    "status": {
      "type": "string",
      "enum": ["needs_review", "proficient", "not_applicable"],
      "description": "Gap status: 'needs_review' (score <100), 'proficient' (score=100), 'not_applicable' (score not yet set)"
    },
    "weak_concepts": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Identified knowledge gaps (e.g., 'Neural network activation functions', 'Backpropagation algorithm')",
      "example": ["Gradient descent convergence", "Overfitting prevention techniques"]
    },
    "recommendations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "concept": {
            "type": "string",
            "description": "Weak concept identified"
          },
          "resources": {
            "type": "array",
            "minItems": 2,
            "maxItems": 3,
            "items": {
              "type": "object",
              "properties": {
                "url": {
                  "type": "string",
                  "format": "uri",
                  "description": "Link to supplementary resource"
                },
                "title": {
                  "type": "string",
                  "description": "Resource title"
                },
                "type": {
                  "type": "string",
                  "enum": ["video", "article", "interactive"],
                  "description": "Resource media type"
                },
                "source": {
                  "type": "string",
                  "enum": ["youtube", "wikipedia", "other"],
                  "description": "Content source"
                },
                "estimated_time_minutes": {
                  "type": "integer",
                  "description": "Estimated review time"
                }
              },
              "required": ["url", "title", "type", "source"]
            },
            "description": "Supplementary resources for this concept"
          },
          "remediation_time_minutes": {
            "type": "integer",
            "description": "Estimated time to remediate this gap"
          }
        },
        "required": ["concept", "resources", "remediation_time_minutes"]
      },
      "description": "Personalized recommendations for each weak concept"
    },
    "estimated_remediation_minutes": {
      "type": "integer",
      "description": "Total estimated time to address all gaps"
    },
    "next_steps": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Actionable next steps (e.g., 'Review gradient descent before retaking assessment')",
      "example": ["Review gradient descent algorithm", "Watch video on backpropagation", "Retake assessment"]
    },
    "generated_at": {
      "type": "string",
      "format": "date-time",
      "description": "Report generation timestamp"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "evaluator_version": {
          "type": "string"
        },
        "llm_model": {
          "type": "string"
        }
      }
    }
  },
  "required": [
    "gap_analysis_id",
    "assessment_id",
    "score",
    "status",
    "weak_concepts",
    "recommendations",
    "generated_at"
  ]
}
```

**Example** (Score 75%):

```json
{
  "gap_analysis_id": "950e8400-e29b-41d4-a716-446655440005",
  "assessment_id": "750e8400-e29b-41d4-a716-446655440002",
  "score": 75,
  "status": "needs_review",
  "weak_concepts": [
    "Gradient descent convergence",
    "Overfitting vs underfitting",
    "Regularization techniques"
  ],
  "recommendations": [
    {
      "concept": "Gradient descent convergence",
      "resources": [
        {
          "url": "https://www.youtube.com/watch?v=...",
          "title": "Gradient Descent Explained | StatQuest",
          "type": "video",
          "source": "youtube",
          "estimated_time_minutes": 12
        },
        {
          "url": "https://en.wikipedia.org/wiki/Gradient_descent",
          "title": "Gradient Descent - Wikipedia",
          "type": "article",
          "source": "wikipedia",
          "estimated_time_minutes": 15
        }
      ],
      "remediation_time_minutes": 30
    },
    {
      "concept": "Overfitting vs underfitting",
      "resources": [
        {
          "url": "https://www.youtube.com/watch?v=...",
          "title": "Overfitting and Underfitting Explained",
          "type": "video",
          "source": "youtube",
          "estimated_time_minutes": 10
        }
      ],
      "remediation_time_minutes": 25
    }
  ],
  "estimated_remediation_minutes": 55,
  "next_steps": [
    "Review gradient descent algorithm in detail",
    "Study overfitting prevention techniques",
    "Retake assessment after remediation"
  ],
  "generated_at": "2026-05-28T10:42:00Z",
  "metadata": {
    "evaluator_version": "1.0.0",
    "llm_model": "gemini-1"
  }
}
```

**Example** (Score 100% — No Gaps):

```json
{
  "gap_analysis_id": "a50e8400-e29b-41d4-a716-446655440006",
  "assessment_id": "750e8400-e29b-41d4-a716-446655440002",
  "score": 100,
  "status": "proficient",
  "weak_concepts": [],
  "recommendations": [],
  "estimated_remediation_minutes": 0,
  "next_steps": [
    "Excellent! You've mastered this step.",
    "Proceed to the next learning step."
  ],
  "generated_at": "2026-05-28T10:42:00Z",
  "metadata": {
    "evaluator_version": "1.0.0",
    "llm_model": "gemini-1"
  }
}
```

---

## Error Responses

### 404 Not Found (Assessment)
```json
{
  "error": "ASSESSMENT_NOT_FOUND",
  "message": "Assessment not found in your session",
  "details": {
    "assessment_id": "750e8400-e29b-41d4-a716-446655440002"
  }
}
```

### 422 Unprocessable Entity (No Score Yet)
```json
{
  "error": "ASSESSMENT_NOT_SUBMITTED",
  "message": "Cannot analyze gaps for incomplete assessment. Submit answers first.",
  "details": {
    "assessment_id": "750e8400-e29b-41d4-a716-446655440002"
  }
}
```

### 500 Internal Server Error
```json
{
  "error": "EVALUATOR_AGENT_FAILED",
  "message": "Failed to generate gap analysis. Please try again.",
  "details": {
    "reason": "LLM API timeout",
    "retry_possible": true
  }
}
```

---

## Performance Requirements

- **Timeout**: 10 seconds (p95)
- **Response Time**: <3 seconds (p50) if score already available; <8 seconds (p95) for new analysis
- **Concurrent Reports**: Support 5+ simultaneous gap analysis generations

---

## Implementation Notes

1. **Score Check**: Only generate report if assessment has a submitted score
2. **Auto-Trigger**: Consider auto-triggering gap analysis on `/submit-assessment` response if score <100
3. **Caching**: Cache gap analysis per assessment_id (do not re-generate unless explicitly requested)
4. **Resource Curation**: Use same Wikipedia + YouTube APIs for supplementary resources
5. **Fallback**: Provide template recommendations if LLM fails (generic study plan)
6. **Actionability**: Ensure recommendations are specific and immediately actionable
