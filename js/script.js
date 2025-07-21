/* filepath: /js/script.js */
import { initializeDOMElements } from "./modules/domElements.js";
import {
  setupCodeMirror,
  ensureEditorReady,
} from "./modules/codeMirrorSetup.js";
import { initializeEventLogging } from "./modules/eventLogging.js";
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

  try {
    // Initialize all modules
    const domElements = initializeDOMElements();
    const eventLogger = initializeEventLogging();
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

  // Save log
  domElements.saveLogBtn?.addEventListener("click", eventLogger.saveLogToFile);

  // FIXED: Use the DOM element from domElements
  domElements.completeAndContinueBtn?.addEventListener("click", () => {
    console.log("Complete and continue button clicked!");
    tutorial.completeTaskAndContinue(tutorial.currentTaskIndex);
  });
}
