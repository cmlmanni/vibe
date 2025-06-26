// For production, replace with the actual backend URL

// For local testing with Express backend
const BACKEND_URL = "http://localhost:3000/api/openai";

/**
 * Sends a request to Azure OpenAI via Express backend
 * @param {string} prompt - User's prompt
 * @param {string} systemPrompt - System instructions
 * @param {number} maxTokens - Maximum tokens in response
 * @param {number} temperature - Creativity level (0-1)
 * @returns {Promise<string>} AI response
 */
export async function getAIResponse(
  prompt,
  systemPrompt = "",
  maxTokens = 512,
  temperature = 0.7
) {
  try {
    console.log("Calling Azure OpenAI with:", {
      promptPreview:
        prompt.substring(0, 50) + (prompt.length > 50 ? "..." : ""),
      systemPromptPreview:
        systemPrompt.substring(0, 50) + (systemPrompt.length > 50 ? "..." : ""),
    });

    // Enhanced prompt for better code formatting
    const enhancedPrompt =
      prompt +
      "\n\nPlease make sure any code is properly formatted between ```python and ``` markers.";

    // Show a detailed log of what we're sending
    console.log(`POST ${BACKEND_URL}`);

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userPrompt: enhancedPrompt,
        systemPrompt: systemPrompt,
        maxTokens: maxTokens,
        temperature: temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log("Received response:", {
      contentPreview: data.content.substring(0, 100) + "...",
      length: data.content.length,
    });

    return data.content;
  } catch (error) {
    console.error("Error calling Azure OpenAI:", error);
    return `Error: ${error.message}`;
  }
}
