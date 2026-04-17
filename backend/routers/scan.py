from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database.db import get_db
from backend.database.tables import User
from backend.services.gmail_service import fetch_emails, fetch_single_email, build_gmail_service
from backend.services.classifier import classify_email

router = APIRouter(prefix="/scan", tags=["scan"])


async def get_user_or_404(user_id: str, db: AsyncSession):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/single")
async def scan_single_email(
    message_id: str = Query(...),
    user_id: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_or_404(user_id, db)
    try:
        service = build_gmail_service(user.access_token, user.refresh_token)
        email = fetch_single_email(service, message_id)
        if not email:
            raise HTTPException(status_code=404, detail="Email not found")
        result = classify_email(email)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@router.post("/inbox")
async def scan_inbox(
    user_id: str = Query(...),
    max_results: int = Query(default=30),
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_or_404(user_id, db)
    try:
        emails, _ = fetch_emails(
            access_token=user.access_token,
            refresh_token=user.refresh_token,
            max_results=max_results
        )
        results = []
        for email in emails:
            result = classify_email(email)
            results.append(result)
        return {
            "total": len(results),
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inbox scan failed: {str(e)}")