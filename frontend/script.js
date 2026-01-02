let mediaRecorder;
let audioChunks = [];

const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const status = document.getElementById("status");
const player = document.getElementById("player");

recordBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();

  audioChunks = [];
  status.innerText = "🎤 Recording...";
  recordBtn.disabled = true;
  stopBtn.disabled = false;

  mediaRecorder.ondataavailable = event => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    const audioUrl = URL.createObjectURL(audioBlob);
    player.src = audioUrl;

    // store for next step (backend upload)
    window.recordedAudio = audioBlob;

    status.innerText = "✅ Recording complete";
  };
};

stopBtn.onclick = () => {
  mediaRecorder.stop();
  recordBtn.disabled = false;
  stopBtn.disabled = true;
};
