# VoxText AI — Audio Transcriber

VoxText AI is a demo-first audio transcription web application. It lets visitors explore the transcription workflow without a paid API connection, and optionally supports real transcription through the user's own Google Cloud Speech-to-Text API key.

## Features

- Responsive dark dashboard interface
- WAV and FLAC file upload (10 MB maximum)
- Audio preview in the browser
- Demo mode with multilingual sample transcripts (no API key or billing required)
- Optional Google Cloud Speech-to-Text integration
- Copy transcription and download as `.txt`
- API key kept on the server in `.env`, never in browser JavaScript

## Requirements

- Node.js 18 or newer
- npm
- For real transcription only: a Google Cloud project with billing enabled and the Cloud Speech-to-Text API enabled

## Run locally

1. Extract the project ZIP and open the `VoxText-AI` folder in VS Code.
2. Open the VS Code terminal.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Create your local environment file:

   **Windows PowerShell**
   ```powershell
   Copy-Item .env.example .env
   ```

   **macOS / Linux / Cloud Shell**
   ```bash
   cp .env.example .env
   ```

5. Start the application:

   ```bash
   npm start
   ```

6. Open `http://localhost:3000` in your browser.

Demo Mode works immediately. It uses sample transcript text to demonstrate the UI; it does not claim to recognize the uploaded audio.

## Enable real Google Cloud transcription (optional)

1. Create or select a Google Cloud project.
2. Attach a billing account to the project.
3. Enable **Cloud Speech-to-Text API**.
4. Create an API key in Google Cloud Console.
5. Restrict the key to the Cloud Speech-to-Text API. For a production deployment, use a suitable server-side authentication method and secret manager.
6. Put the key in your local `.env` file:

   ```env
   GOOGLE_CLOUD_API_KEY=your_own_api_key_here
   PORT=3000
   ```

7. Stop and restart the Node server.
8. Select **Live API** in VoxText AI and upload a WAV or FLAC file.

**Important:** Never commit `.env`, paste API keys into frontend code, or share keys in screenshots. `.env` is ignored by Git. If a key is exposed, revoke it and create a replacement.

## Audio limitations

This starter project uses Google's synchronous `speech:recognize` endpoint with audio content sent inline. It is intended for short recordings (generally up to one minute) and files up to 10 MB in this app. WAV files should contain LINEAR16 audio; FLAC files should be valid FLAC. Very long recordings should use the appropriate long-running recognition workflow and Google Cloud Storage.

The encoding is selected from the file extension. This starter does not inspect or convert audio codecs, sample rates, or channel counts. If Google reports an audio-format error, convert the file to supported mono PCM WAV or FLAC and try again.

Language selection is sent to the API as a language code. Recognition quality depends on the audio, language, microphone, and API model support.

## Project structure

```text
VoxText-AI/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── uploads/
│   └── .gitkeep
├── server.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Tech stack

- HTML5, CSS3, JavaScript
- Node.js and Express
- Multer for in-memory file uploads
- Google Cloud Speech-to-Text REST API
- JSON and cURL-compatible HTTP API concepts

## Portfolio description

**VoxText AI** is a demo-first speech-to-text web application built with HTML, CSS, JavaScript, Node.js, and Express. It demonstrates an audio upload workflow and optional integration with Google Cloud Speech-to-Text API. The app includes multilingual demo output, audio preview, server-side API key configuration, and transcript export.

## Future improvements

- Long-running transcription for longer recordings
- Automatic audio format validation and conversion
- Speaker diarization and word-level timestamps
- Transcript history and user accounts
- Deployment with secure secret management and usage limits

## License

This project is provided for learning and portfolio demonstration. Review Google Cloud pricing and terms before enabling live API usage.
