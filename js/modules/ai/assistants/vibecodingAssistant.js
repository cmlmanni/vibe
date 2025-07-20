/* filepath: /js/modules/ai/assistants/vibecodingAssistant.js */
import { AIAssistant } from "../base/aiAssistant.js";

export class VibecodingAssistant extends AIAssistant {
  constructor(eventLogger, domElements) {
    const systemPrompt = `You are a friendly Python programming assistant specializing in turtle graphics. You maintain context from our previous conversation to provide better help.

Key capabilities:
- Remember what we've discussed before
- Provide Python turtle graphics solutions
- Have casual conversations
- Build upon previous suggestions and code
- Reference earlier parts of our conversation when relevant

Be helpful, friendly, and contextually aware of our ongoing conversation.`;

    super(systemPrompt, eventLogger, domElements);
  }

  async getSuggestion(userPrompt) {
    console.log("🚀 VibecodingAssistant processing:", userPrompt);
    if (this.isGenerating) return;

    this.eventLogger.logEvent("ai_prompt", {
      prompt: userPrompt,
      mode: "vibecoding",
      historyLength: this.conversationManager.getHistoryLength(),
    });

    const response = await this.fetchFromAI(userPrompt);

    this.eventLogger.logEvent("ai_response", {
      response,
      historyLength: this.conversationManager.getHistoryLength(),
    });

    if (response.type === "code") {
      this.createChatMessage(response.content, "ai", response.code);
    } else if (response.type === "text") {
      this.createChatMessage(response.content, "ai");
    }
  }
}
