# INTERVUE AI — API Integration Plan

> **Document Status:** Planned (not yet implemented)
> **Generated:** 2026-09-02
> **Based on:** Full codebase audit of existing frontend

This document maps every frontend page to its future backend API endpoint, database source, and integration strategy.

---

## Integration Overview Table

| Frontend Page | Route | Current Data Source | Future API Endpoint | Future Database Tables |
|---|---|---|---|---|
| Dashboard | `/dashboard` | Persistent API + fallback | `GET /api/dashboard` | User, UserProgress, Activity, Subject |
| Preparation | `/preparation` | **Live Personalization API** | `GET /api/personalization` | Subject, Topic, TopicProgress, QuizAttempt, CodingSubmission, InterviewSession, Activity |
| AI Tutor | `/tutor` | Hardcoded AI reply | `POST /api/tutor/chat` | (Conversation stored optionally) |
| Quizzes | `/quizzes` | Connected Persistent API | `GET /api/quizzes`, `GET /api/quizzes/:id`, `POST /api/quizzes/:id/attempt`, `POST /api/quizzes/:id/attempt/:attemptId/submit`, `GET /api/quizzes/:id/attempt/:attemptId`, `GET /api/quizzes/attempts` | Quiz, Question, QuestionOption, QuizAttempt, QuizAttemptAnswer, Activity |
| Coding | `/coding` | Hardcoded 5 problems | `GET /api/coding/problems` + `POST /api/coding/submissions` | CodingProblem, CodingSubmission |
| Interview | `/interview` | Hardcoded session + result | `POST /api/interviews` + `POST /api/interviews/:id/answer` + `POST /api/interviews/:id/complete` | InterviewSession, InterviewMessage, InterviewEvaluation |
| Analytics | `/analytics` | **Live API data** | `GET /api/analytics/dashboard` | QuizAttempt, InterviewSession, InterviewEvaluation, CodingSubmission, UserProgress, Activity |
| Profile | `/profile` | Persistent API (`/me`) | `GET /api/auth/me` + `PATCH /api/auth/me` | User, UserPreference |
| Login | `/login` | Connected API (`/login`) | `POST /api/auth/login` | User |
| Register | `/register` | Connected API (`/register`) | `POST /api/auth/register` | User, UserPreference |

---

## Page-by-Page Integration Details

### Dashboard — `GET /api/dashboard`

**Current behavior:** All data is hardcoded inline.

**Future API Response Shape:**
```typescript
{
  user: {
    name: string
    initials: string
  }
  stats: {
    readinessScore: number
    readinessDelta: number         // e.g. +6
    studyStreakDays: number
    studyStreakBest: number
    hoursPracticed: number
    hoursThisWeek: number
    questionsSolved: number
    questionsThisWeek: number
  }
  todaysTasks: Array<{
    id: string
    title: string
    subject: string
    estimatedMin: number
    completed: boolean
  }>
  subjectProgress: Array<{
    slug: string
    title: string
    full: string
    value: number               // 0-100
    detail: string              // e.g. "12 of 16 topics"
  }>
  recentActivity: Array<{
    id: string
    description: string
    daysAgo: number
  }>
  weeklyGoal: {
    target: number
    completed: number
  }
}
```

**Integration notes:**
- Requires authenticated session
- Should be a single aggregated endpoint (not 5 separate calls) for performance
- Weekly goal sessions tracked in `UserPreference.weeklyGoalSessions`

---

### Preparation — `GET /api/subjects` + `GET /api/progress`

**Current behavior:** Static `subjects` array defined at top of component file.

**Future API Response Shape (`/api/subjects`):**
```typescript
Array<{
  id: string
  slug: string            // dsa, dbms, os, cn, oop, sql, aptitude, aiml
  name: string
  full: string
  topics: Array<{
    id: string
    name: string
    sequence: number
  }>
}>
```

**Future API Response Shape (`/api/progress`):**
```typescript
Array<{
  subjectId: string
  progress: number        // 0-100
  topicsCompleted: number
  topicsTotal: number
  nextTopicName: string
  lastStudied: string     // ISO date
}>
```

