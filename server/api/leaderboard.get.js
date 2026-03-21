import { getLeaderboard } from "../utils/storage";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return await getLeaderboard(query.challengeId);
})
