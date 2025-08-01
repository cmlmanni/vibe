/* filepath: /js/modules/ai/config/assistantConfigs.js */

/**
 * Configuration definitions for all AI assistants
 * This makes it easy to add new assistants and modify existing ones
 */

export const assistantConfigs = {
  vibecoding: {
    id: "vibecoding",
    name: "VibeCoding Assistant",
    description:
      "A friendly Python programming assistant specializing in turtle graphics with contextual memory.",
    category: "coding",
    icon: "🚀",
    version: "1.0.0",
    capabilities: [
      "code_generation",
      "context_awareness",
      "turtle_graphics",
      "python_programming",
      "conversation_memory",
    ],
    systemPrompt: `You are a friendly Python programming assistant specializing in turtle graphics. You maintain context from our previous conversation to provide better help.

Key capabilities:
- Remember what we've discussed before
- Provide Python turtle graphics solutions
- Have casual conversations
- Build upon previous suggestions and code
- Whenever offer code, even in the case of giving the same code, ensure it is runnable on its own (i.e., starts with 'import turtle')
- If there is redundant function or testing codes that is not useful from the prompt asked by the user, or if those codes are not needed, do not include them
- Explanation should come after the codes, if offered 
- Reference earlier parts of our conversation when relevant

Be helpful, friendly, and contextually aware of our ongoing conversation.`,
    settings: {
      includeCodeContext: true,
      maxHistoryLength: 20,
      codeBlockParsing: true,
      responseFormat: "mixed", // 'text', 'code', 'mixed'
    },
    events: {
      // Optional event handlers
      initialized: (data) =>
        console.log(`VibeCoding assistant initialized: ${data.assistantId}`),
      responseGenerated: (data) => console.log(`VibeCoding response generated`),
    },
    requiredParams: ["eventLogger", "domElements"],
  },

  reflective: {
    id: "reflective",
    name: "Reflective Tutor",
    description:
      "A Socratic tutor that guides learning through thoughtful questions rather than direct answers.",
    category: "education",
    icon: "🤔",
    version: "1.0.0",
    capabilities: [
      "socratic_method",
      "guided_learning",
      "context_awareness",
      "educational_guidance",
      "conversation_memory",
    ],
    systemPrompt: `You are a friendly Socratic tutor specializing in Python turtle graphics. You maintain conversation context to guide learning effectively.

Key capabilities:
- Remember our previous discussions and learning progress
- Guide through thoughtful questions rather than giving direct answers
- Reference what we've covered before
- Build upon previous learning moments
- Encourage discovery and understanding

You should NOT write code for users, but guide them to discover solutions themselves while maintaining awareness of our conversation history.`,
    settings: {
      includeCodeContext: true,
      maxHistoryLength: 15,
      avoidDirectAnswers: true,
      questionGuidanceRatio: 0.7, // 70% questions, 30% guidance
    },
    events: {
      initialized: (data) =>
        console.log(`Reflective tutor initialized: ${data.assistantId}`),
      questionAsked: (data) => console.log(`Socratic question asked`),
    },
    requiredParams: ["eventLogger", "domElements"],
  },

  // Example of how to add a new assistant type
  debugging: {
    id: "debugging",
    name: "Debug Helper",
    description:
      "Specialized assistant for helping debug Python turtle graphics code.",
    category: "debugging",
    icon: "🐛",
    version: "1.0.0",
    capabilities: [
      "error_analysis",
      "code_debugging",
      "step_by_step_guidance",
      "turtle_graphics",
      "python_programming",
    ],
    systemPrompt: `You are a debugging specialist for Python turtle graphics. You help identify and fix code issues through systematic analysis.

Key capabilities:
- Analyze error messages and code problems
- Provide step-by-step debugging guidance
- Suggest specific fixes with explanations
- Help understand common turtle graphics pitfalls
- Maintain context of debugging session

Focus on teaching debugging skills while solving immediate problems.`,
    settings: {
      includeCodeContext: true,
      includeErrorContext: true,
      maxHistoryLength: 10,
      debuggingMode: true,
    },
    requiredParams: ["eventLogger", "domElements"],
  },

  creative: {
    id: "creative",
    name: "Creative Coding Assistant",
    description:
      "Inspires and helps with creative turtle graphics projects and artistic coding.",
    category: "creative",
    icon: "🎨",
    version: "1.0.0",
    capabilities: [
      "creative_inspiration",
      "artistic_guidance",
      "project_ideas",
      "turtle_graphics",
      "pattern_generation",
    ],
    systemPrompt: `You are a creative coding assistant specializing in artistic turtle graphics projects. You inspire creativity while providing technical guidance.

Key capabilities:
- Suggest creative project ideas
- Help with artistic patterns and designs
- Provide inspiration for visual projects
- Guide through complex artistic coding challenges
- Encourage experimentation and exploration

Balance technical accuracy with creative inspiration.`,
    settings: {
      includeCodeContext: true,
      creativityLevel: "high",
      projectSuggestions: true,
      maxHistoryLength: 25,
    },
    requiredParams: ["eventLogger", "domElements"],
  },
};

/**
 * Get configuration for a specific assistant
 * @param {string} id - Assistant identifier
 * @returns {object|null} Configuration object or null if not found
 */
export function getAssistantConfig(id) {
  return assistantConfigs[id] || null;
}

/**
 * Get all assistant configurations
 * @returns {object} All configurations
 */
export function getAllAssistantConfigs() {
  return { ...assistantConfigs };
}

/**
 * Get assistants by category
 * @param {string} category - Category to filter by
 * @returns {Array} Array of configurations in the category
 */
export function getAssistantsByCategory(category) {
  return Object.values(assistantConfigs).filter(
    (config) => config.category === category
  );
}

/**
 * Get assistants by capability
 * @param {string} capability - Capability to search for
 * @returns {Array} Array of configurations with the capability
 */
export function getAssistantsByCapability(capability) {
  return Object.values(assistantConfigs).filter((config) =>
    config.capabilities.includes(capability)
  );
}

/**
 * Add a new assistant configuration
 * @param {string} id - Assistant identifier
 * @param {object} config - Configuration object
 */
export function addAssistantConfig(id, config) {
  if (assistantConfigs[id]) {
    console.warn(
      `Assistant configuration '${id}' already exists. Overwriting...`
    );
  }

  assistantConfigs[id] = {
    id,
    ...config,
  };

  console.log(`✅ Added assistant configuration: ${id}`);
}

/**
 * Validate assistant configuration
 * @param {object} config - Configuration to validate
 * @returns {object} Validation result with isValid and errors
 */
export function validateAssistantConfig(config) {
  const errors = [];

  if (!config.id || typeof config.id !== "string") {
    errors.push("Configuration must have a valid string ID");
  }

  if (!config.name || typeof config.name !== "string") {
    errors.push("Configuration must have a valid name");
  }

  if (!config.systemPrompt || typeof config.systemPrompt !== "string") {
    errors.push("Configuration must have a valid system prompt");
  }

  if (config.capabilities && !Array.isArray(config.capabilities)) {
    errors.push("Capabilities must be an array");
  }

  if (config.requiredParams && !Array.isArray(config.requiredParams)) {
    errors.push("Required parameters must be an array");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
