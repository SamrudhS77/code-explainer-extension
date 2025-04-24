import os
import re
from typing import Dict
from langchain_groq import ChatGroq
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnableSequence
from langchain.schema import SystemMessage, HumanMessage

# Memory store per tab
memory_store: Dict[str, ConversationBufferMemory] = {}

# Prompt template
prompt = PromptTemplate(
    input_variables=["code", "history"],
    template=(
        "If the following code depends on any previously defined code, consider that context while explaining. "
        "Break down the given code and explain it line by line. "
        "Start with a 'Breakdown of Code' section. "
        "At the end, provide a summary in two lines under 'Summary'.\n"
        "Previously defined code:\n{history}\n\n"
        "Current Code:\n{code}"
    )
)

# Supported LLMs (currently only Groq models)
class GroqLLM(ChatGroq):
    def __init__(self, temperature, model, api_key):
        super().__init__(temperature=temperature, model=model, groq_api_key=api_key)

LLM_CLASSES = {
    "mixtral-8x7b-32768": GroqLLM,
    "llama3-8b-8192": GroqLLM,
    "gemma-7b-it": GroqLLM
}

def generate_explanation_with_memory(code: str, tab_id: str, model: str, api_key: str) -> str:
    if tab_id not in memory_store:
        memory_store[tab_id] = ConversationBufferMemory(return_messages=False)
    memory = memory_store[tab_id]

    if model not in LLM_CLASSES:
        raise ValueError("Unsupported model selected")

    llm = LLM_CLASSES[model](temperature=0.6, model=model, api_key=api_key)
    chain: RunnableSequence = prompt | llm

    response = chain.invoke({
        "code": code,
        "history": memory.load_memory_variables({}).get("history", "")
    })

    cleaned = re.sub(r"<think>.*?</think>", "", response.content, flags=re.DOTALL).strip()
    memory.save_context({"input": code}, {"output": cleaned})
    return cleaned

def clear_tab_memory(tab_id: str):
    memory_store.pop(tab_id, None)
