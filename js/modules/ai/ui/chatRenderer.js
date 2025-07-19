/* filepath: /js/modules/ai/ui/chatRenderer.js */
import { CodeBlockRenderer } from './codeBlockRenderer.js';
import { formatMessageContent } from '../utils/formatters.js';

export class ChatRenderer {
  constructor(domElements, aiAssistant) {
    this.domElements = domElements;
    this.aiAssistant = aiAssistant;
    this.codeBlockRenderer = new CodeBlockRenderer(aiAssistant);
  }

  createChatMessage(content, sender, codeBlock = null) {
    const chatContainer = this.domElements.chatContainer;

    const messageDiv = document.createElement("div");
    messageDiv.classList.add(
      "chat-message",
      `${sender}-message`,
      "mb-4",
      "p-3",
      "rounded"
    );

    // Add header
    const headerDiv = this.createMessageHeader(sender);
    messageDiv.appendChild(headerDiv);

    // Add formatted content
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("text-sm", "mb-2", "leading-relaxed");
    contentDiv.innerHTML = formatMessageContent(content);
    messageDiv.appendChild(contentDiv);

    // Add code block if provided
    if (codeBlock && sender === "ai") {
      const codeContainer = this.codeBlockRenderer.createCodeBlock(codeBlock);
      messageDiv.appendChild(codeContainer);
    }

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return messageDiv;
  }

  createMessageHeader(sender) {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const headerDiv = document.createElement("div");
    headerDiv.classList.add(
      "mb-1",
      "text-xs",
      "font-semibold",
      "flex",
      "items-center",
      "justify-between"
    );

    const senderDiv = document.createElement("div");
    senderDiv.classList.add("flex", "items-center");

    if (sender === "ai") {
      senderDiv.innerHTML = `
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>AI Assistant`;

      const actionsDiv = this.createActionButtons();
      headerDiv.appendChild(senderDiv);
      headerDiv.appendChild(actionsDiv);
    } else if (sender === "user") {
      senderDiv.innerHTML = `
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <span>You</span>
          <span class="ml-2 text-gray-500">${timestamp}</span>
        </div>`;
      headerDiv.appendChild(senderDiv);
    } else {
      senderDiv.textContent = "System";
      headerDiv.appendChild(senderDiv);
    }

    return headerDiv;
  }

  createActionButtons() {
    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("flex", "space-x-2");

    // Copy button
    const copyBtn = this.createCopyButton();
    actionsDiv.appendChild(copyBtn);

    // Clear conversation button
    const clearBtn = this.createClearButton();
    actionsDiv.appendChild(clearBtn);

    return actionsDiv;
  }

  createCopyButton() {
    const copyBtn = document.createElement("button");
    copyBtn.innerHTML = `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
    copyBtn.title = "Copy to clipboard";
    copyBtn.classList.add("text-gray-400", "hover:text-white", "p-1", "rounded");
    
    copyBtn.addEventListener("click", (e) => {
      const messageDiv = e.target.closest('.chat-message');
      const textToCopy = messageDiv.textContent;
      navigator.clipboard.writeText(textToCopy);
      copyBtn.classList.add("text-green-500");
      setTimeout(() => copyBtn.classList.remove("text-green-500"), 1000);
    });

    return copyBtn;
  }

  createClearButton() {
    const clearBtn = document.createElement("button");
    clearBtn.innerHTML = `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;
    clearBtn.title = "Clear conversation";
    clearBtn.classList.add("text-gray-400", "hover:text-red-400", "p-1", "rounded");
    
    clearBtn.addEventListener("click", () => {
      if (confirm("Clear conversation history? This will start a fresh conversation.")) {
        this.aiAssistant.clearHistory();
      }
    });

    return clearBtn;
  }

  removeLastMessage() {
    const chatContainer = this.domElements.chatContainer;
    if (chatContainer && chatContainer.lastChild) {
      chatContainer.removeChild(chatContainer.lastChild);
    }
  }

  clearChat() {
    const chatContainer = this.domElements.chatContainer;
    chatContainer.innerHTML = '<div class="text-center text-gray-500 text-xs py-4">Conversation cleared. Start a new conversation!</div>';
  }
}