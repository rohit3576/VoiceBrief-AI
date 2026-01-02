import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

def transcribe_audio(audio_file):
    """
    Transcribes audio using OpenAI Whisper
    """
    transcript = openai.audio.transcriptions.create(
        file=audio_file,
        model="whisper-1"
    )
    return transcript.text
