# TraceMind

## AI-Powered Production Debugging & Root Cause Analysis

TraceMind is an AI-powered backend platform designed to help engineering teams investigate production incidents faster.

It ingests application errors, logs, and stack traces, retrieves relevant historical incidents using vector similarity search and Retrieval-Augmented Generation (RAG), and uses an LLM to generate structured debugging insights such as probable root cause, supporting evidence, and remediation recommendations.

The project is being built with a production-oriented backend architecture using **Fastify, TypeScript, PostgreSQL, pgvector, OpenAI, Redis, and AWS event-driven services**.

---

## 🎯 Problem

Production debugging often requires engineers to:

* Search through application logs
* Analyze stack traces
* Identify similar historical incidents
* Check previous fixes and runbooks
* Understand dependencies between services
* Determine the likely root cause
* Decide on remediation steps

This process can be time-consuming, especially for recurring incidents.

TraceMind aims to reduce investigation time by combining traditional incident data with semantic search, historical context, and AI-powered analysis.

---

## 💡 Solution

TraceMind currently processes incidents through the following AI-assisted debugging pipeline:

```text
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
        Similarity Search
                │
                ▼
          RAG Context
                │
                ▼
          OpenAI LLM
                │
                ▼
   ┌─────────────────────────┐
   │ Root Cause              │
   │ Evidence                │
   │ Remediation             │
   │ Confidence              │
   └─────────────────────────┘
```

---

## 🏗️ Architecture

TraceMind currently uses a modular backend architecture.

```text
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
                    │                           │
                    │                           ▼
                    │                    OpenAI Embeddings
                    │                           │
                    ▼                           ▼
              pgvector ◄────────────── Embedding Storage
                    │
                    ▼
             Similarity Search
                    │
                    ▼
               RAG Service
                    │
                    ▼
                OpenAI LLM
                    │
                    ▼
          Incident Diagnosis
```

### Planned asynchronous architecture

As the system evolves, expensive AI workloads will move to background workers:

```text
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
     ├── Embedding Worker
     │
     ├── RAG Worker
     │
     └── AI Analysis Worker
```

---

## 🛠️ Technology Stack

### Backend

* Node.js
* TypeScript
* Fastify
* Zod

### Database

* PostgreSQL 17
* pgvector 0.8.6
* Prisma ORM

### AI / GenAI

* OpenAI API
* `text-embedding-3-small`
* 1536-dimensional embeddings
* Retrieval-Augmented Generation (RAG)
* Vector similarity search
* LLM-based incident analysis

### Caching

* Redis *(planned)*

### Event-Driven Processing

* AWS SQS *(planned)*
* AWS SNS *(planned)*
* Background workers *(planned)*

### API / Communication

* REST APIs
* Server-Sent Events *(planned)*

### Frontend

* React *(planned)*

### DevOps / Observability

* Docker
* GitHub Actions *(planned)*
* AWS *(planned)*
* Structured logging
* Application monitoring *(planned)*

---

## 📁 Project Structure

```text
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
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── tests/
│
├── docker-compose.yml
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

# 🚀 Current Status

## Phase 1 — Backend Foundation

* [x] Fastify + TypeScript
* [x] Environment configuration
* [x] CORS
* [x] Health check
* [x] Global error handling
* [x] Centralized application errors
* [x] Zod validation

## Phase 2 — Database

* [x] PostgreSQL 17
* [x] Prisma ORM
* [x] Prisma migrations
* [x] Docker Compose
* [x] pgvector 0.8.6
* [x] Incident model
* [x] `vector(1536)` embedding column

## Phase 3 — Incident Management

* [x] Create incident
* [x] Get incident by ID
* [x] Update incident
* [x] Delete incident
* [x] Get all incidents
* [x] Filtering
* [x] Cursor pagination
* [x] Invalid request handling
* [x] Not-found handling

## Phase 4 — Semantic Search

* [x] OpenAI embeddings
* [x] `text-embedding-3-small`
* [x] 1536-dimensional embeddings
* [x] Store embeddings in pgvector
* [x] Cosine similarity search
* [x] Configurable similarity threshold
* [x] Configurable result limit
* [x] Similar historical incident retrieval

## Phase 5 — RAG & AI Diagnosis

* [x] RAG context builder
* [x] RAG prompt
* [x] OpenAI-powered incident analysis
* [x] Root cause analysis
* [x] Evidence extraction
* [x] Remediation recommendations
* [x] AI confidence score
* [x] Structured JSON response
* [x] Incident analysis API
* [x] Semantic historical incident retrieval

## Phase 6 — Performance

* [ ] Redis caching
* [ ] Cache key strategy
* [ ] Cache invalidation
* [ ] Repeat-incident optimization
* [ ] Vector indexing / HNSW optimization

## Phase 7 — Event-Driven Processing

* [ ] AWS SQS integration
* [ ] AWS SNS integration
* [ ] Background workers
* [ ] Retry handling
* [ ] Dead-letter queue strategy
* [ ] Idempotent processing

## Phase 8 — Streaming

* [ ] SSE endpoint
* [ ] Streaming AI responses
* [ ] Connection management
* [ ] Error handling

## Phase 9 — Frontend

* [ ] React application
* [ ] Incident dashboard
* [ ] Incident details
* [ ] AI diagnosis view
* [ ] Evidence display
* [ ] Remediation recommendations

## Phase 10 — Production Readiness

* [ ] Authentication
* [ ] Authorization
* [ ] Rate limiting
* [ ] Structured logging
* [ ] Observability
* [ ] Token usage tracking
* [ ] LLM cost tracking
* [ ] CI/CD
* [ ] AWS deployment

---

# 🔌 API

## Health Check

```http
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

