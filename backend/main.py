from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS middleare to app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

@app.post("/explain")
async def explain_code(request: Request):
    data = await request.json()
    code = data.get("code", "")

    # Finetune for changes in results. Prompt engineer if required.
    prompt = f"Explain the following code in step by step in a simple detailed manner:\n\n{code}"

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": "You are a very extremely helpful assistant who explains code."},
            {"role": "user", "content": prompt}
        ]
    }