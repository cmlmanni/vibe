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

    // Initialize assistant-specific setup
    this.initialize();
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
    try {
      this.isGenerating = true;
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
      const response = await getAIResponse(
        this.getConversationForAPI(),
        this.systemPrompt
      );

      // Remove thinking message
      this.chatRenderer.removeLastMessage();
      this.isGenerating = false;

      if (!response || typeof response !== "string") {
        console.error("Invalid response from AI:", response);
        return {
          type: "text",
          content: "Sorry, I received an invalid response. Please try again.",
        };
      }

      // Add AI response to history
      this.addToHistory("assistant", response);

      // Parse response for code blocks
      return this.parseResponse(response);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      this.chatRenderer.removeLastMessage();
      this.isGenerating = false;

      return {
        type: "text",
        content: `Error: ${error.message || "Failed to get AI response"}`,
      };
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
