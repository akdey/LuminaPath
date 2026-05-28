import json
from fastapi.testclient import TestClient
from main import app
from core.dependencies import get_db

def override_get_current_user():
    class User:
        id = "1"
    return User()

# app.dependency_overrides[get_current_user] = override_get_current_user # I don't know the exact import path, let me just mock the endpoint directly.
