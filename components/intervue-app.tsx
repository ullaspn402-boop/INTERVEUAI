'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ArrowRight, BarChart3, BookOpen, BrainCircuit, Check, ChevronDown, Code2, Filter, Flame,
  Home, LineChart, Menu, MessageSquareText, Mic, MicOff, Moon, Play, Search, Settings2, Sparkles,
  Sun, Target, Trophy, UserRound, Video, VideoOff, PhoneOff, X, Camera, Clock3, RotateCcw, Send, SlidersHorizontal,
  CheckCircle2, Circle, AlertCircle, Lightbulb, LogOut, Eye, EyeOff, Loader2, History as HistoryIcon,
  Bot, Volume2, VolumeX
} from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/preparation', label: 'Preparation', icon: BookOpen },
  { href: '/role-prep', label: 'Role Prep', icon: Target },
  { href: '/tutor', label: 'AI Tutor', icon: MessageSquareText },
  { href: '/quizzes', label: 'Quizzes', icon: BrainCircuit },
  { href: '/coding', label: 'Coding', icon: Code2 },
  { href: '/interview', label: 'AI Interview', icon: Video },
  { href: '/analytics', label: 'Analytics', icon: LineChart },
]
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
const button = 'inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'
const outlineButton = 'inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
const card = 'rounded-xl border border-border bg-card'

