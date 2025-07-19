/* filepath: /js/modules/codeMirrorSetup.js */
export function setupCodeMirror(textArea) {
  const editor = CodeMirror.fromTextArea(textArea, {
    mode: { name: "python", version: 3, singleLineStringErrors: false },
    lineNumbers: true,
    indentUnit: 4,
    theme: "dracula",
    lineWrapping: true,
    viewportMargin: Infinity,
    scrollbarStyle: "native",
    extraKeys: {
      "Ctrl-Space": "autocomplete",
    },
  });

  // Make it accessible globally
  window.editor = editor;

  // Set default code
  editor.setValue(`import turtle

# Your code here`);

  // Force CodeMirror to use available space
  setTimeout(() => {
    editor.setSize("100%", "100%");
    editor.refresh();
    console.log("CodeMirror sized to fill container");
  }, 100);

  return editor;
}

export function refreshCodeMirrorSize() {
  if (window.editor) {
    window.editor.setSize("100%", "100%");
    window.editor.refresh();
    console.log("CodeMirror size refreshed to fill container");
  }
}
