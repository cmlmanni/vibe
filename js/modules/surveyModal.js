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

    // Check if this is Task 2 (index 3) - show congratulations instead of survey
    const isTask2 = taskIndex === 3 && taskName.includes("House Class");

    if (isTask2) {
      // Show congratulations message for Task 2 with survey link
      modalManager.updateContent([
        { selector: "#completed-task-name", property: "text", value: taskName },
        {
          selector: ".modal-title",
          property: "text",
          value: "🎉 Congratulations!",
        },
        {
          selector: ".intro-section h3",
          property: "text",
          value: "🏆 Excellent Work!",
        },
        {
          selector: ".intro-section p",
          property: "html",
          value: `
          You've successfully completed <strong>${taskName}</strong>! 
          You've mastered the fundamentals of object-oriented programming and 
          created your own reusable House class. This is a significant 
          achievement in your programming journey!
        `,
        },
        { selector: "#survey-link-btn", property: "href", value: surveyUrl },
        {
          selector: "#continue-after-survey-btn",
          property: "text",
          value: "🎉 Complete Post-Task Survey",
        },
      ]);

      // Update survey section content for Task 2
      const surveySection = modalManager.modal.querySelector(".survey-section");
      const surveyLinkSection = modalManager.modal.querySelector(
        ".survey-link-section"
      );
      const footerNote = modalManager.modal.querySelector(".footer-note");

      if (surveySection) {
        surveySection.style.display = "block";
        const surveyTitle = surveySection.querySelector("h3");
        if (surveyTitle)
          surveyTitle.textContent = "📋 Next Step: Post-Task Survey";
      }
      // Hide the blue survey link button for Task 2 - we only want the main button
      if (surveyLinkSection) surveyLinkSection.style.display = "none";
      if (footerNote) {
        footerNote.style.display = "block";
        const footerText = footerNote.querySelector("p");
        if (footerText) {
          footerText.innerHTML =
            "<em>Please complete the post-task survey by clicking the button below:</em>";
        }
      }
    } else {
      // Show normal survey content for other tasks
      modalManager.updateContent([
        { selector: "#completed-task-name", property: "text", value: taskName },
        { selector: "#survey-link-btn", property: "href", value: surveyUrl },
        {
          selector: ".modal-title",
          property: "text",
          value: "📝 Task Completed - Quick Survey",
        },
        {
          selector: ".intro-section h3",
          property: "text",
          value: "🎉 Great Job!",
        },
        {
          selector: "#continue-after-survey-btn",
          property: "text",
          value: "✅ I've Completed the Survey - Continue",
        },
      ]);

      // Show survey-specific sections for other tasks
      const surveySection = modalManager.modal.querySelector(".survey-section");
      const surveyLinkSection = modalManager.modal.querySelector(
        ".survey-link-section"
      );
      const footerNote = modalManager.modal.querySelector(".footer-note");

      if (surveySection) surveySection.style.display = "block";
      if (surveyLinkSection) surveyLinkSection.style.display = "block";
      if (footerNote) footerNote.style.display = "block";
    }

    // Show modal with specific log data
    modalManager.show({
      taskIndex,
      taskName,
      aiCondition,
      surveyUrl,
      isTask2Congratulations: isTask2,
    });

    console.log(
      `${
        isTask2 ? "Congratulations" : "Survey"
      } modal shown for ${taskName} with ${aiCondition} condition`
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
          console.log("Continue button clicked!");

          // Check if this is a congratulations modal or survey modal
          const isCongratsModal = modalManager.modal
            .querySelector(".modal-title")
            ?.textContent.includes("Congratulations");

          if (isCongratsModal) {
            // For Task 2 congratulations, open the survey URL
            console.log("Opening post-task survey for Task 2");

            eventLogger.logEvent("task2_survey_opened", {
              url: surveyUrl,
              timestamp: new Date().toISOString(),
            });

            // Open survey in new tab
            window.open(surveyUrl, "_blank");

            // Close the modal after opening survey
            hideSurveyModal();
          } else {
            eventLogger.logEvent("survey_completed_continue", {
              timestamp: new Date().toISOString(),
            });

            hideSurveyModal();
          }
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