**Integration notes:**
- Subject list is relatively static (seed data)
- Progress is user-specific — requires auth
- "Next best step" recommendation will come from AI or rules-based logic comparing progress scores

---

### AI Tutor — Implemented (Stage 6)

**API Endpoints Implemented:**
- `GET /api/tutor/sessions` — List authenticated user's sessions
- `POST /api/tutor/sessions` — Create a new tutor session
- `GET /api/tutor/sessions/[sessionId]` — Get session + messages for owner
- `POST /api/tutor/sessions/[sessionId]/messages` — Send message; returns AI response

**`POST /api/tutor/sessions`** Request:
```typescript
{
  subjectId?: string   // Optional — validated server-side against Subject table
  topicId?: string     // Optional — validated against Topic table; must belong to subjectId
  title?: string       // Optional — max 200 chars
}
```

**`GET /api/tutor/sessions/[sessionId]`** Response:
```typescript
{
  session: {
    id: string; title: string | null; status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
    subject: { id: string; name: string; shortTitle: string; slug: string } | null
    topic: { id: string; name: string; slug: string } | null
    messages: Array<{ id: string; role: 'USER' | 'ASSISTANT'; content: string; createdAt: string }>
    createdAt: string; updatedAt: string
  }
}
```

**`POST /api/tutor/sessions/[sessionId]/messages`** Request:
```typescript
{ content: string }   // 1–8,000 characters; validated server-side
```
Response:
```typescript
{
  message: { id: string; role: 'ASSISTANT'; content: string; createdAt: string }
}
```

**Integration Notes:**
- All AI calls are server-side only; `OPENAI_API_KEY` never reaches the browser
- Conversations are persisted in `TutorMessage` table (individual records, not JSON blobs)
- Context window: last 20 messages per request (bounded)
- System prompt is constructed server-side; never returned to client
- Rate limit: 20 messages/user/hour → HTTP 429 with `Retry-After` header
- ARCHIVED sessions return 403 on message POST
- AI failures return 503 with sanitized message; no fake messages stored

---

### Quizzes — `GET /api/quizzes` + `POST /api/quizzes/:id/attempt`

**Current behavior:** 6 hardcoded quiz names, 1 hardcoded question with 4 hardcoded options.

**Future API Response Shape (`/api/quizzes`):**
```typescript
Array<{
  id: string
  title: string
  subjectSlug: string
  difficulty: string
  durationMin: number
  questionCount: number
  userAttempts: number        // how many times user has taken it
  lastScore: number | null    // last score, null if never taken
}>
```

**Future API Response Shape (`/api/quizzes/:id`):**
```typescript
{
  id: string
  title: string
  questions: Array<{
    id: string
    text: string
    options: string[]
    // correctIndex NOT sent to client until submission
  }>
}
```

**Future API Request (`POST /api/quizzes/:id/attempt`):**
```typescript
{
  answers: Array<{
    questionId: string
    selectedIndex: number
  }>
  timeTakenSec: number
}
```

**Future API Response:**
```typescript
{
  attemptId: string
  score: number
  total: number
  correct: number
  incorrect: number
  questions: Array<{
    questionId: string
    correct: boolean
    correctIndex: number
    explanation: string
  }>
}
```

---

### Coding — Implemented (Stage 5)

**API Endpoints Implemented:**
- `GET /api/coding/problems`
- `GET /api/coding/problems/:id`
- `POST /api/coding/problems/:id/submissions`
- `GET /api/coding/submissions`
- `GET /api/coding/submissions/:submissionId`

**Request / Response Contracts:**

**`GET /api/coding/problems`**
Query Parameters: `subjectId`, `topicId`, `difficulty` (`EASY` | `MEDIUM` | `HARD`), `limit`
Response:
```typescript
{
  problems: Array<{
    id: string
    title: string
    slug: string
    description: string
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    constraints: string
    inputFormat: string
    outputFormat: string
    tags: string[]
    subject: { id: string; name: string; shortTitle: string; slug: string }
    topic?: { id: string; name: string; slug: string }
  }>
}
```

