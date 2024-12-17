from fastapi import FastAPI
from databases import Database
from sqlalchemy import create_engine, MetaData

from app.core.config import settings

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    yield
    await database.disconnect()

app = FastAPI(lifespan=lifespan)

# Database connection
database = Database(settings.DATABASE_URL)
metadata = MetaData()
engine = create_engine(settings.DATABASE_URL)

@app.get("/")
def read_root():
    """
    Root endpoint that returns a greeting message.
    """
    return {"Hello": "World"}