from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from agent import CodeAgent

app = FastAPI(title="AI 3D Agent Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = CodeAgent()

class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    response: str

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    try:
        response_text = agent.run(request.prompt)
        return ChatResponse(response=response_text)
    except Exception as e:
        return ChatResponse(response=f"Error: {str(e)}")

# Example of your own custom API endpoint
@app.get("/api/custom")
def custom_api():
    return {"message": "This is your custom API endpoint!", "status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
