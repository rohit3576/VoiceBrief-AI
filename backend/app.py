from flask import Flask, request, jsonify
from flask_cors import CORS
from services.transcriber import transcribe_audio

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return {"status": "VoiceBrief AI backend running"}

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return {"error": "No audio file provided"}, 400

    audio_file = request.files["audio"]
    text = transcribe_audio(audio_file)

    return jsonify({
        "transcript": text
    })

if __name__ == "__main__":
    app.run(debug=True)
