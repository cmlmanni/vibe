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
    name: "Socratic Tutor",
    description:
      "A Socratic tutor that guides learning through strategic questions, helping students discover solutions through inquiry and reflection.",
    category: "education",
    icon: "🤔",
    version: "2.0.0",
    capabilities: [
      "socratic_questioning",
      "guided_discovery",
      "strategic_inquiry",
      "reflection_facilitation",
      "conversation_memory",
    ],
    systemPrompt: `You are a Socratic tutor specializing in Python turtle graphics. Your primary method is to guide learning through strategic questioning rather than providing direct answers or solutions.

Core Socratic principles:
- Ask questions that lead students to discover answers themselves
- Break down complex problems into smaller, manageable questions
- Help students examine their assumptions and reasoning
- Guide them to test their ideas and learn from results
- Never give direct answers - always respond with clarifying or guiding questions
- Build understanding step by step through dialogue

Questioning strategies:
- "What do you think will happen if...?"
- "Why do you think that approach might work?"
- "What patterns do you notice in your code?"
- "How is this similar to something you've done before?"
- "What would you try first to solve this?"
- "What does the error message tell you?"
- "If that didn't work, what might be the reason?"

Response patterns:
- Always respond with questions that guide thinking
- Acknowledge their attempts: "I see you tried X. What made you choose that approach?"
- Connect to prior knowledge: "How does this relate to what you learned earlier?"
- Encourage experimentation: "What would happen if you changed...?"
- Help them reflect: "What did you learn from that result?"

You should NEVER:
- Provide direct code solutions
- Give step-by-step instructions
- Tell them exactly what to do
- Explain concepts directly without questioning

Instead, always guide through questions that help them discover the solution themselves.`,
    settings: {
      includeCodeContext: true,
      maxHistoryLength: 15,
      avoidDirectAnswers: true,
      neverProvideCode: true,
      questionGuidanceRatio: 0.9, // 90% questions, 10% guidance
      socraticMode: true,
    },
    events: {
      initialized: (data) =>
        console.log(`Socratic tutor initialized: ${data.assistantId}`),
      socraticQuestionAsked: (data) => console.log(`Socratic question asked`),
      inquiryThreadStarted: (data) =>
        console.log(`New inquiry thread started: ${data.topic}`),
      codeRedirectedToQuestion: (data) =>
        console.log(`Code response converted to question`),
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

  ignorantSchoolmaster: {
    id: "ignorant-schoolmaster",
    name: "Reactive Verifier",
    description:
      "Uses Jacotot's method purely reactively: responds only to student work with questions and binary confirmations.",
    category: "education",
    icon: "⚡",
    version: "3.0.0",
    capabilities: [
      "reactive_questioning",
      "binary_verification",
      "result_confirmation",
      "equal_intelligence_method",
      "conversation_memory",
    ],
    systemPrompt: `You are an "ignorant schoolmaster" based on Joseph Jacotot's method, adapted for a typing interface. You embody equal intelligence and are purely reactive to student-generated code.

Core principles:
- You do not teach content or provide code solutions - students must discover for themselves
- You only react to what students show you - never suggest code
- Use simple yes/no questions and binary confirmations
- Focus on what students have already done, not what they should do
- Verify through repetition and comparison with minimal typing
- Assume equal intelligence - students can figure out their own solutions

Communication style (purely reactive Jacotot approach):
- "Run that code. Did it work? (yes/no)"
- "What happened when you changed it? (worked/error/same)"
- "Try it again. Same result? (yes/no)"
- "Compare your line 1 with line 3. Same? (yes/no)"
- "Run it without that line. Better or worse? (better/worse/same)"
- "Does your code match what you expected? (yes/no)"

Reactive responses only:
- React to student's existing code
- Ask about their results
- Request binary confirmations about their work
- Compare their attempts
- Verify their observations

You should NEVER:
- Provide code suggestions or solutions
- Tell students what code to write
- Give specific programming instructions
- Ask for long descriptions
- Request detailed explanations
- Use open-ended questions
- Explain concepts or provide theory

Instead, only react to what they've already done:
- "Your code did X. Expected? (yes/no)"
- "Run your code again. Same result? (yes/no)"
- "Does your output match your goal? (yes/no)"
- "Try your code without line 2. Different? (yes/no)"
- Maintain equal intelligence through reactive questioning, not proactive teaching`,
    settings: {
      includeCodeContext: true,
      maxHistoryLength: 15,
      reactiveMode: true,
      binaryResponseMode: true,
      noCodeSuggestions: true,
      purelyReactive: true,
    },
    events: {
      initialized: (data) =>
        console.log(
          `Reactive Verifier Assistant initialized: ${data.assistantId}`
        ),
      reactiveQuestionAsked: (data) => console.log(`Reactive question asked`),
      binaryQuestionAsked: (data) =>
        console.log(`Binary confirmation requested`),
      resultVerificationRequested: (data) =>
        console.log(`Result verification requested`),
      studentCodeAnalyzed: (data) =>
        console.log(`Student code analyzed reactively`),
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
  console.log(
    `🔍 [AssistantConfig] Getting configuration for assistant: ${id}`
  );

  const config = assistantConfigs[id] || null;

  if (config) {
    console.log(`✅ [AssistantConfig] Found configuration for '${id}':`, {
      name: config.name,
      version: config.version,
      category: config.category,
      capabilities: config.capabilities,
    });
  } else {
    console.warn(
      `❌ [AssistantConfig] No configuration found for assistant: ${id}`
    );
    console.log(
      `🔍 [AssistantConfig] Available assistants:`,
      Object.keys(assistantConfigs)
    );
  }

  return config;
}

/**
 * Get all assistant configurations
 * @returns {object} All configurations
 */
export function getAllAssistantConfigs() {
  console.log(`📋 [AssistantConfig] Getting all assistant configurations`);

  const allConfigs = { ...assistantConfigs };
  const configSummary = Object.entries(allConfigs).map(([id, config]) => ({
    id,
    name: config.name,
    category: config.category,
    version: config.version,
  }));

  console.log(
    `📊 [AssistantConfig] Found ${
      Object.keys(allConfigs).length
    } assistant configurations:`,
    configSummary
  );

  return allConfigs;
}

/**
 * Get assistants by category
 * @param {string} category - Category to filter by
 * @returns {Array} Array of configurations in the category
 */
export function getAssistantsByCategory(category) {
  console.log(
    `🏷️ [AssistantConfig] Filtering assistants by category: ${category}`
  );

  const filteredConfigs = Object.values(assistantConfigs).filter(
    (config) => config.category === category
  );

  const results = filteredConfigs.map((config) => ({
    id: config.id,
    name: config.name,
    version: config.version,
  }));

  console.log(
    `🎯 [AssistantConfig] Found ${filteredConfigs.length} assistants in category '${category}':`,
    results
  );

  return filteredConfigs;
}

/**
 * Get assistants by capability
 * @param {string} capability - Capability to search for
 * @returns {Array} Array of configurations with the capability
 */
export function getAssistantsByCapability(capability) {
  console.log(
    `🛠️ [AssistantConfig] Filtering assistants by capability: ${capability}`
  );

  const filteredConfigs = Object.values(assistantConfigs).filter((config) =>
    config.capabilities.includes(capability)
  );

  const results = filteredConfigs.map((config) => ({
    id: config.id,
    name: config.name,
    capabilities: config.capabilities,
  }));

  console.log(
    `⚙️ [AssistantConfig] Found ${filteredConfigs.length} assistants with capability '${capability}':`,
    results
  );

  return filteredConfigs;
}

/**
 * Add a new assistant configuration
 * @param {string} id - Assistant identifier
 * @param {object} config - Configuration object
 */
export function addAssistantConfig(id, config) {
  console.log(`➕ [AssistantConfig] Adding new assistant configuration: ${id}`);
  console.log(`🔧 [AssistantConfig] Configuration details:`, {
    id,
    name: config.name,
    category: config.category,
    version: config.version,
    capabilities: config.capabilities,
  });

  // Validate the configuration before adding
  const validation = validateAssistantConfig({ id, ...config });
  if (!validation.isValid) {
    console.error(
      `❌ [AssistantConfig] Validation failed for '${id}':`,
      validation.errors
    );
    throw new Error(
      `Invalid assistant configuration: ${validation.errors.join(", ")}`
    );
  }

  if (assistantConfigs[id]) {
    console.warn(
      `⚠️ [AssistantConfig] Assistant configuration '${id}' already exists. Overwriting...`
    );
    console.log(`🔄 [AssistantConfig] Previous configuration:`, {
      name: assistantConfigs[id].name,
      version: assistantConfigs[id].version,
    });
  }

  assistantConfigs[id] = {
    id,
    ...config,
  };

  console.log(
    `✅ [AssistantConfig] Successfully added assistant configuration: ${id}`
  );
  console.log(
    `📊 [AssistantConfig] Total assistants now: ${
      Object.keys(assistantConfigs).length
    }`
  );
}

/**
 * Validate assistant configuration
 * @param {object} config - Configuration to validate
 * @returns {object} Validation result with isValid and errors
 */
export function validateAssistantConfig(config) {
  console.log(
    `🔍 [AssistantConfig] Validating configuration for:`,
    config.id || "unknown"
  );

  const errors = [];
  const warnings = [];

  // Required field validations
  if (!config.id || typeof config.id !== "string") {
    errors.push("Configuration must have a valid string ID");
  } else {
    console.log(`✓ [AssistantConfig] Valid ID: ${config.id}`);
  }

  if (!config.name || typeof config.name !== "string") {
    errors.push("Configuration must have a valid name");
  } else {
    console.log(`✓ [AssistantConfig] Valid name: ${config.name}`);
  }

  if (!config.systemPrompt || typeof config.systemPrompt !== "string") {
    errors.push("Configuration must have a valid system prompt");
  } else {
    const promptLength = config.systemPrompt.length;
    console.log(
      `✓ [AssistantConfig] Valid system prompt (${promptLength} characters)`
    );

    if (promptLength < 100) {
      warnings.push("System prompt is quite short (< 100 characters)");
    } else if (promptLength > 3000) {
      warnings.push("System prompt is very long (> 3000 characters)");
    }
  }

  if (config.capabilities && !Array.isArray(config.capabilities)) {
    errors.push("Capabilities must be an array");
  } else if (config.capabilities) {
    console.log(
      `✓ [AssistantConfig] Valid capabilities: ${config.capabilities.join(
        ", "
      )}`
    );

    if (config.capabilities.length === 0) {
      warnings.push("No capabilities defined");
    }
  }

  if (config.requiredParams && !Array.isArray(config.requiredParams)) {
    errors.push("Required parameters must be an array");
  } else if (config.requiredParams) {
    console.log(
      `✓ [AssistantConfig] Required parameters: ${config.requiredParams.join(
        ", "
      )}`
    );
  }

  // Optional field validations
  if (config.version) {
    console.log(`✓ [AssistantConfig] Version: ${config.version}`);
  } else {
    warnings.push("No version specified");
  }

  if (config.category) {
    console.log(`✓ [AssistantConfig] Category: ${config.category}`);
  } else {
    warnings.push("No category specified");
  }

  if (config.description) {
    console.log(
      `✓ [AssistantConfig] Description: ${config.description.substring(
        0,
        50
      )}...`
    );
  } else {
    warnings.push("No description provided");
  }

  // Settings validation
  if (config.settings) {
    console.log(
      `🔧 [AssistantConfig] Settings provided:`,
      Object.keys(config.settings)
    );

    if (
      config.settings.maxHistoryLength &&
      typeof config.settings.maxHistoryLength !== "number"
    ) {
      errors.push("maxHistoryLength must be a number");
    }

    if (
      config.settings.questionGuidanceRatio &&
      (typeof config.settings.questionGuidanceRatio !== "number" ||
        config.settings.questionGuidanceRatio < 0 ||
        config.settings.questionGuidanceRatio > 1)
    ) {
      errors.push("questionGuidanceRatio must be a number between 0 and 1");
    }
  }

  // Events validation
  if (config.events) {
    const eventKeys = Object.keys(config.events);
    console.log(`📡 [AssistantConfig] Events defined: ${eventKeys.join(", ")}`);

    eventKeys.forEach((eventKey) => {
      if (typeof config.events[eventKey] !== "function") {
        warnings.push(`Event handler '${eventKey}' is not a function`);
      }
    });
  }

  const result = {
    isValid: errors.length === 0,
    errors,
    warnings,
  };

  if (result.isValid) {
    console.log(
      `✅ [AssistantConfig] Configuration validation passed for '${config.id}'`
    );
    if (warnings.length > 0) {
      console.warn(
        `⚠️ [AssistantConfig] Validation warnings for '${config.id}':`,
        warnings
      );
    }
  } else {
    console.error(
      `❌ [AssistantConfig] Configuration validation failed for '${config.id}':`,
      errors
    );
    if (warnings.length > 0) {
      console.warn(`⚠️ [AssistantConfig] Additional warnings:`, warnings);
    }
  }

  return result;
}

/**
 * Get a summary of all assistant configurations
 * @returns {object} Summary statistics and overview
 */
export function getAssistantConfigSummary() {
  console.log(
    `📊 [AssistantConfig] Generating assistant configuration summary`
  );

  const configs = Object.values(assistantConfigs);
  const summary = {
    totalAssistants: configs.length,
    categories: {},
    capabilities: {},
    versions: {},
    averagePromptLength: 0,
    assistantDetails: [],
  };

  configs.forEach((config) => {
    // Count categories
    summary.categories[config.category] =
      (summary.categories[config.category] || 0) + 1;

    // Count capabilities
    if (config.capabilities) {
      config.capabilities.forEach((capability) => {
        summary.capabilities[capability] =
          (summary.capabilities[capability] || 0) + 1;
      });
    }

    // Count versions
    summary.versions[config.version] =
      (summary.versions[config.version] || 0) + 1;

    // Calculate prompt length
    if (config.systemPrompt) {
      summary.averagePromptLength += config.systemPrompt.length;
    }

    // Store assistant details
    summary.assistantDetails.push({
      id: config.id,
      name: config.name,
      category: config.category,
      version: config.version,
      promptLength: config.systemPrompt ? config.systemPrompt.length : 0,
      capabilityCount: config.capabilities ? config.capabilities.length : 0,
    });
  });

  summary.averagePromptLength = Math.round(
    summary.averagePromptLength / configs.length
  );

  console.log(`📈 [AssistantConfig] Summary generated:`, {
    totalAssistants: summary.totalAssistants,
    categories: Object.keys(summary.categories),
    topCapabilities: Object.entries(summary.capabilities)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cap]) => cap),
    averagePromptLength: summary.averagePromptLength,
  });

  return summary;
}

