/* Keyboard and Mouse Event Tracker for Empirical Learning Metrics */

export function initializeEmpiricalEventTracking(learningMetrics) {
  let isCodeMirrorFocused = false;
  let codeMirrorInstance = null;

  function attachToCodeMirror(cmInstance) {
    codeMirrorInstance = cmInstance;

    // Track when CodeMirror is focused/unfocused
    cmInstance.on("focus", () => {
      isCodeMirrorFocused = true;
      console.log("📝 CodeMirror focused - tracking keystrokes");
    });

    cmInstance.on("blur", () => {
      isCodeMirrorFocused = false;
      console.log("📝 CodeMirror unfocused - stopped tracking keystrokes");
    });

    // Track all changes to the code
    cmInstance.on("change", (instance, changeObj) => {
      if (changeObj.origin === "+input" || changeObj.origin === "+delete") {
        // Simulate keystroke for empirical tracking
        const keyEvent = {
          key: changeObj.origin === "+delete" ? "Backspace" : "Character",
          timestamp: Date.now(),
        };
        learningMetrics.trackKeystroke(keyEvent);
      }
    });

    // Track copy/paste events
    cmInstance.on("change", (instance, changeObj) => {
      if (changeObj.origin === "paste") {
        // Track paste event
        learningMetrics.trackKeystroke({ key: "Paste", isPaste: true });
      }
    });
  }

  function setupGlobalEventListeners() {
    // Track keyboard events when in code editing areas
    document.addEventListener("keydown", (event) => {
      if (isCodeMirrorFocused) {
        learningMetrics.trackKeystroke({
          key: event.key,
          code: event.code,
          timestamp: Date.now(),
          isCodeEditor: true,
        });
      }
    });

    // Track copy/paste events globally
    document.addEventListener("copy", (event) => {
      if (isCodeMirrorFocused) {
        learningMetrics.trackKeystroke({
          key: "Copy",
          isCopy: true,
          timestamp: Date.now(),
        });
      }
    });

    document.addEventListener("paste", (event) => {
      if (isCodeMirrorFocused) {
        learningMetrics.trackKeystroke({
          key: "Paste",
          isPaste: true,
          timestamp: Date.now(),
        });
      }
    });

    // Track mouse activity for inactivity detection
    let lastMouseActivity = Date.now();
    document.addEventListener("mousemove", () => {
      lastMouseActivity = Date.now();
    });

    document.addEventListener("click", () => {
      lastMouseActivity = Date.now();
    });

    // Provide access to last mouse activity for inactivity calculations
    window.getLastMouseActivity = () => lastMouseActivity;
  }

  // Integration with existing code execution tracking
  function trackCodeExecution(code, success, error) {
    learningMetrics.trackCodeExecution(code, success, error);

    console.log("📊 Code execution tracked:", {
      success,
      codeLength: code.length,
      hasError: !!error,
    });
  }

  // Integration with AI interaction tracking
  function trackAIInteraction(prompt, response, responseTime, assistantId) {
    learningMetrics.trackAIInteraction(prompt, response, responseTime);

    console.log("🤖 AI interaction tracked:", {
      assistantId,
      promptLength: prompt.length,
      responseTime,
      responseLength: response.length,
    });
  }

  // Integration with task tracking
  function trackTaskStart(taskId, taskType) {
    learningMetrics.trackTaskStart(taskId);

    console.log("🎯 Task started:", { taskId, taskType });
  }

  function trackTaskEnd(taskId, success) {
    learningMetrics.trackTaskEnd(taskId);

    console.log("✅ Task completed:", { taskId, success });
  }

  // Initialize tracking
  setupGlobalEventListeners();

  // Return interface for integration with existing systems
  return {
    attachToCodeMirror,
    trackCodeExecution,
    trackAIInteraction,
    trackTaskStart,
    trackTaskEnd,

    // Direct access to learning metrics for debugging
    getLearningMetrics: () => learningMetrics.getCurrentMetrics(),
    getDerivedMetrics: () => learningMetrics.getDerivedMetrics(),

    // Manual tracking functions for special cases
    manualTrackKeystroke: (keyData) => learningMetrics.trackKeystroke(keyData),
    manualTrackPause: (duration) => {
      console.log(`⏸️ Manual pause tracked: ${duration}ms`);
    },
  };
}
