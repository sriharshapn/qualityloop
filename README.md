# QualityLoop – Self-Learning Manufacturing Quality Intelligence Agent

> **"Every defect teaches. Every experience improves."**

[![Hindsight Persistent Memory](https://img.shields.io/badge/Memory_Engine-Hindsight-6366f1.svg)](https://hindsight.vectorize.io)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_19_TypeScript-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38bdf8.svg)](https://tailwindcss.com/)
[![BAND Desktop](https://img.shields.io/badge/Collaboration-BAND_Desktop-black.svg)](https://www.band.ai/)

---

## 1. Project Overview

**QualityLoop** is an enterprise AI-powered manufacturing quality intelligence platform designed for Quality Control (QC) engineers. When precision manufacturing processes encounter recurring product defects (e.g., surface scratches, dimensional tolerances, polymer cracking), traditional QMS platforms merely record tickets.

QualityLoop goes further: it integrates an AI agent equipped with **persistent long-term memory powered by Hindsight**. The agent recalls relevant previous investigations, avoids repeating failed experiments, and incorporates verified corrective action outcomes into future recommendations.

---

## 2. The Problem We Solve

In modern high-speed manufacturing environments:
1. **Engineers Repeat Investigations:** When a defect resurfaces months later in a new production batch, teams start from scratch.
2. **Failed Solutions Are Re-Attempted:** Historical trial-and-error attempts are lost in static spreadsheets.
3. **Delayed Root-Cause Identification:** Valuable operational knowledge remains trapped in engineer silos.
4. **Stateless AI Assistants Fail:** Standard LLM chats lose context as soon as a conversation ends.

**QualityLoop's Solution:**
- Receives defect reports with full manufacturing context (stage, machine, supplier, batch).
- Executes genuine **Hindsight RECALL** to surface relevant past incidents and verified root causes.
- Delivers grounded, evidence-based recommendations that distinguish verified facts from hypotheses.
- When an engineer verifies a trial outcome, it executes **Hindsight RETAIN** to permanently expand the factory's collective intelligence.
- Uses **Hindsight REFLECT** to synthesize strategic quality insights across multiple production runs.

---

## 3. System Architecture

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

## 4. Hindsight Memory Integration

QualityLoop utilizes the official [`hindsight-client`](https://docs.hindsight.vectorize.io/) SDK:

### A. Memory Bank Initialization
```python
from hindsight_client import Hindsight

client = Hindsight(
    base_url=os.environ.get("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io"),
    api_key=os.environ.get("HINDSIGHT_API_KEY")
)

# Initialize dedicated factory memory bank
bank = client.create_bank(
    bank_id="qualityloop",
    name="QualityLoop Manufacturing Memory",
    mission="Retain and recall manufacturing defect investigations, verified root causes, and corrective action outcomes."
)
```

### B. Experience Retention (`retain`)
Triggered automatically whenever a QC engineer verifies an outcome as **Successful**:
```python
client.retain(
    bank_id="qualityloop",
    content="""
    Incident: QL-001
    Product: Aluminium Housing Pro (BATCH-001)
    Defect: Surface scratches on casing perimeter
    Production Stage: Finishing & Packaging
    Verified Root Cause: Improper handling during packaging without protective separators.
    Corrective Action: Introduce protective corrugated foam separators between components.
    Outcome: Successful (Confirmed by subsequent 100% inspection of 200 units).
    """,
    metadata={"incident_id": "QL-001", "outcome": "Successful"},
    tags=["manufacturing_defect", "surface_defect", "QL-001"]
)
```

### C. Contextual Experience Retrieval (`recall`)
Executed before every investigation to provide memory to the reasoning agent:
```python
recall_response = client.recall(
    bank_id="qualityloop",
    query="Manufacturing defect report: Aluminium Housing Pro surface scratches after packaging. Find verified root causes and corrective action outcomes.",
    budget="mid"
)
# Recalled experiences are parsed and passed into the agent's prompt
```

### D. Knowledge Synthesis (`reflect`)
Consolidates multiple experiences into higher-level engineering guidelines:
```python
reflect_response = client.reflect(
    bank_id="qualityloop",
    query="Analyze recurring failure patterns and successful corrective actions for surface defects across manufacturing memory."
)
print(reflect_response.text)
```

---

## 5. Quickstart & Installation

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ (Python 3.14 compatible)
- Hindsight API credentials (optional for offline testing, supported via Hindsight Cloud or local container)

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/qualityloop.git
cd qualityloop
```

### Step 2: Set Up Backend
```bash
# Create and activate virtual environment
python -m venv backend_venv
# On Windows:
backend_venv\Scripts\activate
# On macOS/Linux:
source backend_venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment variables
cp backend/.env.example backend/.env
```

Edit `backend/.env` to include your credentials:
```env
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_API_KEY=your_hindsight_api_key_here
HINDSIGHT_BANK_ID=qualityloop
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```
*(Note: If Hindsight API credentials are not yet configured, QualityLoop's built-in resilient audit engine safely executes and displays full pipeline audit logs with zero crashes).*

### Step 3: Set Up Frontend
```bash
cd frontend
npm install
```

### Step 4: Run the Application
In terminal 1 (Backend):
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Open your browser at **`http://localhost:3000`**.

---

## 6. Live Learning Demonstration Walkthrough

QualityLoop features a dedicated **Learning Demo** view (`/learning-demo`) designed for live hackathon evaluation:

1. **Step 1 – Initial Incident (Before Learning):**
   - Investigates `QL-001` (Aluminium Housing Pro, Batch 001 with surface scratches).
   - The agent consults Hindsight; memory returns empty.
   - Generates broad, generic recommendations (inspect tooling, conveyors, washing stations).
2. **Step 2 – Engineer Verifies & Retains (Learning):**
   - The engineer records the verified root cause: *"Improper handling during packaging without protective separators"* and corrective action: *"Introduce protective foam separators"*.
   - QualityLoop executes `hindsight_client.retain()`, permanently persisting the experience.
3. **Step 3 – New Similar Incident (After Learning):**
   - Investigates `QL-009` (Aluminium Housing Pro, Batch 009 with recurring surface scratches).
   - The agent queries Hindsight; recalls `QL-001`'s verified solution.
   - The investigation immediately focuses on packaging separator compliance and handling protocols, flagged with **"Informed by Learned Experience"**.
4. **Step 4 – Higher-Level Reflection:**
   - Click **"Run Hindsight Reflect"** to trigger multi-incident synthesis across all historical defect logs.

---

## 7. BAND Desktop Integration

Per hackathon guidelines, QualityLoop's development was coordinated using **BAND Desktop**:
- **Architect Agent:** Maintained the technical PRD and verified database/API schemas.
- **Frontend Agent:** Constructed the clean enterprise SaaS UI following Six Sigma industrial design principles.
- **Backend Agent:** Built the FastAPI REST routes, SQLite models, and database migration layer.
- **Hindsight Specialist Agent:** Integrated the official `hindsight-client` Python SDK and validated method signatures.
- **Reviewer / Tester Agent:** Conducted automated reproducibility testing across before/after learning workflows.

---

## 8. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts.
- **Backend:** Python 3.14, FastAPI, Uvicorn, Pydantic v2.
- **Database:** SQLite with `aiosqlite`.
- **Memory Engine:** Hindsight Client (`hindsight-client` v1.2.0).
- **Reasoning Agents:** Anthropic Claude 3.5 Sonnet & Six Sigma manufacturing heuristics.
- **Dev Tools:** Google Antigravity, BAND Desktop.

---

## 9. License

Developed for the *AI Agents That Learn Using Hindsight* Hackathon. Released under the Apache 2.0 License.
