/* filepath: /js/modules/ai/utils/apiClient.js */
export async function getAIResponse(
  conversationHistory,
  systemPrompt = null,
  maxTokens = 800,
  temperature = 0.7
) {
  try {
    // Get backend URL from experiment config instead of hardcoded function
    const backendUrl = window.experimentConfig?.backendUrl;

    if (!backendUrl) {
      throw new Error(
        "Backend URL not available. Experiment config not initialized?"
      );
    }

    const apiEndpoint = `${backendUrl}/api/openai`;
    console.log("Using API endpoint:", apiEndpoint);

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

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      console.error("Backend error response:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(
        `Backend error: ${response.status} - ${
          errorData.error || response.statusText
        }`
      );
    }

    const data = await response.json();
    console.log(
      "Backend response received, content length:",
      data.content?.length || 0
    );

    return data.content;
  } catch (error) {
    console.error("Error calling Azure OpenAI:", error);
    throw error;
  }
}
