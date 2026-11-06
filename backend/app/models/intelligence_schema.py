from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base

class DiscoveredInsight(Base):
    __tablename__ = "discovered_insights"

    id = Column(String(64), primary_key=True, index=True)
    category = Column(String(64), nullable=False, index=True) # CLUSTER, ASSOCIATION_RULE, ANOMALY, DEMAND_SHIFT, SUPPLIER_RISK, GEOSPATIAL
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(32), default="MEDIUM", index=True) # LOW, MEDIUM, HIGH, CRITICAL
    lifecycle_state = Column(String(32), default="NEW", index=True) # NEW, UNDER_REVIEW, ACKNOWLEDGED, RESOLVED
    confidence_score = Column(Float, default=0.85)
    evidence_payload = Column(Text, nullable=True) # JSON payload containing feature drivers, metrics, z-scores
    recommended_action = Column(Text, nullable=True)
    discovered_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    reviewed_by = Column(String(128), nullable=True)

class KddRunLog(Base):
    __tablename__ = "kdd_run_logs"

    id = Column(String(64), primary_key=True, index=True)
    pipeline_name = Column(String(128), nullable=False)
    target_dataset = Column(String(128), nullable=False)
    mining_task = Column(String(128), nullable=False)
    parameters = Column(Text, nullable=True) # JSON
    status = Column(String(32), default="COMPLETED")
    stages_detail = Column(Text, nullable=False) # JSON list of 7 KDD stages
    summary_findings = Column(Text, nullable=True)
    duration_ms = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SavedModelRecord(Base):
    __tablename__ = "saved_model_registry"

    id = Column(String(64), primary_key=True, index=True)
    task_type = Column(String(64), nullable=False, index=True)
    algorithm = Column(String(64), nullable=False)
    hyperparameters = Column(Text, nullable=True)
    metrics = Column(Text, nullable=False) # JSON metrics (accuracy, f1, precision, recall, rmse, etc.)
    feature_names = Column(Text, nullable=True) # JSON array
    file_path = Column(String(255), nullable=False)
    dataset_rows = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
