/* Empirical Learning Metrics - Observable Behavioral Data Only */

export function initializeEmpiricalLearningMetrics() {
  const metrics = {
    // Time-based empirical metrics
    taskProgression: {
      timeToFirstCodeAttempt: null,
      timeToFirstSuccessfulExecution: null,
      timeBetweenAttempts: [],
      totalTaskTime: null,
      pauseDurations: [], // periods of inactivity > 30 seconds
    },

    // Code behavior metrics (purely observable)
    codingBehavior: {
      totalCharactersTyped: 0,
      totalLinesWritten: 0,
      backspaceCount: 0, // indicates corrections/uncertainty
      copyPasteEvents: 0,
      codeExecutionAttempts: 0,
      successfulExecutions: 0,
      syntaxErrorCount: 0,
      consecutiveFailures: 0,
      maxConsecutiveFailures: 0,
    },

    // Help-seeking patterns (observable actions)
    helpSeekingBehavior: {
      totalAIInteractions: 0,
      wordsPerPrompt: [],
      promptLengthTrend: [], // getting longer/shorter over time
      timeToFirstHelpRequest: null,
      helpRequestFrequency: [], // time between requests
      assistantSwitchingCount: 0,
    },

    // Error recovery patterns (measurable)
    errorRecovery: {
      errorToSuccessTime: [], // time from error to working code
      repeatedSameErrors: 0, // exact same error multiple times
      errorTypes: [], // categorized by type (syntax, runtime, logical)
      selfCorrectionRate: 0, // fixes without asking for help
      helpSeekingAfterError: 0, // asks for help after error
    },

    // Interaction patterns (observable)
    interactionPatterns: {
      averageTypingSpeed: 0, // characters per minute when actively typing
      activeCodingTime: 0, // time spent actually typing code
      readingTime: 0, // time spent not typing (presumably reading/thinking)
      executionToNextActionTime: [], // delay after running code
      responseToFeedbackTime: [], // how quickly they act on assistant feedback
    },
  };

  let currentSession = {
    startTime: null,
    lastActivityTime: null,
    currentTaskStartTime: null,
    isActivelyTyping: false,
    typingStartTime: null,
    lastKeystroke: null,
    pendingExecution: null,
  };

  // Real-time tracking functions
  function trackKeystroke(keyEvent) {
    const now = Date.now();

    if (!currentSession.startTime) {
      currentSession.startTime = now;
    }

    // Track typing activity
    if (!currentSession.isActivelyTyping) {
      currentSession.isActivelyTyping = true;
      currentSession.typingStartTime = now;
    }

    currentSession.lastActivityTime = now;
    currentSession.lastKeystroke = now;

    // Count specific behaviors
    if (keyEvent.key === "Backspace") {
      metrics.codingBehavior.backspaceCount++;
    } else if (keyEvent.key.length === 1) {
      // actual character
      metrics.codingBehavior.totalCharactersTyped++;
    }

    // Track typing speed
    updateTypingSpeed();
  }

  function trackCodeExecution(code, success, error = null) {
    const now = Date.now();

    metrics.codingBehavior.codeExecutionAttempts++;

    if (success) {
      metrics.codingBehavior.successfulExecutions++;

      // Track time to first success
      if (
        !metrics.taskProgression.timeToFirstSuccessfulExecution &&
        currentSession.currentTaskStartTime
      ) {
        metrics.taskProgression.timeToFirstSuccessfulExecution =
          now - currentSession.currentTaskStartTime;
      }

      // Reset consecutive failures
      metrics.codingBehavior.consecutiveFailures = 0;
    } else {
      // Track error patterns
      metrics.codingBehavior.consecutiveFailures++;
      metrics.codingBehavior.maxConsecutiveFailures = Math.max(
        metrics.codingBehavior.maxConsecutiveFailures,
        metrics.codingBehavior.consecutiveFailures
      );

      if (error) {
        categorizeError(error);
      }
    }

    // Track execution timing
    if (currentSession.lastKeystroke) {
      const executionDelay = now - currentSession.lastKeystroke;
      metrics.interactionPatterns.executionToNextActionTime.push(
        executionDelay
      );
    }

    currentSession.pendingExecution = { time: now, success };
  }

  function trackAIInteraction(prompt, response, responseTime) {
    const now = Date.now();

    metrics.helpSeekingBehavior.totalAIInteractions++;

    // Track prompt characteristics
    const wordCount = prompt.trim().split(/\s+/).length;
    metrics.helpSeekingBehavior.wordsPerPrompt.push(wordCount);
    metrics.helpSeekingBehavior.promptLengthTrend.push({
      timestamp: now,
      wordCount: wordCount,
    });

    // Track time to first help request
    if (
      !metrics.helpSeekingBehavior.timeToFirstHelpRequest &&
      currentSession.currentTaskStartTime
    ) {
      metrics.helpSeekingBehavior.timeToFirstHelpRequest =
        now - currentSession.currentTaskStartTime;
    }

    // Track help frequency
    const lastInteraction =
      metrics.helpSeekingBehavior.helpRequestFrequency.slice(-1)[0];
    if (lastInteraction) {
      metrics.helpSeekingBehavior.helpRequestFrequency.push(
        now - lastInteraction
      );
    } else {
      metrics.helpSeekingBehavior.helpRequestFrequency.push(0);
    }

    // Track response to feedback timing
    if (response && currentSession.lastActivityTime) {
      setTimeout(() => {
        // Measure how quickly they act after getting response
        const nextActionTime = currentSession.lastKeystroke;
        if (nextActionTime && nextActionTime > now) {
          metrics.interactionPatterns.responseToFeedbackTime.push(
            nextActionTime - now
          );
        }
      }, 30000); // Check within 30 seconds
    }
  }

  function trackTaskStart(taskId) {
    const now = Date.now();
    currentSession.currentTaskStartTime = now;

    // Track time to first code attempt
    setTimeout(() => {
      if (
        metrics.codingBehavior.totalCharactersTyped > 0 &&
        !metrics.taskProgression.timeToFirstCodeAttempt
      ) {
        metrics.taskProgression.timeToFirstCodeAttempt =
          currentSession.lastKeystroke - now;
      }
    }, 100);
  }

  function trackTaskEnd(taskId) {
    const now = Date.now();

    if (currentSession.currentTaskStartTime) {
      metrics.taskProgression.totalTaskTime =
        now - currentSession.currentTaskStartTime;
    }

    currentSession.currentTaskStartTime = null;
  }

  function updateTypingSpeed() {
    if (
      currentSession.typingStartTime &&
      metrics.codingBehavior.totalCharactersTyped > 0
    ) {
      const typingDuration =
        (Date.now() - currentSession.typingStartTime) / 1000 / 60; // minutes
      metrics.interactionPatterns.averageTypingSpeed =
        metrics.codingBehavior.totalCharactersTyped / typingDuration;
    }
  }

  function categorizeError(error) {
    // Empirical error categorization based on error message patterns
    const errorMessage = error.toString().toLowerCase();

    let errorType = "unknown";
    if (errorMessage.includes("syntax")) {
      errorType = "syntax";
      metrics.codingBehavior.syntaxErrorCount++;
    } else if (
      errorMessage.includes("name") &&
      errorMessage.includes("not defined")
    ) {
      errorType = "undefined_variable";
    } else if (
      errorMessage.includes("type") &&
      errorMessage.includes("error")
    ) {
      errorType = "type_error";
    } else if (
      errorMessage.includes("index") &&
      errorMessage.includes("out of range")
    ) {
      errorType = "index_error";
    }

    metrics.errorRecovery.errorTypes.push({
      timestamp: Date.now(),
      type: errorType,
      message: errorMessage,
    });

    // Check for repeated same errors
    const recentErrors = metrics.errorRecovery.errorTypes.slice(-3);
    if (
      recentErrors.length >= 2 &&
      recentErrors.every((e) => e.type === errorType)
    ) {
      metrics.errorRecovery.repeatedSameErrors++;
    }
  }

  function trackInactivityPeriods() {
    // Track periods of inactivity (learning indicator)
    setInterval(() => {
      const now = Date.now();
      if (
        currentSession.lastActivityTime &&
        now - currentSession.lastActivityTime > 30000
      ) {
        // 30 seconds of inactivity

        if (currentSession.isActivelyTyping) {
          // End of active typing session
          currentSession.isActivelyTyping = false;
          const typingDuration = now - currentSession.typingStartTime;
          metrics.interactionPatterns.activeCodingTime += typingDuration;
        }

        // Track pause duration
        const pauseStart = currentSession.lastActivityTime;
        const pauseDuration = now - pauseStart;

        if (pauseDuration > 30000) {
          // Only count pauses > 30 seconds
          metrics.taskProgression.pauseDurations.push({
            duration: pauseDuration,
            timestamp: pauseStart,
          });
        }
      }
    }, 5000); // Check every 5 seconds
  }

  function calculateDerivedMetrics() {
    // Calculate empirical learning indicators
    const derived = {
      // Efficiency metrics
      codeExecutionSuccessRate:
        metrics.codingBehavior.codeExecutionAttempts > 0
          ? metrics.codingBehavior.successfulExecutions /
            metrics.codingBehavior.codeExecutionAttempts
          : 0,

      // Error recovery metrics
      averageErrorRecoveryTime:
        metrics.errorRecovery.errorToSuccessTime.length > 0
          ? metrics.errorRecovery.errorToSuccessTime.reduce(
              (a, b) => a + b,
              0
            ) / metrics.errorRecovery.errorToSuccessTime.length
          : 0,

      // Help-seeking efficiency
      averagePromptLength:
        metrics.helpSeekingBehavior.wordsPerPrompt.length > 0
          ? metrics.helpSeekingBehavior.wordsPerPrompt.reduce(
              (a, b) => a + b,
              0
            ) / metrics.helpSeekingBehavior.wordsPerPrompt.length
          : 0,

      // Code quality indicators
      revisionRate:
        metrics.codingBehavior.totalCharactersTyped > 0
          ? metrics.codingBehavior.backspaceCount /
            metrics.codingBehavior.totalCharactersTyped
          : 0,

      // Learning progression indicators
      helpSeekingTrend: calculateHelpSeekingTrend(),
      errorReductionTrend: calculateErrorReductionTrend(),

      // Behavioral patterns
      thinkingToActionRatio:
        metrics.interactionPatterns.activeCodingTime > 0
          ? metrics.interactionPatterns.readingTime /
            metrics.interactionPatterns.activeCodingTime
          : 0,
    };

    return derived;
  }

  function calculateHelpSeekingTrend() {
    // Empirical analysis of help-seeking pattern over time
    const frequencies = metrics.helpSeekingBehavior.helpRequestFrequency;
    if (frequencies.length < 3) return "insufficient_data";

    const firstHalf = frequencies.slice(0, Math.floor(frequencies.length / 2));
    const secondHalf = frequencies.slice(Math.floor(frequencies.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg > firstAvg * 1.2) return "increasing_help_seeking";
    if (secondAvg < firstAvg * 0.8) return "decreasing_help_seeking";
    return "stable_help_seeking";
  }

  function calculateErrorReductionTrend() {
    // Empirical analysis of error patterns over time
    const errors = metrics.errorRecovery.errorTypes;
    if (errors.length < 4) return "insufficient_data";

    const timeWindow = 300000; // 5 minutes
    const now = Date.now();

    const recentErrors = errors.filter((e) => now - e.timestamp < timeWindow);
    const earlierErrors = errors.filter(
      (e) =>
        now - e.timestamp >= timeWindow && now - e.timestamp < timeWindow * 2
    );

    if (earlierErrors.length === 0) return "insufficient_data";

    const recentErrorRate = recentErrors.length;
    const earlierErrorRate = earlierErrors.length;

    if (recentErrorRate < earlierErrorRate * 0.7) return "improving";
    if (recentErrorRate > earlierErrorRate * 1.3) return "struggling";
    return "stable";
  }

  function exportEmpiricalMetrics() {
    const derived = calculateDerivedMetrics();

    return {
      timestamp: new Date().toISOString(),
      empiricalMetrics: {
        raw: metrics,
        derived: derived,
        dataQuality: {
          sessionDuration: currentSession.startTime
            ? Date.now() - currentSession.startTime
            : 0,
          dataPoints: {
            keystrokes: metrics.codingBehavior.totalCharactersTyped,
            executions: metrics.codingBehavior.codeExecutionAttempts,
            interactions: metrics.helpSeekingBehavior.totalAIInteractions,
            errors: metrics.errorRecovery.errorTypes.length,
          },
        },
      },
    };
  }

  // Initialize tracking
  trackInactivityPeriods();

  return {
    trackKeystroke,
    trackCodeExecution,
    trackAIInteraction,
    trackTaskStart,
    trackTaskEnd,
    exportEmpiricalMetrics,
    getCurrentMetrics: () => ({ ...metrics }),
    getDerivedMetrics: calculateDerivedMetrics,
  };
}
