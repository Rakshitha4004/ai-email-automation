import os
import json
from google_auth_oauthlib.flow import Flow
from app.config import REDIRECT_URI

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.compose",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
]

def create_flow():
    credentials_json = os.getenv("GOOGLE_CREDENTIALS_JSON")

    if not credentials_json:
        raise Exception("GOOGLE_CREDENTIALS_JSON not found")

    client_config = json.loads(credentials_json)

    flow = Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )

    return flow