/* filepath: /js/modules/tutorial/tutorialDisplay.js */
import { ensureEditorReady } from "../codeMirrorSetup.js";

// Helper function to format text with inline code blocks
function formatTextWithCode(text) {
  return text.replace(/`([^`]+)`/g, (match, code) => {
    // Simple Python keyword highlighting
    const highlighted = code
      .replace(
        /\b(for|if|def|class|import|from|return|pass|in|range)\b/g,
        '<span class="python-keyword">$1</span>'
      )
      .replace(
        /\b(forward|right|left|backward|penup|pendown|goto|color|clear)\b/g,
        '<span class="python-function">$1</span>'
      )
      .replace(/\b(\d+)\b/g, '<span class="python-number">$1</span>');

    return `<code class="inline-code">${highlighted}</code>`;
  });
}

// Update the code editor with the step's code
export function updateCodeEditor(step, task) {
  if (window.editor) {
    const shouldPopulateEditor =
      step.type === "demonstration" ||
      step.type === "guided_coding" ||
      step.type === "function_creation" ||
      step.type === "class_definition";

    if (shouldPopulateEditor) {
      window.editor.setValue(step.code);

      if (step.type === "demonstration") {
        window.editor.setOption("readOnly", true);
        window.editor.getWrapperElement().classList.add("demonstration-mode");
      } else {
        window.editor.setOption("readOnly", false);
        window.editor
          .getWrapperElement()
          .classList.remove("demonstration-mode");
      }
    } else if (step.type === "solo_practice" && step.aiBlocked) {
      const templateCode = step.code.includes("# Try drawing")
        ? "import turtle\nt = turtle.Turtle()\n\n# Your triangle code here\n"
        : step.code;

      window.editor.setValue(templateCode);
      window.editor.setOption("readOnly", false);
      window.editor.getWrapperElement().classList.remove("demonstration-mode");
    } else {
      window.editor.setValue(step.code);
      window.editor.setOption("readOnly", false);
      window.editor.getWrapperElement().classList.remove("demonstration-mode");
    }

    // Position cursor at the end for editable content
    if (step.type !== "demonstration") {
      const lastLine = window.editor.lineCount() - 1;
      window.editor.setCursor(lastLine, window.editor.getLine(lastLine).length);
    }

    // Refresh the editor to ensure proper display
    setTimeout(() => {
      window.editor.refresh();
      ensureEditorReady();
    }, 100);
  }
}

// Update progress display
export function updateProgressDisplay(
  tutorialTasks,
  currentTaskIndex,
  currentStepIndex
) {
  const task = tutorialTasks[currentTaskIndex];
  const totalSteps = tutorialTasks.reduce(
    (sum, task) => sum + task.steps.length,
    0
  );
  const completedSteps =
    tutorialTasks
      .slice(0, currentTaskIndex)
      .reduce((sum, task) => sum + task.steps.length, 0) + currentStepIndex;
  const progressPercent = (completedSteps / totalSteps) * 100;

  document.getElementById("progress-fill").style.width = `${progressPercent}%`;
  document.getElementById("progress-text").textContent = `${task.type.replace(
    "_",
    " "
  )} - Step ${currentStepIndex + 1}`;
}

// Update tips display
export function updateTipsDisplay(step, task) {
  let tipsHTML = `
    <div class="tip-item mb-2">
      <strong>Hint:</strong> ${formatTextWithCode(step.hint)}
    </div>
    <div class="tip-item mb-2">
      <strong>Tip:</strong> ${formatTextWithCode(step.tip)}
    </div>
  `;

  // Add paradigm-specific tips
  if (task.paradigm) {
    const paradigmTips = {
      procedural:
        "Focus on step-by-step commands. Each line does one specific action.",
      functional:
        "Think about reusable pieces. Functions let you use the same code multiple times.",
      object_oriented:
        "Bundle data and actions together. Objects have properties and can do things.",
    };

    if (paradigmTips[task.paradigm]) {
      tipsHTML += `
        <div class="tip-item paradigm-tip">
          <strong>${task.paradigm
            .replace("_", "-")
            .toUpperCase()} Approach:</strong> ${formatTextWithCode(
        paradigmTips[task.paradigm]
      )}
        </div>
      `;
    }
  }

  // Add requirements if available
  if (step.requirements) {
    tipsHTML += `
      <div class="tip-item requirements">
        <strong>Requirements:</strong>
        <ul class="text-xs mt-1">
          ${step.requirements
            .map((req) => `<li>• ${formatTextWithCode(req)}</li>`)
            .join("")}
        </ul>
      </div>
    `;
  }

  // Add AI guidance
  if (task.aiAllowed) {
    const aiGuidance =
      task.aiChoice === "participant_choice"
        ? "You can choose which AI assistant to use for this task!"
        : "Use your assigned AI assistant to help with this task.";

    tipsHTML += `
      <div class="tip-item ai-guidance">
        <strong>AI Assistance:</strong> ${formatTextWithCode(aiGuidance)}
      </div>
    `;
  } else {
    tipsHTML += `
      <div class="tip-item no-ai">
        <strong>Independent Work:</strong> ${formatTextWithCode(
          "Try this on your own without AI assistance."
        )}
      </div>
    `;
  }

  document.getElementById("current-tips").innerHTML = tipsHTML;
}

// Update steps overview
export function updateStepsOverview(task, currentStepIndex) {
  const stepsContainer = document.getElementById("all-steps-content");
  const stepsHTML = task.steps
    .map((step, index) => {
      const status =
        index < currentStepIndex
          ? "✅"
          : index === currentStepIndex
          ? "▶"
          : "○";
      const statusClass =
        index < currentStepIndex
          ? "text-green-400"
          : index === currentStepIndex
          ? "text-blue-400"
          : "text-gray-500";

      return `
        <div class="step-overview-item p-2 rounded text-xs cursor-pointer hover:bg-gray-700 ${
          index === currentStepIndex
            ? "bg-blue-900 bg-opacity-30"
            : "bg-gray-800"
        } step-type-${step.type}" 
             onclick="loadStep(${index})">
          <span class="mr-2 ${statusClass}">${status}</span>
          <span class="text-gray-300">${step.instruction}</span>
          <span class="step-type-label">${step.type.replace("_", " ")}</span>
        </div>
      `;
    })
    .join("");

  stepsContainer.innerHTML = stepsHTML;
}

// Update navigation buttons
export function updateNavigationButtons(
  task,
  currentTaskIndex,
  currentStepIndex,
  tutorialTasks
) {
  document.getElementById("prev-substep-btn").disabled = currentStepIndex === 0;
  document.getElementById("next-substep-btn").disabled =
    currentStepIndex === task.steps.length - 1;

  // Update combined completion button
  const completeBtn = document.getElementById("complete-and-continue-btn");
  if (completeBtn) {
    if (task.completed) {
      // Check if this is the final task
      const isLastTask = currentTaskIndex === tutorialTasks.length - 1;

      if (isLastTask) {
        completeBtn.textContent =
          "🎉 Good Job! You have finished the playful introduction to Python!";
      } else {
        completeBtn.textContent = "✅ Task Completed";
      }

      completeBtn.disabled = true;
      completeBtn.classList.add("bg-gray-500");
      completeBtn.classList.remove("bg-green-600", "hover:bg-green-700");
    } else {
      const isLastTask = currentTaskIndex === tutorialTasks.length - 1;
      completeBtn.textContent = isLastTask
        ? "✅ Complete Final Task"
        : "✅ Complete Task & Continue";
      completeBtn.disabled = false;
      completeBtn.classList.remove("bg-gray-500");
      completeBtn.classList.add("bg-green-600", "hover:bg-green-700");
    }
  }
}

// Update AI availability
export function updateAIAvailability(
  task,
  currentTaskIndex,
  currentStepIndex,
  eventLogger
) {
  const aiContainer = document.querySelector(".ai-assistant-section");
  if (aiContainer) {
    if (task.aiAllowed) {
      aiContainer.classList.remove("ai-disabled");
      aiContainer.classList.add("ai-enabled");

      if (task.aiChoice === "participant_choice") {
        aiContainer.classList.add("ai-choice-available");
      } else {
        aiContainer.classList.remove("ai-choice-available");
      }
    } else {
      aiContainer.classList.add("ai-disabled");
      aiContainer.classList.remove("ai-enabled", "ai-choice-available");
    }
  }

  // Log AI availability change
  eventLogger.logEvent("ai_availability_changed", {
    taskIndex: currentTaskIndex,
    stepIndex: currentStepIndex,
    aiAllowed: task.aiAllowed,
    aiChoice: task.aiChoice || "assigned",
  });
}

// Setup toggle listeners for UI components
export function setupToggleListeners() {
  // Code hint toggle
  const codeHintToggle = document.getElementById("toggle-code-hint");
  if (codeHintToggle) {
    codeHintToggle.addEventListener("click", () => {
      const content = document.getElementById("code-hint-content");
      const icon = document.getElementById("code-hint-icon");
      const button = document.getElementById("toggle-code-hint");

      if (content.style.display === "none") {
        content.style.display = "block";
        icon.textContent = "▲";
        button.querySelector("span").textContent = "💻 Hide Code Example";
      } else {
        content.style.display = "none";
        icon.textContent = "▼";
        button.querySelector("span").textContent = "💻 Show Code Example";
      }
    });
  }

  // Tips toggle
  document.getElementById("toggle-tips")?.addEventListener("click", () => {
    const content = document.getElementById("tips-content");
    const icon = document.getElementById("tips-icon");

    if (content.style.display === "none") {
      content.style.display = "block";
      icon.textContent = "▲";
    } else {
      content.style.display = "none";
      icon.textContent = "▼";
    }
  });

  // All steps toggle
  document.getElementById("toggle-all-steps")?.addEventListener("click", () => {
    const content = document.getElementById("all-steps-content");
    const icon = document.getElementById("steps-toggle-icon");

    if (content.style.display === "none") {
      content.style.display = "block";
      icon.textContent = "▲";
    } else {
      content.style.display = "none";
      icon.textContent = "▼";
    }
  });

  // Quick action buttons
  document.getElementById("show-hint-btn")?.addEventListener("click", () => {
    document.getElementById("tips-content").style.display = "block";
    document.getElementById("tips-icon").textContent = "▲";
  });

  document
    .getElementById("show-all-steps-btn")
    ?.addEventListener("click", () => {
      document.getElementById("all-steps-content").style.display = "block";
      document.getElementById("steps-toggle-icon").textContent = "▲";
    });
}

// Main tutorial display update function
export function updateTutorialDisplay(
  tutorialTasks,
  currentTaskIndex,
  currentStepIndex,
  eventLogger
) {
  const task = tutorialTasks[currentTaskIndex];
  const step = task.steps[currentStepIndex];

  // Update task info
  document.querySelector(".task-title-text").textContent = task.title;
  document.getElementById("task-description").textContent = task.description;

  // Add task type styling
  const taskHeader = document.querySelector(".current-task");
  if (taskHeader) {
    taskHeader.classList.add(`task-type-${task.type}`);
  }

  // Update step info
  document.getElementById("step-counter").textContent = `${
    currentStepIndex + 1
  } of ${task.steps.length}`;
  document.getElementById("step-text").textContent = step.instruction;
  document.getElementById("code-example").textContent = step.code;

  // Update code editor
  updateCodeEditor(step, task);

  // Add step type indicator
  const stepContainer = document.querySelector(".current-step");
  if (stepContainer) {
    stepContainer.className = stepContainer.className.replace(
      /step-type-\w+/g,
      ""
    );
    stepContainer.classList.add(`step-type-${step.type}`);
  }

  // Update all UI components
  updateProgressDisplay(tutorialTasks, currentTaskIndex, currentStepIndex);
  updateTipsDisplay(step, task);
  updateStepsOverview(task, currentStepIndex);
  updateNavigationButtons(
    task,
    currentTaskIndex,
    currentStepIndex,
    tutorialTasks
  );
  updateAIAvailability(task, currentTaskIndex, currentStepIndex, eventLogger);
}
