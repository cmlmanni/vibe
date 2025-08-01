/* filepath: /js/modules/ai/assistants/reflectiveAssistant.js */
import { AIAssistant } from "../base/aiAssistant.js";

export class ReflectiveAssistant extends AIAssistant {
  constructor(params) {
    // Support both old and new constructor patterns
    if (typeof params === "object" && !params.systemPrompt && !params.config) {
      // Old pattern: constructor(eventLogger, domElements)
      const eventLogger = params;
      const domElements = arguments[1];

      const systemPrompt = `You are a friendly Socratic tutor specializing in Python turtle graphics. You maintain conversation context to guide learning effectively.

Key capabilities:
- Remember our previous discussions and learning progress
- Guide through thoughtful questions rather than giving direct answers
- Reference what we've covered before
- Build upon previous learning moments
- Encourage discovery and understanding

You should NOT write code for users, but guide them to discover solutions themselves while maintaining awareness of our conversation history.`;

      super({
        systemPrompt,
        eventLogger,
        domElements,
        assistantId: "reflective",
        config: {
          id: "reflective",
          name: "Reflective Tutor",
          capabilities: [
            "socratic_method",
            "guided_learning",
            "educational_guidance",
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

    // Reflective assistant-specific initialization
    this.questionsAsked = [];
    this.learningProgress = new Map();
    this.guidanceLevel = this.settings.questionGuidanceRatio || 0.7;

    console.log(`🤔 Reflective Assistant initialized (${this.assistantId})`);
  }

  async getSuggestion(userPrompt) {
    console.log("🤔 ReflectiveAssistant processing:", userPrompt);
    if (this.isGenerating) return;

    this.emit("reflectionStarted", { prompt: userPrompt });

    this.eventLogger.logEvent("ai_prompt", {
      prompt: userPrompt,
      mode: "reflective",
      assistantId: this.assistantId,
      historyLength: this.conversationManager.getHistoryLength(),
    });

    const response = await this.fetchFromAI(userPrompt);

    this.eventLogger.logEvent("ai_response", {
      response,
      assistantId: this.assistantId,
      historyLength: this.conversationManager.getHistoryLength(),
    });

    // Track questions vs direct guidance
    this.trackResponse(response, userPrompt);

    if (response.type === "text") {
      this.createChatMessage(response.content, "ai");
      this.emit("guidanceProvided", {
        content: response.content,
        prompt: userPrompt,
      });
    } else if (response.type === "code") {
      // Reflective assistant typically shouldn't provide code, but handle it gracefully
      this.createChatMessage(response.content, "ai", response.code);
      this.emit("codeProvided", {
        code: response.code,
        content: response.content,
        prompt: userPrompt,
        note: "Reflective assistant provided code - may need adjustment",
      });
    }

    this.emit("reflectionCompleted", { response, prompt: userPrompt });
  }

  /**
   * Track whether response was a question or guidance
   * @param {object} response - AI response
   * @param {string} userPrompt - Original user prompt
   */
  trackResponse(response, userPrompt) {
    const isQuestion =
      response.content.includes("?") ||
      response.content.toLowerCase().includes("what do you think") ||
      response.content.toLowerCase().includes("how might");

    const entry = {
      prompt: userPrompt,
      response: response.content,
      isQuestion,
      timestamp: new Date(),
    };

    this.questionsAsked.push(entry);

    if (isQuestion) {
      this.emit("questionAsked", entry);
    }
  }

  /**
   * Get statistics about teaching approach
   * @returns {object} Teaching statistics
   */
  getTeachingStats() {
    const totalResponses = this.questionsAsked.length;
    const questionCount = this.questionsAsked.filter(
      (entry) => entry.isQuestion
    ).length;
    const guidanceCount = totalResponses - questionCount;

    return {
      totalResponses,
      questionCount,
      guidanceCount,
      questionRatio: totalResponses > 0 ? questionCount / totalResponses : 0,
      targetRatio: this.guidanceLevel,
    };
  }

  /**
   * Update learning progress for a topic
   * @param {string} topic - Learning topic
   * @param {number} progress - Progress level (0-1)
   */
  updateLearningProgress(topic, progress) {
    this.learningProgress.set(topic, {
      level: progress,
      lastUpdated: new Date(),
    });

    this.emit("learningProgressUpdated", { topic, progress });
  }

  /**
   * Get learning progress for all topics
   * @returns {object} Learning progress data
   */
  getLearningProgress() {
    return Object.fromEntries(this.learningProgress);
  }

  /**
   * Get assistant-specific status
   * @returns {object} Enhanced status information
   */
  getStatus() {
    const baseStatus = super.getStatus();
    const teachingStats = this.getTeachingStats();

    return {
      ...baseStatus,
      teachingStats,
      learningTopics: this.learningProgress.size,
      specializations: [
        "socratic_method",
        "guided_learning",
        "educational_guidance",
      ],
    };
  }

  /**
   * Clear teaching history and learning progress
   */
  clearTeachingHistory() {
    this.questionsAsked = [];
    this.learningProgress.clear();
    this.emit("teachingHistoryCleared");
  }
}
