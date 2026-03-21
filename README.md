# Prompting Workshop Game - NuxtJS 4

A premium, interactive web application for learning and practicing expert prompting techniques (ERA, CoT, Few-shot) in a gamified environment.

## 🚀 How to Run Locally

### 1. Prerequisites
- **Node.js**: v18.x or later (v24.14.0 recommended).
- **PostgreSQL**: A running instance or a cloud provider (Supabase/Neon).

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL="postgresql://user:password@localhost:5432/prompt_db?schema=public"
```

### 3. Initialize Database
```bash
npm install
npx prisma db push
npx prisma db seed
```

### 4. Start the Application
```bash
chmod +x start-local.sh
./start-local.sh
```
Visit `http://localhost:3000` to start playing!

---

## 🌐 How to Publish (Expose via ngrok)

To share your local machine during a workshop:
1.  **Install ngrok**: `brew install ngrok/ngrok/ngrok`.
2.  **Expose Port**: `ngrok http 3000`.
3.  **Share the Link**: Participants can use the provided HTTPS URL.

---

## ☁️ How to Deploy (Production)

### 1. Database
Use a free cloud PostgreSQL provider:
- **Neon.tech**
- **Supabase**

### 2. Hosting
Deploy to **Vercel** or **Netlify**:
1. Connect your repository.
2. Set `GEMINI_API_KEY` and `DATABASE_URL` in the environment variables.
3. Deploy!

---

## 🎮 Features
- **10 Office Challenges**: Realistic tasks tailored for office workers.
- **AI-Human Comparison**: Instant feedback on your prompt performance.
- **Leaderboard**: Compete with other participants.
- **Premium Design**: Modern glassmorphism with dark mode.
