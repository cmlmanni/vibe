/* filepath: /js/modules/ai/base/conversationManager.js */
export class ConversationManager {
  constructor(systemPrompt, eventLogger) {
    this.conversationHistory = [];
    this.maxHistoryLength = 20;
    this.eventLogger = eventLogger;
    
    if (systemPrompt) {
      this.addToHistory("system", systemPrompt);
    }
  }

  addToHistory(role, content) {
    this.conversationHistory.push({
      role: role,
      content: content,
      timestamp: new Date().toISOString(),
    });

    // Manage history length
    if (this.conversationHistory.length > this.maxHistoryLength) {
      const systemMessages = this.conversationHistory.filter(
        (msg) => msg.role === "system"
      );
      const otherMessages = this.conversationHistory.filter(
        (msg) => msg.role !== "system"
      );
      const recentMessages = otherMessages.slice(
        -this.maxHistoryLength + systemMessages.length
      );
      this.conversationHistory = [...systemMessages, ...recentMessages];
    }

    console.log(`Added to history: ${role} - ${content.substring(0, 50)}...`);
  }

  getConversationForAPI() {
    return this.conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  getHistoryLength() {
    return this.conversationHistory.length;
  }

  clearHistory() {
    const systemMessage = this.conversationHistory.find(
      (msg) => msg.role === "system"
    );
    this.conversationHistory = systemMessage ? [systemMessage] : [];
    console.log("Conversation history cleared");
    
    if (this.eventLogger) {
      this.eventLogger.logEvent("conversation_cleared", {
        timestamp: new Date().toISOString()
      });
    }
  }

  getHistory() {
    return this.conversationHistory;
  }
}