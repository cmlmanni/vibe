/**
 * Dynamic backend URL detection - called fresh each time to ensure config is available
 * @returns {string} The backend URL to use for API calls
 */
function getBackendURL() {
  // Check if we're on GitHub Pages
  const isGitHubPages = window.location.hostname.includes(".github.io");

  try {
    console.log("🔍 Environment detection:", {
      hostname: window.location.hostname,
      isGitHubPages: isGitHubPages,
      userAgent: navigator.userAgent.substring(0, 50),
      configAvailable: !!window.GITHUB_PAGES_CONFIG,
    });

    if (isGitHubPages) {
      console.log("🌐 GitHub Pages detected - checking configuration...");
      console.log("window.GITHUB_PAGES_CONFIG:", window.GITHUB_PAGES_CONFIG);

      if (
        window.GITHUB_PAGES_CONFIG &&
        window.GITHUB_PAGES_CONFIG.backendUrl &&
        window.GITHUB_PAGES_CONFIG.backendUrl.trim() !== ""
      ) {
        console.log(
          "✅ Using GitHub Pages backend configuration:",
          window.GITHUB_PAGES_CONFIG.backendUrl
        );
        return window.GITHUB_PAGES_CONFIG.backendUrl;
      } else {
        // Log detailed error for debugging
        console.error("❌ GitHub Pages config is missing or incomplete!");
        console.error("Available config:", window.GITHUB_PAGES_CONFIG);
        console.error(
          "Expected: window.GITHUB_PAGES_CONFIG.backendUrl with a non-empty value"
        );
        console.error(
          "Repository secret AZURE_BACKEND_URL may not be set or GitHub Actions deployment failed"
        );

        // For now, return a clear error URL that will fail fast
        return "GITHUB_PAGES_CONFIG_MISSING";
      }
    }
  } catch (error) {
    console.error("❌ Error in environment detection:", error);
    // Continue to fallback logic
  }

  // Check if we're in development mode (served from a different port than backend)
  const isDevelopment =
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1") &&
    (window.location.port === "8000" || window.location.port === "8080");

  // Check if we're on Azure (azurewebsites.net domain)
  const isAzure = window.location.hostname.includes(".azurewebsites.net");

  let url;
  if (isDevelopment) {
    url = "http://localhost:3000/api/openai";
  } else if (isAzure) {
    // On Azure, use relative URL since both frontend and backend are served from same domain
    url = "/api/openai";
  } else {
    // Default production setup
    url = "/api/openai";
  }

  console.log("Backend URL configuration:", {
    hostname: window.location.hostname,
    port: window.location.port,
    isDevelopment: isDevelopment,
    isAzure: isAzure,
    isGitHubPages: isGitHubPages,
    selectedURL: url,
  });

  return url;
}

/**
 * Sends a request to Azure OpenAI via Express backend
 * @param {Array} conversationHistory - Array of message objects representing the conversation history
 * @param {string} systemPrompt - System instructions
 * @returns {Promise<string>} AI response
 */
export async function getAIResponse(
  conversationHistory,
  systemPrompt = null,
  maxTokens = 800,
  temperature = 0.7
) {
  try {
    const backendUrl = getBackendURL();

    if (backendUrl === "GITHUB_PAGES_CONFIG_MISSING") {
      throw new Error("Backend configuration missing for GitHub Pages");
    }

    console.log("Calling backend at:", backendUrl);
    console.log(
      "Conversation history length:",
      Array.isArray(conversationHistory)
        ? conversationHistory.length
        : "Not an array"
    );

    let requestBody;

    // Handle both old format (string) and new format (array)
    if (Array.isArray(conversationHistory)) {
      // New format: conversation history
      requestBody = {
        conversationHistory: conversationHistory,
        systemPrompt: systemPrompt,
        maxTokens: maxTokens,
        temperature: temperature,
      };
    } else {
      // Old format: single user prompt (for backward compatibility)
      requestBody = {
        userPrompt: conversationHistory, // First parameter is userPrompt in old format
        systemPrompt: systemPrompt,
        maxTokens: maxTokens,
        temperature: temperature,
      };
    }

    console.log("Request body:", {
      ...requestBody,
      conversationHistory:
        requestBody.conversationHistory &&
        `[${requestBody.conversationHistory.length} messages]`,
      systemPrompt:
        requestBody.systemPrompt?.substring(0, 50) + "..." || undefined,
    });

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Unknown error",
      }));
      throw new Error(
        `Backend error: ${response.status} - ${
          errorData.error || "Unknown error"
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
