from fastapi import APIRouter

from app.api.v1.endpoints import connections, pipeline_runs, pipelines

api_router = APIRouter()
api_router.include_router(connections.router)
api_router.include_router(pipelines.router)
api_router.include_router(pipeline_runs.router)
