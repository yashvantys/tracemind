# TraceMind

## AI-Powered Production Debugging & Root Cause Analysis

**TraceMind — Ingest error → Find similar past incidents via pgvector → RAG + LLM gives root cause + evidence + remediation in seconds.**

Stack: **TypeScript, Fastify, PostgreSQL + pgvector, OpenAI, Redis, AWS SQS/SNS**

> **Demo uses synthetic data only.** No real customer / patient data. PII is sanitized before embedding. No secrets are committed — see `.env.example`.

**Author:** Yashvant — Senior Node.js + AI Engineer | Open to Senior AI Software Developer roles in Ahmedabad

---

## ⚡ Quick Start

```bash
# 1. Start Postgres + pgvector + Redis
docker-compose up -d

# 2. Install + run
npm install
cp .env.example .env
# Add your OPENAI_API_KEY + DATABASE_URL in .env
npx prisma migrate dev
npm run dev
```

Test it:

```bash
# 1. Create an incident (synthetic example)
curl -X POST http://localhost:3000/api/v1/incidents \
  -H "Content-Type: application/json" \
  -d '{"title":"Database connection pool exhausted","serviceName":"payment-service","environment":"production","severity":"HIGH","errorMessage":"Pool timeout after 30s","stackTrace":"..."}'

# 2. Get AI diagnosis
curl -X POST http://localhost:3000/api/v1/incidents/<id>/analyze
```

Expected: `rootCause`, `evidence`, `remediation`, `confidence`, `similarIncidents` with similarity e.g. `0.966`.

## 🎯 Problem

Production debugging often requires engineers to:

- Search through application logs
- Analyze stack traces
- Identify similar historical incidents
- Check previous fixes and runbooks
- Understand dependencies between services
- Determine the likely root cause
- Decide on remediation steps

This process can be time-consuming, especially for recurring incidents.

TraceMind aims to reduce investigation time by combining traditional incident data with semantic search, historical context, and AI-powered analysis.

---

## 💡 Solution

TraceMind currently processes incidents through the following AI-assisted debugging pipeline:

```
Production Error / Logs / Stack Trace
                │
                ▼
        Incident Ingestion
                │
                ▼
       PostgreSQL + pgvector
                │
                ▼
        Generate Embedding
                │
                ▼
        Similarity Search (threshold >0.75 + self-exclusion)
                │
                ▼
          RAG Context (sanitized + truncated)
                │
                ▼
          OpenAI LLM (with Zod validation)
                │
                ▼
   ┌─────────────────────────┐
   │ Root Cause              │
   │ Evidence                │
   │ Remediation             │
   │ Confidence              │
   └─────────────────────────┘
```

**Why this matters for AI / agent products (e.g. Medica-style lead + CRM automation):**
Same pattern — input comes in → find similar past cases → qualify against criteria → suggest next action → hand over to human. TraceMind proves the RAG + qualification + handover pattern in production-grade code.

---

## 🏗 Architecture

TraceMind currently uses a modular backend architecture.

```
               ┌──────────────────┐
               │   Client / API   │
               └────────┬─────────┘
                        │
                        ▼
               ┌──────────────────┐
               │   Fastify API    │
               │     Node.js      │
               └────────┬─────────┘
                        │
                        ▼
               ┌──────────────────┐
               │    Incident      │
               │     Module       │
               └────────┬─────────┘
                        │
           ┌─────────────┴─────────────┐
           │                           │
           ▼                           ▼
   PostgreSQL                  Embedding Service
           │                    (truncation + validation + retry)
           │                           │
           │                           ▼
           │                    OpenAI Embeddings
           │                           │
           ▼                           ▼
    pgvector ◄────────────── Embedding Storage
    HNSW index                    │
           │                       │
           ▼                       │
   Similarity Search (0.75 threshold, excludeId)
           │
           ▼
     RAG Service (injection protection + Zod)
           │
           ▼
       OpenAI LLM
           │
           ▼
Incident Diagnosis
```

### Asynchronous architecture (SHIPPED - Phase 7)

Expensive AI workloads now run in background workers:

