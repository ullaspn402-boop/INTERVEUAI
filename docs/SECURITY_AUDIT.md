# INTERVUE AI — Security Audit

> **Document Status:** Updated after Stage 4 (Quiz Engine Security Audit)
> **Original:** 2026-09-02
> **Updated:** 2026-09-03
> **Scope:** Full codebase including Quiz Engine, Attempts & Server-side Evaluation

---

## Summary

Stage 2 implemented real authentication: Prisma + PostgreSQL schema, bcrypt password hashing, JWT sessions in httpOnly cookies, server-side Zod validation, Next.js middleware route protection, and frontend integration. The attack surface has grown and is now documented in full.

---

## Severity Legend

| Level | Meaning |
|---|---|
| CRITICAL | Must be fixed before any production data handling |
| HIGH | Must be fixed before backend integration |
| MEDIUM | Should be addressed in the integration phase |
| LOW | Minor quality issue, fix when convenient |
| INFO | Informational — no action required |

No `.env`, `.env.local`, or `.env.example` file exists. This is acceptable for the current frontend-only phase, but must be addressed before any API keys, database URLs, or secrets are added.

**Risk:** Without `.env.example`, future developers may not know what environment variables are required, leading to secrets being committed directly to code.

**Recommendation:**
- Create `.env.example` with placeholder names immediately (done in this task)
- Confirm `.env*.local` is in `.gitignore` (already confirmed — it is)
- Add `DATABASE_URL`, `AUTH_SECRET`, and `AI_API_KEY` as placeholders

---

### 2. No Authentication or Authorization

**Severity:** HIGH (will become CRITICAL when backend connects)  
**Location:** `components/intervue-app.tsx`  

All routes are currently publicly accessible. There are no session checks, no token validation, and no protected route logic.

**Current code (line 65):**
```typescript
const auth = pathname === '/login' || pathname === '/register';
if (auth) return <Auth register={pathname === '/register'} />;
// All other routes fall through to dashboard — no auth check
```

**Risk:** When backend APIs are connected, if route protection is not implemented, unauthenticated users could access protected data.

**Recommendation:**
- Implement middleware-based route protection using Next.js `middleware.ts`
- Check for valid session cookie on all non-auth routes
- Redirect unauthenticated users to `/login`
- Do NOT rely only on client-side checks — validate on the server

---

### 3. Hardcoded Date in Topbar

**Severity:** LOW  
**Location:** `components/intervue-app.tsx`, `Topbar` component  

```typescript
<div className="hidden text-sm text-muted-foreground lg:block">
  Tuesday, September 2, 2026
</div>
```

The date is hardcoded as a static string. This is a minor cosmetic issue (stale date), not a security concern. However, it indicates the code was not updated dynamically.

**Recommendation:** Replace with `new Date().toLocaleDateString('en-US', { weekday: 'long', ... })`.

---

### 4. TypeScript Build Errors Suppressed

**Severity:** MEDIUM  
**Location:** `next.config.mjs`  

```javascript
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // <-- Risk
  },
  images: {
    unoptimized: true,
  },
}
```

`ignoreBuildErrors: true` means the production build will succeed even if TypeScript has type errors. This masks real bugs and type safety violations.

**Risk:** Type errors that could expose runtime bugs (e.g., undefined access on API response data) will not be caught during CI/CD.

**Recommendation:**
- Remove `ignoreBuildErrors: true` before backend integration begins
- Fix all type errors (currently likely zero since no API types exist yet)
- Add this as a required step in the next implementation stage

---

### 5. No Input Validation on Auth Forms

**Severity:** MEDIUM (will become HIGH when backend connects)  
**Location:** `Auth` component, `components/intervue-app.tsx`  

The login/register forms currently have:
- `type="email"` on email field (browser-level validation only)
- `type="password"` on password field
- `required` attribute

However, there is **no custom validation logic**:
- No minimum password length check
- No password strength enforcement
- No email format validation beyond browser default
- No CSRF protection

When the backend connects, these must be validated **server-side** as well, since browser validation can be bypassed.

