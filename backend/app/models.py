import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.database import Base

class ContentTypeEnum(str, enum.Enum):
    plain = "plain"
    markdown = "markdown"
    rich_json = "rich_json"

class RevisionModeEnum(str, enum.Enum):
    draft = "draft"
    published = "published"

class ContentEntry(Base):
    __tablename__ = "content_entries"

    key = Column(String(255), primary_key=True, index=True)
    type = Column(SQLEnum(ContentTypeEnum), nullable=False)
    current_draft = Column(Text, nullable=True)
    current_published = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(String(100), default="default")

    revisions = relationship("ContentRevision", back_populates="entry")

class ContentRevision(Base):
    __tablename__ = "content_revisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    key = Column(String(255), ForeignKey("content_entries.key"), nullable=False, index=True)
    mode = Column(SQLEnum(RevisionModeEnum), nullable=False)
    type = Column(SQLEnum(ContentTypeEnum), nullable=False)
    value = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_by = Column(String(100), default="default")

    entry = relationship("ContentEntry", back_populates="revisions")

class WizardRun(Base):
    __tablename__ = "wizard_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    wizard_id = Column(String(100), nullable=False, index=True)
    step = Column(String(10), nullable=False)
    data = Column(Text, nullable=True)  # JSON string
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
