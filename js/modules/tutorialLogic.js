/* filepath: /js/modules/tutorialLogic.js */
export function initializeTutorial(domElements, eventLogger) {
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
    {
      title: "Task 3: Draw a Triangle",
      completed: false,
      steps: [
        "Import the turtle module to start drawing.",
        "Create a turtle object for your commands.",
        "Use a for loop with range(3) to draw the three sides of a triangle.",
        "Move forward by 100 pixels for each side.",
        "Turn left by 120 degrees after each side (external angle of triangle).",
      ],
    },
    {
      title: "Task 4: Draw a Circle",
      completed: false,
      steps: [
        "Import the turtle module.",
        "Create a turtle object.",
        "Use the circle() method to draw a circle with radius 50.",
        "Try changing the radius to see different sized circles.",
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
    domElements.taskTitle.textContent = task.completed
      ? `${task.title} ✅`
      : task.title;

    loadStep(stepIdx);
    updateNavigationButtons();
    eventLogger.logEvent("task_loaded", { taskIndex: taskIdx });
  }

  function loadStep(stepIdx) {
    const task = tutorialTasks[currentTaskIndex];
    if (stepIdx < 0 || stepIdx >= task.steps.length) return;
    currentStepIndex = stepIdx;
    domElements.stepText.textContent = `(${stepIdx + 1}/${task.steps.length}) ${
      task.steps[stepIdx]
    }`;

    domElements.prevSubstepBtn.disabled = stepIdx === 0;
    domElements.nextSubstepBtn.disabled = stepIdx === task.steps.length - 1;
    eventLogger.logEvent("step_loaded", { stepIndex: stepIdx });
  }

  function updateNavigationButtons() {
    // Previous task button
    domElements.prevTaskBtn.disabled = currentTaskIndex === 0;

    // Next task button logic
    const isLastTask = currentTaskIndex === tutorialTasks.length - 1;
    const currentTaskCompleted = tutorialTasks[currentTaskIndex].completed;

    // For tasks beyond the first, also check if previous task is completed
    let canProceed = true;
    if (currentTaskIndex < tutorialTasks.length - 1) {
      canProceed = currentTaskCompleted;
    }

    domElements.nextTaskBtn.disabled = isLastTask || !canProceed;

    // Update button text and styling based on completion status
    if (!canProceed && !isLastTask) {
      domElements.nextTaskBtn.textContent = "Complete Current Task First";
      domElements.nextTaskBtn.classList.add("opacity-50", "cursor-not-allowed");
    } else if (isLastTask) {
      domElements.nextTaskBtn.textContent = "Last Task";
      domElements.nextTaskBtn.classList.add("opacity-50", "cursor-not-allowed");
    } else {
      domElements.nextTaskBtn.textContent = "Next Task";
      domElements.nextTaskBtn.classList.remove(
        "opacity-50",
        "cursor-not-allowed"
      );
    }
  }

  function markTaskCompleted(taskIndex) {
    if (taskIndex >= 0 && taskIndex < tutorialTasks.length) {
      tutorialTasks[taskIndex].completed = true;
      updateNavigationButtons();
      eventLogger.logEvent("task_completed", { taskIndex });
      console.log(`Task ${taskIndex + 1} marked as completed`);
    }
  }

  // Navigation functions
  function nextTask() {
    loadTaskAndStep(currentTaskIndex + 1, 0);
  }

  function prevTask() {
    loadTaskAndStep(currentTaskIndex - 1, 0);
  }

  function nextStep() {
    const task = tutorialTasks[currentTaskIndex];
    if (currentStepIndex < task.steps.length - 1) {
      loadStep(currentStepIndex + 1);
    }
  }

  function prevStep() {
    if (currentStepIndex > 0) {
      loadStep(currentStepIndex - 1);
    }
  }

  return {
    tutorialTasks,
    currentTaskIndex,
    currentStepIndex,
    loadTaskAndStep,
    loadStep,
    updateNavigationButtons,
    markTaskCompleted,
    nextTask,
    prevTask,
    nextStep,
    prevStep,
  };
}