**Recommendation:**
- Add server-side validation using `zod` or similar when implementing API routes
- Enforce minimum password length (≥ 8 characters already mentioned in placeholder text)
- Add rate limiting to auth endpoints

---

### 6. No Secrets in Repository

**Severity:** INFO  
**Status:** PASS  

Searched the entire repository for common secret patterns:
- No API keys found
- No passwords hardcoded
- No database connection strings
- No OAuth tokens
- No JWT secrets

The only "credentials" present are the mock user (`jordan.davis@example.com`) which are clearly demo values.

---

### 7. No Dangerous HTML Rendering

**Severity:** INFO  
**Status:** PASS  

No use of `dangerouslySetInnerHTML` was found in any component. All user content is rendered via React's default XSS-safe rendering.

---

### 8. No Path Traversal Risk

**Severity:** INFO  
**Status:** PASS  

No file system operations, dynamic file reads, or user-controlled path construction were found. No API routes currently exist.

---

### 9. Client-Side Routing Trust

**Severity:** INFO (future concern)  
**Location:** `app/[...slug]/page.tsx`  

The catch-all route means **any URL serves the app**. This is intentional for client-side routing, but it means:
- Server-side rendering happens for all routes
- There is no 404 page differentiation at the server level
- All pages, including protected ones, are server-rendered to their initial state

**Future Concern:** When auth is added, ensure protected page components do not leak sensitive data in their initial server-rendered HTML if the user is unauthenticated.

**Recommendation:**
- Protected pages should either render nothing or a loading skeleton until auth is confirmed client-side
- Or use Next.js middleware to redirect at the server level before rendering

---

### 10. Vercel Analytics in Production

**Severity:** INFO  
**Location:** `app/layout.tsx`  

```typescript
{process.env.NODE_ENV === 'production' && <Analytics />}
```

Vercel Analytics is correctly gated to production only. This is good practice. However:

**Note:** `@vercel/analytics` collects page view data. Ensure your privacy policy (when created) discloses this.

---

### 11. Images Unoptimized

**Severity:** LOW  
**Location:** `next.config.mjs`  

```javascript
images: {
  unoptimized: true,
}
```

Image optimization is disabled. This means no automatic WebP conversion or responsive resizing.

**Risk:** Not a security concern. Performance concern only.

**Recommendation:** Enable when deploying to Vercel (Vercel provides built-in image optimization).

---

---

## Stage 5 Security Audit — Coding Practice Engine & Submissions

| Item | Status | Notes |
|---|---|---|
| Arbitrary Code Execution Sandbox | ✅ Disabled / Safe | **Zero arbitrary code execution on server.** User code is persisted only (`status: PENDING`). No `eval`, `Function()`, `child_process`, or shell commands used. |
| Code Payload Size Limits | ✅ Enforced | Max source code length enforced at 64KB (65,536 characters) via Zod. |
| User ID Injection Prevention | ✅ Enforced | `userId` extracted strictly from signed JWT session cookie (`getSession()`); client payload input ignored. |
| Submission Data Isolation | ✅ Enforced | User A cannot access User B's full submission or source code. `GET /api/coding/submissions/[submissionId]` returns `403 Forbidden` if requester is not the owner. |
| Public API Filtering | ✅ Enforced | Problem list and problem detail APIs never expose user submission source codes or internal database credentials. |
| Status Manipulation Prevention | ✅ Enforced | Client cannot set `status`, `score`, `executionTimeMs`, `memoryUsedKb`, or test result fields; server controls initial `PENDING` state. |
| Input & Query Validation | ✅ Enforced | All route query parameters (`subjectId`, `difficulty`, `limit`) and request bodies (`language`, `sourceCode`) validated with Zod. |

---

## No Critical Issues Found

The Stage 5 implementation strictly satisfies all security requirements: submissions are safely persisted with zero server-side code execution risk, full user isolation, and complete input validation.

---

## Stage 6 Security Audit — AI Layer + AI Tutor + Persistent AI Sessions

> Stage 6 introduces server-side AI Tutor functionality. OpenAI API credentials remain server-side.

