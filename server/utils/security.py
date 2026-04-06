import json
import bleach
import re

# Basic type and length check
def validate_and_clean(text):
    # Make sure the input is a string.
    if not isinstance(text, str):
        return None, "Please enter a message."
    # Length check: Must be performed before strip()
    # This allows interception of payloads with 1001 spaces, triggering the "1-1000 chars" error
    if len(text) > 1000:
        return None, "Please enter a message (1-1000 chars)."
    # Basic null check
    stripped = text.strip()
    if not stripped:
        return None, "Please enter a message."

    # 4. JSON injection check {},[]
    if (stripped.startswith('{') and stripped.endswith('}')) or \
       (stripped.startswith('[') and stripped.endswith(']')):
        try:
            # Attempt to parse the input as JSON. If it succeeds, we block it because we expect plain text.
            json.loads(stripped)
            return None, "Please use plain text, do not send JSON."
        except:
            pass

    # HTML/XSS inhection check: use bleach library to clean the label
    clean_text = bleach.clean(text, tags=[], strip=True)
    if len(clean_text) != len(text):
        return None, "HTML tags are not allowed."
    # SQL injection check
    sql_patterns = [
        r"SELECT\s+",           # read data
        r"OR\s+['\"]1['\"]",    # Attempting to logically bypass login
        r"DROP\s+TABLE",        # try deleting tables
        r"UNION\s+SELECT"       # try union select
        ]
    # An error will occur if any regular expression is matched.
    for pattern in sql_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return None, "Invalid characters detected."

    # 7. Prompt Injection check:
    injection_patterns = [
        r"ignore\s+all\s+previous",     # Inducing AI to forget its initial settings
        r"system\s+prompt",             # Attempting to manipulate the system prompt
        r"reveal\s+(your\s+)?secrets"   # Inducing AI to leak backend secrets
    ]
    for pattern in injection_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return None, "Security alert: Prompt modification detected."
    return stripped, None