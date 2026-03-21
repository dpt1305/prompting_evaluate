<script setup>
import { useUserStore } from '~/stores/user'
import { onMounted } from 'vue'

const userStore = useUserStore()

onMounted(() => {
  userStore.hydrate()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
.background-glow {
  @apply fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] -z-10 pointer-events-none;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(248, 250, 252, 0) 70%);
}
</style>
