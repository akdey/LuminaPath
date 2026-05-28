from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from features.auth.router import router as auth_router
from features.learning.router import router as learning_router
from features.assessment.router import router as assessment_router

app = FastAPI(title="LuminaPath API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(learning_router, prefix="/api/learning", tags=["Learning"])
app.include_router(assessment_router, prefix="/api/assessment", tags=["Assessment"])

@app.get("/")
def read_root():
    return {"message": "Welcome to LuminaPath API"}
