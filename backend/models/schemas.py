from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserOut(BaseModel):
    id: str
    email: str
    name: Optional[str]
    picture: Optional[str]

    class Config:
        from_attributes = True

class CategoryCreate(BaseModel):
    name: str
    color: Optional[str] = "#6366f1"

class CategoryOut(BaseModel):
    id: str
    name: str
    color: str
    created_at: datetime

    class Config:
        from_attributes = True

class ImportantAddressCreate(BaseModel):
    email_address: str
    label: Optional[str] = None
    category_id: Optional[str] = None

class ImportantAddressOut(BaseModel):
    id: str
    email_address: str
    label: Optional[str]
    category_id: Optional[str]

    class Config:
        from_attributes = True

class ReminderCreate(BaseModel):
    remind_at: datetime

class ReminderOut(BaseModel):
    id: str
    remind_at: datetime
    is_dismissed: bool
    is_snoozed: bool

    class Config:
        from_attributes = True

class ArchiveEmailRequest(BaseModel):
    gmail_message_id: str
    subject: Optional[str] = None
    sender: Optional[str] = None
    snippet: Optional[str] = None
    reminder: Optional[ReminderCreate] = None

class ArchivedEmailOut(BaseModel):
    id: str
    gmail_message_id: str
    subject: Optional[str]
    sender: Optional[str]
    snippet: Optional[str]
    archived_at: datetime
    has_reminder: bool
    reminder: Optional[ReminderOut]

    class Config:
        from_attributes = True

class EmailScanResult(BaseModel):
    gmail_message_id: str
    is_suspicious: bool
    is_sponsor: bool
    is_job: bool
    is_important: bool
    color_code: str
    reason: Optional[str]

class EmailSummaryRequest(BaseModel):
    email_body: str
    subject: Optional[str] = None

class EmailSummaryResponse(BaseModel):
    summary: str