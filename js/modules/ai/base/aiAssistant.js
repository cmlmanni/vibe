/* filepath: /js/modules/ai/base/AIAssistant.js */
import { ConversationManager } from './conversationManager.js';
import { ChatRenderer } from '../ui/chatRenderer.js';
import { getAIResponse } from '../utils/apiClient.js';

export class AIAssistant {
  constructor(systemPrompt, eventLogger, domElements) {
    this.isGenerating = false;
    this.systemPrompt = systemPrompt;
    this.eventLogger = eventLogger;
    this.domElements = domElements;
    
    // Initialize conversation manager
    this.conversationManager = new ConversationManager(systemPrompt, eventLogger);
    
    // Initialize chat renderer
    this.chatRenderer = new ChatRenderer(domElements, this);
  }

  // Add message to conversation history
  addToHistory(role, content) {
    return this.conversationManager.addToHistory(role, content);
  }

  // Get conversation history for API call
  getConversationForAPI() {
    return this.conversationManager.getConversationForAPI();
  }

  // Clear conversation history
  clearHistory() {
    this.conversationManager.clearHistory();
    this.chatRenderer.clearChat();
  }

  // Create chat messages
  createChatMessage(content, sender, codeBlock = null) {
    return this.chatRenderer.createChatMessage(content, sender, codeBlock);
  }

  // Main AI interaction method
  async fetchFromAI(userPrompt, includeCodeContext = true) {
    try {
      this.isGenerating = true;
      this.createChatMessage("Thinking...", "system");

      // Prepare contextual prompt
      let contextualPrompt = userPrompt;
      if (includeCodeContext && window.editor) {
        const currentCode = window.editor.getValue();
        if (currentCode.trim() !== "import turtle\n\n# Your code here") {
          contextualPrompt = `Current code in editor:\n\`\`\`python\n${currentCode}\n\`\`\`\n\nUser question: ${userPrompt}`;
        }
      }

      this.addToHistory("user", contextualPrompt);

      console.log("Sending conversation history to AI:", {
        historyLength: this.conversationManager.getHistoryLength(),
        systemPrompt: this.systemPrompt?.substring(0, 50) + "...",
        userPrompt: userPrompt.substring(0, 100) + "...",
      });

      // Call Azure OpenAI with conversation history
      const response = await getAIResponse(
        this.getConversationForAPI(),
        this.systemPrompt
      );

      // Remove thinking message
      this.chatRenderer.removeLastMessage();
      this.isGenerating = false;

      if (!response || typeof response !== "string") {
        console.error("Invalid response from AI:", response);
        return {
          type: "text",
          content: "Sorry, I received an invalid response. Please try again.",
        };
      }

      // Add AI response to history
      this.addToHistory("assistant", response);

      // Parse response for code blocks
      return this.parseResponse(response);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      this.chatRenderer.removeLastMessage();
      this.isGenerating = false;
      
      return {
        type: "text",
        content: `Error: ${error.message || "Failed to get AI response"}`,
      };
    }
  }

  // Parse AI response for code blocks
  parseResponse(response) {
    const codeMatch = response.match(/```(?:python)?\s*([\s\S]+?)\s*```/);

    if (codeMatch) {
      const codeContent = codeMatch[1].trim();
      let textContent = response
        .replace(/```(?:python)?\s*[\s\S]+?\s*```/, "")
        .trim();

      if (!textContent) {
        textContent = "Here's a code suggestion:";
      }

      return {
        type: "code",
        content: textContent,
        code: codeContent,
      };
    }

    return { type: "text", content: response };
  }

  // Abstract method for subclasses
  async getSuggestion(userPrompt) {
    throw new Error("getSuggestion method must be implemented by subclasses");
  }
}