from fastapi import APIRouter, Depends

from app.api.v1.endpoints import connections, pipeline_runs, pipelines
from app.core.security import verify_api_key

api_router = APIRouter(dependencies=[Depends(verify_api_key)])
api_router.include_router(connections.router)
api_router.include_router(pipelines.router)
api_router.include_router(pipeline_runs.router)