**`GET /api/coding/problems/:id`**
Response:
```typescript
{
  id: string
  title: string
  slug: string
  description: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  constraints: string
  inputFormat: string
  outputFormat: string
  examples: Array<{ input: string; output: string; explanation?: string }>
  starterCode: { javascript: string; python: string; java: string; cpp: string }
  tags: string[]
  supportedLanguages: ['javascript', 'python', 'java', 'cpp']
  subject: { id: string; name: string; shortTitle: string; slug: string }
  topic?: { id: string; name: string; slug: string }
}
```

**`POST /api/coding/problems/:id/submissions`**
Request:
```typescript
{
  language: 'javascript' | 'python' | 'java' | 'cpp'
  sourceCode: string
}
```
Response:
```typescript
{
  id: string
  userId: string
  problemId: string
  language: string
  status: 'PENDING'
  score: null
  submittedAt: string
}
```

**`GET /api/coding/submissions?problemId=:id`**
Response:
```typescript
{
  submissions: Array<{
    id: string
    problemId: string
    language: string
    status: 'PENDING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'COMPILE_ERROR' | 'ERROR'
    submittedAt: string
  }>
}
```

**Integration Notes & Security Rules:**
- Stage 5 persists code submissions with status `PENDING`.
- No arbitrary user code is executed on the Next.js server.
- Source code length is validated up to 64KB.
- Submissions are isolated per user; full source code detail is accessible only by the owner.

---

### Interview Engine — Implemented (Stage 7)

**API Endpoints Implemented:**
- `GET /api/interviews` — List current user's interview history
- `POST /api/interviews` — Create a new interview session
- `GET /api/interviews/[sessionId]` — Get session metadata, current question, and Q&A history
- `POST /api/interviews/[sessionId]/start` — Start session & generate 1st question via OpenAI
- `POST /api/interviews/[sessionId]/questions/[questionId]/answer` — Submit text answer, evaluate via OpenAI (0-10 scores, feedback, strengths, improvements), and auto-generate next question
- `POST /api/interviews/[sessionId]/complete` — Finalize session, calculate server-side overall score, and generate summary feedback
- `POST /api/interviews/[sessionId]/abandon` — Abandon active session
- `GET /api/interviews/[sessionId]/result` — Get overall evaluation result, breakdown metrics, and question-by-question review

**Request / Response Contracts:**

**`POST /api/interviews`** Request:
```typescript
{
  interviewType?: 'GENERAL' | 'TECHNICAL' | 'BEHAVIORAL' | 'MIXED'
  targetRole?: string        // max 200 chars
  subjectId?: string
  topicId?: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  questionCount?: number     // 3–15, default 5
  title?: string
}
```

**`POST /api/interviews/[sessionId]/questions/[questionId]/answer`** Request:
```typescript
{ answerText: string }       // 1–8,000 chars; validated server-side
```
Response:
```typescript
{
  answer: { id: string; questionId: string; submittedAt: string }
  evaluation: {
    id: string
    relevanceScore: number    // 0-10
    correctnessScore: number  // 0-10
    clarityScore: number      // 0-10
    depthScore: number        // 0-10
    overallScore: number      // 0-10
    feedback: string
    strengths?: string[]
    improvements?: string[]
  }
  isLastQuestion: boolean
  nextQuestion: { id: string; questionNumber: number; questionText: string } | null
}
```

**`GET /api/interviews/[sessionId]/result`** Response:
```typescript
{
  session: { id: string; title: string; overallScore: number; overallFeedback: string; ... }
  metrics: { relevanceScore: number; correctnessScore: number; clarityScore: number; depthScore: number } // 0-100%
  strengths: string[]
  improvements: string[]
  questions: Array<{ questionNumber: number; questionText: string; answer: { answerText: string; evaluation: {...} } }>
}
```

---
- For voice input: frontend sends audio blob; backend uses speech-to-text, then passes transcript to LLM (future stage)

---

### Analytics — `GET /api/analytics`

**Current behavior:** All values are hardcoded mock numbers.

