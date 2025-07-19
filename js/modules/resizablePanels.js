/* filepath: /js/modules/resizablePanels.js */
import { refreshCodeMirrorSize } from './codeMirrorSetup.js';

export function setupResizablePanels(domElements, containerManager) {
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  // Create throttled version of refreshTurtleContainer
  const throttledRefreshTurtleContainer = throttle(containerManager.refreshTurtleContainer, 16);

  function setupHorizontalResizer(resizerId, leftElementId, rightElementId) {
    const resizer = document.getElementById(resizerId);
    const leftElement = document.getElementById(leftElementId);
    const rightElement = document.getElementById(rightElementId);

    if (!resizer || !leftElement || !rightElement) {
      console.warn(`Horizontal resizer setup failed: ${resizerId}`);
      return;
    }

    let isResizing = false;
    let startX = 0;
    let startLeftWidth = 0;
    let startRightWidth = 0;

    resizer.addEventListener("mousedown", (e) => {
      isResizing = true;
      startX = e.clientX;

      const leftRect = leftElement.getBoundingClientRect();
      const rightRect = rightElement.getBoundingClientRect();

      startLeftWidth = leftRect.width;
      startRightWidth = rightRect.width;

      document.body.classList.add("resizing");

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      e.preventDefault();
    });

    function handleMouseMove(e) {
      if (!isResizing) return;

      const deltaX = e.clientX - startX;
      const newLeftWidth = startLeftWidth + deltaX;
      const newRightWidth = startRightWidth - deltaX;

      // Apply min/max constraints
      const minWidth = 200;
      const maxWidth = window.innerWidth * 0.5;

      if (
        newLeftWidth >= minWidth &&
        newLeftWidth <= maxWidth &&
        newRightWidth >= minWidth &&
        newRightWidth <= maxWidth
      ) {
        leftElement.style.width = `${newLeftWidth}px`;
        rightElement.style.width = `${newRightWidth}px`;

        // Update flex properties
        leftElement.style.flex = "none";
        rightElement.style.flex = "none";

        // Use throttled refresh for smooth real-time resizing
        if (leftElementId === "main-content" || rightElementId === "main-content") {
          throttledRefreshTurtleContainer();
        }
      }
    }

    function handleMouseUp() {
      isResizing = false;
      document.body.classList.remove("resizing");
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // Final refresh after resize is complete
      if (leftElementId === "main-content" || rightElementId === "main-content") {
        setTimeout(() => {
          containerManager.refreshTurtleContainer();
          refreshCodeMirrorSize();
        }, 50);
      }
    }
  }

  function setupVerticalResizer(resizerId, topElementId, bottomElementId) {
    const resizer = document.getElementById(resizerId);
    const topElement = document.getElementById(topElementId);
    const bottomElement = document.getElementById(bottomElementId);

    if (!resizer || !topElement || !bottomElement) {
      console.warn(`Vertical resizer setup failed: ${resizerId}`);
      return;
    }

    let isResizing = false;
    let startY = 0;
    let startTopHeight = 0;
    let startBottomHeight = 0;

    resizer.addEventListener("mousedown", (e) => {
      isResizing = true;
      startY = e.clientY;

      const topRect = topElement.getBoundingClientRect();
      const bottomRect = bottomElement.getBoundingClientRect();

      startTopHeight = topRect.height;
      startBottomHeight = bottomRect.height;

      document.body.classList.add("resizing");

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      e.preventDefault();
    });

    function handleMouseMove(e) {
      if (!isResizing) return;

      const deltaY = e.clientY - startY;
      const newTopHeight = startTopHeight + deltaY;
      const newBottomHeight = startBottomHeight - deltaY;

      // Apply min height constraints
      const minHeight = 150;

      if (newTopHeight >= minHeight && newBottomHeight >= minHeight) {
        topElement.style.height = `${newTopHeight}px`;
        bottomElement.style.height = `${newBottomHeight}px`;

        // Update flex properties to override CSS
        topElement.style.flex = "none";
        bottomElement.style.flex = "none";

        // Immediately refresh CodeMirror during resize
        refreshCodeMirrorSize();
        containerManager.refreshTurtleContainer();
      }
    }

    function handleMouseUp() {
      isResizing = false;
      document.body.classList.remove("resizing");
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // Final refresh after resize is complete
      setTimeout(() => {
        refreshCodeMirrorSize();
        containerManager.refreshTurtleContainer();
      }, 50);
    }
  }

  // Setup all resizers
  console.log("Setting up resizable panels");

  // Horizontal resizers (left and right sidebars)
  setupHorizontalResizer("resizer-left", "left-sidebar", "main-content");
  setupHorizontalResizer("resizer-right", "main-content", "right-sidebar");

  // Vertical resizer (editor vs output)
  setupVerticalResizer("vertical-resizer", "editor-pane", "output-pane");

  console.log("Resizable panels setup complete");

  return {
    setupHorizontalResizer,
    setupVerticalResizer,
  };
}