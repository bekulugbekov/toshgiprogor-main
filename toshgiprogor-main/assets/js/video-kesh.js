document.addEventListener("DOMContentLoaded", async function () {
  const VIDEO_DB = "videoCacheDB";
  const STORE_NAME = "videos";
  // Video almashtirilganda kesh kalitini ham yangilash SHART — aks holda
  // qaytgan tashrifchilar IndexedDB'dagi eski videoni ko'rishda davom etadi.
  const VIDEO_KEY = "cachedVideo_v2"; // tashkent2.mp4 (sifatliroq)
  const video = document.getElementById("bg-video");
  const source = document.getElementById("video-source");
  if (!video || !source) return;
  const VIDEO_URL = source.getAttribute("src");
  const overlay = document.querySelector(".video-overlay");

  // Video ijro etilishi mumkin bo'lganda — ko'rsatamiz, statik overlay rasmni so'ndiramiz.
  function reveal() {
    video.style.opacity = "1";
    if (overlay) {
      overlay.style.opacity = "0";
      setTimeout(() => (overlay.style.display = "none"), 500);
    }
  }
  // canplay yetarli (readyState 3) — to'liq yuklanishni kutmaymiz.
  video.addEventListener("canplay", reveal);

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
      request.onerror = () => reject("IndexedDB ochishda xatolik");
    });
  }

  async function saveVideo(blob) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(blob, VIDEO_KEY);
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

  // 1) IndexedDB'da kesh bormi? Bo'lsa — darhol blob'dan (tez, to'liq sifat).
  let cachedBlob = null;
  try {
    cachedBlob = await getVideo();
  } catch (e) {
    cachedBlob = null;
  }

  if (cachedBlob instanceof Blob) {
    source.src = URL.createObjectURL(cachedBlob);
    video.load();
  } else {
    // 2) Kesh yo'q — videoni TO'LIQ yuklashни kutmaymiz: <source src> orqali
    //    to'g'ridan-to'g'ri progressiv stream qilinadi (to'liq sifat, darhol).
    //    Keyingi tashrif uchun fonda IndexedDB'ga keshlaymiz.
    video.load();
    fetch(VIDEO_URL)
      .then((r) => (r.ok ? r.blob() : null))
      .then((blob) => {
        if (blob) saveVideo(blob).catch(() => {});
      })
      .catch(() => {});
  }

  // Avtomatik ijro (muted autoplay — promise rad etilsa jim e'tiborsiz qoldiramiz).
  const p = video.play();
  if (p && p.catch) p.catch(() => {});
});
