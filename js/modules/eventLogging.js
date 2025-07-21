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
    const logData = JSON.stringify(eventLog, null, 2);
    const blob = new Blob([logData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vibe-log-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("Event log saved to file");
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
