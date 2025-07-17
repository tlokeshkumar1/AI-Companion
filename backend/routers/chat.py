from fastapi import APIRouter, Body
from motor.motor_asyncio import AsyncIOMotorClient
from utils.langchain_utils import chat_with_bot
from datetime import datetime
import uuid, os, json
from dotenv import load_dotenv
load_dotenv()

router = APIRouter(prefix="/chat", tags=["Chat"])

client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
db = client["ai_companion"]

@router.post("/ask")
async def ask(
    user_id: str = Body(...),
    bot_id: str = Body(...),
    message: str = Body(...)
):
    chat_id = f"{user_id}_{bot_id}"

    with open("bots_data.json", "r") as f:
        bots = json.load(f)
    bot = next((b for b in bots if b["bot_id"] == bot_id), None)
    if not bot:
        return {"error": "Bot not found"}

    response = await chat_with_bot(bot, message, chat_id)

    await db.chats.insert_one({
        "chat_id": chat_id,
        "user_id": user_id,
        "bot_id": bot_id,
        "message": message,
        "response": response,
        "timestamp": datetime.utcnow()
    })

    return {"response": response}

@router.get("/history")
async def get_chat_history(user_id: str, bot_id: str):
    chat_id = f"{user_id}_{bot_id}"
    history = await db.chats.find({"chat_id": chat_id}).to_list(None)
    return history

@router.delete("/restart")
async def restart_chat(user_id: str, bot_id: str):
    chat_id = f"{user_id}_{bot_id}"
    await db.chats.delete_many({"chat_id": chat_id})
    return {"message": "Chat restarted"}
