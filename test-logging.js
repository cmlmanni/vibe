/* Test script to verify the new comprehensive logging system */

// Run this script in the browser console after the application loads
function testAssistantLogging() {
  console.log("🧪 Testing comprehensive assistant logging system...");

  // Check if AI system is available
  if (!window.ai || !window.ai.getAllAssistantAnalytics) {
    console.error("❌ AI system not available or missing analytics method");
    return;
  }

  // Test getting analytics
  try {
    const analytics = window.ai.getAllAssistantAnalytics();
    console.log("✅ Successfully collected assistant analytics:", analytics);

    // Check if each assistant has the expected structure
    Object.keys(analytics.assistants).forEach((assistantKey) => {
      const assistant = analytics.assistants[assistantKey];
      console.log(`📊 ${assistantKey} analytics:`, {
        hasInteractionLog: !!assistant.interactionLog,
        interactionCount: assistant.interactions?.length || 0,
        performanceMetrics: assistant.performanceMetrics || "missing",
        summary: assistant.summary || "missing",
      });
    });

    return analytics;
  } catch (error) {
    console.error("❌ Error collecting analytics:", error);
  }
}

// Test the AI interaction logging
async function testAIInteraction() {
  console.log("🧪 Testing AI interaction logging...");

  if (!window.ai || !window.ai.vibecodingAI) {
    console.error("❌ VibeCoding AI not available");
    return;
  }

  try {
    // Simulate a user interaction
    console.log("📤 Sending test prompt to VibeCoding AI...");
    await window.ai.vibecodingAI.getSuggestion(
      "Help me draw a simple square with turtle"
    );

    // Check the analytics after interaction
    setTimeout(() => {
      const analytics = window.ai.vibecodingAI.getAssistantAnalytics();
      console.log("✅ VibeCoding AI analytics after interaction:", analytics);

      // Test event logger download
      console.log("💾 Testing event log download with analytics...");
      if (window.eventLogger) {
        window.eventLogger.saveLogToFile();
        console.log("✅ Event log saved with assistant analytics");
      }
    }, 2000);
  } catch (error) {
    console.error("❌ Error during AI interaction test:", error);
  }
}

// Export test functions to global scope
window.testAssistantLogging = testAssistantLogging;
window.testAIInteraction = testAIInteraction;

console.log("🧪 Logging test functions ready! Run:");
console.log("- testAssistantLogging() to check analytics collection");
console.log("- testAIInteraction() to test interaction logging");
