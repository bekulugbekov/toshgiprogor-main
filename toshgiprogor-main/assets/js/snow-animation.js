/**
 * Snow Animation Script
 * Creates falling snowflakes that adapt to dark/light mode
 */

(function () {
  "use strict";

  // Configuration
  const config = {
    snowflakeCount: 150, // Number of snowflakes (optimized for performance)
    snowflakeSymbols: ["❄", "❅", "❆", "*", "·"],
    minSize: 0.5,
    maxSize: 1.5,
    minSpeed: 3,
    maxSpeed: 8,
  };

  let snowContainer = null;
  let animationId = null;
  let snowflakes = [];

  /**
   * Initialize snow animation
   */
  function initSnow() {
    // Create snow container
    snowContainer = document.createElement("div");
    snowContainer.className = "snow-container";
    snowContainer.setAttribute("aria-hidden", "true");
    document.body.appendChild(snowContainer);

    // Create snowflakes
    createSnowflakes();

    // Listen for theme changes
    observeThemeChanges();
  }

  /**
   * Create snowflakes
   */
  function createSnowflakes() {
    // Clear existing snowflakes
    snowflakes = [];
    if (snowContainer) {
      snowContainer.innerHTML = "";
    }

    // Create new snowflakes
    for (let i = 0; i < config.snowflakeCount; i++) {
      const snowflake = createSnowflake();
      snowflakes.push(snowflake);
      if (snowContainer) {
        snowContainer.appendChild(snowflake);
      }
    }
  }

  /**
   * Create a single snowflake element
   */
  function createSnowflake() {
    const snowflake = document.createElement("div");
    snowflake.className = "snowflake";

    // Random symbol
    const symbol =
      config.snowflakeSymbols[
        Math.floor(Math.random() * config.snowflakeSymbols.length)
      ];
    snowflake.textContent = symbol;

    // Random size
    const size =
      Math.random() * (config.maxSize - config.minSize) + config.minSize;
    if (size < 0.7) {
      snowflake.classList.add("small");
    } else if (size > 1.2) {
      snowflake.classList.add("large");
    } else {
      snowflake.classList.add("medium");
    }

    // Random speed
    const speed =
      Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed;
    let animationDuration = 6; // default
    if (speed < 4) {
      snowflake.classList.add("slow");
      animationDuration = 10;
    } else if (speed > 6) {
      snowflake.classList.add("fast");
      animationDuration = 4;
    } else {
      snowflake.classList.add("normal");
      animationDuration = 6;
    }

    // Random starting position
    snowflake.style.left = Math.random() * 100 + "%";
    // Delay should be spread across the full animation duration to ensure continuous snow
    snowflake.style.animationDelay = Math.random() * animationDuration + "s";
    snowflake.style.opacity = Math.random() * 0.5 + 0.5;

    // Random horizontal drift
    const drift = (Math.random() - 0.5) * 50;
    // Use shared animation classes instead of individual keyframes for better performance
    // Apply drift via CSS variable in transform
    snowflake.style.setProperty("--drift-x", drift + "px");
    snowflake.style.animationName = "fall";
    snowflake.style.animationDuration = animationDuration + "s";
    snowflake.style.animationIterationCount = "infinite";
    snowflake.style.animationFillMode = "none";
    snowflake.style.animationTimingFunction = "linear";

    return snowflake;
  }

  /**
   * Observe theme changes and update snowflake colors
   */
  function observeThemeChanges() {
    // Watch for class changes on body
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          // Theme changed, snowflakes will automatically update via CSS
          // But we can trigger a small refresh if needed
          updateSnowflakeVisibility();
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Also listen for media query changes (for adaptive theme)
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
      darkModeQuery.addEventListener("change", function () {
        updateSnowflakeVisibility();
      });
    }
  }

  /**
   * Update snowflake visibility based on current theme
   */
  function updateSnowflakeVisibility() {
    // CSS handles the color changes automatically
    // This function can be used for any additional logic if needed
    if (snowflakes && snowflakes.length > 0) {
      // Force a repaint to ensure CSS changes are applied
      snowContainer.style.display = "none";
      setTimeout(function () {
        snowContainer.style.display = "";
      }, 10);
    }
  }

  /**
   * Clean up snow animation
   */
  function destroySnow() {
    if (snowContainer && snowContainer.parentNode) {
      snowContainer.parentNode.removeChild(snowContainer);
    }
    snowflakes = [];
    snowContainer = null;
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSnow);
  } else {
    initSnow();
  }

  // Export for manual control if needed
  window.snowAnimation = {
    init: initSnow,
    destroy: destroySnow,
    recreate: createSnowflakes,
  };
})();
