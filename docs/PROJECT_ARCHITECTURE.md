# INTERVUE AI — Project Architecture

> **Document Status:** Updated after Stage 11 (Production Launch, Google Sign-In, SEO & User Growth)  
> **Last Updated:** 2026-09-03  
> **Scope:** Full architecture including authentication, Google OAuth 2.0, placement database, Quiz engine, Coding Practice engine, AI Tutor, AI Interview Engine, Analytics, Personalization, SEO Foundation, Referrals, and Public Shareable Badges.

---

## Current Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.3.3 |
| UI Library | React | ^19 |
| Language | TypeScript | 5.7.3 |
| Database ORM | Prisma | ^6.19.3 |
| Database | Neon Serverless PostgreSQL | PostgreSQL |
| Authentication | Custom JWT in httpOnly Cookie | jose ^6.2.10 |
| Password Hashing | bcryptjs | ^3.0.3 |
| Validation | Zod | ^3.25.7 |
| Styling | Tailwind CSS v4 | ^4.3.3 |
| UI Component System | shadcn (base-nova style) + @base-ui/react | ^4.11.0 / ^1.5.0 |
| Icons | lucide-react | ^1.16.0 |
| **AI Provider** | **OpenAI (server-side only)** | **openai ^4.x** |

### Database layer active (Neon PostgreSQL via Prisma).
### Authentication layer active (JWT HTTP-Only cookie).
### API routes active (/api/auth/*, /api/auth/google/*, /api/subjects, /api/progress, /api/activity, /api/dashboard, /api/quizzes/*, /api/coding/*, /api/tutor/*, /api/interviews/*, /api/analytics/*, /api/personalization, /api/referrals, /api/share/*).
### Placement data seeded (8 subjects, 93 topics, 8 quizzes, 80 questions, 14 coding problems).
### AI Tutor & AI Interview Engine active (OpenAI gpt-4o-mini; server-side only; text-based only; OPENAI_API_KEY never exposed to client).
### Analytics, Personalization & Growth Engines active (Google OAuth 2.0 coexisting with JWT; referrals; public share badges; robots/sitemap SEO).

---

## AI Architecture (Stage 6)

Stage 6 introduces server-side AI tutoring functionality. All OpenAI API credentials remain server-side.

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | Yes (for AI) | — | OpenAI API key — **never exposed to browser** |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | OpenAI model to use for tutoring |

### Services

| Service | File | Responsibility |
|---|---|---|
| AI Provider | `services/ai.ts` | OpenAI client, model config, callTutorAI(), system prompt builder, error normalization |
| Tutor Logic | `services/tutor.ts` | Session CRUD, ownership checks, rate limiting, message persistence, context construction |

### Rate Limiting

- Strategy: In-memory per-user Map, 20 AI messages per user per hour
- Returns `HTTP 429` with `Retry-After` header when exceeded
- Limitation: Does not persist across multiple server instances (documented)

### Context Window

- Maximum 20 historical messages loaded per AI request (bounded; prevents token runaway)
- System prompt injected server-side; never returned to client

### Security

- `OPENAI_API_KEY` read from `process.env` on server only
- Never stored in database, logs, API responses, or activity metadata
- Client cannot specify model, temperature, token limits, or system prompt
- AI output rendered as plain text (no HTML execution)
- Messages persisted only after successful AI response (no orphaned user messages)



## Frontend Architecture

### Main Application Structure

The entire frontend lives in a **single monolithic component file**:

```
components/
  intervue-app.tsx     <- ~1,100 lines, all pages + routing + state
  ui/
    button.tsx         <- shadcn/base-ui Button component (only UI primitive used)

app/
  layout.tsx           <- Root layout (Vercel Analytics, metadata, global CSS)
  page.tsx             <- Root route renders <IntervueApp />
  [...slug]/
    page.tsx           <- Catch-all route, also renders <IntervueApp />

lib/
  utils.ts             <- cn() utility (clsx + tailwind-merge)
```

### Routing Strategy

**This is a client-side routing application built on top of Next.js App Router.**

The routing is NOT implemented via Next.js file-based routing. Instead:
- `app/page.tsx` and `app/[...slug]/page.tsx` **both render the same `<IntervueApp />`** component.
- `<IntervueApp />` uses `usePathname()` from `next/navigation` and performs **manual conditional rendering** based on the current pathname.
- All navigation uses Next.js `<Link>` components.

