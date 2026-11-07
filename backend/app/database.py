import aiosqlite
import os
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

logger = logging.getLogger("qualityloop.database")

def get_db_path() -> str:
    if os.getenv("SQLITE_DB_PATH"):
        return os.getenv("SQLITE_DB_PATH")
    if os.getenv("VERCEL"):
        return "/tmp/qualityloop.db"
    return "qualityloop.db"

DB_PATH = get_db_path()

async def get_db():
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    try:
        yield db
    finally:
        await db.close()

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS incidents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                product_name TEXT NOT NULL,
                product_id TEXT NOT NULL,
                batch_number TEXT NOT NULL,
                defect_category TEXT NOT NULL,
                severity TEXT NOT NULL,
                description TEXT NOT NULL,
                production_stage TEXT NOT NULL,
                machine TEXT,
                supplier TEXT,
                quantity_affected INTEGER NOT NULL DEFAULT 1,
                status TEXT NOT NULL DEFAULT 'Open',
                image_url TEXT,
                created_at TEXT NOT NULL
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS investigations (
                id TEXT PRIMARY KEY,
                incident_id TEXT NOT NULL,
                summary TEXT NOT NULL,
                possible_root_causes TEXT NOT NULL,
                recommendations TEXT NOT NULL,
                evidence TEXT NOT NULL,
                recalled_memories TEXT NOT NULL DEFAULT '[]',
                confidence_level TEXT NOT NULL DEFAULT 'Medium',
                created_at TEXT NOT NULL,
                FOREIGN KEY (incident_id) REFERENCES incidents (id) ON DELETE CASCADE
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS corrective_actions (
                id TEXT PRIMARY KEY,
                incident_id TEXT NOT NULL,
                action_description TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Proposed',
                outcome TEXT NOT NULL DEFAULT 'Pending verification',
                feedback TEXT,
                verified_root_cause TEXT,
                created_at TEXT NOT NULL,
                completed_at TEXT,
                FOREIGN KEY (incident_id) REFERENCES incidents (id) ON DELETE CASCADE
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS memory_events (
                id TEXT PRIMARY KEY,
                incident_id TEXT,
                event_type TEXT NOT NULL,
                operation_status TEXT NOT NULL,
                query_or_content TEXT NOT NULL,
                response_summary TEXT NOT NULL,
                latency_ms INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS synced_docs (
                doc_id TEXT PRIMARY KEY,
                synced_at TEXT NOT NULL
            )
        """)

        await db.commit()
        await seed_initial_data_if_empty(db)
        
        # Hydrate any previously persisted records from cloud bank
        try:
            await sync_from_cloud(db)
        except Exception as e:
            logger.debug(f"Initial cloud sync notice: {e}")

async def persist_entity(entity_type: str, entity_id: str, data: dict):
    """
    Persist an incident, investigation, or action to durable cloud memory bank.
    Ensures multi-container consistency across Vercel serverless functions.
    """
    try:
        from app.memory.hindsight_service import hindsight_service
        content = f"[QUALITYLOOP_STORE_{entity_type.upper()}]\n{json.dumps(data)}"
        await hindsight_service.retain(
            incident_id=entity_id,
            content=content,
            metadata={"entity_type": entity_type, "incident_id": entity_id},
            tags=["qualityloop_store", entity_type, entity_id]
        )
    except Exception as e:
        logger.warning(f"Notice: cloud persistence for {entity_type} {entity_id}: {e}")

async def sync_from_cloud(db: aiosqlite.Connection, target_incident_id: Optional[str] = None):
    """
    Restore persisted entities from Hindsight cloud documents into local SQLite.
    Runs on container startup or when an incident is not found in local SQLite.
    """
    try:
        from app.memory.hindsight_service import hindsight_service
        client = hindsight_service.get_client()
        if not client:
            return

        # Fetch recent documents from Hindsight
        docs = await client.documents.list_documents(bank_id=hindsight_service.bank_id, limit=40)
        items = getattr(docs, "items", []) or []

        for doc in items:
            tags = getattr(doc, "tags", []) or []
            if "qualityloop_store" not in tags:
                continue

            doc_id = doc.id
            cursor = await db.execute("SELECT doc_id FROM synced_docs WHERE doc_id = ?", (doc_id,))
            if await cursor.fetchone() and not target_incident_id:
                continue

            # Fetch full document text
            try:
                full_doc = await client.documents.get_document(bank_id=hindsight_service.bank_id, document_id=doc_id)
                text = getattr(full_doc, "original_text", "") or ""
                if not text.startswith("[QUALITYLOOP_STORE_"):
                    continue

                _, json_str = text.split("\n", 1)
                record = json.loads(json_str)

                if "[QUALITYLOOP_STORE_INCIDENT]" in text:
                    inc_id = record.get("id")
                    if target_incident_id and inc_id != target_incident_id:
                        continue
                    await db.execute("""
                        INSERT OR REPLACE INTO incidents (
                            id, title, product_name, product_id, batch_number, defect_category,
                            severity, description, production_stage, machine, supplier,
                            quantity_affected, status, image_url, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        record["id"], record["title"], record["product_name"], record["product_id"],
                        record["batch_number"], record["defect_category"], record["severity"],
                        record["description"], record["production_stage"], record.get("machine"),
                        record.get("supplier"), record.get("quantity_affected", 1),
                        record.get("status", "Open"), record.get("image_url"), record["created_at"]
                    ))

                elif "[QUALITYLOOP_STORE_INVESTIGATION]" in text:
                    inc_id = record.get("incident_id")
                    if target_incident_id and inc_id != target_incident_id:
                        continue
                    await db.execute("""
                        INSERT OR REPLACE INTO investigations (
                            id, incident_id, summary, possible_root_causes, recommendations,
                            evidence, recalled_memories, confidence_level, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        record["id"], record["incident_id"], record["summary"],
                        json.dumps(record["possible_root_causes"]) if isinstance(record["possible_root_causes"], list) else record["possible_root_causes"],
                        json.dumps(record["recommendations"]) if isinstance(record["recommendations"], list) else record["recommendations"],
                        json.dumps(record["evidence"]) if isinstance(record["evidence"], list) else record["evidence"],
                        json.dumps(record.get("recalled_memories", [])) if isinstance(record.get("recalled_memories"), list) else record.get("recalled_memories", "[]"),
                        record["confidence_level"], record["created_at"]
                    ))

                elif "[QUALITYLOOP_STORE_ACTION]" in text:
                    inc_id = record.get("incident_id")
                    if target_incident_id and inc_id != target_incident_id:
                        continue
                    await db.execute("""
                        INSERT OR REPLACE INTO corrective_actions (
                            id, incident_id, action_description, status, outcome, feedback, verified_root_cause, created_at, completed_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        record["id"], record["incident_id"], record["action_description"],
                        record.get("status", "Proposed"), record.get("outcome", "Pending verification"),
                        record.get("feedback"), record.get("verified_root_cause"),
                        record["created_at"], record.get("completed_at")
                    ))

                now_iso = datetime.now(timezone.utc).isoformat()
                await db.execute("INSERT OR REPLACE INTO synced_docs (doc_id, synced_at) VALUES (?, ?)", (doc_id, now_iso))
            except Exception as parse_err:
                logger.debug(f"Skipping document {doc_id}: {parse_err}")

        await db.commit()
    except Exception as e:
        logger.warning(f"Notice: cloud state sync: {e}")

async def seed_initial_data_if_empty(db: aiosqlite.Connection):
    cursor = await db.execute("SELECT COUNT(*) FROM incidents")
    row = await cursor.fetchone()
    if row and row[0] > 0:
        return

    # Seed initial realistic manufacturing incidents
    now = datetime.now(timezone.utc).isoformat()
    incidents_seed = [
        (
            "QL-001",
            "Surface scratches on casing perimeter",
            "Aluminium Housing Pro",
            "PRD-AL-100",
            "BATCH-001",
            "Surface defect",
            "Medium",
            "Multiple components have visible scratches after the finishing and packaging process on line 4.",
            "Finishing & Packaging",
            "Packaging Station 3",
            "Apex Metallurgy Ltd",
            42,
            "Resolved",
            None,
            "2026-11-01T08:30:00Z"
        ),
        (
            "QL-002",
            "Inner diameter tolerance drift (+0.08mm)",
            "Precision Shaft B2",
            "PRD-SF-204",
            "BATCH-002",
            "Dimensional defect",
            "High",
            "Bore diameter measuring 25.08mm against nominal 25.00mm +- 0.02mm specification.",
            "CNC Machining",
            "CNC Lathe #2",
            "In-house Production",
            15,
            "Resolved",
            None,
            "2026-11-02T10:15:00Z"
        ),
        (
            "QL-003",
            "Polymer housing micro-cracking under stress",
            "Control Module Enclosure",
            "PRD-EN-501",
            "BATCH-004",
            "Material defect",
            "Critical",
            "Stress fractures observed along the weld line during high-torque screw assembly.",
            "Injection Moulding",
            "Mould Machine 5",
            "Polytech Polymers",
            80,
            "Action Required",
            None,
            "2026-11-03T14:45:00Z"
        ),
        (
            "QL-004",
            "Seal failure on IP67 outer seal gasket",
            "Submersible Sensor Unit",
            "PRD-SN-90",
            "BATCH-007",
            "Assembly defect",
            "High",
            "Moisture ingress test failed at 1.5 bar on 12 units out of a sample of 50.",
            "Final Assembly",
            "Sealing Press A",
            "Viton Seals Co",
            24,
            "Open",
            None,
            "2026-11-04T09:20:00Z"
        ),
        (
            "QL-005",
            "Inconsistent matte powder-coat thickness",
            "Aluminium Housing Pro",
            "PRD-AL-100",
            "BATCH-005",
            "Surface defect",
            "Low",
            "Thickness variation between 45um and 85um causing slight color deviation under inspection lamp.",
            "Surface Coating",
            "Powder Line 1",
            "Apex Metallurgy Ltd",
            18,
            "Open",
            None,
            "2026-11-05T11:00:00Z"
        )
    ]

    await db.executemany("""
        INSERT INTO incidents (
            id, title, product_name, product_id, batch_number,
            defect_category, severity, description, production_stage,
            machine, supplier, quantity_affected, status, image_url, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, incidents_seed)

    # Add historical investigation and corrective action for QL-001 (baseline demonstration seed)
    ql001_causes = json.dumps([
        "Rough manual transfer from finishing conveyer to shipping pallets",
        "Direct component-to-component contact without buffer separators",
        "Operator handling speed exceeding standard ergonomic threshold"
    ])
    ql001_recs = json.dumps([
        {
            "id": "REC-001-A",
            "action": "Introduce corrugated foam protective separators between aluminium housings",
            "priority": "High",
            "target_stage": "Packaging Station 3",
            "expected_impact": "Eliminates metal-on-metal abrasion during stacking and pallet transit"
        },
        {
            "id": "REC-001-B",
            "action": "Conduct refresher training on SOP-PKG-402 for packing cell operators",
            "priority": "Medium",
            "target_stage": "Finishing & Packaging",
            "expected_impact": "Enforces gentle placement protocol and glove compliance"
        }
    ])
    ql001_evidence = json.dumps([
        "Microscopic review showed parallel abrasion striations consistent with friction rubbing",
        "Scratch marks matched corner geometry of adjoining inverted housing",
        "No scratches detected upstream at CNC milling exit inspection point"
    ])

    await db.execute("""
        INSERT INTO investigations (
            id, incident_id, summary, possible_root_causes, recommendations, evidence, recalled_memories, confidence_level, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "INV-QL-001",
        "QL-001",
        "Surface abrasion occurring during finishing and packing due to metal-on-metal friction.",
        ql001_causes,
        ql001_recs,
        ql001_evidence,
        "[]",
        "High",
        "2026-11-01T09:10:00Z"
    ))

    await db.execute("""
        INSERT INTO corrective_actions (
            id, incident_id, action_description, status, outcome, feedback, verified_root_cause, created_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "ACT-001",
        "QL-001",
        "Introduce corrugated foam protective separators between aluminium housings and update packing SOP",
        "Completed",
        "Successful",
        "Confirmed through subsequent 100% inspection of 200 units over next 3 production shifts. Zero scratches observed.",
        "Improper handling during packaging without protective separators between components",
        "2026-11-01T10:00:00Z",
        "2026-11-01T16:00:00Z"
    ))

    await db.commit()
