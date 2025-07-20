/* filepath: /js/modules/experimentConfig.js */
export function initializeExperimentConfig() {
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
  };
}
