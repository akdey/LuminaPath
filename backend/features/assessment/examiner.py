import json
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pydantic import BaseModel, Field
from typing import List
from langchain_core.prompts import ChatPromptTemplate
from core.logger import get_logger
from core.llm import client

logger = get_logger(__name__)

class MCQ(BaseModel):
    question: str = Field(description="The multiple choice question")
    options: List[str] = Field(description="List of exactly 4 options")
    correct_answer: int = Field(description="Integer index (0-3) of the correct option")
    explanation: str = Field(description="Explanation of why the answer is correct")

class QuizOutput(BaseModel):
    mcqs: List[MCQ] = Field(description="List of exactly 3 MCQs")

async def generate_mcqs(task_title: str, task_description: str):
    system_prompt = "You are an expert examiner. Generate exactly 3 Multiple-Choice Questions (MCQs) for the provided task."

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Task: {task_title}\nDescription: {task_description}")
    ])
    
    structured_llm = client.with_structured_output(QuizOutput)
    chain = prompt | structured_llm

    logger.info(f"Generating MCQs for task: {task_title}")
    try:
        response = await chain.ainvoke({
            "task_title": task_title,
            "task_description": task_description
        })
        
        mcqs_data = [mcq.model_dump() for mcq in response.mcqs]
        logger.info("Successfully generated MCQs.")
        return mcqs_data
    except Exception as e:
        logger.error(f"Langchain Groq Error in MCQ generation: {e}")
        return []
