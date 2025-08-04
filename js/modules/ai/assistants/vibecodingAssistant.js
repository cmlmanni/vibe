/* filepath: /js/modules/ai/assistants/vibecodingAssistant.js */
import { AIAssistant } from "../base/aiAssistant.js";

export class VibecodingAssistant extends AIAssistant {
  constructor(params) {
    // Support both old and new constructor patterns
    if (typeof params === "object" && !params.systemPrompt && !params.config) {
      // Old pattern: constructor(eventLogger, domElements)
      const eventLogger = params;
      const domElements = arguments[1];

      const systemPrompt = `You are a friendly Python programming assistant specializing in turtle graphics. You maintain context from our previous conversation to provide better help.

Key capabilities:
- Remember what we've discussed before
- Provide Python turtle graphics solutions
- Have casual conversations
- Build upon previous suggestions and code
- Whenever offer code, even in the case of giving the same code, ensure it is runnable on its own (i.e., starts with 'import turtle')
- If there is redundant function or testing codes that is not useful from the prompt asked by the user, or if those codes are not needed, do not include them
- You should debug code and suggest improvements
- Explanation should come after the codes, if offered 
- Reference earlier parts of our conversation when relevant

Be helpful, friendly, and contextually aware of our ongoing conversation.`;

      super({
        systemPrompt,
        eventLogger,
        domElements,
        assistantId: "vibecoding",
        config: {
          id: "vibecoding",
          name: "VibeCoding Assistant",
          capabilities: [
            "code_generation",
            "context_awareness",
            "turtle_graphics",
          ],
        },
      });
    } else {
      // New pattern: constructor(params)
      super(params);
    }
  }

  initialize() {
    super.initialize();

    // VibeCoding-specific initialization
    this.codeExamples = [];
    this.lastCodeSuggestion = null;

    console.log(`🚀 VibeCoding Assistant initialized (${this.assistantId})`);
  }

  async getSuggestion(userPrompt) {
    console.log("🚀 VibecodingAssistant processing:", userPrompt);
    if (this.isGenerating) return;

    this.emit("suggestionStarted", { prompt: userPrompt });

    // Use enhanced logging from base class
    this.logAssistantEvent("suggestion_started", {
      prompt: userPrompt.substring(0, 200), // Truncate for storage
      mode: "vibecoding",
      historyLength: this.conversationManager.getHistoryLength(),
      codeExamplesCount: this.codeExamples.length,
    });

    // Legacy logging for compatibility
    this.eventLogger.logEvent("ai_prompt", {
      prompt: userPrompt,
      mode: "vibecoding",
      assistantId: this.assistantId,
      historyLength: this.conversationManager.getHistoryLength(),
    });

    const response = await this.fetchFromAI(userPrompt);

    // Enhanced logging with vibecoding-specific data
    this.logAssistantEvent("suggestion_completed", {
      responseType: response.type,
      responseLength: response.content?.length || 0,
      hasCode: response.type === "code",
      codeLength: response.code?.length || 0,
      historyLength: this.conversationManager.getHistoryLength(),
    });

    // Legacy logging for compatibility
    this.eventLogger.logEvent("ai_response", {
      response,
      assistantId: this.assistantId,
      historyLength: this.conversationManager.getHistoryLength(),
    });

    // Store last code suggestion for reference
    if (response.type === "code") {
      this.lastCodeSuggestion = response.code;
      this.codeExamples.push({
        prompt: userPrompt,
        code: response.code,
        timestamp: new Date(),
      });

      this.createChatMessage(response.content, "ai", response.code);
      this.emit("codeGenerated", { code: response.code, prompt: userPrompt });
    } else if (response.type === "text") {
      this.createChatMessage(response.content, "ai");
      this.emit("textResponse", {
        content: response.content,
        prompt: userPrompt,
      });
    }

    this.emit("suggestionCompleted", { response, prompt: userPrompt });
  }

  /**
   * Get the last code suggestion
   * @returns {string|null} Last generated code or null
   */
  getLastCodeSuggestion() {
    return this.lastCodeSuggestion;
  }

  /**
   * Get all code examples generated in this session
   * @returns {Array} Array of code examples with metadata
   */
  getCodeExamples() {
    return [...this.codeExamples];
  }

  /**
   * Clear code examples history
   */
  clearCodeExamples() {
    this.codeExamples = [];
    this.lastCodeSuggestion = null;
    this.emit("codeExamplesCleared");
  }

  /**
   * Get assistant-specific status
   * @returns {object} Enhanced status information
   */
  getStatus() {
    const baseStatus = super.getStatus();
    return {
      ...baseStatus,
      codeExamplesCount: this.codeExamples.length,
      hasLastCodeSuggestion: !!this.lastCodeSuggestion,
      specializations: [
        "turtle_graphics",
        "python_programming",
        "code_generation",
      ],
    };
  }
}
