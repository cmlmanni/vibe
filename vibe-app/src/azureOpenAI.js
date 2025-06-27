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
    // Get backend URL dynamically each time to ensure config is available
    const backendURL = getBackendURL();
    
    // Check if backend URL is properly configured
    if (!backendURL || backendURL === "GITHUB_PAGES_CONFIG_MISSING") {
      throw new Error(
        "Backend URL not configured. Please check your deployment configuration."
      );
    }

    console.log("Calling Azure OpenAI with:", {
      promptPreview:
        prompt.substring(0, 50) + (prompt.length > 50 ? "..." : ""),
      systemPromptPreview:
        systemPrompt.substring(0, 50) + (systemPrompt.length > 50 ? "..." : ""),
      backendURL: backendURL,
    });

    // Enhanced prompt for better code formatting
    const enhancedPrompt =
      prompt +
      "\n\nPlease make sure any code is properly formatted between ```python and ``` markers.";

    // Show a detailed log of what we're sending
    console.log(`POST ${backendURL}`);

    const response = await fetch(backendURL, {
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
