# Fine, I'll Eat

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/yasminhalwani91-2040s-projects/v0-fine-ill-eat)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/mZPjjqFMqLK)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/yasminhalwani91-2040s-projects/v0-fine-ill-eat](https://vercel.com/yasminhalwani91-2040s-projects/v0-fine-ill-eat)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/mZPjjqFMqLK](https://v0.app/chat/mZPjjqFMqLK)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## AI meal plans (Vercel)

To enable AI-generated meal plans on Vercel:

1. **Environment variables** (Project → Settings → Environment Variables):
   - `OPENROUTER_API_KEY` — your key from [openrouter.ai/keys](https://openrouter.ai/keys) (required for AI).
   - Optional: `OPENROUTER_MODEL` — e.g. `meta-llama/llama-3.1-8b-instruct` for faster responses within Vercel’s 60s limit (Pro plan).

2. **Redeploy** after adding or changing env vars.

3. **Plans**: Vercel **Pro** allows 60s for the AI route; **Hobby** allows 10s, so AI may time out and the app will fall back to the built-in meal database.