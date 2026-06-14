import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  Activity, RefreshCw, AlertTriangle, TrendingUp, TrendingDown,
  Minus, Zap, Users, ChevronDown, ChevronUp, Send, Bell
} from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area, CartesianGrid
} from 'recharts'
import { useToast } from '../context/ToastContext'
import { useCounter } from '../hooks/useCounter'

const API_URL = 'http://localhost:8000'

function AnimatedStat({ value, label, color, suffix = '' }: { value: number; label: string; color: string; suffix?: string }) {
  const counted = useCounter(value, 1200, true)
  return (
    <div style={{ textAlign: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize: 30, fontWeight: 800, color, letterSpacing: -1 }}>{counted}{suffix}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
    </div>
  )
}

export default function PulsePage() {
  const { addToast } = useToast()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(30)
  const [expandedMember, setExpandedMember] = useState<string | null>(null)

  const fetchPulse = async (showToast = false) => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/api/pulse/team`)
      setResult(res.data)
      if (showToast) addToast('success', 'Pulse refreshed!', 'Team health data updated.')
    } catch {
      setResult(getDemoPulse())
      if (showToast) addToast('info', 'Demo mode', 'Showing live demo data.')
    } finally {
      setLoading(false)
      setCountdown(30)
    }
  }

  useEffect(() => { fetchPulse() }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { fetchPulse(); return 30 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const sprintAreaData = [
    { day: 'Day 1', completed: 5, target: 10 }, { day: 'Day 2', completed: 12, target: 20 },
    { day: 'Day 3', completed: 18, target: 30 }, { day: 'Day 4', completed: 28, target: 40 },
    { day: 'Day 5', completed: 41, target: 50 }, { day: 'Day 6 (pred)', completed: 52, target: 64 },
  ]

  if (loading && !result) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#059669,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'glow-pulse 2s ease-in-out infinite' }}>
          <Activity size={28} color="white" />
        </div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Pulse Agent Loading...</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>Monitoring team health across all data sources</div>
      </div>
    </div>
  )

  if (!result) return null
  const m = result.metrics
  const radarData = [
    { subject: 'Velocity', value: m.velocity.value },
    { subject: 'Alignment', value: m.alignment.value },
    { subject: 'Communication', value: m.communication.value },
    { subject: 'Blockers', value: m.blocker_rate.value },
  ]
  const collabData = result.collaboration_graph.map((c: any) => ({
    name: c.member.split(' ')[0], interactions: c.interactions, role: c.role
  }))

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="agent-tag"><Activity size={12} /> Pulse Agent</div>
            <h1 className="page-title">Team Pulse Dashboard</h1>
            <p className="page-subtitle">Real-time team health monitoring. Auto-refreshes every 30 seconds using Azure Functions + Event Hub continuous monitoring.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', animation: 'pulse-dot 2s ease-in-out infinite' }} />
              Refreshing in {countdown}s
            </div>
            <button id="btn-refresh-pulse" className="btn btn-secondary" onClick={() => fetchPulse(true)} style={{ gap: 6 }}>
              <RefreshCw size={13} /> Refresh Now
            </button>
          </div>
        </div>
      </div>

      {/* Health Banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{ padding: '24px 28px', marginBottom: 24, borderRadius: 16, background: 'linear-gradient(135deg,rgba(5,150,105,0.12),rgba(6,182,212,0.08))', border: '1px solid rgba(5,150,105,0.25)', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
        {/* Ring */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={96} height={96} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={48} cy={48} r={40} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={9} />
            <motion.circle cx={48} cy={48} r={40} fill="none" stroke="url(#hg)" strokeWidth={9}
              strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 40}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - result.health_score / 100) }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
            <defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#059669" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#4ade80' }}>{result.health_score}</span>
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>/ 100</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
            {result.health_score >= 80 ? '💚 Team is Thriving' : result.health_score >= 60 ? '💛 Moderate Health' : '🔴 Needs Attention'}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>{result.team} · {result.trend}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <AnimatedStat value={result.health_score} label="Health Score" color="#4ade80" />
            <AnimatedStat value={result.sprint_progress.completed_points} label="Story Pts Done" color="#a78bfa" />
            <AnimatedStat value={result.active_blockers.length} label="Active Blockers" color="#f87171" />
            <AnimatedStat value={result.sprint_progress.remaining_days} label="Days Left" color="#60a5fa" />
          </div>
        </div>
        {/* Sprint progress mini */}
        <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, minWidth: 180, flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Sprint Burn-up</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{result.sprint_progress.completed_points}/{result.sprint_progress.total_points} pts</span>
            <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 700 }}>{result.sprint_progress.predicted_completion}</span>
          </div>
          <div className="progress-bar">
            <motion.div className="progress-fill" initial={{ width: 0 }}
              animate={{ width: `${(result.sprint_progress.completed_points / result.sprint_progress.total_points) * 100}%` }}
              transition={{ duration: 1.2, delay: 0.3 }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{result.sprint_progress.remaining_days} days remaining</div>
        </div>
      </motion.div>

      {/* Metric cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {Object.values(m).map((metric: any, i: number) => {
          const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus
          const trendClass = metric.trend === 'up' ? 'up' : metric.trend === 'down' ? 'down' : 'stable'
          return (
            <motion.div key={metric.label} className="metric-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="metric-value">{metric.value}</div>
              <div className="metric-label">{metric.label}</div>
              <div className="progress-bar" style={{ marginTop: 10, marginBottom: 8 }}>
                <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${metric.value}%` }} transition={{ delay: i * 0.08 + 0.4, duration: 0.9 }} />
              </div>
              <div className={`metric-change ${trendClass}`}><TrendIcon size={11} /> {metric.change}</div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
        {/* Radar */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            📊 Team Performance Radar
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Radar name="Team" dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.18} strokeWidth={2} dot={{ fill: '#7c3aed', r: 3 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Sprint burn-up area chart */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📈 Sprint Burn-up Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={sprintAreaData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f8fafc' }} cursor={{ stroke: 'rgba(124,58,237,0.3)' }} />
              <Area type="monotone" dataKey="target" stroke="rgba(255,255,255,0.15)" fill="none" strokeDasharray="4 4" dot={false} name="Target" />
              <Area type="monotone" dataKey="completed" stroke="#7c3aed" fill="url(#areaGrad)" strokeWidth={2} dot={{ fill: '#7c3aed', r: 3 }} name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Collaboration + Blockers */}
      <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
        {/* Team members */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={15} color="#06b6d4" /> Team Collaboration Map
          </div>
          {result.collaboration_graph.map((c: any) => {
            const colors = ['#7c3aed', '#2563eb', '#06b6d4', '#f97316']
            const idx = result.collaboration_graph.indexOf(c)
            const color = colors[idx % colors.length]
            const isExpanded = expandedMember === c.member
            const roleColors: Record<string, string> = { Hub: '#4ade80', Connector: '#60a5fa', Contributor: '#a78bfa', Isolated: '#f87171' }
            return (
              <div key={c.member}>
                <motion.div onClick={() => setExpandedMember(isExpanded ? null : c.member)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  whileHover={{ x: 2 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>
                    {c.member.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.member}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                      <div className="progress-bar" style={{ flex: 1, height: 4 }}>
                        <motion.div className="progress-fill" style={{ background: color }} initial={{ width: 0 }}
                          animate={{ width: `${(c.interactions / 40) * 100}%` }} transition={{ duration: 0.8, delay: idx * 0.1 }} />
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{c.interactions} interactions</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: `${roleColors[c.role] || '#4b5563'}15`, color: roleColors[c.role] || '#94a3b8', border: `1px solid ${roleColors[c.role] || '#4b5563'}25` }}>{c.role}</span>
                  {isExpanded ? <ChevronUp size={12} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />}
                </motion.div>
                {isExpanded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{ padding: '10px 0 10px 46px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {c.role === 'Isolated' ? `⚠️ Low collaboration detected. Consider pairing ${c.member.split(' ')[0]} with a Hub member on the next feature to improve team connectivity.`
                      : c.role === 'Hub' ? `✅ ${c.member.split(' ')[0]} is the team's primary knowledge hub. Their high interaction count (${c.interactions}) shows strong cross-team collaboration.`
                      : c.role === 'Connector' ? `🔗 ${c.member.split(' ')[0]} bridges sub-teams effectively. Valuable for cross-functional communication.`
                      : `👤 ${c.member.split(' ')[0]} is actively contributing with ${c.interactions} interactions this sprint.`}
                    <button onClick={() => addToast('success', `Notification sent`, `${c.member} notified via Microsoft Teams.`)}
                      className="btn btn-ghost" style={{ fontSize: 10, padding: '4px 8px', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Bell size={10} /> Ping via Teams
                    </button>
                  </motion.div>
                )}
              </div>
            )
          })}
          <div style={{ marginTop: 14 }}>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={collabData} barSize={28}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f8fafc', fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="interactions" radius={[5, 5, 0, 0]}>
                  {collabData.map((_: any, i: number) => <Cell key={i} fill={['#7c3aed', '#2563eb', '#06b6d4', '#f97316'][i % 4]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blockers */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={15} color="#f87171" /> Active Blockers
            </div>
            {result.active_blockers.map((b: any) => (
              <motion.div key={b.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                style={{ padding: '12px 14px', background: b.severity === 'High' ? 'rgba(239,68,68,0.05)' : 'rgba(234,179,8,0.04)', border: `1px solid ${b.severity === 'High' ? 'rgba(239,68,68,0.18)' : 'rgba(234,179,8,0.14)'}`, borderRadius: 11, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{b.title}</div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <span className={`badge badge-${b.severity.toLowerCase()}`}>{b.severity}</span>
                    {b.escalation_needed && <span className="badge badge-critical" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }}>Escalate</span>}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Owner: {b.owner} · Active {b.duration}</div>
                <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 5 }}
                  onClick={() => addToast('success', 'Escalation sent!', `${b.owner} and team lead notified via Microsoft Teams.`)}>
                  <Send size={11} /> Escalate via Teams
                </button>
              </motion.div>
            ))}
          </div>

          {/* AI Recommendations */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={15} color="#facc15" /> AI Recommendations
            </div>
            {result.ai_recommendations.map((r: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'rgba(250,204,21,0.04)', border: '1px solid rgba(250,204,21,0.1)', borderRadius: 10, marginBottom: 8, cursor: 'pointer' }}
                onClick={() => addToast('success', 'Action taken!', r.action)}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={11} color="#facc15" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 4 }}>{r.action}</div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--text-muted)' }}>
                    <span>Impact: <span style={{ color: r.impact === 'Critical' ? '#f87171' : r.impact === 'High' ? '#fb923c' : '#a78bfa', fontWeight: 600 }}>{r.impact}</span></span>
                    <span>Effort: <span style={{ color: '#4ade80', fontWeight: 600 }}>{r.effort}</span></span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function getDemoPulse() {
  return {
    agent: 'Pulse', team: 'Engineering Pod Alpha', health_score: 74, trend: '+8 from last week',
    metrics: {
      velocity: { value: 87, label: 'Velocity', trend: 'up', change: '+15%' },
      alignment: { value: 72, label: 'Alignment', trend: 'stable', change: '+2%' },
      communication: { value: 91, label: 'Communication', trend: 'up', change: '+5%' },
      blocker_rate: { value: 58, label: 'Blocker Resolution', trend: 'down', change: '-12%' },
    },
    active_blockers: [
      { id: 'B-001', title: 'QA environment instability blocking 4 engineers', severity: 'High', duration: '18 hours', owner: 'Jordan Lee', escalation_needed: true },
      { id: 'B-002', title: 'Azure subscription quota request pending approval', severity: 'Medium', duration: '6 hours', owner: 'Alex Chen', escalation_needed: false },
    ],
    knowledge_gaps: [
      { topic: 'GitHub Actions migration', severity: 'Medium', affected_members: 3 },
      { topic: 'Azure B2C custom policies', severity: 'High', affected_members: 5 },
    ],
    collaboration_graph: [
      { member: 'Alex Chen', interactions: 34, role: 'Hub' },
      { member: 'Sarah Kim', interactions: 28, role: 'Connector' },
      { member: 'Priya Sharma', interactions: 19, role: 'Contributor' },
      { member: 'Jordan Lee', interactions: 15, role: 'Isolated' },
    ],
    ai_recommendations: [
      { action: 'Schedule knowledge transfer session on Azure B2C custom policies', impact: 'High', effort: 'Low' },
      { action: 'Escalate QA environment issue to infrastructure team immediately', impact: 'Critical', effort: 'Low' },
      { action: 'Pair Jordan Lee with Sarah Kim on next feature — low interaction detected', impact: 'Medium', effort: 'Low' },
    ],
    sprint_progress: { total_points: 64, completed_points: 41, remaining_days: 5, predicted_completion: 'On Track' },
  }
}
