import os
import sys
sys.path.insert(0, r"V:\The Carice\backend")

from dotenv import load_dotenv
from livekit import api

load_dotenv(r"V:\The Carice\backend\.env.local")

print(f"LIVEKIT_API_KEY: {os.getenv('LIVEKIT_API_KEY')}")
print(f"LIVEKIT_API_SECRET: {os.getenv('LIVEKIT_API_SECRET')[:10]}..." if os.getenv('LIVEKIT_API_SECRET') else "Not found")

try:
    token = api.AccessToken(
        os.getenv('LIVEKIT_API_KEY'),
        os.getenv('LIVEKIT_API_SECRET')
    ).with_identity("test-user").with_name("test-user").with_grants(api.VideoGrants(
        room_join=True,
        room="test-room",
    ))
    print("✓ Token generated successfully!")
    print(f"Token: {token.to_jwt()[:50]}...")
except Exception as e:
    print(f"✗ Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
