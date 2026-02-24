// Global variables
let mediaRecorder;
let audioChunks = [];
let audioContext;
let analyser;
let source;
let animationId;
let currentTranscript = '';
let currentSummary = '';
let currentKeyPoints = [];

// DOM Elements
const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const status = document.getElementById("status");
const player = document.getElementById("player");
const resultBox = document.getElementById("result");
const summaryBox = document.getElementById("summary");
const container = document.querySelector(".container");
const questionInput = document.getElementById("question");
const askBtn = document.getElementById("askBtn");
const answerBox = document.getElementById("answer");

// YouTube Elements
const youtubeUrl = document.getElementById("youtubeUrl");
const processYoutubeBtn = document.getElementById("processYoutubeBtn");
const youtubeStatus = document.getElementById("youtubeStatus");
const videoInfo = document.getElementById("videoInfo");
const videoTitle = document.getElementById("videoTitle");
const videoStats = document.getElementById("videoStats");
const keyPointsCard = document.getElementById("keyPointsCard");
const keyPointsList = document.querySelector(".key-points-list");

// Recording status elements
const recordingStatus = document.getElementById("recordingStatus");

// -----------------------------
// TAB SWITCHING
// -----------------------------
window.switchTab = function(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Clear YouTube tab when switching to microphone
    if (tabName === 'microphone') {
        // Reset YouTube specific elements
        if (videoInfo) videoInfo.style.display = 'none';
        if (keyPointsCard) keyPointsCard.style.display = 'none';
    }
};

// -----------------------------
// LIQUID VISUALIZER
// -----------------------------
function startLiquidVisualizer(stream) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 64;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function animate() {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            animationId = requestAnimationFrame(animate);
            analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            let avg = sum / dataArray.length;

            const spread = 20 + avg / 2;
            const opacity = 0.25 + avg / 255;
            const blue = 80 + avg;

            container.style.boxShadow = `
                0 20px ${spread}px rgba(0, ${blue}, 255, ${opacity}),
                inset 0 1px 0 rgba(255,255,255,0.2)
            `;
        }
    }
    animate();
}

function stopLiquidVisualizer() {
    cancelAnimationFrame(animationId);
    container.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)";
}

// -----------------------------
// START RECORDING
// -----------------------------
if (recordBtn) {
    recordBtn.onclick = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            startLiquidVisualizer(stream);

            audioChunks = [];
            if (recordingStatus) {
                recordingStatus.innerHTML = "🎤 Recording<span class='blink'>...</span>";
            }
            status.innerHTML = "🎤 Recording<span class='blink'>...</span>";
            resultBox.innerText = "Listening...";
            summaryBox.innerText = "—";
            recordBtn.disabled = true;
            stopBtn.disabled = false;

            mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

            mediaRecorder.onstop = async () => {
                stopLiquidVisualizer();

                const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
                player.src = URL.createObjectURL(audioBlob);
                window.recordedAudio = audioBlob;

                if (recordingStatus) {
                    recordingStatus.innerText = "⏳ Transcribing & summarizing...";
                }
                status.innerText = "⏳ Transcribing & summarizing...";
                resultBox.innerText = "Processing audio...";
                summaryBox.innerText = "Generating summary...";

                await sendToBackend();
            };
        } catch (err) {
            console.error(err);
            if (recordingStatus) {
                recordingStatus.innerText = "❌ Microphone access denied";
            }
            status.innerText = "❌ Microphone access denied";
        }
    };
}

// -----------------------------
// STOP RECORDING
// -----------------------------
if (stopBtn) {
    stopBtn.onclick = () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            recordBtn.disabled = false;
            stopBtn.disabled = true;
            
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            
            if (audioContext) {
                audioContext.close();
            }
        }
    };
}