```
Incident API
     │
     ▼
PostgreSQL
     │
     ▼
AWS SQS / SNS
     │
     ▼
Background Workers
     │
     ├── Embedding Worker (idempotent + retry + DLQ)
     │
     ├── RAG Worker
     │
     └── AI Analysis Worker
           │
           ▼
        DLQ (Dead Letter Queue)
```

---

## 🛠 Technology Stack

### Backend
- Node.js
- TypeScript
- Fastify
- Zod

### Database
- PostgreSQL 17
- pgvector 0.8.6
- Prisma ORM
- HNSW Index: `CREATE INDEX incident_embedding_hnsw ON "Incident" USING hnsw (embedding vector_cosine_ops)`

### AI / GenAI
- OpenAI API
- `text-embedding-3-small`
- 1536-dimensional embeddings (validated + NaN checked)
- Retrieval-Augmented Generation (RAG) with threshold filtering
- Vector similarity search: `1 - (embedding <=> vector)` cosine
- Prompt injection protection via XML tags
- LLM-based incident analysis with Zod validation
- Token safety: truncation + cost tracking (planned)

### Caching
- Redis *(in progress - HNSW done, caching next)*

### Event-Driven Processing (SHIPPED)
- AWS SQS - implemented
- AWS SNS - implemented
- Background workers - implemented
- Retry with exponential backoff
- Dead-letter queue strategy
- Idempotent processing

### API / Communication
- REST APIs
- Server-Sent Events *(planned)*

### Frontend
- React / Next.js dashboard in `apps/web` — **IN PROGRESS (basic dashboard, expanding)**

### DevOps / Observability
- Docker
- GitHub Actions *(planned)*
- AWS *(partial - SQS/SNS done)*
- Structured logging
- Application monitoring *(planned)*

---

## 📁 Project Structure

```
tracemind/
│
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   └── database.ts
│   │
│   ├── modules/
│   │   ├── incidents/
│   │   │   ├── incident.controller.ts
│   │   │   ├── incident.service.ts
│   │   │   ├── incident.repository.ts
│   │   │   ├── incident.routes.ts
│   │   │   ├── incident.schema.ts
│   │   │   └── incident.types.ts
│   │   │
│   │   ├── embeddings/
│   │   │   ├── embedding.service.ts
│   │   │   ├── embedding.repository.ts
│   │   │   └── embedding.types.ts
│   │   │
│   │   └── rag/
│   │       ├── rag.service.ts
│   │       ├── rag.prompt.ts
│   │       └── rag.types.ts
│   │
│   ├── middleware/
│   │   └── error.middleware.ts
│   │
│   ├── utils/
│   │   └── errors.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── apps/web/  # Next.js dashboard (in progress)
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── tests/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

# 🚀 Current Status

## Phase 1 — Backend Foundation ✅
- Fastify + TypeScript
- Environment configuration
- CORS
- Health check
- Global error handling
- Centralized application errors
- Zod validation

## Phase 2 — Database ✅
- PostgreSQL 17
- Prisma ORM
- Prisma migrations
- Docker Compose
- pgvector 0.8.6
- Incident model
- `vector(1536)` embedding column

## Phase 3 — Incident Management ✅
- Create incident
- Get incident by ID
- Update incident (with re-embedding)
- Delete incident
- Get all incidents
- Filtering
- Cursor pagination
- Invalid request handling
- Not-found handling

## Phase 4 — Semantic Search ✅ HARDENED
- OpenAI embeddings
- `text-embedding-3-small`
- 1536-dimensional embeddings (validated, NaN-checked)
- Token truncation (8191 limit safety)
- Store embeddings in pgvector
- Cosine similarity search `1 - (embedding <=> vector)`
- Configurable similarity threshold (0.75)
- Self-exclusion (`excludeId` to prevent 1.0 self-match)
- HNSW index `vector_cosine_ops`
- Retry with backoff on 429
- Similar historical incident retrieval

## Phase 5 — RAG & AI Diagnosis ✅ HARDENED
- RAG context builder
- RAG prompt with injection protection (`<current>` / `<history>` tags)
- Input sanitization + truncation (300 error, 400-800 stack/logs)
- OpenAI-powered incident analysis (`gpt-4o-mini`)
- Similarity threshold filtering to prevent RAG poisoning
- Early return if no relevant history
- Root cause analysis
- Evidence extraction
- Remediation recommendations
- AI confidence score with calibration
- Structured JSON response with Zod validation
- Incident analysis API
- Token usage logging

## Phase 6 — Performance 🔄 IN PROGRESS
- Vector indexing / HNSW optimization
- Redis caching
- Cache key strategy
- Cache invalidation
- Repeat-incident optimization
- Cost tracking dashboard

## Phase 7 — Event-Driven Processing ✅ SHIPPED
- AWS SQS integration
- AWS SNS integration
- Background workers
- Retry handling (exponential backoff)
- Dead-letter queue strategy
- Idempotent processing
- Event publishing with error isolation

## Phase 8 — Streaming 📋
- SSE endpoint
- Streaming AI responses
- Connection management
- Error handling

## Phase 9 — Frontend 🔄 IN PROGRESS
- React / Next.js application in `apps/web`
- Incident dashboard
- Incident details + AI diagnosis view
- Evidence display + similarity scores
- Remediation recommendations

## Phase 10 — Production Readiness 📋
- Authentication
- Authorization
- Rate limiting
- Structured logging
- Observability
- Token usage tracking
- LLM cost tracking
- CI/CD
- AWS deployment

---

# 🔌 API

## Health Check
```
GET /health
```
Response:
```json
{
  "status": "ok",
  "service": "tracemind"
}
```

---

## Incident APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/v1/incidents` | Create incident |
| GET | `/api/v1/incidents` | List incidents |
| GET | `/api/v1/incidents/:id` | Get incident |
| PUT | `/api/v1/incidents/:id` | Update incident |
| DELETE | `/api/v1/incidents/:id` | Delete incident |
| POST | `/api/v1/incidents/:id/analyze` | AI/RAG incident analysis |

