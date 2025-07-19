/* filepath: /js/script.js */
import { initializeDOMElements } from "./modules/domElements.js";
import { setupCodeMirror } from "./modules/codeMirrorSetup.js";
import { initializeEventLogging } from "./modules/eventLogging.js";
import { initializeTutorial } from "./modules/tutorialLogic.js";
import { initializeSkulpt } from "./modules/skulptRunner.js";
import { initializeAIAssistants } from "./modules/ai/index.js"; // Updated import path
import { setupResizablePanels } from "./modules/resizablePanels.js";
import { initializeContainerManagement } from "./modules/containerManagement.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing VIBE application...");

  // Initialize all modules
  const domElements = initializeDOMElements();
  const editor = setupCodeMirror(domElements.codeEditorTextArea);
  const eventLogger = initializeEventLogging();
  const tutorial = initializeTutorial(domElements, eventLogger);
  const skulptRunner = initializeSkulpt(domElements, eventLogger);
  const aiAssistants = initializeAIAssistants(domElements, eventLogger, editor);
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

  console.log("VIBE application initialized successfully");
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
  domElements.prevTaskBtn?.addEventListener("click", tutorial.prevTask);
  domElements.nextTaskBtn?.addEventListener("click", tutorial.nextTask);
  domElements.prevSubstepBtn?.addEventListener("click", tutorial.prevStep);
  domElements.nextSubstepBtn?.addEventListener("click", tutorial.nextStep);

  // AI assistant events
  aiAssistants.setupEventListeners();

  // Save log
  domElements.saveLogBtn?.addEventListener("click", eventLogger.saveLogToFile);
}
