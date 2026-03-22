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

// Typewriter effect function simulating ChatGPT streaming
const typeWriterEffect = async (text, updateFn, speed = 15) => {
  if (!text) return
  for (let i = 0; i < text.length; i++) {
    updateFn(text.charAt(i))
    await new Promise(resolve => setTimeout(resolve, speed))
  }
}

const submitPrompt = async () => {
  if (!userPrompt.value.trim()) return
  
  isSubmitting.value = true
  userResult.value = 'Analyzing prompt...'
  showAI.value = false
  evaluation.value = null
  aiResult.value = ''
  
  try {
    // Fetch User Result and Evaluation concurrently for faster perceived wait time
    const [userRes, evalRes] = await Promise.all([
      $fetch('/api/generate', { method: 'POST', body: { prompt: userPrompt.value } }),
      $fetch('/api/evaluate', { 
        method: 'POST', 
        body: { userPrompt: userPrompt.value, challengeDescription: props.challenge.description } 
      })
    ])

    // Render User Result with typewriter
    userResult.value = ''
    const typeUserRes = typeWriterEffect(userRes, (char) => userResult.value += char, 5)

    // Prepare AI side for typing
    evaluation.value = { ...evalRes, feedback: '', suggestion: '' }
    showAI.value = true

    // Fetch AI Result in the background based on optimized suggestion
    const aiResPromise = $fetch('/api/generate', { method: 'POST', body: { prompt: evalRes.suggestion } })

    // Simulate ChatGPT streaming effect for evaluation
    await typeWriterEffect(evalRes.feedback, (char) => evaluation.value.feedback += char, 15)
    await typeWriterEffect(evalRes.suggestion, (char) => evaluation.value.suggestion += char, 15)

    // Wait for the AI actual result to finish if it hasn't already
    aiResult.value = 'Thinking...'
    const aiRes = await aiResPromise
    aiResult.value = ''

    // Simulate ChatGPT streaming effect for AI generation
    await typeWriterEffect(aiRes, (char) => aiResult.value += char, 10)

    // Save Score to DB (runs in background gracefully)
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
    
    // Ensure early steps finish
    await typeUserRes

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
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
    <!-- Left Side: User Workspace -->
    <div class="space-y-6">
      <div class="glass-card border-white/10">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">{{ challenge.icon }}</span>
          <h2 class="text-xl font-bold">{{ challenge.title }}</h2>
        </div>
        <p class="text-slate-400 text-sm leading-relaxed mb-6">{{ challenge.description }}</p>
        
        <div class="relative">
          <textarea 
            v-model="userPrompt"
            placeholder="Type your strategic prompt here..."
            class="w-full h-48 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all resize-none shadow-inner"
            :disabled="isSubmitting"
          ></textarea>
        </div>
        
        <button 
          @click="submitPrompt" 
          class="primary-btn mt-4 flex items-center justify-center gap-2"
          :disabled="isSubmitting || !userPrompt.trim()"
        >
          <Send v-if="!isSubmitting" :size="20" />
          <div v-else class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          {{ isSubmitting ? 'Analyzing Strategies...' : 'Submit Answer' }}
        </button>
      </div>

      <div class="glass-card min-h-[200px] border-slate-100 bg-white">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Your AI Execution Result</h3>
        <div v-if="userResult" class="text-slate-700 leading-relaxed whitespace-pre-wrap" v-html="formatMarkdown(userResult)"></div>
        <div v-else class="text-slate-700 leading-relaxed whitespace-pre-wrap">Submit your prompt to see the result here...</div>
      </div>
    </div>

    <!-- Right Side: AI Upgrade (Hidden until submit) -->
    <div v-if="showAI" class="space-y-6 animate-in slide-in-from-right-8 duration-700">
      <!-- High Impact Score Square -->
      <div class="flex justify-center">
        <div class="w-32 h-32 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl flex flex-col items-center justify-center text-white shadow-xl shadow-accent-primary/20 transform hover:scale-105 transition-transform duration-500">
          <span class="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Score</span>
          <span class="text-5xl font-black">{{ evaluation?.score }}</span>
          <!-- <span class="text-sm font-bold opacity-80 leading-none">%</span> -->
        </div>
      </div>

      <!-- AI Feedback -->
      <div class="glass-card border-accent-primary/20 bg-accent-primary/5">
        <div class="flex items-center gap-2 mb-4">
          <Sparkles class="text-accent-primary" :size="20" />
          <h2 class="text-lg font-bold">Strategic Improvements</h2>
        </div>
        <div class="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap" v-html="formatMarkdown(evaluation?.feedback)"></div>
      </div>

      <!-- Optimized Prompt -->
      <div class="glass-card border-accent-secondary/10 bg-white relative group">
        <h3 class="text-sm font-semibold text-accent-secondary uppercase tracking-widest mb-4">Optimized Version (ERA + CoT + Few-shot)</h3>
        <div class="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm italic border border-slate-100 mb-4 shadow-inner whitespace-pre-wrap" v-html="formatMarkdown(evaluation?.suggestion)"></div>
        <button 
          @click="copyToClipboard"
          class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-accent-secondary transition-colors"
        >
          <CheckCircle2 v-if="copied" class="text-green-500" :size="16" />
          <Copy v-else :size="16" />
          {{ copied ? 'Copied to Clipboard' : 'Copy Optimized Prompt' }}
        </button>
      </div>

      <!-- AI Result -->
      <div class="glass-card border-green-500/10 bg-white">
        <h3 class="text-sm font-semibold text-green-600 uppercase tracking-widest mb-4">Enhanced Result</h3>
        <div class="text-slate-700 leading-relaxed whitespace-pre-wrap" v-html="formatMarkdown(aiResult)"></div>
      </div>

    </div>

    <!-- Empty placeholder for layout balance -->
    <div v-else class="hidden lg:flex flex-col items-center justify-center opacity-20 pointer-events-none p-12 text-center space-y-4">
       <Sparkles v-if="!isSubmitting" :size="64" />
       <div v-else class="w-16 h-16 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-4"></div>
       <p class="text-lg font-medium italic">
         {{ isSubmitting ? 'Analyzing your strategy...' : 'The AI expert is waiting to analyze your prompt...' }}
       </p>
    </div>

    <canvas ref="confettiCanvas" class="fixed inset-0 pointer-events-none z-[9999]"></canvas>
  </div>
</template>
