document.addEventListener("DOMContentLoaded", async function () {
    const VIDEO_DB = "videoCacheDB";
    const STORE_NAME = "videos";
    const VIDEO_KEY = "cachedVideo";
    const VIDEO_URL = "./assets/video/tashkent.mp4";

  
    const video = document.getElementById("bg-video");
    const source = document.getElementById("video-source");
    const overlay = document.querySelector(".video-overlay");
  
    async function openDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(VIDEO_DB, 1);
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("❌ IndexedDB ochishda xatolik!");
      });
    }
  
    async function saveVideo(blob) {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(blob, VIDEO_KEY);
      return tx.complete;
    }
  
    async function getVideo() {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      return new Promise((resolve) => {
        const request = store.get(VIDEO_KEY);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });
    }
  
    async function fetchAndCacheVideo() {
      try {
        const response = await fetch(VIDEO_URL);
        if (!response.ok) throw new Error("Video yuklab bo‘lmadi!");
        const blob = await response.blob();
        await saveVideo(blob);
        return blob;
      } catch (error) {
        console.error("⚠️ Video yuklashda xatolik:", error);
        return null;
      }
    }
  
    async function loadVideo() {
      let cachedBlob = await getVideo();
  
      if (!cachedBlob || !(cachedBlob instanceof Blob)) {
        cachedBlob = await fetchAndCacheVideo();
      } else {
      }
  
      if (cachedBlob && cachedBlob instanceof Blob) {
        source.src = URL.createObjectURL(cachedBlob);
        video.load();
      } else {
        console.warn("⚠️ Video yuklanmadi, fon rasmi qoldirildi.");
        video.style.display = "none";
      }
    }
  
    await loadVideo();
  
    video.oncanplay = () => {
      video.style.opacity = "1";
      setTimeout(() => {
        overlay.style.opacity = "0";
        setTimeout(() => (overlay.style.display = "none"), 500);
      }, 500);
    };
  
    setTimeout(() => {
      if (video.readyState < 3) {
        console.warn("⚠️ Video hali yuklanmadi, fon rasmi qoldirildi.");
        video.style.display = "none";
      }
    }, 5000);
  });
  