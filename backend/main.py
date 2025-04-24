import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
from groq_chain import generate_explanation_with_memory, clear_tab_memory
from dotenv import load_dotenv



load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
    tab_id: str
    model: str

@app.post("/explain")
async def explain_code(request: CodeRequest):
    try:
        explanation = generate_explanation_with_memory(
            code=request.code,
            tab_id=request.tab_id,
            model=request.model,
            api_key=os.getenv("GROQ_API_KEY")
        )
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/clear_memory")
async def clear_memory(tab_id: str):
    clear_tab_memory(tab_id)
    return {"message": f"Memory cleared for tab {tab_id}"}