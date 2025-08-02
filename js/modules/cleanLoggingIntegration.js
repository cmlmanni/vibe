/* Integration Layer for Dual-Stream Logging */
import { initializeDualStreamLogging } from "./dualStreamLogging.js";

export function initializeCleanLogging() {
  const dualLogger = initializeDualStreamLogging();

  // ================================
  // INTEGRATION WITH EXISTING SYSTEM
  // ================================

  // Replace the current logEvent function with filtered logging
  function logEvent(eventType, data = {}) {
    const timestamp = new Date().toISOString();

    // Route events to appropriate stream based on type
    switch (eventType) {
      // USER BEHAVIOR EVENTS
      case "code_execution_started":
      case "code_execution_success":
      case "code_execution_error":
        handleCodeExecution(eventType, data);
        break;

      case "ai_prompt":
        // This will be handled when AI responds
        break;

      case "ai_response":
        handleAIInteraction(data);
        break;

      case "task_loaded":
      case "task_completed":
        handleTaskProgression(eventType, data);
        break;

      // SYSTEM EVENTS (filtered)
      case "experiment_initialized":
        handleExperimentInit(data);
        break;

      // IGNORE REDUNDANT EVENTS
      case "assistant_assistant_initialized":
      case "assistant_request_started":
      case "assistant_request_completed":
      case "assistant_performance_updated":
      case "assistant_user_interaction":
      case "assistant_socratic_inquiry_started":
      case "assistant_socratic_response_generated":
        // These are redundant - we'll capture the essential data in AI interactions
        break;

      default:
        console.log(`[CleanLogging] Ignoring event: ${eventType}`);
    }
  }

  // ================================
  // EVENT HANDLERS
  // ================================

  let pendingAIRequest = null;

  function handleCodeExecution(eventType, data) {
    if (eventType === "code_execution_started") {
      // Don't log start events, wait for completion
      return;
    }

    const success = eventType === "code_execution_success";
    dualLogger.logUserCodeAttempt(data.code, success, data.error);
  }

  function handleAIInteraction(data) {
    // Extract AI interaction data from the complex current structure
    const assistantId = data.assistantId || "unknown";
    const userInput = data.response?.userInput || data.userInput || "";
    const assistantResponse =
      data.response?.content || data.assistantResponse || "";

    // Calculate response time (if available from pending request)
    let responseTime = 0;
    if (pendingAIRequest) {
      responseTime = Date.now() - pendingAIRequest.startTime;
      pendingAIRequest = null;
    }

    // Log both sides
    dualLogger.logUserHelpRequest(userInput);
    dualLogger.logAIInteraction(
      assistantId,
      userInput,
      assistantResponse,
      responseTime
    );
  }

  function handleTaskProgression(eventType, data) {
    if (eventType === "task_loaded") {
      dualLogger.logUserTaskProgression(data.toTaskIndex, "started", {
        taskType: data.taskType,
        fromTask: data.fromTaskIndex,
      });
    } else if (eventType === "task_completed") {
      dualLogger.logUserTaskProgression(data.taskIndex, "completed", {
        taskType: data.taskType,
      });
    }
  }

  function handleExperimentInit(data) {
    if (data.condition) {
      dualLogger.setExperimentContext(
        data.condition.participantId,
        data.condition.condition
      );
    }

    dualLogger.logAISystemEvent("experiment_initialized", {
      condition: data.condition,
      timestamp: new Date().toISOString(),
    });
  }

  // ================================
  // KEYBOARD TRACKING INTEGRATION
  // ================================

  function setupKeyboardTracking() {
    let isCodeEditorFocused = false;
    let lastKeystroke = 0;
    let keystrokeCount = 0;

    // Track when code editor is focused
    function attachToCodeMirror(cmInstance) {
      cmInstance.on("focus", () => {
        isCodeEditorFocused = true;
      });

      cmInstance.on("blur", () => {
        isCodeEditorFocused = false;
      });

      // Track code changes
      cmInstance.on("change", (instance, changeObj) => {
        if (changeObj.origin === "+input" || changeObj.origin === "+delete") {
          keystrokeCount++;
          lastKeystroke = Date.now();

          // Log significant keystroke events (every 10 keystrokes to avoid spam)
          if (keystrokeCount % 10 === 0) {
            dualLogger.logUserKeystroke({
              key: changeObj.origin === "+delete" ? "Backspace" : "Character",
              isCodeEditor: true,
              isSignificant: true,
              keystrokeCount: keystrokeCount,
            });
          }
        }
      });
    }

    // Global keyboard tracking
    document.addEventListener("keydown", (event) => {
      if (isCodeEditorFocused) {
        const now = Date.now();

        // Track significant keys only
        if (["Backspace", "Enter", "Tab"].includes(event.key)) {
          dualLogger.logUserKeystroke({
            key: event.key,
            isCodeEditor: true,
            isSignificant: true,
            timeSinceLastKey: now - lastKeystroke,
          });
        }

        lastKeystroke = now;
      }
    });

    return { attachToCodeMirror };
  }

  // ================================
  // ENHANCED EXPORT FUNCTIONS
  // ================================

  function saveCleanLogToFile() {
    try {
      console.log("📊 Starting clean log export...");
      const combinedLog = dualLogger.exportCombinedLog();

      // Create clean filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `vibe-clean-log-${timestamp}.json`;

      // Export as JSON
      const jsonString = JSON.stringify(combinedLog, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log("✅ Clean dual-stream log exported successfully:", {
        filename,
        userEvents: combinedLog.userBehavior?.events?.length || 0,
        aiInteractions: combinedLog.aiSystem?.interactions?.length || 0,
      });
    } catch (error) {
      console.error("❌ Error saving clean log:", error);

      // Fallback to basic log save
      console.log("🔄 Attempting fallback log save...");
      try {
        const basicLog = {
          timestamp: new Date().toISOString(),
          error: "Failed to export clean log",
          userMetrics: dualLogger.getUserMetrics(),
          aiMetrics: dualLogger.getAIMetrics(),
        };

        const jsonString = JSON.stringify(basicLog, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `vibe-fallback-log-${new Date()
          .toISOString()
          .slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log("✅ Fallback log saved successfully");
      } catch (fallbackError) {
        console.error("❌ Even fallback log save failed:", fallbackError);
      }
    }
  }

  function saveUserLogOnly() {
    const userLog = dualLogger.exportUserLog();

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `vibe-user-behavior-${timestamp}.json`;

    const jsonString = JSON.stringify(userLog, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("👤 User behavior log exported:", {
      filename,
      events: userLog.behavioralData.events.length,
      keystrokes: userLog.behavioralData.metrics.totalKestrokes,
      codeAttempts: userLog.behavioralData.metrics.totalCodeAttempts,
    });
  }

  function saveAILogOnly() {
    const aiLog = dualLogger.exportAILog();

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `vibe-ai-system-${timestamp}.json`;

    const jsonString = JSON.stringify(aiLog, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("🤖 AI system log exported:", {
      filename,
      interactions: aiLog.aiData.interactions.length,
      avgResponseTime: aiLog.aiData.overallMetrics.avgResponseTime,
      successRate: aiLog.aiData.overallMetrics.successRate,
    });
  }

  // ================================
  // LIVE MONITORING
  // ================================

  function startLiveMonitoring() {
    setInterval(() => {
      const userMetrics = dualLogger.getUserMetrics();
      const aiMetrics = dualLogger.getAIMetrics();

      console.log("📈 Live Session Metrics:", {
        userActivity: {
          keystrokes: userMetrics.totalKestrokes,
          codeAttempts: userMetrics.totalCodeAttempts,
          successRate:
            userMetrics.totalCodeAttempts > 0
              ? `${(
                  (userMetrics.totalSuccessfulExecutions /
                    userMetrics.totalCodeAttempts) *
                  100
                ).toFixed(1)}%`
              : "0%",
          helpRequests: userMetrics.totalHelpRequests,
        },
        aiPerformance: {
          interactions: aiMetrics.totalInteractions,
          avgResponseTime: `${aiMetrics.avgResponseTime}ms`,
          successRate: `${(aiMetrics.successRate * 100).toFixed(1)}%`,
        },
      });
    }, 30000); // Update every 30 seconds
  }

  const keyboardTracker = setupKeyboardTracking();

  return {
    // Main logging function (replaces old logEvent)
    logEvent,

    // Export functions
    saveCleanLogToFile,
    saveUserLogOnly,
    saveAILogOnly,

    // Setup functions
    attachToCodeMirror: keyboardTracker.attachToCodeMirror,
    startLiveMonitoring,

    // Direct access to dual logger
    dualLogger,

    // Metrics access
    getCurrentMetrics: () => ({
      user: dualLogger.getUserMetrics(),
      ai: dualLogger.getAIMetrics(),
    }),
  };
}
