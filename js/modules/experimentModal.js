/* filepath: /js/modules/experimentModal.js */
import { ensureEditorReady } from "./codeMirrorSetup.js";

export function initializeExperimentModal(experimentConfig, eventLogger) {
  function showExperimentModal() {
    const modal = document.getElementById("experiment-modal");
    const appContainer = document.getElementById("app-container");

    if (!modal || !appContainer) {
      console.error("Modal elements not found");
      return;
    }

    // Hide main app initially
    appContainer.style.display = "none";

    // Show modal
    modal.style.display = "flex";

    console.log("Experiment modal shown");
  }

  function hideExperimentModal() {
    const modal = document.getElementById("experiment-modal");
    const appContainer = document.getElementById("app-container");

    if (!modal || !appContainer) {
      console.error("Modal elements not found during hide");
      return;
    }

    console.log("Hiding experiment modal...");

    // Hide modal with animation
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.style.display = "none";
      appContainer.style.display = "flex";

      // IMPORTANT: Refresh CodeMirror after showing the app
      setTimeout(() => {
        ensureEditorReady();
      }, 200);

      // Log experiment start
      eventLogger.logEvent("experiment_started", {
        condition: experimentConfig.getCurrentConditionInfo(),
        timestamp: new Date().toISOString(),
      });

      console.log("✅ Experiment session started");
    }, 300);
  }

  function setupModalEventListeners() {
    const startBtn = document.getElementById("start-experiment-btn");

    console.log("Setting up modal event listeners...");
    console.log("Start button found:", startBtn);

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        console.log("Start button clicked!");
        hideExperimentModal();
      });

      // Add visual feedback for debugging
      startBtn.addEventListener("mouseenter", () => {
        console.log("Mouse entered start button");
      });

      startBtn.addEventListener("mousedown", () => {
        console.log("Mouse down on start button");
      });
    } else {
      console.error("❌ Start button not found! Check if HTML element exists.");
    }

    // Prevent modal from closing when clicking inside
    const modalContent = document.querySelector(".modal-content");
    if (modalContent) {
      modalContent.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    // For debugging - allow ESC key to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        console.log("ESC pressed - closing modal");
        hideExperimentModal();
      }
    });
  }

  return {
    showExperimentModal,
    hideExperimentModal,
    setupModalEventListeners,
  };
}
