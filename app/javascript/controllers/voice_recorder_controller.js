import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["start", "stop", "status", "timer", "audio", "voiceInput", "photos", "gallery"]

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
    this.recorder = new MediaRecorder(stream)
    this.chunks = []
    this.recorder.addEventListener("dataavailable", (event) => this.chunks.push(event.data))
    this.recorder.addEventListener("stop", () => this.finishRecording(stream))
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
    this.timerTarget.textContent = "00:00"
  }

  previewImages() {
    this.galleryTarget.replaceChildren()
    Array.from(this.photosTarget.files).forEach((file) => {
      const image = document.createElement("img")
      image.src = URL.createObjectURL(file)
      image.alt = file.name
      image.className = "h-20 w-20 rounded-xl object-cover"
      this.galleryTarget.append(image)
    })
  }

  finishRecording(stream) {
    stream.getTracks().forEach((track) => track.stop())
    const blob = new Blob(this.chunks, { type: this.recorder.mimeType || "audio/webm" })
    const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: blob.type })
    const transfer = new DataTransfer()
    transfer.items.add(file)
    this.voiceInputTarget.files = transfer.files
    this.audioTarget.src = URL.createObjectURL(blob)
    this.audioTarget.hidden = false
    this.startTarget.hidden = true
    this.statusTarget.textContent = "Voice note ready"
  }

  updateTimer() {
    const seconds = Math.floor((Date.now() - this.startedAt) / 1000)
    this.timerTarget.textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
  }
}
