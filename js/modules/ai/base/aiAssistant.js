/* filepath: /js/modules/ai/base/AIAssistant.js */
import { ConversationManager } from "./conversationManager.js";
import { ChatRenderer } from "../ui/chatRenderer.js";
import { getAIResponse } from "../utils/apiClient.js";

export class AIAssistant {
  constructor(params = {}) {
    // Handle both old and new constructor patterns
    if (typeof params === "string") {
      // Old pattern: constructor(systemPrompt, eventLogger, domElements)
      this.systemPrompt = params;
      this.eventLogger = arguments[1];
      this.domElements = arguments[2];
      this.config = {};
      this.assistantId = "unknown";
    } else {
      // New pattern: constructor({systemPrompt, eventLogger, domElements, config, assistantId, ...})
      this.systemPrompt =
        params.systemPrompt || params.config?.systemPrompt || "";
      this.eventLogger = params.eventLogger;
      this.domElements = params.domElements;
      this.config = params.config || {};
      this.assistantId = params.assistantId || this.config.id || "unknown";
    }

    this.isGenerating = false;
    this.capabilities = this.config.capabilities || [];
    this.settings = { ...this.config.settings };
    this.eventEmitter = new EventTarget();

    // Initialize conversation manager
    this.conversationManager = new ConversationManager(
      this.systemPrompt,
      this.eventLogger
    );

    // Initialize chat renderer
    this.chatRenderer = new ChatRenderer(this.domElements, this);

    // Initialize comprehensive logging system
    this.initializeLogging();

    // Initialize assistant-specific setup
    this.initialize();
  }

  /**
   * Initialize comprehensive logging system for this assistant instance
   */
  initializeLogging() {
    // Assistant-specific interaction tracking
    this.interactionLog = {
      assistantId: this.assistantId,
      type: this.constructor.name,
      initTimestamp: new Date().toISOString(),
      interactions: [],
      systemEvents: [],
      performanceMetrics: {
        totalRequests: 0,
        totalResponseTime: 0,
        averageResponseTime: 0,
        errors: 0,
        successfulRequests: 0,
      },
      capabilities: [...this.capabilities],
      config: {
        hasSystemPrompt: !!this.systemPrompt,
        systemPromptLength: this.systemPrompt?.length || 0,
        settingsKeys: Object.keys(this.settings || {}),
        configKeys: Object.keys(this.config || {}),
      },
    };

    // Log assistant initialization
    this.logAssistantEvent("assistant_initialized", {
      assistantId: this.assistantId,
      type: this.constructor.name,
      capabilities: this.capabilities,
      hasSystemPrompt: !!this.systemPrompt,
      configKeys: Object.keys(this.config),
    });

    console.log(
      `🔧 [${this.assistantId}] Comprehensive logging system initialized`
    );
  }

  /**
   * Log assistant-specific events with enhanced context
   */
  logAssistantEvent(eventType, data = {}) {
    const timestamp = new Date().toISOString();

    // Enhanced log entry with assistant context
    const logEntry = {
      timestamp,
      eventType,
      assistantId: this.assistantId,
      assistantType: this.constructor.name,
      data: {
        ...data,
        assistantState: {
          isGenerating: this.isGenerating,
          conversationLength:
            this.conversationManager?.getHistory()?.length || 0,
          capabilities: this.capabilities,
        },
      },
    };

    // Add to assistant-specific log
    this.interactionLog.systemEvents.push(logEntry);

    // Also log to global event logger
    if (this.eventLogger) {
      this.eventLogger.logEvent(`assistant_${eventType}`, logEntry.data);
    }

    console.log(`📊 [${this.assistantId}] ${eventType}`, logEntry);
    return logEntry;
  }

