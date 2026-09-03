# INTERVUE AI

INTERVUE AI is an AI-powered technical placement preparation platform built with Next.js, TypeScript, Tailwind CSS, Prisma, Neon PostgreSQL, and OpenAI.

## Features

- **JWT Authentication & Security**: Custom JWT auth, password hashing with bcrypt, rate limiting, secure password reset, email verification, and Google OAuth 2.0.
- **Placement Curriculum & Practice**: Subjects, topics, topic progress tracking, adaptive recommendation engine.
- **Interactive Quiz Engine**: Practice quizzes across computer science subjects with score breakdown.
- **Coding Practice Engine**: Real-time coding workspace with test case execution and submission history.
- **AI Tutor**: Persistent, interactive AI coaching powered by OpenAI server-side architecture.
- **AI Mock Interview Engine**: Conversational AI interview sessions with realistic questions, structured evaluation, and personalized feedback.
- **Analytics & Dashboard**: Readiness score tracking, subject proficiency breakdown, activity feeds, and weak-area identification.
- **Public Shareable Badges**: Share readiness achievements and interview scores via public shareable links.
- **Referral System**: Invite friends and track referral milestones.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Neon PostgreSQL via Prisma ORM
- **AI Engine**: OpenAI API (gpt-4o-mini)
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **Auth**: Custom JWT (jose) + Google OAuth 2.0

## Getting Started

1. Clone repository:
   ```bash
   git clone https://github.com/ullaspn402-boop/INTERVEUAI.git
   cd INTERVEUAI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and set `DATABASE_URL`, `AUTH_SECRET`, `OPENAI_API_KEY`, etc.

4. Run database migrations:
   ```bash
   npx prisma db push
   ```

5. Start development server:
   ```bash
   npm run dev
   ```
