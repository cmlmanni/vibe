# Modular AI Assistant System

A flexible, extensible architecture for managing AI assistants in the Vibe application. This system makes it easy to add new AI assistants, configure their behavior, and manage multiple assistant types.

## 🚀 Key Features

- **Plugin Architecture**: Easy registration and management of AI assistants
- **Configuration-driven**: Define assistants through simple configuration objects
- **Event System**: Rich event emission for tracking and extending functionality
- **Factory Pattern**: Streamlined creation and lifecycle management
- **Backward Compatible**: Works with existing code while adding new capabilities
- **Type Safety**: Clear interfaces and validation for robust development

## 📁 Architecture Overview

```
js/modules/ai/
├── core/
│   ├── assistantRegistry.js    # Central registry for assistant types
│   └── assistantFactory.js     # Factory for creating instances
├── config/
│   └── assistantConfigs.js     # Configuration definitions
├── base/
│   └── aiAssistant.js          # Enhanced base class
├── assistants/
│   ├── vibecodingAssistant.js  # Updated for modular system
│   ├── reflectiveAssistant.js  # Updated for modular system
│   ├── debuggingAssistant.js   # New debugging specialist
│   └── creativeAssistant.js    # New creative coding assistant
├── examples/
│   └── customAssistantExample.js # Examples of custom assistants
├── modularIndex.js             # New modular system entry point
└── index.js                    # Original system (still works)
```

## 🛠️ Quick Start

### 1. Using the New System

```javascript
import { initializeModularAI } from "./js/modules/ai/modularIndex.js";

// Initialize with automatic setup
const aiSystem = await initializeModularAI({
  domElements,
  eventLogger,
  experimentConfig,
  autoRegisterDefaults: true, // Registers vibecoding, reflective, debugging, creative
});

// Access any assistant
const vibecodingAI = aiSystem.getAssistant("vibecoding");
const debuggingAI = aiSystem.getAssistant("debugging");
const creativeAI = aiSystem.getAssistant("creative");
```

### 2. Backward Compatibility

```javascript
import { createCompatibleInterface } from "./js/modules/ai/modularIndex.js";

// Works exactly like the old system
const aiInterface = await createCompatibleInterface(
  domElements,
  eventLogger,
  editor,
  experimentConfig
);

// Old interface still works
const { vibecodingAI, reflectiveAI, currentAI } = aiInterface;

// But now you also get new features
const stats = aiInterface.getStats();
const debuggingAI = aiInterface.getAssistant("debugging");
```

## 🎯 Creating Custom Assistants

### 1. Simple Custom Assistant

```javascript
import { AIAssistant } from "./js/modules/ai/base/aiAssistant.js";

export class MyCustomAssistant extends AIAssistant {
  constructor(params) {
    super(params);
  }

  initialize() {
    super.initialize();
    // Custom initialization
    console.log(`🎨 Custom assistant initialized: ${this.assistantId}`);
  }

  async getSuggestion(userPrompt) {
    console.log("Processing with custom logic:", userPrompt);

    // Custom processing logic
    const response = await this.fetchFromAI(userPrompt);

    // Handle response
    if (response.type === "code") {
      this.createChatMessage(response.content, "ai", response.code);
    } else {
      this.createChatMessage(response.content, "ai");
    }

    // Emit custom events
    this.emit("customProcessingComplete", { prompt: userPrompt, response });
  }
}
```

### 2. Register and Use

```javascript
import { assistantRegistry } from "./js/modules/ai/core/assistantRegistry.js";

// Register the assistant
assistantRegistry.register("my_custom", MyCustomAssistant, {
  id: "my_custom",
  name: "My Custom Assistant",
  description: "A specialized assistant for my use case",
  category: "specialized",
  icon: "🎯",
  capabilities: ["custom_feature", "specialized_processing"],
  systemPrompt: "You are a specialized assistant...",
  settings: {
    customSetting: true,
    complexity: "advanced",
  },
});

// Create and use
const customAI = assistantFactory.create("my_custom", {
  eventLogger,
  domElements,
});
```

