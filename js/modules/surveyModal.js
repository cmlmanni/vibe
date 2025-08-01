/* filepath: js/modules/surveyModal.js */
import { ModalManager } from "./shared/modalManager.js";

export function initializeSurveyModal(eventLogger) {
  const surveyUrl = "https://forms.office.com/e/qjNtDVmUKJ";
  const modalManager = new ModalManager("survey-modal", eventLogger);

  function showSurveyModal(taskIndex, taskName, aiCondition) {
    if (!modalManager.modal) {
      console.error("Survey modal elements not found");
      return;
    }

    // Update modal content using the helper method
    modalManager.updateContent([
      { selector: "#completed-task-name", property: "text", value: taskName },
      { selector: "#survey-link-btn", property: "href", value: surveyUrl },
    ]);

    // Show modal with specific log data
    modalManager.show({
      taskIndex,
      taskName,
      aiCondition,
      surveyUrl,
    });

    console.log(
      `Survey modal shown for ${taskName} with ${aiCondition} condition`
    );
  }

  function hideSurveyModal() {
    modalManager.hide();
  }

  function setupSurveyModalEventListeners() {
    console.log("Setting up survey modal event listeners...");

    // Use the helper method to add event listeners
    modalManager.addEventListeners([
      {
        selector: "#continue-after-survey-btn",
        event: "click",
        handler: () => {
          console.log("Continue after survey button clicked!");

          eventLogger.logEvent("survey_completed_continue", {
            timestamp: new Date().toISOString(),
          });

          hideSurveyModal();
        },
      },
      {
        selector: "#survey-link-btn",
        event: "click",
        handler: (e) => {
          console.log("Survey link clicked!");

          eventLogger.logEvent("survey_link_clicked", {
            url: e.target.href,
            timestamp: new Date().toISOString(),
          });
        },
      },
    ]);
  }

  return {
    showSurveyModal,
    hideSurveyModal,
    setupSurveyModalEventListeners,
  };
}
