/* filepath: /js/modules/tutorial/tutorialLogic.js */
import { tutorialTasks, getTaskMetadata } from "./tutorialData.js";
import {
  updateTutorialDisplay,
  setupToggleListeners,
} from "./tutorialDisplay.js";

function debugTaskStructure() {
  console.log("=== TASK STRUCTURE DEBUG ===");
  tutorialTasks.forEach((task, index) => {
    console.log(
      `Task ${index}: ${task.title} (${task.type}) - AI: ${task.aiAllowed}`
    );
  });
  console.log("=============================");
}

export function createTutorialLogic(
  eventLogger,
  surveyModal,
  experimentConfig
) {
  let currentTaskIndex = 0;
  let currentStepIndex = 0;

  // Debug task structure on initialization
  debugTaskStructure();

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
          window.editor.setValue(newCode);
          window.editor.clearHistory();
          window.editor.refresh();
          window.editor.scrollTo(null, window.editor.getScrollInfo().height);
        }
      }
    }

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

    const oldTaskIndex = currentTaskIndex;
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
  }

  // Combined function: Mark complete, save log, and advance
  function completeTaskAndContinue(taskIndex) {
    if (taskIndex >= 0 && taskIndex < tutorialTasks.length) {
      // Mark task as completed
      tutorialTasks[taskIndex].completed = true;

      const task = tutorialTasks[taskIndex];

      // Log the completion
      eventLogger.logEvent("task_completed", {
        taskIndex,
        taskType: task.type,
        paradigm: task.paradigm,
      });

      // Save progress log
      eventLogger.saveLogToFile();
      console.log("Auto-saved progress after task completion");

      // Update display first
      updateTutorialDisplay(
        tutorialTasks,
        currentTaskIndex,
        currentStepIndex,
        eventLogger
      );

      // Check if this task needs a survey (Task 1: Draw a House, Task 2: House Class)
      const needsSurvey =
        (taskIndex === 2 || taskIndex === 3) &&
        (task.type === "procedural_programming" ||
          task.type === "object_oriented_programming");

      console.log(
        `Task ${taskIndex} (${task.type}) - Needs survey: ${needsSurvey}`
      );

      // Always continue to next task first
      if (taskIndex < tutorialTasks.length - 1) {
        setTimeout(() => {
          loadTaskAndStep(taskIndex + 1, 0);

          // THEN show survey modal if needed (non-blocking)
          if (needsSurvey && surveyModal) {
            setTimeout(() => {
              const currentCondition =
                experimentConfig?.getCurrentConditionInfo();
              const aiCondition =
                currentCondition?.currentAssistant || "unknown";
              surveyModal.showSurveyModal(taskIndex, task.title, aiCondition);
            }, 1000); // Show modal after task transition
          }
        }, 500);
      } else {
        // All tasks completed
        eventLogger.logEvent("experiment_completed", {
          totalTasks: tutorialTasks.length,
          completedTasks: tutorialTasks.filter((t) => t.completed).length,
        });
        console.log("🎉 All tasks completed!");

        // Show final survey if needed
        if (needsSurvey && surveyModal) {
          setTimeout(() => {
            const currentCondition =
              experimentConfig?.getCurrentConditionInfo();
            const aiCondition = currentCondition?.currentAssistant || "unknown";
            surveyModal.showSurveyModal(taskIndex, task.title, aiCondition);
          }, 1000);
        }
      }
    }
  }

  // Step navigation functions
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
    updateTutorialDisplay(
      tutorialTasks,
      currentTaskIndex,
      currentStepIndex,
      eventLogger
    );
    setupToggleListeners();
    console.log("Tutorial logic initialized");
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
    nextStep,
    prevStep,

    // Task management
    completeTaskAndContinue,
    getTaskMetadata: (task) => getTaskMetadata(task),

    // Initialization
    initialize,
  };
}
