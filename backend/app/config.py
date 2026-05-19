import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GOOGLE_CREDENTIALS_FILE = os.getenv("GOOGLE_CREDENTIALS_FILE")
REDIRECT_URI = "https://ai-email-automation-qfyq.onrender.com/auth/google/callback"
FRONTEND_URL = os.getenv("FRONTEND_URL")