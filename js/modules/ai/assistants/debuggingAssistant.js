/* filepath: /js/modules/ai/assistants/debuggingAssistant.js */
import { AIAssistant } from "../base/aiAssistant.js";

export class DebuggingAssistant extends AIAssistant {
  constructor(params) {
    super(params);
  }

  initialize() {
    super.initialize();

    // Debugging-specific initialization
    this.errorHistory = [];
    this.debuggingSessions = [];
    this.commonErrors = new Map();

    console.log(`🐛 Debugging Assistant initialized (${this.assistantId})`);
  }

  async getSuggestion(userPrompt) {
    console.log("🐛 DebuggingAssistant processing:", userPrompt);
    if (this.isGenerating) return;

    this.emit("debuggingStarted", { prompt: userPrompt });

    // Check if this looks like an error report
    const hasErrorKeywords = this.detectErrorInPrompt(userPrompt);

    this.eventLogger.logEvent("ai_prompt", {
      prompt: userPrompt,
      mode: "debugging",
      assistantId: this.assistantId,
      hasErrorKeywords,
      historyLength: this.conversationManager.getHistoryLength(),
    });

    // Include additional debugging context
    const response = await this.fetchFromAI(userPrompt, true);

    this.eventLogger.logEvent("ai_response", {
      response,
      assistantId: this.assistantId,
      historyLength: this.conversationManager.getHistoryLength(),
    });

    // Track error patterns
    if (hasErrorKeywords) {
      this.trackError(userPrompt, response);
    }

    if (response.type === "code") {
      this.createChatMessage(response.content, "ai", response.code);
      this.emit("debugSolutionProvided", {
        code: response.code,
        content: response.content,
        prompt: userPrompt,
      });
    } else if (response.type === "text") {
      this.createChatMessage(response.content, "ai");
      this.emit("debugGuidanceProvided", {
        content: response.content,
        prompt: userPrompt,
      });
    }

    this.emit("debuggingCompleted", { response, prompt: userPrompt });
  }

  /**
   * Detect if the prompt contains error-related keywords
   * @param {string} prompt - User prompt
   * @returns {boolean} True if error keywords detected
   */
  detectErrorInPrompt(prompt) {
    const errorKeywords = [
      "error",
      "traceback",
      "exception",
      "bug",
      "not working",
      "broken",
      "issue",
      "problem",
      "fail",
      "crash",
      "wrong",
    ];

    const lowerPrompt = prompt.toLowerCase();
    return errorKeywords.some((keyword) => lowerPrompt.includes(keyword));
  }

  /**
   * Track error patterns for analysis
   * @param {string} userPrompt - Original error report
   * @param {object} response - AI response
   */
  trackError(userPrompt, response) {
    const errorEntry = {
      prompt: userPrompt,
      response: response.content,
      timestamp: new Date(),
      resolved: false, // Can be updated later
    };

    this.errorHistory.push(errorEntry);

    // Track common error patterns
    const errorType = this.categorizeError(userPrompt);
    if (errorType) {
      const count = this.commonErrors.get(errorType) || 0;
      this.commonErrors.set(errorType, count + 1);
    }

    this.emit("errorTracked", errorEntry);
  }

  /**
   * Categorize error type based on prompt content
   * @param {string} prompt - Error prompt
   * @returns {string|null} Error category or null
   */
  categorizeError(prompt) {
    const lowerPrompt = prompt.toLowerCase();

    if (
      lowerPrompt.includes("syntax") ||
      lowerPrompt.includes("invalid syntax")
    ) {
      return "syntax_error";
    } else if (
      lowerPrompt.includes("name") &&
      lowerPrompt.includes("not defined")
    ) {
      return "name_error";
    } else if (lowerPrompt.includes("attribute")) {
      return "attribute_error";
    } else if (lowerPrompt.includes("import")) {
      return "import_error";
    } else if (lowerPrompt.includes("turtle")) {
      return "turtle_error";
    } else if (lowerPrompt.includes("indentation")) {
      return "indentation_error";
    }

    return "general_error";
  }

  /**
   * Get debugging statistics
   * @returns {object} Debugging statistics
   */
  getDebuggingStats() {
    return {
      totalErrors: this.errorHistory.length,
      errorsByType: Object.fromEntries(this.commonErrors),
      recentErrors: this.errorHistory.slice(-5),
      sessionCount: this.debuggingSessions.length,
    };
  }

  /**
   * Mark an error as resolved
   * @param {number} errorIndex - Index of error in history
   */
  markErrorResolved(errorIndex) {
    if (errorIndex >= 0 && errorIndex < this.errorHistory.length) {
      this.errorHistory[errorIndex].resolved = true;
      this.emit("errorResolved", this.errorHistory[errorIndex]);
    }
  }

  /**
   * Get assistant-specific status
   * @returns {object} Enhanced status information
   */
  getStatus() {
    const baseStatus = super.getStatus();
    const debugStats = this.getDebuggingStats();

    return {
      ...baseStatus,
      debuggingStats: debugStats,
      specializations: [
        "error_analysis",
        "code_debugging",
        "step_by_step_guidance",
      ],
    };
  }

  /**
   * Clear debugging history
   */
  clearDebuggingHistory() {
    this.errorHistory = [];
    this.debuggingSessions = [];
    this.commonErrors.clear();
    this.emit("debuggingHistoryCleared");
  }
}
