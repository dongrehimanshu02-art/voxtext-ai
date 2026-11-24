require("dotenv").config();

const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GOOGLE_CLOUD_API_KEY;

app.use(express.static(path.join(__dirname, "public")));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".wav", ".flac"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error("Please upload a WAV or FLAC audio file."));
    }
    cb(null, true);
  }
});

app.get("/api/status", (req, res) => {
  res.json({ apiConfigured: Boolean(API_KEY) });
});

app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(503).json({
        error: "Google Cloud API key is not configured. Use Demo Mode or configure your own key in the server .env file."
      });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Choose a WAV or FLAC audio file first." });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const encoding = ext === ".flac" ? "FLAC" : "LINEAR16";
    const languageCode = String(req.body.languageCode || "en-US");

    const payload = {
      config: { encoding, languageCode },
      audio: { content: req.file.buffer.toString("base64") }
    };

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${encodeURIComponent(API_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();
    if (!response.ok) {
      const message = result.error?.message || "Google Speech-to-Text request failed.";
      return res.status(response.status).json({ error: message });
    }

    const transcript = (result.results || [])
      .map(item => (item.alternatives || []).map(a => a.transcript || "").join(" "))
      .filter(Boolean)
      .join("\n");

    res.json({
      transcript: transcript || "No speech was recognized in this audio.",
      languageCode,
      duration: result.totalBilledTime || null
    });
  } catch (error) {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "File is larger than 10 MB. Choose a smaller audio file." });
    }
    res.status(400).json({ error: error.message || "Unable to process this audio file." });
  }
});

app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message || "Upload failed." });
});

app.listen(PORT, () => {
  console.log(`VoxText AI is running at http://localhost:${PORT}`);
});