| Method | Endpoint                        | Description              |
| ------ | ------------------------------- | ------------------------ |
| POST   | `/api/v1/incidents`             | Create incident          |
| GET    | `/api/v1/incidents`             | List incidents           |
| GET    | `/api/v1/incidents/:id`         | Get incident             |
| PUT    | `/api/v1/incidents/:id`         | Update incident          |
| DELETE | `/api/v1/incidents/:id`         | Delete incident          |
| POST   | `/api/v1/incidents/:id/analyze` | AI/RAG incident analysis |

---

## Incident Pagination

TraceMind uses cursor-based pagination for incident retrieval.

Example:

```http
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

```http
GET /api/v1/incidents?limit=10&cursor=...
```

The cursor uses incident ordering information to provide deterministic pagination without large database offsets.

---

## Incident Filtering

Supported filters include:

```http
GET /api/v1/incidents?severity=HIGH
```

```http
GET /api/v1/incidents?status=OPEN
```

```http
GET /api/v1/incidents?serviceName=payment-service
```

```http
GET /api/v1/incidents?environment=production
```

Filters can be combined with cursor pagination.

---

# 🧠 AI Diagnosis

TraceMind currently provides AI-powered incident analysis using historical incident retrieval, pgvector similarity search, RAG, and OpenAI.

Example:

```http
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
      "Similar historical incidents show database connection exhaustion."
    ],
    "remediation": [
      "Review database connection pool configuration.",
      "Investigate long-running database transactions.",
      "Ensure database connections are released promptly."
    ],
    "confidence": 0.9
  }
}
```

The system uses historical incidents as supporting evidence rather than treating retrieved incidents as absolute truth.

AI confidence represents the model's assessment based on the available evidence and should not be interpreted as an objective probability.

---

# 🔄 Backend Request Flow

```text
HTTP Request
     ↓
Fastify Route
     ↓
Controller
     ↓
Zod Validation
     ↓
Service
     ↓
Repository
     ↓
Prisma
     ↓
PostgreSQL
```

For AI analysis:

```text
HTTP Request
     ↓
Incident Controller
     ↓
RAG Service
     ↓
Embedding Service
     ↓
OpenAI Embeddings
     ↓
pgvector Similarity Search
     ↓
RAG Context Builder
     ↓
OpenAI LLM
     ↓
Structured AI Diagnosis
```

---

# 🔎 Semantic Search

TraceMind converts incidents into vector embeddings using OpenAI's `text-embedding-3-small` model.

Each embedding contains **1536 dimensions** and is stored using PostgreSQL + pgvector.

Example retrieval:

```text
Query Incident
      ↓
Generate 1536-dimensional embedding
      ↓
Cosine similarity
      ↓
Historical incidents
```

Example similarity results:

```text
PostgreSQL connection pool exhausted     0.966
Database connection timeout              0.896
Database query exceeded timeout          0.733
Inventory database unavailable           0.721
Payment provider timeout                 0.718
```

A configurable similarity threshold prevents weak matches from being included in the RAG context.

---

# 🔐 Security Considerations

TraceMind is designed with production security in mind:

* Environment variables for secrets
* Input validation
* Authentication and authorization *(planned)*
* API rate limiting *(planned)*
* Secure database access
* Least-privilege AWS IAM policies
* Protection of production logs and sensitive information
* LLM prompt/data handling controls

---

# 📈 Engineering Goals

TraceMind is designed to demonstrate practical backend and AI engineering concepts:

* Modular backend architecture
* Type-safe Node.js development
* REST API design
* Cursor-based pagination
* PostgreSQL database design
* pgvector and vector search
* Semantic similarity search
* RAG pipelines
* LLM integration
* Event-driven architecture
* Asynchronous processing
* Distributed system concepts
* Caching strategies
* Real-time streaming
* Cloud-native AWS architecture
* Production observability
* AI cost optimization

---

# 🎯 Project Objective

The goal is not simply to build an AI chatbot.

TraceMind is intended to demonstrate how **AI can be integrated into a production-grade backend system** to solve a real engineering problem: reducing the time required to investigate recurring production incidents.

The system combines:

```text
Traditional Backend Engineering
              +
Vector Search
              +
RAG
              +
LLM Reasoning
              +
Event-Driven Architecture
```

---

# 📌 Development Approach

TraceMind is developed incrementally.

Each feature should be:

1. Designed
2. Implemented
3. Tested
4. Integrated
5. Documented

The architecture evolves as new requirements are introduced while keeping the core system modular, maintainable, and production-oriented.

---

# 🗺️ Roadmap

```text
Phase 1
Backend Foundation
        ↓
Phase 2
PostgreSQL + pgvector
        ↓
Phase 3
Incident Management
        ↓
Phase 4
Semantic Search
        ↓
Phase 5
RAG + AI Diagnosis       ← CURRENT
        ↓
Phase 6
Redis + Performance
        ↓
Phase 7
AWS SQS/SNS + Workers
        ↓
Phase 8
SSE Streaming
        ↓
Phase 9
React Dashboard
        ↓
Phase 10
Production Deployment
```

---

