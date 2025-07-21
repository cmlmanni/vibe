/* filepath: /js/modules/tutorial/tutorialLogic.js */
import { tutorialTasks, getTaskMetadata } from "./tutorialData.js";
import {
  updateTutorialDisplay,
  setupToggleListeners,
} from "./tutorialDisplay.js";

export function createTutorialLogic(eventLogger) {
  let currentTaskIndex = 0;
  let currentStepIndex = 0;

  // Load a specific step
  function loadStep(stepIdx) {
    const task = tutorialTasks[currentTaskIndex];
    if (stepIdx < 0 || stepIdx >= task.steps.length) return;

    const step = task.steps[stepIdx];
    currentStepIndex = stepIdx;

    console.log(
      "Loading step:",
      stepIdx,
      "preserveCode:",
      step.preserveCode,
      "appendCode:",
      step.appendCode
    );

    // CAPTURE CURRENT CODE BEFORE ANYTHING ELSE
    const currentCode =
      step.preserveCode && stepIdx > 0 ? window.editor?.getValue() || "" : "";

    console.log("Current code captured:", currentCode);

    // UPDATE DISPLAY (this will overwrite editor with step.code)
    updateTutorialDisplay(
      tutorialTasks,
      currentTaskIndex,
      currentStepIndex,
      eventLogger
    );

    // THEN handle code preservation logic using the captured code
    if (step.preserveCode && stepIdx > 0) {
      if (step.resetCode) {
        console.log("Resetting code");
        if (window.editor) {
          window.editor.setValue(step.code);
          window.editor.clearHistory();
          window.editor.refresh();
        }
      } else if (step.appendCode) {
        console.log("Appending code");
        const newCode = currentCode + "\n" + step.code;
        console.log("New code:", newCode);

        if (window.editor) {
          // Just use setValue with the combined code
          window.editor.setValue(newCode);
          window.editor.clearHistory();
          window.editor.refresh();

          // Scroll to show the new content
          window.editor.scrollTo(null, window.editor.getScrollInfo().height);
        }
      }
    }
    // If not preserveCode, the editor already has the right content from updateTutorialDisplay

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

    const oldTaskIndex = currentTaskIndex; // Store the old index BEFORE changing it
    const oldTask = tutorialTasks[oldTaskIndex];
    const newTask = tutorialTasks[taskIdx];

    currentTaskIndex = taskIdx;
    currentStepIndex = Math.max(0, Math.min(stepIdx, newTask.steps.length - 1));

    // IMPORTANT: Load the step to update the code editor
    loadStep(currentStepIndex);

    // Enhanced task transition logging
    eventLogger.logEvent("task_loaded", {
      fromTaskIndex: oldTaskIndex !== taskIdx ? oldTaskIndex : null,
      toTaskIndex: taskIdx,
      fromParadigm: oldTask?.paradigm,
      toParadigm: newTask.paradigm,
      taskType: newTask.type,
      aiTransition: {
        from: oldTask?.aiAllowed,
        to: newTask.aiAllowed,
      },
    });

    // Auto-save when switching between major tasks (not just steps)
    if (oldTaskIndex !== taskIdx) {
      eventLogger.saveLogToFile();
      console.log("Auto-saved progress after task transition");
    }
  }

  // Mark a task as completed
  function markTaskCompleted(taskIndex) {
    if (taskIndex >= 0 && taskIndex < tutorialTasks.length) {
      tutorialTasks[taskIndex].completed = true;
      updateTutorialDisplay(
        tutorialTasks,
        currentTaskIndex,
        currentStepIndex,
        eventLogger
      );
      eventLogger.logEvent("task_completed", {
        taskIndex,
        taskType: tutorialTasks[taskIndex].type,
        paradigm: tutorialTasks[taskIndex].paradigm,
      });

      // Auto-save when tasks are completed
      eventLogger.saveLogToFile();
      console.log("Auto-saved progress after task completion");
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
    updateTutorialDisplay(
      tutorialTasks,
      currentTaskIndex,
      currentStepIndex,
      eventLogger
    );
  }

  return {
    // Data access
    tutorialTasks,
    get currentTaskIndex() {
      return currentTaskIndex;
    },
    get currentStepIndex() {
      return currentStepIndex;
    },

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
