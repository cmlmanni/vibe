/* filepath: /js/modules/tutorial/tutorialLogic.js */
import { tutorialTasks, getTaskMetadata } from "./tutorialData.js";
import {
  updateTutorialDisplay,
  setupToggleListeners,
} from "./tutorialDisplay.js";
import { setEditorCode } from "../codeMirrorSetup.js";

function debugTaskStructure() {
  console.log("=== TASK STRUCTURE DEBUG ===");
  tutorialTasks.forEach((task, index) => {
    console.log(
      `Task ${index}: ${task.title} (${task.type}) - AI: ${task.aiAllowed}`
    );
  });
  console.log("=============================");
}

// Smart code insertion function for adding methods to classes
function insertMethodsIntoClass(currentCode, methodsToAdd) {
  const lines = currentCode.split("\n");
  let insertPosition = -1;
  let classIndent = "";

  // Find the last method in a class or the end of a class
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];

    // Look for class methods (properly indented def statements)
    if (line.match(/^\s{4}def\s+\w+\(/) || line.match(/^\t+def\s+\w+\(/)) {
      const methodIndent = line.match(/^(\s*)/)[1];

      // Find the end of this method (next method, class end, or file end)
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j];
        const nextIndent = nextLine.match(/^(\s*)/)[1];

        // If we hit a line with same or less indentation (next method, class end, etc.)
        // or if it's a comment/blank line followed by less indentation
        if (
          nextLine.trim() === "" ||
          nextIndent.length <= methodIndent.length ||
          nextLine.match(/^class\s+/) ||
          nextLine.match(/^[a-zA-Z]/) ||
          j === lines.length - 1
        ) {
          // Skip any trailing blank lines within the method
          while (j > i && lines[j - 1].trim() === "") {
            j--;
          }

          insertPosition = j;
          classIndent = methodIndent;
          break;
        }
      }
      break;
    }
  }

  if (insertPosition !== -1) {
    // Prepare the methods with proper indentation
    const methodLines = methodsToAdd.split("\n");
    const indentedMethods = methodLines.map((line) => {
      if (line.trim() === "") return line; // Keep blank lines as is
      if (line.match(/^\s*#/)) return classIndent + line.trim(); // Handle comments
      if (line.match(/^\s*def\s+/)) return classIndent + line.trim(); // Handle method definitions
      if (line.match(/^\s*pass\s*$/)) return classIndent + "    " + line.trim(); // Handle pass statements
      if (line.match(/^\s*[a-zA-Z]/)) return line; // Keep top-level code as is
      return classIndent + "    " + line.trim(); // Indent method body
    });

    // Insert with a blank line before the new methods
    lines.splice(insertPosition, 0, "", ...indentedMethods);
    return lines.join("\n");
  }

  // Fallback: append at the end
  console.warn("Could not find class to insert methods into, appending at end");
  return currentCode + "\n" + methodsToAdd;
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
          setEditorCode(step.code);
          window.editor.clearHistory();
          window.editor.refresh();
        }
      } else if (step.insertIntoClass) {
        console.log("Inserting methods into class");
        const newCode = insertMethodsIntoClass(currentCode, step.code);
        console.log("New code with inserted methods:", newCode);

        if (window.editor) {
          setEditorCode(newCode);
          window.editor.clearHistory();
          window.editor.refresh();
          window.editor.scrollTo(null, window.editor.getScrollInfo().height);
        }
      } else if (step.appendCode) {
        console.log("Appending code");
        const newCode = currentCode + "\n" + step.code;
        console.log("New code:", newCode);

        if (window.editor) {
          setEditorCode(newCode);
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
    console.log("🎯 completeTaskAndContinue called with taskIndex:", taskIndex);
    console.log("📊 Total tasks available:", tutorialTasks.length);

    if (taskIndex >= 0 && taskIndex < tutorialTasks.length) {
      console.log("✅ Task index is valid, proceeding...");

      // Mark task as completed
      tutorialTasks[taskIndex].completed = true;

      const task = tutorialTasks[taskIndex];
      console.log("📋 Completing task:", task.title, "Type:", task.type);

      // Log the completion
      eventLogger.logEvent("task_completed", {
        taskIndex,
        taskType: task.type,
        paradigm: task.paradigm,
      });

      // Save clean dual-stream log automatically on task completion
      if (eventLogger.saveCleanLogToFile) {
        eventLogger.saveCleanLogToFile();
        console.log(
          "📊 Auto-saved clean dual-stream log after task completion"
        );
      } else {
        // Fallback to old method if clean logging not available
        eventLogger.saveLogToFile();
        console.log("Auto-saved progress after task completion");
      }

      // Don't update display immediately - will be updated when next task loads
      // updateTutorialDisplay(...) - moved to after navigation

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
    } else {
      console.error(
        "❌ Invalid task index:",
        taskIndex,
        "Total tasks:",
        tutorialTasks.length
      );
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
    setupToggleListeners(); // Make sure this is called
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
