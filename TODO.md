# Fluenta — Next Steps (Phase 2)

## 1. Prompt Mode (Scripted Assessment)
Show an optional sentence on screen for the user to read aloud. When a reference text is provided, Azure's pronunciation assessment runs in **scripted mode**, which gives more precise word-level and phoneme-level feedback because it knows exactly what the user was trying to say. This also enables the **completeness** score to be more meaningful (did they say every word?). The UI would show a toggle or a card with the target sentence above the record button, and the word-by-word results would align against the reference text, highlighting skipped or mispronounced words.

## 2. Audio Playback
Let users play back their own recording after they stop. This is high-value because hearing yourself is one of the most effective ways to notice pronunciation issues. The audio Blob is already captured by `useRecorder` — this just needs a small `<audio>` element or a play button that creates an `Audio` object from the blob URL. Display it alongside the results so users can listen while reviewing their scores.

## 3. Haptic Feedback
On mobile devices, trigger a short vibration on record start and stop to give tactile confirmation that the action registered. Use the `navigator.vibrate()` API (supported on Android Chrome; ignored on iOS Safari). A short pulse (50ms) on start and a double-pulse (50ms, pause, 50ms) on stop would feel natural without being intrusive. Wrap in a feature-detection check so it degrades silently on unsupported browsers.
