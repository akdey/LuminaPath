import os
from googleapiclient.discovery import build
from dotenv import load_dotenv
from langchain_core.tools import tool

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

import json

@tool
def search_youtube(query: str, max_results: int = 3) -> str:
    """
    Searches YouTube for videos matching the query and returns metadata as a JSON string.
    """
    if not YOUTUBE_API_KEY:
        print("Warning: YOUTUBE_API_KEY is not set.")
        return "No results found because YOUTUBE_API_KEY is not configured."
        
    try:
        youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
        request = youtube.search().list(
            part="snippet",
            maxResults=max_results,
            q=query,
            type="video"
        )
        response = request.execute()
        
        results = []
        for item in response.get("items", []):
            video_id = item.get("id", {}).get("videoId")
            if not video_id:
                continue
                
            title = item.get("snippet", {}).get("title", "Unknown Title")
            results.append({
                "title": title,
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "source": "YouTube",
                "type": "video"
            })
            
        if not results:
            return "No videos found for this query."
            
        return json.dumps(results)
    except Exception as e:
        print(f"Error searching YouTube: {e}")
        return f"Error searching YouTube: {str(e)}"
