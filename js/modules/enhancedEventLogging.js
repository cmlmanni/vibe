/* Enhanced Event Logging System - Optimized for Research Analysis */
import { initializeEmpiricalLearningMetrics } from "./empiricalLearningMetrics.js";

export function initializeEnhancedEventLogging() {
  const sessions = [];
  const currentSession = {
    sessionId: generateSessionId(),
    startTime: new Date().toISOString(),
    tasks: [],
    interactions: [],
    codeExecutions: [],
    learningEvents: [],
    currentTask: null,
    currentStep: null,
  };

  // Initialize empirical learning metrics tracker
  const learningMetrics = initializeEmpiricalLearningMetrics();

  // Core logging functions
  function logEvent(eventType, data = {}) {
    const timestamp = new Date().toISOString();

    // Route to appropriate specialized logger
    switch (eventType) {
      case "task_started":
      case "task_completed":
        logTaskEvent(eventType, data, timestamp);
        break;
      case "ai_interaction":
        logInteraction(data, timestamp);
        break;
      case "code_execution_started":
      case "code_execution_success":
      case "code_execution_error":
        logCodeExecution(eventType, data, timestamp);
        break;
      case "concept_breakthrough":
      case "help_seeking":
      case "error_pattern":
        logLearningEvent(eventType, data, timestamp);
        break;
      default:
        // Log as generic event (for system events)
        console.log(`Event: ${eventType}`, { timestamp, ...data });
    }
  }

  function logTaskEvent(eventType, data, timestamp) {
    if (eventType === "task_started") {
      currentSession.currentTask = {
        taskId: data.taskIndex,
        taskType: data.taskType,
        startTime: timestamp,
        steps: [],
        codeExecutions: [],
        interactions: [],
        learningOutcomes: {
          conceptsGrasped: [],
          skillsAcquired: [],
          breakthroughMoments: [],
        },
      };

      // Track empirical learning metrics
      learningMetrics.trackTaskStart(data.taskIndex);
    } else if (eventType === "task_completed") {
      if (currentSession.currentTask) {
        currentSession.currentTask.completionTime = timestamp;
        currentSession.currentTask.duration =
          new Date(timestamp) - new Date(currentSession.currentTask.startTime);
        currentSession.tasks.push(currentSession.currentTask);

        // Track empirical learning metrics
        learningMetrics.trackTaskEnd(currentSession.currentTask.taskId);

        currentSession.currentTask = null;
      }
    }
  }

  function logInteraction(data, timestamp) {
    const interaction = {
      id: `int_${currentSession.interactions.length + 1}`,
      timestamp,
      assistantId: data.assistantId,
      assistantType: data.assistantType,
      userInput: data.userInput,
      assistantResponse: data.assistantResponse,
      responseTime: data.responseTime,
      context: {
        taskId: currentSession.currentTask?.taskId || null,
        stepId: currentSession.currentStep?.stepId || null,
        codeContext: data.codeContext || null,
        historyLength: data.historyLength || 0,
      },
      analysis: {
        responseType: data.responseType || "text",
        questionTypes: data.questionTypes || [],
        hasCodeBlock: data.hasCodeBlock || false,
        pedagogicalStrategy: data.pedagogicalStrategy || "unknown",
        concepts: data.concepts || [],
      },
    };

    currentSession.interactions.push(interaction);

    // Track empirical learning metrics
    learningMetrics.trackAIInteraction(
      data.userInput,
      data.assistantResponse,
      data.responseTime
    );

    // Also add to current task if one is active
    if (currentSession.currentTask) {
      currentSession.currentTask.interactions.push(interaction.id);
    }
  }

  function logCodeExecution(eventType, data, timestamp) {
    if (eventType === "code_execution_started") {
      currentSession.pendingExecution = {
        timestamp,
        code: data.code,
        startTime: timestamp,
      };
    } else {
      const success = eventType === "code_execution_success";
      const execution = {
        id: `exec_${currentSession.codeExecutions.length + 1}`,
        timestamp,
        code: data.code,
        success: success,
        error: data.error || null,
        executionTime: currentSession.pendingExecution
          ? new Date(timestamp) -
            new Date(currentSession.pendingExecution.startTime)
          : 0,
        codeAnalysis: analyzeCode(data.code),
      };

      currentSession.codeExecutions.push(execution);

      // Track empirical learning metrics
      learningMetrics.trackCodeExecution(data.code, success, data.error);

      // Add to current task
      if (currentSession.currentTask) {
        currentSession.currentTask.codeExecutions.push(execution.id);
      }

      currentSession.pendingExecution = null;
    }
  }

  function logLearningEvent(eventType, data, timestamp) {
    const learningEvent = {
      id: `learn_${currentSession.learningEvents.length + 1}`,
      timestamp,
      eventType,
      data: {
        ...data,
        taskId: currentSession.currentTask?.taskId || null,
        context: data.context || null,
      },
    };

    currentSession.learningEvents.push(learningEvent);

    // Update current task learning outcomes
    if (currentSession.currentTask) {
      switch (eventType) {
        case "concept_breakthrough":
          currentSession.currentTask.learningOutcomes.conceptsGrasped.push(
            data.concept
          );
          currentSession.currentTask.learningOutcomes.breakthroughMoments.push(
            learningEvent.id
          );
          break;
        case "skill_acquisition":
          currentSession.currentTask.learningOutcomes.skillsAcquired.push(
            data.skill
          );
          break;
      }
    }
  }

  function analyzeCode(code) {
    // Simple code analysis
    const lines = code.split("\n").filter((line) => line.trim().length > 0);
    const concepts = [];

    // Detect concepts
    if (code.includes("for ") || code.includes("while "))
      concepts.push("loops");
    if (code.includes("if ") || code.includes("elif "))
      concepts.push("conditionals");
    if (code.includes("def ")) concepts.push("functions");
    if (
      code.includes("turtle") ||
      code.includes(".forward") ||
      code.includes(".right")
    )
      concepts.push("turtle_graphics");

    return {
      linesOfCode: lines.length,
      complexity: calculateComplexity(code),
      concepts,
      syntaxErrors: 0, // Would need actual syntax checking
      patterns: detectPatterns(code),
    };
  }

  function calculateComplexity(code) {
    // Simple complexity score based on control structures
    let complexity = 1;
    complexity += (code.match(/if |elif |while |for /g) || []).length;
    complexity += (code.match(/def /g) || []).length;
    return complexity;
  }

  function detectPatterns(code) {
    const patterns = [];
    if (code.match(/(.+)\n\1/)) patterns.push("repetition");
    if (code.includes("for") && code.includes("range"))
      patterns.push("counted_loop");
    return patterns;
  }

  function generateOptimizedLog() {
    // Collect assistant analytics
    let assistantAnalytics = null;
    try {
      if (
        window.ai &&
        typeof window.ai.getAllAssistantAnalytics === "function"
      ) {
        assistantAnalytics = window.ai.getAllAssistantAnalytics();
      }
    } catch (e) {
      console.warn("Failed to collect assistant analytics:", e);
    }

    // Build optimized log structure
    const optimizedLog = {
      metadata: {
        exportedAt: new Date().toISOString(),
        sessionId: currentSession.sessionId,
        version: "1.1",
        source: "vibe-experiment-enhanced",
      },

      session: {
        startTime: currentSession.startTime,
        endTime: new Date().toISOString(),
        duration: new Date() - new Date(currentSession.startTime),
        tasksCompleted: currentSession.tasks.length,
        totalInteractions: currentSession.interactions.length,
        totalCodeExecutions: currentSession.codeExecutions.length,
      },

      tasks: currentSession.tasks.map((task) => ({
        ...task,
        // Reference interactions and executions by ID only
        interactions: task.interactions,
        codeExecutions: task.codeExecutions,
      })),

      interactions: currentSession.interactions,

      codeExecutions: currentSession.codeExecutions,

      learningEvents: currentSession.learningEvents,

      assistantAnalytics: assistantAnalytics
        ? {
            ...assistantAnalytics,
            enhancedMetrics: generateEnhancedAssistantMetrics(),
          }
        : null,

      empiricalLearningData: learningMetrics.exportEmpiricalMetrics(),

      learningAnalytics: generateLearningAnalytics(),
    };

    return optimizedLog;
  }

  function generateEnhancedAssistantMetrics() {
    const metrics = {};

    // Analyze interactions by assistant
    currentSession.interactions.forEach((interaction) => {
      if (!metrics[interaction.assistantId]) {
        metrics[interaction.assistantId] = {
          interactionCount: 0,
          responseTypes: {},
          pedagogicalStrategies: {},
          concepts: {},
          avgResponseTime: 0,
          totalResponseTime: 0,
        };
      }

      const assistant = metrics[interaction.assistantId];
      assistant.interactionCount++;
      assistant.totalResponseTime += interaction.responseTime;

      // Count response types
      assistant.responseTypes[interaction.analysis.responseType] =
        (assistant.responseTypes[interaction.analysis.responseType] || 0) + 1;

      // Count strategies
      assistant.pedagogicalStrategies[
        interaction.analysis.pedagogicalStrategy
      ] =
        (assistant.pedagogicalStrategies[
          interaction.analysis.pedagogicalStrategy
        ] || 0) + 1;

      // Count concepts
      interaction.analysis.concepts.forEach((concept) => {
        assistant.concepts[concept] = (assistant.concepts[concept] || 0) + 1;
      });
    });

    // Calculate averages
    Object.values(metrics).forEach((assistant) => {
      assistant.avgResponseTime =
        assistant.interactionCount > 0
          ? assistant.totalResponseTime / assistant.interactionCount
          : 0;
    });

    return metrics;
  }

  function generateLearningAnalytics() {
    return {
      overallProgress: {
        tasksCompleted: currentSession.tasks.length,
        conceptsMastered: [
          ...new Set(
            currentSession.tasks.flatMap(
              (t) => t.learningOutcomes.conceptsGrasped
            )
          ),
        ],
        skillsAcquired: [
          ...new Set(
            currentSession.tasks.flatMap(
              (t) => t.learningOutcomes.skillsAcquired
            )
          ),
        ],
        totalCodeExecutions: currentSession.codeExecutions.length,
        successfulExecutions: currentSession.codeExecutions.filter(
          (e) => e.success
        ).length,
      },

      codeAnalytics: {
        totalLinesWritten: currentSession.codeExecutions.reduce(
          (sum, e) => sum + (e.codeAnalysis?.linesOfCode || 0),
          0
        ),
        conceptsUsed: [
          ...new Set(
            currentSession.codeExecutions.flatMap(
              (e) => e.codeAnalysis?.concepts || []
            )
          ),
        ],
        patternsDetected: [
          ...new Set(
            currentSession.codeExecutions.flatMap(
              (e) => e.codeAnalysis?.patterns || []
            )
          ),
        ],
      },

      helpSeekingPatterns: {
        totalHelpRequests: currentSession.interactions.length,
        helpRequestsPerTask:
          currentSession.tasks.length > 0
            ? currentSession.interactions.length / currentSession.tasks.length
            : 0,
        mostActiveAssistant: getMostActiveAssistant(),
      },

      learningEvents: {
        breakthroughs: currentSession.learningEvents.filter(
          (e) => e.eventType === "concept_breakthrough"
        ).length,
        helpSeeking: currentSession.learningEvents.filter(
          (e) => e.eventType === "help_seeking"
        ).length,
        errorPatterns: currentSession.learningEvents.filter(
          (e) => e.eventType === "error_pattern"
        ).length,
      },
    };
  }

  function getMostActiveAssistant() {
    const counts = {};
    currentSession.interactions.forEach((interaction) => {
      counts[interaction.assistantId] =
        (counts[interaction.assistantId] || 0) + 1;
    });

    return Object.entries(counts).reduce(
      (a, b) => (counts[a[0]] > counts[b[0]] ? a : b),
      ["none", 0]
    )[0];
  }

  function saveOptimizedLogToFile() {
    const logData = generateOptimizedLog();
    const jsonString = JSON.stringify(logData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vibe-enhanced-log-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("Enhanced event log saved:", {
      sessionId: currentSession.sessionId,
      tasksCompleted: currentSession.tasks.length,
      interactions: currentSession.interactions.length,
      codeExecutions: currentSession.codeExecutions.length,
      learningEvents: currentSession.learningEvents.length,
    });
  }

  function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize session
  console.log("Enhanced event logging initialized:", currentSession.sessionId);

  return {
    logEvent,
    saveOptimizedLogToFile,
    getCurrentSession: () => ({ ...currentSession }),
    generateOptimizedLog,
  };
}
