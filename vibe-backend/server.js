const express = require("express");
const cors = require("cors");
require("dotenv").config();

console.log("Starting Vibe backend server...");
console.log("Node.js version:", process.version);
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Port:", process.env.PORT || 3000);

const app = express();
const port = process.env.PORT || 3000;

// Security-focused CORS configuration
const getCorsOptions = () => {
  const isDevelopment = process.env.NODE_ENV !== "production";

  return {
    origin: (origin, callback) => {
      console.log("🔍 CORS check for origin:", origin);

      // Allow same-origin requests (no origin header)
      if (!origin) {
        console.log("✅ Same-origin request allowed");
        return callback(null, true);
      }

      // Development - allow localhost
      if (
        isDevelopment &&
        origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)
      ) {
        console.log("✅ Development localhost allowed");
        return callback(null, true);
      }

      // Allow ANY GitHub Pages domain (replace with your specific domain for security)
      if (origin.match(/^https:\/\/[\w-]+\.github\.io$/)) {
        console.log("✅ GitHub Pages domain allowed");
        return callback(null, true);
      }

      // Check environment-configured origins
      const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
        .split(",")
        .filter(Boolean);

      if (allowedOrigins.includes(origin)) {
        console.log("✅ Explicitly allowed origin");
        return callback(null, true);
      }

      // Log blocked attempts
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS policy"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
  };
};

app.use(cors(getCorsOptions()));

// Handle preflight requests
app.options("*", cors(getCorsOptions()));

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

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

// OpenAI proxy endpoint with conversation history support
app.post("/api/openai", async (req, res) => {
  try {
    const {
      conversationHistory,
      systemPrompt,
      userPrompt, // Keep for backward compatibility
      maxTokens = 800,
      temperature = 0.7,
    } = req.body;

    console.log("Received request with:", {
      hasConversationHistory: !!(
        conversationHistory && Array.isArray(conversationHistory)
      ),
      conversationHistoryLength: conversationHistory?.length || 0,
      hasSystemPrompt: !!systemPrompt,
      hasUserPrompt: !!userPrompt,
      userPromptPreview: userPrompt
        ? userPrompt.substring(0, 50) + "..."
        : "undefined",
    });

    let messages = [];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      // Use conversation history if provided
      console.log(
        `Using conversation history with ${conversationHistory.length} messages`
      );
      messages = [...conversationHistory]; // Create a copy

      // Ensure system prompt is at the beginning if provided
      if (systemPrompt) {
        const hasSystemMessage = messages.find((msg) => msg.role === "system");
        if (!hasSystemMessage) {
          messages.unshift({ role: "system", content: systemPrompt });
        }
      }
    } else if (userPrompt) {
      // Fallback to single message format
      console.log("Using single message format (legacy)");
      messages = [
        {
          role: "system",
          content: systemPrompt || "You are a helpful assistant.",
        },
        { role: "user", content: userPrompt },
      ];
    } else {
      console.error("Missing required parameters:", {
        conversationHistory: !!conversationHistory,
        userPrompt: !!userPrompt,
        requestBody: req.body,
      });
      return res.status(400).json({
        error:
          "Either conversationHistory (array) or userPrompt (string) is required",
        received: {
          conversationHistory: typeof conversationHistory,
          userPrompt: typeof userPrompt,
        },
      });
    }

    // Log conversation structure (safely)
    console.log("Conversation structure:");
    if (messages.length > 0) {
      console.log(
        "- First message:",
        messages[0]?.role,
        messages[0]?.content
          ? messages[0].content.substring(0, 50) + "..."
          : "No content"
      );
      if (messages.length > 1) {
        const lastMessage = messages[messages.length - 1];
        console.log(
          "- Last message:",
          lastMessage?.role,
          lastMessage?.content
            ? lastMessage.content.substring(0, 50) + "..."
            : "No content"
        );
      }
    }
    console.log(`- Total messages: ${messages.length}`);

    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deploymentId = process.env.AZURE_DEPLOYMENT_NAME;

    if (!endpoint || !apiKey || !deploymentId) {
      console.error("Missing Azure OpenAI configuration:", {
        hasEndpoint: !!endpoint,
        hasApiKey: !!apiKey,
        hasDeploymentId: !!deploymentId,
      });
      return res.status(500).json({
        error: "Server configuration error",
        details: "Azure OpenAI credentials not configured",
      });
    }

    console.log(`Calling Azure OpenAI API with ${messages.length} messages...`);

    const response = await fetch(
      `${endpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=2025-01-01-preview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          messages: messages,
          max_tokens: maxTokens,
          temperature: temperature,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Azure OpenAI API error: ${response.status}`, errorText);
      return res.status(response.status).json({
        error: `Azure OpenAI API returned ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content || "No response generated.";

    console.log(
      `Response generated successfully, length: ${content.length} characters`
    );

    res.json({
      content: content,
      usage: data.usage,
    });
  } catch (error) {
    console.error(`Server error: ${error.message}`, error.stack);
    res.status(500).json({
      error: "Failed to communicate with Azure OpenAI",
      details: error.message,
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
