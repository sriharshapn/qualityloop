from fastapi import APIRouter, HTTPException
import aiosqlite
import os
import json
from datetime import datetime, timezone
from typing import Dict, Any

from app.memory.hindsight_service import hindsight_service
from app.agent.investigator import agent_investigator

router = APIRouter(prefix="/api/demo", tags=["demo"])
DB_PATH = os.getenv("SQLITE_DB_PATH", "qualityloop.db")

@router.post("/reset")
async def reset_demo():
    """
    Resets demo state:
    - Removes QL-009 (After-learning incident) if present.
    - Clears QL-001 corrective action outcome so it can be demonstrated from scratch.
    - Clears investigation for QL-001 and QL-009.
    """
    async with aiosqlite.connect(DB_PATH) as db:
        # Delete QL-009
        await db.execute("DELETE FROM incidents WHERE id = 'QL-009'")
        await db.execute("DELETE FROM investigations WHERE incident_id IN ('QL-001', 'QL-009')")
        await db.execute("DELETE FROM corrective_actions WHERE incident_id = 'QL-009'")
        
        # Reset QL-001 to Open state without verified corrective action
        await db.execute("UPDATE incidents SET status = 'Open' WHERE id = 'QL-001'")
        await db.execute("DELETE FROM corrective_actions WHERE incident_id = 'QL-001'")
        
        # Add fresh proposed action for QL-001
        await db.execute("""
            INSERT INTO corrective_actions (
                id, incident_id, action_description, status, outcome, feedback, verified_root_cause, created_at
            ) VALUES (
                'ACT-QL-001-1', 'QL-001',
                'Introduce protective separators between components and revise handling procedure',
                'Proposed', 'Pending verification', NULL, NULL, datetime('now')
            )
        """)

        # Log reset in memory events
        await db.execute("""
            INSERT INTO memory_events (
                id, incident_id, event_type, operation_status, query_or_content, response_summary, latency_ms, created_at
            ) VALUES (
                'EVT-DEMO-RESET', 'QL-001', 'BANK_INIT', 'SUCCESS',
                'Demo environment reset to baseline before-learning state.',
                'Ready for live side-by-side evaluation.', 10, datetime('now')
            )
        """)
        await db.commit()

    return {"status": "success", "message": "Demo state reset to Before-Learning baseline."}

@router.post("/run-before")
async def run_before_demo():
    """
    Execute Scenario 1 (Before Learning) on QL-001:
    - Queries Hindsight: no prior memory exists.
    - Agent generates generic exploratory investigation.
    """
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        # Ensure QL-001 exists in Open state
        cursor = await db.execute("SELECT * FROM incidents WHERE id = 'QL-001'")
        if not await cursor.fetchone():
            await db.execute("""
                INSERT INTO incidents (
                    id, title, product_name, product_id, batch_number, defect_category,
                    severity, description, production_stage, machine, supplier,
                    quantity_affected, status, image_url, created_at
                ) VALUES (
                    'QL-001', 'Surface scratches on casing perimeter', 'Aluminium Housing Pro',
                    'PRD-AL-100', 'BATCH-001', 'Surface defect', 'Medium',
                    'Multiple components have visible scratches after the finishing and packaging process.',
                    'Finishing & Packaging', 'Packaging Station 3', 'Apex Metallurgy Ltd',
                    42, 'Open', NULL, datetime('now')
                )
            """)
            await db.commit()

    # Run investigation with force_refresh
    investigation = await agent_investigator.investigate_incident(incident_id="QL-001", force_refresh=True)
    return {
        "scenario": "Scenario 1: Before Learning",
        "incident_id": "QL-001",
        "product": "Aluminium Housing Pro (BATCH-001)",
        "defect": "Surface scratches after finishing and packaging",
        "memory_status": "No historical experience available in Hindsight",
        "investigation": investigation
    }

