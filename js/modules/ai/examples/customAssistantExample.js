/* filepath: /js/modules/ai/examples/customAssistantExample.js */

import { AIAssistant } from "../base/aiAssistant.js";
import { assistantRegistry } from "../core/assistantRegistry.js";
import { assistantFactory } from "../core/assistantFactory.js";

/**
 * Example: Creating a Custom Math Tutor Assistant
 * This demonstrates how easy it is to create and register new assistants
 */
export class MathTutorAssistant extends AIAssistant {
  constructor(params) {
    super(params);
  }

  initialize() {
    super.initialize();

    this.mathConcepts = ["algebra", "geometry", "trigonometry", "calculus"];
    this.problemsSolved = [];
    this.difficulty = this.settings.difficulty || "beginner";

    console.log(`🧮 Math Tutor Assistant initialized (${this.assistantId})`);
  }

  async getSuggestion(userPrompt) {
    console.log("🧮 MathTutorAssistant processing:", userPrompt);
    if (this.isGenerating) return;

    this.emit("mathTutoringStarted", { prompt: userPrompt });

    const mathContext = this.detectMathContext(userPrompt);

    this.eventLogger.logEvent("ai_prompt", {
      prompt: userPrompt,
      mode: "math_tutor",
      assistantId: this.assistantId,
      mathContext,
      difficulty: this.difficulty,
      historyLength: this.conversationManager.getHistoryLength(),
    });

    const response = await this.fetchFromAI(userPrompt);

    if (response.type === "code") {
      this.createChatMessage(response.content, "ai", response.code);
      this.trackMathProblem(userPrompt, response.code);
    } else {
      this.createChatMessage(response.content, "ai");
    }

    this.emit("mathTutoringCompleted", { response, prompt: userPrompt });
  }

  detectMathContext(prompt) {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes("circle") || lowerPrompt.includes("radius")) {
      return "geometry_circles";
    } else if (
      lowerPrompt.includes("triangle") ||
      lowerPrompt.includes("angle")
    ) {
      return "geometry_triangles";
    } else if (
      lowerPrompt.includes("pattern") ||
      lowerPrompt.includes("sequence")
    ) {
      return "algebra_patterns";
    }

    return "general_math";
  }

  trackMathProblem(prompt, code) {
    this.problemsSolved.push({
      prompt,
      code,
      timestamp: new Date(),
      difficulty: this.difficulty,
    });
  }

  getStatus() {
    const baseStatus = super.getStatus();
    return {
      ...baseStatus,
      problemsSolved: this.problemsSolved.length,
      difficulty: this.difficulty,
      specializations: [
        "mathematical_concepts",
        "visual_math",
        "turtle_geometry",
      ],
    };
  }
}

/**
 * Example usage: How to register and use the custom assistant
 */
export function demonstrateCustomAssistant() {
  // 1. Define the configuration
  const mathTutorConfig = {
    id: "math_tutor",
    name: "Math Tutor",
    description:
      "Specialized assistant for teaching math concepts through turtle graphics",
    category: "education",
    icon: "🧮",
    capabilities: ["mathematical_concepts", "visual_math", "turtle_geometry"],
    systemPrompt: `You are a math tutor specializing in teaching mathematical concepts through Python turtle graphics. 
    
You help students understand:
- Geometric shapes and their properties
- Mathematical patterns and sequences  
- Trigonometry through visual examples
- Coordinate systems and transformations

Provide clear explanations with visual turtle graphics examples.`,
    settings: {
      difficulty: "beginner",
      includeCodeContext: true,
      visualExamples: true,
    },
    requiredParams: ["eventLogger", "domElements"],
  };

  // 2. Register the assistant
  assistantRegistry.register("math_tutor", MathTutorAssistant, mathTutorConfig);

  // 3. Create an instance (normally done by the system)
  const instance = assistantFactory.create("math_tutor", {
    eventLogger: console, // Mock event logger
    domElements: {}, // Mock DOM elements
  });

  console.log("✅ Custom Math Tutor Assistant registered and created!");
  return instance;
}

/**
 * Example: Advanced custom assistant with plugins
 */
export class AdvancedCodeAnalyzer extends AIAssistant {
  constructor(params) {
    super(params);
    this.plugins = new Map();
  }

  initialize() {
    super.initialize();

    // Load default plugins
    this.loadPlugin("syntax_checker", new SyntaxCheckerPlugin());
    this.loadPlugin("performance_analyzer", new PerformanceAnalyzerPlugin());

    console.log(
      `🔍 Advanced Code Analyzer initialized with ${this.plugins.size} plugins`
    );
  }

  loadPlugin(name, plugin) {
    this.plugins.set(name, plugin);
    plugin.initialize?.(this);
    this.emit("pluginLoaded", { name, plugin });
  }

  async getSuggestion(userPrompt) {
    console.log("🔍 AdvancedCodeAnalyzer processing:", userPrompt);

    // Run plugins before processing
    const pluginResults = await this.runPlugins(userPrompt);

    const enhancedPrompt = this.enhancePromptWithPluginData(
      userPrompt,
      pluginResults
    );
    const response = await this.fetchFromAI(enhancedPrompt);

    this.createChatMessage(response.content, "ai", response.code);
    return response;
  }

  async runPlugins(prompt) {
    const results = {};

    for (const [name, plugin] of this.plugins) {
      if (typeof plugin.analyze === "function") {
        try {
          results[name] = await plugin.analyze(prompt, this);
        } catch (error) {
          console.error(`Plugin ${name} failed:`, error);
        }
      }
    }

    return results;
  }

  enhancePromptWithPluginData(prompt, pluginResults) {
    let enhanced = prompt;

    if (Object.keys(pluginResults).length > 0) {
      enhanced += "\n\nAdditional context from code analysis:\n";
      Object.entries(pluginResults).forEach(([plugin, result]) => {
        enhanced += `${plugin}: ${JSON.stringify(result)}\n`;
      });
    }

    return enhanced;
  }
}

// Example plugin classes
class SyntaxCheckerPlugin {
  analyze(prompt, assistant) {
    // Mock syntax checking
    return { syntaxValid: true, issues: [] };
  }
}

class PerformanceAnalyzerPlugin {
  analyze(prompt, assistant) {
    // Mock performance analysis
    return {
      complexity: "O(n)",
      suggestions: ["Use more efficient algorithms"],
    };
  }
}

/**
 * Example of registering multiple assistants at once
 */
export function registerExampleAssistants() {
  const assistants = [
    {
      id: "math_tutor",
      class: MathTutorAssistant,
      config: {
        name: "Math Tutor",
        description: "Math concepts through turtle graphics",
        category: "education",
        icon: "🧮",
        capabilities: ["mathematical_concepts", "visual_math"],
        systemPrompt: "You are a math tutor...",
        requiredParams: ["eventLogger", "domElements"],
      },
    },
    {
      id: "code_analyzer",
      class: AdvancedCodeAnalyzer,
      config: {
        name: "Code Analyzer",
        description: "Advanced code analysis with plugins",
        category: "development",
        icon: "🔍",
        capabilities: ["code_analysis", "performance_optimization"],
        systemPrompt: "You are an advanced code analyzer...",
        requiredParams: ["eventLogger", "domElements"],
      },
    },
  ];

  const results = assistantRegistry.registerBatch(assistants);
  console.log("📦 Batch registration results:", results);

  return results;
}
