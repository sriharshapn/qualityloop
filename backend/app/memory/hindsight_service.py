import os
import time
import logging
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
import aiosqlite

from hindsight_client import Hindsight
try:
    from hindsight_client_api.exceptions import UnauthorizedException, ApiException
except ImportError:
    UnauthorizedException = Exception
    ApiException = Exception

from app.database import get_db_path

logger = logging.getLogger("qualityloop.hindsight")

class HindsightMemoryService:
    def __init__(self):
        self.base_url = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io")
        self.api_key = os.getenv("HINDSIGHT_API_KEY", "").strip()
        self.bank_id = os.getenv("HINDSIGHT_BANK_ID", "qualityloop")
        self.db_path = get_db_path()
        self._client: Optional[Hindsight] = None
        self._is_initialized = False
        self._last_error: Optional[str] = None
        self._status = "unconfigured" if not self.api_key else "configured"

    def get_client(self) -> Optional[Hindsight]:
        if not self.api_key:
            return None
        if self._client is None:
            try:
                self._client = Hindsight(
                    base_url=self.base_url,
                    api_key=self.api_key
                )
            except Exception as e:
                self._last_error = str(e)
                logger.error(f"Failed to instantiate Hindsight client: {e}")
                return None
        return self._client

    def update_credentials(self, api_key: str, base_url: Optional[str] = None, bank_id: Optional[str] = None):
        """Update credentials at runtime (e.g. from Settings UI)."""
        if self._client:
            try:
                self._client.close()
            except Exception:
                pass
            self._client = None

        self.api_key = api_key.strip()
        if base_url:
            self.base_url = base_url.strip()
        if bank_id:
            self.bank_id = bank_id.strip()

        self._status = "configured" if self.api_key else "unconfigured"
        self._last_error = None
        self._is_initialized = False

    async def initialize_bank(self) -> Dict[str, Any]:
        """Ensure the QualityLoop bank exists in Hindsight."""
        client = self.get_client()
        start_time = time.time()
        
        if not client:
            status_msg = "Hindsight API key not configured. Set HINDSIGHT_API_KEY in backend/.env or Settings."
            await self._log_memory_event(
                event_type="BANK_INIT",
                operation_status="WARNING",
                query_or_content=f"Bank ID: {self.bank_id}",
                response_summary=status_msg,
                latency_ms=int((time.time() - start_time) * 1000)
            )
            return {"status": "unconfigured", "message": status_msg, "bank_id": self.bank_id}

        try:
            # Call official create_bank
            response = client.create_bank(
                bank_id=self.bank_id,
                name="QualityLoop Manufacturing Memory",
                mission="Retain and recall manufacturing defect investigations, verified root causes, and corrective action outcomes to improve quality control decisions."
            )
            latency = int((time.time() - start_time) * 1000)
            self._is_initialized = True
            self._status = "connected"
            summary = f"Memory bank '{self.bank_id}' initialized successfully on Hindsight engine."
            
            await self._log_memory_event(
                event_type="BANK_INIT",
                operation_status="SUCCESS",
                query_or_content=f"Bank: {self.bank_id} | BaseURL: {self.base_url}",
                response_summary=summary,
                latency_ms=latency
            )
            return {"status": "connected", "message": summary, "bank_id": self.bank_id}
        except Exception as e:
            latency = int((time.time() - start_time) * 1000)
            err_msg = str(e)
            # If bank already exists (HTTP 409 or similar), it is still ready
            if "already exists" in err_msg.lower() or "409" in err_msg:
                self._is_initialized = True
                self._status = "connected"
                summary = f"Memory bank '{self.bank_id}' active and verified."
                await self._log_memory_event(
                    event_type="BANK_INIT",
                    operation_status="SUCCESS",
                    query_or_content=f"Bank: {self.bank_id}",
                    response_summary=summary,
                    latency_ms=latency
                )
                return {"status": "connected", "message": summary, "bank_id": self.bank_id}
            
            self._last_error = err_msg
            self._status = "error"
            await self._log_memory_event(
                event_type="BANK_INIT",
                operation_status="FAILED",
                query_or_content=f"Bank: {self.bank_id}",
                response_summary=f"Bank initialization error: {err_msg}",
                latency_ms=latency
            )
            return {"status": "error", "message": err_msg, "bank_id": self.bank_id}

    async def retain(
        self,
        incident_id: str,
        content: str,
        metadata: Optional[Dict[str, str]] = None,
        tags: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Retain an engineering experience in Hindsight.
        Per PRD rule: Only retain when an outcome is verified.
        """
        client = self.get_client()
        start_time = time.time()

        if not client:
            latency = int((time.time() - start_time) * 1000)
            msg = f"Cannot retain to Hindsight: HINDSIGHT_API_KEY is not set. Experience logged locally for audit."
            await self._log_memory_event(
                incident_id=incident_id,
                event_type="RETAIN",
                operation_status="WARNING",
                query_or_content=content,
                response_summary=msg,
                latency_ms=latency
            )
            return {
                "success": False,
                "status": "unconfigured",
                "message": msg,
                "incident_id": incident_id
            }

        try:
            response = client.retain(
                bank_id=self.bank_id,
                content=content,
                metadata=metadata or {"incident_id": incident_id},
                tags=tags or ["manufacturing_quality", incident_id]
            )
            latency = int((time.time() - start_time) * 1000)
            summary = f"Successfully retained experience into bank '{self.bank_id}' (Doc/Operation: {getattr(response, 'id', 'OK')})"
            
            await self._log_memory_event(
                incident_id=incident_id,
                event_type="RETAIN",
                operation_status="SUCCESS",
                query_or_content=content,
                response_summary=summary,
                latency_ms=latency
            )
            return {
                "success": True,
                "status": "retained",
                "message": summary,
                "incident_id": incident_id,
                "latency_ms": latency
            }
        except Exception as e:
            latency = int((time.time() - start_time) * 1000)
            err_msg = str(e)
            await self._log_memory_event(
                incident_id=incident_id,
                event_type="RETAIN",
                operation_status="FAILED",
                query_or_content=content,
                response_summary=f"Hindsight retain failure: {err_msg}",
                latency_ms=latency
            )
            return {
                "success": False,
                "status": "error",
                "error": err_msg,
                "incident_id": incident_id
            }

    async def recall(self, query: str, incident_id: Optional[str] = None) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Recall relevant historical experiences using Hindsight.
        Returns: (results_list, status_info)
        """
        client = self.get_client()
        start_time = time.time()

        if not client:
            latency = int((time.time() - start_time) * 1000)
            msg = "Hindsight API key not configured. Recall skipped."
            await self._log_memory_event(
                incident_id=incident_id,
                event_type="RECALL",
                operation_status="WARNING",
                query_or_content=query,
                response_summary=msg,
                latency_ms=latency
            )
            return [], {"success": False, "status": "unconfigured", "message": msg}

        try:
            recall_response = client.recall(
                bank_id=self.bank_id,
                query=query,
                budget="mid"
            )
            latency = int((time.time() - start_time) * 1000)
            results = []
            
            raw_results = getattr(recall_response, "results", []) or []
            for item in raw_results:
                results.append({
                    "id": getattr(item, "id", str(uuid.uuid4())),
                    "text": getattr(item, "text", ""),
                    "context": getattr(item, "context", ""),
                    "metadata": getattr(item, "metadata", {}) or {},
                    "tags": getattr(item, "tags", []) or [],
                    "scores": getattr(item, "scores", {}) or {},
                })

            summary = f"Recalled {len(results)} relevant memories from bank '{self.bank_id}'."
            await self._log_memory_event(
                incident_id=incident_id,
                event_type="RECALL",
                operation_status="SUCCESS",
                query_or_content=query,
                response_summary=summary,
                latency_ms=latency
            )
            return results, {
                "success": True,
                "status": "success",
                "count": len(results),
                "latency_ms": latency
            }
        except Exception as e:
            latency = int((time.time() - start_time) * 1000)
            err_msg = str(e)
            await self._log_memory_event(
                incident_id=incident_id,
                event_type="RECALL",
                operation_status="FAILED",
                query_or_content=query,
                response_summary=f"Hindsight recall error: {err_msg}",
                latency_ms=latency
            )
            return [], {"success": False, "status": "error", "error": err_msg}

    async def reflect(self, query: str) -> Dict[str, Any]:
        """
        Synthesize higher-level insights across retained experiences using Hindsight.
        """
        client = self.get_client()
        start_time = time.time()

        if not client:
            latency = int((time.time() - start_time) * 1000)
            msg = "Hindsight API key not configured. Reflect skipped."
            await self._log_memory_event(
                event_type="REFLECT",
                operation_status="WARNING",
                query_or_content=query,
                response_summary=msg,
                latency_ms=latency
            )
            return {"success": False, "status": "unconfigured", "message": msg}

        try:
            reflect_response = client.reflect(
                bank_id=self.bank_id,
                query=query,
                budget="mid"
            )
            latency = int((time.time() - start_time) * 1000)
            text = getattr(reflect_response, "text", "")
            based_on = getattr(reflect_response, "based_on", []) or []

            summary = f"Reflected insight generated based on {len(based_on)} supporting facts."
            await self._log_memory_event(
                event_type="REFLECT",
                operation_status="SUCCESS",
                query_or_content=query,
                response_summary=summary,
                latency_ms=latency
            )
            return {
                "success": True,
                "status": "success",
                "text": text,
                "based_on": based_on,
                "latency_ms": latency
            }
        except Exception as e:
            latency = int((time.time() - start_time) * 1000)
            err_msg = str(e)
            await self._log_memory_event(
                event_type="REFLECT",
                operation_status="FAILED",
                query_or_content=query,
                response_summary=f"Hindsight reflect error: {err_msg}",
                latency_ms=latency
            )
            return {"success": False, "status": "error", "error": err_msg}

    async def get_service_status(self) -> Dict[str, Any]:
        has_key = bool(self.api_key)
        return {
            "configured": has_key,
            "base_url": self.base_url,
            "bank_id": self.bank_id,
            "status": self._status,
            "last_error": self._last_error,
            "is_initialized": self._is_initialized
        }

    async def _log_memory_event(
        self,
        event_type: str,
        operation_status: str,
        query_or_content: str,
        response_summary: str,
        latency_ms: int = 0,
        incident_id: Optional[str] = None
    ):
        event_id = f"EVT-{uuid.uuid4().hex[:8].upper()}"
        now = datetime.now(timezone.utc).isoformat()
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute("""
                    INSERT INTO memory_events (
                        id, incident_id, event_type, operation_status, query_or_content, response_summary, latency_ms, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (event_id, incident_id, event_type, operation_status, query_or_content[:2000], response_summary[:1000], latency_ms, now))
                await db.commit()
        except Exception as e:
            logger.error(f"Failed to record memory event in SQLite: {e}")

# Global singleton
hindsight_service = HindsightMemoryService()
