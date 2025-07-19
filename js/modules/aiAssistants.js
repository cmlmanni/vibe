/* filepath: /js/modules/aiAssistants.js */
import { getAIResponse } from "../../vibe-app/src/azureOpenAI.js";

export function initializeAIAssistants(domElements, eventLogger, editor) {
  class AIAssistant {
    constructor() {
      this.isGenerating = false;
    }

    // Enhanced formatting function
    formatMessageContent(content) {
      let formatted = content
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Italic text
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        // Inline code
        .replace(
          /`(.*?)`/g,
          '<code class="bg-gray-700 px-1 rounded text-xs font-mono">$1</code>'
        )
        // Numbered lists (1. 2. 3. etc.)
        .replace(
          /^(\d+\.\s+)/gm,
          '<span class="font-semibold text-blue-400">$1</span>'
        )
        // Convert line breaks to HTML
        .replace(/\n/g, "<br>");

      return formatted;
    }

    // Create chat messages with code suggestion capability
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

      // Add the message header (who's speaking)
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
        senderDiv.innerHTML =
          '<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>AI Assistant';

        // Add action buttons for AI messages
        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("flex", "space-x-2");

        // Copy button
        const copyBtn = document.createElement("button");
        copyBtn.innerHTML =
          '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>';
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
          // Show feedback
          copyBtn.classList.add("text-green-500");
          setTimeout(() => copyBtn.classList.remove("text-green-500"), 1000);
        });

        // Regenerate button for AI
        const regenerateBtn = document.createElement("button");
        regenerateBtn.innerHTML =
          '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>';
        regenerateBtn.title = "Regenerate response";
        regenerateBtn.classList.add(
          "text-gray-400",
          "hover:text-white",
          "p-1",
          "rounded"
        );
        regenerateBtn.addEventListener("click", () => {
          // Need to access the last user message
          const userMessages = document.querySelectorAll(".user-message");
          if (userMessages.length > 0) {
            const lastUserMessage = userMessages[userMessages.length - 1];
            const userPrompt = lastUserMessage.querySelector("p").textContent;

            // Remove this AI message
            chatContainer.removeChild(messageDiv);

            // Get a new response
            if (window.currentAI && !window.currentAI.isGenerating) {
              window.currentAI.getSuggestion(userPrompt);
            }
          }
        });

        actionsDiv.appendChild(copyBtn);
        actionsDiv.appendChild(regenerateBtn);
        headerDiv.appendChild(senderDiv);
        headerDiv.appendChild(actionsDiv);
      } else if (sender === "user") {
        senderDiv.innerHTML =
          '<div class="flex items-center"><svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg><span>You</span></div>';
      } else {
        headerDiv.textContent = "System";
      }

      if (sender !== "ai") {
        headerDiv.appendChild(senderDiv);
      }

      messageDiv.appendChild(headerDiv);

      // FIX: Replace the content paragraph section with proper formatting
      const contentDiv = document.createElement("div");
      contentDiv.classList.add("text-sm", "mb-2", "leading-relaxed");

      // Use the enhanced formatting
      contentDiv.innerHTML = this.formatMessageContent(content);
      messageDiv.appendChild(contentDiv);

      // Add code block with "Apply" button if provided
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

        // Create code header with language and action buttons
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

        // Add click handler to apply code to editor
        applyButton.addEventListener("click", () => {
          if (window.editor) {
            window.editor.setValue(codeBlock);
            console.log("Applied code to editor");
          } else {
            console.error("Editor not found");
          }
        });

        // Modify button (insert at cursor)
        const modifyButton = document.createElement("button");
        modifyButton.textContent = "Insert at cursor";
        modifyButton.classList.add(
          "px-2",
          "py-0.5",
          "bg-gray-600",
          "hover:bg-gray-700",
          "rounded",
          "text-xs",
          "text-white"
        );

        modifyButton.addEventListener("click", () => {
          if (window.editor) {
            const cursor = window.editor.getCursor();
            window.editor.replaceRange(codeBlock, cursor);
            console.log("Inserted code at cursor");
          }
        });

        buttonGroup.appendChild(applyButton);
        buttonGroup.appendChild(modifyButton);
        codeHeader.appendChild(buttonGroup);
        codeContainer.appendChild(codeHeader);

        // Add code content with proper formatting
        const codeContent = document.createElement("pre");
        codeContent.classList.add("p-3", "bg-gray-900", "overflow-x-auto");

        const codeText = document.createElement("code");
        codeText.textContent = codeBlock;
        codeText.classList.add("text-xs", "font-mono", "text-gray-300");

        codeContent.appendChild(codeText);
        codeContainer.appendChild(codeContent);

        messageDiv.appendChild(codeContainer);
      }

      // Add message to chat container
      chatContainer.appendChild(messageDiv);

      // Scroll to the new message
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async fetchFromAI(systemPrompt, userPrompt) {
      try {
        this.isGenerating = true;
        this.createChatMessage("Thinking...", "system");

        console.log("Sending to Azure OpenAI:", {
          systemPrompt: systemPrompt.substring(0, 50) + "...",
          userPrompt: userPrompt.substring(0, 50) + "...",
        });

        // Call Azure OpenAI via backend
        const response = await getAIResponse(userPrompt, systemPrompt);
        console.log("AI response received:", response?.substring(0, 100));

        // Remove the "thinking" message
        const chatContainer = domElements.chatContainer;
        if (chatContainer && chatContainer.lastChild) {
          chatContainer.removeChild(chatContainer.lastChild);
        }

        this.isGenerating = false;

        // Check if response is valid
        if (!response || typeof response !== "string") {
          console.error("Invalid response from Azure OpenAI:", response);
          return {
            type: "text",
            content: "Sorry, I received an invalid response. Please try again.",
          };
        }

        // Extract code blocks with improved regex
        const codeMatch = response.match(/```(?:python)?\s*([\s\S]+?)\s*```/);

        if (codeMatch) {
          // If found, return both text and extracted code
          const codeContent = codeMatch[1].trim();

          // Get text outside of code blocks
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

        // If no code blocks, return as text
        return { type: "text", content: response };
      } catch (error) {
        console.error("Error fetching AI response:", error);

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
  }

  class VibecodingAssistant extends AIAssistant {
    constructor() {
      super();
      this.systemPrompt =
        "You are a friendly Python programming assistant specializing in turtle graphics. You can help with coding questions, have casual conversations, and provide guidance on Python turtle library.\n\nWhen users ask coding-related questions, provide helpful Python turtle code solutions. When users make casual remarks like greetings or general comments, respond naturally and conversationally. Only provide code when the user is clearly asking for programming help.\n\nBe helpful, friendly, and adaptive to the user's intent.";
    }

    async getSuggestion(userPrompt) {
      console.log("🚀 VibecodingAssistant processing:", userPrompt);
      if (this.isGenerating) return;
      eventLogger.logEvent("ai_prompt", {
        prompt: userPrompt,
        mode: "vibecoding",
      });
      const response = await this.fetchFromAI(this.systemPrompt, userPrompt);
      eventLogger.logEvent("ai_response", { response });

      // First create the main message
      if (response.type === "code") {
        this.createChatMessage(response.content, "ai", response.code);
      } else if (response.type === "text") {
        this.createChatMessage(response.content, "ai");
      }

      // Then add suggested follow-up actions (Copilot-like behavior)
      this.addSuggestedActions(userPrompt);
    }

    addSuggestedActions(userPrompt) {
      const chatContainer = domElements.chatContainer;
      const lastMessage = chatContainer.lastElementChild;

      if (!lastMessage) return;

      const suggestedActions = document.createElement("div");
      suggestedActions.classList.add("ai-options-container", "mt-2");

      // Create suggested follow-up questions based on the current task
      // Note: We'll need to pass currentTaskIndex from the tutorial module
      let suggestions = [];
      suggestions = ["Explain this code", "Optimize this code", "Add comments"];

      // Add buttons for each suggestion
      suggestions.forEach((suggestion) => {
        const button = document.createElement("button");
        button.textContent = suggestion;
        button.classList.add("ai-option-button");
        button.addEventListener("click", () => {
          // Add the clicked suggestion as a user message
          this.createChatMessage(suggestion, "user");
          // Get AI response for this suggestion
          this.getSuggestion(suggestion);
        });
        suggestedActions.appendChild(button);
      });

      lastMessage.appendChild(suggestedActions);
    }
  }

  class ReflectiveAssistant extends AIAssistant {
    constructor() {
      super();
      this.systemPrompt =
        "You are a friendly Socratic tutor and conversational assistant. You can engage in casual conversation and help users learn Python turtle graphics through guided questions.\n\nWhen users ask programming questions, guide them by asking thoughtful questions to help them discover the solution themselves. When users make casual remarks, greetings, or general comments, respond naturally and conversationally.\n\nYou should NOT write code for them, but instead help them think through problems. Be warm, encouraging, and adaptive to whether they want to chat or learn programming.";
    }

    async getSuggestion(userPrompt) {
      console.log("🤔 ReflectiveAssistant processing:", userPrompt);
      if (this.isGenerating) return;
      eventLogger.logEvent("ai_prompt", {
        prompt: userPrompt,
        mode: "reflective",
      });
      const response = await this.fetchFromAI(this.systemPrompt, userPrompt);
      eventLogger.logEvent("ai_response", { response });
      if (response.type === "text") {
        this.createChatMessage(response.content, "ai");
      } else if (response.type === "code") {
        // Add this line to handle code responses that might come from Azure
        this.createChatMessage(response.content, "ai", response.code);
      }
    }
  }

  // Initialize AI assistants
  const vibecodingAI = new VibecodingAssistant();
  const reflectiveAI = new ReflectiveAssistant();

  // Fix: Initialize currentAI based on the actual select value
  function getCurrentAIFromSelect() {
    const selectedValue = domElements.aiModeSelect?.value || "vibecoding";
    return selectedValue === "vibecoding" ? vibecodingAI : reflectiveAI;
  }

  let currentAI = getCurrentAIFromSelect();

  // Make currentAI accessible globally for UI interaction
  window.currentAI = currentAI;

  function handleGetSuggestion() {
    const userPrompt = domElements.aiPromptInput.value.trim();
    if (!userPrompt || currentAI.isGenerating) return;

    // Clear input
    domElements.aiPromptInput.value = "";

    // Create user message
    currentAI.createChatMessage(userPrompt, "user");

    // Get AI response
    console.log(
      "Sending user input to AI assistant:",
      currentAI.constructor.name,
      userPrompt
    );
    currentAI.getSuggestion(userPrompt);
  }

  function setupEventListeners() {
    // AI suggestion button
    domElements.getAiSuggestionBtn?.addEventListener(
      "click",
      handleGetSuggestion
    );

    // Enter key in AI input
    domElements.aiPromptInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleGetSuggestion();
    });

    // AI mode selection change - FIX: Update currentAI properly
    domElements.aiModeSelect?.addEventListener("change", (e) => {
      const newMode = e.target.value;
      currentAI = newMode === "vibecoding" ? vibecodingAI : reflectiveAI;
      window.currentAI = currentAI; // Update the global reference

      console.log(
        `AI mode changed to: ${newMode} (${currentAI.constructor.name})`
      );
      eventLogger.logEvent("ai_mode_changed", { newMode: newMode });
    });
  }

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
