from langchain_groq import ChatGroq
from langchain_core.globals import set_llm_cache
from langchain_core.caches import InMemoryCache
from core.config import settings

# Enable in-memory caching for LLM calls (temporary cache)
set_llm_cache(InMemoryCache())

# Centralized Groq LLM client
client = ChatGroq(
    model=settings.groq_model,
    api_key=settings.groq_api_key
)

