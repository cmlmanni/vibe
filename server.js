// Root server.js - Entry point for Azure App Service
// This ensures Azure can find and start the application

console.log("Starting Vibe App from root...");
console.log("Current directory:", process.cwd());
console.log("Node.js version:", process.version);

// Require the actual server from the backend directory
require("./vibe-backend/server.js");
