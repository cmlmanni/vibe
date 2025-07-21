/* filepath: /js/modules/tutorial/index.js */
import { createTutorialLogic } from "./tutorialLogic.js";

// Export the main initialization function to maintain compatibility
export function initializeTutorial(
  domElements,
  eventLogger,
  surveyModal,
  experimentConfig
) {
  console.log("🎯 Initializing tutorial logic...");

  const tutorialLogic = createTutorialLogic(
    eventLogger,
    surveyModal,
    experimentConfig
  );

  // Make loadStep available globally for step navigation
  window.loadStep = tutorialLogic.loadStep;

  return tutorialLogic;
}

// Also export the tutorial logic creator for more flexible usage
export { createTutorialLogic } from "./tutorialLogic.js";
export { tutorialTasks, getTaskMetadata } from "./tutorialData.js";
export * from "./tutorialDisplay.js";
