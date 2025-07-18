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
    message: str = Body(...),
    is_system_message: bool = Body(False),
    response: str = Body(None),
    message_id: str = Body(None)
):
    chat_id = f"{user_id}_{bot_id}"
    
    # If it's a system message (like bot's first message), store it directly
    if is_system_message and response:
        await db.chats.insert_one({
            "chat_id": chat_id,
            "user_id": user_id,
            "bot_id": bot_id,
            "message": message,  # Empty for system messages
            "response": response,
            "is_system_message": True,
            "message_id": message_id or str(uuid.uuid4()),
            "timestamp": datetime.utcnow()
        })
        return {"status": "success", "message": "System message stored"}
    
    # Normal user message flow
    with open("bots_data.json", "r") as f:
        bots = json.load(f)
    bot = next((b for b in bots if b["bot_id"] == bot_id), None)
    if not bot:
        return {"status": "error", "message": "Bot not found"}

    response = await chat_with_bot(bot, message, chat_id)

    await db.chats.insert_one({
        "chat_id": chat_id,
        "user_id": user_id,
        "bot_id": bot_id,
        "message": message,
        "response": response,
        "message_id": message_id or str(uuid.uuid4()),
        "timestamp": datetime.utcnow()
    })

    return {"status": "success", "response": response}

@router.get("/history")
async def get_chat_history(user_id: str, bot_id: str):
    try:
        chat_id = f"{user_id}_{bot_id}"
        # Convert MongoDB cursor to list of dicts and handle ObjectId serialization
        history = []
        async for doc in db.chats.find({"chat_id": chat_id}).sort("timestamp", 1):
            # Convert ObjectId to string
            doc["_id"] = str(doc["_id"])
            # Convert datetime to ISO format string
            if "timestamp" in doc:
                doc["timestamp"] = doc["timestamp"].isoformat()
            history.append(doc)
        return {"status": "success", "data": history}
    except Exception as e:
        print(f"Error in get_chat_history: {str(e)}")  # Add logging
        return {"status": "error", "message": str(e)}

@router.delete("/restart")
async def restart_chat(user_id: str, bot_id: str):
    chat_id = f"{user_id}_{bot_id}"
    await db.chats.delete_many({"chat_id": chat_id})
