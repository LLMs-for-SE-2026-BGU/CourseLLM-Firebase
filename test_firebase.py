import os
import firebase_admin
from firebase_admin import firestore, credentials
import google.auth.credentials
from src.ai.dspy.config import get_settings

# 1. Load Settings
settings = get_settings()

# 2. Force environment variables for the emulator
os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = settings.FIREBASE_AUTH_EMULATOR_HOST
os.environ["FIRESTORE_EMULATOR_HOST"] = settings.FIRESTORE_EMULATOR_HOST
os.environ["FIREBASE_STORAGE_EMULATOR_HOST"] = settings.FIREBASE_STORAGE_EMULATOR_HOST

print(f"🔧 Testing connection to: {settings.FIREBASE_PROJECT_ID}")
print(f"📍 Firestore Host: {os.environ.get('FIRESTORE_EMULATOR_HOST')}")

# 3. Define a Dummy Credential Class
# This prevents the SDK from complaining about missing Google Cloud keys
# CORRECTED LINE: Inherit from google.auth.credentials.Credentials
class EmulatorCreds(google.auth.credentials.Credentials):
    def refresh(self, request):
        pass

# 4. Initialize Firebase
if not firebase_admin._apps:
    print("🚀 Initializing with Emulator Credentials...")
    # We create a valid-looking credential object that does nothing
    dummy_creds = EmulatorCreds()
    
    # Pass it DIRECTLY to initialize_app
    firebase_admin.initialize_app(credential=dummy_creds, options={
        'projectId': settings.FIREBASE_PROJECT_ID
    })

# 5. Try to write to the database
db = firestore.client()
try:
    doc_ref = db.collection("test_collection").document("test_doc")
    doc_ref.set({
        "message": "Hello from Python!",
        "timestamp": firestore.SERVER_TIMESTAMP
    })
    print("✅ SUCCESS: Wrote to Firestore Emulator!")
    
    # 6. Read it back
    doc = doc_ref.get()
    print(f"📖 Read back: {doc.to_dict()}")

except Exception as e:
    print(f"❌ ERROR: {e}")