import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Target, Search, Activity, MessageSquare, ArrowRight, Brain, Users, TrendingUp, Shield, Zap, CheckCircle, Clock } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useCyclingTypewriter } from '../hooks/useTypewriter'
import { useCounter } from '../hooks/useCounter'

const agents = [
  { icon: FileText, name: 'Scribe Agent', tagline: 'Meeting Intelligence', description: 'Transforms raw transcripts into structured summaries, action items, decisions, and blocker detection — instantly.', color: '#7c3aed', path: '/meeting', id: 'agent-scribe', problem: 'Ideas lost in meetings' },
  { icon: Target, name: 'Focus Agent', tagline: 'Daily Briefing', description: 'Delivers your AI-curated morning brief — ranked priorities, team updates, and calendar prep in one intelligent view.', color: '#2563eb', path: '/focus', id: 'agent-focus', problem: 'No clarity on what matters' },
  { icon: Search, name: 'Connector Agent', tagline: 'Context Discovery', description: 'Surfaces the right knowledge at the right moment — past decisions, conversations, and the expert who knows.', color: '#06b6d4', path: '/context', id: 'agent-connector', problem: 'Context locked in silos' },
  { icon: Activity, name: 'Pulse Agent', tagline: 'Team Health', description: 'Monitors velocity, blockers, and collaboration patterns proactively — before they become crises.', color: '#059669', path: '/pulse', id: 'agent-pulse', problem: 'Blockers invisible until late' },
]

const phrases = ['Meeting Intelligence', 'Team Alignment', 'Knowledge Discovery', 'Workplace Clarity', 'AI Productivity']

const workflow = [
  { step: '01', title: 'Capture', desc: 'Meetings, chats, and decisions flow in automatically via Microsoft Graph API', icon: '📥', color: '#7c3aed' },
  { step: '02', title: 'Analyze', desc: 'Azure OpenAI GPT-4o extracts structure, intent, and relationships via Semantic Kernel', icon: '🧠', color: '#2563eb' },
  { step: '03', title: 'Synthesize', desc: 'The Memory Agent builds a persistent knowledge graph connecting people, decisions and context', icon: '🔗', color: '#06b6d4' },
  { step: '04', title: 'Act', desc: 'Specialized agents surface the right insight to the right person at exactly the right moment', icon: '⚡', color: '#059669' },
]

