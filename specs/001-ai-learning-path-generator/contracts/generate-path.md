# API Contract: POST /api/generate-path

**Feature**: Learning Path Generation  
**Description**: Generates a structured learning roadmap for a given topic using the Curator Agent  
**Status**: Specification  

---

## Endpoint

```http
POST /api/generate-path
Content-Type: application/json
```

---

## Request Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["topic"],
  "properties": {
    "topic": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Learning topic (e.g., 'Machine Learning Basics', 'Python Web Development')"
    },
    "session_id": {
      "type": "string",
      "format": "uuid",
      "description": "Session identifier (optional; generated if omitted)"
    },
    "cache_ok": {
      "type": "boolean",
      "default": true,
      "description": "Allow cached results if available (cache valid for 30 days per topic)"
    }
  }
}
```

**Examples**:

```json
{
  "topic": "Machine Learning Basics"
}
```

```json
{
  "topic": "Python Web Development",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "cache_ok": false
}
```

---

## Response Schema (Success 200 OK)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "roadmap_id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique identifier for this learning path"
    },
    "topic": {
      "type": "string",
      "description": "Confirmed topic"
    },
    "steps": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "order": {
            "type": "integer",
            "minimum": 1
          },
          "title": {
            "type": "string",
            "description": "Step title (e.g., 'Introduction to Neural Networks')"
          },
          "description": {
            "type": "string",
            "description": "Learning objective for this step"
          },
          "duration_minutes": {
            "type": "integer",
            "minimum": 5
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
                  "format": "uri"
                },
                "title": {
                  "type": "string"
                },
                "source": {
                  "type": "string",
                  "enum": ["youtube", "wikipedia", "other"]
                },
                "type": {
                  "type": "string",
                  "enum": ["video", "article"]
                }
              },
              "required": ["url", "title", "source", "type"]
            }
          }
        },
        "required": ["id", "order", "title", "description", "duration_minutes", "resources"]
      },
      "minItems": 5,
      "maxItems": 20,
      "description": "Ordered learning steps"
    },
    "estimated_total_minutes": {
      "type": "integer",
      "description": "Sum of all step durations"
    },
    "session_id": {
      "type": "string",
      "format": "uuid",
      "description": "Session identifier (use for subsequent requests)"
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "cache_hit": {
          "type": "boolean",
          "description": "Whether result was from cache"
        },
        "curator_version": {
          "type": "string",
          "description": "Version of curator agent used"
        },
        "llm_model": {
          "type": "string",
          "description": "LLM model used (e.g., 'gemini-1')"
        }
      }
    }
  },
  "required": ["roadmap_id", "topic", "steps", "session_id", "created_at"]
}
```

**Example**:

```json
{
  "roadmap_id": "550e8400-e29b-41d4-a716-446655440000",
  "topic": "Machine Learning Basics",
  "steps": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "order": 1,
      "title": "Introduction to Machine Learning",
      "description": "Understand the fundamentals of supervised vs unsupervised learning",
      "duration_minutes": 45,
      "resources": [
        {
          "url": "https://www.youtube.com/watch?v=...",
          "title": "Machine Learning Basics | Sentdex",
          "source": "youtube",
          "type": "video"
        },
        {
          "url": "https://en.wikipedia.org/wiki/Machine_learning",
          "title": "Machine Learning - Wikipedia",
          "source": "wikipedia",
          "type": "article"
        }
      ]
    }
  ],
  "estimated_total_minutes": 300,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-05-28T10:30:00Z",
    "metadata": {
    "cache_hit": false,
    "curator_version": "1.0.0",
    "llm_model": "gemini-1"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "INVALID_INPUT",
  "message": "Topic cannot be empty",
  "details": {
    "field": "topic",
    "constraint": "minLength >= 1"
  }
}
```

### 429 Too Many Requests
```json
{
  "error": "RATE_LIMITED",
  "message": "Too many requests. Please try again later.",
  "retry_after_seconds": 60
}
```

### 500 Internal Server Error (LLM Failure)
```json
{
  "error": "CURATOR_AGENT_FAILED",
  "message": "Failed to generate learning path. Please try again.",
  "details": {
    "reason": "LLM API timeout",
    "retry_possible": true
  }
}
```

---

## Performance Requirements

- **Timeout**: 30 seconds (p95)
- **Response Time**: <5 seconds (p50) if cache hit; <20 seconds (p95) if new generation

---

## Implementation Notes

1. **Caching**: Store generated paths per topic; invalidate after 30 days
2. **Session Creation**: If `session_id` omitted, generate UUID v4 and include in response
3. **Resource Ordering**: Return 2-3 resources per step (prioritize video + article pair)
4. **Fallback**: If <5 steps generated, query curator agent with refined prompt
5. **Rate Limiting**: 10 requests per session per minute; per-IP: 100 requests per minute
