from fastapi import FastAPI, Request, Query
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from app.auth.google_auth import create_flow
from app.services.gmail_service import fetch_emails, create_draft
from app.services.ai_service import classify_email, generate_reply

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

saved_credentials = None
saved_flow = None


@app.get("/")
def home():
    return {"message": "AI Email Automation Backend Running"}


@app.get("/auth/google/login")
def google_login():
    global saved_flow

    saved_flow = create_flow()

    auth_url, _ = saved_flow.authorization_url(prompt="consent")

    return RedirectResponse(auth_url)


@app.get("/auth/google/callback")
def google_callback(request: Request):
    global saved_credentials
    global saved_flow

    try:
        if saved_flow is None:
            return {"error": "Login flow not initialized"}

        saved_flow.fetch_token(
            authorization_response=str(request.url)
        )

        saved_credentials = saved_flow.credentials

        return {"message": "Google login successful"}

    except Exception as e:
        return {"callback_error": str(e)}


@app.get("/emails")
def get_emails():
    global saved_credentials

    try:
        if saved_credentials is None:
            return {"error": "Please login first"}

        emails = fetch_emails(saved_credentials)

        classified_emails = []

        for email in emails:
            category = classify_email(
                email.get("subject", "No Subject"),
                email.get("from", "Unknown Sender")
            )

            classified_emails.append({
                "subject": email.get("subject", "No Subject"),
                "from": email.get("from", "Unknown Sender"),
                "category": category
            })

        return classified_emails

    except Exception as e:
        return {"error": str(e)}


@app.get("/generate-reply")
def generate_email_reply(
    subject: str = Query(...),
    sender: str = Query(...)
):
    global saved_credentials

    try:
        if saved_credentials is None:
            return {"error": "Please login first"}

        reply_body = generate_reply(subject, sender)

        return {
            "subject": subject,
            "from": sender,
            "reply": reply_body
        }

    except Exception as e:
        return {"error": str(e)}


@app.get("/create-draft")
def create_email_draft(
    subject: str = Query(...),
    sender: str = Query(...),
    reply: str = Query(...)
):
    global saved_credentials

    try:
        if saved_credentials is None:
            return {"error": "Please login first"}

        draft = create_draft(
            saved_credentials,
            sender,
            subject,
            reply
        )

        return {
            "message": "Draft created successfully",
            "draft_id": draft["id"]
        }

    except Exception as e:
        return {"error": str(e)}