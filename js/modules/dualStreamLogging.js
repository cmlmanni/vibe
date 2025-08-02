/* Dual-Stream Logging System - Separate AI and User Logs */

export function initializeDualStreamLogging() {
  // User Behavior Stream - Pure empirical data
  const userStream = {
    sessionId: generateSessionId(),
    startTime: new Date().toISOString(),
    participantId: null,
    condition: null,

    // User behavioral events only
    events: [],

    // Aggregated user metrics
    metrics: {
      totalKestrokes: 0,
      totalCodeAttempts: 0,
      totalSuccessfulExecutions: 0,
      totalErrors: 0,
      totalHelpRequests: 0,
      taskProgressions: [],
      errorRecoveryTimes: [],
      helpSeekingIntervals: [],
    },
  };

  // AI System Stream - Assistant performance and interactions
  const aiStream = {
    sessionId: userStream.sessionId,
    startTime: userStream.startTime,

    // AI-related events only
    interactions: [],
    systemEvents: [],

    // Assistant analytics
    assistants: {
      vibecoding: { interactions: 0, avgResponseTime: 0, errors: 0 },
      reflective: { interactions: 0, avgResponseTime: 0, errors: 0 },
      ignorantSchoolmaster: { interactions: 0, avgResponseTime: 0, errors: 0 },
    },

    // Performance metrics
    overallMetrics: {
      totalInteractions: 0,
      avgResponseTime: 0,
      successRate: 0,
      assistantSwitches: 0,
    },
  };

  // Shared context for linking streams
  let currentTask = null;
  let sessionStartTime = Date.now();

  // ================================
  // USER STREAM FUNCTIONS
  // ================================

  function logUserKeystroke(keyData) {
    userStream.metrics.totalKestrokes++;

    // Only log significant keystroke events
    if (keyData.isSignificant) {
      userStream.events.push({
        type: "keystroke",
        timestamp: new Date().toISOString(),
        data: {
          key: keyData.key,
          isBackspace: keyData.key === "Backspace",
          isCode: keyData.isCodeEditor || false,
          taskId: currentTask?.id || null,
        },
      });
    }
  }

  function logUserCodeAttempt(code, success, error = null) {
    const timestamp = new Date().toISOString();
    userStream.metrics.totalCodeAttempts++;

    if (success) {
      userStream.metrics.totalSuccessfulExecutions++;
    } else {
      userStream.metrics.totalErrors++;
    }

    userStream.events.push({
      type: "code_execution",
      timestamp,
      data: {
        codeLength: code.length,
        success: success,
        errorType: error ? categorizeError(error) : null,
        taskId: currentTask?.id || null,
        attemptNumber: userStream.metrics.totalCodeAttempts,
      },
    });

    // Track error recovery if this follows an error
    if (success && userStream.events.length > 1) {
      const lastEvents = userStream.events.slice(-5);
      const lastError = lastEvents
        .reverse()
        .find((e) => e.type === "code_execution" && !e.data.success);

      if (lastError) {
        const recoveryTime =
          new Date(timestamp) - new Date(lastError.timestamp);
        userStream.metrics.errorRecoveryTimes.push(recoveryTime);
      }
    }
  }

  function logUserHelpRequest(prompt) {
    const timestamp = new Date().toISOString();
    userStream.metrics.totalHelpRequests++;

    userStream.events.push({
      type: "help_request",
      timestamp,
      data: {
        promptLength: prompt.length,
        wordCount: prompt.trim().split(/\s+/).length,
        taskId: currentTask?.id || null,
        requestNumber: userStream.metrics.totalHelpRequests,
      },
    });

    // Track help-seeking intervals
    const lastHelpRequest = userStream.events
      .slice(0, -1)
      .reverse()
      .find((e) => e.type === "help_request");

    if (lastHelpRequest) {
      const interval =
        new Date(timestamp) - new Date(lastHelpRequest.timestamp);
      userStream.metrics.helpSeekingIntervals.push(interval);
    }
  }

  function logUserTaskProgression(taskId, action, metadata = {}) {
    const timestamp = new Date().toISOString();

    userStream.events.push({
      type: "task_progression",
      timestamp,
      data: {
        taskId,
        action, // 'started', 'completed', 'step_advanced'
        ...metadata,
      },
    });

    userStream.metrics.taskProgressions.push({
      taskId,
      action,
      timestamp,
      ...metadata,
    });

    // Update current task context
    if (action === "started") {
      currentTask = { id: taskId, startTime: timestamp };
    } else if (action === "completed") {
      currentTask = null;
    }
  }

  // ================================
  // AI STREAM FUNCTIONS
  // ================================

  function logAIInteraction(
    assistantId,
    userInput,
    assistantResponse,
    responseTime,
    metadata = {}
  ) {
    const timestamp = new Date().toISOString();

    const interaction = {
      id: `ai_${aiStream.interactions.length + 1}`,
      timestamp,
      assistantId,
      userInput: {
        text: userInput,
        length: userInput.length,
        wordCount: userInput.trim().split(/\s+/).length,
      },
      assistantResponse: {
        text: assistantResponse,
        length: assistantResponse.length,
        hasCodeBlock: assistantResponse.includes("```"),
        questionCount: (assistantResponse.match(/\?/g) || []).length,
      },
      performance: {
        responseTime,
        success: !metadata.error,
        error: metadata.error || null,
      },
      context: {
        taskId: currentTask?.id || null,
        interactionNumber: aiStream.interactions.length + 1,
        ...metadata,
      },
    };

    aiStream.interactions.push(interaction);

    // Update assistant metrics
    if (aiStream.assistants[assistantId]) {
      const assistant = aiStream.assistants[assistantId];
      assistant.interactions++;

      // Update average response time
      const totalTime =
        assistant.avgResponseTime * (assistant.interactions - 1) + responseTime;
      assistant.avgResponseTime = Math.round(
        totalTime / assistant.interactions
      );

      if (metadata.error) {
        assistant.errors++;
      }
    }

    // Update overall metrics
    aiStream.overallMetrics.totalInteractions++;
    const totalTime =
      aiStream.overallMetrics.avgResponseTime *
        (aiStream.overallMetrics.totalInteractions - 1) +
      responseTime;
    aiStream.overallMetrics.avgResponseTime = Math.round(
      totalTime / aiStream.overallMetrics.totalInteractions
    );
  }

  function logAISystemEvent(eventType, data) {
    // Only log significant system events, not redundant initialization
    if (shouldLogSystemEvent(eventType)) {
      aiStream.systemEvents.push({
        type: eventType,
        timestamp: new Date().toISOString(),
        data: data,
      });
    }
  }

  function shouldLogSystemEvent(eventType) {
    // Filter out redundant system events
    const importantEvents = [
      "experiment_initialized",
      "assistant_switch",
      "system_error",
      "performance_degradation",
    ];

    return importantEvents.includes(eventType);
  }

  // ================================
  // EXPORT FUNCTIONS
  // ================================

  function exportUserLog() {
    return {
      metadata: {
        type: "user_behavior_log",
        sessionId: userStream.sessionId,
        exportedAt: new Date().toISOString(),
        sessionDuration: Date.now() - sessionStartTime,
        participantId: userStream.participantId,
        condition: userStream.condition,
      },

      behavioralData: {
        events: userStream.events,
        metrics: {
          ...userStream.metrics,

          // Calculated behavioral indicators
          derived: {
            avgKeystrokesPerMinute: calculateKeystrokeRate(),
            codeSuccessRate:
              userStream.metrics.totalCodeAttempts > 0
                ? userStream.metrics.totalSuccessfulExecutions /
                  userStream.metrics.totalCodeAttempts
                : 0,
            avgErrorRecoveryTime:
              userStream.metrics.errorRecoveryTimes.length > 0
                ? userStream.metrics.errorRecoveryTimes.reduce(
                    (a, b) => a + b,
                    0
                  ) / userStream.metrics.errorRecoveryTimes.length
                : 0,
            helpSeekingFrequency:
              userStream.metrics.helpSeekingIntervals.length > 0
                ? userStream.metrics.helpSeekingIntervals.reduce(
                    (a, b) => a + b,
                    0
                  ) / userStream.metrics.helpSeekingIntervals.length
                : 0,
            learningProgressionRate: calculateProgressionRate(),
          },
        },
      },
    };
  }

  function exportAILog() {
    return {
      metadata: {
        type: "ai_system_log",
        sessionId: aiStream.sessionId,
        exportedAt: new Date().toISOString(),
        sessionDuration: Date.now() - sessionStartTime,
      },

      aiData: {
        interactions: aiStream.interactions,
        systemEvents: aiStream.systemEvents,
        assistantMetrics: aiStream.assistants,
        overallMetrics: {
          ...aiStream.overallMetrics,
          successRate: calculateAISuccessRate(),
        },

        // AI-specific analytics
        analysis: {
          mostUsedAssistant: getMostUsedAssistant(),
          avgInteractionLength: calculateAvgInteractionLength(),
          questionToStatementRatio: calculateQuestionRatio(),
          responseTimeDistribution: calculateResponseTimeDistribution(),
        },
      },
    };
  }

  function exportCombinedLog() {
    const userLog = exportUserLog();
    const aiLog = exportAILog();

    return {
      metadata: {
        type: "combined_session_log",
        sessionId: userStream.sessionId,
        exportedAt: new Date().toISOString(),
        version: "2.0",
      },
      userBehavior: userLog.behavioralData,
      aiSystem: aiLog.aiData,

      // Cross-stream analysis
      correlations: {
        helpSeekingEffectiveness: calculateHelpEffectiveness(),
        errorReductionTrends: calculateErrorTrends(),
        learningVelocity: calculateLearningVelocity(),
      },
    };
  }

  // ================================
  // UTILITY FUNCTIONS
  // ================================

  function calculateKeystrokeRate() {
    const sessionMinutes = (Date.now() - sessionStartTime) / 1000 / 60;
    return sessionMinutes > 0
      ? Math.round(userStream.metrics.totalKestrokes / sessionMinutes)
      : 0;
  }

  function calculateProgressionRate() {
    const completedTasks = userStream.metrics.taskProgressions.filter(
      (t) => t.action === "completed"
    ).length;
    const sessionHours = (Date.now() - sessionStartTime) / 1000 / 60 / 60;
    return sessionHours > 0 ? completedTasks / sessionHours : 0;
  }

  function calculateAISuccessRate() {
    const totalInteractions = aiStream.interactions.length;
    const errors = aiStream.interactions.filter(
      (i) => i.performance.error
    ).length;
    return totalInteractions > 0
      ? (totalInteractions - errors) / totalInteractions
      : 0;
  }

  function getMostUsedAssistant() {
    const assistantEntries = Object.entries(aiStream.assistants);
    if (assistantEntries.length === 0) {
      return "none";
    }

    return assistantEntries.reduce(
      (a, b) => {
        const aInteractions = a[1].interactions || 0;
        const bInteractions = b[1].interactions || 0;
        return aInteractions > bInteractions ? a : b;
      },
      ["none", { interactions: 0 }]
    )[0];
  }

  function calculateAvgInteractionLength() {
    const totalChars = aiStream.interactions.reduce(
      (sum, i) => sum + i.userInput.length,
      0
    );
    return aiStream.interactions.length > 0
      ? Math.round(totalChars / aiStream.interactions.length)
      : 0;
  }

  function calculateQuestionRatio() {
    const totalQuestions = aiStream.interactions.reduce(
      (sum, i) => sum + i.assistantResponse.questionCount,
      0
    );
    const totalInteractions = aiStream.interactions.length;
    return totalInteractions > 0 ? totalQuestions / totalInteractions : 0;
  }

  function calculateResponseTimeDistribution() {
    const times = aiStream.interactions.map((i) => i.performance.responseTime);
    times.sort((a, b) => a - b);

    return {
      min: times[0] || 0,
      max: times[times.length - 1] || 0,
      median: times.length > 0 ? times[Math.floor(times.length / 2)] : 0,
      p95: times.length > 0 ? times[Math.floor(times.length * 0.95)] : 0,
    };
  }

  function calculateHelpEffectiveness() {
    // Correlate help requests with subsequent code success
    const effectiveness = [];

    aiStream.interactions.forEach((interaction, index) => {
      // Look for code execution events in user stream after this interaction
      const nextUserEvents = userStream.events
        .filter(
          (e) =>
            new Date(e.timestamp) > new Date(interaction.timestamp) &&
            e.type === "code_execution"
        )
        .slice(0, 3); // Look at next 3 code attempts

      if (nextUserEvents.length > 0) {
        const successRate =
          nextUserEvents.filter((e) => e.data.success).length /
          nextUserEvents.length;
        effectiveness.push(successRate);
      }
    });

    return effectiveness.length > 0
      ? effectiveness.reduce((a, b) => a + b, 0) / effectiveness.length
      : 0;
  }

  function calculateErrorTrends() {
    // Analyze error reduction over time
    const errors = userStream.events.filter(
      (e) => e.type === "code_execution" && !e.data.success
    );

    if (errors.length < 4) return "insufficient_data";

    const firstHalf = errors.slice(0, Math.floor(errors.length / 2)).length;
    const secondHalf = errors.slice(Math.floor(errors.length / 2)).length;

    if (secondHalf < firstHalf * 0.7) return "improving";
    if (secondHalf > firstHalf * 1.3) return "struggling";
    return "stable";
  }

  function calculateLearningVelocity() {
    // Rate of improvement over time
    const successEvents = userStream.events.filter(
      (e) => e.type === "code_execution" && e.data.success
    );

    if (successEvents.length < 2) return 0;

    const timeSpan =
      new Date(successEvents[successEvents.length - 1].timestamp) -
      new Date(successEvents[0].timestamp);
    const timeSpanHours = timeSpan / 1000 / 60 / 60;

    return timeSpanHours > 0 ? successEvents.length / timeSpanHours : 0;
  }

  function categorizeError(error) {
    const errorMessage = error.toString().toLowerCase();

    if (errorMessage.includes("syntax")) return "syntax";
    if (errorMessage.includes("name") && errorMessage.includes("not defined"))
      return "undefined_variable";
    if (errorMessage.includes("type")) return "type_error";
    if (errorMessage.includes("index")) return "index_error";
    if (errorMessage.includes("indentation")) return "indentation";

    return "other";
  }

  function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize with experiment data
  function setExperimentContext(participantId, condition) {
    userStream.participantId = participantId;
    userStream.condition = condition;
  }

  return {
    // User stream functions
    logUserKeystroke,
    logUserCodeAttempt,
    logUserHelpRequest,
    logUserTaskProgression,

    // AI stream functions
    logAIInteraction,
    logAISystemEvent,

    // Export functions
    exportUserLog,
    exportAILog,
    exportCombinedLog,

    // Setup functions
    setExperimentContext,

    // Debug access
    getUserMetrics: () => ({ ...userStream.metrics }),
    getAIMetrics: () => ({ ...aiStream.overallMetrics }),
  };
}