| Item | Status | Notes |
|---|---|---|
| OPENAI_API_KEY Server-Side Only | ✅ Enforced | Key read from `process.env` in `services/ai.ts` only. Never in components, client code, or `NEXT_PUBLIC_*` vars. |
| API Key Never in DB | ✅ Enforced | No credential stored in any database table or field. |
| API Key Never in Logs | ✅ Enforced | Error handlers log status codes only (e.g., `status=401`), never the key value. |
| API Key Never in API Responses | ✅ Enforced | No key in any JSON response. AI errors return sanitized messages only. |
| API Key Never in Activity Metadata | ✅ Enforced | Activity records store only `sessionId`, `subjectId`, `topicId`. |
| Client Cannot Override Model | ✅ Enforced | Model configured via `process.env.OPENAI_MODEL`; not in request body. |
| Client Cannot Override System Prompt | ✅ Enforced | System prompt built server-side in `services/ai.ts`; not a request parameter. |
| Client Cannot Override Temperature / Token Limits | ✅ Enforced | All OpenAI call parameters are hardcoded in `services/ai.ts`. |
| Session Ownership Enforced | ✅ Enforced | Every session read/write checks `session.userId === authenticatedUser.id`. Returns 404 on mismatch. |
| Message Content Validated | ✅ Enforced | 1–8,000 character limit via Zod `SendTutorMessageSchema`. |
| Rate Limiting | ✅ Implemented | 20 AI messages/user/hour. HTTP 429 + `Retry-After` header. In-memory Map (documented single-instance limitation). |
| ARCHIVED Sessions Reject Messages | ✅ Enforced | 403 Forbidden returned for message POST to ARCHIVED session. |
| No Fake Messages on AI Failure | ✅ Enforced | Messages persisted only after successful OpenAI response (transaction). |
| AI Output Rendered as Plain Text | ✅ Enforced | `whitespace-pre-wrap` text rendering; no `dangerouslySetInnerHTML`. |
| Unauthenticated Access Rejected | ✅ Enforced | All 3 tutor route handlers return 401 when no valid JWT session cookie. |
| Full Conversation Not in Activity | ✅ Enforced | Only `sessionId`, `subjectId`, `topicId` in activity metadata. |
| User A Cannot Read User B's Session | ✅ Enforced | 404 returned for any session not owned by the requesting user. |

---

## No Critical Issues Found

The Stage 6 implementation strictly satisfies all AI security requirements: credentials are server-side only, user sessions are isolated, AI failures never produce fake responses, and all client input is validated with Zod.

---

## Stage 7 Security Audit — Persistent AI Interview Engine

> Stage 7 introduces text-based AI interview sessions, question generation, answer evaluations, and server-side overall scoring.

| Item | Status | Notes |
|---|---|---|
| OPENAI_API_KEY Server-Side Only | ✅ Enforced | Key accessed exclusively in `services/ai.ts`. Never exposed to client, bundle, or `NEXT_PUBLIC_*` variables. |
| Server-Side Score Calculation | ✅ Enforced | Overall score calculated as arithmetic mean of `InterviewEvaluation.overallScore` values server-side. Browser scores ignored. |
| User Identity via JWT Only | ✅ Enforced | `userId` retrieved from `getSession()` cookie. Client-supplied `userId` is ignored. |
| Session Ownership Enforcement | ✅ Enforced | All 7 interview endpoints verify `session.userId === authenticatedUser.id`. Mismatch returns `404` / `403`. |
| State Machine Control | ✅ Enforced | Submissions allowed only on `ACTIVE` sessions. `COMPLETED` and `ABANDONED` sessions return `409` / `403`. |
| Sequential Question Enforcement | ✅ Enforced | Users must answer current `questionNumber` sequentially. Answering future questions returns `400`. |
| Answer Uniqueness Constraint | ✅ Enforced | `InterviewAnswer.questionId` has a `@unique` constraint in Prisma. Duplicate submissions return `409`. |
| AI Output Validation with Zod | ✅ Enforced | AI evaluations validated with `AIEvaluationResponseSchema`. Numeric scores bounded to [0, 10]. |
| Character Limit Validation | ✅ Enforced | Answers validated to 1–8,000 characters via `SubmitInterviewAnswerSchema`. Roles capped to 200 chars. |
| Text-Based Only (No Media WebRTC) | ✅ Enforced | Zero WebRTC, camera, microphone, STT, TTS, or audio recording libraries added or exposed. |
| Activity Record Privacy | ✅ Enforced | `INTERVIEW_COMPLETED` activity stores `sessionId`, `interviewType`, `difficulty`, `overallScore` only (no raw text). |
| Zero Code Execution Risk | ✅ Enforced | AI output and user responses rendered safely without `eval`, `Function()`, or `dangerouslySetInnerHTML`. |

