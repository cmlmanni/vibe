/* filepath: /js/modules/tutorial/index.js */
import { createTutorialLogic } from "./tutorialLogic.js";

// Export the main initialization function to maintain compatibility
export function initializeTutorial(domElements, eventLogger) {
  const tutorialLogic = createTutorialLogic(eventLogger);
  
  // Initialize the tutorial
  tutorialLogic.initialize();
  
  return tutorialLogic;
}

// Also export the tutorial logic creator for more flexible usage
export { createTutorialLogic } from "./tutorialLogic.js";
export { tutorialTasks, getTaskMetadata } from "./tutorialData.js";
export * from "./tutorialDisplay.js";