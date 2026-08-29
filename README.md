# TraceMind

**AI-Powered Production Debugging & Root Cause Analysis**

TraceMind is an AI-powered backend platform designed to help engineering teams investigate production incidents faster.

It ingests application errors, logs, and stack traces, retrieves relevant historical incidents using Retrieval-Augmented Generation (RAG), and uses an LLM to generate structured debugging insights such as probable root cause, supporting evidence, severity, and remediation recommendations.

The project is being built with a production-oriented backend architecture using **Fastify, TypeScript, PostgreSQL, pgvector, Redis, OpenAI, and AWS event-driven services**.

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

TraceMind aims to reduce this investigation time by combining traditional observability data with AI-powered retrieval and analysis.

---

## 💡 Solution

TraceMind processes production incidents through an AI-assisted debugging pipeline:

```text
Production Error / Logs / Stack Trace
                │
                ▼
        Incident Ingestion
                │
                ▼
        Event Processing
                │
                ▼
       Generate Embeddings
                │
                ▼
      PostgreSQL + pgvector
                │
                ▼
         RAG Retrieval
                │
                ▼
          LLM Analysis
                │
                ▼
   ┌─────────────────────────┐
   │ Root Cause Hypothesis   │
   │ Evidence                │
   │ Severity                │
   │ Remediation             │
   └─────────────────────────┘
                │
                ▼
          SSE Response
                │
                ▼
          Developer UI
```

---

## 🏗️ Architecture

TraceMind starts as a modular backend and is designed so asynchronous workloads can be separated into independent workers as the system grows.

```text
                         ┌──────────────────┐
                         │   React Client   │
                         └────────┬─────────┘
                                  │
                              HTTP / SSE
                                  │
                         ┌────────▼─────────┐
                         │   Fastify API    │
                         │   Node.js        │
                         └────────┬─────────┘
                                  │
              ┌───────────────────┼──────────────────┐
              │                   │                  │
              ▼                   ▼                  ▼
        Incident Module         Redis           AI Module
              │                                      │
              │                                      ▼
              │                                 OpenAI API
              │
              ▼
       PostgreSQL + pgvector
              │
              ▼
        RAG Retrieval
```

Asynchronous processing:

```text
             Incident API
                  │
                  ▼
              AWS SQS/SNS
                  │
                  ▼
           Background Worker
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
    Embedding   RAG      AI Analysis
     Worker    Worker      Worker
```

---

## 🛠️ Technology Stack

### Backend

* Node.js
* TypeScript
* Fastify
* Zod

### Database

* PostgreSQL
* pgvector
* Prisma ORM

### AI / GenAI

* OpenAI API
* Embeddings
* Retrieval-Augmented Generation (RAG)
* Vector similarity search
* LLM-based incident analysis

### Caching

* Redis

### Event-Driven Processing

* AWS SQS
* AWS SNS
* Background workers

### API / Communication

* REST APIs
* Server-Sent Events (SSE)

### Frontend

* React
* TypeScript

### DevOps / Observability

* Docker
* GitHub Actions
* AWS
* Structured logging
* Application monitoring

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
│   │   │   └── embedding.types.ts
│   │   │
│   │   ├── rag/
│   │   │   ├── rag.service.ts
│   │   │   ├── rag.repository.ts
│   │   │   └── rag.types.ts
│   │   │
│   │   ├── ai/
│   │   │   ├── ai.service.ts
│   │   │   ├── prompt.service.ts
│   │   │   └── ai.types.ts
│   │   │
│   │   ├── cache/
│   │   │   └── cache.service.ts
│   │   │
│   │   └── events/
│   │       ├── publisher.ts
│   │       ├── consumer.ts
│   │       └── event.types.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── utils/
│   │   ├── logger.ts
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
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Current Status

### Phase 1 — Backend Foundation

- [x] Fastify + TypeScript
- [x] Environment configuration
- [x] CORS
- [x] Health check
- [x] Global error handling

### Phase 2 — Database

- [x] PostgreSQL 17
- [x] Prisma ORM
- [x] Prisma migrations
- [x] Docker Compose
- [x] pgvector 0.8.6
- [x] Incident model
- [x] `vector(1536)` embedding column

### Phase 3 — Incident Management

- [x] Create incident
- [x] Get incident by ID
- [x] Update incident
- [x] Delete incident
- [x] Get all incidents
- [x] Filtering
- [x] Cursor pagination

