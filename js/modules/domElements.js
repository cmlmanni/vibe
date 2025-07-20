/* filepath: /js/modules/domElements.js */
export function initializeDOMElements() {
  const elements = {
    codeEditorTextArea: document.getElementById("code-editor-area"),
    runBtn: document.getElementById("run-btn"),
    resetBtn: document.getElementById("reset-btn"),
    aiModeSelect: document.getElementById("ai-mode-select"),
    getAiSuggestionBtn: document.getElementById("get-ai-suggestion-btn"),
    aiPromptInput: document.getElementById("ai-prompt-input"),
    chatContainer: document.getElementById("chat-container"),
    turtleContainer: document.getElementById("turtle-container"),
    terminalOutput: document.getElementById("terminal"),
    taskTitle: document.getElementById("task-title"),
    stepText: document.getElementById("step-text"),
    prevTaskBtn: document.getElementById("prev-task-btn"),
    nextTaskBtn: document.getElementById("next-task-btn"),
    prevSubstepBtn: document.getElementById("prev-substep-btn"),
    nextSubstepBtn: document.getElementById("next-substep-btn"),
    saveLogBtn: document.getElementById("save-log-btn"), // ✅ ADD THIS
  };

  // Debug log missing elements
  const missingElements = Object.entries(elements)
    .filter(([key, element]) => !element)
    .map(([key]) => key);

  if (missingElements.length > 0) {
    console.warn("Missing DOM elements:", missingElements);
  }

  console.log("DOM elements initialized");
  return elements;
}
