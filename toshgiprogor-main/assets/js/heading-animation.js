$(function () {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin);

  // Title Animation
  let headingAnimationLines = gsap.utils.toArray(".heading-animation");

  headingAnimationLines.forEach((headingAnimationLine) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: headingAnimationLine,
        start: "top 90%",
        end: "bottom 60%",
        scrub: false,
        markers: false,
        toggleActions: "play none none none",
      },
    });

    const headingSplitLine = new SplitText(headingAnimationLine, {
      type: "words",
    });
    gsap.set(headingAnimationLine, { perspective: 400 });
    headingSplitLine.split({ type: "words" });
    tl.from(headingSplitLine.words, {
      duration: 1,
      delay: 0.2,
      opacity: 0,
      rotationX: -50,
      force3D: true,
      transformOrigin: "top center -50",
      stagger: 0.1,
    });
  });
});
