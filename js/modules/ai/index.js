/* filepath: /js/modules/ai/index.js */
import { VibecodingAssistant } from "./assistants/vibecodingAssistant.js";
import { ReflectiveAssistant } from "./assistants/reflectiveAssistant.js";

export function initializeAIAssistants(domElements, eventLogger, editor) {
  // Initialize AI assistants
  const vibecodingAI = new VibecodingAssistant(eventLogger, domElements);
  const reflectiveAI = new ReflectiveAssistant(eventLogger, domElements);

  // Initialize currentAI based on the actual select value
  function getCurrentAIFromSelect() {
    const selectedValue = domElements.aiModeSelect?.value || "vibecoding";
    return selectedValue === "vibecoding" ? vibecodingAI : reflectiveAI;
  }

  let currentAI = getCurrentAIFromSelect();
  window.currentAI = currentAI;

  function handleGetSuggestion() {
    const userPrompt = domElements.aiPromptInput.value.trim();
    if (!userPrompt || currentAI.isGenerating) return;

    domElements.aiPromptInput.value = "";
    currentAI.createChatMessage(userPrompt, "user");

    console.log(
      "Sending user input to AI assistant:",
      currentAI.constructor.name,
      userPrompt
    );
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
      const newMode = e.target.value;
      currentAI = newMode === "vibecoding" ? vibecodingAI : reflectiveAI;
      window.currentAI = currentAI;

      console.log(
        `AI mode changed to: ${newMode} (${currentAI.constructor.name})`
      );
      eventLogger.logEvent("ai_mode_changed", { newMode: newMode });
    });
  }

  console.log("AI assistants initialized");
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
