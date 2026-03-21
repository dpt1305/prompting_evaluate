import { addScore } from "../utils/storage";

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { playerName, score, challengeId } = body

  return await addScore({ playerName, score, challengeId })
})
