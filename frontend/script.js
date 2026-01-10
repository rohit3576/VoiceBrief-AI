let mediaRecorder;
let audioChunks = [];
let audioContext;
let analyser;
let source;
let animationId;

// -----------------------------
// DOM ELEMENTS
// -----------------------------
const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const status = document.getElementById("status");
const player = document.getElementById("player");
const resultBox = document.getElementById("result");
const summaryBox = document.getElementById("summary");
const container = document.querySelector(".container");
const questionInput = document.getElementById("questionInput");
const askBtn = document.getElementById("askBtn");
const answerBox = document.getElementById("answer");

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
  container.style.boxShadow =
    "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)";
}

// -----------------------------
// START RECORDING
// -----------------------------
recordBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    startLiquidVisualizer(stream);

    audioChunks = [];
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

      status.innerText = "⏳ Transcribing & summarizing...";
      resultBox.innerText = "Processing audio...";
      summaryBox.innerText = "Generating summary...";

      await sendToBackend();
    };
  } catch (err) {
    console.error(err);
    status.innerText = "❌ Microphone access denied";
  }
};

// -----------------------------
// STOP RECORDING
// -----------------------------
stopBtn.onclick = () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    recordBtn.disabled = false;
    stopBtn.disabled = true;
  }
};

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

    status.innerText = "✅ Done";

    // Transcript typing effect
    typeWriter(resultBox, data.transcript, 12);

    // Summary typing effect
    typeWriter(summaryBox, data.summary, 18);

  } catch (err) {
    console.error(err);
    status.innerText = "❌ Error";
    resultBox.innerText = err.message;
  }
}

// -----------------------------
// ASK QUESTION (RAG)
// -----------------------------
askBtn.onclick = async () => {
  const question = questionInput.value.trim();

  if (!question) {
    answerBox.innerText = "Please enter a question.";
    return;
  }

  try {
    answerBox.innerText = "🤖 Thinking...";

    const response = await fetch("/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to get answer");
    }

    answerBox.innerText = data.answer;

  } catch (error) {
    console.error(error);
    answerBox.innerText = "Error: " + error.message;
  }
};

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
// BLINK EFFECT CSS
// -----------------------------
const style = document.createElement("style");
style.innerHTML = `
  .blink { animation: blink 1.4s infinite; }
  @keyframes blink { 50% { opacity: 0; } }
`;
document.head.appendChild(style);