---

## Incident Pagination

TraceMind uses cursor-based pagination for incident retrieval.
Example:
```
GET /api/v1/incidents?limit=10
```
Response:
```json
{
  "success": true,
  "data": {
    "incidents": [],
    "pagination": {
      "limit": 10,
      "hasNextPage": true,
      "nextCursor": "..."
    }
  }
}
```
Next page:
```
GET /api/v1/incidents?limit=10&cursor=...
```

---

## Incident Filtering

Supported filters include:
```
GET /api/v1/incidents?severity=HIGH
GET /api/v1/incidents?status=OPEN
GET /api/v1/incidents?serviceName=payment-service
GET /api/v1/incidents?environment=production
```
Filters can be combined with cursor pagination.

---

# 🧠 AI Diagnosis

TraceMind currently provides AI-powered incident analysis using historical incident retrieval, pgvector similarity search, RAG, and OpenAI.
Example:
```
POST /api/v1/incidents/:id/analyze
```
Response:
```json
{
  "success": true,
  "data": {
    "rootCause": "Database connection pool exhaustion",
    "evidence": [
      "The incident indicates that the database connection pool has reached its maximum capacity.",
      "Similar historical incidents show database connection exhaustion at 0.96 similarity."
    ],
    "remediation": [
      "Review database connection pool configuration.",
      "Investigate long-running database transactions.",
      "Ensure database connections are released promptly."
    ],
    "confidence": 0.9,
    "similarIncidents": [
      { "id": "...", "similarity": 0.966 },
      { "id": "...", "similarity": 0.896 }
    ]
  }
}
```

**Production hardening:**
- Only incidents >0.75 similarity included (prevents RAG poisoning)
- Self excluded from results
- Inputs sanitized and truncated
- LLM JSON validated via Zod
- Low confidence fallback when no relevant history

---

# 🔄 Backend Request Flow

```
HTTP Request
     ↓
Fastify Route
     ↓
Controller
     ↓
Zod Validation
     ↓
Service (with error isolation)
     ↓
Repository
     ↓
Prisma
     ↓
PostgreSQL + pgvector (HNSW)
```

