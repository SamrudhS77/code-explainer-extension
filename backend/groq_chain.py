from langchain.chat_models import ChatGroq
from langchain.schema import SystemMessage, HumanMessage

def generate_explanation(code_snippet: str) -> str:
    chat = ChatGroq(
        groq_api_key=os.getenv("GROQ_API_KEY"),
        model="llama3-8b-8192"
    )

    messages = [
        SystemMessage(content="You are a senior software engineer who explains code simply but with detail."),
        HumanMessage(content=f"Explain what the following code does:\n\n{code_snippet}")
    ]

    response = chat(messages)
    return response.content
