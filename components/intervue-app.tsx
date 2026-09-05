'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ArrowRight, BarChart3, BookOpen, BrainCircuit, Check, ChevronDown, Code2, Filter, Flame,
  Home, LineChart, Menu, MessageSquareText, Mic, MicOff, Moon, Play, Search, Settings2, Sparkles,
  Sun, Target, Trophy, UserRound, Video, VideoOff, PhoneOff, X, Camera, Clock3, RotateCcw, Send, SlidersHorizontal,
  CheckCircle2, Circle, AlertCircle, Lightbulb, LogOut, Eye, EyeOff, Loader2, History as HistoryIcon,
  Bot, Volume2, VolumeX, Users, Building2, Briefcase, Radio, Sparkles as SparklesIcon, Award, Star, Timer
} from 'lucide-react'
import { getRandomGDTopic, GD_TOPIC_POOL } from '@/lib/gd-topics'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/preparation', label: 'Preparation', icon: BookOpen },
  { href: '/role-prep', label: 'Role Prep', icon: Target },
  { href: '/company-prep', label: 'Company Prep', icon: Building2 },
  { href: '/tutor', label: 'AI Tutor', icon: MessageSquareText },
  { href: '/quizzes', label: 'Quizzes', icon: BrainCircuit },
  { href: '/coding', label: 'Coding', icon: Code2 },
  { href: '/interview', label: 'AI Interview', icon: Video },
  { href: '/gd', label: 'Group Discussion', icon: Users },
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
function Sidebar({ mobileOpen, close }: { mobileOpen: boolean; close: () => void }) { const pathname = usePathname(); return <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card px-3 py-5 transition-transform lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}><div className="flex items-center justify-between px-2"><Brand /><button className="lg:hidden" onClick={close} aria-label="Close navigation"><X className="size-5" /></button></div><nav className="mt-10 flex flex-col gap-1" aria-label="Main navigation"><p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">Workspace</p>{nav.map(({ href, label, icon: Icon }) => <Link key={href} onClick={close} href={href} aria-current={pathname === href ? 'page' : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${pathname === href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}><Icon className="size-[17px]" />{label}</Link>)}</nav><div className="mt-auto flex flex-col gap-1"><Link href="/profile" onClick={close} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"><Settings2 className="size-[17px]" />Settings</Link><div className="mt-4 rounded-xl bg-primary/5 border border-primary/15 p-4"><span className="text-xs font-semibold">Quick start</span><div className="mt-3 flex flex-col gap-1.5"><Link href="/interview" onClick={close} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 transition"><Video className="size-3" />AI Interview</Link><Link href="/tutor" onClick={close} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 transition"><MessageSquareText className="size-3" />AI Tutor</Link><Link href="/gd" onClick={close} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 transition"><Users className="size-3" />Group Discussion</Link><Link href="/company-prep" onClick={close} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 transition"><Building2 className="size-3" />Company Prep</Link></div></div></div></aside> }
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

  // ── Mode selection state ──
  const [selectedMode, setSelectedMode] = useState<string>('LEARN')

  // ── Chat state & Synchronous Guard Refs ──
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const sendingRef = useRef(false)
  const initRef = useRef(false)

  const [chatError, setChatError] = useState<string | null>(null)
  const [lastFailedMessage, setLastFailedMessage] = useState<{ content: string; mode?: string } | null>(null)
  const [loadingSession, setLoadingSession] = useState(false)

  // ── Voice Input & Output States ──
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  // ── Learning Summary Modal State ──
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [sessionSummary, setSessionSummary] = useState<{
    score: number
    topicsCovered: string[]
    conceptsMastered: string[]
    conceptsNeedingPractice: string[]
    commonMistakes: string[]
    recommendedNextTopic: string
  } | null>(null)

  // ── AI status ──
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ── Mode definitions ──
  const TUTOR_MODES = [
    { id: 'LEARN', label: '📚 Learn Concept', description: 'Step-by-step concept explanations with examples' },
    { id: 'ASK_DOUBT', label: '❓ Ask Doubt', description: 'Clear specific doubts and misunderstandings' },
    { id: 'PRACTICE', label: '🎯 Practice', description: 'Interactive questions & mistake explanation loop' },
    { id: 'INTERVIEW_PREP', label: '🎙️ Interview Prep', description: 'Simulated technical placement interview questions' },
    { id: 'CODING_HELP', label: '💻 Coding Help', description: 'DSA logic & algorithm debugging guidance' },
    { id: 'EXPLAIN_MISTAKE', label: '🔍 Explain Mistake', description: 'Analyze why an answer is wrong with correct logic' },
    { id: 'HINT', label: '💡 Socratic Hint', description: 'Guiding hint to reason through a problem without answer dumps' },
    { id: 'ROLE_PREP', label: '🚀 Role Prep', description: 'Target role skill alignment and preparation guidance' },
  ]

  // ── Load sessions on mount with initRef guard against StrictMode double runs ──
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    async function initTutor() {
      let paramSubjectId: string | null = null
      let paramTopicId: string | null = null
      let paramMode: string | null = null

      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search)
        paramSubjectId = searchParams.get('subjectId')
        paramTopicId = searchParams.get('topicId')
        paramMode = searchParams.get('mode')
      }

      if (paramMode && TUTOR_MODES.some(m => m.id === paramMode)) {
        setSelectedMode(paramMode)
      }

      try {
        const r = await fetch('/api/tutor/sessions?limit=15')
        if (r.ok) {
          const d = await r.json()
          const sessList = d?.sessions || []
          setSessions(sessList)

          if (paramSubjectId) {
            const matching = sessList.find((s: any) => s.subject?.id === paramSubjectId && (!paramTopicId || s.topic?.id === paramTopicId))
            if (matching) {
              await loadSession(matching.id)
            } else {
              await handleCreateSessionWithContext({ subjectId: paramSubjectId, topicId: paramTopicId || undefined })
            }
          } else if (sessList.length > 0) {
            await loadSession(sessList[0].id)
          } else {
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

  // ── Adaptive Difficulty Computation ──
  const computedAdaptiveState = useMemo(() => {
    const assistant = messages.filter(m => m.role === 'ASSISTANT')
    let correct = 0
    let incorrect = 0
    for (const m of assistant) {
      const l = m.content.toLowerCase()
      if (l.includes('correct') && !l.includes('incorrect') && !l.includes('not correct')) correct++
      if (l.includes('incorrect') || l.includes('misconception') || l.includes('almost')) incorrect++
    }
    if (correct >= 4 && incorrect <= 1) {
      return { level: 'Advanced', emoji: '🔥', style: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' }
    }
    if (correct >= 2) {
      return { level: 'Intermediate', emoji: '⚡', style: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' }
    }
    return { level: 'Beginner', emoji: '🌱', style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' }
  }, [messages])

  // ── Speech-to-Text Microphone Recording ──
  const toggleMic = () => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setChatError('Speech recognition is not supported in this browser. You can type your message.')
      return
    }

    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      setIsListening(false)
      return
    }

    try {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = true
      rec.lang = 'en-US'

      rec.onstart = () => setIsListening(true)
      rec.onresult = (e: any) => {
        let transcript = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript
        }
        if (transcript.trim()) {
          setInput(transcript)
        }
      }
      rec.onerror = () => setIsListening(false)
      rec.onend = () => setIsListening(false)

      rec.start()
      recognitionRef.current = rec
    } catch {
      setIsListening(false)
    }
  }

  // ── Text-to-Speech Read Aloud ──
  const readAloud = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const clean = text.replace(/^\[MODE:[A-Z_]+\]\s*/, '').replace(/[\*\_`#]/g, '')
      const utterance = new SpeechSynthesisUtterance(clean)
      utterance.rate = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  // ── Silent initial session creation ──
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

  // ── Context-aware session creation ──
  async function handleCreateSessionWithContext(opts: { subjectId?: string; topicId?: string; title?: string }): Promise<string | null> {
    try {
      const r = await fetch('/api/tutor/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts),
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
    setLastFailedMessage(null)
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

  // ── Fetch Session Summary Report ──
  const handleOpenSummary = async () => {
    if (!activeSessionId) return
    setLoadingSummary(true)
    setShowSummaryModal(true)
    try {
      const r = await fetch(`/api/tutor/sessions/${activeSessionId}/summary`)
      if (r.ok) {
        const d = await r.json()
        setSessionSummary(d.summary)
      }
    } catch (err) {
      console.error('Failed to load session summary:', err)
    } finally {
      setLoadingSummary(false)
    }
  }

  // ── Create new session from UI modal ──
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

  // ── Send message with sendingRef guard against race conditions & double clicks ──
  async function sendMessage(overrideText?: string, modeOverride?: string) {
    const rawContent = (overrideText || input).trim()

    if (!rawContent || sendingRef.current) return
    if (sessionStatus === 'ARCHIVED') { setChatError('This session is archived.'); return }

    // Synchronously lock sendingRef to prevent duplicate dispatches
    sendingRef.current = true
    setSending(true)
    setChatError(null)
    setLastFailedMessage(null)

    const targetMode = modeOverride || selectedMode

    let currentSessId = activeSessionId
    if (!currentSessId) {
      currentSessId = await handleCreateSessionSilent()
      if (!currentSessId) {
        setChatError('Failed to initialize session. Please try again.')
        sendingRef.current = false
        setSending(false)
        return
      }
    }

    if (!overrideText) setInput('')

    // Optimistic user message
    const tempId = `temp-${Date.now()}`
    setMessages(prev => [...prev, { id: tempId, role: 'USER', content: rawContent, createdAt: new Date().toISOString() }])

    try {
      const r = await fetch(`/api/tutor/sessions/${currentSessId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: rawContent, mode: targetMode }),
      })
      const d = await r.json()

      if (!r.ok) {
        setMessages(prev => prev.filter(m => m.id !== tempId))
        if (!overrideText) setInput(rawContent)
        setLastFailedMessage({ content: rawContent, mode: targetMode })

        if (r.status === 503 || r.status === 429) {
          setChatError('The AI tutor is temporarily busy. Your progress has been saved. Please click Retry.')
          setAiAvailable(false)
        } else {
          setChatError(d.error || 'Failed to send message.')
        }
        return
      }

      setMessages(prev => [...prev, d.message])
      setAiAvailable(true)
      setSessions(prev => prev.map(s => s.id === currentSessId ? { ...s, updatedAt: new Date().toISOString(), messageCount: s.messageCount + 2 } : s))
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId))
      if (!overrideText) setInput(rawContent)
      setLastFailedMessage({ content: rawContent, mode: targetMode })
      setChatError('Network connection interrupted. Your input was preserved. Click Retry when ready.')
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }

  const activeSubjectLabel = sessionSubject
    ? sessionSubject.shortTitle
    : activeSessionId ? 'General' : ''

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-7">
      <PageHeading
        eyebrow="Adaptive Personal Mentor"
        title="Your AI tutor."
        description="Experience an adaptive, Socratic AI tutor that understands your level, explains step-by-step, corrects misconceptions, and tracks your progress."
      />

      {/* End-of-Session Summary Report Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl flex flex-col gap-5 my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Award className="size-4" />
                </span>
                <div>
                  <h2 className="font-semibold text-lg">Session Learning Summary</h2>
                  <p className="text-xs text-muted-foreground">Performance evaluation for this tutoring session.</p>
                </div>
              </div>
              <button onClick={() => setShowSummaryModal(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            {loadingSummary ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Compiling session learning report…</p>
              </div>
            ) : sessionSummary ? (
              <div className="flex flex-col gap-5 text-xs">
                {/* Score Banner */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">Session Mastery Score</span>
                    <p className="text-3xl font-bold text-primary mt-1">{sessionSummary.score}/100</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                      {sessionSummary.score >= 80 ? 'Mastery Demonstrated' : sessionSummary.score >= 60 ? 'Good Understanding' : 'Needs Practice'}
                    </span>
                  </div>
                </div>

                {/* Concepts Mastered */}
                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" /> Concepts Mastered
                  </h3>
                  <ul className="flex flex-col gap-1.5 text-muted-foreground pl-1">
                    {sessionSummary.conceptsMastered.map((c, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-emerald-500"></span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Concepts Needing Practice */}
                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="size-4" /> Concepts Needing Practice
                  </h3>
                  <ul className="flex flex-col gap-1.5 text-muted-foreground pl-1">
                    {sessionSummary.conceptsNeedingPractice.map((c, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-amber-500"></span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Common Mistakes */}
                {sessionSummary.commonMistakes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5 text-muted-foreground">
                      <Lightbulb className="size-4 text-primary" /> Key Misconceptions Addressed
                    </h3>
                    <ul className="flex flex-col gap-1.5 text-muted-foreground pl-1">
                      {sessionSummary.commonMistakes.map((m, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-primary"></span>
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Topic Recommendation */}
                <div className="rounded-xl border border-border bg-muted/40 p-3.5 flex items-center gap-3">
                  <Sparkles className="size-5 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Recommended Next Step:</p>
                    <p className="text-muted-foreground mt-0.5">{sessionSummary.recommendedNextTopic}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground py-8">Summary report unavailable for this session.</p>
            )}

            <button onClick={() => setShowSummaryModal(false)} className={`${button} w-full mt-2`}>
              Close Report
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        {/* ── Chat Panel ── */}
        <section className={`${card} flex min-h-[570px] flex-col overflow-hidden`}>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">Intervue Coach</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${computedAdaptiveState.style}`}>
                    {computedAdaptiveState.emoji} {computedAdaptiveState.level}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {aiAvailable === false
                    ? 'AI service rate-limited'
                    : aiAvailable === true
                    ? 'Adaptive AI Teacher · Socratic Feedback'
                    : activeSessionId ? 'Loading session…' : 'Select or start a session'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeSubjectLabel && (
                <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                  {activeSubjectLabel} {sessionTopic ? `· ${sessionTopic.name}` : ''}
                </span>
              )}
              {activeSessionId && messages.length >= 2 && (
                <button
                  onClick={handleOpenSummary}
                  className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition flex items-center gap-1"
                >
                  <Award className="size-3.5" /> End & Summarize
                </button>
              )}
            </div>
          </div>

          {/* Mode Selector Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border bg-muted/30 px-4 py-2 text-xs">
            <span className="font-semibold text-muted-foreground mr-1 shrink-0">Mode:</span>
            {TUTOR_MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  selectedMode === m.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
                title={m.description}
              >
                {m.label}
              </button>
            ))}
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
                <p className="text-sm text-muted-foreground">Ask your first question or pick a quick prompt to start adaptive learning.</p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`group relative max-w-[85%] rounded-xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${
                    m.role === 'USER'
                      ? 'self-end bg-primary text-primary-foreground'
                      : 'self-start bg-muted text-foreground border border-border/40'
                  }`}
                >
                  {m.content.replace(/^\[MODE:[A-Z_]+\]\s*/, '')}

                  {m.role === 'ASSISTANT' && (
                    <button
                      onClick={() => readAloud(m.content)}
                      title="Read aloud"
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition rounded p-1 hover:bg-background/50 text-muted-foreground"
                    >
                      <Volume2 className="size-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}

            {sending && (
              <div className="self-start flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground animate-pulse">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>🧠 Intervue Coach is thinking & formulating response…</span>
              </div>
            )}

            {chatError && (
              <div className="self-stretch flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive shadow-xs">
                <span>{chatError}</span>
                {lastFailedMessage && (
                  <button
                    onClick={() => sendMessage(lastFailedMessage.content, lastFailedMessage.mode)}
                    disabled={sending}
                    className="rounded bg-destructive text-destructive-foreground px-3 py-1 text-xs font-semibold transition hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                  >
                    <RotateCcw className="size-3" /> Retry Message
                  </button>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            {sessionStatus === 'ARCHIVED' && (
              <p className="mb-2 text-xs text-muted-foreground text-center">This session is archived.</p>
            )}
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background p-1.5">
              {/* Mic Toggle Button */}
              <button
                onClick={toggleMic}
                title={isListening ? 'Stop Speech Recognition' : 'Voice Input (Speech-to-Text)'}
                className={`grid size-9 place-items-center rounded-md transition ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </button>

              <input
                aria-label="Ask your tutor"
                value={input}
                disabled={!activeSessionId || sending || sessionStatus === 'ARCHIVED'}
                onChange={e => {
                  setInput(e.target.value)
                  if (chatError) setChatError(null)
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder={
                  isListening
                    ? 'Listening... Speak into microphone...'
                    : activeSessionId
                    ? `Ask in ${TUTOR_MODES.find(m => m.id === selectedMode)?.label || 'Learn'} mode…`
                    : 'Select a session to start chatting…'
                }
                className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm outline-none disabled:opacity-50"
              />

              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || !activeSessionId || sending || sessionStatus === 'ARCHIVED'}
                aria-label="Send message"
                className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition"
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
                  placeholder="e.g. Operating Systems Deadlocks"
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
                  <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
                    {sessions.map(s => (
                      <button
                        key={s.id}
                        onClick={() => loadSession(s.id)}
                        className={`rounded-lg border px-3 py-2 text-left text-xs transition hover:bg-accent ${activeSessionId === s.id ? 'border-primary bg-primary/5 font-semibold' : 'border-border'}`}
                      >
                        <p className="font-medium truncate">{s.title || s.subject?.name || 'General'}</p>
                        <p className="text-muted-foreground mt-0.5">{s.messageCount} messages · {s.subject?.shortTitle || 'General'}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions Shortcuts */}
              <div className="mt-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Quick Adaptive Prompts</h2>
                <div className="grid gap-2">
                  {[
                    { label: '📚 Teach me this concept', mode: 'LEARN', prompt: 'Explain the core concepts, practical examples, and key takeaways for my topic.' },
                    { label: '🎯 Practice question', mode: 'PRACTICE', prompt: 'Ask me an adaptive practice question on my current topic.' },
                    { label: '💡 Socratic Hint', mode: 'HINT', prompt: 'Give me a guiding hint to reason through my current topic without giving away the answer.' },
                    { label: '🔍 Explain common mistakes', mode: 'EXPLAIN_MISTAKE', prompt: 'What common conceptual mistakes do candidates make in this topic during interviews?' },
                    { label: '🎙️ Technical Interview', mode: 'INTERVIEW_PREP', prompt: 'Ask me a technical interview question tailored to my target role.' },
                    { label: '🔁 Revision Checklist', mode: 'REVISION', prompt: 'Provide a concise high-yield revision checklist for this topic.' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setSelectedMode(item.mode)
                        sendMessage(item.prompt, item.mode)
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

  const typeDescriptions: Record<string, string> = {
    TECHNICAL: 'Deep technical domain depth, algorithm trade-offs, system architecture & code logic.',
    BEHAVIORAL: 'STAR-method leadership scenarios, team collaboration, conflicts & ethical situations.',
    GENERAL: 'Professional background, project walkthroughs, career motivation & placement role fit.',
    MIXED: 'Comprehensive hybrid of technical concept questions and behavioral scenario questions.',
  }

  const durationEstimates: Record<number, string> = {
    3: '~8–10 minutes',
    5: '~15–20 minutes',
    8: '~25–30 minutes',
    10: '~35–40 minutes',
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeading
        eyebrow="Voice-First Placement Rehearsal"
        title="Meet your AI interviewer."
        description="Experience an interactive, real-time voice video interview simulation tailored to your target role with natural spoken conversation and instant performance metrics."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
        {/* Setup Card */}
        <section className={`${card} p-6`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Video className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">Interview setup</h2>
                <p className="text-sm text-muted-foreground">Configure your simulated placement round.</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <Mic className="size-3.5" />
              Voice-First Simulation
            </span>
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
                <option value={3}>3 Questions ({durationEstimates[3]})</option>
                <option value={5}>5 Questions ({durationEstimates[5]})</option>
                <option value={8}>8 Questions ({durationEstimates[8]})</option>
                <option value={10}>10 Questions ({durationEstimates[10]})</option>
              </select>
            </label>
          </div>

          {/* Interview Type Context Box */}
          <div className="mt-4 rounded-lg bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground flex items-center gap-2.5 border border-border/50">
            <Sparkles className="size-4 text-primary shrink-0" />
            <span>{typeDescriptions[type] || typeDescriptions.TECHNICAL}</span>
          </div>

          <label className="mt-4 flex flex-col gap-2 text-sm font-medium">
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
              {starting ? 'Initializing AI interview room…' : 'Start live voice interview'}
            </span>
          </button>
        </section>

        {/* Practice Banner & History */}
        <div className="flex flex-col gap-5">
          <section className={`${card} flex flex-col justify-between p-6`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Conversational AI Engine</span>
                <span className="text-xs text-muted-foreground font-mono">Est: {durationEstimates[questionCount]}</span>
              </div>
              <h2 className="mt-4 text-xl font-semibold">Speak & practice naturally.</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Speak directly into your microphone. The AI interviewer listens, dynamically builds context-aware follow-up questions, and generates comprehensive feedback.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              {[
                ['Voice-to-Speech Real-Time Transcript', Mic],
                ['Adaptive Conversational Follow-Ups', BrainCircuit],
                ['Placement Readiness Assessment Badge', Award],
              ].map(([text, Icon]) => (
                <div key={text as string} className="flex items-center gap-3 text-sm font-medium">
                  <Icon className="size-4 text-primary shrink-0" />
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

  // Stopwatch timer for live call session
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Auto-submit countdown state (2.5 seconds after speech stops)
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState<number | null>(null)

  useEffect(() => {
    // When mic stops listening and transcript text exists, trigger auto-submit countdown
    if (micState === 'STOPPED' && answerText.trim().length >= 3 && !submitting && autoSubmitCountdown === null) {
      setAutoSubmitCountdown(3)
    }
  }, [micState, answerText, submitting, autoSubmitCountdown])

  useEffect(() => {
    if (autoSubmitCountdown === null) return
    if (autoSubmitCountdown <= 0) {
      setAutoSubmitCountdown(null)
      handleSubmitAnswer()
      return
    }
    const timer = setTimeout(() => {
      setAutoSubmitCountdown(prev => (prev !== null ? prev - 1 : null))
    }, 1000)
    return () => clearTimeout(timer)
  }, [autoSubmitCountdown])

  const cancelAutoSubmit = () => {
    setAutoSubmitCountdown(null)
  }

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
    setAutoSubmitCountdown(null)

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

    setAutoSubmitCountdown(null)

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
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-ping"></span>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">Live Voice Video Rehearsal</p>
          </div>
          <h1 className="mt-1 text-2xl font-semibold">
            {session?.title || `${session?.difficulty} ${session?.interviewType} Interview`}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Target Role: <strong className="text-foreground">{session?.targetRole || 'Software Engineer'}</strong> {session?.subject && `· ${session.subject.name}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-md bg-muted/80 px-3 py-1.5 text-xs font-mono font-medium text-foreground border border-border">
            <Clock3 className="size-3.5 text-primary" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
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
      {/* TWO-PANEL VIDEO INTERVIEW CALL CONTAINER */}
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

              <span className="rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-zinc-300 border border-white/10 flex items-center gap-1">
                {speaking ? (
                  <>🔊 Speaking...</>
                ) : listening ? (
                  <>🎙 Candidate Speaking...</>
                ) : submitting ? (
                  <><Loader2 className="size-3 animate-spin text-amber-400" /> ⚡ AI Thinking & Evaluating...</>
                ) : (
                  <>Ready</>
                )}
              </span>
            </div>

            {/* Bottom Spoken Question Transcript Overlay */}
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
                <p className="text-[10px] text-zinc-500 mt-1">Click camera icon to activate preview</p>
              </div>
            )}

            {/* Dark Overlay for top/bottom badges */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/40 pointer-events-none" />

            {/* Top Badges */}
            <div className="relative z-10 flex items-center justify-between w-full">
              <span className="rounded-md bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${cameraOn ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                Candidate ({candidateName || 'You'})
              </span>

              {listening && (
                <span className="rounded-md bg-rose-500/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white animate-pulse flex items-center gap-1">
                  <Mic className="size-3" /> Recording Spoken Response
                </span>
              )}
            </div>

            {/* Bottom Candidate Response Transcript Overlay */}
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
                  : 'Click microphone below to start speaking...'}
              </p>
            </div>
          </div>

        </div>

        {/* BOTTOM FLOATING CALL CONTROL BAR */}
        <div className="flex items-center justify-center gap-4 py-2.5 px-6 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-full shadow-2xl mx-auto w-fit">
          {/* Microphone Control */}
          <button
            onClick={toggleListening}
            title={listening ? 'Stop Microphone & Auto-Submit' : 'Start Microphone'}
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
        {/* Auto-Submit Countdown Banner */}
        {autoSubmitCountdown !== null && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs flex flex-wrap items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Clock3 className="size-4 shrink-0" />
              <span>Speech finished! Auto-submitting response in <strong>{autoSubmitCountdown}s</strong>...</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={cancelAutoSubmit}
                className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium hover:bg-accent transition"
              >
                Cancel / Edit Text
              </button>
              <button
                onClick={handleSubmitAnswer}
                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition"
              >
                Submit Now
              </button>
            </div>
          </div>
        )}

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

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live Speech Transcript
            </label>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              Voice-First
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Prominent Voice Toggle Button */}
            <button
              onClick={toggleListening}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                listening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {listening ? (
                <>
                  <MicOff className="size-3.5" /> Stop & Auto-Submit
                </>
              ) : (
                <>
                  <Mic className="size-3.5" /> 🎙 Speak Your Answer
                </>
              )}
            </button>

            <span className="text-xs text-muted-foreground">
              {answerText.trim().length} chars
            </span>
          </div>
        </div>

        <textarea
          value={answerText}
          onChange={(e) => {
            setAnswerText(e.target.value)
            if (autoSubmitCountdown !== null) setAutoSubmitCountdown(null)
          }}
          disabled={submitting}
          placeholder={
            listening
              ? 'Listening to microphone... Speak your response clearly...'
              : 'Click "🎙 Speak Your Answer" above to speak into microphone, or type your answer here...'
          }
          rows={4}
          className="w-full rounded-xl border border-input bg-background p-4 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />

        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-[11px] text-muted-foreground">
            Press <strong>🎙 Speak Your Answer</strong> or click <strong>Submit Response</strong> when finished.
          </p>
          <button
            onClick={handleSubmitAnswer}
            disabled={!answerText.trim() || submitting}
            className={`${button} px-5 py-2 text-xs font-semibold disabled:opacity-50`}
          >
            {submitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> AI Evaluating Response...
              </>
            ) : (
              <>
                <Send className="size-3.5" /> Submit Response
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
    summaryData?: {
      feedback: string
      interviewerAssessment: 'Strong Hire' | 'Hire' | 'Borderline' | 'Needs Improvement'
      strongestAnswerIndex: number
      weakestAnswerIndex: number
      communicationNotes: string
    } | null;
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

  const parsedSummary = useMemo(() => {
    if (!result) return null
    if (result.summaryData) return result.summaryData
    if (result.session.overallFeedback) {
      try {
        const p = JSON.parse(result.session.overallFeedback)
        if (p && typeof p === 'object' && p.feedback) return p
      } catch {
        return null
      }
    }
    return null
  }, [result])

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Calculating overall placement readiness score…</p>
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
  const assessment = parsedSummary?.interviewerAssessment || (score100 >= 80 ? 'Strong Hire' : score100 >= 65 ? 'Hire' : score100 >= 50 ? 'Borderline' : 'Needs Improvement')
  const strongestIndex = parsedSummary?.strongestAnswerIndex ?? 1
  const weakestIndex = parsedSummary?.weakestAnswerIndex ?? 1

  const assessmentBadgeStyle: Record<string, { bg: string; text: string; border: string; label: string; icon: any }> = {
    'Strong Hire': {
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      label: 'Strong Hire — Recommend Immediate Offer',
      icon: Award,
    },
    'Hire': {
      bg: 'bg-blue-500/10 dark:bg-blue-950/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/30',
      label: 'Hire — Solid Candidate for Role',
      icon: CheckCircle2,
    },
    'Borderline': {
      bg: 'bg-amber-500/10 dark:bg-amber-950/30',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/30',
      label: 'Borderline — Needs Further Preparation',
      icon: AlertCircle,
    },
    'Needs Improvement': {
      bg: 'bg-rose-500/10 dark:bg-rose-950/30',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/30',
      label: 'Needs Improvement — Core Skill Gaps',
      icon: AlertCircle,
    },
  }

  const badgeConfig = assessmentBadgeStyle[assessment] || assessmentBadgeStyle['Hire']
  const AssessmentIcon = badgeConfig.icon

  const displayFeedbackText = parsedSummary?.feedback || result.session.overallFeedback || 'Great work completing your practice interview.'

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-7">
      <PageHeading
        eyebrow="Voice Interview Complete"
        title="Here's your interviewer assessment."
        description="Structured performance evaluation calculated across technical depth, clarity, relevance, and verbal communication."
      />

      <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        {/* Score & Assessment Badge Card */}
        <section className={`${card} flex flex-col items-center justify-between p-7 text-center`}>
          <div className="flex flex-col items-center w-full">
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {result.session.difficulty} · {result.session.interviewType}
            </span>

            <p className="mt-5 text-6xl font-semibold text-primary">
              {score100}
              <span className="text-2xl text-muted-foreground">/100</span>
            </p>

            <div className="mt-5 w-full">
              <ProgressBar value={score100} />
            </div>
          </div>

          {/* Prominent Interviewer Assessment Badge */}
          <div className={`mt-6 w-full rounded-xl border p-4 text-xs font-semibold ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border} flex items-center justify-center gap-2 shadow-sm`}>
            <AssessmentIcon className="size-4 shrink-0" />
            <span>{badgeConfig.label}</span>
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
          <h2 className="font-semibold text-base">Key Strengths</h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
            {result.strengths.length > 0 ? (
              result.strengths.map((str, idx) => (
                <li key={idx} className="flex gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  {str}
                </li>
              ))
            ) : (
              <li className="flex gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                Clear verbal communication and structured response approach
              </li>
            )}
          </ul>
        </section>

        <section className={`${card} p-6`}>
          <h2 className="font-semibold text-base">Priority Improvement Areas</h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
            {result.improvements.length > 0 ? (
              result.improvements.map((imp, idx) => (
                <li key={idx} className="flex gap-2">
                  <AlertCircle className="size-4 shrink-0 text-amber-500" />
                  {imp}
                </li>
              ))
            ) : (
              <li className="flex gap-2">
                <AlertCircle className="size-4 shrink-0 text-amber-500" />
                Elaborate further with specific algorithmic trade-offs and edge-case handling
              </li>
            )}
          </ul>
        </section>
      </div>

      {/* AI Summary Feedback & Communication Notes */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className={`${card} p-6`}>
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 size-5 text-primary shrink-0" />
            <div>
              <h2 className="font-semibold text-base">Overall Lead Interviewer Feedback</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground whitespace-pre-wrap">
                {displayFeedbackText}
              </p>
            </div>
          </div>
        </section>

        <section className={`${card} p-6 bg-muted/30`}>
          <div className="flex items-start gap-3">
            <Mic className="mt-0.5 size-5 text-primary shrink-0" />
            <div>
              <h2 className="font-semibold text-base">Communication & Delivery Notes</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {parsedSummary?.communicationNotes || 'Spoken responses were processed and evaluated for verbal structure, pacing, and professional clarity.'}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Question-by-Question Review with Gold Highlight & Weakest Callout */}
      <section className={`${card} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-base">Question Breakdown & Specific Evaluations</h2>
          <span className="text-xs text-muted-foreground">
            {result.questions.length} Questions Evaluated
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {result.questions.map((q) => {
            const isStrongest = q.questionNumber === strongestIndex
            const isWeakest = q.questionNumber === weakestIndex && result.questions.length > 1

            let cardContainerStyle = 'border-border bg-card'
            if (isStrongest) {
              cardContainerStyle = 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/20 shadow-sm'
            } else if (isWeakest) {
              cardContainerStyle = 'border-indigo-500/50 bg-indigo-500/5 dark:bg-indigo-950/20 shadow-sm'
            }

            return (
              <div key={q.id} className={`rounded-xl border p-4 text-xs leading-5 transition-all ${cardContainerStyle}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="text-primary text-sm">Question {q.questionNumber}</span>
                    {isStrongest && (
                      <span className="rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <Star className="size-3 fill-amber-400 text-amber-500" /> Strongest Response
                      </span>
                    )}
                    {isWeakest && (
                      <span className="rounded bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                        <Lightbulb className="size-3 text-indigo-500" /> Focus Area for Improvement
                      </span>
                    )}
                  </div>

                  {q.answer?.evaluation && (
                    <span className="rounded bg-primary/10 px-2.5 py-1 text-xs text-primary font-semibold">
                      Score: {q.answer.evaluation.overallScore * 10}/100
                    </span>
                  )}
                </div>

                <p className="font-medium text-sm text-foreground mt-2">{q.questionText}</p>

                {q.answer && (
                  <div className="mt-3 rounded-lg bg-muted/80 p-3">
                    <p className="font-semibold text-muted-foreground mb-1">Your Response:</p>
                    <p className="text-foreground leading-relaxed">{q.answer.answerText}</p>
                  </div>
                )}

                {q.answer?.evaluation && (
                  <div className="mt-3 border-t border-border/60 pt-2">
                    <p className="font-semibold text-primary">AI Evaluation & Feedback:</p>
                    <p className="text-muted-foreground mt-0.5">{q.answer.evaluation.feedback}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={onRetry} className={button}>
            <RotateCcw className="size-4" /> Start New Rehearsal
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
              <span className="rounded-lg bg-muted px-3 py-2.5 text-sm font-normal">{userData?.targetRole || 'Not specified'}</span>
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
              <span className="rounded-lg bg-muted px-3 py-2.5 text-sm font-normal">{userData?.targetCompanies || 'Not specified'}</span>
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

      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      const fromParam = searchParams?.get('from')
      const redirectTarget = fromParam && fromParam.startsWith('/') && !fromParam.startsWith('/login') && !fromParam.startsWith('/register')
        ? fromParam
        : '/dashboard'

      router.push(redirectTarget)
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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-5 py-12">
        <div className="mb-8 flex items-center justify-between"><Brand /><Link href="/login" className={outlineButton}>Sign in</Link></div>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: September 3, 2026</p>
        <div className="mt-8 space-y-8 text-sm text-muted-foreground leading-7">

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Overview</h2>
            <p>At INTERVUE AI, we take your privacy seriously. This Privacy Policy explains what information we collect, how we use it, and the choices you have. INTERVUE AI is a technical interview preparation platform for students and professionals.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-foreground">Account data:</strong> Name, email address, and hashed password (or Google OAuth identity) when you register.</li>
              <li><strong className="text-foreground">Profile data:</strong> College, degree, graduation year, target role, target companies — entered voluntarily.</li>
              <li><strong className="text-foreground">Activity data:</strong> Quiz attempt responses, coding submissions, AI tutor messages, interview session transcripts, and Group Discussion contributions. This data powers your personalized readiness analytics.</li>
              <li><strong className="text-foreground">Resume data:</strong> If you voluntarily upload a resume (PDF, DOCX, or text), we extract text to identify skill keywords for gap analysis against your target role. The raw file is stored only while needed for analysis. It is never shared with other users or used for purposes other than your own preparation profile.</li>
              <li><strong className="text-foreground">Usage data:</strong> Standard server logs including IP address, browser type, and timestamps for security and performance monitoring.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Camera and Microphone</h2>
            <p>During AI Mock Interview sessions, your browser may request access to your camera and microphone. This access is requested solely to enable the interview simulation experience in your browser.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>Your raw webcam video stream is processed locally in your browser and is <strong className="text-foreground">not recorded, stored, or transmitted</strong> to our servers.</li>
              <li>Microphone input is used for optional speech-to-text transcription. Spoken text is processed locally via the Web Speech API (a browser-native API) and only the resulting transcript text is used.</li>
              <li>You may deny camera or microphone permission at any time. Text-based interview input remains available as a fallback.</li>
              <li>Camera and microphone permissions are browser-controlled. We never request or retain raw audio or video data on our servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">How We Use OpenAI Services</h2>
            <p>AI Tutor sessions and AI Mock Interview evaluation are powered by the OpenAI API (GPT-4o-mini). When you send a message to the AI Tutor or submit an interview answer:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>Your message text is sent to OpenAI's API server-side only. The API key is never exposed to the browser.</li>
              <li>Your raw passwords, authentication tokens, and cookies are never included in AI requests.</li>
              <li>OpenAI's own data usage policies apply to content processed through their API. See <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openai.com/privacy</a> for details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Data Security</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Passwords are hashed using bcrypt and are never stored in plain text.</li>
              <li>Authentication sessions use httpOnly, SameSite=Lax JWT cookies to prevent XSS and CSRF attacks.</li>
              <li>All data is isolated per account. You cannot access another user's data.</li>
              <li>API endpoints enforce ownership checks on all user-specific resources.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Data Retention</h2>
            <p>Account data, quiz attempts, interview sessions, and tutor conversations are retained while your account is active. If you delete your account, your personal data will be removed from our database. Anonymized aggregate statistics may be retained for platform improvement.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Third-Party Services</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-foreground">Google OAuth:</strong> If you sign in with Google, we receive your name and email from Google. We do not receive your Google password.</li>
              <li><strong className="text-foreground">Vercel Analytics:</strong> We use Vercel Analytics in production for anonymized page-view statistics. No personal identifiers are collected.</li>
              <li><strong className="text-foreground">Neon (PostgreSQL):</strong> Your data is stored in a Neon-managed PostgreSQL database with encryption at rest.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us. You may update your profile information from the Profile page at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Changes to This Policy</h2>
            <p>We may update this Privacy Policy as the platform evolves. The "Last updated" date at the top of this page reflects the most recent revision.</p>
          </section>

        </div>
        <div className="mt-10 border-t border-border pt-6 flex gap-4">
          <Link href="/terms" className={outlineButton}>Terms of Service</Link>
          <Link href="/login" className={button}>Sign In</Link>
        </div>
      </div>
    </div>
  )
}

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-5 py-12">
        <div className="mb-8 flex items-center justify-between"><Brand /><Link href="/login" className={outlineButton}>Sign in</Link></div>
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: September 3, 2026</p>
        <div className="mt-8 space-y-8 text-sm text-muted-foreground leading-7">

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Agreement</h2>
            <p>Welcome to INTERVUE AI. By accessing or using our platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Use of Platform</h2>
            <p>INTERVUE AI is designed for individual student and professional interview and placement preparation. You agree to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>Use the platform only for personal, non-commercial preparation purposes.</li>
              <li>Comply with all applicable laws and regulations.</li>
              <li>Not attempt to reverse-engineer, scrape, or automate API access beyond normal use.</li>
              <li>Not attempt to circumvent rate limits, authentication, or access controls.</li>
              <li>Not upload content (including resume files) that you do not have the right to share.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Account Responsibility</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You may not share your account with others or use unauthorized credentials to access the platform. You are responsible for all activity that occurs under your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">AI-Generated Content Disclaimer</h2>
            <p>INTERVUE AI uses OpenAI's API to generate tutoring responses, interview questions, and evaluation feedback. AI-generated content:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>May occasionally contain inaccuracies. It should be used as a study aid, not as a definitive or authoritative source.</li>
              <li>Does not constitute professional career advice, legal advice, or guaranteed assessment of your skills.</li>
              <li>Is generated based on your inputs. Do not include sensitive personal information (e.g., national ID numbers, financial details) in your messages.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">No Placement Guarantee</h2>
            <p>INTERVUE AI is a preparation tool. We do not guarantee employment, job placement, interview success, or any specific career outcome. Readiness scores and analytics are calculated from your activity on the platform and are indicators of practice engagement, not guarantees of real-world performance.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Camera and Microphone</h2>
            <p>You may grant camera and microphone access for the AI Mock Interview experience. By doing so, you confirm you understand that video is not stored on our servers and that microphone input is used for speech-to-text transcription only within your browser session.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Intellectual Property</h2>
            <p>All platform code, design, curriculum content, and branding belong to INTERVUE AI. Your personal data (quiz answers, interview transcripts, etc.) remains yours. We use it solely to deliver the service described in our Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms or engage in abusive behavior. You may delete your account at any time from the Profile page.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Changes to Terms</h2>
            <p>We may update these Terms as the platform evolves. Continued use of the platform after changes constitutes acceptance of the updated Terms. The "Last updated" date at the top reflects the most recent revision.</p>
          </section>

        </div>
        <div className="mt-10 border-t border-border pt-6 flex gap-4">
          <Link href="/privacy" className={outlineButton}>Privacy Policy</Link>
          <Link href="/login" className={button}>Sign In</Link>
        </div>
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

function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 py-4 flex items-center justify-between">
        <Brand />
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition">
            Sign in
          </Link>
          <Link href="/register" className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition shadow-lg">
            Create Account
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 lg:py-24 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6 shadow-xl">
          <Sparkles className="size-3.5" />
          <span>AI-Powered Placement & Tech Interview Preparation</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
          Master Tech Interviews with <span className="bg-gradient-to-r from-primary via-indigo-400 to-purple-400 bg-clip-text text-transparent">Real-Time AI Practice</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg leading-relaxed text-zinc-400 max-w-2xl">
          Rehearse live video interviews with a talking AI interviewer, solve placement coding problems, study with a 7-mode AI Tutor, and track target role readiness.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register" className="rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-2xl hover:opacity-90 transition flex items-center gap-2">
            Get Started Free <ArrowRight className="size-4" />
          </Link>
          <Link href="/login" className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition">
            Sign In to Dashboard
          </Link>
        </div>

        {/* Feature Cards Grid — 8 features */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left w-full">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-3 shadow-xl">
            <div className="size-10 rounded-xl bg-rose-500/10 text-rose-400 grid place-items-center">
              <Video className="size-5" />
            </div>
            <h3 className="font-semibold text-white text-base">AI Mock Interview</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Live 2-panel video call with a speech-synchronized talking AI interviewer, real-time evaluation, and per-question feedback.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-3 shadow-xl">
            <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-400 grid place-items-center">
              <MessageSquareText className="size-5" />
            </div>
            <h3 className="font-semibold text-white text-base">7-Mode AI Tutor</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Adaptive Socratic mentor supporting Learn, Practice, Hints, Mistake Analysis, Interview Prep, Revision, and Role Readiness modes.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-3 shadow-xl">
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-400 grid place-items-center">
              <Code2 className="size-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Coding Practice</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Solve placement DSA and SQL problems with multi-language support, test case validation, and full submission history.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-3 shadow-xl">
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-400 grid place-items-center">
              <BarChart3 className="size-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Readiness Analytics</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Track your readiness score, subject proficiency, quiz accuracy, and interview performance — all from real activity data.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-3 shadow-xl">
            <div className="size-10 rounded-xl bg-violet-500/10 text-violet-400 grid place-items-center">
              <Users className="size-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Group Discussion</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Practice structured GD sessions with AI participants across Analytical, Confident, and Devil's Advocate personas. Get scored on communication and leadership.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-3 shadow-xl">
            <div className="size-10 rounded-xl bg-cyan-500/10 text-cyan-400 grid place-items-center">
              <Briefcase className="size-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Resume Analysis</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload your resume to extract skill keywords and automatically identify gaps against your target role's requirements.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-3 shadow-xl">
            <div className="size-10 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 grid place-items-center">
              <Target className="size-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Role Preparation</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Choose your target role (SDE, Data Engineer, PM, and more) and get a personalized skill gap analysis and prioritized preparation plan.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-3 shadow-xl">
            <div className="size-10 rounded-xl bg-orange-500/10 text-orange-400 grid place-items-center">
              <Building2 className="size-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Company-Wise Prep</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Follow a 12-stage preparation roadmap tailored to specific companies — from TCS and Infosys to Amazon and Google.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24 w-full text-left">
          <p className="text-xs font-semibold uppercase tracking-[.15em] text-primary mb-3">How It Works</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">Your complete preparation journey</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([
              ['1', 'Choose Your Role', 'Select a target role from our catalog — SDE, Data Engineer, PM, Analyst, and more — to unlock a personalized preparation plan.'],
              ['2', 'Upload Your Resume', 'Optionally upload your resume. We extract skill keywords to verify what you already have and what you need to build.'],
              ['3', 'Identify Skill Gaps', 'The Three-Source Skill Model compares your resume skills, quiz performance, and topic progress against your target role requirements.'],
              ['4', 'Get a Personalized Path', 'Receive a sequenced, priority-ranked learning path that adapts as your performance improves.'],
              ['5', 'Learn with AI Tutor', 'Study any topic using 7 adaptive modes — from concept walkthroughs and Socratic hints to interview prep and mistake analysis.'],
              ['6', 'Practice Quizzes & Coding', 'Test your knowledge with subject quizzes and solve placement-style coding problems with test case validation.'],
              ['7', 'AI Interview + Group Discussion', 'Rehearse with a talking AI interviewer and practice structured Group Discussions with AI participants.'],
              ['8', 'Track Readiness Score', 'Your readiness score updates in real time based on quiz accuracy, coding acceptance rate, and interview evaluation scores.'],
              ['9', 'Target Your Company', 'Follow a 12-stage company-specific roadmap and build confidence for your actual placement drive.'],
            ] as [string, string, string][]).map(([num, title, desc]) => (
              <div key={num} className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">{num}</span>
                <div>
                  <p className="font-semibold text-white text-sm mb-1">{title}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 lg:px-12 py-6 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} INTERVUE AI. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-zinc-300">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-zinc-300">Terms of Service</Link>
        </div>
      </footer>
    </div>
  )
}


// ============================================================
// STAGE 17: GROUP DISCUSSION COMPONENT
// ============================================================

type GDParticipant = {
  id: string
  type: 'USER' | 'AI' | 'MODERATOR'
  name: string
  persona: string | null
  avatarSeed: string | null
}

type GDContributionItem = {
  id: string
  participantId: string
  participantName: string
  participantType: string
  participantPersona: string | null
  round: number
  type: string
  content: string
  createdAt: string
  evaluation: {
    communicationScore: number
    relevanceScore: number
    depthScore: number
    leadershipScore: number
    originalityScore: number
    overallScore: number
    feedback: string
    strengths: string[]
    improvements: string[]
  } | null
}

type GDSessionData = {
  id: string
  topic: string
  topicContext: string
  targetRole: string | null
  totalRounds: number
  currentRound: number
  status: string
  overallScore: number | null
  overallFeedback: string | null
  startedAt: string
  completedAt: string | null
  createdAt: string
  participants: GDParticipant[]
  contributions: GDContributionItem[]
}

function getParticipantColor(type: string, persona: string | null): string {
  if (type === 'MODERATOR') return '#8b5cf6'
  if (type === 'USER') return '#10b981'
  const colors: Record<string, string> = {
    Confident: '#3b82f6',
    Analytical: '#10b981',
    Opposing: '#ef4444',
    Balanced: '#f59e0b',
    Quiet: '#8b5cf6',
    Analyst: '#3b82f6',
    "Devil's Advocate": '#ef4444',
    Synthesizer: '#f59e0b',
    Pragmatist: '#06b6d4',
  }
  return colors[persona || ''] || '#6366f1'
}

function getParticipantInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function GDAvatar({
  participant,
  size = 'md',
  isSpeaking = false,
}: {
  participant: { name: string; type: string; persona: string | null }
  size?: 'sm' | 'md' | 'lg'
  isSpeaking?: boolean
}) {
  const color = getParticipantColor(participant.type, participant.persona)
  const sizeClass = size === 'sm' ? 'size-8 text-[10px]' : size === 'lg' ? 'size-14 text-base' : 'size-10 text-xs'
  return (
    <div className="relative inline-flex flex-col items-center">
      <div
        className={`${sizeClass} flex items-center justify-center rounded-full font-bold text-white flex-shrink-0 transition-all duration-300 ${
          isSpeaking ? 'ring-4 ring-primary ring-offset-2 ring-offset-background scale-105 shadow-lg' : ''
        }`}
        style={{ backgroundColor: color }}
        title={`${participant.name} — ${participant.persona || participant.type}`}
      >
        {participant.type === 'MODERATOR' ? '⚖' : getParticipantInitials(participant.name)}
      </div>
      {isSpeaking && (
        <span className="absolute -bottom-1 flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground shadow">
          <Radio className="size-2.5 animate-pulse" /> Speaking
        </span>
      )}
    </div>
  )
}

function GDScoreBar({ label, value, max = 20, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-semibold tabular-nums" style={{ color }}>{value}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function GroupDiscussion() {
  const [screen, setScreen] = useState<'list' | 'setup' | 'active' | 'result'>('list')
  const [sessions, setSessions] = useState<GDSessionData[]>([])
  const [activeSession, setActiveSession] = useState<GDSessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [contributionText, setContributionText] = useState('')
  const [animatingTurns, setAnimatingTurns] = useState(false)
  const [visibleContributions, setVisibleContributions] = useState<GDContributionItem[]>([])
  const [createError, setCreateError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [setupRounds, setSetupRounds] = useState(5)
  const [setupParticipants, setSetupParticipants] = useState(4)
  const [setupCustomTopic, setSetupCustomTopic] = useState('')
  const [setupMode, setSetupMode] = useState<'AI_GD' | 'REAL_MEMBER_GD' | 'MIXED_GD'>('AI_GD')
  const [activeSpeakerName, setActiveSpeakerName] = useState<string | null>(null)
  const [showTranscript, setShowTranscript] = useState(true)
  const [useTextFallback, setUseTextFallback] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Web Speech API states
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [micMuted, setMicMuted] = useState(false)
  const [micNotice, setMicNotice] = useState('')
  const recognitionRef = useRef<any>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/gd?limit=20')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.sessions) setSessions(d.sessions) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setSpeechSupported(true)
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const rec = new SpeechRecognitionClass()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'en-US'

      rec.onresult = (event: any) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        if (transcript.trim()) {
          setContributionText(transcript.trim())
        }
      }

      rec.onerror = (e: any) => {
        console.warn('[STT Error]', e.error)
        setIsListening(false)
        if (e.error === 'not-allowed') {
          setMicNotice('Microphone permission blocked. Using text fallback mode.')
          setUseTextFallback(true)
        }
      }

      rec.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = rec
    }
  }, [])

  // Timer effect for active session
  useEffect(() => {
    let timer: any = null
    if (screen === 'active' && activeSession && activeSession.status !== 'COMPLETED') {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      setElapsedSeconds(0)
    }
    return () => clearInterval(timer)
  }, [screen, activeSession])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [visibleContributions])

  function speakText(text: string, persona: string | null) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      const pitchMap: Record<string, number> = { Confident: 1.05, Analytical: 0.95, Opposing: 0.9, Balanced: 1.1, Quiet: 0.85 }
      const rateMap: Record<string, number> = { Confident: 1.05, Analytical: 0.95, Opposing: 1.1, Balanced: 1.0, Quiet: 0.9 }
      utterance.pitch = pitchMap[persona || ''] || 1.0
      utterance.rate = rateMap[persona || ''] || 1.0
      window.speechSynthesis.speak(utterance)
    } catch {
      // Ignore audio synthesis errors silently
    }
  }

  function toggleListening() {
    if (!recognitionRef.current) {
      setMicNotice('Browser speech recognition not supported. Please type your response.')
      setUseTextFallback(true)
      return
    }
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        setMicNotice('')
        recognitionRef.current.start()
        setIsListening(true)
      } catch {
        setIsListening(false)
      }
    }
  }

  function handleSurpriseTopic() {
    const randomItem = getRandomGDTopic()
    setSetupCustomTopic(randomItem.topic)
  }

  async function handleCreateSession() {
    if (setupMode === 'REAL_MEMBER_GD') {
      setCreateError('Real Member GD (Multiplayer) is preview-only in Stage 1. Using AI GD for live discussion.')
      setSetupMode('AI_GD')
      return
    }
    setCreating(true)
    setCreateError('')
    try {
      const res = await fetch('/api/gd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: setupCustomTopic.trim() || undefined,
          participantCount: setupParticipants,
          totalRounds: setupRounds,
          mode: setupMode,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCreateError(data.error || 'Failed to create GD session. Please try again.')
        return
      }
      const sess: GDSessionData = data.session
      setActiveSession(sess)
      setVisibleContributions(sess.contributions)
      setScreen('active')
      setElapsedSeconds(0)

      // Speak opening moderator line if available
      if (sess.contributions.length > 0) {
        speakText(sess.contributions[0].content, 'Moderator')
        setActiveSpeakerName('Moderator')
        setTimeout(() => setActiveSpeakerName(null), 3000)
      }
    } catch {
      setCreateError('Network connection issue. Please check your connection and try again.')
    } finally {
      setCreating(false)
    }
  }

  async function handleResumeSession(sessionId: string) {
    const res = await fetch(`/api/gd/${sessionId}`)
    if (!res.ok) return
    const data = await res.json()
    const sess: GDSessionData = data.session
    setActiveSession(sess)
    setVisibleContributions(sess.contributions)
    if (sess.status === 'COMPLETED') setScreen('result')
    else setScreen('active')
  }

  async function handleSubmitContribution() {
    if (!activeSession || !contributionText.trim() || submitting) return
    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      setIsListening(false)
    }
    setSubmitting(true)
    setSubmitError('')
    const text = contributionText.trim()
    setContributionText('')

    try {
      const res = await fetch(`/api/gd/${activeSession.id}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contributionText: text }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error || 'Failed to submit contribution. Retrying...')
        setContributionText(text)
        return
      }

      const newContribs: GDContributionItem[] = data.newContributions
      setActiveSession((prev) => prev
        ? {
            ...prev,
            currentRound: data.currentRound,
            status: data.sessionStatus,
            overallScore: data.overallScore ?? prev.overallScore,
            overallFeedback: data.overallFeedback ?? prev.overallFeedback,
          }
        : prev
      )

      // Animate turns one by one with live TTS speaking
      setAnimatingTurns(true)
      for (let i = 0; i < newContribs.length; i++) {
        const item = newContribs[i]
        await new Promise((resolve) => setTimeout(resolve, i === 0 ? 0 : 1100))
        setVisibleContributions((prev) => [...prev, item])
        setActiveSpeakerName(item.participantName)
        if (item.participantType !== 'USER') {
          speakText(item.content, item.participantPersona)
        }
      }
      setAnimatingTurns(false)
      setTimeout(() => setActiveSpeakerName(null), 2500)

      if (data.sessionStatus === 'COMPLETED') {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setScreen('result')
      }
    } catch {
      setSubmitError('Connection error. Your text has been preserved so you can retry.')
      setContributionText(text)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAbandon() {
    if (!activeSession) return
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    await fetch(`/api/gd/${activeSession.id}/abandon`, { method: 'POST' })
    setScreen('list')
    setActiveSession(null)
    setVisibleContributions([])
    const res = await fetch('/api/gd?limit=20')
    if (res.ok) { const d = await res.json(); if (d?.sessions) setSessions(d.sessions) }
  }

  const isCompleted = activeSession?.status === 'COMPLETED'
  const userParticipant = activeSession?.participants.find((p) => p.type === 'USER')
  const aiParticipants = activeSession?.participants.filter((p) => p.type === 'AI') || []
  const latestUserEval = [...visibleContributions]
    .reverse()
    .find((c) => c.participantType === 'USER' && c.evaluation)?.evaluation

  const allUserEvals = visibleContributions
    .filter((c) => c.participantType === 'USER' && c.evaluation)
    .map((c) => c.evaluation!)

  const avgComm = allUserEvals.length ? allUserEvals.reduce((s, e) => s + e.communicationScore, 0) / allUserEvals.length : 0
  const avgRel = allUserEvals.length ? allUserEvals.reduce((s, e) => s + e.relevanceScore, 0) / allUserEvals.length : 0
  const avgDepth = allUserEvals.length ? allUserEvals.reduce((s, e) => s + e.depthScore, 0) / allUserEvals.length : 0
  const avgLead = allUserEvals.length ? allUserEvals.reduce((s, e) => s + e.leadershipScore, 0) / allUserEvals.length : 0
  const avgOrig = allUserEvals.length ? allUserEvals.reduce((s, e) => s + e.originalityScore, 0) / allUserEvals.length : 0

  // ── LIST screen ──────────────────────────────────────────────────────────────
  if (screen === 'list') {
    return (
      <div className="flex flex-col gap-7">
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">Stage 17 Upgrade</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">AI Group Discussion (GD) Engine</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Participate in realistic, voice-first placement GD simulations with 5 distinct AI personalities — Confident, Analytical, Opposing, Balanced, and Quiet.
            </p>
          </div>
          <button
            id="gd-new-session-btn"
            onClick={() => setScreen('setup')}
            className={button}
          >
            <Users className="size-4" />
            Start New GD
          </button>
        </section>

        {/* Stats row */}
        {sessions.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className={`${card} p-5`}>
              <p className="text-sm text-muted-foreground">Total GD Sessions</p>
              <p className="mt-3 text-2xl font-semibold">{sessions.length}</p>
            </div>
            <div className={`${card} p-5`}>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="mt-3 text-2xl font-semibold">{sessions.filter((s) => s.status === 'COMPLETED').length}</p>
            </div>
            <div className={`${card} p-5`}>
              <p className="text-sm text-muted-foreground">Avg GD Score</p>
              <p className="mt-3 text-2xl font-semibold">
                {sessions.filter((s) => s.overallScore != null).length > 0
                  ? Math.round(sessions.filter((s) => s.overallScore != null).reduce((sum, s) => sum + (s.overallScore ?? 0), 0) / sessions.filter((s) => s.overallScore != null).length)
                  : '—'}
                {sessions.filter((s) => s.overallScore != null).length > 0 && <span className="text-sm text-muted-foreground">/100</span>}
              </p>
            </div>
          </div>
        )}

        {/* Session list */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-primary" /></div>
        ) : sessions.length === 0 ? (
          <div className={`${card} flex flex-col items-center gap-4 py-16 text-center`}>
            <div className="grid size-16 place-items-center rounded-2xl bg-primary/10">
              <Users className="size-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold">No GD sessions yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Start your first AI Group Discussion to practise speaking in a realistic placement GD environment.
              </p>
            </div>
            <button onClick={() => setScreen('setup')} className={button}>
              <Play className="size-4" />
              Start First GD
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`${card} flex flex-col gap-3 p-5 sm:flex-row sm:items-center`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{
                        background: s.status === 'COMPLETED' ? '#10b98120' : s.status === 'ABANDONED' ? '#ef444420' : '#f59e0b20',
                        color: s.status === 'COMPLETED' ? '#10b981' : s.status === 'ABANDONED' ? '#ef4444' : '#f59e0b',
                      }}
                    >
                      {s.status}
                    </span>
                    {s.overallScore != null && (
                      <span className="text-xs font-semibold text-primary">{s.overallScore.toFixed(0)}/100</span>
                    )}
                  </div>
                  <p className="truncate font-medium">{s.topic}</p>
                  <p className="text-xs text-muted-foreground">
                    Round {s.currentRound}/{s.totalRounds} · {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(s.status === 'INTRO' || s.status === 'IN_PROGRESS') && (
                    <button
                      onClick={() => handleResumeSession(s.id)}
                      className={outlineButton}
                    >
                      <Play className="size-4" /> Resume
                    </button>
                  )}
                  {s.status === 'COMPLETED' && (
                    <button
                      onClick={() => handleResumeSession(s.id)}
                      className={outlineButton}
                    >
                      <Eye className="size-4" /> View Results
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── SETUP screen ─────────────────────────────────────────────────────────────
  if (screen === 'setup') {
    return (
      <div className="flex flex-col gap-7">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreen('list')}
            className={outlineButton}
          >
            ← Back
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">New GD Session</p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Configure Your GD Room</h1>
          </div>
        </div>

        {/* Mode Selector */}
        <div className={`${card} p-6`}>
          <h2 className="mb-2 text-base font-semibold">Choose GD Mode</h2>
          <p className="mb-4 text-sm text-muted-foreground">Select your preferred discussion environment.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { id: 'AI_GD', label: '🤖 AI GD', desc: 'Candidate + 4 AI participants with distinct personas' },
              { id: 'REAL_MEMBER_GD', label: '👥 Real Member GD', desc: 'Live multiplayer room with real candidates (Preview)' },
              { id: 'MIXED_GD', label: '🔀 Mixed GD', desc: 'Candidate + Real members + AI personas' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSetupMode(m.id as any)}
                className={`flex flex-col text-left p-4 rounded-xl border transition ${
                  setupMode === m.id
                    ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary/30'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent'
                }`}
              >
                <span className="font-bold text-sm text-foreground">{m.label}</span>
                <span className="mt-1 text-xs">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Topic */}
          <div className={`${card} flex flex-col gap-5 p-6 lg:col-span-2`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">GD Topic</h2>
                <p className="text-sm text-muted-foreground">Type a custom topic or click &ldquo;Surprise Me&rdquo; for a fresh placement topic.</p>
              </div>
              <button
                type="button"
                onClick={handleSurpriseTopic}
                className={`${outlineButton} py-1.5 px-3 text-xs`}
              >
                <SparklesIcon className="size-3.5 text-primary" /> Surprise Me (Random Topic)
              </button>
            </div>
            <textarea
              id="gd-custom-topic"
              value={setupCustomTopic}
              onChange={(e) => setSetupCustomTopic(e.target.value)}
              placeholder="E.g. Will Artificial Intelligence Create More Jobs Than It Destroys? (Leave blank for random)"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={2}
              maxLength={300}
            />
          </div>

          {/* Rounds */}
          <div className={`${card} flex flex-col gap-4 p-6`}>
            <div>
              <h2 className="text-base font-semibold">Discussion Rounds</h2>
              <p className="text-sm text-muted-foreground">Number of discussion turns each participant gets.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[1, 3, 5, 8].map((n) => (
                <button
                  key={n}
                  onClick={() => setSetupRounds(n)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold border transition ${
                    setupRounds === n
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {n} {n === 1 ? 'Round (Quick)' : 'Rounds'}
                </button>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div className={`${card} flex flex-col gap-4 p-6`}>
            <div>
              <h2 className="text-base font-semibold">Group Size</h2>
              <p className="text-sm text-muted-foreground">Total participants including you.</p>
            </div>
            <div className="flex gap-2">
              {[4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setSetupParticipants(n)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold border transition ${
                    setupParticipants === n
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {n - 1} AI + You ({n} total)
                </button>
              ))}
            </div>
          </div>

          {/* 5 AI Personas Preview */}
          <div className={`${card} p-6 lg:col-span-2`}>
            <h2 className="mb-4 text-base font-semibold">AI Participant Personalities</h2>
            <div className="grid gap-3 sm:grid-cols-5">
              {[
                { name: 'Rahul', persona: 'Confident', desc: 'Bold claims, leads discussion, challenges opinions', color: '#3b82f6' },
                { name: 'Ananya', persona: 'Analytical', desc: 'Fact-focused, uses metrics & logical reasoning', color: '#10b981' },
                { name: 'Vikram', persona: 'Opposing', desc: 'Presents counter-views, stress-tests claims', color: '#ef4444' },
                { name: 'Priya', persona: 'Balanced', desc: 'Synthesizes viewpoints, seeks common ground', color: '#f59e0b' },
                { name: 'Rohan', persona: 'Quiet', desc: 'Speaks selectively, delivers concise insights', color: '#8b5cf6' },
              ].map((p) => (
                <div key={p.name} className="flex flex-col items-center text-center gap-2 rounded-xl border border-border p-3">
                  <div
                    className="size-10 grid place-items-center rounded-full font-bold text-white text-xs shadow-sm"
                    style={{ background: p.color }}
                  >
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{p.name}</p>
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: `${p.color}20`, color: p.color }}>
                      {p.persona}
                    </span>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-tight">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {createError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {createError}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button onClick={() => setScreen('list')} className={outlineButton}>Cancel</button>
          <button
            id="gd-start-btn"
            onClick={handleCreateSession}
            disabled={creating}
            className={`${button} min-w-[160px]`}
          >
            {creating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Preparing Room…</span>
              </>
            ) : (
              <>
                <Users className="size-4" />
                Start GD Room
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // ── ACTIVE VOICE-FIRST LIVE ROOM screen ──────────────────────────────────────
  if (screen === 'active' && activeSession) {
    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60)
      const s = secs % 60
      return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    return (
      <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 8rem)' }}>
        {/* Room Top Header Bar */}
        <div className={`${card} flex items-center justify-between gap-4 px-5 py-3 flex-shrink-0`}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex-shrink-0 grid size-9 place-items-center rounded-full bg-primary/10">
              <Radio className="size-4 text-primary animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold uppercase">
                  LIVE GD ROOM
                </span>
                <span className="text-xs text-muted-foreground font-mono">⏱ {formatTime(elapsedSeconds)}</span>
              </div>
              <p className="truncate font-semibold text-sm mt-0.5">{activeSession.topic}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs font-semibold text-muted-foreground">
              Round {activeSession.currentRound + 1}/{activeSession.totalRounds}
            </span>
            <button
              onClick={() => setShowTranscript((prev) => !prev)}
              className={`${outlineButton} py-1 px-3 text-xs`}
            >
              {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
            </button>
            <button
              onClick={handleAbandon}
              className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition"
              title="Leave Room"
            >
              <PhoneOff className="size-4" />
            </button>
          </div>
        </div>

        {/* Live Room Participant Grid Area */}
        <div className={`${card} p-6 flex flex-col items-center justify-center flex-shrink-0 bg-muted/20 relative overflow-hidden min-h-[220px]`}>
          <div className="mb-4 text-center">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {activeSpeakerName ? `🔊 ${activeSpeakerName} is speaking…` : animatingTurns ? 'AI Participants Responding…' : 'Microphone Ready — Speak your opinion'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {activeSession.participants.map((p) => {
              const isSpeaking = activeSpeakerName === p.name || (animatingTurns && p.type === 'AI')
              return (
                <div key={p.id} className="flex flex-col items-center gap-2">
                  <GDAvatar participant={p} size="lg" isSpeaking={isSpeaking} />
                  <div className="text-center">
                    <p className="text-xs font-bold">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.persona || (p.type === 'USER' ? 'Candidate (You)' : p.type)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Live Transcript / Speech Area */}
        {showTranscript && (
          <div className={`${card} flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 min-h-0`}>
            {visibleContributions.map((c, idx) => {
              const isUser = c.participantType === 'USER'
              const isModerator = c.participantType === 'MODERATOR'
              const participantObj = activeSession.participants.find((p) => p.id === c.participantId) || {
                name: c.participantName,
                type: c.participantType as 'USER' | 'AI' | 'MODERATOR',
                persona: c.participantPersona,
                avatarSeed: null,
              }
              const color = getParticipantColor(c.participantType, c.participantPersona)

              return (
                <div
                  key={c.id}
                  className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} ${isModerator ? 'justify-center' : ''}`}
                >
                  {!isModerator && <GDAvatar participant={participantObj} size="md" />}
                  <div className={`flex max-w-[80%] flex-col gap-1 ${isUser ? 'items-end' : 'items-start'} ${isModerator ? 'max-w-[85%] items-center w-full' : ''}`}>
                    {!isModerator && (
                      <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs font-semibold" style={{ color }}>{c.participantName}</span>
                        {c.participantPersona && c.participantPersona !== 'Candidate' && (
                          <span className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: `${color}20`, color }}>
                            {c.participantPersona}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">R{c.round}</span>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isUser
                          ? 'rounded-tr-sm bg-primary text-primary-foreground'
                          : isModerator
                          ? 'rounded-xl border border-border bg-muted text-muted-foreground text-center text-xs italic py-2 px-6'
                          : 'rounded-tl-sm border border-border bg-card'
                      }`}
                    >
                      {c.content}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* Live Voice Interaction Toolbar (§19 Mandatory) */}
        {!isCompleted && (
          <div className={`${card} p-4 flex flex-col gap-3 flex-shrink-0`}>
            {micNotice && (
              <p className="text-xs text-amber-400 font-medium text-center">{micNotice}</p>
            )}

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-bold text-xs transition ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-lg ring-4 ring-red-500/30'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="size-4" /> Stop Mic (Listening…)
                    </>
                  ) : (
                    <>
                      <Mic className="size-4" /> Speak into Mic
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setUseTextFallback((prev) => !prev)}
                  className={`${outlineButton} text-xs py-2 px-3`}
                >
                  {useTextFallback ? 'Hide Keyboard Input' : 'Type Response Instead'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSubmitContribution}
                  disabled={!contributionText.trim() || submitting || animatingTurns}
                  className={`${button} py-2 px-4 text-xs`}
                >
                  {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                  <span>Submit Turn</span>
                </button>
              </div>
            </div>

            {/* Transcript Preview / Editable Input Area */}
            {(useTextFallback || contributionText.length > 0) && (
              <div className="flex items-center gap-2 mt-1">
                <input
                  id="gd-live-input"
                  type="text"
                  value={contributionText}
                  onChange={(e) => setContributionText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !submitting && !animatingTurns && contributionText.trim()) {
                      handleSubmitContribution()
                    }
                  }}
                  placeholder="Spoken or typed response will appear here..."
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}
          </div>
        )}

        {submitError && (
          <p className="text-xs text-red-400 text-center">{submitError}</p>
        )}
      </div>
    )
  }

  // ── RESULT screen ─────────────────────────────────────────────────────────────
  if (screen === 'result' && activeSession) {
    const score = activeSession.overallScore ?? 0
    const scoreColor = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
    const scoreLabel = score >= 80 ? 'Outstanding GD Performance' : score >= 70 ? 'Strong Performance' : score >= 55 ? 'Good Effort' : 'Keep Practising'

    const allUserContribs = visibleContributions.filter((c) => c.participantType === 'USER')
    const bestMomentObj = allUserContribs.sort((a, b) => (b.evaluation?.overallScore ?? 0) - (a.evaluation?.overallScore ?? 0))[0]

    const allImprovements = Array.from(
      new Set(allUserEvals.flatMap((e) => e.improvements))
    ).slice(0, 4)
    const allStrengths = Array.from(
      new Set(allUserEvals.flatMap((e) => e.strengths))
    ).slice(0, 4)

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">GD Evaluation Complete</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Group Discussion Report</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setScreen('list'); setActiveSession(null); setVisibleContributions([]) }}
              className={outlineButton}
            >
              ← Back to Sessions
            </button>
            <button
              onClick={() => { setScreen('setup'); setActiveSession(null); setVisibleContributions([]) }}
              className={button}
            >
              <Users className="size-4" />
              New GD Room
            </button>
          </div>
        </div>

        {/* Score hero */}
        <div className={`${card} flex flex-col items-center gap-4 py-10 text-center`} style={{ background: `${scoreColor}08`, borderColor: `${scoreColor}30` }}>
          <div
            className="grid size-28 place-items-center rounded-full text-4xl font-bold text-white shadow-md"
            style={{ background: `conic-gradient(${scoreColor} ${score * 3.6}deg, #1e1e2e 0)` }}
          >
            <div className="grid size-20 place-items-center rounded-full bg-card">
              <span className="text-2xl font-bold" style={{ color: scoreColor }}>{score.toFixed(0)}</span>
            </div>
          </div>
          <div>
            <p className="text-xl font-semibold" style={{ color: scoreColor }}>{scoreLabel}</p>
            <p className="text-sm text-muted-foreground mt-1">Topic: {activeSession.topic}</p>
          </div>
          {activeSession.overallFeedback && (
            <p className="max-w-lg text-sm leading-6 text-muted-foreground italic px-4">
              &ldquo;{activeSession.overallFeedback}&rdquo;
            </p>
          )}
        </div>

        {/* Best Moment Highlight Card */}
        {bestMomentObj && (
          <div className={`${card} p-5 bg-primary/5 border-primary/20`}>
            <p className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <SparklesIcon className="size-4" /> Best Moment in Discussion
            </p>
            <blockquote className="mt-2 text-sm italic font-medium text-foreground">
              &ldquo;{bestMomentObj.content}&rdquo;
            </blockquote>
            {bestMomentObj.evaluation && (
              <p className="mt-2 text-xs text-muted-foreground">
                Evaluated Score: <span className="font-bold text-primary">{bestMomentObj.evaluation.overallScore}/100</span> — {bestMomentObj.evaluation.feedback}
              </p>
            )}
          </div>
        )}

        {/* Dimension scores */}
        <div className={`${card} p-6`}>
          <h2 className="mb-5 text-base font-semibold">Dimension Breakdown</h2>
          <div className="flex flex-col gap-4">
            <GDScoreBar label="Communication" value={Math.round(avgComm * 10) / 10} color="#3b82f6" />
            <GDScoreBar label="Relevance" value={Math.round(avgRel * 10) / 10} color="#10b981" />
            <GDScoreBar label="Depth of Analysis" value={Math.round(avgDepth * 10) / 10} color="#8b5cf6" />
            <GDScoreBar label="Leadership & Engagement" value={Math.round(avgLead * 10) / 10} color="#f59e0b" />
            <GDScoreBar label="Originality" value={Math.round(avgOrig * 10) / 10} color="#ef4444" />
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid gap-4 sm:grid-cols-2">
          {allStrengths.length > 0 && (
            <div className={`${card} p-5`}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <CheckCircle2 className="size-4" /> Key Strengths
              </h2>
              <ul className="flex flex-col gap-2">
                {allStrengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 size-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {allImprovements.length > 0 && (
            <div className={`${card} p-5`}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-400">
                <Lightbulb className="size-4" /> Areas to Improve
              </h2>
              <ul className="flex flex-col gap-2">
                {allImprovements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 size-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

const AVAILABLE_ROLES = [
  { slug: 'software-engineer', name: 'Software Engineer' },
  { slug: 'frontend-developer', name: 'Frontend Developer' },
  { slug: 'backend-developer', name: 'Backend Developer' },
  { slug: 'full-stack-developer', name: 'Full Stack Developer' },
  { slug: 'data-analyst', name: 'Data Analyst' },
  { slug: 'data-scientist', name: 'Data Scientist' },
  { slug: 'ai-ml-engineer', name: 'AI/ML Engineer' },
  { slug: 'devops-engineer', name: 'DevOps Engineer' },
  { slug: 'mobile-developer', name: 'Mobile Developer' },
  { slug: 'qa-engineer', name: 'QA Engineer' },
  { slug: 'cybersecurity-analyst', name: 'Cybersecurity Analyst' },
  { slug: 'product-analyst', name: 'Product Analyst' },
]

function CompanyPrepView() {
  const router = useRouter()
  const [plans, setPlans] = useState<any[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [catalog, setCatalog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  // Modal Form state
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [customCompanyName, setCustomCompanyName] = useState<string>('')
  const [targetRoleSlug, setTargetRoleSlug] = useState<string>('software-engineer')
  const [experienceLevel, setExperienceLevel] = useState<string>('FRESHER')
  const [preparationGoal, setPreparationGoal] = useState<string>('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [plansRes, catRes] = await Promise.all([
        fetch('/api/company-preparation'),
        fetch('/api/companies?limit=30'),
      ])
      if (plansRes.ok) {
        const pData = await plansRes.json()
        setPlans(pData.plans || [])
        if (pData.plans?.length > 0 && !selectedPlanId) {
          setSelectedPlanId(pData.plans[0].id)
        }
      }
      if (catRes.ok) {
        const cData = await catRes.json()
        setCatalog(cData.companies || [])
        if (cData.companies?.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(cData.companies[0].id)
        }
      }
    } catch (e) {
      console.error('Failed to load company preparation data:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePlan() {
    setSubmitting(true)
    try {
      const payload: any = {
        targetRoleSlug,
        experienceLevel,
        preparationGoal: preparationGoal || undefined,
      }
      if (selectedCompanyId === 'custom') {
        if (!customCompanyName.trim()) {
          alert('Please enter a company name')
          setSubmitting(false)
          return
        }
        payload.customCompanyName = customCompanyName.trim()
      } else {
        payload.companyId = selectedCompanyId
      }

      const res = await fetch('/api/company-preparation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        setShowModal(false)
        await fetchData()
        if (data.plan) {
          setSelectedPlanId(data.plan.id)
        }
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to create plan')
      }
    } catch (e) {
      console.error('Create plan error:', e)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAdvanceStage(planId: string, currentStage: number) {
    try {
      const res = await fetch(`/api/company-preparation/${planId}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetStage: Math.min(12, currentStage + 1) }),
      })
      if (res.ok) {
        await fetchData()
      }
    } catch (e) {
      console.error('Advance stage error:', e)
    }
  }

  const activePlan = plans.find((p) => p.id === selectedPlanId) || plans[0]
  const planData = activePlan?.planData || {}
  const metrics = activePlan?.metrics || {}
  const stages = planData.stages || []
  const focusAreas = planData.companyFocusAreas || []

  const filteredCatalog = catalog.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Stage 18 Engine</span>
            <span className="text-xs text-muted-foreground">• Dynamic & Evidence-Based</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Company-Wise Preparation Engine</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Target specific companies with tailored aptitude, DSA, core CS, mock interviews, and group discussions.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className={button}>
          <Building2 className="mr-2 size-4" /> New Preparation Path
        </button>
      </section>

      {/* Plans Navigation Bar */}
      {plans.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto border-b border-border pb-3">
          {plans.map((p) => {
            const name = p.customCompanyName || p.company?.name || 'Target Company'
            const isSel = p.id === activePlan?.id
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg border px-3.5 py-2 text-sm font-semibold transition ${
                  isSel
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent'
                }`}
              >
                <Building2 className="size-4" />
                <span>{name}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold">
                  {p.targetRoleSlug.replace('-', ' ')}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin text-primary" /> Loading company preparation plans…
        </div>
      ) : !activePlan ? (
        /* Empty State */
        <div className={`${card} p-12 text-center`}>
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Building2 className="size-7" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">No Company Preparation Path Selected</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Select a target company like TCS, Infosys, Amazon, Google, or enter your target startup to generate a 12-stage customized preparation roadmap.
          </p>
          <button onClick={() => setShowModal(true)} className={`${button} mt-6`}>
            <Building2 className="mr-2 size-4" /> Start Company Preparation
          </button>
        </div>
      ) : (
        /* Active Plan View */
        <div className="flex flex-col gap-8">
          {/* Company Overview & Readiness Card */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Info */}
            <div className={`${card} p-6 lg:col-span-2 flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-lg">
                      {(activePlan.customCompanyName || activePlan.company?.name || 'C')[0]}
                    </span>
                    <div>
                      <h2 className="text-xl font-semibold">
                        {activePlan.customCompanyName || activePlan.company?.name || 'Custom Target Company'}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {activePlan.company?.industry || 'Technology & Software'} • {activePlan.targetRoleSlug.toUpperCase()} ({activePlan.experienceLevel})
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      planData.dataSourceType === 'VERIFIED'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}
                  >
                    {planData.dataSourceType || 'COMMONLY_REPORTED'}
                  </span>
                </div>
                <p className="mt-4 text-xs italic text-muted-foreground border-l-2 border-primary/40 pl-3 py-1">
                  &ldquo;{metrics.confidenceDisclaimer || 'General preparation guidance for this company and role. Actual hiring processes vary.'}&rdquo;
                </p>

                {/* Company Focus Areas */}
                <div className="mt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company Priority Focus Areas</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {focusAreas.map((fa: any, idx: number) => (
                      <span key={idx} className="rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium">
                        {fa.skillName} <span className="ml-1 font-bold text-primary">({fa.confidence || 'COMMONLY_REPORTED'})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span>Stage {activePlan.currentStage} of 12</span>
                <button
                  onClick={() => handleAdvanceStage(activePlan.id, activePlan.currentStage)}
                  className="font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  Advance to Stage {Math.min(12, activePlan.currentStage + 1)} <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Evidence-Based Readiness Gauge */}
            <div className={`${card} p-6 flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Company Readiness</h3>
                  <Target className="size-4 text-primary" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight">
                    {activePlan.readinessScore !== null ? `${activePlan.readinessScore}%` : 'N/A'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {activePlan.readinessScore !== null ? 'Evidence-based' : 'Not enough data yet'}
                  </span>
                </div>
                <ProgressBar value={activePlan.readinessScore || 15} />

                {/* Missing evidence list */}
                <div className="mt-4 flex flex-col gap-1.5 text-xs">
                  {metrics.missingEvidence && metrics.missingEvidence.length > 0 ? (
                    metrics.missingEvidence.map((ev: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-amber-500">
                        <AlertCircle className="size-3.5 shrink-0" />
                        <span className="truncate">{ev}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-500">
                      <CheckCircle2 className="size-3.5 shrink-0" />
                      <span>Sufficient evidence collected across all dimensions</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs border-t border-border pt-4">
                <div className="rounded-lg bg-muted p-2">
                  <span className="block font-bold">{metrics.quizAccuracyAvg || 0}%</span>
                  <span className="text-[10px] text-muted-foreground">Quiz Accuracy</span>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <span className="block font-bold">{metrics.codingAcceptanceCount || 0} Solved</span>
                  <span className="text-[10px] text-muted-foreground">Coding</span>
                </div>
              </div>
            </div>
          </div>

          {/* 12-Stage Interactive Roadmap */}
          <section className={`${card} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">12-Stage Company Preparation Roadmap</h2>
                <p className="text-xs text-muted-foreground">Sequential path tailored to {activePlan.customCompanyName || activePlan.company?.name || 'Company'} & {activePlan.targetRoleSlug}</p>
              </div>
              <span className="text-xs font-semibold text-primary">
                {stages.filter((s: any) => s.isCompleted).length} / 12 Completed
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              {stages.map((stg: any) => {
                const isCurrent = stg.stageNumber === activePlan.currentStage
                const isCompleted = stg.isCompleted || stg.stageNumber < activePlan.currentStage

                return (
                  <div
                    key={stg.stageNumber}
                    className={`rounded-xl border p-4 transition ${
                      isCurrent
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : isCompleted
                        ? 'border-border bg-card opacity-90'
                        : 'border-border/60 bg-muted/30 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <span
                          className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isCompleted
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? <Check className="size-4" /> : stg.stageNumber}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm">{stg.title}</h3>
                            <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                              {stg.category}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{stg.description}</p>

                          {/* Recommended Actions */}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {stg.recommendedActions?.map((act: string, aIdx: number) => (
                              <span key={aIdx} className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground/80 bg-background border border-border rounded px-2 py-0.5">
                                • {act}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Links */}
                      <div className="flex shrink-0 flex-col gap-1.5 items-end">
                        {stg.category === 'APTITUDE' && (
                          <Link href="/quizzes" className={`${button} py-1 px-3 text-xs`}>
                            <BrainCircuit className="size-3.5 mr-1" /> Practice Aptitude
                          </Link>
                        )}
                        {stg.category === 'CORE_CS' && (
                          <Link href="/preparation" className={`${outlineButton} py-1 px-3 text-xs`}>
                            <BookOpen className="size-3.5 mr-1" /> Core CS Topics
                          </Link>
                        )}
                        {stg.category === 'CODING' && (
                          <Link href="/coding" className={`${button} py-1 px-3 text-xs`}>
                            <Code2 className="size-3.5 mr-1" /> Coding Engine
                          </Link>
                        )}
                        {stg.category === 'TUTOR' && (
                          <Link href="/tutor" className={`${outlineButton} py-1 px-3 text-xs`}>
                            <MessageSquareText className="size-3.5 mr-1" /> Launch AI Tutor
                          </Link>
                        )}
                        {stg.category === 'INTERVIEW' && (
                          <Link href="/interview" className={`${button} py-1 px-3 text-xs`}>
                            <Video className="size-3.5 mr-1" /> Mock Interview
                          </Link>
                        )}
                        {stg.category === 'GD' && (
                          <Link href="/gd" className={`${outlineButton} py-1 px-3 text-xs`}>
                            <Users className="size-3.5 mr-1" /> Group Discussion
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {/* Company Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-semibold">Create Company Preparation Path</h2>
                <p className="text-xs text-muted-foreground">Select target company, role, and experience level</p>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 hover:bg-accent">
                <X className="size-5" />
              </button>
            </div>

            {/* Company Search & Selection */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">1. Select Target Company</label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search catalog (TCS, Infosys, Amazon, Google...)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                {filteredCatalog.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCompanyId(c.id)
                      setCustomCompanyName('')
                    }}
                    className={`flex flex-col text-left rounded-lg border p-3 transition ${
                      selectedCompanyId === c.id
                        ? 'border-primary bg-primary/10 ring-1 ring-primary'
                        : 'border-border bg-background hover:border-primary/50'
                    }`}
                  >
                    <span className="font-semibold text-xs truncate">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{c.industry}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedCompanyId('custom')}
                  className={`flex flex-col text-left rounded-lg border p-3 transition ${
                    selectedCompanyId === 'custom'
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border bg-background hover:border-primary/50'
                  }`}
                >
                  <span className="font-semibold text-xs text-primary">+ Other Company</span>
                  <span className="text-[10px] text-muted-foreground">General Guidance Mode</span>
                </button>
              </div>

              {selectedCompanyId === 'custom' && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Enter custom company name (e.g. Acme Tech)"
                    value={customCompanyName}
                    onChange={(e) => setCustomCompanyName(e.target.value)}
                    maxLength={60}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
            </div>

            {/* Target Role & Experience */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">2. Target Role</label>
                <select
                  value={targetRoleSlug}
                  onChange={(e) => setTargetRoleSlug(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {AVAILABLE_ROLES.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">3. Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="STUDENT">College Student</option>
                  <option value="FRESHER">Fresher (0-1 yrs)</option>
                  <option value="ENTRY_LEVEL">Entry Level (1-2 yrs)</option>
                  <option value="EXPERIENCED">Experienced (3+ yrs)</option>
                  <option value="CAREER_SWITCHER">Career Switcher</option>
                </select>
              </div>
            </div>

            {/* Preparation Goal */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">4. Preparation Goal (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Preparing for upcoming campus drive or off-campus assessment"
                value={preparationGoal}
                onChange={(e) => setPreparationGoal(e.target.value)}
                maxLength={200}
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button type="button" onClick={() => setShowModal(false)} className={outlineButton}>
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleCreatePlan}
                className={button}
              >
                {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                Generate Preparation Path
              </button>
            </div>
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

  // Global cleanup effect to stop SpeechSynthesis audio on navigation between tabs
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
      } catch {}
    }
  }, [pathname])

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
        } else {
          setUser(null)
          if (pathname !== '/' && pathname !== '/privacy' && pathname !== '/terms' && !pathname.startsWith('/share/')) {
            const loginUrl = `/login?from=${encodeURIComponent(pathname)}`
            router.push(loginUrl)
          }
        }
      })
      .catch(() => {
        setUser(null)
      })
  }, [auth, unauthPage, pathname, router])

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
  if (pathname === '/') {
    if (!user) return <LandingPage />
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
              <Dashboard />
            </main>
            <footer className="border-t border-border px-5 py-4 md:px-8">
              <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>© {new Date().getFullYear()} INTERVUE AI</span>
                <div className="flex items-center gap-4">
                  <Link href="/privacy" className="hover:text-foreground transition">Privacy Policy</Link>
                  <Link href="/terms" className="hover:text-foreground transition">Terms of Service</Link>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    )
  }

  const page =
    pathname === '/preparation' ? <Preparation /> :
    pathname === '/role-prep'   ? <RolePreparationView /> :
    pathname === '/company-prep'? <CompanyPrepView /> :
    pathname === '/tutor'       ? <Tutor /> :
    pathname === '/quizzes'     ? <Quizzes /> :
    pathname === '/coding'      ? <Coding /> :
    pathname === '/interview'   ? <Interview /> :
    pathname === '/gd'          ? <GroupDiscussion /> :
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
          <footer className="border-t border-border px-5 py-4 md:px-8">
            <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>© {new Date().getFullYear()} INTERVUE AI</span>
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="hover:text-foreground transition">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-foreground transition">Terms of Service</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
