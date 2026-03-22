import { callAI } from '../utils/ai'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { prompt } = body

  try {
    return await callAI(prompt)
  } catch (error) {
    console.error('API Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to call AI API',
    })
  }
})