  /**
   * Log user interactions with enhanced tracking
   */
  logUserInteraction(
    interactionType,
    userInput,
    assistantResponse,
    metadata = {}
  ) {
    const timestamp = new Date().toISOString();
    const responseTime = metadata.responseTime || 0;

    const interaction = {
      timestamp,
      interactionType,
      userInput: userInput?.substring(0, 500) || "", // Truncate for storage efficiency
      assistantResponse: assistantResponse?.substring(0, 1000) || "",
      responseTime,
      success: metadata.success !== false,
      error: metadata.error || null,
      additionalData: metadata.additionalData || {},
    };

    // Add to assistant-specific interaction log
    this.interactionLog.interactions.push(interaction);

    // Update performance metrics
    this.updatePerformanceMetrics(responseTime, metadata.success !== false);

    // Log to global event logger with assistant context
    if (this.eventLogger) {
      this.eventLogger.logEvent("assistant_user_interaction", {
        assistantId: this.assistantId,
        assistantType: this.constructor.name,
        interaction,
      });
    }

    console.log(
      `💬 [${this.assistantId}] User interaction logged`,
      interaction
    );
    return interaction;
  }

  /**
   * Update performance metrics for this assistant
   */
  updatePerformanceMetrics(responseTime, success) {
    const metrics = this.interactionLog.performanceMetrics;

    metrics.totalRequests++;

    if (success) {
      metrics.successfulRequests++;
      metrics.totalResponseTime += responseTime;
      metrics.averageResponseTime =
        metrics.successfulRequests > 0
          ? metrics.totalResponseTime / metrics.successfulRequests
          : 0;
    } else {
      metrics.errors++;
    }

    this.logAssistantEvent("performance_updated", {
      metrics: { ...metrics },
      latestResponseTime: responseTime,
      success,
    });
  }

  /**
   * Get comprehensive assistant analytics
   */
  getAssistantAnalytics() {
    const analytics = {
      ...this.interactionLog,
      currentState: {
        isGenerating: this.isGenerating,
        conversationLength: this.conversationManager?.getHistory()?.length || 0,
        lastActivity:
          this.interactionLog.interactions.length > 0
            ? this.interactionLog.interactions[
                this.interactionLog.interactions.length - 1
              ].timestamp
            : null,
      },
      summary: {
        totalInteractions: this.interactionLog.interactions.length,
        successRate:
          this.interactionLog.performanceMetrics.totalRequests > 0
            ? (
                (this.interactionLog.performanceMetrics.successfulRequests /
                  this.interactionLog.performanceMetrics.totalRequests) *
                100
              ).toFixed(2) + "%"
            : "0%",
        avgResponseTime:
          this.interactionLog.performanceMetrics.averageResponseTime.toFixed(
            2
          ) + "ms",
      },
    };

    console.log(
      `📈 [${this.assistantId}] Analytics generated`,
      analytics.summary
    );
    return analytics;
  }

  /**
   * Initialize assistant - override in subclasses for custom setup
   */
  initialize() {
    // Default implementation - can be overridden
    this.emit("initialized", { assistantId: this.assistantId });
  }

  /**
   * Get assistant metadata
   * @returns {object} Assistant metadata
   */
  getMetadata() {
    return {
      id: this.assistantId,
      name: this.config.name || this.assistantId,
      description: this.config.description || "",
      capabilities: this.capabilities,
      category: this.config.category || "general",
      icon: this.config.icon || "🤖",
      version: this.config.version || "1.0.0",
    };
  }

  /**
   * Check if assistant has a specific capability
   * @param {string} capability - Capability to check
   * @returns {boolean} True if has capability
   */
  hasCapability(capability) {
    return this.capabilities.includes(capability);
  }

