// Azure OpenAI API integration for browser

export async function getAIResponse(prompt) {
  const endpoint =
    "https://<ENDPOINT>.openai.azure.com/openai/deployments/<DEPLOMNENT-ID>/chat/completions?api-version=2024-02-15-preview";
  const apiKey = "<API-KEY>";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        max_tokens: 256,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error("Azure OpenAI API error");
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return "Error: Unable to fetch response from Azure OpenAI.";
  }
}
