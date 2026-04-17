from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database.db import get_db
from backend.database.tables import User, ArchivedEmail, Reminder
from backend.models.schemas import ArchiveEmailRequest, ArchivedEmailOut
from datetime import datetime
from typing import List

router = APIRouter(prefix="/archive", tags=["archive"])


async def get_user_or_404(user_id: str, db: AsyncSession):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/")
async def archive_email(
    request: ArchiveEmailRequest,
    user_id: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_or_404(user_id, db)

    existing = await db.execute(
        select(ArchivedEmail).where(
            ArchivedEmail.user_id == user.id,
            ArchivedEmail.gmail_message_id == request.gmail_message_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already archived")

    archived = ArchivedEmail(
        user_id=user.id,
        gmail_message_id=request.gmail_message_id,
        subject=request.subject,
        sender=request.sender,
        snippet=request.snippet,
        has_reminder=request.reminder is not None
    )
    db.add(archived)
    await db.flush()

    if request.reminder:
        reminder = Reminder(
            archived_email_id=archived.id,
            remind_at=request.reminder.remind_at
        )
        db.add(reminder)

    await db.commit()
    return {"message": "Email archived successfully", "id": archived.id}


@router.get("/")
async def get_archived_emails(
    user_id: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_or_404(user_id, db)

    result = await db.execute(
        select(ArchivedEmail).where(ArchivedEmail.user_id == user.id)
        .order_by(ArchivedEmail.archived_at.desc())
    )
    archived = result.scalars().all()

    output = []
    for item in archived:
        reminder_data = None
        if item.has_reminder:
            r = await db.execute(
                select(Reminder).where(Reminder.archived_email_id == item.id)
            )
            reminder_obj = r.scalar_one_or_none()
            if reminder_obj:
                reminder_data = {
                    "id": reminder_obj.id,
                    "remind_at": reminder_obj.remind_at.isoformat(),
                    "is_dismissed": reminder_obj.is_dismissed,
                    "is_snoozed": reminder_obj.is_snoozed,
                }
        output.append({
            "id": item.id,
            "gmail_message_id": item.gmail_message_id,
            "subject": item.subject,
            "sender": item.sender,
            "snippet": item.snippet,
            "archived_at": item.archived_at.isoformat(),
            "has_reminder": item.has_reminder,
            "reminder": reminder_data,
        })

    return {"archived": output}


@router.delete("/{archived_id}")
async def delete_archived_email(
    archived_id: str,
    user_id: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_or_404(user_id, db)

    result = await db.execute(
        select(ArchivedEmail).where(
            ArchivedEmail.id == archived_id,
            ArchivedEmail.user_id == user.id
        )
    )
    archived = result.scalar_one_or_none()
    if not archived:
        raise HTTPException(status_code=404, detail="Archived email not found")

    await db.delete(archived)
    await db.commit()
    return {"message": "Deleted successfully"}