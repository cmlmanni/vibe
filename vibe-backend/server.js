const express = require("express");
const cors = require("cors");
require("dotenv").config();

console.log("Starting Vibe backend server...");
console.log("Node.js version:", process.version);
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Port:", process.env.PORT || 3000);

const app = express();
const port = process.env.PORT || 3000;

// Enable detailed logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Enable CORS - Updated for Azure deployment
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // In production, allow any origin that ends with your Azure domain
      // For development, allow localhost
      const allowedOrigins = [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
      ];

      // Add frontend URL from environment variable if available
      if (process.env.FRONTEND_URL) {
        allowedOrigins.push(process.env.FRONTEND_URL);
      }
      if (process.env.FRONTEND_URL_AZURE) {
        allowedOrigins.push(process.env.FRONTEND_URL_AZURE);
      }
      if (process.env.FRONTEND_URL_GITHUB_PAGES) {
        allowedOrigins.push(process.env.FRONTEND_URL_GITHUB_PAGES);
      }

      // Check if origin is allowed or if it's an Azure domain or GitHub Pages
      if (
        allowedOrigins.includes(origin) ||
        (origin && origin.includes(".azurewebsites.net")) ||
        (origin && origin.includes(".github.io"))
      ) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(null, true); // Allow all origins for now - tighten in production
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the parent directory (for frontend)
const path = require("path");
const staticPath = path.join(__dirname, "..");
console.log("Serving static files from:", staticPath);
app.use(
  express.static(staticPath, {
    index: "index.html",
    dotfiles: "ignore",
    setHeaders: (res, filePath) => {
      // Set proper MIME types
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      } else if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

// Debug middleware to log all requests in detail
app.use((req, res, next) => {
  console.log("=== REQUEST DEBUG ===");
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("URL:", req.url);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("====================");
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  // Check if Azure OpenAI credentials are configured
  const credentialsConfigured =
    process.env.AZURE_OPENAI_ENDPOINT &&
    process.env.AZURE_OPENAI_API_KEY &&
    process.env.AZURE_DEPLOYMENT_NAME;

  res.status(200).json({
    status: "Server is running",
    environment: process.env.NODE_ENV || "development",
    credentialsConfigured: !!credentialsConfigured,
    timestamp: new Date().toISOString(),
  });
});

// Configuration endpoint for frontend
app.get("/api/config", (req, res) => {
  res.status(200).json({
    backendUrl: "/api/openai", // Relative URL for same-origin requests
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// OpenAI proxy endpoint
app.post("/api/openai", async (req, res) => {
  console.log(
    "Received request to /api/openai:",
    JSON.stringify({
      systemPrompt: req.body.systemPrompt?.substring(0, 50) + "...",
      userPrompt: req.body.userPrompt?.substring(0, 50) + "...",
      maxTokens: req.body.maxTokens,
      temperature: req.body.temperature,
    })
  );

  const {
    systemPrompt,
    userPrompt,
    maxTokens = 512,
    temperature = 0.7,
  } = req.body;

  // Validate required parameters
  if (!userPrompt) {
    console.error("Missing required parameter: userPrompt");
    return res
      .status(400)
      .json({ error: "Missing required parameter: userPrompt" });
  }

  try {
    // Get credentials from environment variables
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deploymentId = process.env.AZURE_DEPLOYMENT_NAME;

    if (!endpoint || !apiKey || !deploymentId) {
      console.error("Missing Azure OpenAI configuration");
      return res.status(500).json({
        error: "Server configuration error",
        details: "Azure OpenAI credentials not configured",
      });
    }

    // Log the request being sent to Azure (without API key)
    console.log(
      `Calling Azure OpenAI API at: ${endpoint}/openai/deployments/${deploymentId}/chat/completions`
    );
    console.log("Request payload:", {
      messages: [
        {
          role: "system",
          content: systemPrompt || "You are a helpful assistant.",
        },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: temperature,
    });

    // Call Azure OpenAI API
    const response = await fetch(
      `${endpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=2025-01-01-preview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: systemPrompt || "You are a helpful assistant.",
            },
            { role: "user", content: userPrompt },
          ],
          max_tokens: maxTokens,
          temperature: temperature,
        }),
      }
    );

    // Handle error responses from Azure OpenAI
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Azure OpenAI API error: ${response.status}`, errorText);
      return res.status(response.status).json({
        error: `Azure OpenAI API returned ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    console.log("Azure OpenAI response received:");
    console.log("- Status:", response.status);
    console.log(
      "- Content length:",
      data.choices?.[0]?.message?.content?.length || 0
    );
    console.log("- Usage:", JSON.stringify(data.usage));

    // Examine the response structure
    console.log(
      "- Response structure:",
      JSON.stringify({
        choices: data.choices?.map((c) => ({
          message: {
            role: c.message?.role,
            contentPreview: c.message?.content?.substring(0, 50) + "...",
          },
        })),
      })
    );

    // Verify content structure
    const content =
      data.choices?.[0]?.message?.content || "No response generated.";

    // Log the full content to help debug the response format
    console.log(
      "Response content preview (first 100 chars):",
      content.substring(0, 100).replace(/\n/g, "\\n")
    );

    // Add a log to show if code blocks were detected
    const hasCodeBlock = content.includes("```");
    console.log("Contains code blocks:", hasCodeBlock);

    // Return the AI response with detailed logging
    console.log(
      `Sending response to client with content length: ${content.length}`
    );

    res.json({
      content: content,
      usage: data.usage,
    });
  } catch (error) {
    console.error(`Server error: ${error.message}`, error);
    res.status(500).json({
      error: "Failed to communicate with Azure OpenAI",
      details: error.message,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    });
  }
});

// Handle CORS preflight requests explicitly
app.options("/api/openai", (req, res) => {
  console.log("=== OPTIONS PREFLIGHT ===");
  console.log("Origin:", req.headers.origin);
  console.log("Method:", req.headers["access-control-request-method"]);
  console.log("Headers:", req.headers["access-control-request-headers"]);
  console.log("========================");

  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

// SPA fallback - serve index.html for non-API routes
app.get("*", (req, res) => {
  // Only serve index.html for non-API routes
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: `API route ${req.url} not found` });
  }

  // Serve index.html for all other routes (SPA behavior)
  const indexPath = path.join(__dirname, "..", "index.html");
  console.log("Serving index.html for SPA route:", req.path);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(500).send("Error loading application");
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    details:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
  });
});

// Catch-all route for debugging 404s
app.use("*", (req, res) => {
  console.log("=== 404 CATCH-ALL ===");
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("URL:", req.url);
  console.log("===================");
  res.status(404).json({
    error: "Not found",
    method: req.method,
    path: req.path,
    url: req.url,
  });
});

// Start the server
app
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(
      `Health check available at http://localhost:${port}/api/health`
    );
  })
  .on("error", (err) => {
    console.error("Server failed to start:", err);
    process.exit(1);
  });

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
