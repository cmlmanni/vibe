/* filepath: /js/modules/ai/index.js */
import { VibecodingAssistant } from "./assistants/vibecodingAssistant.js";
import { ReflectiveAssistant } from "./assistants/reflectiveAssistant.js";
import { IgnorantSchoolmasterAssistant } from "./assistants/ignorantSchoolmasterAssistant.js";

export function initializeAIAssistants(
  domElements,
  eventLogger,
  editor,
  experimentConfig
) {
  // Initialize AI assistants
  const vibecodingAI = new VibecodingAssistant(eventLogger, domElements);
  const reflectiveAI = new ReflectiveAssistant(eventLogger, domElements);
  const ignorantSchoolmasterAI = new IgnorantSchoolmasterAssistant(
    eventLogger,
    domElements
  );

  // Set the default assistant based on experimental condition
  function initializeDefaultAssistant() {
    const defaultAssistant = experimentConfig.getDefaultAssistant();

    // Update the dropdown to show the correct default
    if (domElements.aiModeSelect) {
      domElements.aiModeSelect.value = defaultAssistant;
      console.log(`Set default assistant to: ${defaultAssistant}`);
    }

    return getCurrentAIFromSelection();
  }

  // Initialize currentAI based on the experimental condition
  function getCurrentAIFromSelection() {
    const selectedAssistant =
      domElements.aiModeSelect?.value || experimentConfig.getDefaultAssistant();
    console.log(`Using AI assistant: ${selectedAssistant}`);

    switch (selectedAssistant) {
      case "vibecoding":
        return vibecodingAI;
      case "reflective":
        return reflectiveAI;
      case "ignorant-schoolmaster":
        return ignorantSchoolmasterAI;
      default:
        return vibecodingAI; // Default fallback
    }
  }

  // Initialize with correct default
  let currentAI = initializeDefaultAssistant();
  window.currentAI = currentAI;

  function handleGetSuggestion() {
    const userPrompt = domElements.aiPromptInput.value.trim();
    if (!userPrompt || currentAI.isGenerating) return;

    domElements.aiPromptInput.value = "";
    currentAI.createChatMessage(userPrompt, "user");

    const selectedAssistant = domElements.aiModeSelect?.value;
    console.log(`Using ${selectedAssistant}:`, userPrompt);

    eventLogger.logEvent("ai_prompt", {
      prompt: userPrompt,
      ai_type: selectedAssistant,
      condition: experimentConfig.getCurrentConditionInfo(),
      historyLength: currentAI.conversationManager.getHistoryLength(),
    });

    currentAI.getSuggestion(userPrompt);
  }

  function setupEventListeners() {
    domElements.getAiSuggestionBtn?.addEventListener(
      "click",
      handleGetSuggestion
    );

    domElements.aiPromptInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (e.shiftKey) {
          // Shift+Enter: Add line break - let default behavior handle it
          // Auto-resize will handle the height adjustment
        } else {
          // Regular Enter: Send message
          e.preventDefault();
          handleGetSuggestion();
        }
      }
    });

    // Auto-resize textarea
    domElements.aiPromptInput?.addEventListener("input", (e) => {
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    });

    domElements.aiModeSelect?.addEventListener("change", (e) => {
      const selectedAssistant = e.target.value;

      switch (selectedAssistant) {
        case "vibecoding":
          currentAI = vibecodingAI;
          break;
        case "reflective":
          currentAI = reflectiveAI;
          break;
        case "ignorant-schoolmaster":
          currentAI = ignorantSchoolmasterAI;
          break;
        default:
          currentAI = vibecodingAI;
      }

      window.currentAI = currentAI;

      console.log(
        `AI switched to ${selectedAssistant} (${currentAI.constructor.name})`
      );

      eventLogger.logEvent("ai_mode_changed", {
        ai_type: selectedAssistant,
        condition: experimentConfig.getCurrentConditionInfo(),
      });
    });
  }

  // Log initial experimental setup
  const initialCondition = experimentConfig.getCurrentConditionInfo();
  eventLogger.logEvent("experiment_initialized", {
    condition: initialCondition,
    initial_ai_type:
      domElements.aiModeSelect?.value || initialCondition.defaultAssistant,
  });

  console.log("AI assistants initialized with modular architecture");
  console.log(
    "Initial AI mode:",
    domElements.aiModeSelect?.value || "vibecoding"
  );
  console.log("Current AI:", currentAI.constructor.name);

  /**
   * Collect analytics from all AI assistants
   */
  function getAllAssistantAnalytics() {
    const allAnalytics = {
      timestamp: new Date().toISOString(),
      currentAssistant:
        currentAI?.assistantId || currentAI?.constructor?.name || "unknown",
      assistants: {},
    };

    // Collect analytics from each assistant
    const assistants = [
      { key: "vibecodingAI", instance: vibecodingAI },
      { key: "reflectiveAI", instance: reflectiveAI },
      { key: "ignorantSchoolmasterAI", instance: ignorantSchoolmasterAI },
    ];

    assistants.forEach(({ key, instance }) => {
      if (instance && typeof instance.getAssistantAnalytics === "function") {
        try {
          allAnalytics.assistants[key] = instance.getAssistantAnalytics();
          console.log(`📊 Collected analytics for ${key}`);
        } catch (error) {
          console.warn(`Failed to collect analytics for ${key}:`, error);
          allAnalytics.assistants[key] = {
            error: error.message,
            assistantId: instance.assistantId || key,
            type: instance.constructor?.name || "Unknown",
          };
        }
      } else {
        console.warn(`${key} does not have getAssistantAnalytics method`);
        allAnalytics.assistants[key] = {
          error: "Analytics method not available",
          assistantId: instance?.assistantId || key,
          type: instance?.constructor?.name || "Unknown",
        };
      }
    });

    console.log("🔍 All assistant analytics collected:", allAnalytics);
    return allAnalytics;
  }

  return {
    handleGetSuggestion,
    setupEventListeners,
    vibecodingAI,
    reflectiveAI,
    ignorantSchoolmasterAI,
    getAllAssistantAnalytics,
    get currentAI() {
      return currentAI;
    },
  };
}
