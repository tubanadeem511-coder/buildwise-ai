
import os
import time

from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv()

# Get Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is missing from .env file")

# Initialize Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)

# Free-tier model
GEMINI_MODEL = "gemini-3.5-flash-lite"

print("BuildWise AI: Gemini client initialized successfully!")


def generate_ai_response(prompt: str) -> str:
    """Generate an AI response using Gemini with retry support."""

    max_attempts = 3

    for attempt in range(max_attempts):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config={
                    "http_options": {
                        "timeout": 60000
                    }
                }
            )

            return response.text or "Gemini returned an empty response."

        except Exception as error:
            error_message = str(error)

            print(
                f"Gemini API Error "
                f"(Attempt {attempt + 1}/{max_attempts}): {error}"
            )

            # Retry temporary service or rate-limit errors
            is_temporary_error = any(
                error_code in error_message
                for error_code in ["503", "UNAVAILABLE", "429"]
            )

            if attempt < max_attempts - 1 and is_temporary_error:
                wait_time = 3 * (attempt + 1)

                print(
                    f"Retrying Gemini request in {wait_time} seconds..."
                )

                time.sleep(wait_time)
                continue

            return (
                "Sorry, Gemini is temporarily unavailable. "
                "Please try again later."
            )

    return "Sorry, Gemini is temporarily unavailable. Please try again later."


def test_gemini_connection():
    """Test Gemini API connection."""

    return generate_ai_response(
        "Reply with exactly: BuildWise AI Gemini connection successful!"
    )