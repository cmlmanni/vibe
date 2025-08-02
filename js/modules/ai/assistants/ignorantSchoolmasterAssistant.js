/* filepath: /js/modules/ai/assistants/ignorantSchoolmasterAssistant.js */
import { AIAssistant } from "../base/aiAssistant.js";

export class IgnorantSchoolmasterAssistant extends AIAssistant {
  constructor(params) {
    // Support both old and new constructor patterns
    if (typeof params === "object" && !params.systemPrompt && !params.config) {
      // Old pattern: constructor(eventLogger, domElements)
      const eventLogger = params;
      const domElements = arguments[1];

      const systemPrompt = `You are an "ignorant schoolmaster" based on Joseph Jacotot's method, adapted for a typing interface. You embody equal intelligence and are purely reactive to student-generated code.

Core principles:
- You do not teach content or provide code solutions - students must discover for themselves
- You only react to what students show you - never suggest code
- Use simple yes/no questions and binary confirmations
- Focus on what students have already done, not what they should do
- Verify through repetition and comparison with minimal typing
- Assume equal intelligence - students can figure out their own solutions

Communication style (purely reactive Jacotot approach):
- "Run that code. Did it work? (yes/no)"
- "What happened when you changed it? (worked/error/same)"
- "Try it again. Same result? (yes/no)"
- "Compare your line 1 with line 3. Same? (yes/no)"
- "Run it without that line. Better or worse? (better/worse/same)"
- "Does your code match what you expected? (yes/no)"

Reactive responses only:
- React to student's existing code
- Ask about their results
- Request binary confirmations about their work
- Compare their attempts
- Verify their observations

You should NEVER:
- Provide code suggestions or solutions
- Tell students what code to write
- Give specific programming instructions
- Ask for long descriptions
- Request detailed explanations
- Use open-ended questions
- Explain concepts or provide theory

Instead, only react to what they've already done:
- "Your code did X. Expected? (yes/no)"
- "Run your code again. Same result? (yes/no)"
- "Does your output match your goal? (yes/no)"
- "Try your code without line 2. Different? (yes/no)"
- Maintain equal intelligence through reactive questioning, not proactive teaching`;

      super({
        systemPrompt,
        eventLogger,
        domElements,
        assistantId: "ignorant-schoolmaster",
        config: {
          id: "ignorant-schoolmaster",
          name: "Reactive Verifier",
          capabilities: [
            "reactive_questioning",
            "binary_verification",
            "result_confirmation",
            "equal_intelligence_method",
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

    // Ignorant schoolmaster-specific initialization (purely reactive)
    this.reactiveQuestions = [];
    this.binaryConfirmations = [];
    this.resultVerifications = [];
    this.studentCodeAnalysis = [];

    console.log(
      `🔍 Ignorant Schoolmaster Assistant initialized (${this.assistantId})`
    );
  }

  async getSuggestion(userPrompt) {
    console.log("🔍 IgnorantSchoolmasterAssistant processing:", userPrompt);
    if (this.isGenerating) return;

    this.emit("explorationStarted", { prompt: userPrompt });

    // Enhanced logging for reactive interactions
    this.logAssistantEvent("reactive_exploration_started", {
      prompt: userPrompt.substring(0, 200), // Truncate for storage
      mode: "ignorant_schoolmaster",
      historyLength: this.conversationManager.getHistoryLength(),
      interactionsCount: this.interactions.length,
      verificationMode: this.verificationMode,
    });

    // Legacy logging for compatibility
    this.eventLogger.logEvent("ai_prompt", {
      prompt: userPrompt,
      mode: "ignorant_schoolmaster",
      assistantId: this.assistantId,
      historyLength: this.conversationManager.getHistoryLength(),
    });

    const response = await this.fetchFromAI(userPrompt);

    // Enhanced logging with reactive-specific data
    this.logAssistantEvent("reactive_response_generated", {
      responseType: response.type,
      responseLength: response.content?.length || 0,
      wasCodeRejected: response.type === "code",
      interactionType: this.categorizeInteraction(userPrompt),
      historyLength: this.conversationManager.getHistoryLength(),
    });

    // Legacy logging for compatibility
    this.eventLogger.logEvent("ai_response", {
      response,
      assistantId: this.assistantId,
      historyLength: this.conversationManager.getHistoryLength(),
    });

    // Track the type of interaction
    this.trackInteraction(response, userPrompt);

    if (response.type === "text") {
      this.createChatMessage(response.content, "ai");
      this.emit("reactiveQuestionAsked", {
        content: response.content,
        prompt: userPrompt,
      });
    } else if (response.type === "code") {
      // Ignorant schoolmaster NEVER provides code solutions - purely reactive
      // Convert any code responses to reactive questions about student's existing code
      const reactiveQuestion = `Look at your code. Does it do what you expected? (yes/no)`;
      this.createChatMessage(reactiveQuestion, "ai");

      // Log code rejection
      this.logAssistantEvent("code_rejected_reactive_question", {
        rejectedCodeLength: response.code?.length || 0,
        reactiveQuestion: reactiveQuestion,
        purelyReactive: true,
      });

      this.emit("reactiveQuestionAsked", {
        content: reactiveQuestion,
        rejectedCode: response.code,
        prompt: userPrompt,
        note: "Rejected code suggestion - converted to reactive question about student's work",
      });
    }

    this.emit("explorationCompleted", { response, prompt: userPrompt });
  }

  /**
   * Track different types of ignorant schoolmaster interactions
   * @param {object} response - AI response
   * @param {string} userPrompt - Original user prompt
   */
  trackInteraction(response, userPrompt) {
    const content = response.content.toLowerCase();

    const interactionType = this.categorizeInteraction(content);

    const entry = {
      prompt: userPrompt,
      response: response.content,
      type: interactionType,
      timestamp: new Date(),
    };

    // Track different types of interactions
    switch (interactionType) {
      case "reactive_question":
        this.reactiveQuestions.push(entry);
        this.emit("reactiveQuestionAsked", entry);
        break;
      case "binary_question":
        this.binaryConfirmations.push(entry);
        this.emit("binaryQuestionAsked", entry);
        break;
      case "result_verification":
        this.resultVerifications.push(entry);
        this.emit("resultVerificationRequested", entry);
        break;
      case "verification":
      case "confirmation":
      case "comparison":
        this.studentCodeAnalysis.push(entry);
        this.emit("studentCodeAnalyzed", entry);
        break;
    }
  }

  /**
   * Categorize the type of reactive interaction
   * @param {string} content - Response content in lowercase
   * @returns {string} Interaction type
   */
  categorizeInteraction(content) {
    if (
      content.includes("does your") ||
      content.includes("did your") ||
      content.includes("your code") ||
      content.includes("look at your")
    ) {
      return "reactive_question";
    }
    if (
      content.includes("(yes/no)") ||
      content.includes("did it work?") ||
      content.includes("same result?") ||
      content.includes("better or worse?")
    ) {
      return "binary_question";
    }
    if (
      content.includes("what happened") ||
      content.includes("run it") ||
      content.includes("try it again") ||
      content.includes("without that line")
    ) {
      return "result_verification";
    }
    if (content.includes("compare") || content.includes("match")) {
      return "comparison";
    }
    return "confirmation";
  }

  /**
   * Record a moment of mutual learning
   * @param {string} topic - What was learned
   * @param {string} studentContribution - What the student contributed
   * @param {string} assistantRealization - What the assistant realized
   */
  recordMutualLearning(topic, studentContribution, assistantRealization) {
    this.mutualLearning.set(topic, {
      studentContribution,
      assistantRealization,
      timestamp: new Date(),
    });

    this.emit("mutualLearningRecorded", {
      topic,
      studentContribution,
      assistantRealization,
    });
  }

  /**
   * Get statistics about the reactive approach
   * @returns {object} Reactive statistics
   */
  getReactiveStats() {
    const totalInteractions =
      this.reactiveQuestions.length +
      this.binaryConfirmations.length +
      this.resultVerifications.length +
      this.studentCodeAnalysis.length;

    return {
      totalInteractions,
      reactiveQuestions: this.reactiveQuestions.length,
      binaryConfirmations: this.binaryConfirmations.length,
      resultVerifications: this.resultVerifications.length,
      studentCodeAnalysis: this.studentCodeAnalysis.length,
      reactiveRatio:
        totalInteractions > 0
          ? (this.reactiveQuestions.length + this.resultVerifications.length) /
            totalInteractions
          : 0,
    };
  }

  /**
   * Get recent reactive questions
   * @param {number} limit - Number of recent questions to return
   * @returns {array} Recent reactive questions
   */
  getRecentReactiveQuestions(limit = 5) {
    return this.reactiveQuestions.slice(-limit).reverse(); // Most recent first
  }

  /**
   * Get assistant-specific status
   * @returns {object} Enhanced status information
   */
  getStatus() {
    const baseStatus = super.getStatus();
    const reactiveStats = this.getReactiveStats();

    return {
      ...baseStatus,
      reactiveStats,
      philosophy: "ignorant_schoolmaster",
      approach: "purely_reactive_jacotot",
      specializations: [
        "reactive_questioning",
        "binary_verification",
        "result_confirmation",
        "equal_intelligence_method",
      ],
      recentReactiveQuestions: this.getRecentReactiveQuestions(3),
    };
  }

  /**
   * Clear reactive interaction history
   */
  clearReactiveHistory() {
    this.reactiveQuestions = [];
    this.binaryConfirmations = [];
    this.resultVerifications = [];
    this.studentCodeAnalysis = [];
    this.emit("reactiveHistoryCleared");
  }

  /**
   * Ask reactive question about student's code
   * @param {string} observation - What was observed about their code
   */
  askReactiveQuestion(observation) {
    this.emit("reactiveQuestionAsked", {
      observation,
      timestamp: new Date(),
      message: "Assistant asked reactive question about student's work",
    });
  }

  /**
   * Request binary confirmation
   * @param {string} element - What to confirm
   * @returns {string} Binary confirmation request
   */
  requestConfirmation(element) {
    const confirmations = [
      `Did ${element} work? (yes/no)`,
      `Same result with ${element}? (yes/no)`,
      `Is ${element} running? (yes/no)`,
      `Does ${element} match? (yes/no)`,
    ];

    return confirmations[Math.floor(Math.random() * confirmations.length)];
  }

  /**
   * Create reactive question about student's existing work
   * @param {string} studentWork - What the student has done
   * @param {string} aspect - What aspect to question
   * @returns {string} Reactive question
   */
  createReactiveQuestion(studentWork, aspect = "result") {
    const questions = [
      `Your ${studentWork} - does it work? (yes/no)`,
      `Run your ${studentWork}. What happened? (worked/error/unexpected)`,
      `Does your ${studentWork} do what you wanted? (yes/no)`,
      `Try your ${studentWork} again. Same result? (yes/no)`,
    ];

    return questions[Math.floor(Math.random() * questions.length)];
  }
}
