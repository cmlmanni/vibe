/* filepath: /js/modules/ai/modularIndex.js */

import { assistantRegistry } from "./core/assistantRegistry.js";
import { assistantFactory } from "./core/assistantFactory.js";
import { assistantConfigs } from "./config/assistantConfigs.js";

// Import assistant classes
import { VibecodingAssistant } from "./assistants/vibecodingAssistant.js";
import { ReflectiveAssistant } from "./assistants/reflectiveAssistant.js";
import { DebuggingAssistant } from "./assistants/debuggingAssistant.js";
import { CreativeAssistant } from "./assistants/creativeAssistant.js";

/**
 * Modular AI Assistant System
 * Provides easy setup and management of AI assistants
 */
export class ModularAISystem {
  constructor() {
    this.currentAssistant = null;
    this.assistantInstances = new Map();
    this.eventListeners = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the modular AI system
   * @param {object} params - Initialization parameters
   * @returns {object} System instance for chaining
   */
  async initialize(params = {}) {
    const {
      domElements,
      eventLogger,
      experimentConfig,
      autoRegisterDefaults = true,
      customAssistants = [],
    } = params;

    this.domElements = domElements;
    this.eventLogger = eventLogger;
    this.experimentConfig = experimentConfig;

    // Register default assistants if requested
    if (autoRegisterDefaults) {
      this.registerDefaultAssistants();
    }

    // Register any custom assistants
    customAssistants.forEach(({ id, assistantClass, config }) => {
      this.registerAssistant(id, assistantClass, config);
    });

    // Create instances for registered assistants
    this.createAssistantInstances();

    // Set up the UI and event listeners
    this.setupUI();

    this.isInitialized = true;
    console.log("🎯 Modular AI System initialized");
    console.log(
      `📊 Registered assistants: ${assistantRegistry.getIds().join(", ")}`
    );

    return this;
  }

  /**
   * Register default assistants
   */
  registerDefaultAssistants() {
    const defaultAssistants = [
      {
        id: "vibecoding",
        class: VibecodingAssistant,
        config: assistantConfigs.vibecoding,
      },
      {
        id: "reflective",
        class: ReflectiveAssistant,
        config: assistantConfigs.reflective,
      },
      {
        id: "debugging",
        class: DebuggingAssistant,
        config: assistantConfigs.debugging,
      },
      {
        id: "creative",
        class: CreativeAssistant,
        config: assistantConfigs.creative,
      },
    ];

    defaultAssistants.forEach(({ id, class: AssistantClass, config }) => {
      assistantRegistry.register(id, AssistantClass, config);
    });

    console.log("✅ Default assistants registered");
  }

  /**
   * Register a new assistant type
   * @param {string} id - Assistant identifier
   * @param {class} AssistantClass - Assistant class
   * @param {object} config - Assistant configuration
   */
  registerAssistant(id, AssistantClass, config) {
    assistantRegistry.register(id, AssistantClass, config);

    // Create instance if system is already initialized
    if (this.isInitialized) {
      this.createAssistantInstance(id);
      this.updateUI();
    }
  }

  /**
   * Create instances for all registered assistants
   */
  createAssistantInstances() {
    const assistantIds = assistantRegistry.getIds();

    assistantIds.forEach((id) => {
      this.createAssistantInstance(id);
    });

    // Set default assistant
    this.setDefaultAssistant();
  }

  /**
   * Create an instance for a specific assistant
   * @param {string} id - Assistant identifier
   */
  createAssistantInstance(id) {
    const config = assistantRegistry.getConfig(id);

    const instance = assistantFactory.create(
      id,
      {
        eventLogger: this.eventLogger,
        domElements: this.domElements,
      },
      config
    );

    if (instance) {
      this.assistantInstances.set(id, instance);
      this.setupAssistantEvents(id, instance);
      console.log(`📱 Created instance for assistant: ${id}`);
    }
  }

  /**
   * Set up event listeners for an assistant instance
   * @param {string} id - Assistant identifier
   * @param {object} instance - Assistant instance
   */
  setupAssistantEvents(id, instance) {
    const listeners = [];

    // Standard events all assistants should handle
    const eventHandlers = {
      initialized: (event) => {
        console.log(`🎉 Assistant ${id} initialized:`, event.detail);
      },
      suggestionStarted: (event) => {
        this.eventLogger?.logEvent("ai_suggestion_started", {
          assistantId: id,
          prompt: event.detail.prompt,
        });
      },
      suggestionCompleted: (event) => {
        this.eventLogger?.logEvent("ai_suggestion_completed", {
          assistantId: id,
          prompt: event.detail.prompt,
          responseType: event.detail.response?.type,
        });
      },
    };

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      instance.on(event, handler);
      listeners.push({ event, handler });
    });

