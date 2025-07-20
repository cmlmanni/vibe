/* filepath: /js/modules/tutorialLogic.js */
export function initializeTutorial(domElements, eventLogger) {
  const tutorialTasks = [
    {
      title: "Foundation: Understanding Turtle Graphics",
      description:
        "Learn the basics by seeing how turtle graphics works, then practice independently.",
      type: "foundation",
      aiAllowed: false,
      completed: false,
      estimatedTime: "8-10 minutes",
      steps: [
        {
          instruction: "Study this complete square example. What does it do?",
          code: `import turtle
t = turtle.Turtle()
t.forward(100)
t.right(90)
t.forward(100)
t.right(90)
t.forward(100)
t.right(90)
t.forward(100)
t.right(90)`,
          hint: "This shows the basic turtle commands. Notice how each side is drawn separately.",
          tip: "Understanding this foundation will help you with all future tasks.",
          type: "demonstration",
        },
        {
          instruction:
            "Now practice by drawing a triangle on your own (NO AI assistance)",
          code: "# Try drawing a triangle using turtle commands\n# Hint: A triangle has 3 sides and turns 120 degrees",
          hint: "A triangle has 3 sides. Each turn should be 120 degrees (360° ÷ 3).",
          tip: "Use forward() and right() commands like in the square example.",
          type: "solo_practice",
          expectedOutput: "Triangle shape",
          aiBlocked: true,
        },
      ],
    },
    {
      title: "Planning: Design Your House",
      description:
        "Think through your approach before coding by planning on paper.",
      type: "planning",
      completed: false,
      estimatedTime: "5 minutes",
      steps: [
        {
          instruction:
            "Use pen and paper to plan drawing a simple house (square base + triangle roof)",
          code: "# No coding yet - use physical paper and pen",
          hint: "Think about: What shapes do you need? In what order? What turtle commands?",
          tip: "Good planning makes coding much easier!",
          type: "pen_and_paper",
          questions: [
            "What shapes make up a house?",
            "In what order should you draw them?",
            "How will you position the triangle on top of the square?",
            "What turtle commands will you need?",
          ],
        },
      ],
    },
    {
      title: "Task 1: Draw a House (Procedural Style)",
      description:
        "Code your house design using basic turtle commands with AI assistance.",
      type: "procedural_programming",
      aiAllowed: true,
      completed: false,
      estimatedTime: "12-15 minutes",
      paradigm: "procedural",
      steps: [
        {
          instruction: "Set up your turtle and start coding your house design",
          code: `import turtle
t = turtle.Turtle()
# Start coding your house here`,
          hint: "Begin with importing turtle and creating a turtle object, just like the examples.",
          tip: "Start with the square base, then add the triangle roof on top.",
          type: "guided_coding",
        },
        {
          instruction: "Draw the square base of your house",
          code: "# Draw a square for the house base\n# Use basic forward() and right() commands",
          hint: "A square needs 4 sides of equal length with 90-degree turns.",
          tip: "You can use the pattern from the foundation example.",
          requirements: ["Square base", "Proper positioning"],
          type: "step_by_step",
        },
        {
          instruction: "Add a triangle roof on top of the square",
          code: "# Move to the top of the square\n# Draw a triangle roof",
          hint: "You'll need to position the turtle at the top-left of the square, then draw the triangle.",
          tip: "Remember: triangles use 120-degree turns.",
          requirements: [
            "Triangle roof",
            "Positioned on square",
            "Connected properly",
          ],
          type: "step_by_step",
        },
        {
          instruction: "Test and refine your house drawing",
          code: "# Run your complete house code\n# Make adjustments if needed",
          hint: "Your house should have a clear square base and triangle roof.",
          tip: "If shapes don't connect properly, adjust the positioning commands.",
          type: "testing_refinement",
        },
      ],
    },
    {
      title: "Task 2: Create Reusable Shape Functions",
      description:
        "Refactor your approach using functions for modularity and reuse.",
      type: "functional_programming",
      aiAllowed: true,
      completed: false,
      estimatedTime: "12-15 minutes",
      paradigm: "functional",
      steps: [
        {
          instruction: "Create a function to draw squares of any size",
          code: `def draw_square(turtle_obj, size):
    # Write code to draw a square of given size
    pass

# Test your function
t = turtle.Turtle()
draw_square(t, 100)`,
          hint: "Functions let you reuse code. The function should take a turtle and size as parameters.",
          tip: "Use a for loop inside the function to make it cleaner: for i in range(4):",
          requirements: ["Function definition", "Parameters", "Reusable code"],
          type: "function_creation",
        },
        {
          instruction: "Create a function to draw triangles of any size",
          code: `def draw_triangle(turtle_obj, size):
    # Write code to draw a triangle of given size
    pass

# Test your function  
draw_triangle(t, 100)`,
          hint: "Similar to draw_square, but triangles have 3 sides and 120-degree turns.",
          tip: "You can use: for i in range(3): to repeat the triangle drawing.",
          requirements: [
            "Triangle function",
            "Proper angles",
            "Size parameter",
          ],
          type: "function_creation",
        },
        {
          instruction:
            "Create a draw_house function that uses both shape functions",
          code: `def draw_house(turtle_obj, size):
    # Use your draw_square and draw_triangle functions
    # Position the triangle on top of the square
    pass

# Test drawing multiple houses
draw_house(t, 80)
# Move turtle and draw another house
draw_house(t, 120)`,
          hint: "Your draw_house function should call both draw_square and draw_triangle.",
          tip: "You'll need to move the turtle between drawing the square and triangle.",
          requirements: [
            "Combines both functions",
            "Proper positioning",
            "Multiple houses",
          ],
          type: "composition",
        },
        {
          instruction: "Create a neighborhood with houses of different sizes",
          code: `# Clear the screen and draw multiple houses
t.clear()
# Draw 3-4 houses of different sizes in different positions`,
          hint: "Use your draw_house function multiple times with different sizes and positions.",
          tip: "Use t.penup(), t.goto(x, y), t.pendown() to move between house locations.",
          requirements: ["Multiple houses", "Different sizes", "Good spacing"],
          type: "creative_application",
        },
      ],
    },
    {
      title: "Task 3: Build a House Class (Advanced)",
      description:
        "Create a House class for maximum reusability and customization.",
      type: "object_oriented_programming",
      aiAllowed: true,
      completed: false,
      estimatedTime: "12-15 minutes",
      paradigm: "object_oriented",
      aiChoice: "participant_choice", // Let them choose their preferred AI
      steps: [
        {
          instruction: "Define a House class with initialization",
          code: `class House:
    def __init__(self, size, color='black', x=0, y=0):
        self.size = size
        self.color = color
        self.x = x
        self.y = y
        self.turtle = turtle.Turtle()
        
    # Add methods below`,
          hint: "Classes bundle data (size, color, position) with methods (actions).",
          tip: "The __init__ method runs when you create a new House object.",
          requirements: [
            "Class definition",
            "Constructor",
            "Instance variables",
          ],
          type: "class_definition",
        },
        {
          instruction: "Add a draw_base method to your House class",
          code: `    def draw_base(self):
        # Move turtle to position and draw the square base
        # Use self.size, self.color, self.x, self.y
        pass`,
          hint: "Methods in a class can access the object's data using self.attribute_name.",
          tip: "Use self.turtle.goto(self.x, self.y) to position, then draw the square.",
          requirements: [
            "Method definition",
            "Uses self attributes",
            "Draws square",
          ],
          type: "method_implementation",
        },
        {
          instruction: "Add a draw_roof method to your House class",
          code: `    def draw_roof(self):
        # Position turtle and draw triangle roof
        # Make sure it sits on top of the base
        pass`,
          hint: "The roof should be positioned at the top of the square base.",
          tip: "Calculate the roof position based on self.x, self.y, and self.size.",
          requirements: ["Roof method", "Proper positioning", "Triangle shape"],
          type: "method_implementation",
        },
        {
          instruction: "Add a complete draw method that draws the whole house",
          code: `    def draw(self):
        # Set the turtle color and draw the complete house
        # Call both draw_base and draw_roof
        pass
        
# Test your House class
house1 = House(80, 'blue', -100, 0)
house1.draw()

house2 = House(120, 'red', 100, 0)  
house2.draw()`,
          hint: "The draw method should coordinate drawing the entire house.",
          tip: "Use self.turtle.color(self.color) to set the color before drawing.",
          requirements: [
            "Complete draw method",
            "Uses color",
            "Calls other methods",
          ],
          type: "method_coordination",
        },
        {
          instruction: "Create a custom neighborhood with styled houses",
          code: `# Create multiple House objects with different properties
# Try different sizes, colors, and positions
# Add any extra features you want!`,
          hint: "Now you can easily create many different houses with custom properties.",
          tip: "Try adding features like doors, windows, or different roof styles!",
          requirements: [
            "Multiple objects",
            "Different properties",
            "Creative additions",
          ],
          type: "creative_showcase",
          bonus: "Add extra features like doors, windows, or different colors!",
        },
      ],
    },
  ];

  let currentTaskIndex = 0;
  let currentStepIndex = 0;

  // Enhanced task metadata
  function getTaskMetadata(task) {
    return {
      type: task.type,
      paradigm: task.paradigm || "none",
      aiAllowed: task.aiAllowed,
      aiChoice: task.aiChoice || "assigned",
      estimatedTime: task.estimatedTime,
      requirements: task.steps.flatMap((step) => step.requirements || []),
    };
  }

  function updateTutorialDisplay() {
    const task = tutorialTasks[currentTaskIndex];
    const step = task.steps[currentStepIndex];

    // Update task info with enhanced metadata
    document.querySelector(".task-title-text").textContent = task.title;
    document.getElementById("task-description").textContent = task.description;

    // Add task type and time estimate
    const taskHeader = document.querySelector(".current-task");
    if (taskHeader) {
      taskHeader.classList.add(`task-type-${task.type}`);

      // Add paradigm indicator
      if (task.paradigm) {
        const paradigmBadge = `<span class="paradigm-badge paradigm-${
          task.paradigm
        }">${task.paradigm.toUpperCase()}</span>`;
        document.querySelector(
          ".task-title-text"
        ).innerHTML = `${task.title} ${paradigmBadge}`;
      }
    }

    // Update step info with type-specific styling
    document.getElementById("step-counter").textContent = `${
      currentStepIndex + 1
    } of ${task.steps.length}`;
    document.getElementById("step-text").textContent = step.instruction;
    document.getElementById("code-example").textContent = step.code;

    // ADD: Update the code editor with the step's code
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

    // Update progress with task-aware calculation
    updateProgressDisplay();

    // Update current tips with enhanced information
    updateTipsDisplay(step, task);

    // Update all steps overview
    updateStepsOverview(task);

    // Update navigation buttons with task-aware logic
    updateNavigationButtons(task);

    // Handle AI availability
    updateAIAvailability(task);
  }

  // ADD: New function to update the code editor
  function updateCodeEditor(step, task) {
    // Get the CodeMirror editor instance (assuming it's stored globally)
    if (window.editor) {
      const shouldPopulateEditor =
        step.type === "demonstration" ||
        step.type === "guided_coding" ||
        step.type === "function_creation" ||
        step.type === "class_definition";

      if (shouldPopulateEditor) {
        // Set the editor content
        window.editor.setValue(step.code);

        // For demonstration steps, make the editor read-only temporarily
        if (step.type === "demonstration") {
          window.editor.setOption("readOnly", true);
          // Add a visual indicator that this is demonstration code
          window.editor.getWrapperElement().classList.add("demonstration-mode");
        } else {
          window.editor.setOption("readOnly", false);
          window.editor
            .getWrapperElement()
            .classList.remove("demonstration-mode");
        }
      } else if (step.type === "solo_practice" && step.aiBlocked) {
        // For solo practice, provide a clean starting template
        const templateCode = step.code.includes("# Try drawing")
          ? "import turtle\nt = turtle.Turtle()\n\n# Your triangle code here\n"
          : step.code;

        window.editor.setValue(templateCode);
        window.editor.setOption("readOnly", false);
        window.editor
          .getWrapperElement()
          .classList.remove("demonstration-mode");
      } else {
        // For other step types, provide the template/starter code
        window.editor.setValue(step.code);
        window.editor.setOption("readOnly", false);
        window.editor
          .getWrapperElement()
          .classList.remove("demonstration-mode");
      }

      // Position cursor at the end for editable content
      if (step.type !== "demonstration") {
        const lastLine = window.editor.lineCount() - 1;
        window.editor.setCursor(
          lastLine,
          window.editor.getLine(lastLine).length
        );
      }

      // Refresh the editor to ensure proper display
      setTimeout(() => {
        window.editor.refresh();
      }, 100);
    }
  }

  function updateProgressDisplay() {
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

    document.getElementById(
      "progress-fill"
    ).style.width = `${progressPercent}%`;
    document.getElementById("progress-text").textContent = `${task.type
      .replace("_", " ")
      .toUpperCase()} - Step ${currentStepIndex + 1}`;
  }

  function updateTipsDisplay(step, task) {
    let tipsHTML = `
      <div class="tip-item mb-2">
        <strong>Hint:</strong> ${step.hint}
      </div>
      <div class="tip-item mb-2">
        <strong>Tip:</strong> ${step.tip}
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
              .toUpperCase()} Approach:</strong> ${paradigmTips[task.paradigm]}
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
            ${step.requirements.map((req) => `<li>• ${req}</li>`).join("")}
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
          <strong>AI Assistance:</strong> ${aiGuidance}
        </div>
      `;
    } else {
      tipsHTML += `
        <div class="tip-item no-ai">
          <strong>Independent Work:</strong> Try this on your own without AI assistance.
        </div>
      `;
    }

    document.getElementById("current-tips").innerHTML = tipsHTML;
  }

  function updateStepsOverview(task) {
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

  function updateNavigationButtons(task) {
    document.getElementById("prev-substep-btn").disabled =
      currentStepIndex === 0;
    document.getElementById("next-substep-btn").disabled =
      currentStepIndex === task.steps.length - 1;
    document.getElementById("prev-task-btn").disabled = currentTaskIndex === 0;
    document.getElementById("next-task-btn").disabled =
      currentTaskIndex === tutorialTasks.length - 1;

    // Update task completion button
    const completeBtn = document.getElementById("mark-complete-btn");
    if (completeBtn) {
      completeBtn.textContent = task.completed
        ? "✅ Task Completed"
        : "✅ Mark Task Complete";
      completeBtn.disabled = task.completed;
    }
  }

  function updateAIAvailability(task) {
    // Signal to the AI components whether they should be available
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

  // Rest of the existing functions with enhanced logging
  function loadStep(stepIdx) {
    const task = tutorialTasks[currentTaskIndex];
    if (stepIdx < 0 || stepIdx >= task.steps.length) return;

    currentStepIndex = stepIdx;
    updateTutorialDisplay();

    // Enhanced logging
    eventLogger.logEvent("step_loaded", {
      taskIndex: currentTaskIndex,
      stepIndex: stepIdx,
      stepType: task.steps[stepIdx].type,
      taskType: task.type,
      paradigm: task.paradigm,
      aiAllowed: task.aiAllowed,
    });
  }

  function loadTaskAndStep(taskIdx, stepIdx) {
    if (taskIdx < 0 || taskIdx >= tutorialTasks.length) return;

    const oldTask = tutorialTasks[currentTaskIndex];
    const newTask = tutorialTasks[taskIdx];

    currentTaskIndex = taskIdx;
    currentStepIndex = Math.max(0, Math.min(stepIdx, newTask.steps.length - 1));
    updateTutorialDisplay();

    // Enhanced task transition logging
    eventLogger.logEvent("task_loaded", {
      fromTaskIndex: currentTaskIndex !== taskIdx ? currentTaskIndex : null,
      toTaskIndex: taskIdx,
      fromParadigm: oldTask?.paradigm,
      toParadigm: newTask.paradigm,
      taskType: newTask.type,
      aiTransition: {
        from: oldTask?.aiAllowed,
        to: newTask.aiAllowed,
      },
    });
  }

  // Enhanced setup function
  function setupToggleListeners() {
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
    document
      .getElementById("toggle-all-steps")
      ?.addEventListener("click", () => {
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

  // Make loadStep globally accessible
  window.loadStep = loadStep;

  // Initialize
  setupToggleListeners();
  updateTutorialDisplay();

  return {
    tutorialTasks,
    currentTaskIndex,
    currentStepIndex,
    loadTaskAndStep,
    loadStep,
    getTaskMetadata,
    markTaskCompleted: (taskIndex) => {
      if (taskIndex >= 0 && taskIndex < tutorialTasks.length) {
        tutorialTasks[taskIndex].completed = true;
        updateTutorialDisplay();
        eventLogger.logEvent("task_completed", {
          taskIndex,
          taskType: tutorialTasks[taskIndex].type,
          paradigm: tutorialTasks[taskIndex].paradigm,
        });
      }
    },
    nextTask: () => loadTaskAndStep(currentTaskIndex + 1, 0),
    prevTask: () => loadTaskAndStep(currentTaskIndex - 1, 0),
    nextStep: () => {
      const task = tutorialTasks[currentTaskIndex];
      if (currentStepIndex < task.steps.length - 1) {
        loadStep(currentStepIndex + 1);
      }
    },
    prevStep: () => {
      if (currentStepIndex > 0) {
        loadStep(currentStepIndex - 1);
      }
    },
  };
}
