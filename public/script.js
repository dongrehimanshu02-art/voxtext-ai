const audioInput = document.getElementById("audioFile");
const dropzone = document.getElementById("dropzone");
const filePreview = document.getElementById("filePreview");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const audioPlayer = document.getElementById("audioPlayer");
const transcribeBtn = document.getElementById("transcribeBtn");
const transcript = document.getElementById("transcript");
const errorBox = document.getElementById("errorBox");
const modeNote = document.getElementById("modeNote");
const apiStatus = document.getElementById("apiStatus");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resultLabel = document.getElementById("resultLabel");

let selectedFile = null;
let currentTranscript = "";
let mode = "demo";
let apiConfigured = false;

async function checkStatus() {
  try {
    const response = await fetch("/api/status");
    const data = await response.json();
    apiConfigured = data.apiConfigured;
    apiStatus.textContent = apiConfigured ? "API configured" : "Demo ready · API not configured";
  } catch {
    apiStatus.textContent = "Server connection unavailable";
  }
}
checkStatus();

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}
function clearError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}
function setFile(file) {
  clearError();
  if (!file) return;
  const ext = file.name.split(".").pop().toLowerCase();
  if (!["wav", "flac"].includes(ext)) return showError("Please choose a WAV or FLAC file.");
  if (file.size > 10 * 1024 * 1024) return showError("This file is larger than 10 MB.");
  selectedFile = file;
  fileName.textContent = file.name;
  fileSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
  filePreview.classList.remove("hidden");
  audioPlayer.src = URL.createObjectURL(file);
  audioPlayer.classList.remove("hidden");
  dropzone.classList.add("hidden");
  transcript.innerHTML = '<div class="empty-state"><span class="quote-mark">“</span><p>Ready to transcribe.</p><small>Your output will appear here.</small></div>';
  currentTranscript = "";
  copyBtn.disabled = downloadBtn.disabled = true;
  resultLabel.textContent = "AUDIO READY";
}
audioInput.addEventListener("change", e => setFile(e.target.files[0]));
["dragenter", "dragover"].forEach(type => dropzone.addEventListener(type, e => { e.preventDefault(); dropzone.classList.add("dragover"); }));
["dragleave", "drop"].forEach(type => dropzone.addEventListener(type, e => { e.preventDefault(); dropzone.classList.remove("dragover"); }));
dropzone.addEventListener("drop", e => setFile(e.dataTransfer.files[0]));

document.getElementById("removeFile").addEventListener("click", () => {
  selectedFile = null;
  audioInput.value = "";
  audioPlayer.pause();
  audioPlayer.removeAttribute("src");
  audioPlayer.classList.add("hidden");
  filePreview.classList.add("hidden");
  dropzone.classList.remove("hidden");
  resultLabel.textContent = "WAITING FOR AUDIO";
  clearError();
});

document.querySelectorAll(".mode-btn").forEach(button => {
  button.addEventListener("click", () => {
    mode = button.dataset.mode;
    document.querySelectorAll(".mode-btn").forEach(b => b.classList.toggle("active", b === button));
    if (mode === "demo") {
      modeNote.innerHTML = "<strong>Demo mode</strong> — explore the workflow using a sample transcript. No API key or billing account required.";
      transcribeBtn.innerHTML = "<span>✦</span> Run demo transcription";
    } else {
      modeNote.innerHTML = apiConfigured
        ? "<strong>Live API mode</strong> — your server has an API key configured. Real transcription requests may incur Google Cloud charges."
        : "<strong>Live API mode</strong> — no key is configured. Add your own key to the server .env file and restart the app. Billing and the Speech-to-Text API must be enabled in your Google Cloud project.";
      transcribeBtn.innerHTML = "<span>✦</span> Transcribe with Google";
    }
    clearError();
  });
});

const demoSamples = {
  "en-US": "Hello and welcome to VoxText AI. This is a sample audio transcription created to demonstrate how speech recognition can turn spoken language into readable text. You can connect your own Google Cloud Speech-to-Text API to transcribe your actual audio.",
  "en-IN": "Hello and welcome. This is a sample English transcription with an Indian language setting. VoxText AI helps convert spoken words into readable text.",
  "es-ES": "Hola y bienvenidos a VoxText AI. Esta es una transcripción de ejemplo que muestra cómo la tecnología de reconocimiento de voz puede convertir el audio en texto.",
  "hi-IN": "नमस्ते और VoxText AI में आपका स्वागत है। यह एक उदाहरण ट्रांसक्रिप्शन है, जो दिखाता है कि स्पीच रिकग्निशन तकनीक आवाज़ को लिखित टेक्स्ट में कैसे बदल सकती है।",
  "fr-FR": "Bonjour et bienvenue sur VoxText AI. Ceci est une transcription de démonstration qui montre comment la reconnaissance vocale transforme la parole en texte.",
  "de-DE": "Hallo und willkommen bei VoxText AI. Dies ist eine Beispieltranskription, die zeigt, wie Spracherkennung gesprochene Sprache in Text umwandelt."
};

transcribeBtn.addEventListener("click", async () => {
  clearError();
  if (!selectedFile) return showError("Please upload a WAV or FLAC audio file first.");
  transcribeBtn.disabled = true;
  transcribeBtn.textContent = "Processing audio…";
  try {
    let text;
    if (mode === "demo") {
      await new Promise(resolve => setTimeout(resolve, 900));
      text = demoSamples[document.getElementById("language").value] || demoSamples["en-US"];
      resultLabel.textContent = "DEMO TRANSCRIPTION · SAMPLE TEXT";
    } else {
      if (!apiConfigured) throw new Error("No API key is configured on this server. Switch to Demo Mode, or configure GOOGLE_CLOUD_API_KEY in .env and restart the server.");
      const formData = new FormData();
      formData.append("audio", selectedFile);
      formData.append("languageCode", document.getElementById("language").value);
      const response = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Transcription failed.");
      text = data.transcript;
      resultLabel.textContent = "GOOGLE CLOUD SPEECH-TO-TEXT";
    }
    currentTranscript = text;
    transcript.textContent = text;
    copyBtn.disabled = downloadBtn.disabled = false;
  } catch (error) {
    showError(error.message);
  } finally {
    transcribeBtn.disabled = false;
    transcribeBtn.innerHTML = mode === "demo" ? "<span>✦</span> Run demo transcription" : "<span>✦</span> Transcribe with Google";
  }
});

copyBtn.addEventListener("click", async () => {
  if (!currentTranscript) return;
  try {
    await navigator.clipboard.writeText(currentTranscript);
    copyBtn.textContent = "Copied ✓";
    setTimeout(() => copyBtn.textContent = "Copy text", 1400);
  } catch { showError("Clipboard access was blocked by your browser. Select and copy the text manually."); }
});
downloadBtn.addEventListener("click", () => {
  if (!currentTranscript) return;
  const blob = new Blob([currentTranscript], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "voxtext-transcription.txt"; a.click();
  URL.revokeObjectURL(url);
});
