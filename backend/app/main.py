from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
from decouple import config

from app.database import engine
from app.models import Base
from app.routers import auth, posts, users

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="OpenShare Platform")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
UPLOAD_DIR = config("UPLOAD_DIR", default="static/uploads")
base_static_folder = UPLOAD_DIR.split('/')[0]
if not os.path.exists(base_static_folder):
    os.makedirs(base_static_folder)
app.mount("/static", StaticFiles(directory=base_static_folder), name="static")

# os.makedirs("uploads", exist_ok=True)
# app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)


@app.get("/")
def root():
    return {"message": "OpenShare Platform"}