## 📋 Available Assistants

### Built-in Assistants

| ID           | Name                      | Icon | Specialization                    | Capabilities                                                      |
| ------------ | ------------------------- | ---- | --------------------------------- | ----------------------------------------------------------------- |
| `vibecoding` | VibeCoding Assistant      | 🚀   | Python turtle graphics coding     | `code_generation`, `context_awareness`, `turtle_graphics`         |
| `reflective` | Reflective Tutor          | 🤔   | Socratic learning guidance        | `socratic_method`, `guided_learning`, `educational_guidance`      |
| `debugging`  | Debug Helper              | 🐛   | Code debugging and error analysis | `error_analysis`, `code_debugging`, `step_by_step_guidance`       |
| `creative`   | Creative Coding Assistant | 🎨   | Artistic and creative projects    | `creative_inspiration`, `artistic_guidance`, `pattern_generation` |

### Assistant Categories

- **coding**: Programming and development assistants
- **education**: Learning and tutorial assistants
- **debugging**: Error analysis and troubleshooting
- **creative**: Artistic and creative project helpers
- **specialized**: Domain-specific assistants

## 🎛️ Configuration System

### Assistant Configuration Schema

```javascript
const assistantConfig = {
  id: "unique_identifier", // Required: unique ID
  name: "Display Name", // Required: human-readable name
  description: "Assistant description", // Required: what it does
  category: "category_name", // Optional: for organization
  icon: "🤖", // Optional: display icon
  version: "1.0.0", // Optional: version tracking

  capabilities: [
    // Optional: what it can do
    "capability_1",
    "capability_2",
  ],

  systemPrompt: "You are...", // Required: AI behavior definition

  settings: {
    // Optional: default settings
    settingName: "value",
    includeCodeContext: true,
  },

  events: {
    // Optional: event handlers
    initialized: (data) => console.log("Ready!"),
    responseGenerated: (data) => console.log("Response ready"),
  },

  requiredParams: [
    // Optional: required constructor params
    "eventLogger",
    "domElements",
  ],
};
```

## 🔧 Registry and Factory API

### Assistant Registry

```javascript
import { assistantRegistry } from "./js/modules/ai/core/assistantRegistry.js";

// Register new assistant
assistantRegistry.register(id, AssistantClass, config);

// Check if registered
assistantRegistry.isRegistered("assistant_id");

// Get assistant class
const AssistantClass = assistantRegistry.getAssistant("assistant_id");

// Get configuration
const config = assistantRegistry.getConfig("assistant_id");

// Get all assistants
const allAssistants = assistantRegistry.getAllAssistants();

// Get by category/capability
const codingAssistants = assistantRegistry.getByCategory("coding");
const debuggers = assistantRegistry.getByCapability("error_analysis");

// Get statistics
const stats = assistantRegistry.getStats();
```

### Assistant Factory

```javascript
import { assistantFactory } from "./js/modules/ai/core/assistantFactory.js";

// Create instance
const assistant = assistantFactory.create("assistant_id", {
  eventLogger,
  domElements,
});

// Create multiple
const assistants = assistantFactory.createBatch([
  { id: "vibecoding", params: { eventLogger, domElements } },
  { id: "debugging", params: { eventLogger, domElements } },
]);

// Get existing instance
const existing = assistantFactory.getInstance("assistant_id");

// Destroy instance
assistantFactory.destroy(assistant);

// Get statistics
const stats = assistantFactory.getStats();
```

## 📊 Events and Monitoring

### Standard Events

All assistants emit these events:

- `initialized` - When assistant is ready
- `suggestionStarted` - When processing begins
- `suggestionCompleted` - When processing finishes
- `settingsUpdated` - When settings change
- `destroyed` - When assistant is destroyed

