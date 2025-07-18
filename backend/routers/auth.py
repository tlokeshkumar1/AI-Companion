from fastapi import APIRouter, HTTPException, Body
from pydantic import EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from utils.hashing import hash_password, verify_password
from utils.gmail_utils import send_otp_email, send_welcome_email
import random, uuid, os

from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client["ai_companion"]

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup")
async def signup(
    full_name: str = Body(...),
    email: EmailStr = Body(...),
    password: str = Body(...),
    confirm_password: str = Body(...)
):
    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="User already exists")

    user = {
        "user_id": str(uuid.uuid4()),
        "full_name": full_name,
        "email": email,
        "password": hash_password(password)
    }

    await db.users.insert_one(user)

    try:
        await send_welcome_email(email, full_name)
    except Exception as e:
        print(f"[WARN] Email sending failed: {e}")

    return {"message": "Signup successful"}

@router.post("/login")
async def login(email: EmailStr = Body(...), password: str = Body(...)):
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "message": "Login successful", 
        "user_id": user["user_id"],
        "full_name": user["full_name"]
    }

@router.post("/forgot-password")
async def forgot_password(email: EmailStr = Body(...)):
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp = random.randint(100000, 999999)
    await send_otp_email(email, otp)
    return {"message": "OTP sent", "otp": otp}