For AI analysis:
```
HTTP Request
     ↓
Incident Controller
     ↓
RAG Service (threshold 0.75 + Zod validation)
     ↓
Embedding Service (truncation + validation + retry)
     ↓
OpenAI Embeddings (1536 dim)
     ↓
pgvector Similarity Search (HNSW + excludeId)
     ↓
RAG Context Builder (sanitized + truncated)
     ↓
OpenAI LLM (gpt-4o-mini)
     ↓
Structured AI Diagnosis (validated)
```

Async flow:
```
Incident Created -> PostgreSQL -> SQS -> Worker (Embedding + RAG) -> DLQ on failure
```

---

# 🔎 Semantic Search - Production Grade

TraceMind converts incidents into vector embeddings using OpenAI's `text-embedding-3-small`.

Each embedding contains **1536 dimensions**, validated and stored using PostgreSQL + pgvector with HNSW index.

```sql
-- Performance index
CREATE INDEX incident_embedding_hnsw
ON "Incident" USING hnsw (embedding vector_cosine_ops);
```

Example retrieval (with threshold filtering):
```
Query Incident
      ↓
Truncate (500/1000/1500 chars) + Generate 1536-dim embedding (validated)
      ↓
Cosine similarity: 1 - (embedding <=> query) + excludeId
      ↓
Filter >0.75 (RAG poisoning prevention)
      ↓
Historical incidents
```

Results:
```
PostgreSQL connection pool exhausted     0.966 ✅ included
Database connection timeout              0.896 ✅ included
Database query exceeded timeout          0.733 ❌ filtered ( <0.75 )
Inventory database unavailable           0.721 ❌ filtered
Payment provider timeout                 0.718 ❌ filtered
```

---

# 🔐 Security Considerations

TraceMind is designed with production security in mind:

- Environment variables for secrets (no hardcoding)
- Zod input validation on all routes
- **Prompt injection protection** - XML tags `<current>` / `<history>` + sanitization + truncation
- **LLM output validation** - Zod schema for structured diagnosis
- **Token safety** - Truncation to prevent token explosion + 8191 limit check
- **Embedding validation** - 1536 dim check, NaN check, empty array prevention
- **Rate limit handling** - Retry with exponential backoff on 429
- **Vector search safety** - Self-exclusion, NULL filtering, threshold filtering
- Secure database access (Prisma)
- Least-privilege AWS IAM policies (SQS/SNS)
- Protection of production logs and sensitive information
- Authentication and authorization (planned)
- API rate limiting (planned)

---

# 📈 Engineering Highlights (What makes this production-ready)

- **RAG Poisoning Prevention:** Similarity threshold 0.75 filters weak matches
- **Self-Exclusion:** `excludeId` prevents incident matching itself with 1.0
- **Prompt Injection Protection:** XML separators + sanitization
- **Token Management:** Truncation strategy prevents cost explosion
- **LLM Reliability:** Zod validation + retry logic + low-confidence fallback
- **Vector Performance:** HNSW index for pgvector cosine search
- **Async Resilience:** SQS + SNS + DLQ + idempotent workers + error isolation
- **Modular Architecture:** Fastify + TypeScript + Prisma + clean repository pattern

---

# 📌 Development Approach

TraceMind is developed incrementally.

Each feature is:
1. Designed
2. Implemented
3. Tested
4. Integrated
5. Documented

---

# 🗺 Roadmap

```
Phase 1 Backend Foundation ✅
Phase 2 PostgreSQL + pgvector ✅
Phase 3 Incident Management ✅
Phase 4 Semantic Search ✅ (HNSW + threshold + self-exclusion)
Phase 5 RAG + AI Diagnosis ✅ (hardened + Zod + injection protection)
Phase 6 Redis + Performance 🔄 (HNSW done, Redis next)
Phase 7 AWS SQS/SNS + Workers ✅ SHIPPED (SQS + DLQ + idempotent)
Phase 8 SSE Streaming 📋
Phase 9 React Dashboard 🔄 IN PROGRESS (apps/web)
Phase 10 Production Deployment 📋
```
