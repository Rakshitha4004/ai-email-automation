from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
from starlette.middleware.sessions import SessionMiddleware
import os

from app.auth.google_auth import create_flow
from app.services.gmail_service import get_gmail_service, fetch_emails, create_draft
from app.services.ai_service import classify_email, generate_reply

app = FastAPI()

# SESSION MIDDLEWARE (FIXED)
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "super-secret-key-123"),
    same_site="none",
    https_only=True,
    max_age=86400,
)

# CORS (FIXED)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-email-automation-rust.vercel.app",
        "https://ai-email-automation-8wpl69j64-rakshitha-s-projects3.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend running"}

# GOOGLE LOGIN
@app.get("/auth/google/login")
def login(request: Request):
    flow = create_flow()

   authorization_url, state = flow.authorization_url(
    access_type="offline",
    include_granted_scopes="true",
    prompt="consent",
    code_challenge_method=None
)

    request.session["state"] = state

    return RedirectResponse(authorization_url)

# GOOGLE CALLBACK
@app.get("/auth/google/callback")
def callback(request: Request):
    flow = create_flow()

    flow.fetch_token(authorization_response=str(request.url))

    credentials = flow.credentials

    request.session["credentials"] = {
        "token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": credentials.scopes,
    }

    return RedirectResponse("https://ai-email-automation-rust.vercel.app")

# FETCH EMAILS
@app.get("/emails")
def emails(request: Request):
    creds = request.session.get("credentials")

    if not creds:
        return JSONResponse(
            {"error": "Not authenticated. Please login first."},
            status_code=401,
        )

    try:
        service = get_gmail_service(creds)
        messages = fetch_emails(service)

        classified = []

        for msg in messages:
            category = classify_email(msg["subject"], msg["from"])

            classified.append({
                "subject": msg["subject"],
                "from": msg["from"],
                "category": category,
            })

        return classified

    except Exception as e:
        return JSONResponse(
            {"error": str(e)},
            status_code=500,
        )

# GENERATE AI REPLY
@app.get("/generate-reply")
def reply(subject: str, sender: str):
    try:
        reply_text = generate_reply(subject, sender)

        return {
            "reply": reply_text,
            "subject": subject,
            "from": sender,
        }

    except Exception as e:
        return JSONResponse(
            {"error": str(e)},
            status_code=500,
        )

# CREATE DRAFT
@app.get("/create-draft")
def draft(request: Request, subject: str, sender: str, reply: str):
    creds = request.session.get("credentials")

    if not creds:
        return JSONResponse(
            {"error": "Not authenticated. Please login first."},
            status_code=401,
        )

    try:
        service = get_gmail_service(creds)

        create_draft(
            service=service,
            to=sender,
            subject=f"Re: {subject}",
            body=reply,
        )

        return {"message": "Draft created successfully"}

    except Exception as e:
        return JSONResponse(
            {"error": str(e)},
            status_code=500,
        )