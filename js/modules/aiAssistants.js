/* filepath: /js/modules/aiAssistants.js */
import { getAIResponse } from "../../vibe-app/src/azureOpenAI.js";

export function initializeAIAssistants(
  domElements,
  eventLogger,
  editor,
  experimentConfig
) {
  class AIAssistant {
    constructor() {
      this.isGenerating = false;
      this.conversationHistory = []; // Store conversation history
      this.maxHistoryLength = 20; // Limit history to prevent token overflow
    }

    // Add message to conversation history
    addToHistory(role, content) {
      this.conversationHistory.push({
        role: role,
        content: content,
        timestamp: new Date().toISOString(),
      });

      // Keep only recent messages to manage token limits
      if (this.conversationHistory.length > this.maxHistoryLength) {
        // Keep system message (first) and remove oldest user/assistant messages
        const systemMessages = this.conversationHistory.filter(
          (msg) => msg.role === "system"
        );
        const otherMessages = this.conversationHistory.filter(
          (msg) => msg.role !== "system"
        );
        const recentMessages = otherMessages.slice(
          -this.maxHistoryLength + systemMessages.length
        );
        this.conversationHistory = [...systemMessages, ...recentMessages];
      }

      console.log(`Added to history: ${role} - ${content.substring(0, 50)}...`);
    }

    // Get conversation history for API call
    getConversationForAPI() {
      return this.conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
    }

    // Clear conversation history
    clearHistory() {
      const systemMessage = this.conversationHistory.find(
        (msg) => msg.role === "system"
      );
      this.conversationHistory = systemMessage ? [systemMessage] : [];
      console.log("Conversation history cleared");
      eventLogger.logEvent("conversation_cleared", {
        assistant: this.constructor.name,
      });
    }

    // ONLY ONE fetchFromAI method with conversation history
    async fetchFromAI(userPrompt, includeCodeContext = true) {
      try {
        this.isGenerating = true;

        // Show thinking message
        this.createChatMessage("Thinking...", "system");

        // Add current user message to history
        let contextualPrompt = userPrompt;

        // Include current code context if requested
        if (includeCodeContext && window.editor) {
          const currentCode = window.editor.getValue();
          if (currentCode.trim() !== "import turtle\n\n# Your code here") {
            contextualPrompt = `Current code in editor:\n\`\`\`python\n${currentCode}\n\`\`\`\n\nUser question: ${userPrompt}`;
          }
        }

        this.addToHistory("user", contextualPrompt);

        console.log("Sending conversation history to AI:", {
          historyLength: this.conversationHistory.length,
          systemPrompt: this.systemPrompt?.substring(0, 50) + "...",
          userPrompt: userPrompt.substring(0, 100) + "...",
        });

        // Call Azure OpenAI with full conversation history
        const response = await getAIResponse(
          this.getConversationForAPI(), // Send full conversation as first parameter
          this.systemPrompt // System prompt as second parameter
        );

        // Remove thinking message
        const chatContainer = domElements.chatContainer;
        if (chatContainer && chatContainer.lastChild) {
          chatContainer.removeChild(chatContainer.lastChild);
        }

        this.isGenerating = false;

        if (!response || typeof response !== "string") {
          console.error("Invalid response from AI:", response);
          return {
            type: "text",
            content: "Sorry, I received an invalid response. Please try again.",
          };
        }

        // Add AI response to history
        this.addToHistory("assistant", response);

        // Extract code blocks
        const codeMatch = response.match(/```(?:python)?\s*([\s\S]+?)\s*```/);

        if (codeMatch) {
          const codeContent = codeMatch[1].trim();
          let textContent = response
            .replace(/```(?:python)?\s*[\s\S]+?\s*```/, "")
            .trim();

          if (!textContent) {
            textContent = "Here's a code suggestion:";
          }

          console.log("Extracted code:", codeContent.substring(0, 50) + "...");
          console.log("Extracted text:", textContent.substring(0, 50) + "...");

          return {
            type: "code",
            content: textContent,
            code: codeContent,
          };
        }

        return { type: "text", content: response };
      } catch (error) {
        console.error("Error fetching AI response:", error);

        // Remove thinking message
        const chatContainer = domElements.chatContainer;
        if (chatContainer && chatContainer.lastChild) {
          chatContainer.removeChild(chatContainer.lastChild);
        }

        this.isGenerating = false;
        return {
          type: "text",
          content: `Error: ${error.message || "Failed to get AI response"}`,
        };
      }
    }

    // Create chat messages method (keep as is)
    createChatMessage(content, sender, codeBlock = null) {
      const chatContainer = domElements.chatContainer;

      const messageDiv = document.createElement("div");
      messageDiv.classList.add(
        "chat-message",
        `${sender}-message`,
        "mb-4",
        "p-3",
        "rounded"
      );

      // Add timestamp for better conversation tracking
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Add the message header
      const headerDiv = document.createElement("div");
      headerDiv.classList.add(
        "mb-1",
        "text-xs",
        "font-semibold",
        "flex",
        "items-center",
        "justify-between"
      );

      const senderDiv = document.createElement("div");
      senderDiv.classList.add("flex", "items-center");

      if (sender === "ai") {
        senderDiv.innerHTML = `
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>AI Assistant`;

        // Add action buttons for AI messages
        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("flex", "space-x-2");

        // Copy button
        const copyBtn = document.createElement("button");
        copyBtn.innerHTML = `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
        copyBtn.title = "Copy to clipboard";
        copyBtn.classList.add(
          "text-gray-400",
          "hover:text-white",
          "p-1",
          "rounded"
        );
        copyBtn.addEventListener("click", () => {
          const textToCopy = codeBlock || content;
          navigator.clipboard.writeText(textToCopy);
          copyBtn.classList.add("text-green-500");
          setTimeout(() => copyBtn.classList.remove("text-green-500"), 1000);
        });

        // Clear conversation button
        const clearBtn = document.createElement("button");
        clearBtn.innerHTML = `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;
        clearBtn.title = "Clear conversation";
        clearBtn.classList.add(
          "text-gray-400",
          "hover:text-red-400",
          "p-1",
          "rounded"
        );
        clearBtn.addEventListener("click", () => {
          if (
            confirm(
              "Clear conversation history? This will start a fresh conversation."
            )
          ) {
            this.clearHistory();
            chatContainer.innerHTML = ""; // Clear visual chat
            chatContainer.innerHTML =
              '<div class="text-center text-gray-500 text-xs py-4">Conversation cleared. Start a new conversation!</div>';
          }
        });

        actionsDiv.appendChild(copyBtn);
        actionsDiv.appendChild(clearBtn);
        headerDiv.appendChild(senderDiv);
        headerDiv.appendChild(actionsDiv);
      } else if (sender === "user") {
        senderDiv.innerHTML = `
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span>You</span>
            <span class="ml-2 text-gray-500">${timestamp}</span>
          </div>`;
      } else {
        senderDiv.textContent = "System";
      }

      if (sender !== "ai") {
        headerDiv.appendChild(senderDiv);
      }

      messageDiv.appendChild(headerDiv);

      // Add formatted content
      const contentDiv = document.createElement("div");
      contentDiv.classList.add("text-sm", "mb-2", "leading-relaxed");

      const formattedContent = content
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(
          /`(.*?)`/g,
          '<code class="bg-gray-700 px-1 rounded text-xs font-mono">$1</code>'
        )
        .replace(/\n/g, "<br>");

      contentDiv.innerHTML = formattedContent;
      messageDiv.appendChild(contentDiv);

      // Add code block if provided
      if (codeBlock && sender === "ai") {
        const codeContainer = document.createElement("div");
        codeContainer.classList.add(
          "code-suggestion",
          "mt-2",
          "rounded",
          "overflow-hidden",
          "border",
          "border-gray-700"
        );

        const codeHeader = document.createElement("div");
        codeHeader.classList.add(
          "bg-gray-800",
          "px-3",
          "py-1",
          "flex",
          "justify-between",
          "items-center"
        );

        const langSpan = document.createElement("span");
        langSpan.textContent = "python";
        langSpan.classList.add("text-xs", "font-mono", "text-gray-400");
        codeHeader.appendChild(langSpan);

        const buttonGroup = document.createElement("div");
        buttonGroup.classList.add("flex", "gap-1");

        // Apply button
        const applyButton = document.createElement("button");
        applyButton.textContent = "Insert";
        applyButton.classList.add(
          "px-2",
          "py-0.5",
          "bg-[var(--blue-accent)]",
          "hover:bg-opacity-80",
          "rounded",
          "text-xs",
          "text-white"
        );

        applyButton.addEventListener("click", () => {
          if (window.editor) {
            window.editor.setValue(codeBlock);
            console.log("Applied code to editor");
            // Add to history that code was applied
            this.addToHistory(
              "system",
              `User applied suggested code: ${codeBlock.substring(0, 100)}...`
            );
          }
        });

        // Insert at cursor button
        const insertButton = document.createElement("button");
        insertButton.textContent = "Insert at Cursor";
        insertButton.classList.add(
          "px-2",
          "py-0.5",
          "bg-gray-600",
          "hover:bg-gray-700",
          "rounded",
          "text-xs",
          "text-white"
        );

        insertButton.addEventListener("click", () => {
          if (window.editor) {
            const cursor = window.editor.getCursor();
            window.editor.replaceRange(codeBlock, cursor);
            console.log("Inserted code at cursor");
            this.addToHistory(
              "system",
              `User inserted suggested code at cursor: ${codeBlock.substring(
                0,
                100
              )}...`
            );
          }
        });

        buttonGroup.appendChild(applyButton);
        buttonGroup.appendChild(insertButton);
        codeHeader.appendChild(buttonGroup);
        codeContainer.appendChild(codeHeader);

        const codeContent = document.createElement("pre");
        codeContent.classList.add("p-3", "bg-gray-900", "overflow-x-auto");

        const codeText = document.createElement("code");
        codeText.textContent = codeBlock;
        codeText.classList.add("text-xs", "font-mono", "text-gray-300");

        codeContent.appendChild(codeText);
        codeContainer.appendChild(codeContent);
        messageDiv.appendChild(codeContainer);
      }

      chatContainer.appendChild(messageDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  class VibecodingAssistant extends AIAssistant {
    constructor() {
      super();
      this.systemPrompt = `You are a friendly Python programming assistant specializing in turtle graphics. You maintain context from our previous conversation to provide better help.

Key capabilities:
- Remember what we've discussed before
- Provide Python turtle graphics solutions
- Have casual conversations
- Build upon previous suggestions and code
- Reference earlier parts of our conversation when relevant

Be helpful, friendly, and contextually aware of our ongoing conversation.`;

      // Add system message to conversation history
      this.addToHistory("system", this.systemPrompt);
    }

    async getSuggestion(userPrompt) {
      console.log("🚀 VibecodingAssistant processing:", userPrompt);
      if (this.isGenerating) return;

      eventLogger.logEvent("ai_prompt", {
        prompt: userPrompt,
        mode: "vibecoding",
        historyLength: this.conversationHistory.length,
      });

      // Call the conversation history version of fetchFromAI
      const response = await this.fetchFromAI(userPrompt);

      eventLogger.logEvent("ai_response", {
        response,
        historyLength: this.conversationHistory.length,
      });

      if (response.type === "code") {
        this.createChatMessage(response.content, "ai", response.code);
      } else if (response.type === "text") {
        this.createChatMessage(response.content, "ai");
      }
    }
  }

  class ReflectiveAssistant extends AIAssistant {
    constructor() {
      super();
      this.systemPrompt = `You are a friendly Socratic tutor specializing in Python turtle graphics. You maintain conversation context to guide learning effectively.

Key capabilities:
- Remember our previous discussions and learning progress
- Guide through thoughtful questions rather than giving direct answers
- Reference what we've covered before
- Build upon previous learning moments
- Encourage discovery and understanding

You should NOT write code for users, but guide them to discover solutions themselves while maintaining awareness of our conversation history.`;

      // Add system message to conversation history
      this.addToHistory("system", this.systemPrompt);
    }

    async getSuggestion(userPrompt) {
      console.log("🤔 ReflectiveAssistant processing:", userPrompt);
      if (this.isGenerating) return;

      eventLogger.logEvent("ai_prompt", {
        prompt: userPrompt,
        mode: "reflective",
        historyLength: this.conversationHistory.length,
      });

      // Call the conversation history version of fetchFromAI
      const response = await this.fetchFromAI(userPrompt);

      eventLogger.logEvent("ai_response", {
        response,
        historyLength: this.conversationHistory.length,
      });

      if (response.type === "text") {
        this.createChatMessage(response.content, "ai");
      } else if (response.type === "code") {
        this.createChatMessage(response.content, "ai", response.code);
      }
    }
  }

  // Initialize AI assistants
  const vibecodingAI = new VibecodingAssistant();
  const reflectiveAI = new ReflectiveAssistant();

  // Initialize currentAI based on the experimental condition
  function getCurrentAIFromSelection() {
    const selectedAssistant = domElements.aiModeSelect?.value || "assistant-a";
    const aiType = experimentConfig.getAITypeForAssistant(selectedAssistant);
    return aiType === "vibecoding" ? vibecodingAI : reflectiveAI;
  }

  let currentAI = getCurrentAIFromSelection();
  window.currentAI = currentAI;

  function handleGetSuggestion() {
    const userPrompt = domElements.aiPromptInput.value.trim();
    if (!userPrompt || currentAI.isGenerating) return;

    domElements.aiPromptInput.value = "";
    currentAI.createChatMessage(userPrompt, "user");

    // Log which assistant was used (A or B) and which AI type it maps to
    const selectedAssistant = domElements.aiModeSelect?.value;
    const aiType = experimentConfig.getAITypeForAssistant(selectedAssistant);

    console.log(`Using ${selectedAssistant} (${aiType}):`, userPrompt);

    // Enhanced logging for experimental data
    eventLogger.logEvent("ai_prompt", {
      prompt: userPrompt,
      assistant_label: selectedAssistant, // "assistant-a" or "assistant-b"
      actual_ai_type: aiType, // "vibecoding" or "reflective"
      condition: experimentConfig.getCurrentConditionInfo(),
      historyLength: currentAI.conversationHistory.length,
    });

    currentAI.getSuggestion(userPrompt);
  }

  function setupEventListeners() {
    domElements.getAiSuggestionBtn?.addEventListener(
      "click",
      handleGetSuggestion
    );

    domElements.aiPromptInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleGetSuggestion();
    });

    // AI mode selection change - now handles experimental conditions
    domElements.aiModeSelect?.addEventListener("change", (e) => {
      const selectedAssistant = e.target.value;
      const aiType = experimentConfig.getAITypeForAssistant(selectedAssistant);

      currentAI = aiType === "vibecoding" ? vibecodingAI : reflectiveAI;
      window.currentAI = currentAI;

      console.log(`AI switched to ${selectedAssistant} (${aiType})`);

      // Enhanced logging for experimental data
      eventLogger.logEvent("ai_mode_changed", {
        assistant_label: selectedAssistant,
        actual_ai_type: aiType,
        condition: experimentConfig.getCurrentConditionInfo(),
      });
    });
  }

  // Log initial experimental setup
  eventLogger.logEvent("experiment_initialized", {
    condition: experimentConfig.getCurrentConditionInfo(),
    initial_assistant: domElements.aiModeSelect?.value || "assistant-a",
    initial_ai_type: experimentConfig.getAITypeForAssistant(
      domElements.aiModeSelect?.value || "assistant-a"
    ),
  });

  console.log("AI assistants initialized");
  console.log(
    "Initial AI mode:",
    domElements.aiModeSelect?.value || "vibecoding"
  );
  console.log("Current AI:", currentAI.constructor.name);

  return {
    handleGetSuggestion,
    setupEventListeners,
    vibecodingAI,
    reflectiveAI,
    get currentAI() {
      return currentAI;
    }, // Use getter to always return current value
  };
}
