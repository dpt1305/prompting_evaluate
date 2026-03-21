#!/bin/bash

# Ensure Node/NPM is in path
export PATH="/Users/dpt1305/.nvm/versions/node/v24.14.0/bin:$PATH"

echo "🚀 Starting Prompting Workshop Game..."

# 1. Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# 3. Start Nuxt Dev Server
echo "🌐 Starting Dev Server on http://localhost:3001..."
npm run dev -- --port 3001 --host 0.0.0.0 &

# 4. Wait for server to be ready
sleep 5

# 5. Instructions for ngrok
echo ""
echo "✨ To expose your website with SSL via ngrok, run this command in a NEW terminal:"
echo "   ngrok http 3000"
echo ""
echo "Press Ctrl+C to stop the local server."

# Keep script running
wait
