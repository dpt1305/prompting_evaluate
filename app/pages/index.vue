<script setup>
import { useUserStore } from '~/stores/user'

definePageMeta({
  layout: 'default'
})

const userStore = useUserStore()
const router = useRouter()
const name = ref('')

onMounted(() => {
  userStore.hydrate()
  if (userStore.isLoggedIn) {
    router.push('/challenges')
  }
})

const handleLogin = () => {
  if (name.value.trim().length < 2) {
    alert('Please enter a valid name')
    return
  }
  userStore.login(name.value.trim())
  router.push('/challenges')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[80vh]">
    <div class="w-full max-w-md p-8 glass-card border-accent-primary/20 space-y-8">
      <div class="text-center space-y-2">
        <h1 class="text-4xl font-bold tracking-tight">Welcome</h1>
        <p class="text-slate-400">Join the Prompting Workshop Game</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-400 mb-2">What's your name?</label>
          <input 
            v-model="name"
            type="text" 
            placeholder="Enter your name..." 
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg text-slate-900 outline-none focus:border-accent-primary transition-colors shadow-inner"
            @keyup.enter="handleLogin"
          />
        </div>
        
        <button @click="handleLogin" class="primary-btn">
          Start Playing
        </button>
      </div>

      <div class="pt-8 flex justify-center gap-4 text-xs text-slate-600">
        <span>ERA</span>
        <span>•</span>
        <span>Few-shot</span>
        <span>•</span>
        <span>CoT</span>
      </div>
    </div>
  </div>
</template>
