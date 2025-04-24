from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from groq_chain import generate_explanation

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

@app.post("/explain")
async def explain_code(request: Request):
    data = await request.json()
    code = data.get("code", "")

    explanation = generate_explanation(code)
    return {"explanation": explanation}
