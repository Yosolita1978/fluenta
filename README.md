# Fluenta

A pronunciation practice app that gives you real-time feedback on your English speech using Azure Cognitive Services.

Record yourself speaking, and get detailed scores on accuracy, fluency, completeness, and prosody — plus a word-by-word breakdown showing exactly which sounds need work.

## Features

- **One-tap recording** with auto-stop at 60 seconds
- **Pronunciation assessment** powered by Azure Speech SDK (unscripted mode, en-US)
- **Overall scores** for accuracy, fluency, completeness, and prosody
- **Word-level breakdown** — words scored below 70 are highlighted with phoneme-level detail
- **Installable PWA** — add to your home screen for a native app experience
- **Mobile-first** design with dark theme and smooth animations
- **Secure** — Azure API keys stay server-side, never exposed to the browser

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Azure Cognitive Services Speech SDK](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/pronunciation-assessment)

## Getting Started

### Prerequisites

- Node.js 20+
- An [Azure Speech Services](https://azure.microsoft.com/en-us/products/ai-services/speech-services) resource (free tier works)

### Setup

1. Clone the repository:

```bash
git clone <your-repo-url>
cd fluenta-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the project root:

```
AZURE_SPEECH_KEY=your-azure-speech-key
AZURE_SPEECH_REGION=your-azure-region
```

4. Start the dev server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) on your browser or phone.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
app/
  page.tsx           # Main UI — record button, status, results
  layout.tsx         # Root layout, fonts, PWA meta
  globals.css        # Theme, animations, custom styles
  icon.png           # Favicon (auto-served by Next.js)
  apple-icon.png     # iOS home screen icon
  api/assess/
    route.ts         # Server-side API — receives audio, calls Azure, returns scores
hooks/
  useRecorder.ts     # Microphone recording with format detection and auto-stop
  usePronunciationAssessment.ts  # Sends audio to /api/assess, parses results
lib/
  audioUtils.ts      # Browser-side WebM/OGG → WAV conversion
public/
  icon.png           # App icon
  logo.png           # Full logo (icon + text)
  manifest.json      # PWA manifest
  sw.js              # Service worker for caching and offline support
```

## How It Works

1. User taps the record button — the browser requests microphone access
2. Audio is captured via `MediaRecorder` using the best supported format (WebM, OGG, or MP4)
3. On stop, the audio is converted to 16kHz mono WAV in the browser using `OfflineAudioContext`
4. The WAV is sent to `/api/assess` — a Next.js API route that calls Azure Speech SDK server-side
5. Azure returns pronunciation scores and word/phoneme detail
6. Results are displayed with animated score arcs and color-coded word pills

## Roadmap

See [TODO.md](./TODO.md) for planned features:

- **Prompt Mode** — show a sentence to read for scripted assessment
- **Audio Playback** — listen back to your recording alongside results
- **Haptic Feedback** — vibrate on record start/stop on mobile

## License

MIT
