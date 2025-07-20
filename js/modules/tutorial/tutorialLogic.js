/* filepath: /js/modules/tutorial/tutorialLogic.js */
import { tutorialTasks, getTaskMetadata } from "./tutorialData.js";
import { updateTutorialDisplay, setupToggleListeners } from "./tutorialDisplay.js";

export function createTutorialLogic(eventLogger) {
  let currentTaskIndex = 0;
  let currentStepIndex = 0;

  // Load a specific step
  function loadStep(stepIdx) {
    const task = tutorialTasks[currentTaskIndex];
    if (stepIdx < 0 || stepIdx >= task.steps.length) return;

    currentStepIndex = stepIdx;
    updateTutorialDisplay(tutorialTasks, currentTaskIndex, currentStepIndex, eventLogger);

    // Enhanced logging
    eventLogger.logEvent("step_loaded", {
      taskIndex: currentTaskIndex,
      stepIndex: stepIdx,
      stepType: task.steps[stepIdx].type,
      taskType: task.type,
      paradigm: task.paradigm,
      aiAllowed: task.aiAllowed,
    });
  }

  // Load a specific task and step
  function loadTaskAndStep(taskIdx, stepIdx) {
    if (taskIdx < 0 || taskIdx >= tutorialTasks.length) return;

    const oldTask = tutorialTasks[currentTaskIndex];
    const newTask = tutorialTasks[taskIdx];

    currentTaskIndex = taskIdx;
    currentStepIndex = Math.max(0, Math.min(stepIdx, newTask.steps.length - 1));
    updateTutorialDisplay(tutorialTasks, currentTaskIndex, currentStepIndex, eventLogger);

    // Enhanced task transition logging
    eventLogger.logEvent("task_loaded", {
      fromTaskIndex: currentTaskIndex !== taskIdx ? currentTaskIndex : null,
      toTaskIndex: taskIdx,
      fromParadigm: oldTask?.paradigm,
      toParadigm: newTask.paradigm,
      taskType: newTask.type,
      aiTransition: {
        from: oldTask?.aiAllowed,
        to: newTask.aiAllowed,
      },
    });
  }

  // Mark a task as completed
  function markTaskCompleted(taskIndex) {
    if (taskIndex >= 0 && taskIndex < tutorialTasks.length) {
      tutorialTasks[taskIndex].completed = true;
      updateTutorialDisplay(tutorialTasks, currentTaskIndex, currentStepIndex, eventLogger);
      eventLogger.logEvent("task_completed", {
        taskIndex,
        taskType: tutorialTasks[taskIndex].type,
        paradigm: tutorialTasks[taskIndex].paradigm,
      });
    }
  }

  // Navigation functions
  function nextTask() {
    loadTaskAndStep(currentTaskIndex + 1, 0);
  }

  function prevTask() {
    loadTaskAndStep(currentTaskIndex - 1, 0);
  }

  function nextStep() {
    const task = tutorialTasks[currentTaskIndex];
    if (currentStepIndex < task.steps.length - 1) {
      loadStep(currentStepIndex + 1);
    }
  }

  function prevStep() {
    if (currentStepIndex > 0) {
      loadStep(currentStepIndex - 1);
    }
  }

  // Initialize the tutorial
  function initialize() {
    // Make loadStep globally accessible for onclick handlers
    window.loadStep = loadStep;

    // Setup toggle listeners
    setupToggleListeners();

    // Initial display update
    updateTutorialDisplay(tutorialTasks, currentTaskIndex, currentStepIndex, eventLogger);
  }

  return {
    // Data access
    tutorialTasks,
    get currentTaskIndex() { return currentTaskIndex; },
    get currentStepIndex() { return currentStepIndex; },
    
    // Navigation
    loadTaskAndStep,
    loadStep,
    nextTask,
    prevTask,
    nextStep,
    prevStep,
    
    // Task management
    markTaskCompleted,
    getTaskMetadata: (task) => getTaskMetadata(task),
    
    // Initialization
    initialize,
  };
}