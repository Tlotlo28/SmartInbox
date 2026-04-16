from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.db import Base
from datetime import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    categories = relationship("Category", back_populates="user", cascade="all, delete")
    important_addresses = relationship("ImportantAddress", back_populates="user", cascade="all, delete")
    archived_emails = relationship("ArchivedEmail", back_populates="user", cascade="all, delete")


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    color = Column(String, default="#6366f1")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="categories")
    addresses = relationship("ImportantAddress", back_populates="category", cascade="all, delete")


class ImportantAddress(Base):
    __tablename__ = "important_addresses"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    category_id = Column(String, ForeignKey("categories.id"), nullable=True)
    email_address = Column(String, nullable=False)
    label = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="important_addresses")
    category = relationship("Category", back_populates="addresses")


class ArchivedEmail(Base):
    __tablename__ = "archived_emails"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    gmail_message_id = Column(String, nullable=False)
    subject = Column(String, nullable=True)
    sender = Column(String, nullable=True)
    snippet = Column(Text, nullable=True)
    archived_at = Column(DateTime, default=datetime.utcnow)
    has_reminder = Column(Boolean, default=False)

    user = relationship("User", back_populates="archived_emails")
    reminder = relationship("Reminder", back_populates="archived_email", uselist=False, cascade="all, delete")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(String, primary_key=True, default=generate_uuid)
    archived_email_id = Column(String, ForeignKey("archived_emails.id"), nullable=False)
    remind_at = Column(DateTime, nullable=False)
    is_dismissed = Column(Boolean, default=False)
    is_snoozed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    archived_email = relationship("ArchivedEmail", back_populates="reminder")