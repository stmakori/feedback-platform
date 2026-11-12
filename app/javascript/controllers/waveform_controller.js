import { Controller } from "@hotwired/stimulus"
import WaveSurfer from "wavesurfer"

// Waveform audio player for stored recordings: renders a scrubbable waveform
// with play/pause, elapsed/total time, and playback-speed control.
//
// Progressive enhancement: the markup ships a native <audio controls> that is
// visible by default, and a "player" wrapper that is hidden by default. When
// this controller connects and WaveSurfer initializes, we reveal the enhanced
// player and hide the native one. If anything fails, the native player stays.
export default class extends Controller {
  static targets = ["player", "container", "play", "current", "duration", "speed", "fallback"]
  static values = { url: String }

  connect() {
    if (!this.hasContainerTarget || !this.urlValue) return

    try {
      this.ws = WaveSurfer.create({
        container: this.containerTarget,
        url: this.urlValue,
        height: 56,
        waveColor: "#f0b5a6",
        progressColor: "#ef806d",
        cursorColor: "#1e2825",
        barWidth: 2,
        barGap: 2,
        barRadius: 2,
      })
    } catch (error) {
      return // native <audio> fallback stays visible
    }

    // JS is running and WaveSurfer instantiated — swap to the enhanced player.
    if (this.hasPlayerTarget) this.playerTarget.hidden = false
    if (this.hasFallbackTarget) this.fallbackTarget.hidden = true
    this.highlightSpeed(1)

    this.ws.on("ready", () => {
      if (this.hasDurationTarget) this.durationTarget.textContent = this.format(this.ws.getDuration())
    })
    this.ws.on("timeupdate", (time) => {
      if (this.hasCurrentTarget) this.currentTarget.textContent = this.format(time)
    })
    this.ws.on("play", () => this.reflectPlaying(true))
    this.ws.on("pause", () => this.reflectPlaying(false))
    this.ws.on("finish", () => this.reflectPlaying(false))
    this.ws.on("error", () => this.revertToFallback())
  }

  disconnect() {
    try { this.ws?.destroy() } catch (_) { /* already gone */ }
    this.ws = null
  }

  toggle() {
    this.ws?.playPause()
  }

  setSpeed(event) {
    const rate = parseFloat(event.currentTarget.dataset.rate || "1")
    this.ws?.setPlaybackRate(rate, true) // preserve pitch
    this.highlightSpeed(rate)
  }

  highlightSpeed(rate) {
    this.speedTargets.forEach((button) => {
      const active = parseFloat(button.dataset.rate) === rate
      button.classList.toggle("bg-[#1e2825]", active)
      button.classList.toggle("text-white", active)
      button.classList.toggle("text-[#1e2825]", !active)
    })
  }

  reflectPlaying(isPlaying) {
    if (!this.hasPlayTarget) return
    this.playTarget.textContent = isPlaying ? "Pause" : "Play"
    this.playTarget.setAttribute("aria-label", isPlaying ? "Pause" : "Play")
  }

  revertToFallback() {
    if (this.hasPlayerTarget) this.playerTarget.hidden = true
    if (this.hasFallbackTarget) this.fallbackTarget.hidden = false
  }

  format(seconds) {
    if (!isFinite(seconds)) return "00:00"
    const whole = Math.floor(seconds)
    return `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`
  }
}
