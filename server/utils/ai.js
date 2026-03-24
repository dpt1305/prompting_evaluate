import { GoogleGenAI } from "@google/genai";

export const callAI = async (prompt, options = {}) => {
  const config = useRuntimeConfig();
  const primaryModel = options.model || config.geminiModel || "gemini-3-flash-preview";
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
      model: primaryModel,
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
    // === FETCH VỚI CƠ CHẾ BACKUP ===
    const tryFetch = async (url, key, targetModel) => {
      try {
        const res = await fetch(`${url}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [{ role: "user", content: prompt }],
            temperature: temperature,
          }),
        });
        
        const json = await res.json();
        return { response: res, data: json };
      } catch (err) {
        return { error: err.message };
      }
    };

    let { response, data, error } = await tryFetch(config.baseUrl, config.geminiApiKey, primaryModel);

    // Kiểm tra nếu gọi API chính thất bại (lỗi mạng, HTTP error, hoặc API error payload)
    if (error || (data && data.error) || (response && !response.ok)) {
      console.warn("Primary API failed:", error || (data && data.error) || (response && response.status));
      
      if (config.backupBaseUrl && config.backupApiKey) {
        console.log("Switching to Backup API...");
        const backupModel = config.backupGeminiModel || "gemini-2.5-pro";
        const backupResult = await tryFetch(config.backupBaseUrl, config.backupApiKey, backupModel);
        response = backupResult.response;
        data = backupResult.data;
        error = backupResult.error;
      }
    }

    if (error) {
      throw new Error(`Fetch Error: ${error}`);
    }

    if (data.error || !response.ok) {
      console.error("API Error Response:", data.error || response.statusText);
      throw new Error(`API Error: ${data.error?.message || response.statusText || "Unknown error"}`);
    }

    if (!data.choices || !data.choices[0]) {
      console.error("Unexpected API Response Structure:", data);
      throw new Error("Unexpected API response structure");
    }

    return data.choices[0].message.content;
  }
};
