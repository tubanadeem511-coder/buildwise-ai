
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Check credentials
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL or Key is missing from .env file")

# Create Supabase client
supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

print("BuildWise AI: Supabase client initialized successfully!")