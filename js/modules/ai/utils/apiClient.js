/* filepath: /js/modules/ai/utils/apiClient.js */
export async function getAIResponse(conversationHistory, systemPrompt = null, maxTokens = 800, temperature = 0.7) {
  try {
    const backendUrl = getBackendURL();
    
    if (backendUrl === "GITHUB_PAGES_CONFIG_MISSING") {
      throw new Error("Backend configuration missing for GitHub Pages");
    }

    console.log("Calling backend at:", backendUrl);
    console.log("Conversation history length:", Array.isArray(conversationHistory) ? conversationHistory.length : "Not an array");

    let requestBody;

    if (Array.isArray(conversationHistory)) {
      requestBody = {
        conversationHistory: conversationHistory,
        systemPrompt: systemPrompt,
        maxTokens: maxTokens,
        temperature: temperature,
      };
    } else {
      requestBody = {
        userPrompt: conversationHistory,
        systemPrompt: systemPrompt,
        maxTokens: maxTokens,
        temperature: temperature,
      };
    }

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(`Backend error: ${response.status} - ${errorData.error || "Unknown error"}`);
    }

    const data = await response.json();
    console.log("Backend response received, content length:", data.content?.length || 0);

    return data.content;
  } catch (error) {
    console.error("Error calling Azure OpenAI:", error);
    throw error;
  }
}

function getBackendURL() {
  // Implementation depends on your current setup
  return "/api/openai";
}