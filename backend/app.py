import os
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from services.whisper_transcriber import WhisperTranscriber
from services.summarizer import Summarizer
from services.youtube_service import YouTubeService
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize services
transcriber = WhisperTranscriber()
summarizer = Summarizer()
youtube_service = YouTubeService()

@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_frontend(path):
    return send_from_directory('../frontend', path)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """Handle audio file upload and transcription"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        
        # Save uploaded file
        filename = str(uuid.uuid4()) + '.webm'
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        audio_file.save(filepath)
        
        # Transcribe
        logger.info(f"Transcribing audio: {filepath}")
        transcript = transcriber.transcribe(filepath)
        
        # Generate summary
        logger.info("Generating summary...")
        summary = summarizer.summarize(transcript)
        
        # Clean up
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'transcript': transcript,
            'summary': summary,
            'source': 'microphone'
        })
        
    except Exception as e:
        logger.error(f"Error in transcribe_audio: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/process-youtube', methods=['POST'])
def process_youtube():
    """Handle YouTube URL processing"""
    try:
        data = request.get_json()
        url = data.get('url', '')
        
        if not url:
            return jsonify({'error': 'No URL provided'}), 400
        
        # Extract video ID
        video_id = youtube_service.extract_video_id(url)
        if not video_id:
            return jsonify({'error': 'Invalid YouTube URL'}), 400
        
        # Get transcript
        result = youtube_service.get_transcript(video_id)
        
        if not result['success']:
            return jsonify({'error': result['error']}), 400
        
        # Generate summary
        summary = summarizer.summarize(result['transcript'])
        
        # Generate key points (optional)
        key_points = summarizer.extract_key_points(result['transcript'])
        
        return jsonify({
            'success': True,
            'video_id': video_id,
            'title': result.get('title', 'YouTube Video'),
            'transcript': result['transcript'],
            'summary': summary,
            'key_points': key_points,
            'language': result.get('language', 'en'),
            'source': 'youtube'
        })
        
    except Exception as e:
        logger.error(f"Error in process_youtube: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/ask', methods=['POST'])
def ask_question():
    """Handle questions about the content"""
    try:
        data = request.get_json()
        question = data.get('question', '')
        context = data.get('context', '')
        
        if not question or not context:
            return jsonify({'error': 'Question and context required'}), 400
        
        # Simple QA implementation (you can enhance this)
        # For now, we'll use summarizer to find relevant parts
        answer = summarizer.answer_question(context, question)
        
        return jsonify({
            'success': True,
            'answer': answer
        })
        
    except Exception as e:
        logger.error(f"Error in ask_question: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)