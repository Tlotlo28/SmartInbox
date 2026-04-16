from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database.db import get_db
from backend.database.tables import User
from backend.services.gmail_service import get_authorization_url, exchange_code_for_tokens
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/auth", tags=["auth"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@router.get("/login")
async def login():
    auth_url, state = get_authorization_url()
    return {"auth_url": auth_url, "state": state}


@router.get("/callback")
async def callback(code: str, state: str = None, db: AsyncSession = Depends(get_db)):
    try:
        tokens = await exchange_code_for_tokens(code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {str(e)}")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {tokens['access_token']}"}
        )
        user_info = response.json()

    email = user_info.get("email")
    name = user_info.get("name")
    picture = user_info.get("picture")

    if not email:
        raise HTTPException(status_code=400, detail="Could not retrieve email from Google")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user:
        user.access_token = tokens["access_token"]
        user.refresh_token = tokens.get("refresh_token", user.refresh_token)
        user.name = name
        user.picture = picture
    else:
        user = User(
            email=email,
            name=name,
            picture=picture,
            access_token=tokens["access_token"],
            refresh_token=tokens.get("refresh_token")
        )
        db.add(user)

    await db.commit()
    await db.refresh(user)

    return RedirectResponse(
        url=f"{FRONTEND_URL}/inbox?user_id={user.id}"
    )


@router.get("/user/{user_id}")
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture
    }


@router.post("/logout/{user_id}")
async def logout(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user:
        user.access_token = None
        await db.commit()

    return {"message": "Logged out successfully"}