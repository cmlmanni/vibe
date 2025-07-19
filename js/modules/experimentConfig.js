/* filepath: /js/modules/experimentConfig.js */
export function initializeExperimentConfig() {
  // Configuration for experimental conditions
  const EXPERIMENT_CONFIG = {
    // Counterbalancing: determines which assistant (A or B) maps to which AI type
    counterbalanceConditions: {
      // Condition 1: A = Vibecoding, B = Reflective
      condition1: {
        'assistant-a': 'vibecoding',
        'assistant-b': 'reflective'
      },
      // Condition 2: A = Reflective, B = Vibecoding  
      condition2: {
        'assistant-a': 'reflective',
        'assistant-b': 'vibecoding'
      }
    }
  };

  // Get counterbalance condition from URL parameter or localStorage
  function getCounterbalanceCondition() {
    // Check URL parameter first (experimenter can set this)
    const urlParams = new URLSearchParams(window.location.search);
    const conditionParam = urlParams.get('condition');
    
    if (conditionParam === '1' || conditionParam === '2') {
      const condition = `condition${conditionParam}`;
      // Save to localStorage for consistency during session
      localStorage.setItem('experimentCondition', condition);
      return condition;
    }
    
    // Check localStorage (for session persistence)
    const savedCondition = localStorage.getItem('experimentCondition');
    if (savedCondition) {
      return savedCondition;
    }
    
    // Default to condition1 if nothing is set
    return 'condition1';
  }

  // Get the actual AI type based on the selected assistant and condition
  function getAITypeForAssistant(assistantSelection) {
    const condition = getCounterbalanceCondition();
    const mapping = EXPERIMENT_CONFIG.counterbalanceConditions[condition];
    return mapping[assistantSelection] || 'vibecoding';
  }

  // Get current condition info for logging
  function getCurrentConditionInfo() {
    const condition = getCounterbalanceCondition();
    const mapping = EXPERIMENT_CONFIG.counterbalanceConditions[condition];
    
    return {
      condition: condition,
      mapping: mapping,
      assistantA_maps_to: mapping['assistant-a'],
      assistantB_maps_to: mapping['assistant-b']
    };
  }

  console.log("Experiment configuration initialized:", getCurrentConditionInfo());

  return {
    getAITypeForAssistant,
    getCurrentConditionInfo,
    getCounterbalanceCondition
  };
}