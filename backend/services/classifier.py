import re


SUSPICIOUS_KEYWORDS = [
    "verify your account", "click here immediately", "your account has been suspended",
    "confirm your password", "unusual activity", "you have won", "claim your prize",
    "urgent action required", "your account will be closed", "update your payment",
    "bank account", "social security", "wire transfer", "send money",
    "nigerian prince", "inheritance", "lottery winner", "free gift",
    "act now", "limited time offer", "you are selected", "dear customer",
]

SPONSOR_KEYWORDS = [
    "unsubscribe", "opt out", "email preferences", "manage preferences",
    "you are receiving this", "this is a promotional", "advertisement",
    "sponsored", "newsletter", "deals", "offer expires", "shop now",
    "discount", "sale", "promo code", "coupon", "percent off",
    "free shipping", "limited offer", "marketing", "no longer wish to receive",
]

JOB_KEYWORDS = [
    "job opportunity", "career opportunity", "we are hiring", "job offer",
    "position available", "application received", "your application",
    "interview invitation", "interview scheduled", "offer letter",
    "recruiter", "recruitment", "linkedin", "indeed", "glassdoor",
    "hiring manager", "talent acquisition", "your cv", "your resume",
    "job description", "salary", "full time", "part time", "remote position",
    "apply now", "job alert", "new job", "career",
]

IMPORTANT_DOMAINS = [
    "bank", "fnb", "absa", "nedbank", "standardbank", "capitec",
    "sars", "gov", "government", "hospital", "medical", "insurance",
    "municipality", "court", "legal", "attorney", "lawyer",
    "university", "college", "school", "edu",
    "amazon", "paypal", "google", "microsoft", "apple",
]


def extract_sender_domain(sender: str) -> str:
    match = re.search(r"@([\w.-]+)", sender.lower())
    return match.group(1) if match else ""


def classify_email(email: dict) -> dict:
    subject = (email.get("subject") or "").lower()
    sender = (email.get("sender") or "").lower()
    snippet = (email.get("snippet") or "").lower()
    body = (email.get("body") or "").lower()

    full_text = f"{subject} {sender} {snippet} {body[:2000]}"
    domain = extract_sender_domain(sender)

    is_suspicious = any(kw in full_text for kw in SUSPICIOUS_KEYWORDS)
    is_sponsor = any(kw in full_text for kw in SPONSOR_KEYWORDS)
    is_job = any(kw in full_text for kw in JOB_KEYWORDS)
    is_important = any(kw in domain for kw in IMPORTANT_DOMAINS)

    if is_suspicious:
        is_sponsor = False
        is_job = False
        is_important = False

    if is_important:
        is_suspicious = False

    if is_suspicious:
        color_code = "#ef4444"
        reason = "Contains suspicious patterns"
    elif is_important:
        color_code = "#22c55e"
        reason = "From an important domain"
    elif is_job:
        color_code = "#6366f1"
        reason = "Career or job related"
    elif is_sponsor:
        color_code = "#f59e0b"
        reason = "Promotional or sponsored content"
    else:
        color_code = "#94a3b8"
        reason = "Standard email"

    return {
        "gmail_message_id": email.get("id", ""),
        "is_suspicious": is_suspicious,
        "is_sponsor": is_sponsor,
        "is_job": is_job,
        "is_important": is_important,
        "color_code": color_code,
        "reason": reason,
    }