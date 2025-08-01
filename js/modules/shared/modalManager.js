export class ModalManager {
  constructor(modalId, eventLogger = null) {
    this.modalId = modalId;
    this.modal = document.getElementById(modalId);
    this.eventLogger = eventLogger;
    this.isVisible = false;

    if (!this.modal) {
      console.error(`Modal with id "${modalId}" not found`);
      return;
    }

    this.setupBaseEventListeners();
  }

  show(logData = {}) {
    if (!this.modal) return;

    this.modal.style.display = "flex";
    this.modal.style.opacity = "1";
    this.isVisible = true;

    // Log modal shown event
    this.eventLogger?.logEvent(`${this.modalId}_shown`, {
      timestamp: new Date().toISOString(),
      ...logData,
    });

    console.log(`${this.modalId} modal shown`);
  }

  hide(logData = {}) {
    if (!this.modal) return;

    console.log(`Hiding ${this.modalId} modal...`);

    // Animate hide
    this.modal.style.opacity = "0";

    setTimeout(() => {
      this.modal.style.display = "none";
      this.modal.style.opacity = "1"; // Reset for next time
      this.isVisible = false;

      // Log modal hidden event
      this.eventLogger?.logEvent(`${this.modalId}_hidden`, {
        timestamp: new Date().toISOString(),
        ...logData,
      });

      console.log(`✅ ${this.modalId} modal hidden`);
    }, 300);
  }

  setupBaseEventListeners() {
    // Prevent modal from closing when clicking inside content
    const modalContent = this.modal?.querySelector(".modal-content");
    if (modalContent) {
      modalContent.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    // Allow closing with ESC key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isVisible) {
        this.hide({ closedBy: "escape_key" });
      }
    });
  }

  // Helper method to add custom event listeners
  addEventListeners(listeners) {
    listeners.forEach(({ selector, event, handler }) => {
      const element =
        this.modal?.querySelector(selector) ||
        document.getElementById(selector);
      if (element) {
        element.addEventListener(event, handler);
      } else {
        console.warn(
          `Element with selector "${selector}" not found in ${this.modalId}`
        );
      }
    });
  }

  // Helper method to update modal content
  updateContent(updates) {
    updates.forEach(({ selector, property, value }) => {
      const element =
        this.modal?.querySelector(selector) ||
        document.getElementById(selector);
      if (element) {
        if (property === "text") {
          element.textContent = value;
        } else if (property === "html") {
          element.innerHTML = value;
        } else {
          element[property] = value;
        }
      }
    });
  }
}
