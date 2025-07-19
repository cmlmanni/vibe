/* filepath: /js/modules/ai/ui/codeBlockRenderer.js */
export class CodeBlockRenderer {
  constructor(aiAssistant) {
    this.aiAssistant = aiAssistant;
  }

  createCodeBlock(codeBlock) {
    const codeContainer = document.createElement("div");
    codeContainer.classList.add(
      "code-suggestion",
      "mt-2",
      "rounded",
      "overflow-hidden",
      "border",
      "border-gray-700"
    );

    const codeHeader = this.createCodeHeader(codeBlock);
    const codeContent = this.createCodeContent(codeBlock);

    codeContainer.appendChild(codeHeader);
    codeContainer.appendChild(codeContent);

    return codeContainer;
  }

  createCodeHeader(codeBlock) {
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

    const buttonGroup = this.createCodeButtons(codeBlock);
    codeHeader.appendChild(buttonGroup);

    return codeHeader;
  }

  createCodeButtons(codeBlock) {
    const buttonGroup = document.createElement("div");
    buttonGroup.classList.add("flex", "gap-1");

    const replaceButton = this.createReplaceButton(codeBlock);
    const insertButton = this.createInsertButton(codeBlock);

    buttonGroup.appendChild(replaceButton);
    buttonGroup.appendChild(insertButton);

    return buttonGroup;
  }

  createReplaceButton(codeBlock) {
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

    applyButton.addEventListener("click", () => {
      if (window.editor) {
        window.editor.setValue(codeBlock);
        console.log("Applied code to editor");
        this.aiAssistant.addToHistory(
          "system",
          `User applied suggested code: ${codeBlock.substring(0, 100)}...`
        );
      }
    });

    return applyButton;
  }

  createInsertButton(codeBlock) {
    const insertButton = document.createElement("button");
    insertButton.textContent = "Insert at Cursor";
    insertButton.classList.add(
      "px-2",
      "py-0.5",
      "bg-gray-600",
      "hover:bg-gray-700",
      "rounded",
      "text-xs",
      "text-white"
    );

    insertButton.addEventListener("click", () => {
      if (window.editor) {
        const cursor = window.editor.getCursor();
        window.editor.replaceRange(codeBlock, cursor);
        console.log("Inserted code at cursor");
        this.aiAssistant.addToHistory(
          "system",
          `User inserted suggested code at cursor: ${codeBlock.substring(
            0,
            100
          )}...`
        );
      }
    });

    return insertButton;
  }

  createCodeContent(codeBlock) {
    const codeContent = document.createElement("pre");
    codeContent.classList.add("p-3", "bg-gray-900", "overflow-x-auto");

    const codeText = document.createElement("code");
    codeText.textContent = codeBlock;
    codeText.classList.add("text-xs", "font-mono", "text-gray-300");

    codeContent.appendChild(codeText);
    return codeContent;
  }
}
