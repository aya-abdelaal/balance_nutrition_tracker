# Balance Nutrition Tracker

Mobile-first web app for **80/20 nutrition balance** — not calorie counting. Log meals as loose text, get a health score, and aim for **80%+**.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase (auth + Postgres + RLS)
- Google Gemini (meal scoring)
- Vercel hosting

## Setup

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. SQL Editor → run [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql)
3. Authentication → Providers → Email enabled
4. (Optional) Authentication → Providers → disable "Confirm email" for faster local testing
5. Copy **Project URL** and **anon key** into `.env.local`

### 3. Gemini

1. Open [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key
3. Put it in `.env.local` as `GEMINI_API_KEY`

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Tests

```bash
npm test
```

Manual checklist: [`ACCEPTANCE.md`](ACCEPTANCE.md)

## Deploy (GitHub + Vercel)

1. Push this repo to GitHub as `balance_nutrition_tracker`
2. Import the repo in [Vercel](https://vercel.com)
3. Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`
4. Deploy
5. In Supabase → Authentication → URL Configuration, add your Vercel URL to **Site URL** and **Redirect URLs** (`https://your-app.vercel.app/auth/callback`)

## Features

- Today / Weekly (rolling 7 days) / Overall health scores
- Plain-text meal logging via Gemini
- Relative category estimates (carbs, protein, fats, fiber, sugar)
- Soft "Add more …" tips
- Week meal log
- Manual overall score reset (keeps history)
