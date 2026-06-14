import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { Target, Loader2, AlertTriangle, Calendar, TrendingUp, Zap, Clock, CheckCircle, ChevronRight, Play } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const API_URL = 'http://localhost:8000'

const urgencyColors: Record<string, string> = {
  Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e',
}
const urgencyBg: Record<string, string> = {
  Critical: 'rgba(239,68,68,0.1)', High: 'rgba(249,115,22,0.1)', Medium: 'rgba(234,179,8,0.1)', Low: 'rgba(34,197,94,0.1)',
}

const DEMO_USERS = [
  { name: 'Alex Chen', role: 'Engineering Lead' },
  { name: 'Sarah Kim', role: 'Product Manager' },
  { name: 'Priya Sharma', role: 'QA Engineer' },
  { name: 'Jordan Lee', role: 'DevOps Engineer' },
]

export default function FocusPage() {
  const { addToast } = useToast()
  const [name, setName] = useState('Alex Chen')
  const [role, setRole] = useState('Engineering Lead')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [completedPriorities, setCompletedPriorities] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState<'priorities' | 'insights' | 'meetings'>('priorities')

  const getBriefing = async () => {
    if (!name.trim()) { addToast('warning', 'Name required', 'Please enter your name first.'); return }
    setLoading(true)
    setResult(null)
    setCompletedPriorities(new Set())
    try {
      const res = await axios.post(`${API_URL}/api/focus/briefing`, { user_name: name, role })
      setResult(res.data)
      addToast('success', 'Briefing ready!', `Your personalized AI brief for ${name} is ready.`)
    } catch {
      setResult(getDemoBriefing(name, role))
      addToast('info', 'Demo mode', 'Showing AI-generated sample briefing.')
    } finally {
      setLoading(false)
    }
  }

  const togglePriority = (i: number) => {
    setCompletedPriorities(prev => {
      const n = new Set(prev)
      if (n.has(i)) { n.delete(i) } else {
        n.add(i)
        addToast('success', 'Priority complete! 🎯', `Great work! Moving to the next priority.`)
      }
      return n
    })
  }

  const b = result?.briefing
  const completedCount = completedPriorities.size
  const totalPriorities = b?.top_priorities.length || 0

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="agent-tag"><Target size={12} /> Focus Agent</div>
        <h1 className="page-title">Daily Focus Briefing</h1>
        <p className="page-subtitle">Your AI-curated morning intelligence. The Focus Agent pulls from Microsoft Teams, Outlook, and Azure DevOps to rank exactly what needs your attention — and why.</p>
      </div>

      {/* Input + Quick select */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Your Name</label>
            <input id="input-focus-name" className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Role</label>
            <input id="input-focus-role" className="input" value={role} onChange={e => setRole(e.target.value)} placeholder="Your role" />
          </div>
        </div>

        {/* Quick profile selector */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 7 }}>Quick select team member:</div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {DEMO_USERS.map(u => (
              <button key={u.name} id={`quick-user-${u.name.split(' ')[0].toLowerCase()}`}
                onClick={() => { setName(u.name); setRole(u.role) }}
                style={{ padding: '5px 12px', background: name === u.name ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.04)', border: `1px solid ${name === u.name ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 100, fontSize: 12, color: name === u.name ? '#a78bfa' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: name === u.name ? 600 : 400, transition: 'all 0.15s' }}>
                {u.name}
              </button>
            ))}
          </div>
        </div>

        <motion.button id="btn-get-briefing" className="btn btn-primary"
          onClick={getBriefing} disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
          style={{ width: '100%', justifyContent: 'center', fontSize: 14 }}>
          {loading
            ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Generating briefing...</>
            : <><Play size={15} /> Generate My AI Briefing</>}
        </motion.button>
      </div>

      {/* Briefing output */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card" style={{ textAlign: 'center', padding: 52 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'glow-pulse 2s ease-in-out infinite' }}>
              <Target size={24} color="white" />
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Focus Agent working...</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Pulling from Teams · Outlook · Azure DevOps · Knowledge Graph</div>
          </motion.div>
        )}

        {result && !loading && (
          <motion.div key="result" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            {/* Morning greeting */}
            <div style={{ padding: '22px 26px', marginBottom: 20, borderRadius: 16, background: 'linear-gradient(135deg,rgba(37,99,235,0.15),rgba(124,58,237,0.1))', border: '1px solid rgba(124,58,237,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>☀️ {b.good_morning_message}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Sources: {result.data_sources.join(' · ')}</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
                  {[
                    { v: b.focus_score, l: 'Focus Score', c: '#a78bfa' },
                    { v: b.overdue_tasks, l: 'Overdue', c: '#f87171' },
                    { v: `${b.focus_time_available}`, l: 'Focus Time', c: '#60a5fa' },
                  ].map(s => (
                    <div key={s.l} style={{ textAlign: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 11 }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: s.c }}>{s.v}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Progress */}
              {totalPriorities > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    <span>Priority completion</span>
                    <span style={{ color: completedCount === totalPriorities ? '#4ade80' : 'var(--text-secondary)', fontWeight: 600 }}>{completedCount}/{totalPriorities} done</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${(completedCount / totalPriorities) * 100}%` }} transition={{ duration: 0.5 }} />
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4, width: 'fit-content', border: '1px solid rgba(255,255,255,0.06)' }}>
              {(['priorities', 'insights', 'meetings'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding: '7px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: activeTab === tab ? 'rgba(124,58,237,0.25)' : 'transparent', color: activeTab === tab ? '#a78bfa' : 'var(--text-secondary)', transition: 'all 0.15s', textTransform: 'capitalize' }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === 'priorities' && (
                <motion.div key="priorities" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {b.top_priorities.map((p: any, i: number) => {
                      const done = completedPriorities.has(i)
                      return (
                        <motion.div key={i} onClick={() => togglePriority(i)} whileHover={{ x: 2 }}
                          style={{ padding: '16px 18px', borderRadius: 12, background: done ? 'rgba(5,150,105,0.06)' : i === 0 ? 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(37,99,235,0.07))' : 'rgba(255,255,255,0.03)', border: `1px solid ${done ? 'rgba(5,150,105,0.2)' : i === 0 ? 'rgba(124,58,237,0.28)' : 'rgba(255,255,255,0.06)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${done ? '#4ade80' : urgencyColors[p.urgency]}`, background: done ? '#4ade80' : urgencyBg[p.urgency], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.2s' }}>
                              {done ? <CheckCircle size={12} color="#030712" /> : <span style={{ fontSize: 9, fontWeight: 800, color: urgencyColors[p.urgency] }}>#{p.rank}</span>}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                                <span style={{ fontSize: 13.5, fontWeight: 600, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.5 : 1, transition: 'all 0.2s' }}>{p.task}</span>
                                <span className={`badge badge-${p.urgency.toLowerCase()}`} style={{ flexShrink: 0 }}>{p.urgency}</span>
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>💡 {p.reason}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={10} /> Est. {p.estimated_time}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                    {completedCount === totalPriorities && totalPriorities > 0 && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        style={{ padding: '18px', textAlign: 'center', background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 12 }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>🎉</div>
                        <div style={{ fontWeight: 700, color: '#4ade80', fontSize: 15 }}>All priorities completed!</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Exceptional focus today. The Focus Agent will refresh tomorrow's briefing automatically.</div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
              {activeTab === 'insights' && (
                <motion.div key="insights" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={15} color="#06b6d4" /> AI Insights</div>
                    {b.insights.map((insight: string, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        style={{ padding: '12px 14px', background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.12)', borderRadius: 9, marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {insight}
                      </motion.div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>📣 Team Updates</div>
                    {b.team_updates.map((u: any, i: number) => {
                      const c = { positive: '#4ade80', blocker: '#f87171', info: '#60a5fa' }[u.type as string] || '#94a3b8'
                      const icon = { positive: '✅', blocker: '🚨', info: 'ℹ️' }[u.type as string] || '•'
                      return (
                        <div key={i} style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 8, fontSize: 13, background: `${c}08`, border: `1px solid ${c}18`, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {icon} {u.update}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
              {activeTab === 'meetings' && (
                <motion.div key="meetings" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={15} color="#f97316" /> Today's Schedule</div>
                  {b.meetings_today.map((m: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 11, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📅</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{m.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{m.time} · {m.duration}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {m.prep_needed && (
                          <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px', color: '#facc15', border: '1px solid rgba(234,179,8,0.2)', background: 'rgba(234,179,8,0.05)' }}
                            onClick={() => addToast('info', 'Prep reminder set', `You'll be reminded 15 min before ${m.title}.`)}>
                            <Zap size={10} /> Prep needed
                          </button>
                        )}
                        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </motion.div>
                  ))}
                  {b.meetings_today.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)', fontSize: 13 }}>
                      🎉 No meetings today — a perfect day for deep focus!
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card"
          style={{ textAlign: 'center', padding: 56, border: '1px dashed var(--border-glass)' }}>
          <Target size={38} style={{ color: 'var(--text-muted)', margin: '0 auto 14px' }} />
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Your AI Briefing Awaits</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 380, margin: '0 auto', lineHeight: 1.6 }}>
            Select a team member or enter your name and click Generate. The Focus Agent will pull real-time context from across your Microsoft 365 workspace.
          </div>
        </motion.div>
      )}
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function getDemoBriefing(name: string, role: string) {
  return {
    agent: 'Focus', user: name, role,
    data_sources: ['Microsoft Teams', 'Outlook Calendar', 'Azure DevOps', 'Microsoft Graph API'],
    briefing: {
      good_morning_message: `Good morning, ${name}! 3 critical items need your attention before noon.`,
      focus_score: 78, overdue_tasks: 2, focus_time_available: '2.5h',
      top_priorities: [
        { rank: 1, task: 'Review and approve the Azure AD B2C architecture proposal', reason: 'Blocking 3 team members. Decision needed by 10am.', estimated_time: '25 mins', urgency: 'Critical' },
        { rank: 2, task: "Respond to Sarah's message about the Q3 budget allocation", reason: '48-hour SLA breach in 2 hours. Cross-team dependency.', estimated_time: '10 mins', urgency: 'High' },
        { rank: 3, task: 'Finalize the sprint retrospective doc for stakeholder review', reason: 'Stakeholder meeting at 2pm requires this as pre-read.', estimated_time: '40 mins', urgency: 'High' },
      ],
      team_updates: [
        { update: 'Alex Chen completed the OAuth flow setup — 1 day ahead of schedule!', type: 'positive' },
        { update: 'QA environment is still unstable. Jordan Lee is investigating.', type: 'blocker' },
        { update: 'New Jira ticket #847 assigned to your team by Product.', type: 'info' },
      ],
      meetings_today: [
        { title: 'Sprint Planning Q3', time: '10:00 AM', duration: '60 min', prep_needed: true },
        { title: '1:1 with Engineering Lead', time: '2:00 PM', duration: '30 min', prep_needed: false },
      ],
      insights: [
        "⚡ You're 23% more productive on Tuesdays — schedule deep work now.",
        '🔗 3 decisions from last week are still pending follow-up.',
        "📈 Your team's velocity increased 15% this sprint.",
      ],
    }
  }
}
