/* filepath: /js/modules/containerManagement.js */
export function initializeContainerManagement(domElements) {
  function refreshTurtleContainer() {
    const container = domElements.turtleContainer;
    if (!container) {
      console.error("Turtle container not found");
      return;
    }

    // Find the parent container (canvas-container)
    const parentContainer = container.parentElement;
    if (!parentContainer) {
      console.error("Parent container not found");
      return;
    }

    // Calculate available size - provide fallback dimensions
    const containerWidth = parentContainer.clientWidth || 400;
    const containerHeight = parentContainer.clientHeight || 300;

    console.log(
      `Refreshing turtle container to ${containerWidth}x${containerHeight}`
    );

    // Update container dimensions
    container.style.width = containerWidth + "px";
    container.style.height = containerHeight + "px";

    // Update Skulpt TurtleGraphics configuration for NEW canvases only
    if (typeof Sk !== "undefined") {
      Sk.TurtleGraphics = {
        target: "turtle-container",
        width: containerWidth,
        height: containerHeight,
        animate: true,
        delay: 100,
      };
      console.log("Updated Skulpt TurtleGraphics configuration for new canvases");
    }

    console.log("Container dimensions updated");
  }

  function debugContainerStatus() {
    const container = domElements.turtleContainer;
    if (!container) {
      console.error("❌ Turtle container not found during debug");
      return;
    }

    console.log("=== CONTAINER DEBUG ===");
    console.log("Container element:", container);
    console.log("Container dimensions:", {
      width: container.offsetWidth,
      height: container.offsetHeight,
      clientWidth: container.clientWidth,
      clientHeight: container.clientHeight
    });
    console.log("Container styles:", {
      width: container.style.width,
      height: container.style.height,
      position: container.style.position,
      overflow: container.style.overflow
    });
    console.log("Number of children:", container.children.length);
    
    for (let i = 0; i < container.children.length; i++) {
      const child = container.children[i];
      console.log(`Child ${i}:`, {
        tagName: child.tagName,
        width: child.width,
        height: child.height,
        styleWidth: child.style.width,
        styleHeight: child.style.height,
        position: child.style.position,
        display: child.style.display,
        visibility: child.style.visibility,
      });
    }
    console.log("======================");
  }

  function setupContainerResizeObserver() {
    const container = domElements.turtleContainer;
    if (!container) return;

    // Use ResizeObserver to watch for container size changes
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        refreshTurtleContainer();
      });

      resizeObserver.observe(container.parentElement);
      console.log("Container resize observer set up");
    }
  }

  // Initialize container on load
  setTimeout(() => {
    refreshTurtleContainer();
    debugContainerStatus();
    setupContainerResizeObserver();
  }, 100);

  console.log("Container management initialized");

  return {
    refreshTurtleContainer,
    debugContainerStatus,
    setupContainerResizeObserver,
  };
}