/* filepath: /js/modules/ai/assistants/reflectiveAssistant.js */
import { AIAssistant } from "../base/aiAssistant.js";

export class ReflectiveAssistant extends AIAssistant {
  constructor(eventLogger, domElements) {
    const systemPrompt = `You are a friendly Socratic tutor specializing in Python turtle graphics. You maintain conversation context to guide learning effectively.

Key capabilities:
- Remember our previous discussions and learning progress
- Guide through thoughtful questions rather than giving direct answers
- Reference what we've covered before
- Build upon previous learning moments
- Encourage discovery and understanding

You should NOT write code for users, but guide them to discover solutions themselves while maintaining awareness of our conversation history.`;

    super(systemPrompt, eventLogger, domElements);
  }

  async getSuggestion(userPrompt) {
    console.log("🤔 ReflectiveAssistant processing:", userPrompt);
    if (this.isGenerating) return;

    this.eventLogger.logEvent("ai_prompt", {
      prompt: userPrompt,
      mode: "reflective",
      historyLength: this.conversationManager.getHistoryLength(),
    });

    const response = await this.fetchFromAI(userPrompt);

    this.eventLogger.logEvent("ai_response", {
      response,
      historyLength: this.conversationManager.getHistoryLength(),
    });

    if (response.type === "text") {
      this.createChatMessage(response.content, "ai");
    } else if (response.type === "code") {
      this.createChatMessage(response.content, "ai", response.code);
    }
  }
}