function Brand() { return <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold tracking-tight"><span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="size-4" /></span><span>INTERVUE <span className="text-primary">AI</span></span></Link> }
function IconButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) { return <button aria-label={label} onClick={onClick} className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{children}</button> }
function Sidebar({ mobileOpen, close }: { mobileOpen: boolean; close: () => void }) { const pathname = usePathname(); return <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card px-3 py-5 transition-transform lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}><div className="flex items-center justify-between px-2"><Brand /><button className="lg:hidden" onClick={close} aria-label="Close navigation"><X className="size-5" /></button></div><nav className="mt-10 flex flex-col gap-1" aria-label="Main navigation"><p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">Workspace</p>{nav.map(({ href, label, icon: Icon }) => <Link key={href} onClick={close} href={href} aria-current={pathname === href ? 'page' : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${pathname === href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}><Icon className="size-[17px]" />{label}</Link>)}</nav><div className="mt-auto flex flex-col gap-1"><Link href="/profile" onClick={close} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"><Settings2 className="size-[17px]" />Settings</Link><div className="mt-4 rounded-xl bg-muted p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold">Weekly goal</span><Flame className="size-4 text-primary" /></div><p className="mt-2 text-xs leading-5 text-muted-foreground">Keep your momentum going.</p><ProgressBar value={80} /><p className="mt-2 text-xs text-muted-foreground">4 of 5 sessions</p></div></div></aside> }
function Topbar({ open, dark, toggleTheme, user, onLogout }: { open: () => void; dark: boolean; toggleTheme: () => void; user: { name: string; initials: string } | null; onLogout: () => void }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const initials = user?.initials ?? ''
  const name = user?.name ?? ''
  return <header className="flex h-16 items-center justify-between border-b border-border bg-background px-5 md:px-8"><button className="lg:hidden" onClick={open} aria-label="Open navigation"><Menu className="size-5" /></button><div className="hidden text-sm text-muted-foreground lg:block">{today}</div><div className="ml-auto flex items-center gap-2"><IconButton label="Toggle theme" onClick={toggleTheme}>{dark ? <Sun className="size-4" /> : <Moon className="size-4" />}</IconButton><Link href="/profile" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent"><span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{initials}</span><span className="hidden text-sm font-medium sm:block">{name}</span><ChevronDown className="size-4 text-muted-foreground" /></Link><IconButton label="Sign out" onClick={onLogout}><LogOut className="size-4" /></IconButton></div></header>
}
function ProgressBar({ value }: { value: number }) { return <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} /></div> }
function DemoLabel({ children = 'Demo data' }: { children?: string }) { return <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">{children}</span> }
function PageHeading({ eyebrow, title, description, action, onAction }: { eyebrow: string; title: string; description: string; action?: string; onAction?: () => void }) { return <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></div>{action && <button onClick={onAction} className={button}><Play className="size-4" />{action}</button>}</section> }
function Stat({ label, value, note, icon: Icon }: { label: string; value: string; note: string; icon: typeof Trophy }) { return <div className={`${card} p-5`}><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{label}</p><Icon className="size-4 text-primary" /></div><p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div> }

const subjectIconMap: Record<string, React.ElementType> = {
  DSA: Code2,
  DBMS: BarChart3,
  OS: Settings2,
  CN: Target,
  OOP: BrainCircuit,
  SQL: Code2,
  Aptitude: Trophy,
  'AI/ML': Sparkles,
}

function getSubjectIcon(shortTitle: string) {
  return subjectIconMap[shortTitle] || Code2
}

function Dashboard() {
  const [data, setData] = useState<{
    user?: { name: string; initials: string; college: string | null; targetRole: string | null }
    readiness?: { score: number; maxScore: number; note: string; trend: string }
    quizzes?: { totalAttempts: number; completedAttempts: number; averageScorePct: number; accuracyPct: number }
    coding?: { totalSubmissions: number; acceptedSubmissions: number; solvedProblemsCount: number; acceptanceRatePct: number }
    interviews?: { totalSessions: number; completedInterviews: number; averageScorePct: number }
    subjectProgress?: Array<{ slug: string; title: string; full: string; value: number; detail: string }>
    recentActivity?: Array<{ id: string; type: string; title: string; description: string | null; formattedDaysAgo: string }>
    recommendations?: Array<{ id: string; category: string; title: string; description: string; actionText: string; actionHref: string; priority: string }>
  } | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/dashboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => { if (d) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const displaySubjects = data?.subjectProgress && data.subjectProgress.length > 0
    ? data.subjectProgress.map(s => ({
        title: s.title,
        full: s.full,
        value: s.value,
        detail: s.detail,
        icon: getSubjectIcon(s.title)
      }))
    : subjects

  const readinessScore = data?.readiness?.score ?? 40
  const readinessNote = data?.readiness?.note ?? "Start quizzes, coding problems, or AI interviews to build your readiness score."
  const readinessTrend = data?.readiness?.trend ?? "Baseline score"

  return (
    <div className="flex flex-col gap-7">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Good morning, {data?.user?.name ? data.user.name.split(' ')[0] : 'Student'}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Build confidence for your next offer.</h1>
          <p className="mt-2 text-sm text-muted-foreground">A focused plan for your placement preparation.</p>
        </div>
      </section>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Readiness score" value={`${readinessScore} / 100`} note={readinessTrend} icon={Target} />
        <Stat label="Quiz accuracy" value={`${data?.quizzes?.accuracyPct ?? 0}%`} note={`${data?.quizzes?.completedAttempts ?? 0} quizzes completed`} icon={Check} />
        <Stat label="Problems solved" value={`${data?.coding?.solvedProblemsCount ?? 0}`} note={`${data?.coding?.acceptanceRatePct ?? 0}% acceptance rate`} icon={Trophy} />
        <Stat label="Interviews done" value={`${data?.interviews?.completedInterviews ?? 0}`} note={`Avg score: ${data?.interviews?.averageScorePct ?? 0}%`} icon={Flame} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        {/* Recommended Focus */}
        <section className={`${card} p-6`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">Recommended focus</h2>
              <p className="mt-1 text-sm text-muted-foreground">Deterministic recommendations based on your performance.</p>
            </div>
            <Link href="/preparation" className="shrink-0 text-sm font-semibold text-primary">View all subjects <ArrowRight className="ml-1 inline size-4" /></Link>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {data?.recommendations && data.recommendations.length > 0 ? (
              data.recommendations.map((rec) => (
                <div key={rec.id} className="flex items-center gap-3 rounded-lg border border-border p-3.5">
                  <span className="text-primary"><Lightbulb className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{rec.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                  <Link href={rec.actionHref} className="shrink-0 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">
                    {rec.actionText}
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No active recommendations. Complete your first topic or quiz to generate insights.
              </div>
            )}
          </div>
        </section>

        {/* Readiness Snapshot */}
        <section className={`${card} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Readiness snapshot</h2>
              <p className="mt-1 text-sm text-muted-foreground">Your current momentum</p>
            </div>
            <Target className="size-5 text-primary" />
          </div>
          <div className="mt-6 flex items-end gap-3">
            <p className="text-5xl font-semibold tracking-tight">{readinessScore}</p>
            <p className="mb-1 text-sm text-muted-foreground">/ 100</p>
            <span className="mb-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{readinessTrend}</span>
          </div>
          <ProgressBar value={readinessScore} />
          <p className="mt-3 text-xs leading-5 text-muted-foreground">{readinessNote}</p>
          <Link href="/analytics" className={`${outlineButton} mt-5 w-full`}>View analytics <ArrowRight className="size-4" /></Link>
        </section>
      </div>

      {/* Subject Progress */}
      <section className={`${card} p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Subject progress</h2>
            <p className="mt-1 text-sm text-muted-foreground">Keep every core area moving forward.</p>
          </div>
          <Link href="/preparation" className="text-sm font-semibold text-primary">All subjects <ArrowRight className="ml-1 inline size-4" /></Link>
        </div>
        <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          {displaySubjects.map(({ title, value, detail, icon: Icon }) => (
            <div key={title}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <span className="grid size-7 place-items-center rounded-md bg-muted"><Icon className="size-3.5 text-muted-foreground" /></span>
                  {title}
                </span>
                <span className="font-semibold">{value}%</span>
              </div>
              <ProgressBar value={value} />
              <p className="mt-1.5 text-xs text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className={`${card} p-6`}>
        <h2 className="font-semibold">Recent activity</h2>
        <div className="mt-4 flex flex-col gap-4">
          {loading ? (
            <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" /> Loading recent activity…
            </div>
          ) : data?.recentActivity && data.recentActivity.length > 0 ? (
            data.recentActivity.map((act) => (
              <div key={act.id} className="flex items-center gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary"><Check className="size-4" /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{act.title}</p>
                  {act.description && <p className="text-xs text-muted-foreground truncate">{act.description}</p>}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{act.formattedDaysAgo}</span>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No recent activity recorded yet. Start by taking a quiz, solving a coding problem, or talking to the AI tutor!
            </div>
          )}
        </div>
      </section>
      
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <section className={`${card} p-6`}>
          <h2 className="font-semibold">Quick actions</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {([['Start AI interview', '/interview', Video], ['Practice coding', '/coding', Code2], ['Take a quiz', '/quizzes', BrainCircuit], ['Ask AI tutor', '/tutor', MessageSquareText]] as [string, string, React.ElementType][]).map(([label, href, Icon]) => (
              <Link key={label} href={href} className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm font-medium transition hover:border-primary/50 hover:bg-accent">
                <span className="grid size-8 place-items-center rounded-md bg-muted text-primary"><Icon className="size-4" /></span>
                {label}
                <ArrowRight className="ml-auto size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function Preparation() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [realSubjects, setRealSubjects] = useState<Array<{ title: string; full: string; value: number; detail: string; nextTopicName: string; icon: React.ElementType }> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/personalization').then((res) => (res.ok ? res.json() : null)),
      fetch('/api/subjects').then((res) => (res.ok ? res.json() : null)),
      fetch('/api/progress').then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([persData, subData, progData]) => {
        if (persData && !persData.error) {
          setProfile(persData)
        }
        if (subData?.subjects) {
          type ProgItem = { slug: string; value: number; detail: string; nextTopicName: string }
          const progList: ProgItem[] = progData?.progress ?? []
          const progMap = new Map<string, ProgItem>(progList.map((p) => [p.slug, p]))

          const formatted = subData.subjects.map((s: { name: string; shortTitle: string; slug: string; topicCount: number }) => {
            const prog = progMap.get(s.slug)
            return {
              title: s.shortTitle,
              full: s.name,
              value: prog ? prog.value : 0,
              detail: prog ? prog.detail : `0 of ${s.topicCount} topics`,
              nextTopicName: prog ? prog.nextTopicName : 'Getting Started',
              icon: getSubjectIcon(s.shortTitle),
            }
          })
          setRealSubjects(formatted)
        }
      })
      .catch((err) => console.error('Error fetching personalization data:', err))
      .finally(() => setLoading(false))
  }, [])

  const displayList = realSubjects && realSubjects.length > 0
    ? realSubjects
    : subjects.map((s) => ({ ...s, nextTopicName: s.title === 'DSA' ? 'Dynamic programming' : s.title === 'DBMS' ? 'Indexing' : 'Core concepts review' }))

  const nextStep = profile?.learningPath?.[0] ?? profile?.adaptiveRecommendations?.[0]

  return (
    <div className="flex flex-col gap-7">
      <PageHeading
        eyebrow="Adaptive Learning Path"
        title="Prepare with purpose."
        description="Your personalized preparation curriculum, dynamically prioritized based on your real performance."
        action="Resume Learning"
        onAction={() => {
          if (nextStep?.actionHref) router.push(nextStep.actionHref)
        }}
      />

      {loading ? (
        <div className={`${card} flex items-center justify-center p-12 text-muted-foreground gap-3`}>
          <Loader2 className="size-5 animate-spin" />
          <span>Generating your personalized preparation profile...</span>
        </div>
      ) : profile ? (
        <>
          {/* Preparation Level Banner */}
          <section className={`${card} p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 via-card to-card`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    Level: {profile.preparationLevel.label}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Readiness Score: <strong className="text-foreground">{profile.readinessScore}/100</strong>
                  </span>
                  {profile.momentum?.state && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      <Flame className="size-3 text-primary" />
                      Momentum: {profile.momentum.state.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  {profile.preparationLevel.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-muted px-2.5 py-1">
                  Subjects Covered: {profile.coverage?.subjects?.covered}/{profile.coverage?.subjects?.total}
                </span>
                <span className="rounded bg-muted px-2.5 py-1">
                  Quizzes Taken: {profile.coverage?.quizzes?.covered}/{profile.coverage?.quizzes?.total}
                </span>
              </div>
            </div>
          </section>

          {/* Next Best Step */}
          {nextStep && (
            <section className={`${card} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between`}>
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="size-3.5" /> Next Recommended Step
                </span>
                <h2 className="mt-1 font-semibold text-lg">{nextStep.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{nextStep.description}</p>
              </div>
              <Link href={nextStep.actionHref || '/preparation'} className={button}>
                {nextStep.actionText || 'Start Now'} <ArrowRight className="size-4" />
              </Link>
            </section>
          )}

          {/* Personalized Learning Path & Adaptive Recommendations Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Learning Path */}
            <div className={`${card} p-5 flex flex-col gap-4`}>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-semibold flex items-center gap-2 text-sm">
                  <Target className="size-4 text-primary" /> Personalized Preparation Path
                </h2>
                <span className="text-xs text-muted-foreground">{profile.learningPath?.length || 0} items</span>
              </div>
              {profile.learningPath && profile.learningPath.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {profile.learningPath.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start justify-between rounded-lg border border-border p-3 text-sm hover:bg-accent/50 transition">
                      <div className="flex items-start gap-3">
                        <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0 mt-0.5">
                          {item.order}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              item.priority === 'high' ? 'bg-destructive/10 text-destructive' : item.priority === 'medium' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                            }`}>
                              {item.priority} priority
                            </span>
                            <span className="text-[10px] text-muted-foreground">Effort: {item.effort}</span>
                          </div>
                        </div>
                      </div>
                      <Link href={item.actionHref} className="text-xs font-semibold text-primary hover:underline shrink-0 ml-2 mt-1">
                        {item.actionText} →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No path items available. Try taking a quiz or attempting a problem.</p>
              )}
            </div>

            {/* Adaptive Recommendations */}
            <div className={`${card} p-5 flex flex-col gap-4`}>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-semibold flex items-center gap-2 text-sm">
                  <Lightbulb className="size-4 text-primary" /> Adaptive Performance Insights
                </h2>
                <span className="text-xs text-muted-foreground">Derived from live metrics</span>
              </div>
              {profile.adaptiveRecommendations && profile.adaptiveRecommendations.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {profile.adaptiveRecommendations.map((rec: any) => (
                    <div key={rec.id} className="rounded-lg border border-border p-3.5 flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                          rec.priority === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                        }`}>
                          {rec.category} {rec.dimension ? `· ${rec.dimension}` : ''}
                        </span>
                        <Link href={rec.actionHref} className="text-xs font-semibold text-primary hover:underline">
                          {rec.actionText} →
                        </Link>
                      </div>
                      <h3 className="text-sm font-medium">{rec.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
                      <p className="text-[11px] text-muted-foreground border-t border-border/50 pt-1.5 mt-1 font-mono">
                        Data signal: {rec.evidence}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No adaptive insights generated yet.</p>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* All learning areas */}
      <div>
        <h2 className="mb-4 text-sm font-semibold">All Learning Areas</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {displayList.map(({ title, full, value, detail, nextTopicName, icon: Icon }) => (
            <div key={title} className={`${card} p-5 transition hover:border-primary/50`}>
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></span>
                <span className="text-sm font-semibold text-primary">{value}%</span>
              </div>
              <h2 className="mt-5 font-semibold">{full}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{detail} complete</p>
              <div className="mt-4"><ProgressBar value={value} /></div>
              <p className="mt-3 text-xs text-muted-foreground">Next: {nextTopicName}</p>
              <button onClick={() => router.push(title === 'SQL' ? '/coding' : '/quizzes')} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Continue <ArrowRight className="size-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Tutor() {
  // ── Session list state ──
  const [sessions, setSessions] = useState<Array<{
    id: string; title: string | null; status: string;
    subject: { id: string; name: string; shortTitle: string } | null;
    topic: { id: string; name: string } | null;
    messageCount: number; updatedAt: string;
  }>>([])

  // ── Active session state ──
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{ id: string; role: string; content: string; createdAt: string }>>([])
  const [sessionStatus, setSessionStatus] = useState<string>('ACTIVE')
  const [sessionSubject, setSessionSubject] = useState<{ id: string; name: string; shortTitle: string } | null>(null)
  const [sessionTopic, setSessionTopic] = useState<{ id: string; name: string } | null>(null)

  // ── Available subjects ──
  const [availableSubjects, setAvailableSubjects] = useState<Array<{ id: string; name: string; shortTitle: string }>>([])

  // ── New session panel state ──
  const [showNewSession, setShowNewSession] = useState(false)
  const [newSubjectId, setNewSubjectId] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)

  // ── Chat state ──
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [loadingSession, setLoadingSession] = useState(false)

  // ── AI status ──
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ── Load sessions on mount & auto-create default if empty ──
  useEffect(() => {
    async function initTutor() {
      try {
        const r = await fetch('/api/tutor/sessions?limit=15')
        if (r.ok) {
          const d = await r.json()
          const sessList = d?.sessions || []
          setSessions(sessList)
          if (sessList.length > 0) {
            await loadSession(sessList[0].id)
          } else {
            // Auto-create initial default session for new users
            await handleCreateSessionSilent()
          }
        }
      } catch (err) {
        console.error('Failed to init tutor sessions:', err)
      }
    }

    fetch('/api/subjects')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.subjects) setAvailableSubjects(d.subjects) })
      .catch(() => {})

    initTutor()
  }, [])

  // ── Auto-scroll messages ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Silent initial session creation for new users ──
  async function handleCreateSessionSilent(): Promise<string | null> {
    try {
      const r = await fetch('/api/tutor/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'AI Mentor Session' }),
      })
      const d = await r.json()
      if (!r.ok || !d.session) return null
      const newSess = d.session
      setSessions(prev => [{ ...newSess, messageCount: 0 }, ...prev])
      await loadSession(newSess.id)
      return newSess.id
    } catch {
      return null
    }
  }

  // ── Load session messages ──
  async function loadSession(sessionId: string) {
    setLoadingSession(true)
    setChatError(null)
    setActiveSessionId(sessionId)
    setMessages([])
    try {
      const r = await fetch(`/api/tutor/sessions/${sessionId}`)
      if (!r.ok) { setChatError('Failed to load session.'); return }
      const d = await r.json()
      setMessages(d.session.messages || [])
      setSessionStatus(d.session.status)
      setSessionSubject(d.session.subject)
      setSessionTopic(d.session.topic)
      setAiAvailable(true)
    } catch {
      setChatError('Failed to load session.')
    } finally {
      setLoadingSession(false)
    }
  }

  // ── Create new session ──
  async function handleCreateSession() {
    setCreating(true)
    setChatError(null)
    try {
      const body: Record<string, string> = {}
      if (newSubjectId) body.subjectId = newSubjectId
      if (newTitle.trim()) body.title = newTitle.trim()

      const r = await fetch('/api/tutor/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (!r.ok) { setChatError(d.error || 'Failed to create session.'); return }

      const newSess = d.session
      setSessions(prev => [{ ...newSess, messageCount: 0 }, ...prev])
      setShowNewSession(false)
      setNewSubjectId('')
      setNewTitle('')
      await loadSession(newSess.id)
    } catch {
      setChatError('Failed to create session.')
    } finally {
      setCreating(false)
    }
  }

  // ── Send message ──
  async function sendMessage(overrideText?: string) {
    const rawContent = (overrideText || input).trim()
    if (!rawContent || sending) return
    if (sessionStatus === 'ARCHIVED') { setChatError('This session is archived.'); return }

    let currentSessId = activeSessionId
    if (!currentSessId) {
      currentSessId = await handleCreateSessionSilent()
      if (!currentSessId) {
        setChatError('Failed to initialize session. Please try again.')
        return
      }
    }

    if (!overrideText) setInput('')
    setSending(true)
    setChatError(null)

    // Optimistic user message
    const tempId = `temp-${Date.now()}`
    setMessages(prev => [...prev, { id: tempId, role: 'USER', content: rawContent, createdAt: new Date().toISOString() }])

    try {
      const r = await fetch(`/api/tutor/sessions/${currentSessId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: rawContent }),
      })
      const d = await r.json()

      if (!r.ok) {
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(m => m.id !== tempId))
        if (!overrideText) setInput(rawContent)
        if (r.status === 503) {
          setChatError('AI tutor is temporarily unavailable. Please try again.')
          setAiAvailable(false)
        } else if (r.status === 429) {
          setChatError('You\'ve reached the message limit (20/hour). Please wait before sending more.')
        } else {
          setChatError(d.error || 'Failed to send message.')
        }
        return
      }

      // Append real assistant message
      setMessages(prev => [...prev, d.message])
      setAiAvailable(true)
      // Update session list updatedAt
      setSessions(prev => prev.map(s => s.id === currentSessId ? { ...s, updatedAt: new Date().toISOString(), messageCount: s.messageCount + 2 } : s))
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId))
      if (!overrideText) setInput(rawContent)
      setChatError('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }


  const suggestedPrompts = [
    'Explain binary search step by step',
    'What is database normalization?',
    'Explain process scheduling in OS',
    'Difference between TCP and UDP',
    'Explain OOP concepts with examples',
  ]

  const activeSubjectLabel = sessionSubject
    ? sessionSubject.shortTitle
    : activeSessionId ? 'General' : ''

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-7">
      <PageHeading
        eyebrow="Personal coach"
        title="Your AI tutor."
        description="Ask questions, clarify concepts, and practice explaining ideas clearly."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        {/* ── Chat Panel ── */}
        <section className={`${card} flex min-h-[570px] flex-col overflow-hidden`}>
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border p-5">
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">Intervue Coach</p>
              <p className="text-xs text-muted-foreground">
                {aiAvailable === false
                  ? 'AI unavailable · check configuration'
                  : aiAvailable === true
                  ? 'AI Powered · GPT-4o mini'
                  : activeSessionId ? 'Loading session…' : 'Select or start a session'}
              </p>
            </div>
            {activeSubjectLabel && (
              <span className="ml-auto rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                {activeSubjectLabel}
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-4 overflow-auto p-5">
            {loadingSession ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : !activeSessionId ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <Sparkles className="size-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">Start a new session or select a previous one</p>
                <button
                  onClick={() => setShowNewSession(true)}
                  className={button}
                >
                  New Session
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <MessageSquareText className="size-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Ask your first question to get started.</p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${
                    m.role === 'USER'
                      ? 'self-end bg-primary text-primary-foreground'
                      : 'self-start bg-muted'
                  }`}
                >
                  {m.content.replace(/^\[MODE:[A-Z_]+\]\s*/, '')}
                </div>
              ))
            )}
            {sending && (
              <div className="self-start flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Thinking…
              </div>
            )}
            {chatError && (
              <div className="self-stretch rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
                {chatError}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            {sessionStatus === 'ARCHIVED' && (
              <p className="mb-2 text-xs text-muted-foreground text-center">This session is archived.</p>
            )}
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background p-1">
              <input
                aria-label="Ask your tutor"
                value={input}
                disabled={!activeSessionId || sending || sessionStatus === 'ARCHIVED'}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) sendMessage()
                }}
                placeholder={activeSessionId ? 'Ask about your preparation…' : 'Select a session to start chatting…'}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || !activeSessionId || sending || sessionStatus === 'ARCHIVED'}
                aria-label="Send message"
                className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-40"
              >
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </div>
          </div>
        </section>

        {/* ── Sidebar ── */}
        <aside className={`${card} h-fit p-5`}>
          {/* New Session */}
          {showNewSession ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold">New Session</p>
              <label className="flex flex-col gap-1.5 text-xs font-medium">
                Subject (optional)
                <select
                  value={newSubjectId}
                  onChange={e => setNewSubjectId(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal"
                >
                  <option value="">General preparation</option>
                  {availableSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-medium">
                Session title (optional)
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Binary Search practice"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none"
                />
              </label>
              <div className="flex gap-2">
                <button onClick={handleCreateSession} disabled={creating} className={`${button} flex-1`}>
                  {creating ? <Loader2 className="size-4 animate-spin" /> : 'Start'}
                </button>
                <button onClick={() => setShowNewSession(false)} className={`${outlineButton} flex-1`}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <button onClick={() => setShowNewSession(true)} className={`${button} w-full`}>
                + New Session
              </button>

              {/* Past Sessions */}
              {sessions.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Past Sessions</p>
                  <div className="flex flex-col gap-1.5">
                    {sessions.map(s => (
                      <button
                        key={s.id}
                        onClick={() => loadSession(s.id)}
                        className={`rounded-lg border px-3 py-2 text-left text-xs transition hover:bg-accent ${activeSessionId === s.id ? 'border-primary bg-primary/5' : 'border-border'}`}
                      >
                        <p className="font-medium truncate">{s.title || s.subject?.name || 'General'}</p>
                        <p className="text-muted-foreground mt-0.5">{s.messageCount} messages · {s.subject?.shortTitle || 'General'}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 7 Role-Aware Tutor Mode Quick Action Shortcuts */}
              <div className="mt-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Tutor Modes & Quick Actions</h2>
                <div className="grid gap-2">
                  {[
                    { label: '📚 Teach me this', prompt: '[MODE:LEARN] Explain the core concepts, patterns, and trade-offs for my current topic in simple terms.' },
                    { label: '🎯 Practice question', prompt: '[MODE:PRACTICE] Give me a placement practice question for my target role and let me answer.' },
                    { label: '💡 Give me a hint', prompt: '[MODE:HINT] Give me a guiding hint for my current topic or problem without giving away the final answer.' },
                    { label: '🔍 Explain my mistake', prompt: '[MODE:EXPLAIN_MISTAKE] Explain common conceptual mistakes candidates make in this topic during technical interviews.' },
                    { label: '🎙️ Interview practice', prompt: '[MODE:INTERVIEW_PREP] Ask me a technical interview question tailored to my selected target career role.' },
                    { label: '🔁 Review weak areas', prompt: '[MODE:REVISION] Help me revise my weak topics and key edge cases before my placement interviews.' },
                    { label: '🚀 Prepare for my role', prompt: '[MODE:ROLE_READINESS] What specific skills and projects do I need to master next for my target role?' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        sendMessage(item.prompt)
                      }}
                      disabled={sending}
                      className="rounded-lg border border-border p-2.5 text-left text-xs font-medium transition hover:border-primary hover:bg-primary/5 disabled:opacity-50"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}


function Quizzes() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Active quiz session state
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null)
  const [quizDetail, setQuizDetail] = useState<any | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [attemptResult, setAttemptResult] = useState<any | null>(null)
  const [quizLoading, setQuizLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // 1. Load published quizzes & attempt history on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true)
        const [qRes, aRes] = await Promise.all([
          fetch('/api/quizzes'),
          fetch('/api/quizzes/attempts'),
        ])

        let fetchedQuizzes: any[] = []
        if (qRes.ok) {
          fetchedQuizzes = await qRes.json()
          setQuizzes(fetchedQuizzes)
        }

        if (aRes.ok) {
          const aData = await aRes.json()
          setAttempts(aData)
        }

        if (fetchedQuizzes.length > 0) {
          startQuiz(fetchedQuizzes[0].id)
        }
      } catch (err) {
        console.error('Failed to load quiz list:', err)
      } finally {
        setLoading(false)
      }
    }
    loadInitialData()
  }, [])

  // Map latest score by quizId
  const latestScores = useMemo(() => {
    const map: Record<string, number> = {}
    for (const att of attempts) {
      if (att.quizId && map[att.quizId] === undefined) {
        map[att.quizId] = att.score
      }
    }
    return map
  }, [attempts])

  // 2. Select & start a quiz session
  async function startQuiz(quizId: string) {
    try {
      setQuizLoading(true)
      setErrorMsg('')
      setAttemptResult(null)
      setSelectedAnswers({})
      setCurrentQIndex(0)
      setActiveQuizId(quizId)

      const [detailRes, attemptRes] = await Promise.all([
        fetch(`/api/quizzes/${quizId}`),
        fetch(`/api/quizzes/${quizId}/attempt`, { method: 'POST' }),
      ])

      if (!detailRes.ok) {
        throw new Error('Failed to load quiz details')
      }
      if (!attemptRes.ok) {
        const aErr = await attemptRes.json().catch(() => ({}))
        throw new Error(aErr.error || 'Failed to start quiz attempt')
      }

      const detailData = await detailRes.json()
      const attemptData = await attemptRes.json()

      setQuizDetail(detailData)
      setAttemptId(attemptData.attemptId)
    } catch (err: any) {
      setErrorMsg(err.message || 'Error starting quiz')
    } finally {
      setQuizLoading(false)
    }
  }

  // 3. Option selection handler
  function handleSelectOption(questionId: string, optionId: string) {
    if (attemptResult) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  // 4. Submit quiz attempt to server
  async function handleSubmitQuiz() {
    if (!activeQuizId || !attemptId || !quizDetail) return

    const formattedAnswers = Object.entries(selectedAnswers).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }))

    if (formattedAnswers.length === 0) {
      setErrorMsg('Please select an answer for at least one question before submitting.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMsg('')

      const res = await fetch(`/api/quizzes/${activeQuizId}/attempt/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: formattedAnswers }),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || 'Failed to submit quiz attempt')
      }

      // Fetch evaluated result breakdown
      const resultRes = await fetch(`/api/quizzes/${activeQuizId}/attempt/${attemptId}`)
      if (resultRes.ok) {
        const resultData = await resultRes.json()
        setAttemptResult(resultData)
      } else {
        const submitData = await res.json()
        setAttemptResult(submitData)
      }

      // Refresh attempt history
      const aRes = await fetch('/api/quizzes/attempts')
      if (aRes.ok) {
        const aData = await aRes.json()
        setAttempts(aData)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const currentQuestion = quizDetail?.questions?.[currentQIndex]
  const totalQuestions = quizDetail?.questions?.length || 0
  const progressPercent = totalQuestions > 0 ? Math.round(((currentQIndex + 1) / totalQuestions) * 100) : 0

  return (
    <div className="flex flex-col gap-7">
      <PageHeading
        eyebrow="Knowledge check"
        title="Practice with precision."
        description="Focused quizzes to build recall, speed, and confidence."
        action="Take a quiz"
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_.8fr]">
        {/* Available Quizzes List */}
        <section className={`${card} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Available quizzes</h2>
              <p className="mt-1 text-sm text-muted-foreground">Recommended for your current goals.</p>
            </div>
            <Filter className="size-4 text-muted-foreground" />
          </div>

          <div className="mt-5 grid gap-3">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading available quizzes...</div>
            ) : quizzes.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No published quizzes available.</div>
            ) : (
              quizzes.map((q) => {
                const isActive = activeQuizId === q.id
                const pastScore = latestScores[q.id]

                return (
                  <button
                    key={q.id}
                    onClick={() => startQuiz(q.id)}
                    className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                      isActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
                    }`}
                  >
                    <span className="grid size-9 place-items-center rounded-md bg-muted text-primary">
                      <BrainCircuit className="size-4" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold">{q.title}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {q.subject?.shortTitle || 'Core'} · {q.difficulty} · {q.questionCount} questions · {q.durationMinutes} min
                      </span>
                    </span>
                    {pastScore !== undefined ? (
                      <span className="text-xs font-medium text-primary">{pastScore}%</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not started</span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </section>

        {/* Active Quiz Card / Result View */}
        <section className={`${card} p-6`}>
          {quizLoading ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Loading quiz questions...</p>
            </div>
          ) : attemptResult ? (
            /* Results Screen */
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-7" />
              </span>
              <h2 className="mt-5 text-2xl font-semibold">Quiz complete</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your result for {attemptResult.quizTitle || quizDetail?.title}
              </p>
              <p className="mt-5 text-5xl font-semibold text-primary">
                {attemptResult.score}
                <span className="text-lg text-muted-foreground">/100</span>
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {attemptResult.correctAnswers} correct · {attemptResult.totalQuestions - attemptResult.correctAnswers} incorrect
              </p>

              {/* Explanations List */}
              {attemptResult.questions && (
                <div className="mt-6 flex w-full max-h-64 flex-col gap-3 overflow-y-auto border-t border-border pt-4 text-left">
                  {attemptResult.questions.map((q: any, idx: number) => {
                    const uAns = q.userAnswer
                    const isRight = uAns?.isCorrect
                    return (
                      <div key={q.id} className="rounded-lg border border-border p-3 text-xs leading-5">
                        <p className="font-semibold text-foreground">
                          Q{idx + 1}. {q.questionText}
                        </p>
                        <p className={`mt-1 font-medium ${isRight ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {isRight ? '✓ Correct' : '✗ Incorrect'}
                        </p>
                        {q.explanation && (
                          <p className="mt-1 text-muted-foreground">{q.explanation}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <button onClick={() => activeQuizId && startQuiz(activeQuizId)} className={`${button} mt-6`}>
                <RotateCcw className="size-4" />
                Try again
              </button>
            </div>
          ) : quizDetail && currentQuestion ? (
            /* Active Question Screen */
            <>
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {quizDetail.subject?.shortTitle || 'Quiz'}
                  </span>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Question {currentQIndex + 1} of {totalQuestions}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">{progressPercent}%</span>
              </div>

              <div className="mt-3">
                <ProgressBar value={progressPercent} />
              </div>

              {errorMsg && (
                <div className="mt-4 rounded-md bg-destructive/10 p-3 text-xs text-destructive">
                  {errorMsg}
                </div>
              )}

              <h2 className="mt-8 text-lg font-semibold leading-7">{currentQuestion.questionText}</h2>

              <div className="mt-5 flex flex-col gap-2">
                {currentQuestion.options.map((option: any) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === option.id
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                      className={`flex items-center gap-3 rounded-lg border p-4 text-left text-sm transition ${
                        isSelected ? 'border-primary bg-primary/5 font-medium' : 'border-border hover:bg-accent'
                      }`}
                    >
                      <span
                        className={`grid size-5 place-items-center rounded-full border text-xs font-semibold ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        {isSelected ? <Check className="size-3" /> : option.optionKey}
                      </span>
                      <span>{option.optionText}</span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQIndex === 0}
                  className={`${outlineButton} ${currentQIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Previous
                </button>

                {currentQIndex < totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                    className={button}
                  >
                    Next question <ArrowRight className="size-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    className={button}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        Submit quiz <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center text-sm text-muted-foreground">
              Select a quiz from the list to start practicing.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Coding() {
  const [search, setSearch] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL')
  const [problems, setProblems] = useState<any[]>([])
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null)
  const [activeProblemDetail, setActiveProblemDetail] = useState<any | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'java' | 'cpp'>('javascript')
  const [code, setCode] = useState<string>('')
  const [submissions, setSubmissions] = useState<any[]>([])

  const [loadingProblems, setLoadingProblems] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitNotice, setSubmitNotice] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [lastStatus, setLastStatus] = useState<'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILE_ERROR' | null>(null)
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor')

  // Fetch coding problem list on mount
  useEffect(() => {
    async function loadProblems() {
      try {
        setLoadingProblems(true)
        const res = await fetch('/api/coding/problems')
        if (!res.ok) throw new Error('Failed to load problems')
        const data = await res.json()
        const probList = data.problems || []
        setProblems(probList)
        if (probList.length > 0) {
          setSelectedProblemId(probList[0].id)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingProblems(false)
      }
    }
    loadProblems()
  }, [])

  // Fetch problem details & submission history when selectedProblemId changes
  useEffect(() => {
    if (!selectedProblemId) return

    // Reset submission state when switching problems
    setSubmitNotice(null)
    setSubmitError(null)
    setLastStatus(null)

    async function loadProblemDetail() {
      try {
        setLoadingDetail(true)
        setSubmitNotice(null)
        setSubmitError(null)

        const res = await fetch(`/api/coding/problems/${selectedProblemId}`)
        if (!res.ok) throw new Error('Failed to load problem detail')
        const detail = await res.json()
        setActiveProblemDetail(detail)

        // Set initial code for currently selected language
        const starter = detail.starterCode?.[selectedLanguage] || ''
        setCode(starter)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingDetail(false)
      }
    }

    async function loadSubmissions() {
      try {
        setLoadingSubmissions(true)
        const res = await fetch(`/api/coding/submissions?problemId=${selectedProblemId}`)
        if (!res.ok) return
        const data = await res.json()
        setSubmissions(data.submissions || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingSubmissions(false)
      }
    }

    loadProblemDetail()
    loadSubmissions()
  }, [selectedProblemId])

  // Language switch handler
  function handleLanguageChange(newLang: 'javascript' | 'python' | 'java' | 'cpp') {
    setSelectedLanguage(newLang)
    if (activeProblemDetail?.starterCode?.[newLang]) {
      setCode(activeProblemDetail.starterCode[newLang])
    }
  }

  // Solution submission & validation handler
  async function handleSubmitSolution() {
    if (!selectedProblemId || !code.trim()) return
    setSubmitting(true)
    setSubmitNotice(null)
    setSubmitError(null)

    try {
      const res = await fetch(`/api/coding/problems/${selectedProblemId}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          sourceCode: code,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed')
      }

      const sub = data.submission || data
      const status = sub.status || 'PENDING'
      const passed = sub.testCasesPassed ?? 0
      const total = sub.testCasesTotal ?? 1
      const failed = sub.failedTestCase

      if (status === 'ACCEPTED') {
        setLastStatus('ACCEPTED')
        setSubmitNotice(`✓ Accepted — All ${passed}/${total} test cases passed!`)
      } else if (status === 'WRONG_ANSWER') {
        setLastStatus('WRONG_ANSWER')
        let msg = `✗ Wrong Answer — ${passed} / ${total} test cases passed.`
        if (failed && !failed.isHidden) {
          msg += ` | Failed: Input: ${failed.input} | Expected: ${failed.expected} | Received: ${failed.received}`
        } else if (failed && failed.isHidden) {
          msg += ` | Hidden test case failed.`
        }
        setSubmitError(msg)
      } else if (status === 'COMPILE_ERROR') {
        setLastStatus('COMPILE_ERROR')
        setSubmitError(`⚠ Compilation Error — ${sub.errorMessage || 'Syntax error in solution.'}`)
      } else {
        setLastStatus(null)
        setSubmitNotice(`Status: ${status} (${passed}/${total} tests passed)`)
      }

      // Refresh submission history
      const subRes = await fetch(`/api/coding/submissions?problemId=${selectedProblemId}`)
      if (subRes.ok) {
        const subData = await subRes.json()
        setSubmissions(subData.submissions || [])
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit solution')
    } finally {
      setSubmitting(false)
    }
  }

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase())
      const matchesDifficulty = difficultyFilter === 'ALL' || p.difficulty === difficultyFilter
      return matchesSearch && matchesDifficulty
    })
  }, [problems, search, difficultyFilter])

  // Random challenge generator
  function pickRandomChallenge() {
    if (!problems.length) return
    const randomIdx = Math.floor(Math.random() * problems.length)
    setSelectedProblemId(problems[randomIdx].id)
  }

  const langFileExt: Record<string, string> = {
    javascript: 'js',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeading
        eyebrow="Hands-on practice"
        title="Think in code."
        description="Solve placement coding problems with persistent submissions and language support."
        action="Random challenge"
        onAction={pickRandomChallenge}
      />

      <div className="grid gap-4 xl:grid-cols-[.72fr_1.28fr]">
        {/* Left Side: Problem Directory */}
        <div className={`${card} flex flex-col overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-3">
            <div className="flex min-w-48 flex-1 items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5">
              <Search className="size-4 text-muted-foreground" />
              <input
                aria-label="Search problems"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problems..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div className="max-h-[720px] overflow-y-auto divide-y divide-border">
            {loadingProblems ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="mr-2 size-5 animate-spin text-primary" />
                <span>Loading problem library...</span>
              </div>
            ) : filteredProblems.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No coding problems match your filter.
              </div>
            ) : (
              filteredProblems.map((prob) => {
                const isSelected = prob.id === selectedProblemId
                const isEasy = prob.difficulty === 'EASY'
                const isMedium = prob.difficulty === 'MEDIUM'

                return (
                  <button
                    key={prob.id}
                    onClick={() => setSelectedProblemId(prob.id)}
                    className={`flex w-full items-center justify-between p-4 text-left transition ${
                      isSelected ? 'bg-primary/10 font-semibold' : 'hover:bg-muted/60'
                    }`}
                  >
                    <div>
                      <span className="block text-sm font-medium text-foreground">
                        {prob.title}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            isEasy
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : isMedium
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                        {prob.topic?.name && <span>· {prob.topic.name}</span>}
                        {prob.subject?.shortTitle && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
                            {prob.subject.shortTitle}
                          </span>
                        )}
                      </span>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="size-4 text-primary shrink-0" />
                    ) : (
                      <ArrowRight className="size-4 text-muted-foreground shrink-0 opacity-40 hover:opacity-100" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Side: Workspace & Problem Description */}
        <div className="grid gap-4">
          {/* Problem Statement Section */}
          <section className={`${card} p-5`}>
            {loadingDetail ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="mr-2 size-5 animate-spin text-primary" />
                <span>Loading problem details...</span>
              </div>
            ) : activeProblemDetail ? (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                        activeProblemDetail.difficulty === 'EASY'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : activeProblemDetail.difficulty === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {activeProblemDetail.difficulty}
                    </span>
                    {activeProblemDetail.topic?.name && (
                      <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        {activeProblemDetail.topic.name}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activeProblemDetail.subject?.name}
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-semibold text-foreground">
                  {activeProblemDetail.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground whitespace-pre-line">
                  {activeProblemDetail.description}
                </p>

                {activeProblemDetail.inputFormat && (
                  <div className="mt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Input Format
                    </h3>
                    <p className="mt-1 font-mono text-xs text-foreground bg-muted/40 p-2 rounded">
                      {activeProblemDetail.inputFormat}
                    </p>
                  </div>
                )}

                {activeProblemDetail.outputFormat && (
                  <div className="mt-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Output Format
                    </h3>
                    <p className="mt-1 font-mono text-xs text-foreground bg-muted/40 p-2 rounded">
                      {activeProblemDetail.outputFormat}
                    </p>
                  </div>
                )}

                {activeProblemDetail.examples && activeProblemDetail.examples.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-foreground">Examples</h3>
                    <div className="mt-2 flex flex-col gap-2">
                      {activeProblemDetail.examples.map((ex: any, idx: number) => (
                        <pre
                          key={idx}
                          className="overflow-auto rounded-lg bg-muted p-3 font-mono text-xs leading-6"
                        >
                          {`Input: ${ex.input}\nOutput: ${ex.output}${
                            ex.explanation ? `\nExplanation: ${ex.explanation}` : ''
                          }`}
                        </pre>
                      ))}
                    </div>
                  </div>
                )}

                {activeProblemDetail.constraints && (
                  <p className="mt-4 font-mono text-xs text-muted-foreground border-t border-border pt-3">
                    Constraints: {activeProblemDetail.constraints}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Select a problem from the directory to start coding.
              </div>
            )}
          </section>

          {/* Editor / Submission History Section */}
          <div className="overflow-hidden rounded-xl border border-border bg-foreground text-background shadow-lg">
            {/* Top Navigation Tabs & Language Dropdown */}
            <div className="flex flex-wrap items-center justify-between border-b border-background/10 px-4 py-3 gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    activeTab === 'editor'
                      ? 'bg-background/20 text-background font-semibold'
                      : 'text-background/60 hover:text-background'
                  }`}
                >
                  solution.{langFileExt[selectedLanguage]}
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition flex items-center gap-1.5 ${
                    activeTab === 'history'
                      ? 'bg-background/20 text-background font-semibold'
                      : 'text-background/60 hover:text-background'
                  }`}
                >
                  <HistoryIcon className="size-3.5" />
                  Submissions ({submissions.length})
                </button>
              </div>

              {activeTab === 'editor' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-background/60">Language:</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) =>
                      handleLanguageChange(
                        e.target.value as 'javascript' | 'python' | 'java' | 'cpp'
                      )
                    }
                    className="rounded-md border border-background/20 bg-background/10 px-2.5 py-1 font-mono text-xs text-background outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="javascript" className="bg-background text-foreground">
                      JavaScript
                    </option>
                    <option value="python" className="bg-background text-foreground">
                      Python
                    </option>
                    <option value="java" className="bg-background text-foreground">
                      Java
                    </option>
                    <option value="cpp" className="bg-background text-foreground">
                      C++
                    </option>
                  </select>
                </div>
              )}
            </div>

            {/* Notifications Bar */}
            {submitNotice && (
              <div className="flex items-center gap-2 border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{submitNotice}</span>
              </div>
            )}
            {submitError && (
              <div className="flex items-center gap-2 border-b border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">
                <AlertCircle className="size-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Tab 1: Code Editor Workspace */}
            {activeTab === 'editor' && (
              <div className="flex flex-col">
                <div className="relative min-h-[300px]">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// Write your solution here..."
                    spellCheck={false}
                    className="w-full min-h-[300px] resize-y bg-transparent p-4 font-mono text-xs leading-6 text-background/90 outline-none focus:ring-0"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-background/10 p-3 bg-background/5">
                  <div className="flex items-center gap-2 text-xs text-background/60">
                    <span className={`inline-block size-2 rounded-full ${lastStatus === 'ACCEPTED' ? 'bg-emerald-400' : lastStatus === 'WRONG_ANSWER' ? 'bg-rose-400' : lastStatus === 'COMPILE_ERROR' ? 'bg-amber-400' : 'bg-background/30'}`}></span>
                    <span>Safe Validation Engine · {lastStatus ? lastStatus.replace('_', ' ') : 'Not submitted'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmitSolution}
                      disabled={submitting || !code.trim()}
                      className="rounded-md border border-background/20 px-3.5 py-2 text-xs font-semibold text-background transition hover:bg-background/10 disabled:opacity-50"
                    >
                      {submitting ? 'Validating...' : 'Run Code'}
                    </button>
                    <button
                      onClick={handleSubmitSolution}
                      disabled={submitting || !code.trim()}
                      className={`${button} px-4 py-2 text-xs font-semibold disabled:opacity-50`}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Solution'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Submission History */}
            {activeTab === 'history' && (
              <div className="p-4 text-background">
                {loadingSubmissions ? (
                  <div className="flex items-center justify-center p-6 text-background/60">
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    <span>Loading submissions...</span>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-background/60">
                    No submissions recorded yet for this problem. Write your solution and click &quot;Submit Solution&quot;.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {submissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-background/15 bg-background/5 p-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="rounded-md bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
                            {sub.status}
                          </span>
                          <span className="font-mono text-background/80 uppercase">
                            {sub.language}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-background/60">
                          <span>
                            {new Date(sub.submittedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Interview() {
  const [mode, setMode] = useState<'setup' | 'live' | 'result'>('setup')
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  // ── Setup form state ──
  const [candidateName, setCandidateName] = useState<string>('Candidate')
  const [type, setType] = useState<string>('TECHNICAL')
  const [difficulty, setDifficulty] = useState<string>('MEDIUM')
  const [questionCount, setQuestionCount] = useState<number>(5)
  const [targetRole, setTargetRole] = useState<string>('')
  const [subjectId, setSubjectId] = useState<string>('')
  const [title, setTitle] = useState<string>('')

  const [availableSubjects, setAvailableSubjects] = useState<Array<{ id: string; name: string; shortTitle: string }>>([])
  const [history, setHistory] = useState<Array<{
    id: string; title: string | null; interviewType: string; difficulty: string;
    questionCount: number; status: string; overallScore: number | null; createdAt: string;
  }>>([])

  const [starting, setStarting] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)

  // Load subjects, user profile (for targetRole and candidate name), and interview history on mount
  useEffect(() => {
    fetch('/api/subjects')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.subjects) setAvailableSubjects(d.subjects) })
      .catch(() => {})

    // Pre-fill candidateName & targetRole from user's actual profile selection
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.user?.name) setCandidateName(d.user.name)
        const role = d?.user?.targetRole
        setTargetRole(role || 'Software Engineer')
      })
      .catch(() => { setTargetRole('Software Engineer') })

    fetch('/api/interviews?limit=10')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.interviews) setHistory(d.interviews) })
      .catch(() => {})
  }, [mode])

  // Start new interview session
  async function handleStart() {
    setStarting(true)
    setSetupError(null)

    try {
      // 1. Create session
      const createRes = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewType: type,
          difficulty,
          questionCount,
          targetRole: targetRole.trim() || undefined,
          subjectId: subjectId || undefined,
          title: title.trim() || undefined,
        }),
      })

      const createData = await createRes.json()
      if (!createRes.ok) {
        setSetupError(createData.error || 'Failed to create interview session.')
        setStarting(false)
        return
      }

      const sessId = createData.session.id

      // 2. Start session (generates 1st question)
      const startRes = await fetch(`/api/interviews/${sessId}/start`, { method: 'POST' })
      const startData = await startRes.json()

      if (!startRes.ok) {
        setSetupError(startData.error || 'Failed to start interview question generation.')
        setStarting(false)
        return
      }

      setActiveSessionId(sessId)
      setMode('live')
    } catch {
      setSetupError('Failed to initialize interview session.')
    } finally {
      setStarting(false)
    }
  }

  function handleOpenResult(sessionId: string) {
    setActiveSessionId(sessionId)
    setMode('result')
  }

  if (mode === 'result' && activeSessionId) {
    return (
      <InterviewResult
        sessionId={activeSessionId}
        onRetry={() => {
          setActiveSessionId(null)
          setMode('setup')
        }}
      />
    )
  }

  if (mode === 'live' && activeSessionId) {
    return (
      <LiveInterview
        sessionId={activeSessionId}
        candidateName={candidateName}
        onComplete={() => setMode('result')}
        onAbandon={() => {
          setActiveSessionId(null)
          setMode('setup')
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeading
        eyebrow="Real-world rehearsal"
        title="Meet your AI interviewer."
        description="Configure a realistic text-based practice session for your target role. Evaluated by AI with instant feedback."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
        {/* Setup Card */}
        <section className={`${card} p-6`}>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <Video className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Interview setup</h2>
              <p className="text-sm text-muted-foreground">Choose the parameters for your practice session.</p>
            </div>
          </div>

          {setupError && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {setupError}
            </div>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
              Candidate Name
              <input
                type="text"
                value={candidateName}
                onChange={e => setCandidateName(e.target.value)}
                placeholder="Your full name"
                className="rounded-lg border border-input bg-background px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Interview type
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="TECHNICAL">Technical Interview</option>
                <option value="BEHAVIORAL">Behavioral Interview</option>
                <option value="GENERAL">General Interview</option>
                <option value="MIXED">Mixed Interview</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Difficulty
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Target Role
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="rounded-lg border border-input bg-background px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Question count
              <select
                value={questionCount}
                onChange={e => setQuestionCount(Number(e.target.value))}
                className="rounded-lg border border-input bg-background px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-ring"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={8}>8 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </label>
          </div>

          <label className="mt-5 flex flex-col gap-2 text-sm font-medium">
            Subject focus (optional)
            <select
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All placement subjects</option>
              {availableSubjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>

          <button onClick={handleStart} disabled={starting} className="mt-6 w-full sm:w-auto">
            <span className={button}>
              {starting ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
              {starting ? 'Generating 1st question…' : 'Start interview'}
            </span>
          </button>
        </section>

        {/* Practice Banner & History */}
        <div className="flex flex-col gap-5">
          <section className={`${card} flex flex-col justify-between p-6`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Text-Based Engine</span>
              </div>
              <h2 className="mt-4 text-xl font-semibold">Practice like it&apos;s the real thing.</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Answer AI-generated questions in real time. Each answer is evaluated across relevance, correctness, clarity, and depth.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              {[
                ['AI Question Generation', CheckCircle2],
                ['Instant Answer Evaluation', Target],
                ['Detailed Performance Breakdown', Lightbulb],
              ].map(([text, Icon]) => (
                <div key={text as string} className="flex items-center gap-3 text-sm">
                  <Icon className="size-4 text-primary" />
                  {text as string}
                </div>
              ))}
            </div>
          </section>

          {/* Past Interviews History */}
          {history.length > 0 && (
            <section className={`${card} p-5`}>
              <h3 className="text-sm font-semibold mb-3">Past Interview Sessions</h3>
              <div className="flex flex-col gap-2 max-h-60 overflow-auto">
                {history.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold">{item.title || `${item.difficulty} ${item.interviewType}`}</p>
                      <p className="text-muted-foreground mt-0.5">
                        {item.questionCount} Qs · {item.status}
                        {item.overallScore !== null && ` · Score: ${item.overallScore}/100`}
                      </p>
                    </div>
                    {item.status === 'COMPLETED' ? (
                      <button
                        onClick={() => handleOpenResult(item.id)}
                        className="rounded-md bg-accent px-2.5 py-1 font-medium hover:bg-muted"
                      >
                        View Result
                      </button>
                    ) : item.status === 'ACTIVE' ? (
                      <button
                        onClick={() => { setActiveSessionId(item.id); setMode('live'); }}
                        className="rounded-md bg-primary px-2.5 py-1 text-primary-foreground font-medium"
                      >
                        Resume
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function TalkingInterviewerAvatar({
  speaking,
  listening,
  evaluating,
  targetRole,
}: {
  speaking: boolean
  listening: boolean
  evaluating: boolean
  targetRole?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number | null>(null)

  // Animation parameters
  const stateRef = useRef({
    mouthOpen: 0,
    targetMouthOpen: 0,
    headTilt: 0,
    blinkProgress: 0,
    isBlinking: false,
    nextBlinkTime: Date.now() + 3000,
    breathCycle: 0,
    nodCycle: 0,
  })

  // Syllable pulse trigger when TTS speech boundary fires
  useEffect(() => {
    if (speaking) {
      const interval = setInterval(() => {
        stateRef.current.targetMouthOpen = Math.random() * 0.8 + 0.2
        stateRef.current.headTilt = (Math.random() - 0.5) * 0.08
      }, 120)
      return () => clearInterval(interval)
    } else {
      stateRef.current.targetMouthOpen = 0
      stateRef.current.headTilt = 0
    }
  }, [speaking])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastTime = performance.now()

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      const s = stateRef.current

      // Smooth mouth open interpolation
      s.mouthOpen += (s.targetMouthOpen - s.mouthOpen) * 20 * dt

      // Natural blink timer logic
      if (now > s.nextBlinkTime && !s.isBlinking) {
        s.isBlinking = true
        s.blinkProgress = 0
        s.nextBlinkTime = now + Math.random() * 3500 + 2500
      }

      if (s.isBlinking) {
        s.blinkProgress += dt * 10
        if (s.blinkProgress >= 1) {
          s.isBlinking = false
          s.blinkProgress = 0
        }
      }

      // Micro breathing & listening head nod cycles
      s.breathCycle += dt * 1.8
      s.nodCycle += dt * 2.5
      const breathOffset = Math.sin(s.breathCycle) * 2
      const nodOffset = listening ? Math.sin(s.nodCycle) * 3 : 0

      // Canvas dimensions
      const width = canvas.width
      const height = canvas.height

      // Clear & Background - Professional Office Scene
      ctx.clearRect(0, 0, width, height)

      // Background Wall Gradient (Warm Tech Office)
      const bgGrad = ctx.createLinearGradient(0, 0, width, height)
      bgGrad.addColorStop(0, '#18181b')
      bgGrad.addColorStop(0.5, '#27272a')
      bgGrad.addColorStop(1, '#09090b')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      // Ambient Office Window Light Effect
      const windowGrad = ctx.createRadialGradient(width * 0.8, height * 0.2, 10, width * 0.8, height * 0.2, width * 0.6)
      windowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.18)')
      windowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = windowGrad
      ctx.fillRect(0, 0, width, height)

      // Office Plant & Shelf Silhouette (Background Detail)
      ctx.fillStyle = 'rgba(39, 39, 42, 0.6)'
      ctx.fillRect(width * 0.05, height * 0.35, width * 0.15, height * 0.5)

      // Center Head & Body Position
      const centerX = width / 2
      const centerY = height / 2 + breathOffset + nodOffset

      ctx.save()
      ctx.translate(centerX, centerY - 15)
      ctx.rotate(s.headTilt)

      // Torso & Shoulders (Professional Blazer)
      ctx.fillStyle = '#1e1b4b' // Deep navy blazer
      ctx.beginPath()
      ctx.moveTo(-90, 140)
      ctx.quadraticCurveTo(0, 95, 90, 140)
      ctx.lineTo(130, height)
      ctx.lineTo(-130, height)
      ctx.closePath()
      ctx.fill()

      // Inner Shirt / Top
      ctx.fillStyle = '#f8fafc' // Crisp white blouse/shirt
      ctx.beginPath()
      ctx.moveTo(-35, 110)
      ctx.lineTo(0, 135)
      ctx.lineTo(35, 110)
      ctx.lineTo(20, 150)
      ctx.lineTo(-20, 150)
      ctx.closePath()
      ctx.fill()

      // Neck
      ctx.fillStyle = '#e29d82' // Skin tone
      ctx.fillRect(-20, 45, 40, 55)

      // Neck Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(-20, 85, 40, 15)

      // Head / Face Contour
      ctx.fillStyle = '#f0a88e' // Skin tone face base
      ctx.beginPath()
      ctx.ellipse(0, 0, 52, 68, 0, 0, Math.PI * 2)
      ctx.fill()

      // Face Highlight / Shading
      const faceHighlight = ctx.createLinearGradient(-40, -40, 40, 40)
      faceHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.15)')
      faceHighlight.addColorStop(1, 'rgba(0, 0, 0, 0.1)')
      ctx.fillStyle = faceHighlight
      ctx.beginPath()
      ctx.ellipse(0, 0, 52, 68, 0, 0, Math.PI * 2)
      ctx.fill()

      // Hair (Professional Styled Hair)
      ctx.fillStyle = '#1c1917' // Dark espresso hair
      ctx.beginPath()
      ctx.ellipse(0, -25, 58, 54, 0, Math.PI, Math.PI * 2)
      ctx.fill()

      // Side hair locks framing face
      ctx.beginPath()
      ctx.ellipse(-52, 5, 12, 45, 0.2, 0, Math.PI * 2)
      ctx.ellipse(52, 5, 12, 45, -0.2, 0, Math.PI * 2)
      ctx.fill()

      // Eyebrows
      ctx.strokeStyle = '#292524'
      ctx.lineWidth = 3.5
      ctx.lineCap = 'round'

      const browLift = speaking ? -2 : evaluating ? -1 : 0
      // Left eyebrow
      ctx.beginPath()
      ctx.moveTo(-32, -18 + browLift)
      ctx.quadraticCurveTo(-20, -25 + browLift, -8, -19 + browLift)
      ctx.stroke()

      // Right eyebrow
      ctx.beginPath()
      ctx.moveTo(8, -19 + browLift)
      ctx.quadraticCurveTo(20, -25 + browLift, 32, -18 + browLift)
      ctx.stroke()

      // Eyes & Blinking
      const blinkYScale = s.isBlinking
        ? Math.sin(s.blinkProgress * Math.PI)
        : 0

      ctx.fillStyle = '#ffffff' // Sclera (White)
      // Left Eye
      ctx.beginPath()
      ctx.ellipse(-22, -4, 11, 7 * (1 - blinkYScale * 0.9), 0, 0, Math.PI * 2)
      ctx.fill()

      // Right Eye
      ctx.beginPath()
      ctx.ellipse(22, -4, 11, 7 * (1 - blinkYScale * 0.9), 0, 0, Math.PI * 2)
      ctx.fill()

      if (blinkYScale < 0.8) {
        // Iris & Pupils
        ctx.fillStyle = '#451a03' // Warm hazel brown iris
        ctx.beginPath()
        ctx.arc(-22, -4, 5, 0, Math.PI * 2)
        ctx.arc(22, -4, 5, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#000000' // Pupil
        ctx.beginPath()
        ctx.arc(-22, -4, 2.5, 0, Math.PI * 2)
        ctx.arc(22, -4, 2.5, 0, Math.PI * 2)
        ctx.fill()

        // Catchlight reflections (Life in the eyes)
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(-20, -6, 1.2, 0, Math.PI * 2)
        ctx.arc(24, -6, 1.2, 0, Math.PI * 2)
        ctx.fill()
      }

      // Nose
      ctx.strokeStyle = '#d97706'
      ctx.lineWidth = 1.8
      ctx.beginPath()
      ctx.moveTo(0, -6)
      ctx.lineTo(2, 16)
      ctx.lineTo(-4, 20)
      ctx.stroke()

      // ====================================================================
      // DYNAMIC LIP-SYNC MOUTH ANIMATION ENGINE
      // ====================================================================
      const openHeight = Math.max(2, s.mouthOpen * 22)
      const mouthWidth = 24 + s.mouthOpen * 5

      // Lips Contour (Upper & Lower Lips)
      ctx.fillStyle = '#be123c' // Professional Rose Lip color

      if (s.mouthOpen > 0.08) {
        // OPEN TALKING MOUTH WITH LIP-SYNC SHAPE & INNER CAVITY
        ctx.fillStyle = '#4c0519'
        ctx.beginPath()
        ctx.ellipse(0, 34, mouthWidth / 2, openHeight / 2, 0, 0, Math.PI * 2)
        ctx.fill()

        // Upper Teeth
        ctx.fillStyle = '#f8fafc'
        ctx.fillRect(-mouthWidth / 3, 34 - openHeight / 2, (mouthWidth * 2) / 3, Math.min(4, openHeight / 3))

        // Upper Lip
        ctx.fillStyle = '#be123c'
        ctx.beginPath()
        ctx.moveTo(-mouthWidth / 2 - 2, 34)
        ctx.quadraticCurveTo(-mouthWidth / 4, 30 - openHeight / 4, 0, 31)
        ctx.quadraticCurveTo(mouthWidth / 4, 30 - openHeight / 4, mouthWidth / 2 + 2, 34)
        ctx.quadraticCurveTo(0, 33, -mouthWidth / 2 - 2, 34)
        ctx.fill()

        // Lower Lip
        ctx.beginPath()
        ctx.moveTo(-mouthWidth / 2 - 2, 34)
        ctx.quadraticCurveTo(0, 36 + openHeight / 2, mouthWidth / 2 + 2, 34)
        ctx.quadraticCurveTo(0, 34 + openHeight / 2 + 2, -mouthWidth / 2 - 2, 34)
        ctx.fill()
      } else {
        // CLOSED / SMILE MOUTH (LISTENING OR IDLE)
        ctx.strokeStyle = '#9f1239'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(-16, 34)
        ctx.quadraticCurveTo(0, listening ? 38 : 36, 16, 34)
        ctx.stroke()
      }

      ctx.restore()

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [speaking, listening, evaluating])

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={560}
        height={420}
        className="w-full h-full object-cover rounded-2xl"
      />
    </div>
  )
}

function LiveInterview({
  sessionId,
  candidateName,
  onComplete,
  onAbandon,
}: {
  sessionId: string
  candidateName?: string
  onComplete: () => void
  onAbandon: () => void
}) {
  const [session, setSession] = useState<{
    id: string; title: string | null; interviewType: string; difficulty: string;
    questionCount: number; currentQuestionNumber: number; targetRole: string | null;
    subject: { name: string; shortTitle: string } | null;
  } | null>(null)

  const [currentQuestion, setCurrentQuestion] = useState<{
    id: string; questionNumber: number; questionText: string; difficulty: string;
  } | null>(null)

  const [pastQA, setPastQA] = useState<Array<{
    id: string; questionNumber: number; questionText: string;
    answer: { answerText: string; evaluation: { overallScore: number; feedback: string } | null } | null;
  }>>([])

  const [answerText, setAnswerText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastEval, setLastEval] = useState<{ overallScore: number; feedback: string; strengths?: string[]; improvements?: string[] } | null>(null)

  // Audio / Visual Speech & Camera States
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [micState, setMicState] = useState<'OFF' | 'STARTING' | 'LISTENING' | 'STOPPED' | 'ERROR'>('OFF')
  const [micError, setMicError] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [ttsMuted, setTtsMuted] = useState(false)
  const [cameraOn, setCameraOn] = useState(true)
  const [recognition, setRecognition] = useState<any>(null)
  // Tracks whether the one-time opening introduction has finished
  const [introPlayed, setIntroPlayed] = useState(false)

  // Media Stream Ref
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Load session state
  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/interviews/${sessionId}`)
      if (!res.ok) { setError('Failed to load interview session.'); return }
      const data = await res.json()
      setSession(data.session)
      setCurrentQuestion(data.currentQuestion)
      setPastQA(data.questions.filter((q: any) => q.answer))
    } catch {
      setError('Network error loading session.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSession()
  }, [sessionId])

  // Local Candidate Webcam Stream Setup
  useEffect(() => {
    let active = true
    if (cameraOn && typeof window !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
        .then(stream => {
          if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
          streamRef.current = stream
          setCameraError(null)
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch(err => {
          console.warn('Webcam stream unavailable:', err)
          if (active) {
            setCameraError('Camera access was denied or unavailable. You can continue without video.')
            setCameraOn(false)
          }
        })
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
    }
    return () => {
      active = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
    }
  }, [cameraOn])

  // Speech Synthesis (TTS) — One-time AI Interviewer introduction before Question 1
  useEffect(() => {
    // Fire exactly once: when session first loads and intro has not yet been played
    if (!session || introPlayed) return
    if (ttsMuted) {
      // If muted, skip intro and go straight to questions
      setIntroPlayed(true)
      return
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const role = session.targetRole || 'Software Engineer'
      const nameGreeting = candidateName?.trim() ? `Hello ${candidateName.trim()}!` : 'Hello!'
      const introText = `${nameGreeting} Welcome to your INTERVUE AI interview. I'm your AI interviewer, and I'll be guiding you through this session today. We'll be conducting a ${session.difficulty.toLowerCase()} level ${session.interviewType.toLowerCase()} interview focusing on the ${role} role. Take your time with each response, and speak or type when you're ready. Let's begin.`
      const utterance = new SpeechSynthesisUtterance(introText)
      utterance.rate = 0.95
      utterance.pitch = 1.05
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => {
        setSpeaking(false)
        setIntroPlayed(true)
      }
      utterance.onerror = () => {
        setSpeaking(false)
        // On TTS error, still unblock questions so interview can continue
        setIntroPlayed(true)
      }
      window.speechSynthesis.speak(utterance)
    } else {
      // Browser doesn't support TTS — skip intro silently
      setIntroPlayed(true)
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  // Speech Synthesis (TTS) — Speak question out loud when new question arrives
  // Gated by introPlayed so Q1 never starts before the introduction finishes.
  useEffect(() => {
    if (!introPlayed || !currentQuestion?.questionText || ttsMuted) return
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(currentQuestion.questionText)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [currentQuestion, ttsMuted, introPlayed])

  // Speech Recognition (STT) setup with robust state machine
  const toggleListening = () => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setMicError('Speech recognition is not supported in this browser. You can type your answer in the text box below.')
      setMicState('ERROR')
      return
    }

    if (listening && recognition) {
      try { recognition.stop() } catch {}
      setListening(false)
      setMicState('STOPPED')
      return
    }

    setMicState('STARTING')
    setMicError(null)

    try {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'en-US'

      rec.onstart = () => {
        setListening(true)
        setMicState('LISTENING')
        setMicError(null)
      }
      rec.onresult = (event: any) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        if (transcript.trim()) {
          setAnswerText(transcript)
        }
      }
      rec.onerror = (event: any) => {
        setListening(false)
        setMicState('ERROR')
        if (event?.error === 'not-allowed') {
          setMicError('Microphone access was denied. You can type your answer instead.')
        } else if (event?.error === 'no-speech') {
          setMicError('No speech detected. Please speak clearly into your microphone or type your response.')
        } else {
          setMicError(`Microphone error (${event?.error || 'unavailable'}). Text fallback is fully available.`)
        }
      }
      rec.onend = () => {
        setListening(false)
        setMicState(prev => prev === 'LISTENING' ? 'STOPPED' : prev)
      }

      rec.start()
      setRecognition(rec)
    } catch (err) {
      console.error('Speech recognition error:', err)
      setListening(false)
      setMicState('ERROR')
      setMicError('Failed to activate microphone. You can type your answer instead.')
    }
  }

  // Submit answer to current question
  async function handleSubmitAnswer() {
    if (!answerText.trim() || submitting || !currentQuestion) return

    if (listening && recognition) {
      try { recognition.stop() } catch {}
      setListening(false)
      setMicState('STOPPED')
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }

    setSubmitting(true)
    setError(null)
    setLastEval(null)

    try {
      const res = await fetch(`/api/interviews/${sessionId}/questions/${currentQuestion.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerText: answerText.trim() }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to evaluate answer.')
        setSubmitting(false)
        return
      }

      setLastEval(data.evaluation)
      setAnswerText('')

      if (data.isLastQuestion) {
        // Complete session & speak closing TTS
        const compRes = await fetch(`/api/interviews/${sessionId}/complete`, { method: 'POST' })
        if (compRes.ok) {
          if (typeof window !== 'undefined' && 'speechSynthesis' in window && !ttsMuted) {
            window.speechSynthesis.cancel()
            const closingText = `Thank you for completing the interview, ${candidateName || 'Candidate'}. Your responses have been evaluated, and your interview results are ready.`
            const utterance = new SpeechSynthesisUtterance(closingText)
            utterance.rate = 1.0
            utterance.onstart = () => setSpeaking(true)
            utterance.onend = () => { setSpeaking(false); onComplete(); }
            utterance.onerror = () => { setSpeaking(false); onComplete(); }
            window.speechSynthesis.speak(utterance)
          } else {
            onComplete()
          }
        } else {
          setError('Failed to finalize interview summary.')
        }
      } else if (data.nextQuestion) {
        // Advance to next question
        setCurrentQuestion(data.nextQuestion)
        setSession((prev: any) => prev ? { ...prev, currentQuestionNumber: data.nextQuestion.questionNumber } : null)
        await fetchSession()
      }
    } catch {
      setError('Network error submitting answer.')
    } finally {
      setSubmitting(false)
    }
  }

  // Abandon session
  async function handleAbandonSession() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    try {
      await fetch(`/api/interviews/${sessionId}/abandon`, { method: 'POST' })
    } catch {}
    onAbandon()
  }

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Connecting to live AI video interview room…</p>
      </div>
    )
  }

  const qNum = currentQuestion?.questionNumber ?? session?.currentQuestionNumber ?? 1
  const totalQ = session?.questionCount ?? 5
  const progressPct = Math.round(((qNum - 1) / totalQ) * 100)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-rose-500 animate-ping"></span>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">Live Video Rehearsal</p>
          </div>
          <h1 className="mt-1 text-2xl font-semibold">
            {session?.title || `${session?.difficulty} ${session?.interviewType} Interview`}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Target Role: <strong className="text-foreground">{session?.targetRole || 'Software Engineer'}</strong> {session?.subject && `· ${session.subject.name}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            Question {qNum} of {totalQ}
          </span>
          <button onClick={handleAbandonSession} className="rounded-lg border border-destructive/30 px-3.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition">
            End Call
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPct}%` }} />
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {micError && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {cameraError && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TWO-PANEL VIDEO INTERVIEW CALL CONTAINER (Matching Reference Image) */}
      {/* ==================================================================== */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4 md:p-6 shadow-2xl relative flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

          {/* LEFT PANEL: ANIMATED TALKING AI INTERVIEWER CHARACTER */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 flex flex-col justify-between p-4 shadow-xl group">
            {/* HTML5 Canvas Real-Time Lip-Sync & Face Motion Renderer */}
            <TalkingInterviewerAvatar
              speaking={speaking}
              listening={listening}
              evaluating={submitting}
              targetRole={session?.targetRole || 'Software Engineer'}
            />

            {/* Top Badges */}
            <div className="relative z-10 flex items-center justify-between w-full">
              <span className="rounded-md bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500"></span>
                AI Interviewer
              </span>

              <span className="rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-zinc-300 border border-white/10">
                {speaking ? '🔊 Speaking...' : listening ? '🎙 Listening...' : submitting ? '⚡ Evaluating...' : 'Ready'}
              </span>
            </div>

            {/* Bottom Spoken Question Transcript Overlay (Reference Image Match) */}
            <div className="relative z-10 mt-auto bg-zinc-900/90 backdrop-blur-md text-white text-xs p-3.5 rounded-xl border border-white/10 shadow-2xl flex items-center gap-3">
              <div className="flex items-center gap-1 shrink-0">
                {[12, 22, 16, 26, 18].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full bg-primary transition-all ${speaking ? 'animate-pulse' : 'opacity-30'}`}
                    style={{ height: speaking ? `${h}px` : '6px' }}
                  />
                ))}
              </div>
              <p className="text-zinc-200 text-xs leading-relaxed line-clamp-2">
                {currentQuestion?.questionText || 'Generating interview question...'}
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: CANDIDATE WEBCAM VIDEO PANEL */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 flex flex-col justify-between p-4 shadow-xl">
            {/* Live Camera Stream or Fallback Avatar */}
            {cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-center p-6">
                <div className="grid size-24 place-items-center rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                  <UserRound className="size-12" />
                </div>
                <p className="mt-3 text-xs font-medium text-zinc-400">Camera turned off</p>
                <p className="text-[10px] text-zinc-500 mt-1">Click the camera icon below to enable preview</p>
              </div>
            )}

            {/* Dark Overlay for top/bottom badges */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/40 pointer-events-none" />

            {/* Top Badges */}
            <div className="relative z-10 flex items-center justify-between w-full">
              <span className="rounded-md bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${cameraOn ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                Candidate
              </span>

              {listening && (
                <span className="rounded-md bg-rose-500/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white animate-pulse flex items-center gap-1">
                  <Mic className="size-3" /> Audio Active
                </span>
              )}
            </div>

            {/* Bottom Candidate Response Transcript Overlay (Reference Image Match) */}
            <div className="relative z-10 mt-auto bg-zinc-900/90 backdrop-blur-md text-white text-xs p-3.5 rounded-xl border border-white/10 shadow-2xl flex items-center gap-3">
              <div className="flex items-center gap-1 shrink-0">
                {[14, 24, 18, 28, 16].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full bg-emerald-400 transition-all ${listening ? 'animate-pulse' : 'opacity-30'}`}
                    style={{ height: listening ? `${h}px` : '6px' }}
                  />
                ))}
              </div>
              <p className="text-zinc-200 text-xs leading-relaxed line-clamp-2 font-mono">
                {answerText.trim()
                  ? answerText
                  : listening
                  ? 'Listening for your response... Speak into microphone...'
                  : 'Click microphone or type your answer below...'}
              </p>
            </div>
          </div>

        </div>

        {/* BOTTOM FLOATING CALL CONTROL BAR (Exact Reference Image Match) */}
        <div className="flex items-center justify-center gap-4 py-2.5 px-6 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-full shadow-2xl mx-auto w-fit">
          {/* Microphone Control */}
          <button
            onClick={toggleListening}
            title={listening ? 'Stop Microphone' : 'Start Microphone'}
            className={`size-12 rounded-full grid place-items-center transition-all ${
              listening
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/30'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
            }`}
          >
            {listening ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleAbandonSession}
            title="End Interview Call"
            className="size-14 rounded-full bg-red-600 hover:bg-red-700 text-white grid place-items-center shadow-lg hover:scale-105 transition"
          >
            <PhoneOff className="size-6" />
          </button>

          {/* Camera Control */}
          <button
            onClick={() => setCameraOn(!cameraOn)}
            title={cameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
            className={`size-12 rounded-full grid place-items-center transition-all ${
              cameraOn
                ? 'bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {cameraOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </button>

          {/* Audio Speaker Mute */}
          <button
            onClick={() => {
              const newMuted = !ttsMuted
              setTtsMuted(newMuted)
              if (newMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel()
                setSpeaking(false)
              }
            }}
            title={ttsMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
            className={`size-12 rounded-full border border-zinc-700 grid place-items-center transition-all ${
              ttsMuted ? 'bg-rose-500/20 text-rose-400' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
            }`}
          >
            {ttsMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CANDIDATE ANSWER INPUT WORKSPACE & EVALUATION FEEDBACK */}
      {/* ==================================================================== */}
      <section className={`${card} p-6 flex flex-col gap-4`}>
        {/* Previous Answer Evaluation Summary */}
        {lastEval && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs leading-relaxed">
            <div className="flex items-center justify-between font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
              <span>✓ Last Answer Evaluation</span>
              <span>Overall Score: {lastEval.overallScore}/10</span>
            </div>
            <p className="text-muted-foreground">{lastEval.feedback}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Response & Speech Transcript
          </label>
          <span className="text-xs text-muted-foreground">
            {answerText.trim().length} characters
          </span>
        </div>

        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          disabled={submitting}
          placeholder={
            listening
              ? 'Listening to microphone... Speak your response clearly...'
              : 'Type your answer or use microphone controls above...'
          }
          rows={4}
          className="w-full rounded-xl border border-input bg-background p-4 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />

        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-[11px] text-muted-foreground">
            Click <strong>Submit Answer</strong> when finished speaking or typing.
          </p>
          <button
            onClick={handleSubmitAnswer}
            disabled={!answerText.trim() || submitting}
            className={`${button} px-5 py-2 text-xs font-semibold disabled:opacity-50`}
          >
            {submitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Evaluating...
              </>
            ) : (
              <>
                <Send className="size-3.5" /> Submit Answer
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  )
}

function InterviewResult({
  sessionId,
  onRetry,
}: {
  sessionId: string
  onRetry: () => void
}) {
  const [result, setResult] = useState<{
    session: {
      id: string; title: string | null; interviewType: string; targetRole: string | null;
      difficulty: string; overallScore: number | null; overallFeedback: string | null;
    };
    metrics: { relevanceScore: number; correctnessScore: number; clarityScore: number; depthScore: number };
    strengths: string[];
    improvements: string[];
    questions: Array<{
      id: string; questionNumber: number; questionText: string;
      answer: {
        answerText: string;
        evaluation: {
          relevanceScore: number; correctnessScore: number; clarityScore: number;
          depthScore: number; overallScore: number; feedback: string;
          strengths?: string[]; improvements?: string[];
        } | null;
      } | null;
    }>;
  } | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/interviews/${sessionId}/result`)
      .then((res) => {
        if (!res.ok) throw new Error('Result not found')
        return res.json()
      })
      .then((data) => setResult(data))
      .catch(() => setError('Failed to load interview evaluation result.'))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Calculating overall interview score…</p>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center py-12">
        <AlertCircle className="size-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{error || 'Result unavailable.'}</p>
        <button onClick={onRetry} className={button}>Back to Setup</button>
      </div>
    )
  }

  const score100 = result.session.overallScore ?? 0

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-7">
      <PageHeading
        eyebrow="Interview complete"
        title="Here's how you performed."
        description="Detailed evaluation calculated from your answers by the AI interview engine."
      />

      <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
        {/* Score Card */}
        <section className={`${card} flex flex-col items-center justify-center p-8 text-center`}>
          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {result.session.difficulty} · {result.session.interviewType}
          </span>
          <p className="mt-6 text-6xl font-semibold text-primary">
            {score100}
            <span className="text-2xl text-muted-foreground">/100</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {score100 >= 80
              ? 'Excellent performance · Interview ready'
              : score100 >= 60
              ? 'Good effort · Solid foundation'
              : 'Keep practicing · Focus on depth'}
          </p>
          <div className="mt-6 w-full">
            <ProgressBar value={score100} />
          </div>
        </section>

        {/* Category Breakdown */}
        <section className={`${card} p-6`}>
          <h2 className="font-semibold text-base">Evaluation Breakdown</h2>
          <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {[
              ['Relevance', result.metrics.relevanceScore],
              ['Correctness', result.metrics.correctnessScore],
              ['Clarity', result.metrics.clarityScore],
              ['Depth', result.metrics.depthScore],
            ].map(([label, val]) => (
              <div key={label as string}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-semibold">{val}%</span>
                </div>
                <ProgressBar value={val as number} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className={`${card} p-6`}>
          <h2 className="font-semibold text-base">Strengths</h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
            {result.strengths.length > 0 ? (
              result.strengths.map((str, idx) => (
                <li key={idx} className="flex gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  {str}
                </li>
              ))
            ) : (
              <li className="flex gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                Clear communication and structured responses
              </li>
            )}
          </ul>
        </section>

        <section className={`${card} p-6`}>
          <h2 className="font-semibold text-base">Areas to Improve</h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
            {result.improvements.length > 0 ? (
              result.improvements.map((imp, idx) => (
                <li key={idx} className="flex gap-2">
                  <AlertCircle className="size-4 shrink-0 text-primary" />
                  {imp}
                </li>
              ))
            ) : (
              <li className="flex gap-2">
                <AlertCircle className="size-4 shrink-0 text-primary" />
                Add more specific technical details and edge-case handling
              </li>
            )}
          </ul>
        </section>
      </div>

      {/* AI Summary Feedback */}
      <section className={`${card} p-6`}>
        <div className="flex items-start gap-3">
          <Lightbulb className="mt-0.5 size-5 text-primary shrink-0" />
          <div>
            <h2 className="font-semibold text-base">Overall AI Feedback</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground whitespace-pre-wrap">
              {result.session.overallFeedback || 'Great work completing your AI interview practice.'}
            </p>
          </div>
        </div>
      </section>

      {/* Question-by-Question Review */}
      <section className={`${card} p-6`}>
        <h2 className="font-semibold text-base mb-4">Question Breakdown</h2>
        <div className="flex flex-col gap-4">
          {result.questions.map((q) => (
            <div key={q.id} className="rounded-lg border border-border p-4 text-xs leading-5">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-primary text-sm">Question {q.questionNumber}</span>
                {q.answer?.evaluation && (
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary font-semibold">
                    Score: {q.answer.evaluation.overallScore * 10}/100
                  </span>
                )}
              </div>
              <p className="font-medium text-sm text-foreground mt-2">{q.questionText}</p>

              {q.answer && (
                <div className="mt-3 rounded bg-muted p-3">
                  <p className="font-semibold text-muted-foreground mb-1">Your Answer:</p>
                  <p className="text-foreground">{q.answer.answerText}</p>
                </div>
              )}

              {q.answer?.evaluation && (
                <div className="mt-3 border-t border-border pt-2">
                  <p className="font-semibold text-primary">AI Evaluation:</p>
                  <p className="text-muted-foreground mt-0.5">{q.answer.evaluation.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={onRetry} className={button}>
            <RotateCcw className="size-4" /> Start New Interview
          </button>
          <Link href="/analytics" className={outlineButton}>
            View Analytics
          </Link>
          <Link href="/dashboard" className={outlineButton}>
            Back to Dashboard
          </Link>
        </div>
      </section>
    </div>
  )
}

function Analytics() {
  const [data, setData] = useState<{
    readiness?: { score: number; maxScore: number; note: string; trend: string }
    quizzes?: { totalAttempts: number; completedAttempts: number; averageScorePct: number; accuracyPct: number }
    coding?: { totalSubmissions: number; acceptedSubmissions: number; solvedProblemsCount: number; acceptanceRatePct: number; difficultyDistribution: { easy: number; medium: number; hard: number } }
    interviews?: { totalSessions: number; completedInterviews: number; averageScorePct: number; metricsBreakdown: { relevanceScorePct: number; correctnessScorePct: number; clarityScorePct: number; depthScorePct: number } }
    subjectProgress?: Array<{ slug: string; title: string; full: string; value: number; detail: string }>
    recommendations?: Array<{ id: string; category: string; title: string; description: string; actionText: string; actionHref: string; priority: string }>
  } | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/dashboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => { if (d) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const readinessScore = data?.readiness?.score ?? 40
  const readinessTrend = data?.readiness?.trend ?? 'Baseline score'

  const displaySubjects = data?.subjectProgress && data.subjectProgress.length > 0
    ? data.subjectProgress.map(s => ({
        title: s.title,
        full: s.full,
        value: s.value,
        detail: s.detail,
      }))
    : subjects

  const topRecommendation = data?.recommendations && data.recommendations.length > 0
    ? data.recommendations[0]
    : null

  const easyCount = data?.coding?.difficultyDistribution?.easy ?? 0
  const mediumCount = data?.coding?.difficultyDistribution?.medium ?? 0
  const hardCount = data?.coding?.difficultyDistribution?.hard ?? 0
  const totalSolved = (data?.coding?.solvedProblemsCount ?? 0) || 1
  const easyPct = Math.round((easyCount / totalSolved) * 100)
  const mediumPct = Math.round((mediumCount / totalSolved) * 100)
  const hardPct = Math.round((hardCount / totalSolved) * 100)

  return (
    <div className="flex flex-col gap-7">
      <PageHeading
        eyebrow="Performance overview"
        title="Progress you can act on."
        description="Comprehensive insights calculated server-side from your quiz attempts, coding submissions, and AI interviews."
      />

      {/* Top Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Overall readiness" value={`${readinessScore} / 100`} note={readinessTrend} icon={Target} />
        <Stat label="Interviews completed" value={`${data?.interviews?.completedInterviews ?? 0}`} note={`Avg score: ${data?.interviews?.averageScorePct ?? 0}%`} icon={Video} />
        <Stat label="Problems solved" value={`${data?.coding?.solvedProblemsCount ?? 0}`} note={`${data?.coding?.acceptanceRatePct ?? 0}% acceptance rate`} icon={Code2} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        {/* Subject Performance */}
        <section className={`${card} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Subject performance</h2>
              <p className="mt-1 text-sm text-muted-foreground">Real topic completion and score averages.</p>
            </div>
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">Live Data</span>
          </div>

          <div className="mt-6 flex flex-col gap-5">
            {displaySubjects.map(({ title, value }) => (
              <div key={title}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{title}</span>
                  <span className="font-semibold">{value}%</span>
                </div>
                <ProgressBar value={value} />
              </div>
            ))}
          </div>
        </section>

        {/* Interview & Coding Breakdown */}
        <section className={`${card} p-6`}>
          <h2 className="font-semibold">Interview Evaluation Metrics</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ['Relevance', `${data?.interviews?.metricsBreakdown?.relevanceScorePct ?? 0}%`],
              ['Correctness', `${data?.interviews?.metricsBreakdown?.correctnessScorePct ?? 0}%`],
              ['Clarity', `${data?.interviews?.metricsBreakdown?.clarityScorePct ?? 0}%`],
              ['Depth', `${data?.interviews?.metricsBreakdown?.depthScorePct ?? 0}%`],
            ].map(([x, v]) => (
              <div key={x} className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">{x}</p>
                <p className="mt-2 text-xl font-semibold">{v}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-7 font-semibold">Solved Coding Distribution</h2>
          <div className="mt-4 flex items-end gap-3">
            {[
              ['Easy', easyPct, easyCount],
              ['Medium', mediumPct, mediumCount],
              ['Hard', hardPct, hardCount],
            ].map(([x, pct, count]) => (
              <div key={x as string} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-md bg-primary/75" style={{ height: `${Math.max(Number(pct) * 1.2, 10)}px` }} />
                <span className="text-xs text-muted-foreground">{x}</span>
                <span className="text-xs font-semibold">{count} solved</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Deterministic Recommendation */}
      <section className={`${card} p-6`}>
        <div className="flex items-start gap-3">
          <Lightbulb className="mt-0.5 size-5 text-primary shrink-0" />
          <div>
            <h2 className="font-semibold text-base">Recommended Next Action</h2>
            {loading ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Calculating performance recommendations…
              </div>
            ) : topRecommendation ? (
              <>
                <p className="mt-2 text-sm leading-6 text-muted-foreground font-medium">{topRecommendation.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{topRecommendation.description}</p>
                <Link href={topRecommendation.actionHref} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                  {topRecommendation.actionText} <ArrowRight className="size-4" />
                </Link>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Start practicing quizzes or interviews to receive personalized performance recommendations.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function Profile() {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [userData, setUserData] = useState<{
    id: string
    name: string
    email: string
    initials: string
    college: string | null
    degree: string | null
    graduationYear: number | null
    targetRole: string | null
    targetCompanies: string | null
    emailVerifiedAt: string | null
  } | null>(null)

  const [formValues, setFormValues] = useState({
    name: '',
    college: '',
    degree: '',
    graduationYear: '',
    targetRole: '',
    targetCompanies: '',
  })

  const [referralInfo, setReferralInfo] = useState<{ referralCode: string; referralCount: number; referrals: any[] } | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const json = await res.json()
        if (json.user) {
          setUserData(json.user)
          setFormValues({
            name: json.user.name || '',
            college: json.user.college || '',
            degree: json.user.degree || '',
            graduationYear: json.user.graduationYear ? String(json.user.graduationYear) : '',
            targetRole: json.user.targetRole || '',
            targetCompanies: json.user.targetCompanies || '',
          })
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    }
  }

  useEffect(() => {
    fetchProfile()
    fetch('/api/referrals')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) setReferralInfo(data)
      })
      .catch(() => {})
  }, [])

  async function handleSave() {
    if (!editing) {
      setEditing(true)
      return
    }

    setSaving(true)
    try {
      const payload: any = {
        name: formValues.name.trim() || undefined,
        college: formValues.college.trim() || undefined,
        degree: formValues.degree.trim() || undefined,
        targetRole: formValues.targetRole.trim() || undefined,
        targetCompanies: formValues.targetCompanies.trim() || undefined,
      }
      if (formValues.graduationYear.trim()) {
        const yr = parseInt(formValues.graduationYear.trim(), 10)
        if (!isNaN(yr)) payload.graduationYear = yr
      }

      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.user) {
          setUserData(json.user)
        }
      }
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  function copyReferralLink() {
    if (!referralInfo?.referralCode) return
    const link = `${window.location.origin}/register?ref=${referralInfo.referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const name = userData?.name || 'User Profile'
  const email = userData?.email || ''
  const initials = userData?.initials || name.slice(0, 2).toUpperCase()
  const isVerified = Boolean(userData?.emailVerifiedAt)

  return (
    <div className="flex flex-col gap-7">
      <PageHeading eyebrow="Your account" title="Profile & settings" description="Keep your goals, preparation preferences, and referral code up to date." />
      <section className={`${card} max-w-3xl p-6`}>
        <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center">
          <span className="grid size-16 place-items-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">{initials}</span>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{email} · {isVerified ? 'Verified Account' : 'Unverified Account'}</p>
          </div>
          <button onClick={handleSave} disabled={saving} className={outlineButton}>
            {saving ? 'Saving...' : editing ? 'Save changes' : 'Edit profile'}
          </button>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Full Name
            {editing ? (
              <input
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <span className="rounded-lg bg-muted px-3 py-2.5 text-sm font-normal">{userData?.name || 'Not specified'}</span>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            College / Institution
            {editing ? (
              <input
                value={formValues.college}
                onChange={(e) => setFormValues({ ...formValues, college: e.target.value })}
                placeholder="e.g. Stanford University"
                className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <span className="rounded-lg bg-muted px-3 py-2.5 text-sm font-normal">{userData?.college || 'Not specified'}</span>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Degree / Major
            {editing ? (
              <input
                value={formValues.degree}
                onChange={(e) => setFormValues({ ...formValues, degree: e.target.value })}
                placeholder="e.g. B.Tech · Computer Science"
                className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <span className="rounded-lg bg-muted px-3 py-2.5 text-sm font-normal">{userData?.degree || 'Not specified'}</span>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Graduation Year
            {editing ? (
              <input
                value={formValues.graduationYear}
                onChange={(e) => setFormValues({ ...formValues, graduationYear: e.target.value })}
                placeholder="e.g. 2027"
                type="number"
                className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <span className="rounded-lg bg-muted px-3 py-2.5 text-sm font-normal">{userData?.graduationYear || 'Not specified'}</span>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Target Role
            {editing ? (
              <input
                value={formValues.targetRole}
                onChange={(e) => setFormValues({ ...formValues, targetRole: e.target.value })}
                placeholder="e.g. Software Engineer"
                className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <span className="rounded-lg bg-muted px-3 py-2.5 text-sm font-normal">{userData?.targetRole || 'Software Engineer'}</span>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Target Companies
            {editing ? (
              <input
                value={formValues.targetCompanies}
                onChange={(e) => setFormValues({ ...formValues, targetCompanies: e.target.value })}
                placeholder="e.g. Tech product & service companies"
                className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <span className="rounded-lg bg-muted px-3 py-2.5 text-sm font-normal">{userData?.targetCompanies || 'Product & service companies'}</span>
            )}
          </label>
        </div>

        <div className="mt-7 border-t border-border pt-6">
          <h2 className="font-semibold">Core Technical Competencies</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Data Structures', 'Algorithms', 'System Design', 'DBMS & SQL', 'Operating Systems', 'Computer Networks'].map((x) => (
              <span key={x} className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">{x}</span>
            ))}
          </div>
        </div>

        {/* Referral Section */}
        <div className="mt-7 border-t border-border pt-6">
          <h2 className="font-semibold flex items-center gap-2">
            <Trophy className="size-4 text-primary" /> Invite Friends & Earn Study Karma
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Share your referral link with classmates preparing for placements.</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex-1 rounded-lg border border-input bg-muted px-3.5 py-2.5 text-sm font-mono flex items-center justify-between">
              <span className="truncate">{referralInfo ? `${window.location.origin}/register?ref=${referralInfo.referralCode}` : 'Loading referral link...'}</span>
              {referralInfo?.referralCode && (
                <span className="ml-2 text-xs font-semibold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded shrink-0">
                  Code: {referralInfo.referralCode}
                </span>
              )}
            </div>
            <button onClick={copyReferralLink} disabled={!referralInfo?.referralCode} className={`${button} shrink-0`}>
              {copied ? <Check className="size-4" /> : <Send className="size-4" />}
              {copied ? 'Copied!' : 'Copy invite link'}
            </button>
          </div>
          {referralInfo && (
            <p className="mt-2 text-xs text-muted-foreground">
              {referralInfo.referralCount} classmate{referralInfo.referralCount === 1 ? '' : 's'} joined using your link.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

function RolePreparationView() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'plan' | 'preparation' | 'learning' | 'ready'>('plan')
  
  // Role selector modal state
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [allRoles, setAllRoles] = useState<any[]>([])
  const [roleSearch, setRoleSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [updatingRole, setUpdatingRole] = useState(false)

  // Resume upload & analysis state
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [analyzingResume, setAnalyzingResume] = useState(false)
  const [resumeNotice, setResumeNotice] = useState<string | null>(null)
  const [resumeError, setResumeError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/role-preparation')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error('Failed to load role preparation profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles')
      if (res.ok) {
        const json = await res.json()
        setAllRoles(json.roles || [])
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err)
    }
  }

  useEffect(() => {
    fetchData()
    fetchRoles()
  }, [])

  async function handleSelectRole(roleSlug: string) {
    setUpdatingRole(true)
    try {
      const res = await fetch('/api/user/target-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleSlug }),
      })
      if (res.ok) {
        setRoleModalOpen(false)
        await fetchData()
      }
    } catch (err) {
      console.error('Failed to update target role:', err)
    } finally {
      setUpdatingRole(false)
    }
  }

  async function handleResumeUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!resumeFile) return

    setUploadingResume(true)
    setResumeNotice(null)
    setResumeError(null)

    try {
      const formData = new FormData()
      formData.append('file', resumeFile)

      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (!res.ok) {
        setResumeError(json.error || 'Failed to upload resume')
        return
      }

      setResumeNotice(`Resume "${resumeFile.name}" uploaded successfully! Analyzing skills against target role...`)
      setResumeFile(null)

      // Auto-trigger analysis
      setAnalyzingResume(true)
      const analyzeRes = await fetch('/api/resume/analyze', { method: 'POST' })
      if (analyzeRes.ok) {
        setResumeNotice(`Resume skills analyzed successfully! Gap analysis updated.`)
        await fetchData()
      }
    } catch (err: any) {
      setResumeError(err.message || 'Error processing resume')
    } finally {
      setUploadingResume(false)
      setAnalyzingResume(false)
    }
  }

  async function handleDeleteResume() {
    try {
      const res = await fetch('/api/resume', { method: 'DELETE' })
      if (res.ok) {
        setResumeNotice('Resume removed from account.')
        await fetchData()
      }
    } catch (err) {
      console.error('Failed to delete resume:', err)
    }
  }

  const filteredRoles = useMemo(() => {
    return allRoles.filter((r) => {
      const matchesSearch = r.name.toLowerCase().includes(roleSearch.toLowerCase()) || r.description.toLowerCase().includes(roleSearch.toLowerCase())
      const matchesCat = selectedCategory === 'ALL' || r.category === selectedCategory
      return matchesSearch && matchesCat
    })
  }, [allRoles, roleSearch, selectedCategory])

  const categories = Array.from(new Set(allRoles.map((r) => r.category)))

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm">Calculating role readiness and gap analysis profile...</p>
      </div>
    )
  }

  const role = data?.role
  const readiness = data?.readiness
  const gap = readiness?.gapAnalysis
  const modes = data?.modes
  const resume = data?.resume

  return (
    <div className="flex flex-col gap-7">
      <PageHeading
        eyebrow="Target Role & Readiness"
        title="Role-Based Placement Preparation"
        description="Personalized around your target career role using the Three-Source Skill Model (Resume + Progress + Assessment Performance)."
        action="Change Target Role"
        onAction={() => setRoleModalOpen(true)}
      />

      {/* Target Role & Readiness Banner */}
      <section className={`${card} p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 via-card to-card`}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
                {role?.category || 'Engineering'}
              </span>
              <span className="text-xs text-muted-foreground">
                Target Role: <strong className="text-foreground text-sm">{role?.name || 'Software Engineer'}</strong>
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {role?.description || 'Core engineering placement track focused on CS fundamentals, coding, and technical interview excellence.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 border-t border-border pt-4 lg:border-0 lg:pt-0">
            <div className="text-center sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role Readiness</p>
              {readiness?.isSufficientData ? (
                <p className="text-4xl font-semibold text-primary mt-1">{readiness.readinessScore}%</p>
              ) : (
                <div className="mt-1 inline-flex items-center gap-1 rounded bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <AlertCircle className="size-3.5" /> Insufficient Data
                </div>
              )}
            </div>
            <button onClick={() => setRoleModalOpen(true)} className={outlineButton}>
              <Target className="size-4" /> Change Role
            </button>
          </div>
        </div>
      </section>

      {/* Optional Resume Analyzer Card */}
      <section className={`${card} p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="font-semibold text-base flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Personalize with Optional Resume
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Optional. Uploading a resume helps us verify what skills you already have. You are never required to upload a resume.
            </p>
          </div>
          {resume && (
            <button onClick={handleDeleteResume} className="text-xs font-semibold text-destructive hover:underline shrink-0">
              Remove Resume
            </button>
          )}
        </div>

        {resumeNotice && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{resumeNotice}</span>
          </div>
        )}
        {resumeError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="size-4 shrink-0" />
            <span>{resumeError}</span>
          </div>
        )}

        {resume ? (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg bg-muted p-4 text-xs">
            <div>
              <p className="font-semibold text-foreground">{resume.fileName} ({(resume.fileSize / 1024).toFixed(1)} KB)</p>
              <p className="text-muted-foreground mt-0.5">Uploaded {new Date(resume.uploadedAt).toLocaleDateString()} · Extracted {resume.rawSkills?.length || 0} skill keywords</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={async () => {
                  setAnalyzingResume(true)
                  try {
                    await fetch('/api/resume/analyze', { method: 'POST' })
                    setResumeNotice('Re-analyzed resume skills against current target role.')
                    await fetchData()
                  } finally {
                    setAnalyzingResume(false)
                  }
                }}
                disabled={analyzingResume}
                className={outlineButton}
              >
                {analyzingResume ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
                {analyzingResume ? 'Analyzing...' : 'Re-analyze Resume'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResumeUpload} className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
            />
            <button
              type="submit"
              disabled={!resumeFile || uploadingResume}
              className={`${button} shrink-0 text-xs py-2`}
            >
              {uploadingResume ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
              {uploadingResume ? 'Uploading...' : 'Upload & Analyze Resume'}
            </button>
          </form>
        )}
      </section>

      {/* 4 Main Preparation Mode Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Preparation Modes">
          {[
            ['plan', 'PLAN', 'What should I do next?'],
            ['preparation', 'PREPARATION', 'What should I practice?'],
            ['learning', 'LEARNING', 'What do I need to learn?'],
            ['ready', 'READY', 'Am I ready for this role?'],
          ].map(([key, label, desc]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex flex-col py-3 border-b-2 font-medium text-xs transition shrink-0 ${
                activeTab === key
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-[10px] opacity-75">{desc}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Mode Content */}
      {activeTab === 'plan' && (
        <section className={`${card} p-6`}>
          <h2 className="font-semibold text-base mb-2">Priority Recommended Next Steps</h2>
          <p className="text-xs text-muted-foreground mb-5">Sequenced automatically based on your missing role requirements, weak topics, and verified skills.</p>
          <div className="flex flex-col gap-3">
            {modes?.plan?.priorities?.length > 0 ? (
              modes.plan.priorities.map((item: any, idx: number) => (
                <div key={idx} className="flex items-start justify-between rounded-lg border border-border p-4 text-xs hover:bg-accent/50 transition">
                  <div className="flex items-start gap-3">
                    <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{item.title}</p>
                      <p className="text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <Link href={item.actionHref} className="text-xs font-semibold text-primary hover:underline shrink-0 ml-2">
                    {item.actionText} →
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-6 text-center">No active priority gaps. Complete quizzes and coding challenges to update your plan.</p>
            )}
          </div>
        </section>
      )}

      {activeTab === 'preparation' && (
        <div className="grid gap-5 sm:grid-cols-3">
          <section className={`${card} p-5 flex flex-col justify-between`}>
            <div>
              <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Quizzes</span>
              <h3 className="font-semibold text-base mt-2">Targeted Quizzes</h3>
              <p className="text-xs text-muted-foreground mt-1">Test your core knowledge on topics required for {role?.name}.</p>
            </div>
            <Link href="/quizzes" className={`${button} mt-5 w-full text-xs`}>
              Start Role Quizzes <ArrowRight className="size-3.5" />
            </Link>
          </section>

          <section className={`${card} p-5 flex flex-col justify-between`}>
            <div>
              <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Coding</span>
              <h3 className="font-semibold text-base mt-2">Hands-on Problems</h3>
              <p className="text-xs text-muted-foreground mt-1">Solve algorithmic and database challenges relevant to {role?.name}.</p>
            </div>
            <Link href="/coding" className={`${button} mt-5 w-full text-xs`}>
              Practice Coding <ArrowRight className="size-3.5" />
            </Link>
          </section>

          <section className={`${card} p-5 flex flex-col justify-between`}>
            <div>
              <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">AI Interview</span>
              <h3 className="font-semibold text-base mt-2">Mock Interview</h3>
              <p className="text-xs text-muted-foreground mt-1">Rehearse role-specific technical and behavioral interview questions.</p>
            </div>
            <Link href="/interview" className={`${button} mt-5 w-full text-xs`}>
              Start AI Interview <ArrowRight className="size-3.5" />
            </Link>
          </section>
        </div>
      )}

      {activeTab === 'learning' && (
        <section className={`${card} p-6`}>
          <h2 className="font-semibold text-base mb-2">Target Role Learning Curriculum</h2>
          <p className="text-xs text-muted-foreground mb-5">Subject areas mapped directly to {role?.name} job requirements.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {role?.requirements?.map((req: any) => (
              <div key={req.id} className="rounded-lg border border-border p-4 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{req.category}</span>
                  <h3 className="font-semibold text-sm text-foreground mt-1">{req.skillName}</h3>
                  <span className="text-[10px] text-muted-foreground">{req.importance} Requirement</span>
                </div>
                <Link href="/tutor" className={outlineButton}>
                  Ask Tutor
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'ready' && (
        <section className={`${card} p-6`}>
          <h2 className="font-semibold text-base mb-2">Role Readiness Evaluation</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs text-muted-foreground">Skill Coverage</p>
              <p className="text-2xl font-semibold mt-1">{readiness?.metrics?.skillCoveragePct}%</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs text-muted-foreground">Quiz Accuracy</p>
              <p className="text-2xl font-semibold mt-1">{readiness?.metrics?.avgQuizPct}%</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs text-muted-foreground">Coding Acceptance</p>
              <p className="text-2xl font-semibold mt-1">{readiness?.metrics?.codingRatePct}%</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs text-muted-foreground">Interview Evaluation</p>
              <p className="text-2xl font-semibold mt-1">{readiness?.metrics?.avgInterviewScorePct}%</p>
            </div>
          </div>
          {!readiness?.isSufficientData && (
            <p className="mt-4 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              Complete at least 3 total quizzes, coding problems, or mock interviews to unlock full arithmetic readiness verification.
            </p>
          )}
        </section>
      )}

      {/* 5 Gap Analysis Buckets Grid */}
      <div>
        <h2 className="font-semibold text-base mb-4">Role Skill Gap Analysis</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Bucket 1: Already Have */}
          <div className={`${card} p-5`}>
            <h3 className="font-semibold text-sm flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" /> What I Already Have ({gap?.alreadyHave?.length || 0})
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              {gap?.alreadyHave?.length > 0 ? (
                gap.alreadyHave.map((s: any) => (
                  <div key={s.skillName} className="rounded bg-muted p-2.5 text-xs">
                    <p className="font-semibold">{s.skillName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.note}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic py-3">No verified strong skills yet.</p>
              )}
            </div>
          </div>

          {/* Bucket 2: Currently Learning */}
          <div className={`${card} p-5`}>
            <h3 className="font-semibold text-sm flex items-center gap-2 text-primary">
              <Flame className="size-4" /> What I Am Learning ({gap?.learning?.length || 0})
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              {gap?.learning?.length > 0 ? (
                gap.learning.map((s: any) => (
                  <div key={s.skillName} className="rounded bg-muted p-2.5 text-xs">
                    <p className="font-semibold">{s.skillName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.note}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic py-3">No active learning topics.</p>
              )}
            </div>
          </div>

          {/* Bucket 3: Need to Learn */}
          <div className={`${card} p-5`}>
            <h3 className="font-semibold text-sm flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-4" /> What I Need to Learn ({gap?.needToLearn?.length || 0})
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              {gap?.needToLearn?.length > 0 ? (
                gap.needToLearn.map((s: any) => (
                  <div key={s.skillName} className="rounded bg-muted p-2.5 text-xs">
                    <p className="font-semibold">{s.skillName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.note}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic py-3">All role requirements started!</p>
              )}
            </div>
          </div>

          {/* Bucket 4: Needs Improvement */}
          <div className={`${card} p-5`}>
            <h3 className="font-semibold text-sm flex items-center gap-2 text-rose-500">
              <RotateCcw className="size-4" /> What Needs Improvement ({gap?.needsImprovement?.length || 0})
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              {gap?.needsImprovement?.length > 0 ? (
                gap.needsImprovement.map((s: any) => (
                  <div key={s.skillName} className="rounded bg-muted p-2.5 text-xs">
                    <p className="font-semibold">{s.skillName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.note}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic py-3">No low-accuracy areas detected.</p>
              )}
            </div>
          </div>

          {/* Bucket 5: Needs Verification */}
          <div className={`${card} p-5`}>
            <h3 className="font-semibold text-sm flex items-center gap-2 text-indigo-500">
              <Sparkles className="size-4" /> What Needs Verification ({gap?.needsVerification?.length || 0})
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              {gap?.needsVerification?.length > 0 ? (
                gap.needsVerification.map((s: any) => (
                  <div key={s.skillName} className="rounded bg-muted p-2.5 text-xs">
                    <p className="font-semibold">{s.skillName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.note}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic py-3">No unverified resume claims.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Role Selection Modal */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm">
          <div className={`${card} flex h-[85vh] w-full max-w-3xl flex-col p-6 shadow-2xl`}>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-semibold text-lg">Select Your Target Career Role</h2>
                <p className="text-xs text-muted-foreground">Choose a role to customize your preparation curriculum and readiness evaluation.</p>
              </div>
              <button onClick={() => setRoleModalOpen(false)} aria-label="Close modal" className="rounded-lg p-1 hover:bg-muted">
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  placeholder="Search roles..."
                  className="w-full bg-transparent outline-none"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex-1 overflow-auto flex flex-col gap-3">
              {filteredRoles.map((r) => {
                const isSelected = r.slug === role?.slug
                return (
                  <button
                    key={r.id}
                    disabled={updatingRole}
                    onClick={() => handleSelectRole(r.slug)}
                    className={`flex items-start justify-between rounded-lg border p-4 text-left transition ${
                      isSelected ? 'border-primary bg-primary/5 font-semibold' : 'border-border hover:bg-accent/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{r.name}</span>
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{r.category}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {r.requirements?.slice(0, 4).map((req: any) => (
                          <span key={req.id} className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                            {req.skillName}
                          </span>
                        ))}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="size-5 text-primary shrink-0 ml-3 mt-1" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Auth({ register = false }: { register?: boolean }) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const err = params.get('error')
      if (err === 'google_cancelled') setError('Google Sign-In was cancelled.')
      if (err === 'google_token_failed') setError('Failed to authenticate token with Google.')
      if (err === 'auth_failed') setError('Google authentication failed. Please try again.')
    }
  }, [])

  async function handleGoogleSignIn() {
    setError('')
    setGoogleLoading(true)
    try {
      const res = await fetch('/api/auth/google/url')
      const json = await res.json()
      if (json.configured && json.url) {
        window.location.href = json.url
      } else {
        setError(json.error || 'Google Sign-In is not configured in this environment.')
        setGoogleLoading(false)
      }
    } catch {
      setError('Unable to connect to Google OAuth service.')
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = e.currentTarget
    const data = new FormData(form)
    const email = data.get('email') as string
    const password = data.get('password') as string
    const name = data.get('name') as string | null

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    if (register) {
      const confirmPassword = data.get('confirmPassword') as string
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        setLoading(false)
        return
      }
    }

    try {
      const endpoint = register ? '/api/auth/register' : '/api/auth/login'
      const body = register
        ? { name: name ?? '', email, password }
        : { email, password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Unable to connect. Please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Brand /></div>
        <section className={`${card} p-7 sm:p-8`}>
          <h1 className="text-2xl font-semibold">{register ? 'Create your account' : 'Welcome back'}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {register ? 'Start building a focused placement preparation routine.' : 'Continue your placement preparation journey.'}
          </p>

          {error && (
            <div role="alert" className="mt-5 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />{error}
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className={`${outlineButton} mt-6 w-full flex items-center justify-center gap-2.5`}
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {register && (
              <label className="flex flex-col gap-2 text-sm font-medium">Full name
                <input required name="name" type="text" placeholder="Your name" autoComplete="name" className="rounded-lg border border-input bg-background px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-ring" />
              </label>
            )}
            <label className="flex flex-col gap-2 text-sm font-medium">Email
              <input required name="email" type="email" placeholder="you@example.com" autoComplete="email" className="rounded-lg border border-input bg-background px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-ring" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">Password
              <span className="flex items-center rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                <input required name="password" type={show ? 'text' : 'password'} placeholder="At least 8 characters" autoComplete={register ? 'new-password' : 'current-password'} className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-normal outline-none" />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="px-3 text-muted-foreground">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
            </label>
            {register && (
              <label className="flex flex-col gap-2 text-sm font-medium">Confirm password
                <input required name="confirmPassword" type="password" autoComplete="new-password" className="rounded-lg border border-input bg-background px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-ring" />
              </label>
            )}
            {!register && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" />Remember me</label>
                <Link href="/forgot-password" className="font-semibold text-primary">Forgot password?</Link>
              </div>
            )}
            <button className={`${button} mt-2 w-full`} type="submit" disabled={loading}>
              {loading ? 'Please wait…' : register ? 'Create account' : 'Sign in'}
              {!loading && <ArrowRight className="size-4" />}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {register ? 'Already have an account? ' : 'Need an account? '}
            <Link href={register ? '/login' : '/register'} className="font-semibold text-primary">{register ? 'Sign in' : 'Create one'}</Link>
          </p>
        </section>
      </div>
    </div>
  )
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Something went wrong. Please try again.')
      } else {
        setMessage(json.message || 'If an account exists for this email, a password reset link has been sent.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Brand /></div>
        <section className={`${card} p-7 sm:p-8`}>
          <h1 className="text-2xl font-semibold">Forgot your password?</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {error && (
            <div role="alert" className="mt-5 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />{error}
            </div>
          )}

          {message ? (
            <div className="mt-5 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
              <div className="flex items-center gap-2 font-semibold text-primary mb-1">
                <CheckCircle2 className="size-4 shrink-0" /> Link Sent
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
              <Link href="/login" className={`${outlineButton} mt-4 w-full text-xs`}>
                Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium">Email address
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" className="rounded-lg border border-input bg-background px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-ring" />
              </label>
              <button className={`${button} mt-2 w-full`} type="submit" disabled={loading}>
                {loading ? 'Sending link...' : 'Send reset link'}
                {!loading && <ArrowRight className="size-4" />}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link href="/login" className="font-semibold text-primary">Sign in</Link>
          </p>
        </section>
      </div>
    </div>
  )
}

function ResetPasswordPage() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const t = params.get('token')
      if (t) setToken(t)
      else setError('Password reset token is missing from the link.')
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setError('')
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to reset password.')
      } else {
        setMessage(json.message || 'Password reset successfully!')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Brand /></div>
        <section className={`${card} p-7 sm:p-8`}>
          <h1 className="text-2xl font-semibold">Set new password</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Please choose a strong password with at least 8 characters.
          </p>

          {error && (
            <div role="alert" className="mt-5 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />{error}
            </div>
          )}

          {message ? (
            <div className="mt-5 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
              <div className="flex items-center gap-2 font-semibold text-primary mb-1">
                <CheckCircle2 className="size-4 shrink-0" /> Password Updated
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
              <Link href="/login" className={`${button} mt-4 w-full`}>
                Sign in with new password
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium">New password
                <span className="flex items-center rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                  <input required type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-normal outline-none" />
                  <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="px-3 text-muted-foreground">
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </span>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">Confirm new password
                <input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" autoComplete="new-password" className="rounded-lg border border-input bg-background px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-ring" />
              </label>
              <button className={`${button} mt-2 w-full`} type="submit" disabled={loading || !token}>
                {loading ? 'Updating password...' : 'Reset password'}
                {!loading && <ArrowRight className="size-4" />}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Back to{' '}
            <Link href="/login" className="font-semibold text-primary">Sign in</Link>
          </p>
        </section>
      </div>
    </div>
  )
}

function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')

      if (!token) {
        setStatus('error')
        setMessage('Verification token is missing from the link.')
        return
      }

      fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
        .then(({ ok, json }) => {
          if (ok) {
            setStatus('success')
            setMessage(json.message || 'Your email address has been verified successfully!')
          } else {
            setStatus('error')
            setMessage(json.error || 'Failed to verify email address.')
          }
        })
        .catch(() => {
          setStatus('error')
          setMessage('Network error while verifying email address.')
        })
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Brand /></div>
        <section className={`${card} p-7 sm:p-8 text-center`}>
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="size-8 animate-spin text-primary" />
              <h1 className="text-xl font-semibold">Verifying your email address...</h1>
              <p className="text-xs text-muted-foreground">Please wait while we confirm your email token.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-6" />
              </div>
              <h1 className="text-2xl font-semibold">Email Verified!</h1>
              <p className="text-sm leading-6 text-muted-foreground">{message}</p>
              <Link href="/dashboard" className={`${button} mt-4 w-full`}>
                Go to Dashboard <ArrowRight className="size-4" />
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="size-6" />
              </div>
              <h1 className="text-2xl font-semibold">Verification Failed</h1>
              <p className="text-sm leading-6 text-muted-foreground">{message}</p>
              <Link href="/login" className={`${button} mt-4 w-full`}>
                Return to Sign In
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function EmailVerificationBanner({ userEmail }: { userEmail: string }) {
  const [resending, setResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  async function handleResend() {
    setResending(true)
    setResendStatus(null)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      })
      const json = await res.json()
      if (res.ok) {
        setResendStatus('Verification link sent!')
      } else {
        setResendStatus(json.error || 'Failed to resend link.')
      }
    } catch {
      setResendStatus('Failed to send request.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs sm:text-sm">
      <div className="flex items-center gap-2.5 text-foreground">
        <AlertCircle className="size-4 text-amber-500 shrink-0" />
        <span>Your email address ({userEmail}) is unverified.</span>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        {resendStatus ? (
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{resendStatus}</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="font-semibold text-primary hover:underline disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend verification link'}
          </button>
        )}
      </div>
    </div>
  )
}

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="mb-8 flex items-center justify-between"><Brand /><Link href="/login" className={outlineButton}>Sign in</Link></div>
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: September 3, 2026</p>
      <div className="mt-6 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>At INTERVUE AI, we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your information when you use our technical interview preparation platform.</p>
        <h2 className="text-lg font-semibold text-foreground">Information We Collect</h2>
        <p>We collect account details (name, email), profile settings, quiz attempt responses, coding submissions, AI tutor dialogue history, and interview evaluation feedback solely to deliver personalized preparation analytics and adaptive recommendations.</p>
        <h2 className="text-lg font-semibold text-foreground">How We Use OpenAI Services</h2>
        <p>Server-side AI requests (AI Tutor and AI Mock Interviews) process user text inputs via OpenAI API. OPENAI_API_KEY is maintained exclusively server-side. Your raw personal passwords, JWT cookies, and secrets are never sent to AI providers.</p>
        <h2 className="text-lg font-semibold text-foreground">Data Security</h2>
        <p>All authentication tokens are secured in httpOnly, SameSite=Lax cookies. Your data is isolated per account and never sold or shared with unauthorized third parties.</p>
      </div>
    </div>
  )
}

function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="mb-8 flex items-center justify-between"><Brand /><Link href="/login" className={outlineButton}>Sign in</Link></div>
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: September 3, 2026</p>
      <div className="mt-6 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>Welcome to INTERVUE AI. By using our platform, you agree to these Terms of Service.</p>
        <h2 className="text-lg font-semibold text-foreground">Use of Platform</h2>
        <p>INTERVUE AI is designed for individual student and professional interview preparation. You agree to use the platform in compliance with applicable laws and not to attempt reverse-engineering, automated scraping, or rate-limit circumvention.</p>
        <h2 className="text-lg font-semibold text-foreground">Account Responsibility</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials. You may not share your account or use unauthorized client IDs to bypass server controls.</p>
      </div>
    </div>
  )
}

function PublicSharePage({ publicId }: { publicId: string }) {
  const [share, setShare] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`/api/share/${publicId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && !data.error) setShare(data)
        else setError(true)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [publicId])

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="mb-8 flex items-center justify-between"><Brand /><Link href="/register" className={button}>Start Your Prep</Link></div>
      {loading ? (
        <div className={`${card} flex items-center justify-center p-12 text-muted-foreground gap-3`}>
          <Loader2 className="size-5 animate-spin" /><span>Loading achievement badge...</span>
        </div>
      ) : error || !share ? (
        <div className={`${card} p-8 text-center text-muted-foreground`}>
          <h2 className="text-lg font-semibold text-foreground">Share link not found or expired</h2>
          <p className="mt-2 text-sm">This shared result link is invalid or no longer exists.</p>
          <Link href="/register" className={`${button} mt-6`}>Build your own prep profile</Link>
        </div>
      ) : (
        <div className={`${card} p-8 border-l-4 border-l-primary flex flex-col gap-6`}>
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary uppercase">
                {share.type} Achievement Badge
              </span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight">{share.title}</h1>
              <p className="text-xs text-muted-foreground mt-1">Shared by Candidate {share.author} · Verified INTERVUE AI Result</p>
            </div>
            <Sparkles className="size-8 text-primary shrink-0" />
          </div>

          <p className="text-sm text-foreground leading-relaxed bg-muted/50 p-4 rounded-lg">{share.summary}</p>

          {share.metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {Object.entries(share.metrics).map(([key, val]) => (
                <div key={key} className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="mt-1 text-lg font-semibold text-primary">{String(val)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Want to test your interview readiness?</p>
              <p className="text-xs text-muted-foreground">Practice AI mock interviews, coding problems, and subject quizzes.</p>
            </div>
            <Link href="/register" className={button}>Create Free Account <ArrowRight className="size-4" /></Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function IntervueApp() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [user, setUser] = useState<{ name: string; initials: string; email: string; emailVerifiedAt: string | null } | null>(null)

  const auth = pathname === '/login' || pathname === '/register'
  const unauthPage = pathname === '/forgot-password' || pathname === '/reset-password' || pathname === '/verify-email'

  // Fetch the current authenticated user on mount (for protected pages)
  useEffect(() => {
    if (auth || unauthPage) return
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser({
            name: data.user.name,
            email: data.user.email,
            initials: data.user.initials,
            emailVerifiedAt: data.user.emailVerifiedAt ?? null,
          })
        }
      })
      .catch(() => {})
  }, [auth, unauthPage])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
    router.refresh()
  }

  if (pathname === '/privacy') return <PrivacyPage />
  if (pathname === '/terms') return <TermsPage />
  if (pathname === '/forgot-password') return <ForgotPasswordPage />
  if (pathname === '/reset-password') return <ResetPasswordPage />
  if (pathname === '/verify-email') return <VerifyEmailPage />
  if (pathname.startsWith('/share/')) return <PublicSharePage publicId={pathname.split('/share/')[1]} />
  if (auth) return <Auth register={pathname === '/register'} />

  const page =
    pathname === '/preparation' ? <Preparation /> :
    pathname === '/role-prep'   ? <RolePreparationView /> :
    pathname === '/tutor'       ? <Tutor /> :
    pathname === '/quizzes'     ? <Quizzes /> :
    pathname === '/coding'      ? <Coding /> :
    pathname === '/interview'   ? <Interview /> :
    pathname === '/analytics'   ? <Analytics /> :
    pathname === '/profile'     ? <Profile /> :
    <Dashboard />

  return (
    <div className={dark ? 'dark min-h-screen bg-background text-foreground' : 'min-h-screen bg-background text-foreground'}>
      <div className="flex min-h-screen">
        <Sidebar mobileOpen={mobileOpen} close={() => setMobileOpen(false)} />
        {mobileOpen && (
          <button
            aria-label="Close navigation overlay"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-foreground/20 lg:hidden"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            open={() => setMobileOpen(true)}
            dark={dark}
            toggleTheme={() => setDark(!dark)}
            user={user}
            onLogout={handleLogout}
          />
          <main className="mx-auto w-full max-w-[1440px] flex-1 px-5 py-8 md:px-8 lg:py-10">
            {user && !user.emailVerifiedAt && <EmailVerificationBanner userEmail={user.email} />}
            {page}
          </main>
        </div>
      </div>
    </div>
  )
}
