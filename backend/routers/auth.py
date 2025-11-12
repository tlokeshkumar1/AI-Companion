from fastapi import APIRouter, HTTPException, Body
from pydantic import EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime, timedelta
from utils.hashing import hash_password, verify_password
from utils.gmail_utils import send_otp_email, send_welcome_email
import random, uuid, os

from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client["ai_companion"]

router = APIRouter(prefix="/auth", tags=["Auth"])

# In-memory storage for pending users (in production, use Redis or similar)
pending_users = {}

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

    # Check if user is already in pending state
    if email in pending_users:
        raise HTTPException(status_code=400, detail="Verification already sent. Please check your email.")

    # Generate OTP
    otp = random.randint(100000, 999999)
    
    # Store user data temporarily with OTP
    pending_users[email] = {
        "user_id": str(uuid.uuid4()),
        "full_name": full_name,
        "email": email,
        "password": hash_password(password),
        "is_verified": False,
        "otp": str(otp),
        "otp_created_at": datetime.utcnow()
    }

    try:
        # Send welcome email with OTP
        await send_welcome_email(email, full_name)
        await send_otp_email(email, otp)
        return {
            "message": "Signup successful. Please check your email for the verification code.",
            "email_sent": True
        }
    except Exception as e:
        print(f"[ERROR] Email sending failed: {e}")
        # Remove user from pending if email fails
        if email in pending_users:
            del pending_users[email]
        raise HTTPException(status_code=500, detail="Failed to send verification email. Please try again.")


@router.post("/login")
async def login(email: EmailStr = Body(...), password: str = Body(...)):
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.get("is_verified"):
        raise HTTPException(status_code=403, detail="Email not verified")

    return {
        "message": "Login successful",
        "user_id": user["user_id"],
        "full_name": user["full_name"]
    }


@router.post("/forgot-password/request")
async def forgot_password_request(email: EmailStr = Body(...)):
    user = await db.users.find_one({"email": email})
    if not user:
        # For security, don't reveal if email exists or not
        return {"message": "If an account exists with this email, a password reset OTP has been sent"}

    # Generate and store OTP
    otp = str(random.randint(100000, 999999))
    await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "reset_otp": otp,
                "reset_otp_created_at": datetime.utcnow()
            }
        }
    )

    try:
        await send_otp_email(email, otp)
        return {"message": "If an account exists with this email, a password reset OTP has been sent"}
    except Exception as e:
        print(f"[ERROR] Failed to send password reset email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send password reset email")


@router.post("/forgot-password/verify")
async def verify_password_reset_otp(
    email: EmailStr = Body(...),
    otp: str = Body(...),
    new_password: str = Body(None)
):
    user = await db.users.find_one({"email": email})
    if not user:
        # For security, don't reveal if email exists or not
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # Check if OTP exists and is not expired (10 minutes)
    otp_created_at = user.get("reset_otp_created_at")
    if not otp_created_at or (datetime.utcnow() - otp_created_at) > timedelta(minutes=10):
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    # Verify OTP
    if user.get("reset_otp") != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # If new password is provided, update it
    if new_password:
        if len(new_password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
        # Check if new password is the same as the old one
        if verify_password(new_password, user["password"]):
            raise HTTPException(
                status_code=400,
                detail="New password cannot be the same as your current password"
            )
            
        await db.users.update_one(
            {"email": email},
            {
                "$set": {"password": hash_password(new_password)},
                "$unset": {"reset_otp": "", "reset_otp_created_at": ""}
            }
        )
        return {"message": "Password reset successful. You can now login with your new password."}
    
    # If no new password, just verify the OTP is valid
    return {"message": "OTP verified. You can now set a new password."}


@router.post("/email-verification")
async def email_verification(email: EmailStr = Body(...), otp: str = Body(...)):
    # Check if user exists in pending users
    if email not in pending_users:
        raise HTTPException(status_code=404, detail="No pending signup found for this email")
    
    user_data = pending_users[email]
    
    # Check if OTP exists and is not expired (10 minutes)
    otp_created_at = user_data.get("otp_created_at")
    if not otp_created_at or (datetime.utcnow() - otp_created_at) > timedelta(minutes=10):
        # Remove expired pending user
        del pending_users[email]
        raise HTTPException(status_code=400, detail="OTP has expired. Please sign up again.")

    # Verify OTP
    if user_data.get("otp") != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # Add user to database
    user_to_insert = user_data.copy()
    user_to_insert["is_verified"] = True
    # Remove OTP fields as they're no longer needed
    del user_to_insert["otp"]
    del user_to_insert["otp_created_at"]
    
    await db.users.insert_one(user_to_insert)
    
    # Remove from pending users
    del pending_users[email]
    
    return {"message": "Email verified successfully. Account created."}