```typescript
// Routing logic in IntervueApp (line 65):
const page = pathname === '/preparation' ? <Preparation />
           : pathname === '/tutor'       ? <Tutor />
           : pathname === '/quizzes'     ? <Quizzes />
           : pathname === '/coding'      ? <Coding />
           : pathname === '/interview'   ? <Interview />
           : pathname === '/analytics'   ? <Analytics />
           : pathname === '/profile'     ? <Profile />
           : <Dashboard />
```

Authentication routes (`/login`, `/register`) are handled before layout rendering:
```typescript
const auth = pathname === '/login' || pathname === '/register';
if (auth) return <Auth register={pathname === '/register'} />;
```

### Components

All components are **inline, non-exported functions** within `intervue-app.tsx`. No separate component files exist for page-level components.

| Component | Purpose | State |
|---|---|---|
| `IntervueApp` | Root application shell — layout, routing, theme | `mobileOpen`, `dark` |
| `Brand` | Logo/brand link | None |
| `IconButton` | Utility icon button wrapper | None |
| `Sidebar` | Left navigation sidebar | None (reads pathname) |
| `Topbar` | Top header bar (theme toggle, user info) | None |
| `ProgressBar` | Reusable progress indicator | None |
| `DemoLabel` | Visual indicator that data is mock | None |
| `PageHeading` | Shared page header section | None |
| `Stat` | KPI stat card | None |
| `Dashboard` | Dashboard page content | None (inline tasks array) |
| `Preparation` | Learning path page | None (uses shared subjects const) |
| `Tutor` | AI tutor chat page | `messages[]`, `input` |
| `Quizzes` | Quiz listing + demo quiz | `active`, `submitted` |
| `Coding` | Coding problem browser + editor | `search` |
| `Interview` | Interview configurator | `started`, `ended`, `type`, `difficulty`, `duration` |
| `LiveInterview` | Mock live interview session | None |
| `InterviewResult` | Interview result/evaluation | None |
| `Analytics` | Analytics overview page | None |
| `Profile` | User profile + edit | `editing` |
| `Auth` | Login/Register page | `show` (password), `submitted` |

### State Management

**No global state management.** All state is local React `useState` within each page component.

- No Zustand, Redux, Context, Jotai, or similar.
- No persistent state — every route navigation resets page state.
- No session/auth state is tracked anywhere.
- Theme (dark mode) lives in `IntervueApp` and is NOT persisted to localStorage.

### Styling

- **Tailwind CSS v4** is used as the primary styling system.
- **shadcn (base-nova style)** provides the design token layer.
- CSS variables defined in `app/globals.css` using OKLCH color space.
- Light/dark mode is implemented via a `.dark` class toggle on the root `div`.
- The `cn()` utility (`clsx` + `tailwind-merge`) is used selectively.
- Most styling uses inline Tailwind class strings assigned to module-level `const` variables:
  ```typescript
  const button = 'inline-flex items-center justify-center gap-2 rounded-lg bg-primary ...'
  const outlineButton = 'inline-flex items-center justify-center gap-2 rounded-lg border ...'
  const card = 'rounded-xl border border-border bg-card'
  ```

### Theme System

- Two color schemes: light (default) and dark.
- Colors defined via CSS custom properties using OKLCH (device-independent).
- Dark mode triggered by adding `dark` class to root `<div>` inside `IntervueApp`.
- Note: The `<html>` element does NOT receive the dark class — only the root div. This means `@custom-variant dark (&:is(.dark *))` is required (already configured in globals.css).

### Mock Data

All data in the application is hardcoded mock data. No API calls are made anywhere.

#### Subjects (shared constant, top of file)
```typescript
const subjects = [
  { title: 'DSA', full: 'Data Structures & Algorithms', value: 78, detail: '12 of 16 topics', icon: Code2 },
  { title: 'DBMS', full: 'Database Management', value: 64, detail: '8 of 14 topics', icon: BarChart3 },
  { title: 'OS', full: 'Operating Systems', value: 42, detail: '5 of 12 topics', icon: Settings2 },
  { title: 'CN', full: 'Computer Networks', value: 56, detail: '7 of 13 topics', icon: Target },
  { title: 'OOP', full: 'Object Oriented Programming', value: 71, detail: '9 of 12 topics', icon: BrainCircuit },
  { title: 'SQL', full: 'SQL Practice', value: 68, detail: '26 of 36 problems', icon: Code2 },
  { title: 'Aptitude', full: 'Quantitative Aptitude', value: 53, detail: '6 of 11 topics', icon: Trophy },
  { title: 'AI/ML', full: 'AI & ML Fundamentals', value: 38, detail: '3 of 10 topics', icon: Sparkles },
]
```