@router.post("/record-learning")
async def record_learning_demo():
    """
    Execute Scenario 2 (Learning):
    - Quality engineer records verified root cause: 'Improper handling during packaging.'
    - Corrective action: 'Introduce protective separators between components and revise the handling procedure.'
    - Recorded outcome: 'Successful, confirmed through subsequent inspection.'
    - Retains experience to Hindsight!
    """
    verified_cause = "Improper handling during packaging without protective separators between components."
    action_desc = "Introduce protective corrugated foam separators between components and revise handling procedure SOP-PKG-402."
    outcome = "Successful"
    feedback = "Confirmed through subsequent 100% inspection of 200 units over next 3 production shifts. Zero scratches observed."

    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        # Update corrective action in DB
        await db.execute("""
            UPDATE corrective_actions
            SET status = 'Completed', outcome = ?, verified_root_cause = ?, feedback = ?, completed_at = datetime('now')
            WHERE incident_id = 'QL-001'
        """, (outcome, verified_cause, feedback))
        
        await db.execute("UPDATE incidents SET status = 'Resolved' WHERE id = 'QL-001'")
        await db.commit()

    # Retain to Hindsight Memory Engine
    memory_content = f"""Incident: QL-001
Product: Aluminium Housing Pro (PRD-AL-100)
Batch: BATCH-001
Defect Category: Surface defect
Defect Description: Surface scratches on casing perimeter after finishing and packaging process.
Production Stage: Finishing & Packaging
Machine: Packaging Station 3
Supplier: Apex Metallurgy Ltd
Verified Root Cause: {verified_cause}
Corrective Action: {action_desc}
Outcome: {outcome}
Engineering Notes: {feedback}"""

    retain_result = await hindsight_service.retain(
        incident_id="QL-001",
        content=memory_content,
        metadata={
            "incident_id": "QL-001",
            "product_name": "Aluminium Housing Pro",
            "defect_category": "Surface defect",
            "outcome": outcome,
            "verified_root_cause": verified_cause,
            "corrective_action": action_desc
        },
        tags=["manufacturing_defect", "surface_defect", "packaging", "QL-001"]
    )

    return {
        "status": "success",
        "message": "Experience retained into Hindsight memory bank.",
        "verified_root_cause": verified_cause,
        "corrective_action": action_desc,
        "outcome": outcome,
        "hindsight_retain_result": retain_result
    }

@router.post("/run-after")
async def run_after_demo():
    """
    Execute Scenario 3 (After Learning) on QL-009:
    - Creates similar incident QL-009 (BATCH-009, Aluminium Housing, surface scratches).
    - Recalls earlier experience from Hindsight.
    - Generates improved recommendation directly informed by retained QL-001 outcome!
    """
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        # Ensure QL-009 exists
        await db.execute("""
            INSERT OR REPLACE INTO incidents (
                id, title, product_name, product_id, batch_number, defect_category,
                severity, description, production_stage, machine, supplier,
                quantity_affected, status, image_url, created_at
            ) VALUES (
                'QL-009', 'Surface scratches on new batch housings', 'Aluminium Housing Pro',
                'PRD-AL-100', 'BATCH-009', 'Surface defect', 'Medium',
                'Similar scratches have appeared on aluminium housing components from a new production batch after packaging.',
                'Finishing & Packaging', 'Packaging Station 3', 'Apex Metallurgy Ltd',
                38, 'Open', NULL, datetime('now')
            )
        """)
        await db.commit()

    # Run investigation for QL-009 with force_refresh
    investigation = await agent_investigator.investigate_incident(incident_id="QL-009", force_refresh=True)

    return {
        "scenario": "Scenario 3: After Learning",
        "incident_id": "QL-009",
        "product": "Aluminium Housing Pro (BATCH-009)",
        "defect": "Surface scratches on new batch housings",
        "recalled_experiences": investigation.get("recalled_memories", []),
        "investigation": investigation
    }
