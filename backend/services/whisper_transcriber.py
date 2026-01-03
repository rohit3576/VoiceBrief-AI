import whisper
import os
import uuid

# -----------------------------
# CONFIG
# -----------------------------
UPLOAD_DIR = os.path.join("backend", "uploads")

# Ensure uploads directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Load Whisper model once (IMPORTANT)
model = whisper.load_model("base")

# -----------------------------
# TRANSCRIPTION FUNCTION
# -----------------------------
def transcribe_audio(audio_file):
    """
    Transcribes an uploaded audio file using open-source Whisper.
    """

    # Generate unique filename
    filename = f"{uuid.uuid4()}.webm"
    filepath = os.path.join(UPLOAD_DIR, filename)

    # Save uploaded file
    audio_file.save(filepath)

    try:
        # Run Whisper transcription
        result = model.transcribe(filepath)
        text = result["text"]
    finally:
        # Always clean up temp file
        if os.path.exists(filepath):
            os.remove(filepath)

    return text
