from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.auth.google_auth import create_flow
from app.auth.token_store import save_credentials, load_credentials
from app.services.gmail_service import fetch_emails, create_draft
from app.services.ai_service import classify_email, generate_reply

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-email-automation-rust.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend running"}

@app.get("/auth/google/login")
def google_login():
    flow = create_flow()

    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        code_challenge_method=None
    )

    return RedirectResponse(authorization_url)

@app.get("/auth/google/callback")
def google_callback(code: str):
    flow = create_flow()
    flow.fetch_token(code=code)

    credentials = flow.credentials
    save_credentials(credentials)

    return RedirectResponse("https://ai-email-automation-rust.vercel.app")

@app.get("/emails")
def get_emails():
    creds = load_credentials()

    if not creds:
        return {"error": "Please login first"}

    emails = fetch_emails(creds)

    classified_emails = []

    for email in emails:
        category = classify_email(email["subject"])

        classified_emails.append({
            "subject": email["subject"],
            "from": email["from"],
            "category": category
        })

    return classified_emails

@app.get("/generate-reply")
def generate_ai_reply(subject: str, sender: str):
    reply = generate_reply(subject, sender)

    return {
        "subject": subject,
        "from": sender,
        "reply": reply
    }

@app.get("/create-draft")
def create_email_draft(subject: str, sender: str, reply: str):
    creds = load_credentials()

    if not creds:
        return {"error": "Please login first"}

    create_draft(creds, sender, subject, reply)

    return {"message": "Draft created successfully"}