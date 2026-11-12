import { Controller } from "@hotwired/stimulus"
import WaveSurfer from "wavesurfer"

// Client feedback composer: records a voice note (native MediaRecorder) with a
// live level meter, pause/resume, and re-record, then renders a scrubbable
// WaveSurfer preview so the client can review before submitting. The recorded
// blob is injected into the hidden <input type="file"> via DataTransfer so it
// uploads through the normal multipart form (Active Storage) — unchanged.
export default class extends Controller {
  static targets = [
    "start", "stop", "pause", "resume", "reRecord", "remove",
    "status", "timer", "meter",
    "preview", "previewPlay",
    "voiceInput", "voiceName",
    "photos", "photoName", "gallery",
  ]

  connect() {
    this.recorder = null
    this.chunks = []
    this.stream = null
    this.startedAt = null
    this.elapsedBeforePause = 0
    this.timerId = null
    this.audioContext = null
    this.analyser = null
    this.meterData = null
    this.meterRaf = null
    this.meterPaused = false
    this.previewWave = null
    this.previewUrl = null
  }

  disconnect() {
    this.teardownMeter()
    this.destroyPreview()
    this.stopStream()
  }

  async start() {
    if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) {
      this.statusTarget.textContent = "Voice recording is not supported in this browser."
      return
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (error) {
      this.statusTarget.textContent = "Microphone access was blocked. You can still choose an audio file below."
      return
    }

    const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find((type) => MediaRecorder.isTypeSupported(type))
    this.recorder = mimeType ? new MediaRecorder(this.stream, { mimeType }) : new MediaRecorder(this.stream)
    this.chunks = []
    this.recorder.addEventListener("dataavailable", (event) => { if (event.data.size > 0) this.chunks.push(event.data) })
    this.recorder.addEventListener("stop", () => this.finishRecording())
    this.recorder.addEventListener("error", () => this.handleRecorderError())

    this.destroyPreview()
    this.recorder.start()
    this.startedAt = Date.now()
    this.elapsedBeforePause = 0
    this.timerTarget.textContent = "00:00"
    this.timerId = window.setInterval(() => this.updateTimer(), 250)
    this.startMeter()
    this.setStates({ start: false, stop: true, pause: true, resume: false, reRecord: false, remove: false, previewPlay: false, meter: true })
    this.statusTarget.textContent = "Recording your note…"
  }

  pause() {
    if (this.recorder?.state !== "recording") return
    this.recorder.pause()
    this.elapsedBeforePause += Date.now() - this.startedAt
    window.clearInterval(this.timerId)
    this.meterPaused = true
    this.setStates({ pause: false, resume: true })
    this.statusTarget.textContent = "Paused"
  }

  resume() {
    if (this.recorder?.state !== "paused") return
    this.recorder.resume()
    this.startedAt = Date.now()
    this.timerId = window.setInterval(() => this.updateTimer(), 250)
    this.meterPaused = false
    this.setStates({ pause: true, resume: false })
    this.statusTarget.textContent = "Recording your note…"
  }

  stop() {
    if (!this.recorder || this.recorder.state === "inactive") return
    this.recorder.stop() // triggers finishRecording via the "stop" event
    window.clearInterval(this.timerId)
    this.setStates({ stop: false, pause: false, resume: false })
    this.statusTarget.textContent = "Preparing your voice note…"
  }

  finishRecording() {
    this.teardownMeter()
    this.stopStream()

    const blob = new Blob(this.chunks, { type: this.recorder?.mimeType || "audio/webm" })
    const extension = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm"
    const fileType = blob.type.split(";")[0].trim()
    const file = new File([blob], `voice-note-${Date.now()}.${extension}`, { type: fileType })

    const transfer = new DataTransfer()
    transfer.items.add(file)
    this.voiceInputTarget.files = transfer.files

    this.renderPreview(URL.createObjectURL(blob))
    this.voiceNameTarget.textContent = file.name
    this.statusTarget.textContent = "Voice note ready — review it below"
    this.setStates({ start: false, stop: false, pause: false, resume: false, reRecord: true, remove: true, previewPlay: true, meter: false })
  }

  // Chosen via the "Choose an audio file instead" fallback.
  previewAudioFile() {
    const file = this.voiceInputTarget.files[0]
    if (!file) return
    this.renderPreview(URL.createObjectURL(file))
    this.voiceNameTarget.textContent = file.name
    this.statusTarget.textContent = "Audio file ready — review it below"
    this.setStates({ start: false, stop: false, pause: false, resume: false, reRecord: true, remove: true, previewPlay: true, meter: false })
  }

  reRecord() {
    this.removeVoice()
    this.start()
  }

  removeVoice() {
    this.destroyPreview()
    this.voiceInputTarget.value = ""
    this.voiceNameTarget.textContent = "Choose an audio file instead"
    this.statusTarget.textContent = "No voice note attached"
    this.timerTarget.textContent = "00:00"
    this.setStates({ start: true, stop: false, pause: false, resume: false, reRecord: false, remove: false, previewPlay: false, meter: false })
  }

