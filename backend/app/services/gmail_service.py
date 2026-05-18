from googleapiclient.discovery import build
import base64
from email.mime.text import MIMEText


def get_gmail_service(credentials):
    return build("gmail", "v1", credentials=credentials)


def fetch_emails(credentials, max_results=10):
    service = get_gmail_service(credentials)

    results = service.users().messages().list(
        userId="me",
        maxResults=max_results,
        q="in:inbox"
    ).execute()

    messages = results.get("messages", [])
    email_list = []

    for msg in messages:
        message = service.users().messages().get(
            userId="me",
            id=msg["id"],
            format="metadata",
            metadataHeaders=["Subject", "From"]
        ).execute()

        headers = message.get("payload", {}).get("headers", [])

        subject = "No Subject"
        sender = "Unknown Sender"

        for header in headers:
            if header["name"].lower() == "subject":
                subject = header["value"]

            elif header["name"].lower() == "from":
                sender = header["value"]

        if subject.startswith("Re:"):
            continue

        email_list.append({
            "subject": subject,
            "from": sender
        })

    return email_list


def create_draft(credentials, to_email, subject, body):
    service = get_gmail_service(credentials)

    message = MIMEText(body)

    message["to"] = to_email
    message["subject"] = f"Re: {subject}"

    raw = base64.urlsafe_b64encode(
        message.as_bytes()
    ).decode()

    draft = {
        "message": {
            "raw": raw
        }
    }

    draft_response = service.users().drafts().create(
        userId="me",
        body=draft
    ).execute()

    return draft_response