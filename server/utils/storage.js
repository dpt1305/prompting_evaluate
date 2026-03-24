import fs from 'fs/promises'
import path from 'path'
import challengesData from '../data/challenges.json'
import scoresData from '../data/scores.json'

// Try to resolve path, though writing files won't persist on Vercel Serverless!
const DATA_DIR = path.resolve(process.cwd(), 'server/data')
const SCORES_FILE = path.join(DATA_DIR, 'scores.json')

export const getChallenges = async () => {
  return challengesData;
}

export const getScores = async () => {
  try {
    const data = await fs.readFile(SCORES_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.warn('Could not read scores from fs, using bundled data.', error.message)
    return Array.isArray(scoresData) ? scoresData : []
  }
}

export const addScore = async (scoreData) => {
  try {
    const scores = await getScores()
    const newScore = {
      id: Date.now().toString(),
      playerName: scoreData.playerName,
      score: parseInt(scoreData.score),
      challengeId: scoreData.challengeId,
      createdAt: new Date().toISOString()
    }
    scores.push(newScore)
    await fs.writeFile(SCORES_FILE, JSON.stringify(scores, null, 2))
    return newScore
  } catch (error) {
    console.error('Error adding score:', error)
    throw error
  }
}

export const getLeaderboard = async (challengeId) => {
  const scores = await getScores()
  
  let targetScores = scores
  if (challengeId && challengeId !== 'all') {
    targetScores = scores.filter(s => s.challengeId === challengeId)
  }

  // Filter for unique best scores per player
  const uniqueScores = []
  const seen = new Set()
  
  // Sort by score descending
  const sortedScores = targetScores.sort((a, b) => b.score - a.score)
  
  for (const s of sortedScores) {
    if (!seen.has(s.playerName) && s.playerName) { // Ignore empty names
      uniqueScores.push({ name: s.playerName, score: s.score })
      seen.add(s.playerName)
    }
    if (uniqueScores.length >= 10) break
  }
  
  return uniqueScores
}
