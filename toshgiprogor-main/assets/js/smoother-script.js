$(function () {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

  ScrollTrigger.normalizeScroll(false);

  // create the smooth scroller FIRST!
  let smoother = ScrollSmoother.create({
    smooth: 2,
    effects: true,
  });

  // Hero ekranning yuqori qismida. Video/preloader yuklangach layout siljib,
  // ScrollTrigger pozitsiyalari eskiradi va yuqoridagi animatsiya ishga
  // tushmay, kontent (logo + sarlavha + tugma) ko'rinmay qolishi mumkin.
  // 1) Yuklanish tugagach pozitsiyalarni qayta hisoblaymiz (animatsiya ishlaydi)
  // 2) Xavfsizlik: animatsiya baribir ishlamasa, hero kontentini ko'rsatamiz.
  window.addEventListener("load", function () {
    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
      setTimeout(function () {
        ScrollTrigger.refresh();
      }, 600);
    }
  });

  setTimeout(function () {
    if (window.gsap) {
      gsap.set(
        ".hero-area .heading-animation, .hero-area .heading-animation *",
        { opacity: 1, clearProps: "opacity" }
      );
    }
  }, 3000);
});
