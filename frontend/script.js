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
const container = document.querySelector(".container"); // Selected for animation

// -----------------------------
// HELPER: LIQUID VISUALIZER
// -----------------------------
function startLiquidVisualizer(stream) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  analyser = audioContext.createAnalyser();
  source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  
  analyser.fftSize = 64; // Low detail for smooth liquid movement
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  function animate() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      animationId = requestAnimationFrame(animate);
      analyser.getByteFrequencyData(dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      let average = sum / dataArray.length;

      // Map volume to liquid shadow properties
      // The higher the volume, the deeper and bluer the shadow
      const spread = 25 + (average / 2); 
      const opacity = 0.3 + (average / 255);
      const blueShift = 50 + average; 

      // Apply dynamic "breathing" style to the glass container
      container.style.boxShadow = `
        0 20px ${spread}px rgba(0, ${blueShift}, 255, ${opacity}),
        inset 0 1px 0 rgba(255, 255, 255, 0.2)
      `;
      
      container.style.borderColor = `rgba(255, 255, 255, ${0.1 + (average/500)})`;
    }
  }
  animate();
}

function stopLiquidVisualizer() {
  cancelAnimationFrame(animationId);
  // Reset container to resting glass state
  container.style.boxShadow = "0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
  container.style.borderColor = "rgba(255, 255, 255, 0.05)";
}

// -----------------------------
// START RECORDING
// -----------------------------
recordBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    // --- Start Visualizer ---
    startLiquidVisualizer(stream); 

    audioChunks = [];
    status.innerHTML = "🎤 Recording<span class='blink'>...</span>"; // Added Blink
    resultBox.innerText = "Listening to audio stream...";
    resultBox.style.opacity = "0.7"; // Dim text while recording
    
    recordBtn.disabled = true;
    stopBtn.disabled = false;

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      // --- Stop Visualizer ---
      stopLiquidVisualizer();

      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const audioUrl = URL.createObjectURL(audioBlob);
      player.src = audioUrl;

      // Save audio for backend
      window.recordedAudio = audioBlob;

      status.innerText = "⏳ Transcribing...";
      resultBox.innerText = "Processing audio data...";
      resultBox.style.opacity = "1";
      await sendToBackend();
    };

  } catch (error) {
    console.error(error);
    status.innerText = "❌ Microphone access denied";
    resultBox.innerText = "Please allow microphone access.";
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
    // Appending the blob saved in the global window object
    formData.append("audio", window.recordedAudio, "audio.webm");

    // Add a small artificial delay for UI feel if response is too fast
    resultBox.style.transition = "color 0.3s";
    resultBox.style.color = "#94a3b8"; // Dim text slightly

    const response = await fetch("/transcribe", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Transcription failed");
    }

    status.innerText = "✅ Transcription complete";
    
    // Typewriter effect for result
    resultBox.style.color = "#cbd5e1"; // Restore color
    resultBox.innerText = "";
    let i = 0;
    const typeWriter = () => {
      if (i < data.transcript.length) {
        resultBox.innerHTML += data.transcript.charAt(i);
        i++;
        setTimeout(typeWriter, 15); // Speed of typing
      }
    };
    typeWriter();

  } catch (error) {
    console.error(error);
    status.innerText = "❌ Transcription error";
    resultBox.innerText = "Error: " + error.message;
  }
}

// Add simple CSS for blink animation dynamically
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  .blink { animation: blinker 1.5s linear infinite; }
  @keyframes blinker { 50% { opacity: 0; } }
`;
document.head.appendChild(styleSheet);