/* filepath: /js/modules/eventLogging.js */
export function initializeEventLogging() {
  const eventLog = [];
  let autoSaveInterval = null;

  function logEvent(eventType, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      eventType,
      data,
    };
    eventLog.push(logEntry);
    console.log(`Event logged: ${eventType}`, logEntry);
  }

  function saveLogToFile() {
    // Collect assistant analytics if AI system is available
    let assistantAnalytics = null;
    try {
      // Try to get analytics from all available assistants
      if (
        window.ai &&
        typeof window.ai.getAllAssistantAnalytics === "function"
      ) {
        assistantAnalytics = window.ai.getAllAssistantAnalytics();
      } else if (window.vibeAI) {
        // Fallback: collect analytics from individual assistants
        assistantAnalytics = {
          timestamp: new Date().toISOString(),
          assistants: {},
        };

        // Check for known assistant instances
        const assistantInstances = [
          window.vibeAI.vibecodingAI,
          window.vibeAI.reflectiveAI,
          window.vibeAI.ignorantSchoolmasterAI,
        ].filter(Boolean);

        assistantInstances.forEach((assistant) => {
          if (
            assistant &&
            typeof assistant.getAssistantAnalytics === "function"
          ) {
            try {
              assistantAnalytics.assistants[
                assistant.assistantId || assistant.constructor.name
              ] = assistant.getAssistantAnalytics();
            } catch (e) {
              console.warn(
                `Failed to get analytics for assistant ${assistant.assistantId}:`,
                e
              );
            }
          }
        });
      }
    } catch (e) {
      console.warn("Failed to collect assistant analytics:", e);
    }

    const logData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        eventCount: eventLog.length,
        version: "1.0",
        source: "vibe-experiment",
      },
      events: eventLog,
      assistantAnalytics: assistantAnalytics,
    };

    const jsonString = JSON.stringify(logData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vibe-log-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("Event log saved to file with assistant analytics:", {
      eventCount: eventLog.length,
      hasAssistantAnalytics: !!assistantAnalytics,
      assistantCount: assistantAnalytics?.assistants
        ? Object.keys(assistantAnalytics.assistants).length
        : 0,
    });
  }

  function getEventLog() {
    return [...eventLog]; // Return a copy
  }

  function clearLog() {
    eventLog.length = 0;
    console.log("Event log cleared");
  }

  // Auto-save functionality
  function startAutoSave(intervalMinutes = 3) {
    if (autoSaveInterval) clearInterval(autoSaveInterval);

    autoSaveInterval = setInterval(() => {
      if (eventLog.length > 0) {
        saveLogToFile();
        logEvent("auto_save_periodic", { eventCount: eventLog.length });
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`Auto-save started: every ${intervalMinutes} minutes`);
  }

  function stopAutoSave() {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
      autoSaveInterval = null;
      console.log("Auto-save stopped");
    }
  }

  // Log initialization
  logEvent("system_initialized", { module: "eventLogging" });

  // DISABLED: Start auto-save when logging is initialized
  // startAutoSave(3); // Save every 3 minutes

  // DISABLED: Auto-save on page unload
  /*
  window.addEventListener("beforeunload", () => {
    if (eventLog.length > 0) {
      saveLogToFile();
    }
  });
  */

  return {
    logEvent,
    saveLogToFile,
    getEventLog,
    clearLog,
    startAutoSave,
    stopAutoSave,
  };
}
