import json
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_core.prompts import ChatPromptTemplate
from core.youtube import search_youtube
from core.logger import get_logger
from core.llm import client

logger = get_logger(__name__)

async def generate_learning_path(topic: str):
    system_prompt = """You are an expert curator and educational architect. Create a structured learning path for the requested topic.
You must provide exactly 5 steps. For each step, use the 'search_youtube' tool to find 2-3 real, high-quality YouTube resources relevant to that specific step.
Return the final result strictly as a JSON object matching this structure:
{
    "tasks": [
        {
            "title": "Step 1...",
            "description": "...",
            "resources": [
                {"title": "...", "url": "https://www.youtube.com/watch?v=...", "source": "YouTube", "type": "video"}
            ]
        }
    ]
}
Do not include markdown blocks like ```json in the final response. Output only the raw JSON.
"""

    logger.info(f"Generating learning path for topic: {topic}")
    try:
        from langgraph.prebuilt import create_react_agent
        
        agent = create_react_agent(client, [search_youtube], prompt=system_prompt)
        
        result = await agent.ainvoke({"messages": [("user", f"Create a learning path for: {topic}")]})
        text = result["messages"][-1].content.strip()
        
        if text.startswith('```'):
            text = text.split('\n', 1)[1].rsplit('\n', 1)[0]
        if text.startswith('json'):
            text = text[4:].strip()
            
        data = json.loads(text)
        logger.info(f"Successfully generated learning path with {len(data.get('tasks', []))} tasks.")
        return data.get('tasks', [])
    except Exception as e:
        logger.error(f"Langchain Groq Error in learning path generation: {e}")
        return []
