from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database.db import get_db
from backend.database.tables import User
from backend.services.gmail_service import fetch_emails, fetch_single_email, build_gmail_service
from backend.models.schemas import EmailSummaryRequest, EmailSummaryResponse
from dotenv import load_dotenv
import os

load_dotenv(os.path.join(os.path.dirname(__file__), "../../backend/.env"))

router = APIRouter(prefix="/emails", tags=["emails"])


async def get_user_or_404(user_id: str, db: AsyncSession):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.access_token:
        raise HTTPException(status_code=401, detail="User not authenticated with Gmail")
    return user


@router.get("/")
async def get_emails(
    user_id: str = Query(...),
    max_results: int = Query(default=30),
    page_token: str = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_or_404(user_id, db)
    try:
        emails, next_page_token = fetch_emails(
            access_token=user.access_token,
            refresh_token=user.refresh_token,
            max_results=max_results,
            page_token=page_token
        )
        return {
            "emails": emails,
            "next_page_token": next_page_token
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch emails: {str(e)}")


@router.get("/{message_id}")
async def get_single_email(
    message_id: str,
    user_id: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_or_404(user_id, db)
    try:
        service = build_gmail_service(user.access_token, user.refresh_token)
        email = fetch_single_email(service, message_id)
        if not email:
            raise HTTPException(status_code=404, detail="Email not found")
        return email
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch email: {str(e)}")


@router.post("/summarize", response_model=EmailSummaryResponse)
async def summarize_email(request: EmailSummaryRequest):
    from groq import Groq

    api_key = os.getenv("GROQ_API_KEY")
    print(f"DEBUG: GROQ_API_KEY loaded = {api_key[:10] if api_key else 'NONE'}")

    if not api_key:
        raise HTTPException(status_code=500, detail="Groq API key not configured")

    client = Groq(api_key=api_key)

    prompt = f"""Summarize the following email in exactly 2 clear sentences. Be concise and capture the main point and any action required.

Subject: {request.subject or 'No subject'}

Email content:
{request.email_body[:3000]}

Summary:"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.3,
        )
        summary = response.choices[0].message.content.strip()
        return {"summary": summary}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")