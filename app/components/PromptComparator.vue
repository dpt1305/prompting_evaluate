<script setup>
import { useUserStore } from '~/stores/user'
import { Copy, Sparkles, Send, CheckCircle2 } from 'lucide-vue-next'

const props = defineProps({
  challenge: {
    type: Object,
    required: true
  }
})

const userStore = useUserStore()
const userPrompt = ref('')
const isSubmitting = ref(false)
const showAI = ref(false)

const evaluation = ref(null)
const userResult = ref('')
const aiResult = ref('')

// Simple markdown formatter to handle **text** rendering
const formatMarkdown = (text) => {
  if (!text) return ''
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

const submitPrompt = async () => {
  if (!userPrompt.value.trim()) return
  
  isSubmitting.value = true
  userResult.value = 'Analyzing prompt...'
  showAI.value = false
  evaluation.value = null
  aiResult.value = ''
  
  try {
    const [userRes, evalRes] = await Promise.all([
      $fetch('/api/generate', { method: 'POST', body: { prompt: userPrompt.value } }),
      $fetch('/api/evaluate', { 
        method: 'POST', 
        body: { userPrompt: userPrompt.value, challengeDescription: props.challenge.description } 
      })
    ])

    userResult.value = userRes
    evaluation.value = evalRes
    showAI.value = true

    // Fetch AI Result immediately
    aiResult.value = 'Generating optimized result...'
    const aiRes = await $fetch('/api/generate', { method: 'POST', body: { prompt: evalRes.suggestion } })
    aiResult.value = aiRes

    // Save Score to DB (runs in background)
    $fetch('/api/score', {
      method: 'POST',
      body: {
        playerName: userStore.name,
        score: evalRes.score,
        challengeId: props.challenge.id
      }
    }).catch(e => console.error('Failed to save score', e))

    userStore.addResult({
      challengeId: props.challenge.id,
      score: evalRes.score
    })

    if (evalRes.score > 80) {
      triggerConfetti()
    }

  } catch (error) {
    console.error(error)
    alert('Error: ' + (error.data?.statusMessage || error.message))
  } finally {
    isSubmitting.value = false
  }
}

const copied = ref(false)
const copyToClipboard = () => {
  if (!evaluation.value?.suggestion) return
  navigator.clipboard.writeText(evaluation.value.suggestion)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

// Confetti Logic
const confettiCanvas = ref(null)
const triggerConfetti = () => {
  if (!confettiCanvas.value) return
  const canvas = confettiCanvas.value
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  let particles = []
  for (let i = 0; i < 200; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20,
      size: Math.random() * 8 + 4,
      color: `hsl(${Math.random() * 360}, 80%, 60%)`,
      speed: Math.random() * 5 + 3,
      angleX: Math.random() * 6.28,
      angleY: Math.random() * 6.28,
      rotationSpeed: Math.random() * 0.2 - 0.1
    })
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let active = false
    particles.forEach(p => {
      p.y += p.speed
      p.x += Math.sin(p.angleX) * 2
      p.angleX += 0.05
      
      if (p.y < canvas.height) {
        active = true
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angleY)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size)
        ctx.restore()
        p.angleY += p.rotationSpeed
      }
    })
    if (active) requestAnimationFrame(animate)
  }
  animate()
}
</script>

