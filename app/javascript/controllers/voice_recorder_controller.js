import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["start", "stop", "status", "timer", "audio", "voiceInput", "voiceName", "photos", "photoName", "gallery"]

  connect() {
    this.recorder = null
    this.chunks = []
    this.startedAt = null
    this.timerId = null
  }

  async start() {
    if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) {
      this.statusTarget.textContent = "Voice recording is not supported in this browser."
      return
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find((type) => MediaRecorder.isTypeSupported(type))
    this.recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
    this.chunks = []
    this.recorder.addEventListener("dataavailable", (event) => this.chunks.push(event.data))
    this.recorder.addEventListener("stop", () => this.finishRecording(stream))
    this.recorder.addEventListener("error", () => {
      stream.getTracks().forEach((track) => track.stop())
      this.statusTarget.textContent = "The browser could not finish this recording."
      this.startTarget.hidden = false
      this.stopTarget.hidden = true
    })
    this.recorder.start()
    this.startedAt = Date.now()
    this.timerId = window.setInterval(() => this.updateTimer(), 250)
    this.startTarget.hidden = true
    this.stopTarget.hidden = false
    this.statusTarget.textContent = "Recording your note..."
  }

  stop() {
    this.recorder?.stop()
    this.stopTarget.hidden = true
    this.statusTarget.textContent = "Preparing your voice note..."
    window.clearInterval(this.timerId)
  }

  removeVoice() {
    this.audioTarget.removeAttribute("src")
    this.audioTarget.hidden = true
    this.voiceInputTarget.value = ""
    this.startTarget.hidden = false
    this.statusTarget.textContent = "No voice note attached"
    this.voiceNameTarget.textContent = "Choose an audio file instead"
    this.timerTarget.textContent = "00:00"
  }

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

  previewAudioFile() {
    const file = this.voiceInputTarget.files[0]
    if (!file) return

    this.audioTarget.src = URL.createObjectURL(file)
    this.audioTarget.load()
    this.audioTarget.hidden = false
    this.startTarget.hidden = true
    this.statusTarget.textContent = "Audio file ready"
    this.voiceNameTarget.textContent = file.name
  }

  finishRecording(stream) {
    stream.getTracks().forEach((track) => track.stop())
    const blob = new Blob(this.chunks, { type: this.recorder.mimeType || "audio/webm" })
    const extension = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm"
    const file = new File([blob], `voice-note-${Date.now()}.${extension}`, { type: blob.type })
    const transfer = new DataTransfer()
    transfer.items.add(file)
    this.voiceInputTarget.files = transfer.files
    this.audioTarget.src = URL.createObjectURL(blob)
    this.audioTarget.load()
    this.audioTarget.hidden = false
    this.startTarget.hidden = true
    this.statusTarget.textContent = "Voice note ready"
    this.voiceNameTarget.textContent = file.name
  }

  updateTimer() {
    const seconds = Math.floor((Date.now() - this.startedAt) / 1000)
    this.timerTarget.textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
  }
}
