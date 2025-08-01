import { ModalManager } from "./shared/modalManager.js";
import { ensureEditorReady } from "./codeMirrorSetup.js";

export function initializeExperimentModal(experimentConfig, eventLogger) {
  const modalManager = new ModalManager("experiment-modal", eventLogger);

  function showExperimentModal() {
    const appContainer = document.getElementById("app-container");

    if (!modalManager.modal || !appContainer) {
      console.error("Modal elements not found");
      return;
    }

    // Hide main app initially
    appContainer.style.display = "none";

    // Show modal
    modalManager.show();
  }

  function hideExperimentModal() {
    const appContainer = document.getElementById("app-container");

    if (!modalManager.modal || !appContainer) {
      console.error("Modal elements not found during hide");
      return;
    }

    // Custom hide logic with app container management
    console.log("Hiding experiment modal...");

    modalManager.modal.style.opacity = "0";

    setTimeout(() => {
      modalManager.modal.style.display = "none";
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
    console.log("Setting up experiment modal event listeners...");

    // Use the helper method to add event listeners
    modalManager.addEventListeners([
      {
        selector: "#start-experiment-btn",
        event: "click",
        handler: () => {
          console.log("Start button clicked!");
          hideExperimentModal();
        },
      },
      {
        selector: "#start-experiment-btn",
        event: "mouseenter",
        handler: () => {
          console.log("Mouse entered start button");
        },
      },
      {
        selector: "#start-experiment-btn",
        event: "mousedown",
        handler: () => {
          console.log("Mouse down on start button");
        },
      },
    ]);

    const startBtn = document.getElementById("start-experiment-btn");
    if (!startBtn) {
      console.error("❌ Start button not found! Check if HTML element exists.");
    }
  }

  return {
    showExperimentModal,
    hideExperimentModal,
    setupModalEventListeners,
  };
}
