/* filepath: /js/modules/ai/core/assistantFactory.js */

import { assistantRegistry } from "./assistantRegistry.js";

/**
 * Factory for creating and managing AI assistant instances
 * Provides a clean interface for assistant lifecycle management
 */
export class AssistantFactory {
  constructor() {
    this.instances = new Map();
    this.eventListeners = new Map();
  }

  /**
   * Create an assistant instance
   * @param {string} id - Assistant identifier
   * @param {object} params - Parameters for assistant constructor
   * @param {object} overrides - Configuration overrides
   * @returns {object|null} Assistant instance or null if creation failed
   */
  create(id, params = {}, overrides = {}) {
    const AssistantClass = assistantRegistry.getAssistant(id);
    const config = assistantRegistry.getConfig(id);

    if (!AssistantClass) {
      console.error(`Assistant '${id}' is not registered`);
      return null;
    }

    if (!config) {
      console.error(`Configuration for assistant '${id}' not found`);
      return null;
    }

    try {
      // Merge configuration with overrides
      const finalConfig = { ...config, ...overrides };

      // Create instance with enhanced parameters
      const enhancedParams = {
        ...params,
        config: finalConfig,
        assistantId: id,
      };

      const instance = new AssistantClass(enhancedParams);

      // Store reference for lifecycle management
      this.instances.set(`${id}_${Date.now()}`, {
        id,
        instance,
        config: finalConfig,
        createdAt: new Date(),
        params: enhancedParams,
      });

      // Set up event listeners if specified
      this.setupInstanceEvents(instance, finalConfig);

      console.log(`🏭 Created assistant instance: ${id}`);
      return instance;
    } catch (error) {
      console.error(`Failed to create assistant '${id}':`, error);
      return null;
    }
  }

  /**
   * Create multiple assistant instances
   * @param {Array} requests - Array of {id, params, overrides} objects
   * @returns {Array} Array of created instances
   */
  createBatch(requests) {
    return requests
      .map(({ id, params = {}, overrides = {} }) =>
        this.create(id, params, overrides)
      )
      .filter((instance) => instance !== null);
  }

  /**
   * Get an existing instance by ID and optional filter
   * @param {string} id - Assistant identifier
   * @param {function} filter - Optional filter function
   * @returns {object|null} Assistant instance or null if not found
   */
  getInstance(id, filter = null) {
    const entries = Array.from(this.instances.entries());

    for (const [instanceId, data] of entries) {
      if (data.id === id) {
        if (!filter || filter(data.instance, data.config)) {
          return data.instance;
        }
      }
    }

    return null;
  }

  /**
   * Get all instances of a specific assistant type
   * @param {string} id - Assistant identifier
   * @returns {Array} Array of assistant instances
   */
  getAllInstances(id) {
    const instances = [];

    this.instances.forEach((data) => {
      if (data.id === id) {
        instances.push(data.instance);
      }
    });

    return instances;
  }

  /**
   * Destroy an assistant instance
   * @param {object} instance - Assistant instance to destroy
   * @returns {boolean} True if destroyed, false if not found
   */
  destroy(instance) {
    for (const [instanceId, data] of this.instances.entries()) {
      if (data.instance === instance) {
        // Clean up event listeners
        this.cleanupInstanceEvents(instance);

        // Call destroy method if it exists
        if (typeof instance.destroy === "function") {
          instance.destroy();
        }

        this.instances.delete(instanceId);
        console.log(`🗑️ Destroyed assistant instance: ${data.id}`);
        return true;
      }
    }

    return false;
  }

  /**
   * Destroy all instances of a specific assistant type
   * @param {string} id - Assistant identifier
   * @returns {number} Number of instances destroyed
   */
  destroyAll(id) {
    let destroyed = 0;
    const toDestroy = [];

    this.instances.forEach((data, instanceId) => {
      if (data.id === id) {
        toDestroy.push({ instanceId, data });
      }
    });

    toDestroy.forEach(({ instanceId, data }) => {
      this.cleanupInstanceEvents(data.instance);

      if (typeof data.instance.destroy === "function") {
        data.instance.destroy();
      }

      this.instances.delete(instanceId);
      destroyed++;
    });

    if (destroyed > 0) {
      console.log(`🗑️ Destroyed ${destroyed} instances of assistant: ${id}`);
    }

    return destroyed;
  }

  /**
   * Set up event listeners for an assistant instance
   * @param {object} instance - Assistant instance
   * @param {object} config - Assistant configuration
   */
  setupInstanceEvents(instance, config) {
    if (!config.events) return;

    const listeners = [];

    Object.entries(config.events).forEach(([event, handler]) => {
      if (typeof handler === "function" && typeof instance.on === "function") {
        instance.on(event, handler);
        listeners.push({ event, handler });
      }
    });

    if (listeners.length > 0) {
      this.eventListeners.set(instance, listeners);
    }
  }

  /**
   * Clean up event listeners for an assistant instance
   * @param {object} instance - Assistant instance
   */
  cleanupInstanceEvents(instance) {
    const listeners = this.eventListeners.get(instance);

    if (listeners && typeof instance.off === "function") {
      listeners.forEach(({ event, handler }) => {
        instance.off(event, handler);
      });
    }

    this.eventListeners.delete(instance);
  }

  /**
   * Get factory statistics
   * @returns {object} Statistics about created instances
   */
  getStats() {
    const stats = {
      totalInstances: this.instances.size,
      byType: {},
      oldestInstance: null,
      newestInstance: null,
    };

    let oldest = null;
    let newest = null;

    this.instances.forEach((data) => {
      // Count by type
      stats.byType[data.id] = (stats.byType[data.id] || 0) + 1;

      // Track oldest and newest
      if (!oldest || data.createdAt < oldest.createdAt) {
        oldest = data;
      }
      if (!newest || data.createdAt > newest.createdAt) {
        newest = data;
      }
    });

    stats.oldestInstance = oldest;
    stats.newestInstance = newest;

    return stats;
  }

  /**
   * Clean up all instances and event listeners
   */
  cleanup() {
    this.instances.forEach((data) => {
      this.cleanupInstanceEvents(data.instance);

      if (typeof data.instance.destroy === "function") {
        data.instance.destroy();
      }
    });

    this.instances.clear();
    this.eventListeners.clear();

    console.log("🧹 Cleaned up all assistant instances");
  }

  /**
   * Validate creation parameters
   * @param {string} id - Assistant identifier
   * @param {object} params - Creation parameters
   * @returns {object} Validation result
   */
  validateParams(id, params) {
    const errors = [];

    if (!assistantRegistry.isRegistered(id)) {
      errors.push(`Assistant '${id}' is not registered`);
    }

    const config = assistantRegistry.getConfig(id);
    if (config && config.requiredParams) {
      config.requiredParams.forEach((param) => {
        if (!(param in params)) {
          errors.push(`Missing required parameter: ${param}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Create and export a global factory instance
export const assistantFactory = new AssistantFactory();
