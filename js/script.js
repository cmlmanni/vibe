/* filepath: /js/script.js */
import { initializeDOMElements } from "./modules/domElements.js";
import {
  setupCodeMirror,
  ensureEditorReady,
} from "./modules/codeMirrorSetup.js";
import { initializeEventLogging } from "./modules/eventLogging.js";
import { initializeCleanLogging } from "./modules/cleanLoggingIntegration.js";
import { initializeTutorial } from "./modules/tutorial/index.js";
import { initializeSkulpt } from "./modules/skulptRunner.js";
import { initializeAIAssistants } from "./modules/ai/index.js";
import { setupResizablePanels } from "./modules/resizablePanels.js";
import { initializeContainerManagement } from "./modules/containerManagement.js";
import { initializeExperimentConfig } from "./modules/experimentConfig.js";
import { initializeExperimentModal } from "./modules/experimentModal.js";
import { initializeSurveyModal } from "./modules/surveyModal.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Initializing VIBE experimental application...");
  console.log("📅 Debug: Script loaded at", new Date().toISOString());
  console.log("🔧 Debug: This is the UPDATED script with enhanced debugging");

  try {
    // Initialize all modules
    const domElements = initializeDOMElements();
    // UPDATED: Use clean dual-stream logging instead of noisy single-stream
    const eventLogger = initializeCleanLogging();
    const experimentConfig = initializeExperimentConfig(eventLogger);

    // IMPORTANT: Make experimentConfig globally available
    window.experimentConfig = experimentConfig;
    console.log(
      "🔄 Experiment config set to global scope:",
      window.experimentConfig
    );

    console.log("📋 Setting up experiment modal...");

    // Initialize experiment modal FIRST
    const experimentModal = initializeExperimentModal(
      experimentConfig,
      eventLogger
    );

    // Initialize survey modal
    const surveyModal = initializeSurveyModal(eventLogger);

    // Set up event listeners BEFORE showing modal
    experimentModal.setupModalEventListeners();
    surveyModal.setupSurveyModalEventListeners();

    // Show modal
    experimentModal.showExperimentModal();

    console.log("🔧 Initializing other modules...");

    // Initialize other modules (these will be ready when modal is dismissed)
    const editor = setupCodeMirror(domElements.codeEditorTextArea);
    const tutorial = initializeTutorial(
      domElements,
      eventLogger,
      surveyModal,
      experimentConfig
    ); // Pass surveyModal
    const skulptRunner = initializeSkulpt(domElements, eventLogger);
    const aiAssistants = initializeAIAssistants(
      domElements,
      eventLogger,
      editor,
      experimentConfig
    );
    const containerManager = initializeContainerManagement(domElements);

    // UPDATED: Setup enhanced empirical logging with keyboard tracking
    console.log("📊 Setting up enhanced empirical logging...");
    eventLogger.attachToCodeMirror(editor);
    eventLogger.startLiveMonitoring();
    console.log("✅ Enhanced logging with keyboard tracking enabled");

    // Make systems globally accessible
    window.ai = aiAssistants;
    window.vibeAI = aiAssistants; // Backup reference
    window.eventLogger = eventLogger; // Make logger globally accessible for auto-saves

    console.log(
      "🤖 AI system and logger made globally accessible for analytics"
    );

    // Setup resizable panels
    setupResizablePanels(domElements, containerManager);

    // Set up event listeners
    setupEventListeners(
      domElements,
      tutorial,
      skulptRunner,
      aiAssistants,
      eventLogger
    );

    // Initialize tutorial
    tutorial.loadTaskAndStep(0, 0);

    // Add a window resize listener to refresh editor
    window.addEventListener("resize", () => {
      setTimeout(ensureEditorReady, 100);
    });

    console.log("✅ VIBE experimental application initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing application:", error);
  }
});

function setupEventListeners(
  domElements,
  tutorial,
  skulptRunner,
  aiAssistants,
  eventLogger
) {
  // Run and reset buttons
  domElements.runBtn?.addEventListener("click", skulptRunner.runCode);
  domElements.resetBtn?.addEventListener("click", skulptRunner.resetAll);

  // Navigation buttons
  domElements.prevSubstepBtn?.addEventListener("click", tutorial.prevStep);
  domElements.nextSubstepBtn?.addEventListener("click", tutorial.nextStep);

  // AI assistant events
  aiAssistants.setupEventListeners();

  // UPDATED: Task completion (clean logging happens in tutorial logic) - with debugging
  console.log("🔍 Setting up complete and continue button...");
  console.log("Button element found:", domElements.completeAndContinueBtn);
  console.log("Tutorial object:", tutorial);
  console.log("Tutorial methods available:", Object.keys(tutorial));

  if (domElements.completeAndContinueBtn) {
    domElements.completeAndContinueBtn.addEventListener("click", (event) => {
      console.log("✅ Complete and continue button clicked!");

      // Prevent any default behavior and stop event propagation
      event.preventDefault();
      event.stopPropagation();

      console.log("Current task index:", tutorial.currentTaskIndex);

      if (typeof tutorial.completeTaskAndContinue === "function") {
        console.log("✅ completeTaskAndContinue function is available");
        try {
          tutorial.completeTaskAndContinue(tutorial.currentTaskIndex);
        } catch (error) {
          console.error("❌ Error in completeTaskAndContinue:", error);
        }
      } else {
        console.error(
          "❌ completeTaskAndContinue function not found on tutorial object"
        );
        console.log("Available methods:", Object.keys(tutorial));
      }
    });
    console.log("✅ Event listener attached to complete and continue button");
  } else {
    console.error("❌ Complete and continue button not found!");
  }
}
