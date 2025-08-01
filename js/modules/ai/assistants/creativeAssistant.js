/* filepath: /js/modules/ai/assistants/creativeAssistant.js */
import { AIAssistant } from "../base/aiAssistant.js";

export class CreativeAssistant extends AIAssistant {
  constructor(params) {
    super(params);
  }

  initialize() {
    super.initialize();

    // Creative assistant-specific initialization
    this.projectIdeas = [];
    this.inspirationSources = [
      "fractals",
      "nature",
      "geometric_patterns",
      "art_movements",
    ];
    this.creativeProjects = [];
    this.complexityLevel = this.settings.creativityLevel || "medium";

    console.log(`🎨 Creative Assistant initialized (${this.assistantId})`);
  }

  async getSuggestion(userPrompt) {
    console.log("🎨 CreativeAssistant processing:", userPrompt);
    if (this.isGenerating) return;

    this.emit("creativeSessionStarted", { prompt: userPrompt });

    // Detect if user is asking for inspiration or project ideas
    const isInspirationRequest = this.detectInspirationRequest(userPrompt);

    this.eventLogger.logEvent("ai_prompt", {
      prompt: userPrompt,
      mode: "creative",
      assistantId: this.assistantId,
      isInspirationRequest,
      complexityLevel: this.complexityLevel,
      historyLength: this.conversationManager.getHistoryLength(),
    });

    const response = await this.fetchFromAI(userPrompt);

    this.eventLogger.logEvent("ai_response", {
      response,
      assistantId: this.assistantId,
      historyLength: this.conversationManager.getHistoryLength(),
    });

    // Track creative projects and ideas
    if (isInspirationRequest || response.type === "code") {
      this.trackCreativeWork(userPrompt, response);
    }

    if (response.type === "code") {
      this.createChatMessage(response.content, "ai", response.code);
      this.emit("creativeCodeGenerated", {
        code: response.code,
        content: response.content,
        prompt: userPrompt,
      });
    } else if (response.type === "text") {
      this.createChatMessage(response.content, "ai");
      this.emit("creativeGuidanceProvided", {
        content: response.content,
        prompt: userPrompt,
      });
    }

    this.emit("creativeSessionCompleted", { response, prompt: userPrompt });
  }

  /**
   * Detect if user is asking for inspiration or creative ideas
   * @param {string} prompt - User prompt
   * @returns {boolean} True if inspiration request detected
   */
  detectInspirationRequest(prompt) {
    const inspirationKeywords = [
      "idea",
      "inspiration",
      "creative",
      "art",
      "design",
      "pattern",
      "project",
      "cool",
      "interesting",
      "beautiful",
      "artistic",
      "suggest",
      "recommend",
      "show me something",
    ];

    const lowerPrompt = prompt.toLowerCase();
    return inspirationKeywords.some((keyword) => lowerPrompt.includes(keyword));
  }

  /**
   * Track creative work and projects
   * @param {string} userPrompt - Original prompt
   * @param {object} response - AI response
   */
  trackCreativeWork(userPrompt, response) {
    const project = {
      prompt: userPrompt,
      response: response.content,
      code: response.code || null,
      category: this.categorizeCreativeWork(userPrompt),
      complexity: this.assessComplexity(response),
      timestamp: new Date(),
    };

    this.creativeProjects.push(project);
    this.emit("creativeWorkTracked", project);
  }

  /**
   * Categorize the type of creative work
   * @param {string} prompt - User prompt
   * @returns {string} Category of creative work
   */
  categorizeCreativeWork(prompt) {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes("fractal") || lowerPrompt.includes("recursive")) {
      return "fractal";
    } else if (
      lowerPrompt.includes("pattern") ||
      lowerPrompt.includes("repeat")
    ) {
      return "pattern";
    } else if (
      lowerPrompt.includes("art") ||
      lowerPrompt.includes("artistic")
    ) {
      return "artistic";
    } else if (
      lowerPrompt.includes("geometric") ||
      lowerPrompt.includes("shape")
    ) {
      return "geometric";
    } else if (
      lowerPrompt.includes("animation") ||
      lowerPrompt.includes("move")
    ) {
      return "animation";
    } else if (
      lowerPrompt.includes("color") ||
      lowerPrompt.includes("rainbow")
    ) {
      return "colorful";
    }

    return "general_creative";
  }

  /**
   * Assess the complexity of a creative work
   * @param {object} response - AI response
   * @returns {string} Complexity level
   */
  assessComplexity(response) {
    if (!response.code) return "simple";

    const code = response.code.toLowerCase();
    const complexityIndicators = {
      simple: ["forward", "right", "left", "circle"],
      medium: ["for", "range", "function", "def"],
      complex: ["class", "import", "math", "random", "nested", "recursive"],
    };

    if (
      complexityIndicators.complex.some((indicator) => code.includes(indicator))
    ) {
      return "complex";
    } else if (
      complexityIndicators.medium.some((indicator) => code.includes(indicator))
    ) {
      return "medium";
    }

    return "simple";
  }

  /**
   * Generate a random creative prompt for inspiration
   * @returns {string} Creative prompt suggestion
   */
  generateRandomPrompt() {
    const subjects = ["spiral", "flower", "tree", "mandala", "star", "wave"];
    const styles = [
      "geometric",
      "organic",
      "abstract",
      "colorful",
      "minimalist",
    ];
    const techniques = [
      "using loops",
      "with random colors",
      "in a spiral pattern",
      "with mathematical precision",
    ];

    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const technique = techniques[Math.floor(Math.random() * techniques.length)];

    return `Create a ${style} ${subject} ${technique}`;
  }

  /**
   * Get creative project statistics
   * @returns {object} Creative project statistics
   */
  getCreativeStats() {
    const categories = {};
    const complexities = {};

    this.creativeProjects.forEach((project) => {
      categories[project.category] = (categories[project.category] || 0) + 1;
      complexities[project.complexity] =
        (complexities[project.complexity] || 0) + 1;
    });

    return {
      totalProjects: this.creativeProjects.length,
      categoriesExplored: categories,
      complexityLevels: complexities,
      recentProjects: this.creativeProjects.slice(-3),
    };
  }

  /**
   * Set creativity complexity level
   * @param {string} level - 'simple', 'medium', or 'complex'
   */
  setComplexityLevel(level) {
    if (["simple", "medium", "complex"].includes(level)) {
      this.complexityLevel = level;
      this.updateSettings({ creativityLevel: level });
      this.emit("complexityLevelChanged", { level });
    }
  }

  /**
   * Get assistant-specific status
   * @returns {object} Enhanced status information
   */
  getStatus() {
    const baseStatus = super.getStatus();
    const creativeStats = this.getCreativeStats();

    return {
      ...baseStatus,
      creativeStats,
      complexityLevel: this.complexityLevel,
      specializations: [
        "creative_inspiration",
        "artistic_guidance",
        "project_ideas",
      ],
    };
  }

  /**
   * Clear creative project history
   */
  clearCreativeHistory() {
    this.creativeProjects = [];
    this.projectIdeas = [];
    this.emit("creativeHistoryCleared");
  }
}
