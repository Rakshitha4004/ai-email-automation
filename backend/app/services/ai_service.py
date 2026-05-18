import os
import google.generativeai as genai


# ---------------- GEMINI SETUP ----------------
genai.configure(
    api_key=os.getenv("GOOGLE_API_KEY")
)

model = genai.GenerativeModel("gemini-2.0-flash")


# ---------------- EMAIL CLASSIFICATION ----------------
def classify_email(subject, sender):
    subject_lower = subject.lower()
    sender_lower = sender.lower()

    if "urgent" in subject_lower:
        return "URGENT"

    elif (
        "meeting" in subject_lower
        or "project" in subject_lower
        or "client" in subject_lower
    ):
        return "IMPORTANT"

    elif (
        "youtube" in sender_lower
        or "newsletter" in sender_lower
        or "promotion" in subject_lower
    ):
        return "UNWANTED"

    else:
        return "IMPORTANT"


# ---------------- FALLBACK REPLY ----------------
def fallback_reply(subject, sender):
    subject_lower = subject.lower()

    if "meeting" in subject_lower:
        return f"""
Hello,

Thank you for your email regarding "{subject}".

I confirm that I have received the meeting details and will be prepared accordingly.

Best regards,
Rakshitha
"""

    elif "urgent" in subject_lower:
        return f"""
Hello,

Thank you for bringing this urgent matter to my attention.

I have received your message and will review it immediately.

Best regards,
Rakshitha
"""

    elif "security" in subject_lower:
        return f"""
Hello,

Thank you for the security notification.

I have received your alert and will review the details accordingly.

Best regards,
Rakshitha
"""

    else:
        return f"""
Hello,

Thank you for your email regarding "{subject}".

I have received your message and will get back to you shortly.

Best regards,
Rakshitha
"""


# ---------------- AI REPLY GENERATION ----------------
def generate_reply(subject, sender):
    prompt = f"""
You are a professional AI email assistant.

Write a professional email reply.

Email subject: {subject}
Sender: {sender}

Rules:
- Professional tone
- Friendly
- Concise
- Human sounding
- End with "Best regards, Rakshitha"
"""

    try:
        response = model.generate_content(prompt)

        if response.text:
            return response.text

        return fallback_reply(subject, sender)

    except Exception:
        return fallback_reply(subject, sender)