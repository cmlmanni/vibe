/* filepath: /js/modules/ai/assistants/reflectiveAssistant.js */
import { AIAssistant } from "../base/aiAssistant.js";

export class ReflectiveAssistant extends AIAssistant {
  constructor(params) {
    // Support both old and new constructor patterns
    if (typeof params === "object" && !params.systemPrompt && !params.config) {
      // Old pattern: constructor(eventLogger, domElements)
      const eventLogger = params;
      const domElements = arguments[1];

      const systemPrompt = `You are a Socratic tutor specializing in Python turtle graphics. Your primary method is to guide learning through strategic questioning rather than providing direct answers or solutions.

Core Socratic principles:
- Ask questions that lead students to discover answers themselves
- Break down complex problems into smaller, manageable questions
- Help students examine their assumptions and reasoning
- Guide them to test their ideas and learn from results
- Never give direct answers - always respond with clarifying or guiding questions
- Build understanding step by step through dialogue

Questioning strategies:
- "What do you think will happen if...?"
- "Why do you think that approach might work?"
- "What patterns do you notice in your code?"
- "How is this similar to something you've done before?"
- "What would you try first to solve this?"
- "What does the error message tell you?"
- "If that didn't work, what might be the reason?"

Response patterns:
- Always respond with questions that guide thinking
- Acknowledge their attempts: "I see you tried X. What made you choose that approach?"
- Connect to prior knowledge: "How does this relate to what you learned earlier?"
- Encourage experimentation: "What would happen if you changed...?"
- Help them reflect: "What did you learn from that result?"

You should NEVER:
- Provide direct code solutions
- Give step-by-step instructions
- Tell them exactly what to do
- Explain concepts directly without questioning

Instead, always guide through questions that help them discover the solution themselves.`;

      super({
        systemPrompt,
        eventLogger,
        domElements,
        assistantId: "reflective",
        config: {
          id: "reflective",
          name: "Socratic Tutor",
          capabilities: [
            "socratic_questioning",
            "guided_discovery",
            "strategic_inquiry",
            "reflection_facilitation",
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

    // Socratic assistant-specific initialization
    this.questionsAsked = [];
    this.questionTypes = []; // Track different types of Socratic questions
    this.learningProgress = new Map();
    this.guidanceLevel = this.settings.questionGuidanceRatio || 0.9; // 90% questions
    this.currentInquiryThread = null; // Track current line of questioning

    console.log(`🤔 Socratic Tutor initialized (${this.assistantId})`);
  }

  async getSuggestion(userPrompt) {
    console.log("🤔 SocraticAssistant processing:", userPrompt);
    if (this.isGenerating) return;

    this.emit("socraticInquiryStarted", { prompt: userPrompt });

    // Enhanced logging for Socratic interactions
    this.logAssistantEvent("socratic_inquiry_started", {
      prompt: userPrompt.substring(0, 200), // Truncate for storage
      mode: "socratic",
      historyLength: this.conversationManager.getHistoryLength(),
      questionsAskedCount: this.questionsAsked.length,
      currentInquiryThread: this.currentInquiryThread,
    });

    // Legacy logging for compatibility
    this.eventLogger.logEvent("ai_prompt", {
      prompt: userPrompt,
      mode: "socratic",
      assistantId: this.assistantId,
      historyLength: this.conversationManager.getHistoryLength(),
    });

    const response = await this.fetchFromAI(userPrompt);

    // Enhanced logging with Socratic-specific data
    this.logAssistantEvent("socratic_response_generated", {
      responseType: response.type,
      responseLength: response.content?.length || 0,
      wasCodeRedirected: response.type === "code",
      questionTypesUsed: this.questionTypes.slice(-5), // Last 5 question types
      historyLength: this.conversationManager.getHistoryLength(),
    });

    // Legacy logging for compatibility
    this.eventLogger.logEvent("ai_response", {
      response,
      assistantId: this.assistantId,
      historyLength: this.conversationManager.getHistoryLength(),
    });

    // Track and categorize the Socratic questioning
    this.trackSocraticResponse(response, userPrompt);

    if (response.type === "text") {
      this.createChatMessage(response.content, "ai");
      this.emit("socraticQuestionAsked", {
        content: response.content,
        prompt: userPrompt,
      });
    } else if (response.type === "code") {
      // Socratic tutor should NEVER provide code directly
      // Convert any code response to a guiding question
      const guidingQuestion = `I notice you might be looking for a code solution. Instead, let me ask: what do you think the first step should be to solve this problem?`;
      this.createChatMessage(guidingQuestion, "ai");

      // Log code redirection
      this.logAssistantEvent("code_redirected_to_question", {
        originalCodeLength: response.code?.length || 0,
        guidingQuestion: guidingQuestion.substring(0, 100),
        wasRedirected: true,
      });

      this.emit("codeRedirectedToQuestion", {
        originalCode: response.code,
        guidingQuestion: guidingQuestion,
        prompt: userPrompt,
        note: "Code response converted to Socratic question",
      });
    }

    this.emit("socraticInquiryCompleted", { response, prompt: userPrompt });
  }

  /**
   * Track and categorize Socratic questioning patterns
   * @param {object} response - AI response
   * @param {string} userPrompt - Original user prompt
   */
  trackSocraticResponse(response, userPrompt) {
    const content = response.content.toLowerCase();

    // Categorize the type of Socratic question
    const questionType = this.categorizeSocraticQuestion(content);

    const entry = {
      prompt: userPrompt,
      response: response.content,
      questionType,
      isQuestion: content.includes("?"),
      timestamp: new Date(),
    };

    this.questionsAsked.push(entry);
    this.questionTypes.push(questionType);

    if (entry.isQuestion) {
      this.emit("socraticQuestionAsked", entry);
    } else {
      this.emit("nonQuestionResponse", entry);
    }
  }

  /**
   * Categorize the type of Socratic question
   * @param {string} content - Response content in lowercase
   * @returns {string} Question category
   */
  categorizeSocraticQuestion(content) {
    if (
      content.includes("what do you think") ||
      content.includes("what would you")
    ) {
      return "hypothesis_generation";
    }
    if (content.includes("why") || content.includes("what makes you")) {
      return "reasoning_exploration";
    }
    if (
      content.includes("how is this similar") ||
      content.includes("how does this relate")
    ) {
      return "connection_building";
    }
    if (
      content.includes("what happened") ||
      content.includes("what did you notice")
    ) {
      return "observation_inquiry";
    }
    if (
      content.includes("what would happen if") ||
      content.includes("what if you")
    ) {
      return "experimentation_prompt";
    }
    if (
      content.includes("what patterns") ||
      content.includes("what do you see")
    ) {
      return "pattern_recognition";
    }
    if (
      content.includes("how would you") ||
      content.includes("what approach")
    ) {
      return "strategy_inquiry";
    }
    return "general_inquiry";
  }

  /**
   * Get statistics about Socratic teaching approach
   * @returns {object} Socratic teaching statistics
   */
  getSocraticStats() {
    const totalResponses = this.questionsAsked.length;
    const questionCount = this.questionsAsked.filter(
      (entry) => entry.isQuestion
    ).length;
    const statementCount = totalResponses - questionCount;

    // Count question types
    const questionTypeCounts = this.questionTypes.reduce((counts, type) => {
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {});

    return {
      totalResponses,
      questionCount,
      statementCount,
      questionRatio: totalResponses > 0 ? questionCount / totalResponses : 0,
      targetRatio: this.guidanceLevel,
      questionTypeDistribution: questionTypeCounts,
      mostCommonQuestionType: this.getMostCommonQuestionType(),
    };
  }

  /**
   * Get the most commonly used question type
   * @returns {string} Most common question type
   */
  getMostCommonQuestionType() {
    if (this.questionTypes.length === 0) return "none";

    const counts = this.questionTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts).reduce((a, b) =>
      counts[a] > counts[b] ? a : b
    );
  }

  /**
   * Start a new line of Socratic inquiry
   * @param {string} topic - The topic to explore
   * @param {string} startingQuestion - Initial question to begin inquiry
   */
  startInquiryThread(topic, startingQuestion) {
    this.currentInquiryThread = {
      topic,
      startingQuestion,
      questionsInThread: [],
      startTime: new Date(),
    };

    this.emit("inquiryThreadStarted", {
      topic,
      startingQuestion,
    });
  }

  /**
   * Add question to current inquiry thread
   * @param {string} question - Question to add to thread
   */
  addToInquiryThread(question) {
    if (this.currentInquiryThread) {
      this.currentInquiryThread.questionsInThread.push({
        question,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Complete current inquiry thread
   */
  completeInquiryThread() {
    if (this.currentInquiryThread) {
      this.emit("inquiryThreadCompleted", {
        ...this.currentInquiryThread,
        endTime: new Date(),
      });
      this.currentInquiryThread = null;
    }
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
    const socraticStats = this.getSocraticStats();

    return {
      ...baseStatus,
      socraticStats,
      learningTopics: this.learningProgress.size,
      currentInquiry: this.currentInquiryThread?.topic || null,
      specializations: [
        "socratic_questioning",
        "guided_discovery",
        "strategic_inquiry",
        "reflection_facilitation",
      ],
    };
  }

  /**
   * Clear teaching history and learning progress
   */
  clearTeachingHistory() {
    this.questionsAsked = [];
    this.questionTypes = [];
    this.learningProgress.clear();
    this.currentInquiryThread = null;
    this.emit("teachingHistoryCleared");
  }

  /**
   * Generate a Socratic question based on student's current work
   * @param {string} studentCode - Current code the student is working on
   * @param {string} context - Context of their current challenge
   * @returns {string} Socratic question
   */
  generateSocraticQuestion(studentCode, context = "general") {
    const questionTemplates = {
      general: [
        "What do you think this code will do when you run it?",
        "What patterns do you notice in your code?",
        "How does this relate to what you've learned before?",
      ],
      error: [
        "What do you think might be causing this error?",
        "What does the error message tell you?",
        "How could you test your hypothesis about what's wrong?",
      ],
      improvement: [
        "What would happen if you changed this part?",
        "How could you make this code more efficient?",
        "What other approaches might work here?",
      ],
      understanding: [
        "Why do you think this approach works?",
        "What would you expect to see if this was working correctly?",
        "How would you explain what this code does to someone else?",
      ],
    };

    const templates = questionTemplates[context] || questionTemplates.general;
    return templates[Math.floor(Math.random() * templates.length)];
  }
}
