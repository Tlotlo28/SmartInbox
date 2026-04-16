from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import os
import json
import base64
import httpx
from dotenv import load_dotenv

load_dotenv()

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid"
]

CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), "../credentials.json")
REDIRECT_URI = "http://localhost:8000/auth/callback"


def get_client_config():
    with open(CREDENTIALS_FILE, "r") as f:
        creds_data = json.load(f)
    return creds_data.get("web", creds_data.get("installed", {}))


def get_authorization_url():
    config = get_client_config()
    client_id = config["client_id"]

    scope = " ".join(SCOPES)
    import urllib.parse
    import secrets

    state = secrets.token_urlsafe(32)

    params = {
        "client_id": client_id,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": scope,
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    }

    base_url = "https://accounts.google.com/o/oauth2/v2/auth"
    auth_url = base_url + "?" + urllib.parse.urlencode(params)

    return auth_url, state


async def exchange_code_for_tokens(code: str):
    config = get_client_config()

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": config["client_id"],
                "client_secret": config["client_secret"],
                "redirect_uri": REDIRECT_URI,
                "grant_type": "authorization_code",
            }
        )

    token_data = response.json()

    if "error" in token_data:
        raise Exception(f"{token_data['error']}: {token_data.get('error_description', '')}")

    return {
        "access_token": token_data["access_token"],
        "refresh_token": token_data.get("refresh_token"),
        "client_id": config["client_id"],
        "client_secret": config["client_secret"],
    }


def build_gmail_service(access_token: str, refresh_token: str):
    config = get_client_config()

    credentials = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=config["client_id"],
        client_secret=config["client_secret"],
        scopes=SCOPES
    )
    return build("gmail", "v1", credentials=credentials)


def fetch_emails(access_token: str, refresh_token: str, max_results: int = 30, page_token: str = None):
    service = build_gmail_service(access_token, refresh_token)

    params = {
        "userId": "me",
        "maxResults": max_results,
        "labelIds": ["INBOX"]
    }
    if page_token:
        params["pageToken"] = page_token

    results = service.users().messages().list(**params).execute()
    messages = results.get("messages", [])
    next_page_token = results.get("nextPageToken")

    emails = []
    for msg in messages:
        email_data = fetch_single_email(service, msg["id"])
        if email_data:
            emails.append(email_data)

    return emails, next_page_token


def fetch_single_email(service, message_id: str):
    try:
        msg = service.users().messages().get(
            userId="me",
            id=message_id,
            format="full"
        ).execute()

        headers = msg.get("payload", {}).get("headers", [])
        header_map = {h["name"].lower(): h["value"] for h in headers}

        subject = header_map.get("subject", "(no subject)")
        sender = header_map.get("from", "unknown")
        date = header_map.get("date", "")
        snippet = msg.get("snippet", "")
        body = extract_body(msg.get("payload", {}))

        return {
            "id": message_id,
            "subject": subject,
            "sender": sender,
            "date": date,
            "snippet": snippet,
            "body": body,
            "labels": msg.get("labelIds", [])
        }
    except HttpError:
        return None


def extract_body(payload):
    body = ""
    mime_type = payload.get("mimeType", "")

    if mime_type == "text/plain":
        data = payload.get("body", {}).get("data", "")
        if data:
            body = base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
    elif mime_type == "text/html":
        data = payload.get("body", {}).get("data", "")
        if data:
            body = base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
    elif "parts" in payload:
        for part in payload["parts"]:
            result = extract_body(part)
            if result:
                body = result
                break

    return body