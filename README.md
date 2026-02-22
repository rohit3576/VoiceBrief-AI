```markdown
# 🎙️ VoiceBrief AI

<div align="center">

**Transform your voice into concise summaries — completely free and open-source**

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.0%2B-green)](https://flask.palletsprojects.com/)
[![Whisper](https://img.shields.io/badge/Whisper-OpenAI-yellow)](https://github.com/openai/whisper)
[![Hugging Face](https://img.shields.io/badge/🤗-Transformers-orange)](https://huggingface.co/)
[![License](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)

**VoiceBrief AI** is a fully open-source, voice-driven productivity web application that records audio in the browser, transcribes speech using open-source Whisper, and generates concise summaries using transformer-based NLP models — all with **zero paid APIs**.

> Built for real-world usage, interviews, and deployment — not just demos.

</div>

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🎤 | **Voice Recording** | In-browser audio capture with MediaRecorder API |
| 🌊 | **Live Visualization** | Liquid glass audio effect with Web Audio API |
| 🧠 | **Speech-to-Text** | OpenAI's Whisper (base model) - completely local |
| 📝 | **Smart Summarization** | BART transformer model for concise summaries |
| ⚡ | **Real-time Display** | Instant transcript and summary generation |
| 💸 | **Zero Cost** | 100% free, no paid APIs, fully open-source |
| 🧩 | **Modular Design** | Clean architecture for easy customization |

---

## 🧠 How It Works

```
User Voice
↓
Browser Recorder (MediaRecorder API)
↓
Flask Backend
├── Whisper → Transcription
└── BART → Summary
↓
Transcript + Summary shown on UI
```

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3 (Glassmorphism UI)
- JavaScript
- MediaRecorder API
- Web Audio API

### Backend
- Python
- Flask
- Open-source Whisper (Speech-to-Text)
- Hugging Face Transformers (Summarization)

### ML Models
- **Whisper (base)** – Speech recognition
- **facebook/bart-large-cnn** – Text summarization

---

## 📂 Project Structure

```
VoiceBrief-AI/
├── backend/
│   ├── app.py
│   ├── services/
│   │   ├── whisper_transcriber.py
│   │   └── summarizer.py
│   ├── uploads/
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/<your-username>/VoiceBrief-AI.git
cd VoiceBrief-AI
```

### 2️⃣ Create Virtual Environment

```bash
python -m venv venv
```

**Activate:**

**Windows**
```bash
venv\Scripts\activate
```

**macOS / Linux**
```bash
source venv/bin/activate
```

### 3️⃣ Install Dependencies

```bash
pip install -r backend/requirements.txt
```

### 4️⃣ Install FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

Verify installation:
```bash
ffmpeg -version
```

### 5️⃣ Run the Application

```bash
python backend/app.py
```

**Open browser:**
```
http://127.0.0.1:5000
```

---

## 🎯 Use Cases

- Meeting note summarization
- Daily voice notes
- Brain dumps & idea capture
- Interview prep recordings
- Lecture recording
- Task management

---

## 📊 Example Output

**Transcript**  
*"Today I discussed project milestones with the team. We decided to complete the API integration by Friday, and Sarah will handle the frontend components. The client meeting is scheduled for next Monday at 10 AM."*

**Summary**  
*"Team discussed project milestones, with API integration deadline set for Friday and Sarah assigned to frontend work. Client meeting scheduled for Monday at 10 AM."*

---

## 🏆 Description

**VoiceBrief AI** - Full-stack Voice Intelligence Application
- Developed a production-grade voice processing web app using Flask and modern JavaScript
- Integrated OpenAI's Whisper model for accurate speech-to-text transcription
- Implemented BART transformer for intelligent text summarization
- Created responsive glassmorphism UI with real-time audio visualization
- Architected modular backend services for easy maintenance and scaling
- Achieved zero-cost deployment using only open-source technologies

---

## 🔮 Future Enhancements

- Action item extraction
- Bullet-point summaries
- Text-to-Speech playback
- Speaker diarization
- Cloud deployment (Hugging Face Spaces)
- Multi-language support
- Export to markdown/PDF
- Mobile app version
- User authentication
- Dark mode

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

**Steps to contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚠️ Known Issues & Troubleshooting

| Issue | Solution |
|-------|----------|
| **Slow first run** | Models need to download (~1.5GB total). Be patient! |
| **High memory usage** | Ensure 4GB+ RAM available |
| **Poor transcription** | Use clear speech, minimize background noise |
| **Microphone not working** | Check browser permissions |
| **FFmpeg not found** | Verify FFmpeg installation |

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgements

- [OpenAI Whisper](https://github.com/openai/whisper)
- [Hugging Face Transformers](https://huggingface.co/)
- [Flask](https://flask.palletsprojects.com/)
- All open-source contributors

---

## 📞 Contact

📧 **Email:** rohit03576@gmail.com

🐛 **Report Issues:** GitHub Issues

⭐ **Star this repo** if you find it useful!

---

**Made with ❤️ for the open-source community**
```
