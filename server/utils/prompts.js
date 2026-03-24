export const getEvaluationPrompt = (challengeDescription, userPrompt) => {
  return `Strict PE (very strict). Task:"${challengeDescription}" Prompt:"${userPrompt}"
Rules:
- Mandatory: ERA (Expectation-Role-Action), FewShot(>=1), CoT.
- Be conservative and strict in grading.
- Hard cap: final score MUST be <= 100 in all cases.
- Missing ERA => Max 50.
- Missing FewShot => Max 60.
- Missing CoT => Max 65.
- Score > 75 only if prompt is exceptionally clear, specific, and complete.
- CRITICAL: "suggestion" MUST contain ONLY the raw optimized prompt string itself. Do NOT include conversational text like "Here is...", explanations, or quotes. It will be passed directly to a downstream LLM.
- "feedback" should explicitly and constructively detail what was missing and why the newly suggested prompt is better.
JSON only: {"score":0..80,"feedback":"sharp","suggestion":"<PURE_OPTIMIZED_PROMPT_ONLY>","techniqueCheck":{"era":bool,"fewShot":bool,"cot":bool}}`;
};
