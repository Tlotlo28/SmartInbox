from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database.db import get_db
from backend.database.tables import User, Category, ImportantAddress
from backend.models.schemas import CategoryCreate, ImportantAddressCreate

router = APIRouter(prefix="/categories", tags=["categories"])


async def get_user_or_404(user_id: str, db: AsyncSession):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/")
async def get_categories(
    user_id: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_or_404(user_id, db)

    result = await db.execute(
        select(Category).where(Category.user_id == user.id)
        .order_by(Category.created_at.asc())
    )
    categories = result.scalars().all()

    output = []
    for cat in categories:
        addr_result = await db.execute(
            select(ImportantAddress).where(ImportantAddress.category_id == cat.id)
        )
        addresses = addr_result.scalars().all()
        output.append({
            "id": cat.id,
            "name": cat.name,
            "color": cat.color,
            "addresses": [
                {
                    "id": a.id,
                    "email_address": a.email_address,
                    "label": a.label,
                }
                for a in addresses
            ]
        })

    return {"categories": output}


@router.post("/")
async def create_category(
    request: CategoryCreate,
    user_id: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_or_404(user_id, db)

    category = Category(
        user_id=user.id,
        name=request.name,
        color=request.color or "#6366f1"
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)

    return {
        "id": category.id,
        "name": category.name,
        "color": category.color,
        "addresses": []
    }


@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    user_id: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_or_404(user_id, db)

    result = await db.execute(
        select(Category).where(
            Category.id == category_id,
            Category.user_id == user.id
        )
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    await db.delete(category)
    await db.commit()
    return {"message": "Category deleted"}


@router.post("/{category_id}/addresses")
async def add_address(
    category_id: str,
    request: ImportantAddressCreate,
    user_id: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_or_404(user_id, db)

    result = await db.execute(
        select(Category).where(
            Category.id == category_id,
            Category.user_id == user.id
        )
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    address = ImportantAddress(
        user_id=user.id,
        category_id=category_id,
        email_address=request.email_address,
        label=request.label
    )
    db.add(address)
    await db.commit()
    await db.refresh(address)

    return {
        "id": address.id,
        "email_address": address.email_address,
        "label": address.label
    }


@router.delete("/addresses/{address_id}")
async def delete_address(
    address_id: str,
    user_id: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_or_404(user_id, db)

    result = await db.execute(
        select(ImportantAddress).where(
            ImportantAddress.id == address_id,
            ImportantAddress.user_id == user.id
        )
    )
    address = result.scalar_one_or_none()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    await db.delete(address)
    await db.commit()
    return {"message": "Address deleted"}