**Future API Response Shape:**
```typescript
{
  overview: {
    readinessScore: number
    readinessDelta: number
    interviewsCompleted: number
    interviewAvgScore: number
    problemsSolved: number
    problemsThisMonth: number
  }
  subjectPerformance: Array<{
    slug: string
    title: string
    score: number
  }>
  interviewMetrics: {
    avgScore: number
    technicalAvg: number
    communicationAvg: number
    trend: number            // % change
  }
  codingDistribution: {
    easy: number             // % of problems
    medium: number
    hard: number
  }
  aiRecommendation: string
}
```

**Integration notes:**
- Aggregated on the server from QuizAttempt, InterviewEvaluation, CodingSubmission, UserProgress
- AI recommendation generated server-side based on weakest areas
- Can be cached (5–10 min TTL) for performance

---

### Profile — `GET /api/auth/me` + `PATCH /api/auth/me`

**Current behavior:** Hardcoded "Jordan Davis" user, edit mode shows inputs with no save.

**Future API Response Shape (`GET /api/auth/me`):**
```typescript
{
  id: string
  name: string
  email: string
  initials: string
  college: string
  degree: string
  graduationYear: number
  targetRole: string
  targetCompanies: string
  preparationGoal: string
  skills: string[]
  createdAt: string
}
```

**Future API Request (`PATCH /api/auth/me`):**
```typescript
{
  name?: string
  college?: string
  degree?: string
  graduationYear?: number
  targetRole?: string
  targetCompanies?: string
  preparationGoal?: string
  skills?: string[]
}
```

---

### Authentication — `/api/auth/*`

**Current behavior:** Form submit shows static demo message.

**`POST /api/auth/register`:**
- Body: `{ name, email, password, confirmPassword }`
- Validates input, hashes password with bcrypt, creates User record
- Returns: JWT or sets session cookie

**`POST /api/auth/login`:**
- Body: `{ email, password }`
- Verifies password hash, creates session
- Returns: JWT or sets session cookie

**`POST /api/auth/logout`:**
- Clears session cookie or invalidates token

**`GET /api/auth/me`:**
- Reads session/token, returns current user profile

---

## Frontend Integration Strategy

### Phase 1: API Client Setup

Create a shared API client utility:

