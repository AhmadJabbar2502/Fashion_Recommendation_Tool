from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
import bcrypt
from chatbot import Chatbot
from hashlib import sha256
from collections import deque


app = FastAPI()

mongo_client = MongoClient("mongodb+srv://AhmadJb:F6ndXplHiGRKfR56@products.btwmn.mongodb.net/")
db = mongo_client["LLMs_Project"]
users_collection = db["Users"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL (React app)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

user_messages = deque(maxlen=7)  
chatbot_responses = deque(maxlen=7) 
conversation_history = {}

chatbot = Chatbot()

class User(BaseModel):
    username: str
    password: str
    email: str

class Preferences(BaseModel):
    username: str
    email: str
    password: str
    preferredColors: list
    wearTypes: list
    fashionStyles: list
    
class UserLogin(BaseModel):
    email: str
    password: str

class ChatRequest(BaseModel):
    message: str

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password


@app.post("/register")
async def register(user: User):
    hashed_password = sha256(user.password.encode()).hexdigest()
    user_data = {
        "username": user.username,
        "password": hashed_password,
        "email": user.email,
        "preferences": {}
    }

    users_collection.insert_one(user_data)
    return {"message": "User registered successfully"}

@app.post("/login")
async def login_user(user: UserLogin):
    existing_user = users_collection.find_one({"email": user.email})
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    
    if not bcrypt.checkpw(user.password.encode('utf-8'), existing_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    
    return {"message": "Login successful!"}

@app.post("/register_with_preferences")
async def register_with_preferences(preferences: Preferences):
    # Hash password
    hashed_password = sha256(preferences.password.encode()).hexdigest()
    
    # Find user and update their preferences
    users_collection.update_one(
        {"username": preferences.username},
        {
            "$set": {
                "preferences": {
                    "colors": preferences.preferredColors,
                    "wearTypes": preferences.wearTypes,
                    "fashionStyles": preferences.fashionStyles
                },
                "password": hashed_password
            }
        }
    )
    return {"message": "User registered with preferences successfully"}

@app.post("/chatbot")
async def chatbot_endpoint(request: ChatRequest):
    user_message = request.message

    try:
        for i in range(len(user_messages)):
            conversation_history[user_messages[i]] = chatbot_responses[i]
        bot_retrieval_chain_response = chatbot.retrieval_chain(conversation_history, user_message)
        bot_response = chatbot.response_chain(user_message, bot_retrieval_chain_response, conversation_history)
        # print(user_message, bot_response)
        
        chatbot_responses.append(bot_response)
        user_messages.append(user_message)
        ids = []
        ids = chatbot.extract_by_keyword(bot_retrieval_chain_response)
        
        print(ids)
        # ids = ['67376e0cfd76308feadf7950', '67376e20fd76308feadf796d', '67376e22fd76308feadf7971', '67376dc9fd76308feadf78e1', '67376e03fd76308feadf7940', '67376e0dfd76308feadf7952']
        print(conversation_history)
        return {"response": bot_retrieval_chain_response, "ids": ids}
        # return {"response": "HI", "ids": ids}
        # return {"response": "frontend/public/logo192.png"}
    except Exception as e:
        return {"response": f"Error: {str(e)}"}