#### Hardcoded User Identity (mock)
- Name: **Jordan Davis** (initials: JD)
- Email: `jordan.davis@example.com`
- College: Northbridge Institute of Technology
- Degree: B.Tech Computer Science
- Graduation: 2027

---

## Existing Routes

All routes serve the same `<IntervueApp />` component, which switches page content based on `usePathname()`.

| Route | Rendered Page Component | Description |
|---|---|---|
| `/` | `<Dashboard />` | Default — also shown for any unknown path |
| `/dashboard` | `<Dashboard />` | Study stats, today's tasks, readiness score, subject progress, activity |
| `/login` | `<Auth register={false} />` | Login form (frontend-only, form submit shows demo message) |
| `/register` | `<Auth register={true} />` | Registration form (frontend-only, form submit shows demo message) |
| `/preparation` | `<Preparation />` | Learning curriculum, 8 subjects with progress bars, next step suggestions |
| `/tutor` | `<Tutor />` | Mock AI chat interface with simulated AI responses |
| `/quizzes` | `<Quizzes />` | Quiz list + demo quiz flow (hardcoded question, options, submit screen) |
| `/coding` | `<Coding />` | Problem browser + code editor (no execution, demo editor) |
| `/interview` | `<Interview />` | Interview configurator -> mock live session -> result evaluation |
| `/analytics` | `<Analytics />` | Performance charts, subject progress, interview stats (all mock) |
| `/profile` | `<Profile />` | User profile display + inline editing (no persistence) |
| `/*` (catch-all) | `<Dashboard />` | Any unmatched path falls back to Dashboard |

### Route Details

#### `/dashboard`
- Stat cards: Readiness score, Study streak, Hours practiced, Questions solved
- Today's focus: 4 hardcoded tasks with completion status
- Readiness snapshot: Score of 72/100 with progress bar
- Subject progress grid: 8 subjects with individual progress bars
- Recent activity feed: 4 static entries
- Quick actions: 4 navigation buttons

#### `/login` and `/register`
- Email + password fields
- Password show/hide toggle
- On submit: shows demo message ("Demo submission received. Authentication will be connected during backend development.")
- No actual validation or network request

#### `/preparation`
- "Next best step" recommendation card (hardcoded: OS)
- Grid of 8 subject cards with progress bars and "next topic" suggestion

#### `/tutor`
- Chat interface with static initial AI message
- User can type and send messages
- Every response is the same hardcoded AI reply
- Suggested prompts sidebar
- Subject selector dropdown (no functional effect)

#### `/quizzes`
- Left panel: 6 quiz options (selectable, visual highlight only)
- Right panel: Demo quiz — hardcoded DBMS question, 4 options, submit shows score

#### `/coding`
- Left panel: Problem list (5 problems), search filter
- Right panel: Problem description + dark code editor (no execution)
- Language selector (no functional effect)

#### `/interview`
- Setup screen: interview type, difficulty, duration, style dropdowns + focus area checkboxes
- Start -> `<LiveInterview />`: mock video call UI, timer (static 18:42), transcript panel
- End -> `<InterviewResult />`: score 78/100, 6 evaluation dimensions, strengths/improvements, AI feedback

#### `/analytics`
- 3 stat cards: Overall readiness, Interviews completed, Problems solved
- Subject performance bars (7 subjects)
- Interview performance grid: avg score, technical, communication, trend
- Coding distribution bar chart (Easy/Medium/Hard)
- AI recommended focus text

#### `/profile`
- Avatar with initials
- Profile fields: college, degree, graduation year, target role, target companies, goal
- Edit mode: converts display spans to input fields (no persistence)
- Skills badges

---

## Current Limitations

Everything below is **currently simulated or absent**:

### Authentication
- **Status: Frontend-only simulation**
- Forms exist at `/login` and `/register` but submit to nothing
- No session management, no tokens, no cookies
- No protected routes (all pages accessible without login)
- No logout functionality

### AI Responses (Tutor)
- **Status: Hardcoded string**
- Every user message returns the same static response
- No LLM API calls
- No conversation history persistence

### Interview Simulation
- **Status: Fully scripted mock**
- Questions are hardcoded
- Timer is static (not running)
- Mic and camera buttons exist but have no functional handlers
- Scores are hardcoded (78/100)
- Evaluation breakdown is hardcoded

### Voice / Audio / Video
- **Status: Not implemented**
- Mic and camera buttons render but do no browser API work
- No WebRTC, no MediaStream, no speech recognition

