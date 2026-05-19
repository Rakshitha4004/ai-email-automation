import os
import pickle
from google.oauth2.credentials import Credentials

TOKEN_FILE = "token.pickle"

def save_credentials(credentials):
    with open(TOKEN_FILE, "wb") as token:
        pickle.dump(credentials, token)

def load_credentials():
    if not os.path.exists(TOKEN_FILE):
        return None

    with open(TOKEN_FILE, "rb") as token:
        credentials = pickle.load(token)

    return credentials