```typescript
// lib/api.ts
async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`/api${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
```

### Phase 2: Replace Mock Data Per Page

For each page, the integration will follow this pattern:

1. Add a `useEffect` hook (or use React Server Component data fetching)
2. Call the corresponding API endpoint
3. Replace hardcoded values with API response data
4. Handle loading and error states

### Phase 3: Authentication Gate

Add a higher-order component or middleware that:
1. Checks for valid session on protected routes
2. Redirects to `/login` if unauthenticated
3. Injects user data into the app context

### Protected Routes

All routes except `/login` and `/register` should require authentication:
- `/dashboard`
- `/preparation`
- `/tutor`
- `/quizzes`
- `/coding`
- `/interview`
- `/analytics`
- `/profile`

---

## Complete API Endpoint Reference

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create user account |
| POST | `/api/auth/login` | No | Authenticate user |
| POST | `/api/auth/logout` | Yes | Invalidate session |
| GET | `/api/auth/me` | Yes | Get current user |
| PATCH | `/api/auth/me` | Yes | Update user profile |
| GET | `/api/dashboard` | Yes | Aggregated dashboard data |
| GET | `/api/subjects` | Yes | All subjects list |
| GET | `/api/subjects/:id/topics` | Yes | Topics for a subject |
| GET | `/api/progress` | Yes | User progress per subject |
| POST | `/api/tutor/chat` | Yes | Send message to AI tutor |
| GET | `/api/quizzes` | Yes | List available quizzes |
| GET | `/api/quizzes/:id` | Yes | Get quiz with questions |
| POST | `/api/quizzes/:id/attempt` | Yes | Submit quiz answers |
| GET | `/api/quizzes/attempts` | Yes | User's quiz history |
| GET | `/api/coding/problems` | Yes | List coding problems |
| GET | `/api/coding/problems/:slug` | Yes | Get problem details |
| POST | `/api/coding/submissions` | Yes | Submit code for evaluation |
| GET | `/api/coding/submissions` | Yes | User's submission history |
| POST | `/api/interviews` | Yes | Create interview session |
| GET | `/api/interviews` | Yes | User's interview history |
| GET | `/api/interviews/:id` | Yes | Get interview session |
| POST | `/api/interviews/:id/start` | Yes | Start session, generate Q1 |
| POST | `/api/interviews/:id/questions/:qId/answer` | Yes | Submit answer, get AI evaluation |
| POST | `/api/interviews/:id/complete` | Yes | Finalize session, calculate score |
| POST | `/api/interviews/:id/abandon` | Yes | Abandon active session |
| GET | `/api/interviews/:id/result` | Yes | Final evaluation result |
| GET | `/api/analytics/dashboard` | **Yes** | **Unified analytics: quiz/coding/interview/tutor/subject/activity/recommendations** |

---

## Stage 8 Analytics Architecture

### Endpoint
```
GET /api/analytics/dashboard
```

### Authentication
- JWT cookie only. `userId` taken exclusively from `session.userId`.
- Unauthenticated → `401 Unauthorized`.

### Service: `services/analytics.ts`

All metrics are deterministic and server-side only. No OpenAI calls made.

| Metric Category | Fields Calculated |
|---|---|
| Overview Readiness | Weighted combination: topic progress (40%) + quiz accuracy (20%) + coding solved count (20%) + interview avg score (20%) |
| Quiz Performance | `totalAttempts`, `completedAttempts`, `averageScorePct`, `totalQuestionsAnswered`, `correctAnswersCount`, `accuracyPct` |
| Coding Performance | `totalSubmissions`, `acceptedSubmissions`, `solvedProblemsCount`, `acceptanceRatePct`, `difficultyDistribution` (Easy/Medium/Hard) |
| Interview Performance | `totalSessions`, `completedInterviews`, `averageScorePct`, `metricsBreakdown` (Relevance/Correctness/Clarity/Depth %) |
| AI Tutor | `totalSessions`, `totalMessages` |
| Subject Breakdown | Per-subject: topic progress %, quiz score average, coding solved count, interviews completed |
| Recent Activity | Latest 10 Activity records with relative time formatting |
| Recommendations | Up to 3 deterministic rule-based items; no OpenAI |

---

## Stage 9 Personalization Architecture

### Endpoint
```
GET /api/personalization
```

### Authentication
- JWT cookie only. `userId` taken exclusively from `session.userId`.
- Unauthenticated → `401 Unauthorized`.

### Service: `services/personalization.ts`

All personalization is deterministic, server-side only, and reuses `getUserAnalytics()` from Stage 8. Zero OpenAI calls made.

| Category | Computed Output |
|---|---|
| Preparation Level | `not_started`, `getting_started`, `building`, `developing`, `interview_ready` |
| Strength/Weakness | Per-subject classification: `strong`, `developing`, `weak`, `no_data` |
| Subject Prioritization | Ranked subjects with composite priority score, reasons, and recommended action |
| Topic Prioritization | Ranked uncompleted topics from `TopicProgress` records |
| Learning Path | Up to 10 ordered actionable items (effort: low/medium/high, priority: high/medium/low) |
| Adaptive Recommendations | Up to 5 evidence-based recommendations considering accuracy, acceptance rates, and interview evaluation dimensions |
| Momentum | `increasing`, `steady`, `decreasing`, or `insufficient_data` (based on 7-day activity delta) |
| Coverage | Quantified coverage for subjects, topics, quizzes, and coding problems |
| Insufficient Data | Explicit list of areas lacking user performance evidence |


### Recommendation Engine Rules
1. No completed interviews → recommend starting an AI interview (high priority)
2. Solved problems < 3 → recommend coding practice (high/medium priority)
3. Weakest subject < 80% → recommend studying that subject (medium priority)
4. No quiz attempts → recommend taking first quiz (medium priority)
5. Interviews done + problems solved ≥ thresholds → recommend mixed practice (low priority)
