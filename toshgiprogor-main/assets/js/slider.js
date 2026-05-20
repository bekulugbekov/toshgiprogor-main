document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".slide-track");
  if (!track) return;

  // Seamless infinite loop: har bir slide ni klonlab ikki barobar ko'paytiramiz.
  // CSS @keyframes infinite-scroll: 0% → translateX(-50%) bo'lgani uchun
  // birinchi to'plamdan ikkinchisiga o'tish paytida keskin sakrash bo'lmaydi.
  const original = Array.from(track.children);
  original.forEach((slide) => {
    track.appendChild(slide.cloneNode(true));
  });

  // animationiteration: har bir aylanish tugaganda animatsiyani qayta ishga
  // tushirib drift (suzib ketish) ni oldini olamiz.
  track.addEventListener("animationiteration", () => {
    track.style.animation = "none";
    void track.offsetWidth; // reflow majburiy
    track.style.animation = "infinite-scroll 20s linear infinite";
  });
});
