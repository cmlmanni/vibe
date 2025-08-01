/* filepath: /js/modules/ai/core/assistantRegistry.js */

/**
 * Central registry for managing AI assistants
 * Provides plugin-style architecture for adding new assistants
 */
export class AssistantRegistry {
  constructor() {
    this.assistants = new Map();
    this.configurations = new Map();
    this.capabilities = new Map();
  }

  /**
   * Register a new assistant type
   * @param {string} id - Unique identifier for the assistant
   * @param {class} AssistantClass - The assistant class constructor
   * @param {object} config - Configuration object for the assistant
   */
  register(id, AssistantClass, config = {}) {
    if (this.assistants.has(id)) {
      console.warn(`Assistant '${id}' is already registered. Overwriting...`);
    }

    const assistantConfig = {
      id,
      name: config.name || id,
      description: config.description || "",
      capabilities: config.capabilities || [],
      category: config.category || "general",
      icon: config.icon || "🤖",
      systemPrompt: config.systemPrompt || "",
      settings: config.settings || {},
      ...config,
    };

    this.assistants.set(id, AssistantClass);
    this.configurations.set(id, assistantConfig);
    this.capabilities.set(id, assistantConfig.capabilities);

    console.log(`✅ Registered assistant: ${id} (${assistantConfig.name})`);
    return this;
  }

  /**
   * Unregister an assistant
   * @param {string} id - Assistant identifier
   */
  unregister(id) {
    if (!this.assistants.has(id)) {
      console.warn(`Assistant '${id}' is not registered`);
      return false;
    }

    this.assistants.delete(id);
    this.configurations.delete(id);
    this.capabilities.delete(id);

    console.log(`🗑️ Unregistered assistant: ${id}`);
    return true;
  }

  /**
   * Get assistant class by ID
   * @param {string} id - Assistant identifier
   * @returns {class|null} Assistant class or null if not found
   */
  getAssistant(id) {
    return this.assistants.get(id) || null;
  }

  /**
   * Get assistant configuration by ID
   * @param {string} id - Assistant identifier
   * @returns {object|null} Configuration object or null if not found
   */
  getConfig(id) {
    return this.configurations.get(id) || null;
  }

  /**
   * Get all registered assistants
   * @returns {Array} Array of assistant information objects
   */
  getAllAssistants() {
    return Array.from(this.configurations.entries()).map(([id, config]) => ({
      id,
      class: this.assistants.get(id),
      ...config,
    }));
  }

  /**
   * Get assistants by category
   * @param {string} category - Category to filter by
   * @returns {Array} Array of assistant information objects in the category
   */
  getByCategory(category) {
    return this.getAllAssistants().filter(
      (assistant) => assistant.category === category
    );
  }

  /**
   * Get assistants by capability
   * @param {string} capability - Capability to search for
   * @returns {Array} Array of assistant information objects with the capability
   */
  getByCapability(capability) {
    return this.getAllAssistants().filter((assistant) =>
      assistant.capabilities.includes(capability)
    );
  }

  /**
   * Check if an assistant is registered
   * @param {string} id - Assistant identifier
   * @returns {boolean} True if registered, false otherwise
   */
  isRegistered(id) {
    return this.assistants.has(id);
  }

  /**
   * Get list of all registered assistant IDs
   * @returns {Array<string>} Array of assistant IDs
   */
  getIds() {
    return Array.from(this.assistants.keys());
  }

  /**
   * Validate assistant configuration
   * @param {object} config - Configuration to validate
   * @returns {object} Validation result with isValid and errors
   */
  validateConfig(config) {
    const errors = [];

    if (!config.id || typeof config.id !== "string") {
      errors.push("Assistant must have a valid string ID");
    }

    if (!config.name || typeof config.name !== "string") {
      errors.push("Assistant must have a valid name");
    }

    if (config.capabilities && !Array.isArray(config.capabilities)) {
      errors.push("Capabilities must be an array");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Register multiple assistants at once
   * @param {Array} assistants - Array of {id, class, config} objects
   */
  registerBatch(assistants) {
    const results = [];

    for (const { id, class: AssistantClass, config } of assistants) {
      try {
        this.register(id, AssistantClass, config);
        results.push({ id, success: true });
      } catch (error) {
        console.error(`Failed to register assistant '${id}':`, error);
        results.push({ id, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Clear all registered assistants
   */
  clear() {
    this.assistants.clear();
    this.configurations.clear();
    this.capabilities.clear();
    console.log("🧹 Cleared all registered assistants");
  }

  /**
   * Get registry statistics
   * @returns {object} Statistics about registered assistants
   */
  getStats() {
    const categories = {};
    const capabilities = {};

    this.configurations.forEach((config) => {
      // Count categories
      categories[config.category] = (categories[config.category] || 0) + 1;

      // Count capabilities
      config.capabilities.forEach((cap) => {
        capabilities[cap] = (capabilities[cap] || 0) + 1;
      });
    });

    return {
      totalAssistants: this.assistants.size,
      categories,
      capabilities,
      assistantIds: this.getIds(),
    };
  }
}

// Create and export a global registry instance
export const assistantRegistry = new AssistantRegistry();
