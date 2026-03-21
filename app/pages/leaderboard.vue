<script setup>
import { Trophy, Medal, User as UserIcon, Filter } from 'lucide-vue-next'
import { ref, computed, watch } from 'vue'

const { data: challengesData } = await useFetch('/api/challenges')
const challenges = computed(() => challengesData.value || [])

const selectedChallenge = ref('all')

const { data: leaderboard, refresh } = await useFetch(() => `/api/leaderboard?challengeId=${selectedChallenge.value}`)
const scores = computed(() => leaderboard.value || [])

watch(selectedChallenge, () => {
  refresh()
})
</script>

<template>
  <div class="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="text-center space-y-2">
      <h1 class="text-4xl font-bold flex items-center justify-center gap-3">
        <Trophy :size="36" class="text-yellow-500" />
        Top Prompt Engineers
      </h1>
      <p class="text-slate-400">Can you make it to the top 10?</p>
    </div>

    <div class="flex justify-center mb-6">
      <div class="glass-card flex items-center gap-3 w-full max-w-md p-2 px-4 shadow-inner">
        <Filter class="text-accent-primary" :size="20"/>
        <select v-model="selectedChallenge" class="w-full bg-transparent outline-none text-slate-700 font-medium">
          <option value="all">🏆 All Challenges (Overall Best)</option>
          <option v-for="c in challenges" :key="c.id" :value="c.id">
            {{ c.icon }} {{ c.title }}
          </option>
        </select>
      </div>
    </div>

    <div class="glass-card overflow-hidden !p-0">
      <table class="w-full text-left">
        <thead class="bg-slate-50 text-slate-500 text-sm uppercase tracking-widest font-semibold">
          <tr>
            <th class="px-8 py-4 w-20">Rank</th>
            <th class="px-8 py-4">Player</th>
            <th class="px-8 py-4 text-right">Best Score</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="(s, index) in scores" :key="s.name" class="hover:bg-slate-50/50 transition-colors group">
            <td class="px-8 py-6">
              <div v-if="index === 0" class="text-2xl">🥇</div>
              <div v-else-if="index === 1" class="text-2xl">🥈</div>
              <div v-else-if="index === 2" class="text-2xl">🥉</div>
              <div v-else class="text-slate-500 font-bold px-2">#{{ index + 1 }}</div>
            </td>
            <td class="px-8 py-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary font-bold border border-accent-primary/30">
                  {{ s.name.charAt(0).toUpperCase() }}
                </div>
                <span class="font-semibold text-lg">{{ s.name }}</span>
              </div>
            </td>
            <td class="px-8 py-6 text-right">
              <span class="text-2xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                {{ s.score }}%
              </span>
            </td>
          </tr>
          <tr v-if="scores.length === 0">
            <td colspan="3" class="px-8 py-12 text-center text-slate-500 italic">
              No souls have attempted the challenges yet...
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
