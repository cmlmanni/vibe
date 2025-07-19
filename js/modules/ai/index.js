/* filepath: /js/modules/ai/index.js */
import { VibecodingAssistant } from "./assistants/vibecodingAssistant.js";
import { ReflectiveAssistant } from "./assistants/reflectiveAssistant.js";

export function initializeAIAssistants(
  domElements,
  eventLogger,
  editor,
  experimentConfig
) {
  // Initialize AI assistants
  const vibecodingAI = new VibecodingAssistant(eventLogger, domElements);
  const reflectiveAI = new ReflectiveAssistant(eventLogger, domElements);

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
    return selectedAssistant === "vibecoding" ? vibecodingAI : reflectiveAI;
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
      if (e.key === "Enter") handleGetSuggestion();
    });

    domElements.aiModeSelect?.addEventListener("change", (e) => {
      const selectedAssistant = e.target.value;

      currentAI =
        selectedAssistant === "vibecoding" ? vibecodingAI : reflectiveAI;
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

  return {
    handleGetSuggestion,
    setupEventListeners,
    vibecodingAI,
    reflectiveAI,
    get currentAI() {
      return currentAI;
    },
  };
}
