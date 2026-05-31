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
    system_prompt = """You are an expert educational curriculum designer and learning path architect for a professional learning portal.
Your ONLY purpose is to create structured, academic-quality learning paths for genuine educational topics such as programming, science, mathematics, languages, design, finance, engineering, and similar fields.

IMPORTANT RULES:
- If the requested topic is NOT a legitimate educational or professional learning subject (e.g., it is entertainment, news, gossip, gaming for fun, political opinions, or anything unrelated to structured learning), respond with a JSON object: {"error": "non_educational_topic"}. Do NOT generate a learning path for such topics.
- ONLY generate paths for topics where a structured curriculum, skill progression, and educational resources genuinely exist.
- You must provide exactly 5 steps. For each step, use the 'search_youtube' tool to find 2-3 real, high-quality educational YouTube resources (tutorials, lectures, courses, explained videos) relevant to that specific step.
- Every resource MUST be a genuine educational video — tutorials, university lectures, course walkthroughs, or professional explainers only. Never suggest entertainment or non-educational content.

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
        
        result = await agent.ainvoke({"messages": [("user", f"Create a structured educational learning path for: {topic}")]})
        text = result["messages"][-1].content.strip()
        
        if text.startswith('```'):
            text = text.split('\n', 1)[1].rsplit('\n', 1)[0]
        if text.startswith('json'):
            text = text[4:].strip()
            
        data = json.loads(text)

        # Agent signalled a non-educational topic — pass the error dict through to the router
        if "error" in data:
            logger.warning(f"Agent rejected topic as non-educational: {topic}")
            return data

        logger.info(f"Successfully generated learning path with {len(data.get('tasks', []))} tasks.")
        return data.get('tasks', [])
    except Exception as e:
        logger.error(f"Langchain Groq Error in learning path generation: {e}")
        return []