/**
 * Validate all assistant configurations
 * @returns {object} Validation results for all assistants
 */
export function validateAllAssistantConfigs() {
  console.log(`🔍 [AssistantConfig] Validating all assistant configurations`);

  const results = {};
  const overallStats = {
    total: 0,
    valid: 0,
    invalid: 0,
    warnings: 0,
  };

  Object.entries(assistantConfigs).forEach(([id, config]) => {
    const validation = validateAssistantConfig(config);
    results[id] = validation;

    overallStats.total++;
    if (validation.isValid) {
      overallStats.valid++;
    } else {
      overallStats.invalid++;
    }
    if (validation.warnings && validation.warnings.length > 0) {
      overallStats.warnings++;
    }
  });

  console.log(`📊 [AssistantConfig] Overall validation results:`, overallStats);

  if (overallStats.invalid > 0) {
    const invalidConfigs = Object.entries(results)
      .filter(([, result]) => !result.isValid)
      .map(([id]) => id);
    console.error(
      `❌ [AssistantConfig] Invalid configurations found:`,
      invalidConfigs
    );
  }

  return {
    results,
    stats: overallStats,
  };
}

/**
 * Check if assistant configuration exists and is valid
 * @param {string} id - Assistant identifier
 * @returns {object} Existence and validity check result
 */
export function checkAssistantConfig(id) {
  console.log(`🔍 [AssistantConfig] Checking assistant configuration: ${id}`);

  const exists = id in assistantConfigs;

  if (!exists) {
    console.warn(`❌ [AssistantConfig] Assistant '${id}' does not exist`);
    return {
      exists: false,
      valid: false,
      config: null,
      validation: null,
    };
  }

  const config = assistantConfigs[id];
  const validation = validateAssistantConfig(config);

  console.log(
    `✅ [AssistantConfig] Assistant '${id}' exists, validation: ${
      validation.isValid ? "passed" : "failed"
    }`
  );

  return {
    exists: true,
    valid: validation.isValid,
    config: config,
    validation: validation,
  };
}