  // --- Waveform preview over the recorded/selected blob ---

  renderPreview(url) {
    this.destroyPreview()
    this.previewUrl = url
    this.previewTarget.hidden = false
    try {
      this.previewWave = WaveSurfer.create({
        container: this.previewTarget,
        url,
        height: 48,
        waveColor: "#f0b5a6",
        progressColor: "#ef806d",
        cursorColor: "#1e2825",
        barWidth: 2,
        barGap: 2,
        barRadius: 2,
      })
      this.previewWave.on("play", () => this.reflectPreview(true))
      this.previewWave.on("pause", () => this.reflectPreview(false))
      this.previewWave.on("finish", () => this.reflectPreview(false))
    } catch (error) {
      // The file is still attached for upload even if the preview can't render.
      this.previewTarget.hidden = true
      this.setStates({ previewPlay: false })
    }
  }

  togglePreview() {
    this.previewWave?.playPause()
  }

  reflectPreview(isPlaying) {
    if (this.hasPreviewPlayTarget) this.previewPlayTarget.textContent = isPlaying ? "Pause" : "Play"
  }

  destroyPreview() {
    try { this.previewWave?.destroy() } catch (_) { /* already gone */ }
    this.previewWave = null
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl)
      this.previewUrl = null
    }
    if (this.hasPreviewTarget) {
      this.previewTarget.hidden = true
      this.previewTarget.replaceChildren()
    }
    if (this.hasPreviewPlayTarget) this.previewPlayTarget.textContent = "Play"
  }

  // --- Live level meter (Web Audio analyser drawn on a canvas) ---

  startMeter() {
    if (!this.hasMeterTarget) return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      this.audioContext = new AudioCtx()
      const source = this.audioContext.createMediaStreamSource(this.stream)
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 1024
      source.connect(this.analyser)
      this.meterData = new Uint8Array(this.analyser.frequencyBinCount)
      this.meterPaused = false
      this.drawMeter()
    } catch (error) {
      // The meter is decorative; recording still works without it.
    }
  }

  drawMeter() {
    this.meterRaf = window.requestAnimationFrame(() => this.drawMeter())
    if (!this.analyser || this.meterPaused) return

    const canvas = this.meterTarget
    const width = canvas.width = canvas.clientWidth
    const height = canvas.height = canvas.clientHeight
    if (width === 0 || height === 0) return

    const ctx = canvas.getContext("2d")
    this.analyser.getByteFrequencyData(this.meterData)
    ctx.clearRect(0, 0, width, height)

    const bars = 32
    const step = Math.max(1, Math.floor(this.meterData.length / bars))
    const barWidth = width / bars
    ctx.fillStyle = "#ef806d"
    for (let i = 0; i < bars; i++) {
      const value = this.meterData[i * step] / 255
      const barHeight = Math.max(2, value * height)
      ctx.fillRect(i * barWidth + 1, (height - barHeight) / 2, barWidth - 2, barHeight)
    }
  }

  teardownMeter() {
    if (this.meterRaf) {
      window.cancelAnimationFrame(this.meterRaf)
      this.meterRaf = null
    }
    this.meterPaused = false
    try { this.audioContext?.close() } catch (_) { /* already closed */ }
    this.audioContext = null
    this.analyser = null
    if (this.hasMeterTarget) {
      const ctx = this.meterTarget.getContext("2d")
      ctx?.clearRect(0, 0, this.meterTarget.width, this.meterTarget.height)
    }
  }

  handleRecorderError() {
    this.teardownMeter()
    this.stopStream()
    window.clearInterval(this.timerId)
    this.statusTarget.textContent = "The browser could not finish this recording."
    this.setStates({ start: true, stop: false, pause: false, resume: false, reRecord: false, remove: false, previewPlay: false, meter: false })
  }

  // --- Photos (unchanged behaviour) ---

  previewImages() {
    this.galleryTarget.replaceChildren()
    this.photoNameTarget.textContent = this.photosTarget.files.length === 0 ? "Choose images" : `${this.photosTarget.files.length} image${this.photosTarget.files.length === 1 ? "" : "s"} selected`
    Array.from(this.photosTarget.files).forEach((file) => {
      const image = document.createElement("img")
      image.src = URL.createObjectURL(file)
      image.alt = file.name
      image.className = "h-20 w-20 rounded-xl object-cover"
      this.galleryTarget.append(image)
    })
  }

  // --- Helpers ---

  updateTimer() {
    const elapsed = this.elapsedBeforePause + (Date.now() - this.startedAt)
    const seconds = Math.floor(elapsed / 1000)
    this.timerTarget.textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
  }

  stopStream() {
    this.stream?.getTracks().forEach((track) => track.stop())
    this.stream = null
  }

  // Toggle visibility of any set of named targets: { start: true, stop: false, ... }
  setStates(states) {
    Object.entries(states).forEach(([name, visible]) => {
      const capitalized = name.charAt(0).toUpperCase() + name.slice(1)
      if (!this[`has${capitalized}Target`]) return
      this[`${name}Target`].hidden = !visible
    })
  }
}
