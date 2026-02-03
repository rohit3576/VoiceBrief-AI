```markdown
# 🎙️ VoiceBrief AI

**VoiceBrief AI** is a fully open-source, voice-driven productivity web application that records audio in the browser, transcribes speech using open-source Whisper, and generates concise summaries using transformer-based NLP models — all with **zero paid APIs**.

> Built for real-world usage, interviews, and deployment — not just demos.

---

## 🚀 Features

- 🎤 **In-browser voice recording** (MediaRecorder API)
- 🌊 **Live audio visualization** (liquid glass effect)
- 🧠 **Speech-to-Text** using open-source **Whisper**
- 📝 **Automatic summarization** using **BART (facebook/bart-large-cnn)**
- ⚡ Real-time transcript & summary display
- 🧩 Clean modular backend architecture
- 💸 **100% free & open-source stack**

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
- HTML
- CSS (Glassmorphism UI)
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

## 📁 Project Structure

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

⚠️ **FFmpeg is required for Whisper**  
Ensure `ffmpeg -version` works in your terminal.

**Install FFmpeg:**
- **macOS:** `brew install ffmpeg`
- **Ubuntu/Debian:** `sudo apt install ffmpeg`
- **Windows:** Download from [ffmpeg.org](https://ffmpeg.org/download.html)

### 4️⃣ Run the Application

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
- Productivity & task recall

---

## 🧪 Example Output

**Transcript**  
*"Today I discussed project milestones and planned to complete the API integration by Friday."*

**Summary**  
*"The speaker reviewed project milestones and set a deadline to finish API integration by Friday."*

---

## 🏆 Resume-Ready Description

Developed VoiceBrief AI, a full-stack open-source voice intelligence application that records audio in the browser, transcribes speech using Whisper, and generates summaries using transformer-based NLP models, served via a Flask backend.

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

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss improvements.

**Steps to contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚠️ Known Issues & Troubleshooting

- **First run may be slow** - Models need to download (~1.5GB total)
- **Memory usage** - Ensure you have at least 4GB RAM free
- **Audio quality** - Better results with clear speech and minimal background noise
- **Browser permissions** - Allow microphone access when prompted

---

## 📜 License

This project is licensed under the MIT License — free to use, modify, and distribute.

---

## 🙏 Acknowledgements

- [OpenAI Whisper](https://github.com/openai/whisper)
- [Hugging Face Transformers](https://huggingface.co/)
- [Flask](https://flask.palletsprojects.com/)
- All open-source contributors

---

## 📞 Contact

For questions or feedback:
- Open an issue on GitHub
- Email: [rohit03576@gmail.com]

