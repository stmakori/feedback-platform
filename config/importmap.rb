# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin "wavesurfer", to: "wavesurfer.js" # vendored core build: vendor/javascript/wavesurfer.js (WaveSurfer.js v7)
pin_all_from "app/javascript/controllers", under: "controllers"