    this.eventListeners.set(id, listeners);
  }

  /**
   * Set up UI elements and interactions
   */
  setupUI() {
    this.updateAssistantDropdown();
    this.setupEventListeners();
  }

  /**
   * Update the assistant dropdown with available options
   */
  updateAssistantDropdown() {
    if (!this.domElements?.aiModeSelect) return;

    const dropdown = this.domElements.aiModeSelect;

    // Clear existing options
    dropdown.innerHTML = "";

    // Add options for each registered assistant
    assistantRegistry.getAllAssistants().forEach((assistant) => {
      const option = document.createElement("option");
      option.value = assistant.id;
      option.textContent = `${assistant.icon} ${assistant.name}`;
      option.title = assistant.description;
      dropdown.appendChild(option);
    });

    console.log("🔄 Assistant dropdown updated");
  }

  /**
   * Set up event listeners for UI interactions
   */
  setupEventListeners() {
    if (!this.domElements) return;

    // AI mode selection change
    this.domElements.aiModeSelect?.addEventListener("change", (e) => {
      this.switchAssistant(e.target.value);
    });

    // Get suggestion button
    this.domElements.getAiSuggestionBtn?.addEventListener("click", () => {
      this.handleGetSuggestion();
    });

    // Prompt input enter key and auto-resize
    this.domElements.aiPromptInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (e.shiftKey) {
          // Shift+Enter: Add line break - let default behavior handle it
          // Auto-resize will handle the height adjustment
        } else {
          // Regular Enter: Send message
          e.preventDefault();
          this.handleGetSuggestion();
        }
      }
    });

    // Auto-resize textarea
    this.domElements.aiPromptInput?.addEventListener("input", (e) => {
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    });

    console.log("🎮 Event listeners set up");
  }

  /**
   * Handle getting AI suggestions
   */
  handleGetSuggestion() {
    if (!this.currentAssistant || !this.domElements?.aiPromptInput) return;

    const userPrompt = this.domElements.aiPromptInput.value.trim();
    if (!userPrompt || this.currentAssistant.isGenerating) return;

    this.domElements.aiPromptInput.value = "";
    this.currentAssistant.createChatMessage(userPrompt, "user");
    this.currentAssistant.getSuggestion(userPrompt);
  }

  /**
   * Switch to a different assistant
   * @param {string} assistantId - ID of assistant to switch to
   */
  switchAssistant(assistantId) {
    const instance = this.assistantInstances.get(assistantId);

    if (!instance) {
      console.error(`Assistant ${assistantId} not found`);
      return;
    }

    const previousAssistant = this.currentAssistant?.assistantId;
    this.currentAssistant = instance;
    window.currentAI = instance; // For backward compatibility

    console.log(`🔄 Switched from ${previousAssistant} to ${assistantId}`);

    this.eventLogger?.logEvent("ai_assistant_switched", {
      from: previousAssistant,
      to: assistantId,
      assistantName: instance.getMetadata().name,
    });
  }

  /**
   * Set the default assistant based on experiment configuration
   */
  setDefaultAssistant() {
    const defaultId =
      this.experimentConfig?.getDefaultAssistant() || "vibecoding";
    const instance = this.assistantInstances.get(defaultId);

    if (instance) {
      this.currentAssistant = instance;
      window.currentAI = instance; // For backward compatibility

      if (this.domElements?.aiModeSelect) {
        this.domElements.aiModeSelect.value = defaultId;
      }

      console.log(`🎯 Default assistant set to: ${defaultId}`);
    }
  }

  /**
   * Get assistant by ID
   * @param {string} id - Assistant identifier
   * @returns {object|null} Assistant instance or null
   */
  getAssistant(id) {
    return this.assistantInstances.get(id) || null;
  }

  /**
   * Get all assistant instances
   * @returns {Map} Map of assistant instances
   */
  getAllAssistants() {
    return new Map(this.assistantInstances);
  }

  /**
   * Get current assistant
   * @returns {object|null} Current assistant instance
   */
  getCurrentAssistant() {
    return this.currentAssistant;
  }

  /**
   * Get system statistics
   * @returns {object} System statistics
   */
  getSystemStats() {
    const registryStats = assistantRegistry.getStats();
    const factoryStats = assistantFactory.getStats();

    const assistantStatuses = {};
    this.assistantInstances.forEach((instance, id) => {
      assistantStatuses[id] = instance.getStatus();
    });

    return {
      registry: registryStats,
      factory: factoryStats,
      assistants: assistantStatuses,
      currentAssistant: this.currentAssistant?.assistantId || null,
    };
  }

  /**
   * Update UI after changes
   */
  updateUI() {
    this.updateAssistantDropdown();
  }

  /**
   * Cleanup method
   */
  cleanup() {
    // Remove event listeners
    this.eventListeners.forEach((listeners, id) => {
      const instance = this.assistantInstances.get(id);
      if (instance) {
        listeners.forEach(({ event, handler }) => {
          instance.off(event, handler);
        });
      }
    });

    // Cleanup factory and instances
    assistantFactory.cleanup();

    // Clear references
    this.assistantInstances.clear();
    this.eventListeners.clear();
    this.currentAssistant = null;

    console.log("🧹 Modular AI System cleaned up");
  }
}

/**
 * Initialize the modular AI system (for easy use)
 * @param {object} params - Initialization parameters
 * @returns {ModularAISystem} Initialized system instance
 */
export async function initializeModularAI(params) {
  const system = new ModularAISystem();
  await system.initialize(params);
  return system;
}

/**
 * Create a simple adapter for the existing interface
 * @param {object} domElements - DOM elements
 * @param {object} eventLogger - Event logger
 * @param {object} editor - Code editor
 * @param {object} experimentConfig - Experiment configuration
 * @returns {object} Compatible interface
 */
export function createCompatibleInterface(
  domElements,
  eventLogger,
  editor,
  experimentConfig
) {
  let aiSystem = null;

  const init = async () => {
    aiSystem = await initializeModularAI({
      domElements,
      eventLogger,
      experimentConfig,
    });

    return {
      handleGetSuggestion: () => aiSystem.handleGetSuggestion(),
      setupEventListeners: () => {}, // Already handled in system
      vibecodingAI: aiSystem.getAssistant("vibecoding"),
      reflectiveAI: aiSystem.getAssistant("reflective"),
      get currentAI() {
        return aiSystem.getCurrentAssistant();
      },
      // Additional modular features
      system: aiSystem,
      getAssistant: (id) => aiSystem.getAssistant(id),
      getAllAssistants: () => aiSystem.getAllAssistants(),
      getStats: () => aiSystem.getSystemStats(),
    };
  };

  return init();
}
