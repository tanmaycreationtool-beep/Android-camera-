(() => {
  "use strict";

  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const flashOverlay = document.getElementById("flash-overlay");
  const permissionScreen = document.getElementById("permission-screen");
  const permissionText = document.getElementById("permission-text");
  const retryBtn = document.getElementById("retry-btn");
  const counterEl = document.getElementById("counter");
  const gridEl = document.getElementById("grid");
  const gridToggle = document.getElementById("grid-toggle");
  const flashToggle = document.getElementById("flash-toggle");
  const shutterBtn = document.getElementById("shutter");
  const flipBtn = document.getElementById("flip-camera");
  const lastShotBtn = document.getElementById("last-shot");
  const lastShotImg = document.getElementById("last-shot-img");
  const gallery = document.getElementById("gallery");
  const galleryGrid = document.getElementById("gallery-grid");
  const galleryEmpty = document.getElementById("gallery-empty");
  const galleryCount = document.getElementById("gallery-count");
  const galleryClose = document.getElementById("gallery-close");
  const viewer = document.getElementById("viewer");
  const viewerImg = document.getElementById("viewer-img");
  const viewerIndex = document.getElementById("viewer-index");
  const viewerBack = document.getElementById("viewer-back");
  const viewerDownload = document.getElementById("viewer-download");
  const viewerDelete = document.getElementById("viewer-delete");

  let stream = null;
  let facingMode = "environment";
  let flashEnabled = false;
  let gridEnabled = false;
  let shots = [];
  let currentViewerIndex = -1;
  const STORAGE_KEY = "aperture-shots-v1";

  async function startCamera() {
    stopCamera();
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facingMode } }, audio: false });
      video.srcObject = stream;
      permissionScreen.classList.add("hidden");
    } catch (err) {
      permissionText.textContent = err && err.name === "NotAllowedError" ? "Camera access was denied. Enable it in your browser or app settings." : "Couldn't access the camera on this device.";
      permissionScreen.classList.remove("hidden");
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
  }

  retryBtn.addEventListener("click", startCamera);
  flipBtn.addEventListener("click", () => {
    facingMode = facingMode === "environment" ? "user" : "environment";
    startCamera();
  });
  gridToggle.addEventListener("click", () => {
    gridEnabled = !gridEnabled;
    gridEl.classList.toggle("hidden", !gridEnabled);
    gridToggle.classList.toggle("active", gridEnabled);
  });
  flashToggle.addEventListener("click", () => {
    flashEnabled = !flashEnabled;
    flashToggle.classList.toggle("active", flashEnabled);
  });
  shutterBtn.addEventListener("click", capturePhoto);

  function capturePhoto() {
    if (!video.videoWidth) return;
    if (flashEnabled) {
      flashOverlay.classList.remove("fire");
      void flashOverlay.offsetWidth;
      flashOverlay.classList.add("fire");
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    addShot(canvas.toDataURL("image/jpeg", 0.92));
  }

  function loadShots() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      shots = raw ? JSON.parse(raw) : [];
    } catch {
      shots = [];
    }
    renderCounter();
    renderLastShot();
  }
  function saveShots() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(shots)); } catch {}
  }
  function addShot(dataUrl) {
    shots.unshift({ dataUrl, ts: Date.now() });
    saveShots();
    renderCounter();
    renderLastShot();
  }
  function deleteShot(index) {
    shots.splice(index, 1);
    saveShots();
    renderCounter();
    renderLastShot();
    renderGallery();
  }
  function renderCounter() { counterEl.textContent = String(shots.length).padStart(3, "0"); }
  function renderLastShot() {
    if (shots.length > 0) {
      lastShotImg.src = shots[0].dataUrl;
      lastShotImg.hidden = false;
    } else {
      lastShotImg.hidden = true;
      lastShotImg.removeAttribute("src");
    }
  }

  lastShotBtn.addEventListener("click", openGallery);
  galleryClose.addEventListener("click", closeGallery);
  function openGallery() { renderGallery(); gallery.classList.remove("hidden"); }
  function closeGallery() { gallery.classList.add("hidden"); }
  function renderGallery() {
    galleryCount.textContent = `${shots.length} shot${shots.length === 1 ? "" : "s"}`;
    galleryGrid.innerHTML = "";
    if (shots.length === 0) { galleryEmpty.classList.remove("hidden"); return; }
    galleryEmpty.classList.add("hidden");
    shots.forEach((shot, i) => {
      const img = document.createElement("img");
      img.src = shot.dataUrl;
      img.alt = "";
      img.addEventListener("click", () => openViewer(i));
      galleryGrid.appendChild(img);
    });
  }

  function openViewer(index) {
    currentViewerIndex = index;
    renderViewer();
    viewer.classList.remove("hidden");
  }
  function renderViewer() {
    const shot = shots[currentViewerIndex];
    if (!shot) { closeViewer(); return; }
    viewerImg.src = shot.dataUrl;
    viewerIndex.textContent = `${currentViewerIndex + 1} / ${shots.length}`;
  }
  function closeViewer() {
    viewer.classList.add("hidden");
    currentViewerIndex = -1;
  }
  viewerBack.addEventListener("click", closeViewer);
  viewerDownload.addEventListener("click", () => {
    const shot = shots[currentViewerIndex];
    if (!shot) return;
    const a = document.createElement("a");
    a.href = shot.dataUrl;
    a.download = `aperture-${shot.ts}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
  viewerDelete.addEventListener("click", () => {
    if (currentViewerIndex < 0) return;
    const wasLast = currentViewerIndex === shots.length - 1;
    deleteShot(currentViewerIndex);
    if (shots.length === 0) closeViewer();
    else if (wasLast) { currentViewerIndex = shots.length - 1; renderViewer(); }
    else renderViewer();
  });

  loadShots();
  startCamera();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopCamera();
    else startCamera();
  });
})();
