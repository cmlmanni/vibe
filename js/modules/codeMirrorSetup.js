/* filepath: /js/modules/codeMirrorSetup.js */
export function setupCodeMirror(textArea) {
  const editor = CodeMirror.fromTextArea(textArea, {
    mode: { name: "python", version: 3, singleLineStringErrors: false },
    lineNumbers: true,
    indentUnit: 4,
    indentWithTabs: false, // Use spaces for indentation (Python standard)
    smartIndent: true,
    electricChars: true,
    theme: "dracula",
    lineWrapping: true,
    viewportMargin: Infinity,
    scrollbarStyle: "native",
    extraKeys: {
      "Ctrl-Space": "autocomplete",
      "Ctrl-/": "toggleComment",
      "Cmd-/": "toggleComment",
      Tab: "indentMore",
      "Shift-Tab": "indentLess",
    },
    // Add these options for better initialization
    autofocus: true,
    autoRefresh: true, // Helps with visibility issues
  });

  // Make it accessible globally
  window.editor = editor;

  // Function to convert tabs to spaces
  const convertTabsToSpaces = (text) => {
    return text.replace(/\t/g, "    "); // Convert tabs to 4 spaces
  };

  // Function to ensure consistent indentation
  const normalizeIndentation = (code) => {
    return convertTabsToSpaces(code);
  };

  // Add event listener for paste events to convert tabs to spaces
  editor.on("beforeChange", function (instance, change) {
    if (change.origin === "paste" || change.origin === "+input") {
      const newText = change.text.map((line) => convertTabsToSpaces(line));
      change.update(change.from, change.to, newText);
    }
  });

  // Set default code with proper spacing
  editor.setValue(
    normalizeIndentation(`import turtle

# Your code here`)
  );

  // Force immediate sizing and focus
  setTimeout(() => {
    editor.setSize("100%", "100%");
    editor.refresh();
    editor.focus(); // Ensure editor has focus
    console.log("CodeMirror initialized with focus");
  }, 100);

  // Add event listener for when modal is dismissed
  const modal = document.getElementById("experiment-modal");
  if (modal) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          if (modal.style.display === "none") {
            // Modal was hidden, refresh editor
            setTimeout(() => {
              editor.refresh();
              editor.focus();
              console.log("CodeMirror refreshed after modal dismissed");
            }, 100);
          }
        }
      });
    });

    observer.observe(modal, { attributes: true, attributeFilter: ["style"] });
  }

  return editor;
}

export function refreshCodeMirrorSize() {
  if (window.editor) {
    window.editor.setSize("100%", "100%");
    window.editor.refresh();
    window.editor.focus(); // Add focus refresh
    console.log("CodeMirror size and focus refreshed");
  }
}

// New function to ensure editor is ready
export function ensureEditorReady() {
  if (window.editor) {
    window.editor.refresh();
    window.editor.focus();

    // Force a layout recalculation
    const editorElement = window.editor.getWrapperElement();
    if (editorElement) {
      editorElement.style.height = "100%";
      window.editor.setSize("100%", "100%");
    }

    console.log("Editor forced ready");
  }
}

// Utility function to normalize indentation (convert tabs to spaces)
export function normalizeIndentation(code) {
  return code.replace(/\t/g, "    "); // Convert tabs to 4 spaces
}

// Function to set code in editor with normalized indentation
export function setEditorCode(code) {
  if (window.editor) {
    const normalizedCode = normalizeIndentation(code);
    window.editor.setValue(normalizedCode);
  }
}
