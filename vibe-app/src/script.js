document.addEventListener("DOMContentLoaded", () => {
  // --- DOM ELEMENTS ---
  const codeEditorTextArea = document.getElementById("code-editor-area");
  const runBtn = document.getElementById("run-btn");
  const resetBtn = document.getElementById("reset-btn");
  const aiModeSelect = document.getElementById("ai-mode-select");
  const getAiSuggestionBtn = document.getElementById("get-ai-suggestion-btn");
  const aiPromptInput = document.getElementById("ai-prompt-input");
  const chatContainer = document.getElementById("chat-container");
  const turtleCanvas = document.getElementById("turtle-canvas");
  const terminalOutput = document.getElementById("terminal");
  const taskTitle = document.getElementById("task-title");
  const stepText = document.getElementById("step-text");
  const prevTaskBtn = document.getElementById("prev-task-btn");
  const nextTaskBtn = document.getElementById("next-task-btn");
  const prevSubstepBtn = document.getElementById("prev-substep-btn");
  const nextSubstepBtn = document.getElementById("next-substep-btn");
  const saveLogBtn = document.getElementById("save-log-btn");

  // --- CODEMIRROR SETUP ---
  const codeMirrorEditor = CodeMirror.fromTextArea(codeEditorTextArea, {
    mode: { name: "python", version: 3, singleLineStringErrors: false },
    lineNumbers: true,
    indentUnit: 4,
    theme: "dracula",
  });
  codeMirrorEditor.setValue("import turtle\n\n# Your code here");

  // --- EVENT LOGGING SYSTEM ---
  let eventLog = [];
  let participantId = `P${String(Date.now()).slice(-4)}`;

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
    console.log(event);
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
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  // --- TUTORIAL LOGIC ---
  const tutorialTasks = [
    {
      title: "Task 1: Draw a Square",
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
    currentTaskIndex = taskIdx;
    const task = tutorialTasks[currentTaskIndex];
    taskTitle.textContent = task.title;

    loadStep(stepIdx);

    prevTaskBtn.disabled = taskIdx === 0;
    nextTaskBtn.disabled = taskIdx === tutorialTasks.length - 1;
    logEvent("task_loaded", { taskIndex: taskIdx });
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

    Sk.configure({
      output: (text) => logToTerminal(text),
      read: builtinRead,
      __future__: Sk.python3,
    });
    (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = "turtle-canvas";

    try {
      await Sk.misceval.asyncToPromise(() =>
        Sk.importMainWithBody("<stdin>", false, code, true)
      );
      logToTerminal("Run successfully.", "success");
      logEvent("code_run", { success: true, codeSnapshot: code });
    } catch (e) {
      logToTerminal(e.toString(), "error");
      logEvent("code_run", {
        success: false,
        error: e.toString(),
        codeSnapshot: code,
      });
    }
  }

  function resetAll() {
    turtleCanvas.innerHTML = "";
    terminalOutput.innerHTML = "";
  }

  // --- AI ASSISTANT IMPLEMENTATION ---
  class AIAssistant {
    constructor() {
      this.isGenerating = false;
    }

    createChatMessage(content, author, code = null) {
      const bubble = document.createElement("div");
      bubble.className = `chat-bubble p-3 rounded-lg text-xs mb-2 ${
        author === "user" ? "bg-blue-900 self-end" : "bg-gray-700"
      }`;

      if (code) {
        bubble.innerHTML = `<div class="font-semibold mb-1">${content}</div><pre><code class="language-python">${code}</code></pre>`;
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "flex gap-2 mt-2";
        buttonContainer.innerHTML = `
                    <button class="apply-code-btn flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs">Apply</button>
                    <button class="discard-code-btn flex-1 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-xs">Discard</button>
                `;
        bubble.appendChild(buttonContainer);
      } else {
        bubble.textContent = content;
      }

      chatContainer.appendChild(bubble);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async fetchFromAI(systemPrompt, userPrompt) {
      this.isGenerating = true;
      this.createChatMessage("AI is thinking...", "system");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      chatContainer.removeChild(chatContainer.lastChild);
      this.isGenerating = false;

      if (systemPrompt.includes("expert Python programmer")) {
        const code = `import turtle\n\nt = turtle.Turtle()\nt.speed(1)\n\n# Draw a square\nfor _ in range(4):\n    t.forward(100)\n    t.right(90)`;
        return {
          type: "code",
          content: "Here is the code to draw a square:",
          code: code,
        };
      } else if (systemPrompt.includes("Socratic tutor")) {
        const question = userPrompt.toLowerCase().includes("square")
          ? "That's a good goal! What are some properties of a square you know? How many sides does it have, and what about its angles?"
          : "Interesting idea! What's the very first step you think the turtle needs to take?";
        return { type: "text", content: question };
      }
      return { type: "text", content: "I'm not sure how to respond to that." };
    }
  }

  class VibecodingAssistant extends AIAssistant {
    constructor() {
      super();
      this.systemPrompt =
        "You are an expert Python programmer. The user will provide a request. Your task is to provide a complete, working Python code solution using the `turtle` library. Do not add explanations, just provide the code.";
    }
    async getSuggestion(userPrompt) {
      if (this.isGenerating) return;
      logEvent("ai_prompt", { prompt: userPrompt });
      const response = await this.fetchFromAI(this.systemPrompt, userPrompt);
      logEvent("ai_response", { response });
      if (response.type === "code") {
        this.createChatMessage(response.content, "ai", response.code);
      }
    }
  }

  class ReflectiveAssistant extends AIAssistant {
    constructor() {
      super();
      this.systemPrompt =
        "You are a Socratic tutor for Python programming. The user will ask for help with a `turtle` graphics problem. You are forbidden from writing any code. Instead, you must guide the user by asking reflective questions to help them think through the problem. For example, if they ask 'how to draw a square', you could ask 'What do you know about the properties of a square?' or 'What `turtle` command moves the turtle forward?'.";
    }
    async getSuggestion(userPrompt) {
      if (this.isGenerating) return;
      logEvent("ai_prompt", { prompt: userPrompt });
      const response = await this.fetchFromAI(this.systemPrompt, userPrompt);
      logEvent("ai_response", { response });
      if (response.type === "text") {
        this.createChatMessage(response.content, "ai");
      }
    }
  }

  // --- EXPERIMENT LOGIC & EVENT LISTENERS ---
  const vibecodingAI = new VibecodingAssistant();
  const reflectiveAI = new ReflectiveAssistant();
  let currentAI = vibecodingAI;

  function handleGetSuggestion() {
    const userPrompt = aiPromptInput.value.trim();
    if (!userPrompt) return;
    currentAI.createChatMessage(userPrompt, "user");
    currentAI.getSuggestion(userPrompt);
    aiPromptInput.value = "";
  }

  getAiSuggestionBtn.addEventListener("click", handleGetSuggestion);
  aiPromptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleGetSuggestion();
  });

  chatContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("apply-code-btn")) {
      const codeBlock = e.target.closest(".chat-bubble").querySelector("code");
      if (codeBlock) {
        const appliedCode = codeBlock.textContent;
        codeMirrorEditor.setValue(appliedCode);
        logEvent("code_applied", { code: appliedCode });
      }
    }
    if (e.target.classList.contains("discard-code-btn")) {
      const bubble = e.target.closest(".chat-bubble");
      const codeBlock = bubble.querySelector("code");
      logEvent("code_discarded", {
        code: codeBlock ? codeBlock.textContent : "N/A",
      });
      bubble.remove();
    }
  });

  aiModeSelect.addEventListener("change", (e) => {
    currentAI = e.target.value === "vibecoding" ? vibecodingAI : reflectiveAI;
    logEvent("ai_mode_changed", { newMode: e.target.value });
  });

  runBtn.addEventListener("click", runCode);
  resetBtn.addEventListener("click", resetAll);
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

  // --- COLUMN RESIZING LOGIC ---
  function makeResizable(resizer, left, right) {
    let x, leftWidth, rightWidth;
    resizer.addEventListener("mousedown", (e) => {
      x = e.clientX;
      leftWidth = left.getBoundingClientRect().width;
      rightWidth = right.getBoundingClientRect().width;
      document.addEventListener("mousemove", mouseMove);
      document.addEventListener("mouseup", () =>
        document.removeEventListener("mousemove", mouseMove)
      );
    });

    function mouseMove(e) {
      const dx = e.clientX - x;
      left.style.width = `${leftWidth + dx}px`;
      right.style.width = `${rightWidth - dx}px`;
    }
  }

  makeResizable(
    document.getElementById("resizer-left"),
    document.getElementById("left-sidebar"),
    document.getElementById("main-content")
  );
  makeResizable(
    document.getElementById("resizer-right"),
    document.getElementById("main-content"),
    document.getElementById("right-sidebar")
  );

  // --- INITIAL LOAD ---
  logEvent("session_start");
  loadTaskAndStep(0, 0);
});