### Custom Events

Assistants can emit custom events:

```javascript
// In your assistant
this.emit("customEvent", { data: "value" });

// Listen for events
assistant.on("customEvent", (event) => {
  console.log("Custom event:", event.detail);
});
```

### System Monitoring

```javascript
// Get comprehensive system stats
const stats = aiSystem.getSystemStats();

// Monitor specific assistant
const assistantStatus = assistant.getStatus();

// Track usage patterns
assistant.on("suggestionCompleted", (event) => {
  analytics.track("ai_suggestion", event.detail);
});
```

## 🔄 Migration Guide

### From Old System

**Old way:**

```javascript
import { initializeAIAssistants } from "./js/modules/ai/index.js";

const { vibecodingAI, reflectiveAI, currentAI } = initializeAIAssistants(
  domElements,
  eventLogger,
  editor,
  experimentConfig
);
```

**New way (compatible):**

```javascript
import { createCompatibleInterface } from "./js/modules/ai/modularIndex.js";

const aiInterface = await createCompatibleInterface(
  domElements,
  eventLogger,
  editor,
  experimentConfig
);

// Same interface, enhanced capabilities
const { vibecodingAI, reflectiveAI, currentAI } = aiInterface;
```

**New way (full features):**

```javascript
import { initializeModularAI } from "./js/modules/ai/modularIndex.js";

const aiSystem = await initializeModularAI({
  domElements,
  eventLogger,
  experimentConfig,
});

// Enhanced capabilities
const debuggingAI = aiSystem.getAssistant("debugging");
const allStats = aiSystem.getSystemStats();
```

## 🚀 Advanced Features

### Plugin System Example

```javascript
export class PluginAssistant extends AIAssistant {
  constructor(params) {
    super(params);
    this.plugins = new Map();
  }

  loadPlugin(name, plugin) {
    this.plugins.set(name, plugin);
    plugin.initialize?.(this);
  }

  async getSuggestion(userPrompt) {
    // Run plugins
    const pluginResults = await this.runPlugins(userPrompt);

    // Enhanced processing with plugin data
    const enhancedPrompt = this.enhancePrompt(userPrompt, pluginResults);
    return await this.fetchFromAI(enhancedPrompt);
  }
}
```

### Dynamic Assistant Loading

```javascript
// Register assistants at runtime
async function loadCustomAssistants() {
  const customAssistants = await import("./customAssistants.js");

  Object.entries(customAssistants).forEach(([name, config]) => {
    assistantRegistry.register(name, config.class, config.settings);
  });

  // Update UI
  aiSystem.updateUI();
}
```

## 🧪 Testing and Development

### Testing Custom Assistants

```javascript
import { assistantFactory } from "./js/modules/ai/core/assistantFactory.js";

// Mock dependencies
const mockLogger = { logEvent: jest.fn() };
const mockDOM = { aiPromptInput: { value: "" } };

// Test assistant creation
const assistant = assistantFactory.create("test_assistant", {
  eventLogger: mockLogger,
  domElements: mockDOM,
});

// Test functionality
await assistant.getSuggestion("test prompt");
expect(mockLogger.logEvent).toHaveBeenCalled();
```

### Development Tips

1. **Use Configuration**: Define behavior in config objects rather than hard-coding
2. **Emit Events**: Make your assistants observable for better integration
3. **Handle Errors**: Implement proper error handling and recovery
4. **Test Incrementally**: Test individual components before system integration
5. **Monitor Performance**: Use the built-in statistics to track performance

## 📚 Examples

See `js/modules/ai/examples/customAssistantExample.js` for comprehensive examples including:

- Basic custom assistant creation
- Advanced plugin systems
- Batch registration
- Event handling
- Configuration patterns

---

This modular system provides a robust foundation for AI assistant management while maintaining simplicity for common use cases. The architecture is designed to grow with your needs while keeping the codebase clean and maintainable.
