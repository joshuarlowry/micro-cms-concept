from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ContentTypeEnum(str, Enum):
    plain = "plain"
    markdown = "markdown"
    rich_json = "rich_json"

class RevisionModeEnum(str, Enum):
    draft = "draft"
    published = "published"

class ContentCreate(BaseModel):
    type: ContentTypeEnum
    value: str

    @field_validator("value")
    def validate_value_size(cls, v, info):
        content_type = info.data.get("type")

        # Size limits
        if content_type == ContentTypeEnum.plain and len(v) > 2000:
            raise ValueError("Plain text content cannot exceed 2000 characters")
        elif content_type == ContentTypeEnum.markdown and len(v) > 50000:
            raise ValueError("Markdown content cannot exceed 50000 characters")
        elif content_type == ContentTypeEnum.rich_json and len(v) > 50000:
            raise ValueError("Rich JSON content cannot exceed 50000 characters")

        return v

class ContentUpdate(BaseModel):
    type: ContentTypeEnum
    value: str

class ContentRevisionSchema(BaseModel):
    id: str
    key: str
    mode: RevisionModeEnum
    type: ContentTypeEnum
    value: str
    created_at: datetime
    created_by: str

    class Config:
        from_attributes = True

class ContentResponseItem(BaseModel):
    type: ContentTypeEnum
    value: Optional[str] = None

class PublishRequest(BaseModel):
    value: Optional[str] = None

class RestoreRequest(BaseModel):
    target_mode: RevisionModeEnum

class WizardRunSchema(BaseModel):
    id: str
    wizard_id: str
    step: str
    data: Optional[str] = None
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WizardRunCreate(BaseModel):
    wizard_id: str
    step: str
    data: Optional[str] = None
    completed: bool = False
