import { GoogleGenAI } from "@google/genai";

export const callAI = async (prompt, options = {}) => {
  const config = useRuntimeConfig();
  const model = options.model || config.geminiModel || "gemini-2.5-flash";
  const temperature = options.temperature || 0.1;

  // --- Cấu hình Toggle giữa Wokushop Fetch và Google SDK ---
  const USE_SDK = false; // Mặc định dùng Fetch theo yêu cầu hiện tại

  if (!config.geminiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "API Key is not configured in .env",
    });
  }

  if (USE_SDK) {
    // === CÁCH MỚI: DÙNG GOOGLE GENAI SDK ===
    const ai = new GoogleGenAI({
      apiKey: config.geminiApiKey,
      httpOptions: { baseUrl: "https://generativelanguage.googleapis.com" },
    });

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: temperature,
        httpOptions: { timeout: 120000 },
      },
    });

    if (!response.text) {
      throw new Error("Unexpected API response structure from SDK");
    }
    return response.text;
  } else {
    // === CÁCH CŨ: DÙNG FETCH WOKUSHOP ===
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.geminiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: temperature,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("API Error Response:", data.error);
      throw new Error(`API Error: ${data.error.message || "Unknown error"}`);
    }

    if (!data.choices || !data.choices[0]) {
      console.error("Unexpected API Response Structure:", data);
      throw new Error("Unexpected API response structure");
    }

    return data.choices[0].message.content;
  }
};
