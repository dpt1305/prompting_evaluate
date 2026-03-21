<script setup>
const { data: challenges } = await useFetch('/api/challenges')
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <div class="max-w-7xl mx-auto py-8">
      <h1 class="text-3xl font-bold mb-8">Choose a Challenge</h1>
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <NuxtLink 
          v-for="c in challenges" 
          :key="c.id"
          :to="`/challenges/${c.id}`"
          class="glass-card cursor-pointer transition-all p-4 border border-slate-200 hover:border-accent-primary/50 hover:shadow-md hover:-translate-y-1 block"
        >
          <div class="flex items-center gap-3 mb-2">
            <div class="text-2xl">{{ c.icon }}</div>
            <div class="font-bold text-sm truncate flex-1 text-slate-800">{{ c.title }}</div>
          </div>
          <p class="text-xs text-slate-500 line-clamp-2">{{ c.description }}</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
