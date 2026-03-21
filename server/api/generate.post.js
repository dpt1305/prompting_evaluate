export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { prompt } = body

  if (!config.geminiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'API Key is not configured in .env',
    })
  }

  try {
    const response = await fetch('https://llm.wokushop.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.geminiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
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

    return data.choices[0].message.content
  } catch (error) {
    console.error('Custom API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to call Custom API',
    })
  }
})
