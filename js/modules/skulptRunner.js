/* filepath: /js/modules/skulptRunner.js */
export function initializeSkulpt(domElements, eventLogger) {
  let isCodeRunning = false;

  function outputTerminal(text) {
    domElements.terminalOutput.innerHTML += text;
    domElements.terminalOutput.scrollTop = domElements.terminalOutput.scrollHeight;
  }

  function clearTerminal() {
    domElements.terminalOutput.innerHTML = "";
  }

  function clearTurtleContainer() {
    const container = domElements.turtleContainer;
    if (container) {
      container.innerHTML = "";
      console.log("Turtle container cleared");
    }
  }

  function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[x] === undefined) {
      throw "File not found: '" + x + "'";
    }
    return Sk.builtinFiles.files[x];
  }

  function runCode() {
    if (isCodeRunning) {
      console.log("Code is already running, ignoring request");
      return;
    }

    const code = window.editor.getValue();
    eventLogger.logEvent("code_execution_started", { code });

    isCodeRunning = true;
    domElements.runBtn.disabled = true;
    domElements.runBtn.textContent = "Running...";

    clearTerminal();
    outputTerminal("Running code...\n");

    // Configure Skulpt
    Sk.pre = "output";
    Sk.configure({
      output: outputTerminal,
      read: builtinRead,
      __future__: Sk.python3,
    });

    // Configure turtle graphics
    const container = domElements.turtleContainer;
    const containerWidth = container.clientWidth || 400;
    const containerHeight = container.clientHeight || 300;

    Sk.TurtleGraphics = {
      target: "turtle-container",
      width: containerWidth,
      height: containerHeight,
      animate: true,
      delay: 100,
    };

    // Run the code
    Sk.misceval
      .asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, code, true))
      .then(
        () => {
          outputTerminal("\nCode execution completed successfully! ✅\n");
          eventLogger.logEvent("code_execution_success", { code });
        },
        (err) => {
          outputTerminal(`\nError: ${err.toString()}\n`);
          eventLogger.logEvent("code_execution_error", { code, error: err.toString() });
          console.error("Skulpt error:", err);
        }
      )
      .finally(() => {
        isCodeRunning = false;
        domElements.runBtn.disabled = false;
        domElements.runBtn.textContent = "▶ Run";
      });
  }

  function resetAll() {
    eventLogger.logEvent("reset_triggered");
    
    // Clear terminal
    clearTerminal();
    outputTerminal("Environment reset ✅\n");

    // Clear turtle graphics
    clearTurtleContainer();

    // Reset code editor to default
    if (window.editor) {
      window.editor.setValue(`import turtle

# Your code here`);
    }

    // Stop any running code
    if (isCodeRunning) {
      // Unfortunately, Skulpt doesn't have a clean way to interrupt execution
      // We can only disable the button and reset state
      isCodeRunning = false;
      domElements.runBtn.disabled = false;
      domElements.runBtn.textContent = "▶ Run";
    }

    console.log("Environment reset complete");
  }

  // Initialize Skulpt on module load
  console.log("Skulpt runner initialized");

  return {
    runCode,
    resetAll,
    clearTerminal,
    clearTurtleContainer,
    outputTerminal,
  };
}