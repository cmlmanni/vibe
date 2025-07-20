/* filepath: /js/modules/experimentConfig.js */
// Add GitHub Pages detection
function getBackendUrl() {
  // GitHub Pages detection
  if (window.location.hostname.includes("github.io")) {
    const backendUrl = window.BACKEND_URL;

    if (!backendUrl || backendUrl === "BACKEND_URL_PLACEHOLDER") {
      console.error("❌ Backend URL not configured for GitHub Pages");
      throw new Error(
        "Backend URL not configured for GitHub Pages. Check GitHub secrets."
      );
    }

    console.log("🌐 GitHub Pages - Using backend:", backendUrl);
    return backendUrl;
  }

  // Local development
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:3000";
  }

  // Azure App Service (same domain)
  if (window.location.hostname.includes("azurewebsites.net")) {
    return window.location.origin;
  }

  // Default fallback
  console.warn("⚠️ Unknown hostname, using relative paths");
  return "";
}

export function initializeExperimentConfig() {
  let backendUrl;

  try {
    backendUrl = getBackendUrl();
  } catch (error) {
    console.error("❌ Failed to get backend URL:", error);
    return null;
  }

  console.log(`🔧 Backend URL: ${backendUrl}`);
  console.log(
    `🌐 Environment: ${
      window.location.hostname.includes("github.io")
        ? "GitHub Pages"
        : "Local/Azure"
    }`
  );

  // Test backend connectivity with CORRECT endpoint
  fetch(`${backendUrl}/api/health`) // Fixed: added /api prefix
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("✅ Backend connectivity test:", data);
    })
    .catch((error) => {
      console.error("❌ Backend connectivity failed:", error);
      console.error(
        "💡 Check if Azure backend is running and CORS is configured"
      );
    });

  // Configuration for experimental conditions
  const EXPERIMENT_CONFIG = {
    // Counterbalancing: determines which assistant (A or B) maps to which AI type
    counterbalanceConditions: {
      // Condition 1: Start with Vibecoding first
      condition1: {
        defaultAssistant: "vibecoding", // This should match the option values
        aiTypes: ["vibecoding", "reflective"],
      },
      // Condition 2: Start with Reflective first
      condition2: {
        defaultAssistant: "reflective", // This should match the option values
        aiTypes: ["reflective", "vibecoding"],
      },
    },
  };

  // Get counterbalance condition from URL parameter or localStorage
  function getCounterbalanceCondition() {
    // Check URL parameter first (experimenter can set this)
    const urlParams = new URLSearchParams(window.location.search);
    const conditionParam = urlParams.get("condition");

    if (conditionParam === "1" || conditionParam === "2") {
      const condition = `condition${conditionParam}`;
      // Save to localStorage for consistency during session
      localStorage.setItem("experimentCondition", condition);
      return condition;
    }

    // Check localStorage (for session persistence)
    const savedCondition = localStorage.getItem("experimentCondition");
    return savedCondition || "condition1";
  }

  // Get the default assistant for the current condition
  function getDefaultAssistant() {
    const condition = getCounterbalanceCondition();
    return EXPERIMENT_CONFIG.counterbalanceConditions[condition]
      .defaultAssistant;
  }

  // Get current condition info for logging
  function getCurrentConditionInfo() {
    const condition = getCounterbalanceCondition();
    const mapping = EXPERIMENT_CONFIG.counterbalanceConditions[condition];

    return {
      condition: condition,
      defaultAssistant: mapping.defaultAssistant,
      aiTypes: mapping.aiTypes,
      participantId: generateParticipantId(),
    };
  }

  // Generate a unique participant ID
  function generateParticipantId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 5);
    return `P_${timestamp}_${randomStr}`.toUpperCase();
  }

  console.log("Experiment configuration:", getCurrentConditionInfo());

  return {
    getDefaultAssistant,
    getCurrentConditionInfo,
    getCounterbalanceCondition,
    backendUrl, // Export the backend URL for AI system
  };
}
