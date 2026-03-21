import { getChallenges } from "../utils/storage";

export default defineEventHandler(async (event) => {
  return await getChallenges()
})
