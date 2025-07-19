/* filepath: /js/debug-modal.js */
// Temporary debugging - add this to the bottom of your index.html
document.addEventListener("DOMContentLoaded", () => {
  console.log("🔍 Debugging modal elements...");

  const modal = document.getElementById("experiment-modal");
  const startBtn = document.getElementById("start-experiment-btn");
  const appContainer = document.getElementById("app-container");

  console.log("Modal element:", modal);
  console.log("Start button:", startBtn);
  console.log("App container:", appContainer);

  if (startBtn) {
    console.log("✅ Start button found, adding manual click listener");
    startBtn.addEventListener("click", function () {
      console.log("🔥 Manual click listener fired!");
      alert("Button clicked!"); // Temporary alert for testing
    });
  } else {
    console.log("❌ Start button NOT found");
    console.log(
      "Available elements with 'btn' in ID:",
      Array.from(document.querySelectorAll('[id*="btn"]'))
    );
  }
});