function StatCard({ value, suffix = '', label, icon: Icon, delay = 0 }: { value: number; suffix?: string; label: string; icon: any; delay?: number }) {
  const counted = useCounter(value, 1400, true)
  return (
    <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="metric-value">{counted}{suffix}</div>
          <div className="metric-label">{label}</div>
        </div>
        <Icon size={20} style={{ color: 'var(--text-muted)', marginTop: 4 }} />
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cycled = useCyclingTypewriter(phrases, 55, 2200)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animFrame: number
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = []
    for (let i = 0; i < 70; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, size: Math.random() * 1.8 + 0.3, opacity: Math.random() * 0.45 + 0.1 })
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(124,58,237,${p.opacity})`; ctx.fill()
        particles.forEach((p2, j) => {
          if (j <= i) return
          const dx = p.x - p2.x, dy = p.y - p2.y, dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 130) { ctx.beginPath(); ctx.strokeStyle = `rgba(124,58,237,${0.1 * (1 - dist / 130)})`; ctx.lineWidth = 0.5; ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke() }
        })
      })
      animFrame = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animFrame); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ position: 'relative', padding: '72px 48px 56px', overflow: 'hidden', background: 'var(--gradient-hero)', minHeight: 480, display: 'flex', alignItems: 'center' }}>
        <canvas ref={canvasRef} className="hero-canvas" style={{ width: '100%', height: '100%' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
            <div className="agent-tag"><Brain size={12} /> Microsoft AI Hackathon 2025</div>
            <div style={{ padding: '4px 12px', background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.3)', borderRadius: 100, fontSize: 12, color: '#4ade80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} /> Live Demo
            </div>
          </div>
          <h1 style={{ fontSize: 'clamp(36px,5.5vw,68px)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-2px', marginBottom: 8 }}>
            AI-Powered
          </h1>
          <h1 style={{ fontSize: 'clamp(36px,5.5vw,68px)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-2px', marginBottom: 24, minHeight: '1.2em' }}>
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {cycled}<span style={{ animation: 'cursor-blink 1s step-end infinite', WebkitTextFillColor: '#7c3aed' }}>|</span>
            </span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 580, lineHeight: 1.75, marginBottom: 36 }}>
            SynapseAI deploys <strong style={{ color: '#e2e8f0' }}>5 specialized AI agents</strong> powered by Azure OpenAI &amp; Semantic Kernel that transform meeting chaos, context fragmentation, and task confusion into <strong style={{ color: '#e2e8f0' }}>crystal-clear team intelligence</strong> — so no idea is lost and no task falls through the cracks.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
            <motion.button id="btn-try-meeting" className="btn btn-primary" style={{ fontSize: 14, padding: '12px 24px' }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/meeting')}>
              Try Meeting Intelligence <ArrowRight size={15} />
            </motion.button>
            <motion.button id="btn-try-chat" className="btn btn-secondary" style={{ fontSize: 14, padding: '12px 24px' }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/chat')}>
              <MessageSquare size={15} /> Chat with AI
            </motion.button>
            <motion.button id="btn-try-pulse" className="btn btn-ghost" style={{ fontSize: 14, padding: '12px 20px' }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/pulse')}>
              <Activity size={15} /> Team Pulse
            </motion.button>
          </div>
          {/* Tech pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Azure OpenAI GPT-4o', 'Semantic Kernel', 'Azure AI Foundry', 'Azure AI Search', 'Microsoft Graph API', 'Azure Cosmos DB'].map(t => (
              <span key={t} style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 100, fontSize: 11, color: '#64748b', fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 48px', marginTop: -24, position: 'relative', zIndex: 2 }}>
        <div className="grid-4">
          <StatCard value={2} suffix=".5h" label="Saved per person / day" icon={Clock} delay={0} />
          <StatCard value={94} suffix="%" label="Task capture accuracy" icon={CheckCircle} delay={0.08} />
          <StatCard value={5} label="Specialized AI agents" icon={Brain} delay={0.16} />
          <StatCard value={3} suffix="x" label="Faster team alignment" icon={TrendingUp} delay={0.24} />
        </div>
      </section>

      {/* Problem → Solution */}
      <section style={{ padding: '52px 48px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="agent-tag" style={{ margin: '0 auto 12px', width: 'fit-content' }}><Shield size={12} /> Problem → Solution</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8 }}>Every Team Pain Point, Solved</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 520, margin: '0 auto' }}>Each agent targets a specific, measurable productivity killer that every team faces.</p>
        </div>
        <div className="grid-2" style={{ gap: 16 }}>
          {agents.map((agent, i) => {
            const Icon = agent.icon
            return (
              <motion.div key={agent.name} id={agent.id} className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.09 }} style={{ cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                onClick={() => navigate(agent.path)} whileHover={{ y: -4 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${agent.color}, transparent)` }} />
                {/* Before/After */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <div style={{ flex: 1, padding: '7px 10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>❌ Before</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{agent.problem}</div>
                  </div>
                  <div style={{ flex: 1, padding: '7px 10px', background: `${agent.color}08`, border: `1px solid ${agent.color}25`, borderRadius: 8 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: agent.color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>✅ After</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{agent.tagline}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${agent.color}18`, border: `1px solid ${agent.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={agent.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{agent.name}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.65 }}>{agent.description}</p>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '48px 48px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div className="agent-tag" style={{ margin: '0 auto 12px', width: 'fit-content' }}><Zap size={12} /> How It Works</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>4-Step Intelligence Pipeline</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, position: 'relative' }}>
          {workflow.map((w, i) => (
            <motion.div key={w.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              style={{ padding: '24px 20px', textAlign: 'center', position: 'relative' }}>
              {i < workflow.length - 1 && (
                <div style={{ position: 'absolute', top: '36px', right: 0, width: '50%', height: 1, background: `linear-gradient(90deg, ${w.color}60, transparent)` }} />
              )}
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${w.color}15`, border: `1px solid ${w.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 22 }}>
                {w.icon}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: w.color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Step {w.step}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{w.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{w.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '32px 48px 60px' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ padding: '36px 40px', borderRadius: 20, background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(37,99,235,0.1))', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Ready to experience it?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Start with a real meeting transcript or chat with the AI orchestrator.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <motion.button id="btn-cta-meeting" className="btn btn-primary" style={{ padding: '12px 24px' }} whileHover={{ scale: 1.03 }} onClick={() => navigate('/meeting')}>
              <FileText size={15} /> Analyze a Meeting
            </motion.button>
            <motion.button id="btn-cta-chat" className="btn btn-secondary" style={{ padding: '12px 24px' }} whileHover={{ scale: 1.03 }} onClick={() => navigate('/chat')}>
              <Users size={15} /> Ask the Orchestrator
            </motion.button>
          </div>
        </motion.div>
      </section>

      <style>{`@keyframes cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  )
}