---

## No Critical Issues Found

The Stage 7 implementation strictly satisfies all AI Interview security requirements: scoring is server-side controlled, session ownership and state transitions are strictly enforced, user identity relies solely on JWT, and credentials remain 100% server-side.

---

## Stage 8 Security Audit — Analytics, Dashboard & Performance Insights

> Stage 8 introduces a server-side analytics service and `GET /api/analytics/dashboard`. All metrics are computed deterministically from existing persisted data.

| Item | Status | Notes |
|---|---|---|
| Authenticated Access Only | ✅ Enforced | `GET /api/analytics/dashboard` returns `401` when no valid JWT session cookie is present. |
| User Isolation | ✅ Enforced | `userId` is read exclusively from `session.userId` (JWT-derived). Browser-supplied `userId` values are never accepted or considered. |
| User A Cannot Read User B's Analytics | ✅ Enforced | All Prisma queries are scoped with `where: { userId }` from the verified JWT session. |
| No OpenAI Calls in Analytics | ✅ Enforced | `services/analytics.ts` makes zero calls to OpenAI. All metrics and recommendations are deterministic arithmetic calculations. |
| Recommendations are Deterministic | ✅ Enforced | Recommendation engine uses transparent threshold-based rules only. No AI, LLM, or ML model involved. |
| No Fake Metrics | ✅ Enforced | All returned numbers are derived directly from `QuizAttempt`, `CodingSubmission`, `InterviewSession`, `InterviewEvaluation`, `UserProgress`, `TopicProgress`, and `Activity` records. |
| No Raw Database Errors Exposed | ✅ Enforced | Errors are caught and return sanitized `{ error: '...' }` JSON responses with appropriate HTTP status codes. |
| No Secrets in API Response | ✅ Enforced | Analytics response contains only computed metrics and sanitized user data. No internal IDs, database keys, or credentials included. |
| Efficient Queries (No Unrestricted Scans) | ✅ Enforced | All queries are bounded by `userId`. Parallel `Promise.all` used to avoid sequential blocking. Activity feed limited to 10 records. Recommendations limited to 3 items. |

---

## No Critical Issues Found

The Stage 8 implementation satisfies all analytics security requirements: user isolation is enforced via JWT, no OpenAI invocations occur, all metrics are computed deterministically server-side, and no sensitive internal data is exposed in API responses.

---

## Stage 9 Security Audit — Advanced Personalization & Learning Path

> Stage 9 introduces `services/personalization.ts` and `GET /api/personalization`. All preparation levels, learning paths, adaptive recommendations, momentum, and coverage stats are computed deterministically from real persisted data.

| Item | Status | Notes |
|---|---|---|
| Authenticated Access Only | ✅ Enforced | `GET /api/personalization` returns `401` when no valid JWT session cookie is present. |
| User Isolation | ✅ Enforced | `userId` is read exclusively from `session.userId` (JWT-derived). Client-provided `userId` values are never accepted. |
| User A Cannot Read User B's Profile | ✅ Enforced | All Prisma queries in `services/personalization.ts` are scoped with `where: { userId }` from the verified JWT session. |
| No OpenAI Calls in Personalization | ✅ Enforced | `services/personalization.ts` makes zero calls to OpenAI. All personalization logic is 100% deterministic rules and math. |
| Deterministic Learning Path & Recommendations | ✅ Enforced | Learning path and adaptive recommendations use strict rule-based priority logic derived from real performance signals. |
| Honest Data Representation | ✅ Enforced | Insufficient evidence is returned as `no_data` or `insufficient_data`, never conflated with "weak" or fake zero scores. |
| No Raw Database Errors Exposed | ✅ Enforced | Errors are caught and return sanitized `{ error: '...' }` JSON responses with proper HTTP status codes (`401`, `404`, `500`). |
| Efficient & Reusable Queries | ✅ Enforced | Reuses `getUserAnalytics()` from Stage 8. Additional queries (topics, activity, totals) are bounded by `userId` or run in parallel. |