### Coding Execution
- **Status: Not implemented**
- Code editor is a `<pre>` tag with static content
- Run/Submit buttons have no handlers
- "execution unavailable" is displayed as a note

### Data Persistence
- **Status: None**
- Nothing is stored between page reloads
- No localStorage, no sessionStorage, no cookies, no database

### Analytics
- **Status: Fully hardcoded**
- All numbers are static mock values
- No tracking of real user actions

---

## Recommended Backend Architecture

### Why stay within Next.js API Routes

Since the application is already a Next.js App Router project, the recommended approach is to use **Next.js Route Handlers** (`app/api/*/route.ts`) as the backend layer rather than introducing a separate server. This avoids CORS complexity, keeps deployment unified, and requires no additional infrastructure.

A separate backend would only be justified if:
- The AI processing requires Python-specific libraries (PyTorch, HuggingFace)
- Code execution requires Docker-based sandboxing
- The team independently scales the AI layer

### Proposed Architecture

```
Next.js Application
  |
  +-- app/ (React pages, client-side)
  |     |
  |     +-- dashboard, preparation, tutor, quizzes, coding, interview, analytics, profile
  |
  +-- app/api/ (Server-side Route Handlers)
  |     |
  |     +-- /api/auth/* (register, login, logout, me)
  |     +-- /api/dashboard
  |     +-- /api/subjects
  |     +-- /api/tutor/chat
  |     +-- /api/quizzes/*
  |     +-- /api/coding/*
  |     +-- /api/interviews/*
  |     +-- /api/analytics/*
  |
  +-- services/ (Business Logic Abstraction)
  |     |
  |     +-- ai.ts        <- AI provider abstraction
  |     +-- auth.ts      <- Auth logic
  |     +-- interview.ts <- Interview session management
  |     +-- quiz.ts      <- Quiz scoring/evaluation
  |     +-- analytics.ts <- Progress aggregation
  |     +-- coding.ts    <- Problem management
  |
  +-- prisma/
        +-- schema.prisma <- Database schema
        +-- migrations/   <- Migration files
```

### Recommended Technology Choices

| Concern | Recommendation | Rationale |
|---|---|---|
| Database | PostgreSQL | Production-grade, ACID, excellent Prisma support |
| ORM | Prisma | Type-safe, excellent Next.js integration, migrations |
| Auth Strategy | JWT + httpOnly cookies | Secure, stateless, compatible with serverless |
| Password Hashing | bcryptjs | Industry standard, no native binary issues |
| AI Provider | OpenAI GPT-4o (initial) | Best availability for conversational interview simulation |
| AI Abstraction | Custom `services/ai.ts` | Avoid vendor lock-in |
| Code Execution | Judge0 API (external) | Sandboxed execution without managing infrastructure |
| Deployment | Vercel | Already configured, supports serverless API routes |
| Environment | .env.local (Next.js native) | Already in .gitignore |

---

## Recommended Database Schema (Conceptual)

Based on actual application inspection:

```
User
  id, name, email, passwordHash
  college, degree, graduationYear, targetRole, targetCompanies
  createdAt, updatedAt

UserPreference
  id, userId(FK)
  preferredSubjects[], difficulty, weeklyGoalSessions

Subject
  id, slug, name, description

Topic
  id, subjectId(FK), name, sequence

Quiz
  id, title, subjectId(FK), difficulty, durationMin

Question
  id, quizId(FK nullable), subjectId(FK), topicId(FK)
  text, options(JSON), correctIndex, explanation, difficulty

QuizAttempt
  id, userId(FK), quizId(FK), score, totalQ
  startedAt, completedAt

CodingProblem
  id, title, slug, description, difficulty, topic
  constraints, examples(JSON), starterCode(JSON)

CodingSubmission
  id, userId(FK), problemId(FK), language, code
  status(pending/accepted/wrong/error/timeout), submittedAt

InterviewSession
  id, userId(FK), type, difficulty, durationMin, focusAreas[]
  status(configured/active/completed), startedAt, completedAt

InterviewMessage
  id, sessionId(FK), role(ai/user), content, sequence, createdAt

InterviewEvaluation
  id, sessionId(FK)
  technicalScore, communicationScore, problemSolvingScore
  confidenceScore, answerQualityScore, timeManagementScore
  overallScore, strengths[], improvements[], aiFeedback

UserProgress
  id, userId(FK), subjectId(FK), progress(0-100), updatedAt

Activity
  id, userId(FK), type, metadata(JSON), createdAt
```