### Phase 4 — Semantic Search

- [x] OpenAI embeddings
- [x] `text-embedding-3-small`
- [x] 1536-dimensional embeddings
- [x] Store embeddings in pgvector
- [x] Cosine similarity search
- [x] Configurable similarity threshold
- [x] Configurable result limit
- [x] Similar incident retrieval

### Phase 5 — AI Analysis

* [ ] OpenAI integration
* [ ] Prompt engineering
* [ ] Structured AI response
* [ ] Root-cause hypothesis
* [ ] Evidence extraction
* [ ] Remediation recommendations
* [ ] Severity classification

### Phase 6 — Performance

* [ ] Redis caching
* [ ] Cache key strategy
* [ ] Cache invalidation
* [ ] Repeat-incident optimization

### Phase 7 — Event-Driven Processing

* [ ] AWS SQS integration
* [ ] AWS SNS integration
* [ ] Background workers
* [ ] Retry handling
* [ ] Dead-letter queue strategy
* [ ] Idempotent processing

### Phase 8 — Streaming

* [ ] SSE endpoint
* [ ] Streaming AI responses
* [ ] Connection management
* [ ] Error handling

### Phase 9 — Frontend

* [ ] React application
* [ ] Incident dashboard
* [ ] Incident details
* [ ] AI diagnosis view
* [ ] Evidence display
* [ ] Remediation recommendations

### Phase 10 — Production Readiness

* [ ] Authentication
* [ ] Authorization
* [ ] Rate limiting
* [ ] Structured logging
* [ ] Observability
* [ ] Token usage tracking
* [ ] LLM cost tracking
* [ ] Docker
* [ ] CI/CD
* [ ] AWS deployment

---

## 🔌 Initial API

### Health Check

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
### Create Incident

POST /api/v1/incidents
Content-Type: application/json

Request:

{
  "serviceName": "payment-service",
  "environment": "production",
  "errorMessage": "Database connection timeout",
  "stackTrace": "Error: connection timeout",
  "logs": "Connection pool exhausted"
}
### Get Incident
GET /api/v1/incidents/:id

Returns the incident stored in PostgreSQL.


### Add a Backend Architecture section

This is useful for interviews:

```markdown
## 🔄 Backend Request Flow

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


More APIs will be added incrementally as each module is implemented.

---

## 🧠 AI Diagnosis

A future TraceMind diagnosis will provide structured information such as:

```json
{
  "severity": "HIGH",
  "rootCause": "Database connection pool exhaustion",
  "confidence": 0.91,
  "evidence": [
    "Repeated connection timeout errors",
    "Similar incident resolved previously",
    "Database pool reached configured maximum"
  ],
  "recommendations": [
    "Review connection pool configuration",
    "Check long-running database transactions",
    "Inspect database connection utilization"
  ]
}
```

The system will distinguish between **retrieved evidence** and **LLM-generated hypotheses** so that engineers can understand why a diagnosis was produced.

---

## 🔐 Security Considerations

TraceMind is designed with production security in mind:

* Environment variables for secrets
* Authentication and authorization
* Input validation
* API rate limiting
* Secure database access
* Least-privilege AWS IAM policies
* Protection of production logs and sensitive information
* LLM prompt/data handling controls

---

## 📈 Engineering Goals

TraceMind is designed to demonstrate practical backend and AI engineering concepts:

* Modular backend architecture
* Type-safe Node.js development
* REST API design
* Event-driven architecture
* Asynchronous processing
* Vector databases
* RAG pipelines
* LLM integration
* Distributed system concepts
* Caching strategies
* Real-time streaming
* Cloud-native AWS architecture
* Production observability
* AI cost optimization

---

## 🎯 Project Objective

The goal is not simply to build an AI chatbot.

TraceMind is intended to demonstrate how **AI can be integrated into a production-grade backend system** to solve a real engineering problem: reducing the time required to investigate recurring production incidents.

---

## 📌 Development Approach

TraceMind will be developed incrementally.

Each feature should be:

1. Designed
2. Implemented
3. Tested
4. Integrated
5. Documented

The architecture will evolve as new requirements are introduced while keeping the core system modular and maintainable.

---

## 📄 License

This project is currently intended as a personal engineering and portfolio project.
