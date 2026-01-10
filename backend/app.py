from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from services.whisper_transcriber import transcribe_audio
from services.summarizer import summarize_text
from services.knowledge_store import add_to_knowledge_base
from services.qa_engine import answer_question

import traceback
import os

# -----------------------------
# APP SETUP
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app)

# -----------------------------
# SERVE FRONTEND PAGE
# -----------------------------
@app.route("/", methods=["GET"])
def serve_frontend():
    return send_from_directory(app.static_folder, "index.html")

# -----------------------------
# TRANSCRIBE + SUMMARIZE + STORE
# -----------------------------
@app.route("/transcribe", methods=["POST"])
def transcribe():
    try:
        # Validate audio
        if "audio" not in request.files:
            return jsonify({
                "success": False,
                "error": "No audio file provided"
            }), 400

        audio = request.files["audio"]

        if audio.filename == "":
            return jsonify({
                "success": False,
                "error": "Empty filename"
            }), 400

        # 1️⃣ Whisper transcription
        transcript = transcribe_audio(audio)

        # 2️⃣ Summarization
        summary = summarize_text(transcript)

        # 3️⃣ Store knowledge in FAISS
        knowledge_text = transcript + "\n\nSUMMARY:\n" + summary
        add_to_knowledge_base(knowledge_text)

        return jsonify({
            "success": True,
            "transcript": transcript,
            "summary": summary
        })

    except Exception as e:
        print("❌ Processing error:")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# -----------------------------
# QUESTION ANSWERING (RAG)
# -----------------------------
@app.route("/ask", methods=["POST"])
def ask():
    try:
        data = request.get_json()
        question = data.get("question", "").strip()

        if not question:
            return jsonify({
                "success": False,
                "error": "Question is required"
            }), 400

        answer = answer_question(question)

        return jsonify({
            "success": True,
            "answer": answer
        })

    except Exception as e:
        print("❌ Question answering error:")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# -----------------------------
# RUN SERVER
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
