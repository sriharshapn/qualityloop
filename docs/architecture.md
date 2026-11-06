# QualityLoop Architecture Document

## Overview
QualityLoop is an enterprise AI-powered manufacturing quality intelligence platform that helps quality control (QC) teams investigate recurring product defects and continuously learn from previous investigations using **Hindsight persistent memory**.

Tagline: *Every defect teaches. Every experience improves.*

---

## 1. High-Level Architecture Diagram

```
                             +-----------------------------+
                             |   QUALITY CONTROL ENGINEER  |
                             +--------------+--------------+
                                            |
                                            v
                             +-----------------------------+
                             |       REACT FRONTEND        |
                             |  TypeScript + Tailwind CSS  |
                             |      Port: 3000 (Vite)      |
                             +--------------+--------------+
                                            |  REST API / JSON
                                            v
                             +-----------------------------+
                             |       FASTAPI BACKEND       |
                             |   Python 3.14 + Uvicorn     |
                             |         Port: 8000          |
                             +------+---------------+------+
                                    |               |
             +----------------------+               +----------------------+
             |                                                             |
             v                                                             v
+-------------------------+                               +---------------------------------+
|     APPLICATION DB      |                               |      AI INVESTIGATION AGENT     |
|   SQLite (aiosqlite)    |                               |  Autonomous Domain Reasoning    |
|                         |                               |  & LLM Orchestration            |
| - Incidents             |                               +----------------+----------------+
| - Investigations        |                                                |
| - Corrective Actions    |                               +----------------+----------------+
| - Memory Events Audit   |                               |                                 |
+-------------------------+                               v                                 v
                                              +-----------------------+         +-----------------------+
                                              |    HINDSIGHT ENGINE   |         |     LLM PROVIDER      |
                                              |   Persistent Memory   |         |  Anthropic Claude /   |
                                              | - Retain (Stores)     |         |  High-Precision Six   |
                                              | - Recall (Retrieves)  |         |  Sigma Heuristics     |
                                              | - Reflect (Synthesizes|         +-----------------------+
                                              +-----------------------+
```

---

## 2. Core Subsystems

### 2.1 Frontend Subsystem (`/frontend`)
- **Framework:** React 19 + TypeScript + Vite.
- **Styling:** Tailwind CSS with an industrial enterprise theme (Inter typography, #101827 dark sidebar, #F7F8FA background, #4169E1 royal blue accent, and #715CE5 electric indigo AI accent).
- **Visualization:** Recharts for defect category breakdown, stage risk distributions, and trend analysis.
- **Components:**
  - `AppSidebar`: Fixed navigation with brand identity (loop + checkmark logo).
  - `TopNavbar`: Breadcrumb tracking, global search, and real-time Hindsight status badge.
  - `HistoricalMemoryCard`: Dedicated visual card marked *"Retrieved from Hindsight"* highlighting prior incident reference, verified root causes, corrective actions, and relevance rationale.
  - `RecommendationCard`: Grounded in memory indicators and priority classifications.
  - `LearningTimeline`: Live audit feed of all Hindsight API calls (`RETAIN`, `RECALL`, `REFLECT`) with latency and payload inspection.

### 2.2 Backend Subsystem (`/backend`)
- **Framework:** FastAPI with asynchronous request handling.
- **Database:** SQLite via `aiosqlite` for application state, defect records, and audit logs.
- **Routers:**
  - `/api/incidents`: Defect intake, filtering, and retrieval.
  - `/api/investigations`: Agent orchestration, defect context ingestion, and investigation persistence.
  - `/api/actions`: Corrective action lifecycle management. **Crucial:** Setting an action outcome to `Successful` automatically executes Hindsight `retain()`.
  - `/api/memory`: Direct Hindsight bank health status, event inspection, and manual recall/reflect testing.
  - `/api/demo`: Reproducible state machine for live hackathon demonstration (`reset`, `run-before`, `record-learning`, `run-after`).
  - `/api/settings`: Live configuration of Hindsight Cloud/Local URLs and API keys.

### 2.3 Persistent Memory Engine (Hindsight)
Hindsight powers the agent's long-term memory:
- **Memory Bank:** `qualityloop`
- **Operations:**
  - `RETAIN`: Persists structured engineering experiences (defect description, machine, stage, verified root cause, corrective action, and validated outcome).
  - `RECALL`: Automatically queries memory bank when a new defect is reported to retrieve matching failure patterns and past outcomes.
  - `REFLECT`: Periodically synthesizes cross-incident observations into high-level lessons learned (e.g. identifying systematic handling vulnerabilities during packaging).

---

## 3. Collaboration with BAND Desktop
Per hackathon requirements, the QualityLoop development workflow incorporates **BAND Desktop** to coordinate autonomous coding agents:
- **Architect Agent:** Maintained the PRD implementation plan and interface contracts.
- **Frontend Agent:** Implemented the enterprise React design system and interactive demonstration views.
- **Backend Agent:** Built FastAPI endpoints, SQLite data models, and business logic.
- **Hindsight Specialist Agent:** Validated the official `hindsight-client` SDK, verified bank schemas, and implemented retain/recall/reflect workflows.
- **Tester / Reviewer Agent:** Verified end-to-end learning reproducibility, error handling, and demo scripts.
