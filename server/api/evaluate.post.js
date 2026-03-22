import { callAI } from '../utils/ai'
import { getEvaluationPrompt } from '../utils/prompts'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userPrompt, challengeDescription } = body

  const evaluationPrompt = getEvaluationPrompt(challengeDescription, userPrompt)

  try {
    const result = await callAI(evaluationPrompt)

    // Handle potential markdown backticks in response
    const cleanResult = result.replace(/```json|```/g, '').trim()
    return JSON.parse(cleanResult)
  } catch (error) {
    console.error('Evaluation Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to evaluate prompt',
    })
  }
})
