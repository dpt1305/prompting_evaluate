import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    results: [] // { challengeId, score, date }
  }),
  getters: {
    isLoggedIn: (state) => !!state.name,
    highScore: (state) => {
      if (state.results.length === 0) return 0
      return Math.max(...state.results.map(r => r.score))
    }
  },
  actions: {
    login(name) {
      this.name = name
      if (process.client) {
        localStorage.setItem('prompt_user', name)
      }
    },
    logout() {
      this.name = ''
      if (process.client) {
        localStorage.removeItem('prompt_user')
      }
    },
    addResult(result) {
      this.results.push({
        ...result,
        date: new Date().toISOString()
      })
      // Save globally for leaderboard mock
      if (process.client) {
        const allScores = JSON.parse(localStorage.getItem('prompt_all_scores') || '[]')
        allScores.push({ name: this.name, ...result })
        localStorage.setItem('prompt_all_scores', JSON.stringify(allScores))
      }
    },
    hydrate() {
      if (process.client) {
        const saved = localStorage.getItem('prompt_user')
        if (saved) this.name = saved
      }
    }
  }
})
