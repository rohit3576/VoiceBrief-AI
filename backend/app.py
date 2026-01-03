from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from services.whisper_transcriber import transcribe_audio
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
# TRANSCRIPTION ENDPOINT
# -----------------------------
@app.route("/transcribe", methods=["POST"])
def transcribe():
    try:
        # Validate audio
        if "audio" not in request.files:
            return jsonify({"success": False, "error": "No audio file provided"}), 400

        audio = request.files["audio"]

        if audio.filename == "":
            return jsonify({"success": False, "error": "Empty filename"}), 400

        # Transcribe using Whisper
        text = transcribe_audio(audio)

        return jsonify({
            "success": True,
            "transcript": text
        })

    except Exception as e:
        print("❌ Transcription error:")
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
