export const getEvaluationPrompt = (challengeDescription, userPrompt) => {
  return `Strict PE. Task:"${challengeDescription}" Prompt:"${userPrompt}"
Rules: ERA, FewShot(>=1,Max70 if !), CoT(Max80 if !). Score>90 only if perfect.
JSON only: {"score":0..100,"feedback":"sharp","suggestion":"full","techniqueCheck":{"era":bool,"fewShot":bool,"cot":bool}}`
}
