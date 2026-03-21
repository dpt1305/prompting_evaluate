<script setup>
import { useUserStore } from '~/stores/user'
import { LogOut, LayoutGrid, Trophy, User as UserIcon } from 'lucide-vue-next'

const userStore = useUserStore()
const router = useRouter()

const logout = () => {
  userStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-dark">
    <div class="background-glow"></div>
    
    <!-- Navbar (Only show if logged in) -->
    <header v-if="userStore.isLoggedIn" class="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-dark/80 backdrop-blur-md border-b border-slate-200">
      <div class="flex items-center gap-8">
        <div class="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
          🚀 Prompting Workshop
        </div>
        
        <nav class="flex gap-4">
          <NuxtLink to="/challenges" class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-100" active-class="bg-accent-primary/10 text-accent-primary font-medium">
            <LayoutGrid :size="18" />
            Challenges
          </NuxtLink>
          <NuxtLink to="/leaderboard" class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-100" active-class="bg-accent-primary/10 text-accent-primary font-medium">
            <Trophy :size="18" />
            Leaderboard
          </NuxtLink>
        </nav>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3 px-4 py-2 glass-card !rounded-full !p-2 pr-4 border-accent-primary/30">
          <div class="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white font-bold">
            {{ userStore.name.charAt(0).toUpperCase() }}
          </div>
          <span class="text-sm font-medium">{{ userStore.name }}</span>
        </div>
        <button @click="logout" class="p-2 text-slate-400 hover:text-slate-800 transition-colors" title="Logout">
          <LogOut :size="20" />
        </button>
      </div>
    </header>

    <main :class="{ 'p-8': userStore.isLoggedIn }">
      <slot />
    </main>
  </div>
</template>
