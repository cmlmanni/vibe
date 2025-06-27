import { getAIResponse } from "../vibe-app/src/azureOpenAI.js";

// Ensure your CodeMirror editor is properly initialized and accessible
let editor; // This should be defined in your main script

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM ELEMENTS ---
  const codeEditorTextArea = document.getElementById("code-editor-area");
  const runBtn = document.getElementById("run-btn");
  const resetBtn = document.getElementById("reset-btn");
  const aiModeSelect = document.getElementById("ai-mode-select");
  const getAiSuggestionBtn = document.getElementById("get-ai-suggestion-btn");
  const aiPromptInput = document.getElementById("ai-prompt-input");
  const chatContainer = document.getElementById("chat-container");
  const turtleContainer = document.getElementById("turtle-container");
  const terminalOutput = document.getElementById("terminal");
  const taskTitle = document.getElementById("task-title");
  const stepText = document.getElementById("step-text");
  const prevTaskBtn = document.getElementById("prev-task-btn");
  const nextTaskBtn = document.getElementById("next-task-btn");
  const prevSubstepBtn = document.getElementById("prev-substep-btn");
  const nextSubstepBtn = document.getElementById("next-substep-btn");
  const saveLogBtn = document.getElementById("save-log-btn");

  // --- CODEMIRROR SETUP --- (ONLY ONE INSTANCE)
  const codeMirrorEditor = CodeMirror.fromTextArea(codeEditorTextArea, {
    mode: { name: "python", version: 3, singleLineStringErrors: false },
    lineNumbers: true,
    indentUnit: 4,
    theme: "dracula",
  });

  // Make it accessible globally
  window.editor = codeMirrorEditor;

  // Set default code with speed control example
  codeMirrorEditor.setValue(`import turtle

# Your code here`);

  // --- EVENT LOGGING SYSTEM ---
  let eventLog = [];
  let participantId = `P${String(Date.now()).slice(-4)}`; // Simple unique ID for the session

  function logEvent(eventType, details = {}) {
    const event = {
      participantId: participantId,
      timestamp: new Date().toISOString(),
      eventType: eventType,
      details: {
        ...details,
        currentTask: tutorialTasks[currentTaskIndex].title,
        currentStep: currentStepIndex + 1,
        currentAIMode: aiModeSelect.value,
      },
    };
    eventLog.push(event);
    console.log(event); // Log to console for real-time viewing by the researcher
  }

  function saveLogToFile() {
    logEvent("save_log_manually");
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(eventLog, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `session_log_${participantId}.json`
    );
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  // --- TUTORIAL LOGIC ---
  const tutorialTasks = [
    {
      title: "Task 1: Draw a Square",
      completed: false,
      steps: [
        "First, you need to tell Python that you want to use the turtle graphics library. Use the `import` keyword to bring in the `turtle` module.",
        "Now, create an instance of a Turtle. A common convention is to name your turtle variable `t` or `my_turtle`.",
        "To draw the four sides of a square, you need to repeat actions. Use a `for` loop with `range(4)` to do this.",
        "Inside the loop, tell your turtle to move forward by 100 pixels. The command for this is `turtle.forward(100)`.",
        "After drawing a side, you need to turn. Turn your turtle right by 90 degrees. The command for this is `turtle.right(90)`.",
      ],
    },
    {
      title: "Task 2: Draw a Dashed Line",
      completed: false,
      steps: [
        "Just like before, you need to `import` the `turtle` module to get started.",
        "Create a turtle object to follow your commands.",
        "To create a dashed line with 5 segments, you'll need a loop. Use a `for` loop with `range(5)`.",
        "Inside the loop, draw the first part of the dash by moving the turtle forward by 20 pixels.",
        "To create the gap in the line, lift the turtle's pen off the canvas using `turtle.penup()`.",
        "Move the turtle forward by another 10 pixels. Since the pen is up, this will create a gap.",
        "Finally, put the turtle's pen back down with `turtle.pendown()` so it's ready to draw the next dash in the loop.",
      ],
    },
  ];
  let currentTaskIndex = 0;
  let currentStepIndex = 0;

  function loadTaskAndStep(taskIdx, stepIdx) {
    if (taskIdx < 0 || taskIdx >= tutorialTasks.length) return;

    // Check if trying to access a locked task
    if (taskIdx > 0 && !tutorialTasks[taskIdx - 1].completed) {
      alert(
        `Please complete ${
          tutorialTasks[taskIdx - 1].title
        } before proceeding to the next task.`
      );
      return;
    }

    currentTaskIndex = taskIdx;
    const task = tutorialTasks[currentTaskIndex];
    taskTitle.textContent = task.completed ? `${task.title} ✅` : task.title;

    loadStep(stepIdx);

    updateNavigationButtons();
    logEvent("task_loaded", { taskIndex: taskIdx });
  }

  function updateNavigationButtons() {
    // Previous task button
    prevTaskBtn.disabled = currentTaskIndex === 0;

    // Next task button logic
    const isLastTask = currentTaskIndex === tutorialTasks.length - 1;
    const currentTaskCompleted = tutorialTasks[currentTaskIndex].completed;

    // For tasks beyond the first, also check if previous task is completed
    let canProceed = true;
    if (currentTaskIndex < tutorialTasks.length - 1) {
      canProceed = currentTaskCompleted;
    }

    nextTaskBtn.disabled = isLastTask || !canProceed;

    // Update button text and styling based on completion status
    if (!canProceed && !isLastTask) {
      nextTaskBtn.textContent = "Complete Current Task First";
      nextTaskBtn.classList.add("opacity-50", "cursor-not-allowed");
    } else if (isLastTask) {
      nextTaskBtn.textContent = "Last Task";
      nextTaskBtn.classList.add("opacity-50", "cursor-not-allowed");
    } else {
      nextTaskBtn.textContent = "Next Task";
      nextTaskBtn.classList.remove("opacity-50", "cursor-not-allowed");
    }
  }

  function loadStep(stepIdx) {
    const task = tutorialTasks[currentTaskIndex];
    if (stepIdx < 0 || stepIdx >= task.steps.length) return;
    currentStepIndex = stepIdx;
    stepText.textContent = `(${stepIdx + 1}/${task.steps.length}) ${
      task.steps[stepIdx]
    }`;

    prevSubstepBtn.disabled = stepIdx === 0;
    nextSubstepBtn.disabled = stepIdx === task.steps.length - 1;
    logEvent("step_loaded", { stepIndex: stepIdx });
  }

  // --- TERMINAL & SKULPT SETUP ---
  function logToTerminal(message, type = "info") {
    const line = document.createElement("div");
    const color = {
      info: "text-gray-400",
      success: "text-green-400",
      error: "text-red-400",
    }[type];
    line.className = color;
    line.textContent = `> ${message}`;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  function builtinRead(x) {
    if (
      Sk.builtinFiles === undefined ||
      Sk.builtinFiles["files"][x] === undefined
    )
      throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
  }

  async function runCode() {
    const code = codeMirrorEditor.getValue();
    resetAll();

    // Refresh turtle container before running
    refreshTurtleContainer();

    console.log("=== SKULPT TURTLE DEBUG ===");
    console.log("Skulpt available:", typeof Sk !== "undefined");
    const container = document.getElementById("turtle-container");
    console.log("Container element:", container);
    console.log(
      "Container dimensions:",
      container ? `${container.offsetWidth}x${container.offsetHeight}` : "N/A"
    );

    // Configure Skulpt first
    Sk.configure({
      output: (text) => logToTerminal(text),
      read: builtinRead,
      __future__: Sk.python3,
    });

    // Set up turtle graphics AFTER Skulpt configuration but BEFORE execution
    // Let Skulpt create its own canvas inside the container
    if (container) {
      // Get the container dimensions
      const rect = container.getBoundingClientRect();
      const containerWidth = container.offsetWidth || rect.width || 800;
      const containerHeight = container.offsetHeight || rect.height || 400;

      console.log(
        `Setting up turtle graphics with container dimensions: ${containerWidth}x${containerHeight}`
      );

      // Let Skulpt create and manage its own canvas
      Sk.TurtleGraphics = {
        target: "turtle-container", // Use the container ID
        width: containerWidth,
        height: containerHeight,
        animate: true,
        delay: 100, // Slower animation for visibility
      };

      console.log("TurtleGraphics configured for animation:");
      console.log("- Sk.TurtleGraphics:", Sk.TurtleGraphics);
    } else {
      console.error("Container not found for turtle graphics setup");
    }

    console.log("=========================");

    try {
      console.log("Starting Skulpt execution...");
      console.log("TurtleGraphics before execution:", Sk.TurtleGraphics);

      const result = await Sk.misceval.asyncToPromise(() => {
        return Sk.importMainWithBody("<stdin>", false, code, true);
      });

      console.log("Skulpt execution completed");
      console.log("TurtleGraphics after execution:", Sk.TurtleGraphics);
      console.log("Container state after execution:");
      console.log(
        "- Container children:",
        container ? container.children.length : "N/A"
      );
      console.log(
        "- Container innerHTML length:",
        container ? container.innerHTML.length : "N/A"
      );

      // Log the actual HTML content
      if (container) {
        console.log("- Container HTML content:", container.innerHTML);

        // Check what Skulpt created inside the container
        if (container.children.length > 0) {
          console.log(
            "Found Skulpt elements - letting them handle animation naturally"
          );
          for (let i = 0; i < container.children.length; i++) {
            const child = container.children[i];
            console.log(`- Child ${i}:`, child.tagName, child);
            if (child.tagName === "CANVAS") {
              console.log(
                `  - Canvas dimensions: ${child.width}x${child.height}`
              );
              console.log(`  - Canvas style: ${child.style.cssText}`);
            }
          }
        } else {
          console.log(
            "No child elements found - turtle may not have been used"
          );
        }
      }

      logToTerminal("Run successfully.", "success");

      // Check for task completion
      checkTaskCompletion(code);

      logEvent("code_run", { success: true, codeSnapshot: code });
    } catch (e) {
      console.error("Skulpt execution error:", e);
      logToTerminal(e.toString(), "error");
      logEvent("code_run", {
        success: false,
        error: e.toString(),
        codeSnapshot: code,
      });
    }
  }

  function resetAll() {
    console.log("Reset button clicked");
    console.log("Turtle container:", turtleContainer);
    console.log("Terminal output:", terminalOutput);

    // Clear turtle container
    if (turtleContainer) {
      // Clear all child elements (Skulpt's canvases)
      while (turtleContainer.firstChild) {
        turtleContainer.removeChild(turtleContainer.firstChild);
      }
      console.log("Cleared container contents");
    }

    // Clear terminal output
    if (terminalOutput) {
      terminalOutput.innerHTML = "";
    }

    // Refresh the container
    refreshTurtleContainer();

    console.log("Reset completed");
  }

  // --- AI ASSISTANT IMPLEMENTATION ---
  // Import the Azure OpenAI module

  class AIAssistant {
    constructor() {
      this.isGenerating = false;
    }

    // Create chat messages with code suggestion capability
    createChatMessage(content, sender, codeBlock = null) {
      const chatContainer = document.getElementById("chat-container");

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

      // Add the main message content
      const contentP = document.createElement("p");
      contentP.textContent = content;
      contentP.classList.add("text-sm", "mb-2");
      messageDiv.appendChild(contentP);

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
        const chatContainer = document.getElementById("chat-container");
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

        const chatContainer = document.getElementById("chat-container");
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
      if (this.isGenerating) return;
      logEvent("ai_prompt", { prompt: userPrompt });
      const response = await this.fetchFromAI(this.systemPrompt, userPrompt);
      logEvent("ai_response", { response });

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
      const chatContainer = document.getElementById("chat-container");
      const lastMessage = chatContainer.lastElementChild;

      if (!lastMessage) return;

      const suggestedActions = document.createElement("div");
      suggestedActions.classList.add("ai-options-container", "mt-2");

      // Create suggested follow-up questions based on the current task
      const currentTask = tutorialTasks[currentTaskIndex].title;

      let suggestions = [];
      if (currentTask.includes("Square")) {
        suggestions = [
          "Draw a bigger square",
          "Make the turtle move faster",
          "Change square color to red",
        ];
      } else if (currentTask.includes("Dashed Line")) {
        suggestions = [
          "Make the dashes shorter",
          "Draw 10 dashes instead of 5",
          "Change the pen color",
        ];
      } else {
        suggestions = [
          "Explain this code",
          "Optimize this code",
          "Add comments",
        ];
      }

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
      if (this.isGenerating) return;
      logEvent("ai_prompt", { prompt: userPrompt });
      const response = await this.fetchFromAI(this.systemPrompt, userPrompt);
      logEvent("ai_response", { response });
      if (response.type === "text") {
        this.createChatMessage(response.content, "ai");
      } else if (response.type === "code") {
        // Add this line to handle code responses that might come from Azure
        this.createChatMessage(response.content, "ai", response.code);
      }
    }
  }

  // --- EXPERIMENT LOGIC & EVENT LISTENERS ---
  const vibecodingAI = new VibecodingAssistant();
  const reflectiveAI = new ReflectiveAssistant();
  let currentAI = vibecodingAI;

  // Make currentAI accessible globally for UI interaction
  window.currentAI = currentAI;

  function handleGetSuggestion() {
    const userPrompt = aiPromptInput.value.trim();
    if (!userPrompt || currentAI.isGenerating) return;

    // Clear input
    aiPromptInput.value = "";

    // Create user message
    currentAI.createChatMessage(userPrompt, "user");

    // Get AI response
    console.log("Sending user input to AI assistant:", userPrompt);
    currentAI.getSuggestion(userPrompt);
  }

  // Update event listeners
  getAiSuggestionBtn.addEventListener("click", handleGetSuggestion);
  aiPromptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleGetSuggestion();
  });

  // Update the AI mode select event handler
  aiModeSelect.addEventListener("change", (e) => {
    currentAI = e.target.value === "vibecoding" ? vibecodingAI : reflectiveAI;
    window.currentAI = currentAI; // Update the global reference
    logEvent("ai_mode_changed", { newMode: e.target.value });
  });

  // Add event listeners with error checking
  if (runBtn) {
    runBtn.addEventListener("click", () => {
      console.log("Run button clicked");
      runCode(); // Use the proper runCode function instead of runPython
    });
  } else {
    console.error("Run button not found!");
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetAll);
  } else {
    console.error("Reset button not found!");
  }

  // Navigation button event listeners
  prevTaskBtn.addEventListener("click", () =>
    loadTaskAndStep(currentTaskIndex - 1, 0)
  );
  nextTaskBtn.addEventListener("click", () =>
    loadTaskAndStep(currentTaskIndex + 1, 0)
  );
  prevSubstepBtn.addEventListener("click", () =>
    loadStep(currentStepIndex - 1)
  );
  nextSubstepBtn.addEventListener("click", () =>
    loadStep(currentStepIndex + 1)
  );
  saveLogBtn.addEventListener("click", saveLogToFile);

  // --- RESIZABLE PANELS ---
  function setupResizablePanels() {
    // Basic implementation to prevent errors
    // Can be extended later for actual resizable functionality
    console.log("Resizable panels setup");
  }

  // --- TURTLE CANVAS MANAGEMENT ---
  function refreshTurtleContainer() {
    const container = document.getElementById("turtle-container");
    if (!container) {
      console.error("Turtle container not found");
      return;
    }

    // Find the parent container
    const parentContainer = container.parentElement;

    // Calculate available size - provide fallback dimensions
    const containerWidth = parentContainer.clientWidth || 400;
    const containerHeight = parentContainer.clientHeight || 300;

    console.log(
      `Refreshing turtle container to ${containerWidth}x${containerHeight}`
    );

    // Set container dimensions
    container.style.width = containerWidth + "px";
    container.style.height = containerHeight + "px";

    console.log("Container dimensions updated");
  }

  // Debug function to check container status
  function debugContainerStatus() {
    const container = document.getElementById("turtle-container");
    const parentContainer = container?.parentElement;

    console.log("=== CONTAINER DEBUG ===");
    console.log("Container element:", container);
    console.log(
      "Container dimensions:",
      container ? `${container.offsetWidth}x${container.offsetHeight}` : "N/A"
    );
    console.log(
      "Container CSS dimensions:",
      container ? `${container.style.width} x ${container.style.height}` : "N/A"
    );
    console.log("Parent container:", parentContainer);
    console.log(
      "Parent container dimensions:",
      parentContainer
        ? `${parentContainer.clientWidth}x${parentContainer.clientHeight}`
        : "N/A"
    );
    console.log("Skulpt available:", typeof Sk !== "undefined");
    console.log(
      "TurtleGraphics available:",
      typeof Sk !== "undefined" && Sk.TurtleGraphics
    );
    console.log("======================");
  }

  // Add resize observer to automatically resize container when parent changes
  function setupContainerResizeObserver() {
    const container = document.getElementById("turtle-container");
    const parentContainer = container?.parentElement;

    if (!container || !parentContainer) {
      console.warn(
        "Container or parent container not found for resize observer"
      );
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        refreshTurtleContainer();
      }
    });

    resizeObserver.observe(parentContainer);
  }

  // --- INITIALIZATION ---
  // Debug: Check if all DOM elements are found
  console.log("=== DOM ELEMENTS DEBUG ===");
  console.log("Run button:", runBtn);
  console.log("Reset button:", resetBtn);
  console.log("CodeMirror editor:", codeMirrorEditor);
  console.log("Terminal output:", terminalOutput);
  console.log("Turtle container:", turtleContainer);
  console.log("=========================");

  // Initialize the tutorial with the first task and step
  loadTaskAndStep(0, 0);

  // Initialize the container once the page loads
  setTimeout(() => {
    refreshTurtleContainer();
    debugContainerStatus(); // Debug container status
  }, 100); // Small delay to ensure all DOM elements are fully rendered

  // Setup resizable panels
  setupResizablePanels();

  // Setup container resize observer
  setupContainerResizeObserver();

  // Add a simple test button to check if Skulpt works
  setTimeout(() => {
    const testBtn = document.createElement("button");
    testBtn.textContent = "TEST SKULPT";
    testBtn.style.cssText =
      "position: fixed; top: 10px; right: 10px; z-index: 9999; padding: 10px; background: red; color: white; border: none;";
    testBtn.onclick = () => {
      console.log("=== SKULPT TEST CLICKED ===");
      const container = document.getElementById("turtle-container");
      console.log("Container found:", !!container);
      console.log("Skulpt available:", typeof Sk !== "undefined");
      console.log("Skulpt object:", Sk);

      if (container) {
        container.style.backgroundColor = "yellow"; // Visual indicator

        // Clear any existing content first
        container.innerHTML = "";
      }

//       // Test basic Skulpt functionality first
//       if (typeof Sk !== "undefined") {
//         console.log("Testing basic Skulpt...");

//         Sk.configure({
//           output: (txt) => {
//             console.log("Skulpt output:", txt);
//             logToTerminal(txt);
//           },
//           read: builtinRead,
//         });

//         const testCode = "print('Hello from Skulpt!')";
//         console.log("Running basic test:", testCode);

//         Sk.misceval
//           .asyncToPromise(() => {
//             return Sk.importMainWithBody("<stdin>", false, testCode, true);
//           })
//           .then(() => {
//             console.log("✅ Basic Skulpt test successful!");
//             if (container) container.style.backgroundColor = "lightgreen";

//             // Now test turtle specifically
//             console.log("Testing turtle module...");
//             console.log(
//               "Container dimensions before turtle:",
//               container
//                 ? `${container.offsetWidth}x${container.offsetHeight}`
//                 : "N/A"
//             );

//             // Try the most basic turtle configuration - let Skulpt create its own canvas
//             Sk.TurtleGraphics = {
//               target: "turtle-container",
//             };

//             console.log("TurtleGraphics set:", Sk.TurtleGraphics);

//             const simpleTurtleCode = `
// import turtle
// print("About to create turtle...")
// t = turtle.Turtle()
// print("Turtle created!")
// t.forward(100)
// print("Moved forward 100!")
//             `;

//             console.log("Running turtle test code...");
//             return Sk.misceval.asyncToPromise(() => {
//               return Sk.importMainWithBody(
//                 "<stdin>",
//                 false,
//                 simpleTurtleCode,
//                 true
//               );
//             });
//           })
//           .then(() => {
//             console.log("✅ Turtle test completed!");
//             if (container) {
//               console.log("Container after turtle test:");
//               console.log("- Children:", container.children.length);
//               console.log("- HTML:", container.innerHTML);
//               console.log(
//                 "- Container dimensions:",
//                 container.offsetWidth,
//                 "x",
//                 container.offsetHeight
//               );

//               // Check all child elements
//               for (let i = 0; i < container.children.length; i++) {
//                 const child = container.children[i];
//                 console.log(`Child ${i}:`, child.tagName, child);
//                 if (child.tagName === "CANVAS") {
//                   console.log(
//                     `  Canvas ${i} dimensions:`,
//                     child.width,
//                     "x",
//                     child.height
//                   );
//                   console.log(`  Canvas ${i} styles:`, child.style.cssText);

//                   // Check if this canvas has any drawings
//                   const childCtx = child.getContext("2d");
//                   const imageData = childCtx.getImageData(
//                     0,
//                     0,
//                     child.width,
//                     child.height
//                   );
//                   let hasContent = false;
//                   for (let j = 3; j < imageData.data.length; j += 4) {
//                     if (imageData.data[j] > 0) {
//                       hasContent = true;
//                       break;
//                     }
//                   }
//                   console.log(`  Canvas ${i} has content:`, hasContent);
//                 }
//               }

//               console.log(
//                 "Skulpt should have created its own canvases inside the container!"
//               );
//             }
//           })
//           .catch((err) => {
//             console.error("❌ Test failed:", err);
//             console.error("Error details:", err.toString());
//             if (container) container.style.backgroundColor = "lightcoral";
//           });
//       } else {
//         console.error("❌ Skulpt not available!");
//         if (container) container.style.backgroundColor = "lightcoral";
//       }
//     };
//     document.body.appendChild(testBtn);
//     console.log("Test button added to page");
//   }, 1000);

  function checkTaskCompletion(code) {
    const currentTask = tutorialTasks[currentTaskIndex];

    // Don't check if already completed
    if (currentTask.completed) {
      return;
    }

    // Normalize code for checking (remove extra whitespace, comments)
    const normalizedCode = code
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/#.*$/gm, "")
      .trim();

    let isCompleted = false;

    // Task-specific completion criteria
    switch (currentTaskIndex) {
      case 0: // Task 1: Draw a Square
        // Check for basic square drawing elements
        const hasImport =
          normalizedCode.includes("import turtle") ||
          normalizedCode.includes("from turtle");
        const hasLoop =
          normalizedCode.includes("for") && normalizedCode.includes("range(4)");
        const hasForward =
          normalizedCode.includes("forward") || normalizedCode.includes("fd");
        const hasRight =
          normalizedCode.includes("right") || normalizedCode.includes("rt");

        isCompleted = hasImport && hasLoop && hasForward && hasRight;
        break;

      case 1: // Task 2: Draw a Dashed Line
        // Check for dashed line elements
        const hasImportDash =
          normalizedCode.includes("import turtle") ||
          normalizedCode.includes("from turtle");
        const hasLoopDash =
          normalizedCode.includes("for") && normalizedCode.includes("range(5)");
        const hasPenUp =
          normalizedCode.includes("penup") || normalizedCode.includes("pu");
        const hasPenDown =
          normalizedCode.includes("pendown") || normalizedCode.includes("pd");
        const hasForwardDash =
          normalizedCode.includes("forward") || normalizedCode.includes("fd");

        isCompleted =
          hasImportDash &&
          hasLoopDash &&
          hasPenUp &&
          hasPenDown &&
          hasForwardDash;
        break;

      default:
        // For tasks not yet defined, don't auto-complete
        isCompleted = false;
    }

    if (isCompleted) {
      currentTask.completed = true;
      logToTerminal(`✅ Task completed: ${currentTask.title}`, "success");
      logEvent("task_completed", {
        taskIndex: currentTaskIndex,
        taskTitle: currentTask.title,
        codeSnapshot: code,
      });

      // Update navigation buttons to reflect completion
      updateNavigationButtons();

      // Visual feedback
      const taskTitleElement = document.getElementById("task-title");
      if (taskTitleElement) {
        taskTitleElement.textContent = `${currentTask.title} ✅`;
      }
    }
  }
});
