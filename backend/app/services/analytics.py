import os
import aiosqlite
from typing import Dict, Any, List

DB_PATH = os.getenv("SQLITE_DB_PATH", "qualityloop.db")

async def get_dashboard_stats() -> Dict[str, Any]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row

        # Total, Open, Resolved counts
        cursor = await db.execute("SELECT COUNT(*) FROM incidents")
        total_incidents = (await cursor.fetchone())[0]

        cursor = await db.execute("SELECT COUNT(*) FROM incidents WHERE status IN ('Open', 'Investigating', 'Action Required')")
        open_incidents = (await cursor.fetchone())[0]

        cursor = await db.execute("SELECT COUNT(*) FROM incidents WHERE status = 'Resolved'")
        resolved_incidents = (await cursor.fetchone())[0]

        # Recurring defects: count of defect categories that appear more than once
        cursor = await db.execute("""
            SELECT defect_category, COUNT(*) as cnt 
            FROM incidents 
            GROUP BY defect_category 
            HAVING cnt > 1
        """)
        recurring_categories = await cursor.fetchall()
        recurring_defects_count = sum(r["cnt"] for r in recurring_categories)

        # Retained experiences: count of successful/verified corrective actions and retained memory events
        cursor = await db.execute("SELECT COUNT(*) FROM corrective_actions WHERE outcome = 'Successful'")
        retained_experiences_count = (await cursor.fetchone())[0]

        # Defect category distribution
        cursor = await db.execute("""
            SELECT defect_category as name, COUNT(*) as count 
            FROM incidents 
            GROUP BY defect_category 
            ORDER BY count DESC
        """)
        category_rows = await cursor.fetchall()
        categories_data = [dict(r) for r in category_rows]

        # Recent incidents
        cursor = await db.execute("""
            SELECT id, title, product_name, product_id, batch_number, defect_category,
                   severity, status, quantity_affected, created_at
            FROM incidents
            ORDER BY created_at DESC
            LIMIT 6
        """)
        recent_rows = await cursor.fetchall()
        recent_incidents = [dict(r) for r in recent_rows]

        # Recent memory activity
        cursor = await db.execute("""
            SELECT id, incident_id, event_type, operation_status, query_or_content, response_summary, latency_ms, created_at
            FROM memory_events
            ORDER BY created_at DESC
            LIMIT 5
        """)
        memory_rows = await cursor.fetchall()
        recent_memory_events = [dict(r) for r in memory_rows]

        # Defect trend (mockable aggregate by stage or date)
        cursor = await db.execute("""
            SELECT production_stage as stage, COUNT(*) as count,
                   SUM(CASE WHEN severity = 'Critical' OR severity = 'High' THEN 1 ELSE 0 END) as high_severity
            FROM incidents
            GROUP BY production_stage
        """)
        stage_rows = await cursor.fetchall()
        stage_trends = [dict(r) for r in stage_rows]

        return {
            "total_incidents": total_incidents,
            "open_incidents": open_incidents,
            "resolved_incidents": resolved_incidents,
            "recurring_defects": recurring_defects_count,
            "retained_experiences": retained_experiences_count,
            "categories": categories_data,
            "recent_incidents": recent_incidents,
            "recent_memory_events": recent_memory_events,
            "stage_trends": stage_trends
        }
