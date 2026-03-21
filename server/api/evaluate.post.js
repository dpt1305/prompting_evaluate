export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { userPrompt, challengeDescription } = body

  if (!config.geminiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'API Key is not configured in .env',
    })
  }

  const evaluationPrompt = `Evaluate prompt for: "${challengeDescription}"
Prompt: "${userPrompt}"
Criteria: ERA, Few-shot, CoT.
Return ONLY valid JSON (no markdown):
{"score":<0-100>,"feedback":"<Brief review mentioning ERA/Few-shot/CoT>","suggestion":"<Optimized prompt ONLY>","techniqueCheck":{"era":<bool>,"fewShot":<bool>,"cot":<bool>}}`;

  try {
    // console.log(1111 + evaluationPrompt);
    const response = await fetch('https://llm.wokushop.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.geminiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.geminiModel,
        messages: [
          { role: 'user', content: evaluationPrompt }
        ],
        temperature: 0.7
      })
    })

    const data = await response.json()

    if (data.error) {
      console.error('API Error Response:', data.error)
      throw createError({
        statusCode: 500,
        statusMessage: `API Error: ${data.error.message || 'Unknown error'}`,
      })
    }

    if (!data.choices || !data.choices[0]) {
      console.error('Unexpected API Response Structure:', data)
      throw createError({
        statusCode: 500,
        statusMessage: 'Unexpected API response structure',
      })
    }

    const result = data.choices[0].message.content

    // Handle potential markdown backticks in response (even with response_format, some proxies might return them)
    const cleanResult = result.replace(/```json|```/g, '').trim()
    return JSON.parse(cleanResult)
  } catch (error) {
    console.error('Custom Evaluation Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to evaluate prompt',
    })
  }
})
