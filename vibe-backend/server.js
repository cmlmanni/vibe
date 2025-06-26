const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Enable detailed logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Enable CORS for local development
app.use(
  cors({
    origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

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

// Error handling for invalid routes
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.url} not found` });
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

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check available at http://localhost:${port}/api/health`);
});