<template>
  <div class="space-y-8 relative">
    <!-- First Section: Challenge & Score + Feedback (if done) -->
    <div class="flex flex-col xl:flex-row gap-8 items-stretch relative z-10">
       <!-- Top Challenge Info -->
       <div class="glass-card border-white/10 flex-1 flex flex-col justify-center">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">{{ challenge.icon }}</span>
            <h2 class="text-2xl font-bold">{{ challenge.title }}</h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed">{{ challenge.description }}</p>
       </div>
       
       <!-- Evaluation Banner & Feedback (Highlights missing things) -->
       <div v-if="showAI" class="flex-[1.5] glass-card border-accent-primary/20 bg-accent-primary/5 shadow-xl transition-all duration-700 animate-in slide-in-from-top-8">
           <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-accent-primary/10 pb-4">
              <div class="flex items-center gap-4">
                 <div class="w-16 h-16 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent-primary/20 transform hover:scale-105 transition-transform">
                    <span class="text-2xl font-black">{{ evaluation?.score }}</span>
                 </div>
                 <div>
                    <h2 class="text-xl font-bold text-slate-800">Your Evaluation</h2>
                    <p class="text-sm text-accent-secondary font-semibold">Strategic Feedback</p>
                 </div>
              </div>
              <Sparkles class="hidden sm:block text-accent-primary opacity-50" :size="32" />
           </div>
           <div>
              <h3 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                 <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> 
                 What you missed & How to step up:
              </h3>
              <div class="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap bg-white/50 p-4 rounded-xl border border-white" v-html="formatMarkdown(evaluation?.feedback)"></div>
           </div>
       </div>
    </div>

    <!-- Second Section: Prompts Comparison -->
    <div class="space-y-4 relative z-10">
       <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch border-t border-slate-200 pt-8">
          
          <!-- User Input Prompt -->
          <div class="flex flex-col h-full">
            <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
               Your Prompt
            </h3>
            <div class="glass-card border-slate-200 flex-1 flex flex-col p-0 overflow-hidden relative group h-[35vh] min-h-[250px] shadow-sm hover:shadow-md transition-shadow">
              <textarea 
                v-model="userPrompt"
                @paste.prevent
                @drop.prevent
                placeholder="Type your strategic prompt here..."
                class="w-full relative z-10 flex-1 bg-slate-50 p-6 text-slate-800 outline-none focus:bg-white transition-all resize-none shadow-inner text-sm md:text-base leading-relaxed overflow-y-auto"
                :disabled="isSubmitting"
              ></textarea>
              <div class="p-4 bg-white border-t border-slate-100 flex justify-end">
                <button 
                  @click="submitPrompt" 
                  class="primary-btn flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-2.5"
                  :disabled="isSubmitting || !userPrompt.trim()"
                >
                  <Send v-if="!isSubmitting" :size="18" />
                  <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {{ isSubmitting ? 'Evaluating...' : 'Submit & Evaluate' }}
                </button>
              </div>
            </div>
          </div>

          <!-- AI Optimized Prompt -->
          <div class="flex flex-col h-full">
            <h3 class="text-sm font-semibold text-accent-secondary uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>Optimized Prompt</span>
              <span v-if="showAI" class="text-[10px] md:text-xs font-bold bg-accent-secondary/10 text-accent-secondary px-2 py-1 rounded border border-accent-secondary/20">ERA + CoT System</span>
            </h3>
            
            <div v-if="showAI" class="glass-card border-accent-secondary/30 bg-white p-0 overflow-hidden flex-1 flex flex-col h-[35vh] min-h-[250px] animate-in fade-in zoom-in-95 duration-500 shadow-md">
               <div class="p-6 bg-accent-secondary/5 flex-1 shadow-inner text-slate-700 text-sm italic whitespace-pre-wrap overflow-y-auto leading-relaxed border-b border-accent-secondary/10" v-html="formatMarkdown(evaluation?.suggestion)"></div>
               <div class="p-4 bg-white flex justify-end">
                  <button 
                    @click="copyToClipboard"
                    class="border border-accent-secondary text-accent-secondary hover:bg-accent-secondary hover:text-white flex items-center justify-center gap-2 text-sm w-full sm:w-auto font-semibold px-4 py-2.5 rounded-xl transition-all"
                  >
                    <CheckCircle2 v-if="copied" :size="16" />
                    <Copy v-else :size="16" />
                    {{ copied ? 'Copied to Clipboard!' : 'Copy This Version' }}
                  </button>
               </div>
            </div>
            
            <div v-else class="hidden lg:flex flex-1 flex-col items-center justify-center opacity-40 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50/50 p-8 text-center h-[35vh] min-h-[250px] transition-all">
               <Sparkles v-if="!isSubmitting" :size="48" class="text-slate-400 mb-4" />
               <div v-else class="w-12 h-12 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-4"></div>
               <p class="text-sm font-medium">
                 {{ isSubmitting ? 'Analyzing missing contexts...' : 'Waiting for prompt submission...' }}
               </p>
            </div>
          </div>

       </div>
    </div>

    <!-- Third Section: Execution Results -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pt-8 border-t border-slate-200 relative z-10">
      <!-- User Result -->
      <div class="glass-card border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
        <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
           <span class="w-2 h-2 rounded-full bg-slate-400"></span>
           Your AI's Output
        </h3>
        <div class="bg-slate-50 border border-slate-100 rounded-xl p-5 h-[40vh] min-h-[300px] overflow-y-auto shadow-inner">
           <div v-if="userResult" class="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-mono" v-html="formatMarkdown(userResult)"></div>
           <div v-else class="text-slate-400 text-sm italic py-10 text-center">Results generated by your prompt will appear here...</div>
        </div>
      </div>

      <!-- Enhanced Result -->
      <div v-if="showAI" class="glass-card border-green-500/30 bg-green-50/20 shadow-md animate-in slide-in-from-bottom-8 duration-700">
        <h3 class="text-sm font-semibold text-green-600 uppercase tracking-widest mb-4 flex items-center gap-2">
           <span class="w-2 h-2 rounded-full bg-green-500"></span>
           Optimized Output
        </h3>
        <div class="bg-white border border-green-500/10 rounded-xl p-5 h-[40vh] min-h-[300px] overflow-y-auto shadow-sm">
           <div class="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-mono" v-html="formatMarkdown(aiResult)"></div>
        </div>
      </div>
      
      <div v-else class="hidden lg:flex flex-col glass-card items-center justify-center opacity-40 border-dashed border-2 border-slate-300 bg-slate-50/50 h-[40vh] min-h-[300px] rounded-3xl">
        <p class="text-sm font-medium italic text-slate-500">Output from the optimized prompt</p>
      </div>
    </div>

    <canvas ref="confettiCanvas" class="fixed inset-0 pointer-events-none z-50"></canvas>
  </div>
</template>