  /**
   * Update assistant settings
   * @param {object} newSettings - Settings to update
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.emit("settingsUpdated", { settings: this.settings });
  }

  /**
   * Get current settings
   * @returns {object} Current settings
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Event emitter methods
   */
  emit(event, data) {
    this.eventEmitter.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  on(event, handler) {
    this.eventEmitter.addEventListener(event, handler);
  }

  off(event, handler) {
    this.eventEmitter.removeEventListener(event, handler);
  }

  // Add message to conversation history
  addToHistory(role, content) {
    return this.conversationManager.addToHistory(role, content);
  }

  // Get conversation history for API call
  getConversationForAPI() {
    return this.conversationManager.getConversationForAPI();
  }

  // Clear conversation history
  clearHistory() {
    this.conversationManager.clearHistory();
    this.chatRenderer.clearChat();
  }

  // Create chat messages
  createChatMessage(content, sender, codeBlock = null) {
    return this.chatRenderer.createChatMessage(content, sender, codeBlock);
  }

  // Main AI interaction method
  async fetchFromAI(userPrompt, includeCodeContext = true) {
    const startTime = Date.now();
    let success = false;
    let error = null;
    let response = null;

    try {
      this.isGenerating = true;
      this.logAssistantEvent("request_started", {
        userPromptLength: userPrompt?.length || 0,
        includeCodeContext,
        timestamp: new Date().toISOString(),
      });

      this.createChatMessage("Thinking...", "system");

      // Prepare contextual prompt
      let contextualPrompt = userPrompt;
      if (includeCodeContext && window.editor) {
        const currentCode = window.editor.getValue();
        if (currentCode.trim() !== "import turtle\n\n# Your code here") {
          contextualPrompt = `Current code in editor:\n\`\`\`python\n${currentCode}\n\`\`\`\n\nUser question: ${userPrompt}`;
        }
      }

      this.addToHistory("user", contextualPrompt);

      console.log("Sending conversation history to AI:", {
        historyLength: this.conversationManager.getHistoryLength(),
        systemPrompt: this.systemPrompt?.substring(0, 50) + "...",
        userPrompt: userPrompt.substring(0, 100) + "...",
      });

      // Call Azure OpenAI with conversation history
      response = await getAIResponse(
        this.getConversationForAPI(),
        this.systemPrompt
      );

      // Remove thinking message
      this.chatRenderer.removeLastMessage();
      this.isGenerating = false;

      if (!response || typeof response !== "string") {
        console.error("Invalid response from AI:", response);
        error = "Invalid response from AI";
        return {
          type: "text",
          content: "Sorry, I received an invalid response. Please try again.",
        };
      }

      // Add AI response to history
      this.addToHistory("assistant", response);

      success = true;
      const parsedResponse = this.parseResponse(response);

      // Log successful interaction
      const responseTime = Date.now() - startTime;
      this.logUserInteraction("ai_request", userPrompt, response, {
        responseTime,
        success: true,
        includeCodeContext,
        additionalData: {
          responseType: parsedResponse.type,
          responseLength: response.length,
          hasCodeBlock: parsedResponse.type === "code",
        },
      });

      return parsedResponse;
    } catch (err) {
      console.error("Error fetching AI response:", err);
      error = err.message || "Failed to get AI response";
      this.chatRenderer.removeLastMessage();
      this.isGenerating = false;

      // Log failed interaction
      const responseTime = Date.now() - startTime;
      this.logUserInteraction("ai_request", userPrompt, null, {
        responseTime,
        success: false,
        error: error,
        additionalData: {
          errorType: err.name || "UnknownError",
          includeCodeContext,
        },
      });

      return {
        type: "text",
        content: `Error: ${error}`,
      };
    } finally {
      this.logAssistantEvent("request_completed", {
        success,
        error,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Parse AI response for code blocks
  parseResponse(response) {
    const codeMatch = response.match(/```(?:python)?\s*([\s\S]+?)\s*```/);

    if (codeMatch) {
      const codeContent = codeMatch[1].trim();
      let textContent = response
        .replace(/```(?:python)?\s*[\s\S]+?\s*```/, "")
        .trim();

      if (!textContent) {
        textContent = "Here's a code suggestion:";
      }

      return {
        type: "code",
        content: textContent,
        code: codeContent,
      };
    }

    return { type: "text", content: response };
  }

  // Abstract method for subclasses
  async getSuggestion(userPrompt) {
    throw new Error("getSuggestion method must be implemented by subclasses");
  }

  /**
   * Cleanup method for destroying assistant instance
   */
  destroy() {
    // Clear conversation history
    this.conversationManager.clearHistory();

    // Clear chat UI
    this.chatRenderer.clearChat();

    // Remove all event listeners
    this.eventEmitter = new EventTarget();

    this.emit("destroyed", { assistantId: this.assistantId });

    console.log(`🗑️ Assistant ${this.assistantId} destroyed`);
  }

  /**
   * Get assistant status and health information
   * @returns {object} Status information
   */
  getStatus() {
    return {
      id: this.assistantId,
      isGenerating: this.isGenerating,
      conversationLength: this.conversationManager.getHistoryLength(),
      lastActivity: this.conversationManager.getLastActivity?.() || null,
      health: "healthy", // Can be extended with health checks
    };
  }
}
