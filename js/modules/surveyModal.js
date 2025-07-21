/* filepath: /js/modules/surveyModal.js */

export function initializeSurveyModal(eventLogger) {
  // Single survey URL for all post-task surveys
  const surveyUrl = "https://forms.office.com/e/qjNtDVmUKJ";

  function showSurveyModal(taskIndex, taskName, aiCondition) {
    const modal = document.getElementById("survey-modal");
    const taskNameElement = document.getElementById("completed-task-name");
    const surveyLinkBtn = document.getElementById("survey-link-btn");

    if (!modal) {
      console.error("Survey modal elements not found");
      return;
    }

    // Update modal content
    taskNameElement.textContent = taskName;

    // Set the survey URL (same for all conditions)
    surveyLinkBtn.href = surveyUrl;

    // Log survey modal shown
    eventLogger.logEvent("survey_modal_shown", {
      taskIndex,
      taskName,
      aiCondition,
      surveyUrl,
      timestamp: new Date().toISOString(),
    });

    // Show modal
    modal.style.display = "flex";
    console.log(
      `Survey modal shown for ${taskName} with ${aiCondition} condition`
    );
  }

  function hideSurveyModal() {
    const modal = document.getElementById("survey-modal");

    if (!modal) {
      console.error("Survey modal not found during hide");
      return;
    }

    console.log("Hiding survey modal...");

    // Hide modal with animation
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.style.display = "none";
      modal.style.opacity = "1"; // Reset opacity for next time

      console.log("✅ Survey modal hidden");
    }, 300);
  }

  function setupSurveyModalEventListeners() {
    const continueBtn = document.getElementById("continue-after-survey-btn");
    const surveyLinkBtn = document.getElementById("survey-link-btn");

    console.log("Setting up survey modal event listeners...");

    if (continueBtn) {
      continueBtn.addEventListener("click", () => {
        console.log("Continue after survey button clicked!");

        eventLogger.logEvent("survey_completed_continue", {
          timestamp: new Date().toISOString(),
        });

        // Simply hide the modal - no task progression logic here
        hideSurveyModal();
      });
    }

    if (surveyLinkBtn) {
      surveyLinkBtn.addEventListener("click", () => {
        console.log("Survey link clicked!");

        eventLogger.logEvent("survey_link_clicked", {
          url: surveyLinkBtn.href,
          timestamp: new Date().toISOString(),
        });
      });
    }

    // Prevent modal from closing when clicking inside
    const modalContent = document.querySelector("#survey-modal .modal-content");
    if (modalContent) {
      modalContent.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    // Allow closing with ESC key
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        document.getElementById("survey-modal").style.display === "flex"
      ) {
        hideSurveyModal();
      }
    });
  }

  return {
    showSurveyModal,
    hideSurveyModal,
    setupSurveyModalEventListeners,
  };
}
