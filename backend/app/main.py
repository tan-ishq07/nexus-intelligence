from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.logging import logger
from app.models import * # Ensure all models are registered with Base
from app.services.seed_data import seed_database_if_empty
from app.services.etl.pipeline_runner import pipeline_runner
from app.services.olap.olap_engine import olap_engine
from app.api.v1.router import api_router

def init_db():
    logger.info("Initializing NEXUS INTELLIGENCE relational persistence & warehouse schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
        # Check if warehouse tables populated, otherwise run ETL
        from app.models.warehouse_schema import FactOrders
        if db.query(FactOrders).count() == 0:
            logger.info("Populating dimensional data warehouse from raw datasets...")
            pipeline_runner.run_full_etl_pipeline()
        olap_engine.sync_views_from_database()
    except Exception as e:
        logger.warning(f"Error during warehouse auto-seed: {e}")
    finally:
        db.close()

# Initialize tables immediately so queries succeed regardless of lifespan trigger
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup check
    init_db()
    yield
    logger.info("Shutting down NEXUS INTELLIGENCE backend engine...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Tier-1 Enterprise Supply Chain Risk Intelligence & Predictive Operations Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Timing & Diagnostic Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time-Sec"] = f"{process_time:.4f}"
    response.headers["X-Nexus-Engine"] = "Core-v1.0"
    return response

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled system exception: {str(exc)} on {request.url.path}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal NEXUS Platform Exception", "error": str(exc)}
    )

# Register API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": "From fragmented supply chain data to predictive business decisions.",
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health")
def root_health():
    return {
        "status": "healthy",
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected",
        "duckdb_engine": "online"
    }
