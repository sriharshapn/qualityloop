from .incidents import router as incidents_router
from .investigations import router as investigations_router
from .actions import router as actions_router
from .memory import router as memory_router
from .demo import router as demo_router
from .settings import router as settings_router

__all__ = [
    "incidents_router",
    "investigations_router",
    "actions_router",
    "memory_router",
    "demo_router",
    "settings_router"
]