// -----------------------------
// PROCESS YOUTUBE VIDEO
// -----------------------------
if (processYoutubeBtn) {
    processYoutubeBtn.onclick = async () => {
        const url = youtubeUrl.value.trim();
        
        if (!url) {
            if (youtubeStatus) {
                youtubeStatus.textContent = '❌ Please enter a YouTube URL';
            }
            return;
        }
        
        // Update UI
        if (youtubeStatus) {
            youtubeStatus.textContent = '⏳ Processing YouTube video...';
        }
        processYoutubeBtn.disabled = true;
        resultBox.innerText = "Fetching transcript...";
        summaryBox.innerText = "Generating summary...";
        
        // Hide previous results
        if (videoInfo) videoInfo.style.display = 'none';
        if (keyPointsCard) keyPointsCard.style.display = 'none';
        
        try {
            const response = await fetch('/process-youtube', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: url })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store current data
                currentTranscript = data.transcript;
                currentSummary = data.summary;
                currentKeyPoints = data.key_points || [];
                
                // Display video info
                if (videoTitle) videoTitle.textContent = data.title;
                if (videoStats) {
                    videoStats.textContent = `Language: ${data.language} • Source: ${data.source}`;
                }
                if (videoInfo) videoInfo.style.display = 'block';
                
                // Display transcript (truncated if too long)
                const truncatedTranscript = data.transcript.length > 500 
                    ? data.transcript.substring(0, 500) + '...' 
                    : data.transcript;
                resultBox.innerText = truncatedTranscript;
                
                // Display summary
                summaryBox.innerText = data.summary;
                
                // Display key points if available
                if (currentKeyPoints.length > 0 && keyPointsList) {
                    keyPointsList.innerHTML = currentKeyPoints.map(point => 
                        `<li>${point}</li>`
                    ).join('');
                    if (keyPointsCard) keyPointsCard.style.display = 'block';
                }
                
                // Enable ask button
                if (askBtn) askBtn.disabled = false;
                
                if (youtubeStatus) {
                    youtubeStatus.textContent = '✅ YouTube video processed successfully!';
                }
            } else {
                throw new Error(data.error || 'Failed to process YouTube video');
            }
        } catch (error) {
            console.error('Error processing YouTube:', error);
            if (youtubeStatus) {
                youtubeStatus.textContent = '❌ Error: ' + error.message;
            }
            resultBox.innerText = "Error processing video";
            summaryBox.innerText = "—";
        } finally {
            processYoutubeBtn.disabled = false;
        }
    };
}

// -----------------------------
// SEND AUDIO TO BACKEND
// -----------------------------
async function sendToBackend() {
    try {
        const formData = new FormData();
        formData.append("audio", window.recordedAudio, "audio.webm");

        const res = await fetch("/transcribe", {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || "Processing failed");
        }

        // Store current data
        currentTranscript = data.transcript;
        currentSummary = data.summary;
        
        // Update status
        if (recordingStatus) {
            recordingStatus.innerText = "✅ Done";
        }
        status.innerText = "✅ Done";

        // Display results
        resultBox.innerText = data.transcript;
        summaryBox.innerText = data.summary;
        
        // Enable ask button
        if (askBtn) askBtn.disabled = false;
        
        // Hide YouTube specific elements
        if (keyPointsCard) keyPointsCard.style.display = 'none';

    } catch (err) {
        console.error(err);
        if (recordingStatus) {
            recordingStatus.innerText = "❌ Error";
        }
        status.innerText = "❌ Error";
        resultBox.innerText = err.message;
    }
}

// -----------------------------
// ASK QUESTION (RAG)
// -----------------------------
if (askBtn) {
    askBtn.onclick = async () => {
        const question = questionInput.value.trim();

        if (!question) {
            answerBox.innerText = "Please enter a question.";
            return;
        }

        if (!currentTranscript) {
            answerBox.innerText = "No content to ask about. Record or process a video first.";
            return;
        }

        try {
            answerBox.innerText = "🤖 Thinking...";

            const response = await fetch("/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    question: question,
                    context: currentTranscript 
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to get answer");
            }

            // Typewriter effect for answer
            typeWriter(answerBox, data.answer, 15);

        } catch (error) {
            console.error(error);
            answerBox.innerText = "Error: " + error.message;
        }
    };
}

// -----------------------------
// TYPEWRITER EFFECT
// -----------------------------
function typeWriter(element, text, speed) {
    element.innerText = "";
    let i = 0;
    function write() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(write, speed);
        }
    }
    write();
}

// -----------------------------
// ENTER KEY SUPPORT FOR QUESTION
// -----------------------------
if (questionInput) {
    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && askBtn && !askBtn.disabled) {
            askBtn.click();
        }
    });
}

// -----------------------------
// YOUTUBE URL ENTER KEY SUPPORT
// -----------------------------
if (youtubeUrl) {
    youtubeUrl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && processYoutubeBtn && !processYoutubeBtn.disabled) {
            processYoutubeBtn.click();
        }
    });
}

// -----------------------------
// BLINK EFFECT CSS
// -----------------------------
const style = document.createElement("style");
style.innerHTML = `
    .blink { animation: blink 1.4s infinite; }
    @keyframes blink { 50% { opacity: 0; } }
    
    .key-points-list {
        list-style-type: none;
        padding: 0;
    }
    
    .key-points-list li {
        padding: 8px;
        margin-bottom: 5px;
        background: #f0f0f0;
        border-radius: 5px;
        border-left: 3px solid #667eea;
    }
`;
document.head.appendChild(style);

// -----------------------------
// INITIALIZATION
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Disable ask button initially
    if (askBtn) askBtn.disabled = true;
    
    // Set up canvas for visualizer if it exists
    const canvas = document.getElementById('visualizer');
    if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
});