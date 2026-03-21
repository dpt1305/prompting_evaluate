<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const { data: challenges } = await useFetch('/api/challenges')

const challenge = computed(() => {
  return challenges.value?.find(c => c.id === route.params.id)
})
</script>

<template>
  <div class="max-w-7xl mx-auto py-8 space-y-8 animate-in fade-in duration-700">
    <div>
      <NuxtLink to="/challenges" class="inline-flex items-center gap-2 text-slate-500 hover:text-accent-primary transition-colors mb-6 font-medium">
        <ArrowLeft :size="18" />
        Back to Challenges
      </NuxtLink>
    </div>

    <div v-if="challenge">
      <PromptComparator :challenge="challenge" />
    </div>
    <div v-else class="glass-card text-center py-20 text-slate-500">
      <h2 class="text-2xl font-bold mb-2">Challenge not found</h2>
      <p>The challenge you are looking for does not exist.</p>
    </div>
  </div>
</template>
