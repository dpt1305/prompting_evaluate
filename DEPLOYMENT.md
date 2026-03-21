# Deployment & Local Strategy

## Local Run (Mac)
1. Ensure you have Node.js installed.
2. Update `.env` with your `GEMINI_API_KEY` and `DATABASE_URL` (PostgreSQL).
3. Run `./start-local.sh` to start the app.

## Exposing via ngrok (SSL)
1. Install ngrok: `brew install ngrok/ngrok/ngrok` (if using Homebrew).
2. Authenticate: `ngrok config add-authtoken <YOUR_TOKEN>`.
3. Expose the app: `ngrok http 3000`.
4. ngrok will provide a `.ngrok-free.app` URL with **SSL (HTTPS)**.

## PostgreSQL Setup
I recommend using a free cloud PostgreSQL provider for the leaderboard:
- **Supabase**: Excellent free tier, provides a connection string for `DATABASE_URL`.
- **Neon.tech**: Purpose-built for serverless/Nuxt, very fast setup.

### Initialize Database
Once you have your `DATABASE_URL`, run:
```bash
npx prisma db push
npx prisma db seed # If you want to populate the 10 demo challenges
```

## Production Deployment
- **Vercel**: Connect your GitHub repo, add environment variables, and it will deploy automatically.
- **Netlify**: Similar to Vercel, perfect for Nuxt.
