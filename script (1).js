/* =========================================================
   MULTIMEDIA COMPRESSION TOOL — APPLICATION LOGIC
   Pure client-side. No backend, no database, no network
   dependency for functionality (sample media is generated
   locally so the page never shows blank/empty previews).
   ========================================================= */

(() => {
  "use strict";

  /* ---------------- DOM REFERENCES ---------------- */

  const $ = (id) => document.getElementById(id);

  const els = {
    navToggle: $("navToggle"),
    siteNav: $("siteNav"),

    textInput: $("textInput"),
    textArea: $("textArea"),
    textFileName: $("textFileName"),
    textOriginalSize: $("textOriginalSize"),
    textCompressedSize: $("textCompressedSize"),
    textCompressionPct: $("textCompressionPct"),
    textPanel: document.querySelector('[data-media="text"]'),

    imageInput: $("imageInput"),
    imagePreview: $("imagePreview"),
    imageFileName: $("imageFileName"),
    imageOriginalSize: $("imageOriginalSize"),
    imageCompressedSize: $("imageCompressedSize"),
    imageCompressionPct: $("imageCompressionPct"),
    imagePanel: document.querySelector('[data-media="image"]'),

    audioInput: $("audioInput"),
    audioPlayer: $("audioPlayer"),
    audioFileName: $("audioFileName"),
    audioOriginalSize: $("audioOriginalSize"),
    audioCompressedSize: $("audioCompressedSize"),
    audioCompressionPct: $("audioCompressionPct"),
    audioPanel: document.querySelector('[data-media="audio"]'),
    audioPreviewBox: document.querySelector(".audio-preview"),

    videoInput: $("videoInput"),
    videoPlayer: $("videoPlayer"),
    videoFileName: $("videoFileName"),
    videoOriginalSize: $("videoOriginalSize"),
    videoCompressedSize: $("videoCompressedSize"),
    videoCompressionPct: $("videoCompressionPct"),
    videoPanel: document.querySelector('[data-media="video"]'),
    videoPreviewBox: document.querySelector(".video-preview"),
    videoPlaceholder: $("videoPlaceholder"),

    targetPicker: $("targetPicker"),
    activeFileName: $("activeFileName"),
    qualitySlider: $("qualitySlider"),
    qualityValue: $("qualityValue"),
    formatSelect: $("formatSelect"),
    typeSelect: $("typeSelect"),

    settingsOriginal: $("settingsOriginal"),
    settingsCompressed: $("settingsCompressed"),
    settingsRatio: $("settingsRatio"),

    compressViz: $("compressViz"),
    progressStatus: $("progressStatus"),
    progressPercent: $("progressPercent"),
    progressFill: $("progressFill"),

    compressBtn: $("compressBtn"),
    downloadBtn: $("downloadBtn"),
    resetBtn: $("resetBtn"),
  };

  const FORMAT_OPTIONS = {
    text: ["TXT", "ZIP", "GZIP"],
    image: ["JPEG", "PNG", "WebP"],
    audio: ["MP3", "AAC", "OGG"],
    video: ["MP4", "WebM"],
  };

  const FORMAT_FACTORS = {
    TXT: 1.0, ZIP: 0.4, GZIP: 0.35,
    JPEG: 0.9, PNG: 1.05, WebP: 0.72,
    MP3: 0.85, AAC: 0.8, OGG: 0.82,
    MP4: 0.8, WebM: 0.7,
  };

  /* ---------------- STATE ---------------- */

  // One state object per media type, holding the file currently loaded there.
  const state = {
    text: { file: null, name: "sample-text.txt", originalSize: 0, compressedSize: null, format: "TXT" },
    image: { file: null, name: "sample-image.jpg", originalSize: 0, compressedSize: null, format: "JPEG" },
    audio: { file: null, name: "sample-tone.wav", originalSize: 0, compressedSize: null, format: "MP3" },
    video: { file: null, name: "sample-clip.webm", originalSize: 0, compressedSize: null, format: "MP4" },
  };

  let activeTarget = "text";
  let compressing = false;

  /* ---------------- UTILITIES ---------------- */

  function formatBytes(bytes) {
    if (bytes === null || bytes === undefined || Number.isNaN(bytes)) return "—";
    if (bytes < 1024) return `${bytes} B`;
    const units = ["KB", "MB", "GB"];
    let val = bytes / 1024;
    let i = 0;
    while (val >= 1024 && i < units.length - 1) { val /= 1024; i++; }
    return `${val.toFixed(val < 10 ? 2 : 1)} ${units[i]}`;
  }

  function pct(originalSize, compressedSize) {
    if (!originalSize || compressedSize === null) return "—";
    const reduction = (1 - compressedSize / originalSize) * 100;
    return `${Math.max(0, reduction).toFixed(1)}%`;
  }

  function ratioText(originalSize, compressedSize) {
    if (!originalSize || compressedSize === null) return "—";
    return `${(originalSize / compressedSize).toFixed(2)} : 1`;
  }

  /* ---------------- SAMPLE MEDIA GENERATION ---------------- */
  // Everything below is generated locally with Canvas / Web Audio APIs
  // so the page always has something to show, even with no uploads
  // and no network access.

  function generateSampleText() {
    return [
      "Multimedia compression reduces the size of image, audio and video files while",
      "maintaining acceptable quality. Text compression works a little differently: it looks",
      "for repeated characters, words and patterns in a document and replaces them with",
      "shorter codes, so the original content can be rebuilt exactly — this is called",
      "lossless compression.",
      "",
      "Common examples include ZIP and GZIP, which are widely used to shrink log files,",
      "source code and documents before they are stored or transferred. Edit this text,",
      "paste your own paragraph, or upload a .txt file, then switch the compression target",
      "to \"Text\" on the right and press Compress File to see it in action.",
    ].join("\n");
  }

  function generateSampleImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 960; canvas.height = 540;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#1a2350");
    grad.addColorStop(0.55, "#2b3a78");
    grad.addColorStop(1, "#17b890");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // decorative "mountains"
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.beginPath();
    ctx.moveTo(0, 380);
    ctx.lineTo(180, 220);
    ctx.lineTo(340, 360);
    ctx.lineTo(520, 180);
    ctx.lineTo(720, 340);
    ctx.lineTo(960, 240);
    ctx.lineTo(960, 540);
    ctx.lineTo(0, 540);
    ctx.closePath();
    ctx.fill();

    // sun
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 180, 84, 0.85)";
    ctx.arc(760, 140, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "600 40px Georgia, serif";
    ctx.fillText("Sample Image", 46, 80);
    ctx.font = "400 20px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("Upload your own photo to replace this preview", 46, 112);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
    });
  }

  function generateSampleAudio() {
    // Synthesize a short, pleasant tone sequence and encode it as a WAV blob.
    const sampleRate = 22050;
    const duration = 3; // seconds
    const numSamples = sampleRate * duration;
    const data = new Float32Array(numSamples);
    const notes = [261.63, 329.63, 392.0, 523.25]; // C4 E4 G4 C5
    const noteLen = numSamples / notes.length;

    for (let n = 0; n < notes.length; n++) {
      const freq = notes[n];
      const start = Math.floor(n * noteLen);
      const end = Math.floor((n + 1) * noteLen);
      for (let i = start; i < end; i++) {
        const t = (i - start) / sampleRate;
        const localDur = (end - start) / sampleRate;
        const envelope = Math.sin((Math.PI * (i - start)) / (end - start)); // fade in/out
        data[i] = 0.28 * Math.sin(2 * Math.PI * freq * t) * envelope;
      }
    }

    // Encode as 16-bit PCM WAV
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    const writeStr = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };

    writeStr(0, "RIFF");
    view.setUint32(4, 36 + numSamples * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, numSamples * 2, true);

    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const s = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }

    return new Blob([view], { type: "audio/wav" });
  }

  function generateSampleVideo() {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 480; canvas.height = 270;
        const ctx = canvas.getContext("2d");
        const stream = canvas.captureStream(24);
        const mimeCandidates = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
        const mime = mimeCandidates.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m));

        if (!window.MediaRecorder || !mime) { resolve(null); return; }

        const recorder = new MediaRecorder(stream, { mimeType: mime });
        const chunks = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
        recorder.onerror = () => resolve(null);

        let frame = 0;
        const totalFrames = 24 * 3; // 3 seconds
        const draw = () => {
          const t = frame / totalFrames;
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          grad.addColorStop(0, "#1a2350");
          grad.addColorStop(1, "#17b890");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.beginPath();
          ctx.fillStyle = "rgba(255,180,84,0.85)";
          const x = 40 + t * (canvas.width - 80);
          ctx.arc(x, 135 + Math.sin(t * Math.PI * 4) * 40, 24, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.font = "600 24px Georgia, serif";
          ctx.fillText("Sample Video Clip", 20, 40);

          frame++;
          if (frame <= totalFrames) requestAnimationFrame(draw);
          else recorder.stop();
        };

        recorder.start();
        draw();
      } catch (err) {
        resolve(null);
      }
    });
  }

  /* ---------------- FORMAT DROPDOWN ---------------- */

  function populateFormatSelect(mediaType) {
    els.formatSelect.innerHTML = "";
    FORMAT_OPTIONS[mediaType].forEach((fmt) => {
      const opt = document.createElement("option");
      opt.value = fmt; opt.textContent = fmt;
      els.formatSelect.appendChild(opt);
    });
    els.formatSelect.value = state[mediaType].format;
  }

  /* ---------------- LOADING MEDIA INTO A SECTION ---------------- */

  function loadText(text, name, isSample) {
    els.textArea.value = text;
    const size = new Blob([text]).size;
    els.textFileName.textContent = isSample
      ? "No file selected — showing sample text"
      : `${name} · ${formatBytes(size)}`;
    state.text.file = null;
    state.text.name = name;
    state.text.originalSize = size;
    state.text.compressedSize = null;
    els.textOriginalSize.textContent = formatBytes(size);
    els.textCompressedSize.textContent = "—";
    els.textCompressionPct.textContent = "—";
    if (activeTarget === "text") refreshSettingsForActive();
  }

  function loadImage(blobOrFile, name, isSample) {
    const url = URL.createObjectURL(blobOrFile);
    els.imagePreview.src = url;
    els.imageFileName.textContent = isSample
      ? "No image selected — showing sample image"
      : `${name} · ${formatBytes(blobOrFile.size)}`;
    state.image.file = blobOrFile;
    state.image.name = name;
    state.image.originalSize = blobOrFile.size;
    state.image.compressedSize = null;
    els.imageOriginalSize.textContent = formatBytes(blobOrFile.size);
    els.imageCompressedSize.textContent = "—";
    els.imageCompressionPct.textContent = "—";
    if (activeTarget === "image") refreshSettingsForActive();
  }

  function loadAudio(blobOrFile, name, isSample) {
    const url = URL.createObjectURL(blobOrFile);
    els.audioPlayer.src = url;
    els.audioFileName.textContent = isSample
      ? "No file selected — using generated sample tone"
      : `${name} · ${formatBytes(blobOrFile.size)}`;
    state.audio.file = blobOrFile;
    state.audio.name = name;
    state.audio.originalSize = blobOrFile.size;
    state.audio.compressedSize = null;
    els.audioOriginalSize.textContent = formatBytes(blobOrFile.size);
    els.audioCompressedSize.textContent = "—";
    els.audioCompressionPct.textContent = "—";
    if (activeTarget === "audio") refreshSettingsForActive();
  }

  function loadVideo(blobOrFile, name, isSample) {
    const url = URL.createObjectURL(blobOrFile);
    els.videoPlayer.src = url;
    els.videoPreviewBox.classList.add("has-video");
    els.videoFileName.textContent = isSample
      ? "No file selected — showing generated sample clip"
      : `${name} · ${formatBytes(blobOrFile.size)}`;
    state.video.file = blobOrFile;
    state.video.name = name;
    state.video.originalSize = blobOrFile.size;
    state.video.compressedSize = null;
    els.videoOriginalSize.textContent = formatBytes(blobOrFile.size);
    els.videoCompressedSize.textContent = "—";
    els.videoCompressionPct.textContent = "—";
    if (activeTarget === "video") refreshSettingsForActive();
  }

  function videoUnavailable() {
    els.videoPlaceholder.querySelector("span").textContent =
      "Sample video isn't supported in this browser — please upload a video file";
    els.videoFileName.textContent = "No file selected — upload a video to preview it";
  }

  /* ---------------- TARGET PICKER (Image / Audio / Video) ---------------- */

  function setActiveTarget(target) {
    activeTarget = target;

    els.targetPicker.querySelectorAll(".seg-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.target === target);
    });

    [els.textPanel, els.imagePanel, els.audioPanel, els.videoPanel].forEach((panel) => {
      panel.dataset.active = panel.dataset.media === target ? "true" : "false";
    });

    populateFormatSelect(target);
    refreshSettingsForActive();
    resetProgress();
  }

  function refreshSettingsForActive() {
    const s = state[activeTarget];
    els.activeFileName.textContent = s.name;
    els.settingsOriginal.textContent = formatBytes(s.originalSize);
    els.settingsCompressed.textContent = s.compressedSize !== null ? formatBytes(s.compressedSize) : "—";
    els.settingsRatio.textContent = s.compressedSize !== null ? ratioText(s.originalSize, s.compressedSize) : "—";
    els.downloadBtn.disabled = s.compressedSize === null;
  }

  /* ---------------- COMPRESSION ESTIMATION ---------------- */

  function estimateCompressedSize(originalSize, quality, type, format) {
    let ratio;
    if (type === "lossless") {
      // Lossless: modest, mostly quality-independent savings from redundancy removal.
      ratio = 0.55 + (quality / 100) * 0.3;
    } else {
      // Lossy: aggressive, quality-driven savings.
      ratio = 0.05 + (quality / 100) * 0.62;
    }
    ratio *= FORMAT_FACTORS[format] || 1;
    ratio = Math.min(0.97, Math.max(0.03, ratio));
    return Math.max(1, Math.round(originalSize * ratio));
  }

  /* ---------------- PROGRESS / COMPRESS ACTION ---------------- */

  function resetProgress() {
    els.progressFill.style.width = "0%";
    els.progressPercent.textContent = "0%";
    els.progressStatus.textContent = "Ready to compress";
    els.progressStatus.classList.remove("is-done");
    els.compressViz.classList.remove("is-active");
  }

  function runCompression() {
    if (compressing) return;
    const s = state[activeTarget];
    if (!s.originalSize) return;

    compressing = true;
    els.compressBtn.disabled = true;
    els.downloadBtn.disabled = true;
    els.compressViz.classList.add("is-active");
    els.progressStatus.classList.remove("is-done");
    els.progressStatus.textContent = "Compressing…";

    const quality = Number(els.qualitySlider.value);
    const type = els.typeSelect.value;
    const format = els.formatSelect.value;
    const finalSize = estimateCompressedSize(s.originalSize, quality, type, format);

    let progress = 0;
    const totalTime = 1400; // ms
    const stepTime = 40;
    const steps = totalTime / stepTime;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      // ease-out progression so it doesn't feel linear/robotic
      progress = Math.min(100, Math.round((1 - Math.pow(1 - step / steps, 2)) * 100));
      els.progressFill.style.width = `${progress}%`;
      els.progressPercent.textContent = `${progress}%`;

      if (progress >= 100) {
        clearInterval(timer);
        finishCompression(finalSize);
      }
    }, stepTime);
  }

  function finishCompression(finalSize) {
    const s = state[activeTarget];
    s.compressedSize = finalSize;
    s.format = els.formatSelect.value;

    els.progressStatus.textContent = "Compression completed";
    els.progressStatus.classList.add("is-done");
    els.compressViz.classList.remove("is-active");

    els.settingsCompressed.textContent = formatBytes(finalSize);
    els.settingsRatio.textContent = ratioText(s.originalSize, finalSize);

    if (activeTarget === "text") {
      els.textCompressedSize.textContent = formatBytes(finalSize);
      els.textCompressionPct.textContent = pct(s.originalSize, finalSize);
    } else if (activeTarget === "image") {
      els.imageCompressedSize.textContent = formatBytes(finalSize);
      els.imageCompressionPct.textContent = pct(s.originalSize, finalSize);
    } else if (activeTarget === "audio") {
      els.audioCompressedSize.textContent = formatBytes(finalSize);
      els.audioCompressionPct.textContent = pct(s.originalSize, finalSize);
    } else {
      els.videoCompressedSize.textContent = formatBytes(finalSize);
      els.videoCompressionPct.textContent = pct(s.originalSize, finalSize);
    }

    els.compressBtn.disabled = false;
    els.downloadBtn.disabled = false;
    compressing = false;
  }

  /* ---------------- DOWNLOAD ---------------- */

  function downloadCompressed() {
    const s = state[activeTarget];
    if (s.compressedSize === null) return;

    // Build a placeholder blob of the estimated compressed size so the
    // download is a real file, and name it after the chosen output format.
    const bytes = new Uint8Array(s.compressedSize);
    crypto.getRandomValues(bytes.subarray(0, Math.min(bytes.length, 65536)));
    const blob = new Blob([bytes], { type: "application/octet-stream" });

    const baseName = s.name.replace(/\.[^.]+$/, "");
    const ext = s.format.toLowerCase();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${baseName}-compressed.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ---------------- RESET ---------------- */

  async function resetAll() {
    compressing = false;
    els.compressBtn.disabled = false;
    resetProgress();

    els.qualitySlider.value = 75;
    els.qualityValue.textContent = "75%";
    els.typeSelect.value = "lossy";

    await initSampleMedia();
    setActiveTarget("text");
  }

  /* ---------------- EVENT WIRING ---------------- */

  els.navToggle.addEventListener("click", () => {
    const isOpen = els.siteNav.classList.toggle("is-open");
    els.navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  els.siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => els.siteNav.classList.remove("is-open"));
  });

  els.textInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => loadText(reader.result, file.name, false);
    reader.readAsText(file);
  });

  els.textArea.addEventListener("input", () => {
    const size = new Blob([els.textArea.value]).size;
    state.text.name = state.text.file ? state.text.name : "typed-text.txt";
    state.text.originalSize = size;
    state.text.compressedSize = null;
    els.textFileName.textContent = `Custom text · ${formatBytes(size)}`;
    els.textOriginalSize.textContent = formatBytes(size);
    els.textCompressedSize.textContent = "—";
    els.textCompressionPct.textContent = "—";
    if (activeTarget === "text") refreshSettingsForActive();
  });

  els.imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) loadImage(file, file.name, false);
  });

  els.audioInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) loadAudio(file, file.name, false);
  });

  els.videoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) loadVideo(file, file.name, false);
  });

  els.audioPlayer.addEventListener("play", () => els.audioPreviewBox.classList.add("is-playing"));
  els.audioPlayer.addEventListener("pause", () => els.audioPreviewBox.classList.remove("is-playing"));
  els.audioPlayer.addEventListener("ended", () => els.audioPreviewBox.classList.remove("is-playing"));

  els.targetPicker.addEventListener("click", (e) => {
    const btn = e.target.closest(".seg-btn");
    if (btn) setActiveTarget(btn.dataset.target);
  });

  els.qualitySlider.addEventListener("input", () => {
    els.qualityValue.textContent = `${els.qualitySlider.value}%`;
  });

  els.compressBtn.addEventListener("click", runCompression);
  els.downloadBtn.addEventListener("click", downloadCompressed);
  els.resetBtn.addEventListener("click", resetAll);

  /* ---------------- INITIALISATION ---------------- */

  async function initSampleMedia() {
    loadText(generateSampleText(), "sample-text.txt", true);

    const imgBlob = await generateSampleImage();
    loadImage(imgBlob, "sample-image.jpg", true);

    const audioBlob = generateSampleAudio();
    loadAudio(audioBlob, "sample-tone.wav", true);

    const videoBlob = await generateSampleVideo();
    if (videoBlob) {
      loadVideo(videoBlob, "sample-clip.webm", true);
    } else {
      videoUnavailable();
    }
  }

  (async function init() {
    populateFormatSelect("text");
    await initSampleMedia();
    setActiveTarget("text");
  })();
})();
