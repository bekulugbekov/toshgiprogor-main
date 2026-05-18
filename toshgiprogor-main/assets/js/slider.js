document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".slide-track");

    track.addEventListener("animationiteration", () => {
        track.style.animation = "none";
        void track.offsetWidth;
        track.style.animation = "infinite-scroll 12s linear infinite";
    });
});
