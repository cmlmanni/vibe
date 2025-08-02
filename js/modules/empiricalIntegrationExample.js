/* Integration Example - How to Use Empirical Learning Metrics */

import { initializeEnhancedEventLogging } from "./enhancedEventLogging.js";
import { initializeEmpiricalEventTracking } from "./empiricalEventTracking.js";

// Initialize the enhanced logging system
const enhancedLogger = initializeEnhancedEventLogging();

// Get the empirical tracking system (this will be available from enhancedLogger)
const empiricalTracker = initializeEmpiricalEventTracking(
  enhancedLogger.learningMetrics // Access to learning metrics from enhanced logger
);

// Example integration points:

// 1. When CodeMirror is initialized
function setupCodeMirror(cmInstance) {
  // Existing CodeMirror setup...

  // Add empirical tracking
  empiricalTracker.attachToCodeMirror(cmInstance);

  console.log("📝 CodeMirror attached to empirical tracking");
}

// 2. When code is executed (modify existing code execution handler)
function handleCodeExecution(code) {
  // Existing execution logic...
  try {
    const result = executeCode(code);

    // Track successful execution
    empiricalTracker.trackCodeExecution(code, true, null);
    enhancedLogger.logEvent("code_execution_success", { code, result });

    return result;
  } catch (error) {
    // Track failed execution
    empiricalTracker.trackCodeExecution(code, false, error);
    enhancedLogger.logEvent("code_execution_error", {
      code,
      error: error.message,
    });

    throw error;
  }
}

// 3. When AI interaction occurs (modify existing AI handler)
function handleAIInteraction(prompt, assistantId) {
  const startTime = Date.now();

  // Existing AI interaction logic...
  return getAIResponse(prompt, assistantId).then((response) => {
    const responseTime = Date.now() - startTime;

    // Track the interaction
    empiricalTracker.trackAIInteraction(
      prompt,
      response,
      responseTime,
      assistantId
    );
    enhancedLogger.logEvent("ai_interaction", {
      assistantId,
      userInput: prompt,
      assistantResponse: response,
      responseTime,
    });

    return response;
  });
}

// 4. When tasks start/end (modify existing task handlers)
function handleTaskStart(taskIndex, taskType) {
  // Existing task start logic...

  empiricalTracker.trackTaskStart(taskIndex, taskType);
  enhancedLogger.logEvent("task_started", { taskIndex, taskType });
}

function handleTaskComplete(taskIndex, success) {
  // Existing task completion logic...

  empiricalTracker.trackTaskEnd(taskIndex, success);
  enhancedLogger.logEvent("task_completed", { taskIndex, success });
}

// 5. Export enhanced data (modify existing export function)
function exportEnhancedLogData() {
  const logData = enhancedLogger.generateOptimizedLog();

  // The log data now includes:
  // - logData.empiricalLearningData (all behavioral metrics)
  // - logData.tasks (task progression)
  // - logData.interactions (AI interactions)
  // - logData.codeExecutions (code attempts)
  // - logData.assistantAnalytics (assistant performance)

  console.log("📊 Enhanced log data exported:", {
    totalKeystrokes:
      logData.empiricalLearningData.empiricalMetrics.raw.codingBehavior
        .totalCharactersTyped,
    successRate:
      logData.empiricalLearningData.empiricalMetrics.derived
        .codeExecutionSuccessRate,
    helpSeekingTrend:
      logData.empiricalLearningData.empiricalMetrics.derived.helpSeekingTrend,
  });

  return logData;
}

// 6. Real-time monitoring dashboard (optional)
function createLearningDashboard() {
  setInterval(() => {
    const metrics = empiricalTracker.getDerivedMetrics();

    console.log("📈 Current Learning Metrics:", {
      successRate: `${(metrics.codeExecutionSuccessRate * 100).toFixed(1)}%`,
      avgResponseTime: `${metrics.averageErrorRecoveryTime}ms`,
      helpTrend: metrics.helpSeekingTrend,
      typingSpeed: `${metrics.averageTypingSpeed.toFixed(1)} chars/min`,
    });
  }, 30000); // Update every 30 seconds
}

export {
  enhancedLogger,
  empiricalTracker,
  setupCodeMirror,
  handleCodeExecution,
  handleAIInteraction,
  handleTaskStart,
  handleTaskComplete,
  exportEnhancedLogData,
  createLearningDashboard,
};