---

## No Critical Issues Found

The Stage 9 implementation strictly satisfies all security, privacy, and isolation requirements: authentication relies on JWT, user isolation is enforced across all queries, zero OpenAI calls occur in the personalization pipeline, and no fake or fabricated data is presented to users.

---

## Stage 10 Security & Production Hardening Audit

> Stage 10 performed a full audit and production hardening of the entire application across authentication, authorization, AI security, rate limiting, middleware activation, and HTTP headers.

| Item | Status | Notes |
|---|---|---|
| Edge Middleware Activation | ✅ Resolved | Renamed `proxy.ts` → `middleware.ts` exporting `middleware()`. Edge middleware is now active and enforcing authentication redirects before page loads. |
| Interview AI Rate Limiting | ✅ Hardened | Added `checkInterviewRateLimit` (30 requests/hour/user) to `services/interview.ts` and enforced it in `POST /api/interviews/[sessionId]/questions/[questionId]/answer`. |
| HTTP Security Headers | ✅ Hardened | Added `next.config.mjs` security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `Content-Security-Policy`. |
| Input Validation & ID Length Bounding | ✅ Hardened | Added `IdSchema` to `lib/validation.ts` (`z.string().trim().min(1).max(128)`) to reject oversized malicious path parameters safely. |
| Error Message Normalization | ✅ Hardened | Updated registration error responses to return clean string messages instead of raw internal Zod issue arrays. |
| Query Bounds & Unbounded Scans | ✅ Hardened | Added `take: 200` limits to analytics queries in `services/analytics.ts` to prevent unbounded memory/CPU usage for heavy accounts. |
| Database Non-Destructiveness | ✅ Verified | All 11 Prisma models and tables preserved. Zero destructive database operations performed. |
| Production Build Verification | ✅ Verified | `npx prisma validate`, `npx tsc --noEmit`, and `npm run build` executed and passed cleanly with 20 production routes generated. |

---

## Stage 12 Production Launch Verification Audit

> Stage 12 verified production readiness across database safety, user data isolation, secret protection, Google OAuth security, AI rate limits, production build pipeline, and launch status.

| Audit Category | Status | Verification Summary |
|---|---|---|
| Prisma Schema & Database Safety | ✅ Verified | All 20 models valid in `schema.prisma`. Database synced cleanly without data loss. Existing production records preserved. |
| Secrets & Environment Security | ✅ Verified | `DATABASE_URL`, `AUTH_SECRET`, `OPENAI_API_KEY`, `GOOGLE_CLIENT_SECRET` strictly server-side. Zero raw secrets committed or exposed in `NEXT_PUBLIC_` vars or JS bundles. |
| User Data Isolation | ✅ Verified | 100% of user data API endpoints derive user identity from cryptographic JWT (`session.userId`). Client-supplied user IDs are never trusted for authorization. |
| Authentication & OAuth | ✅ Verified | Custom JWT in httpOnly cookie coexists with Google OAuth 2.0 (code exchange + state CSRF token). Verified Google emails automatically linked to existing accounts without duplication. |
| AI Rate Limiting & Safety | ✅ Verified | AI Tutor (20 msgs/hr) and AI Interview (30 eval/hr) in-memory rate limits active. Zero `eval()`, `dangerouslySetInnerHTML`, or client-side LLM calls. |
| Growth & Social Sharing | ✅ Verified | Referral links (`/register?ref=CODE`) and public share links (`/share/[publicId]`) operate safely without exposing user emails, raw prompts, or transcripts. |
| Production Build Verification | ✅ Verified | `npx prisma validate`, `npx tsc --noEmit`, and `npm run build` executed cleanly. All 26 static/dynamic routes compiled with zero errors. |





