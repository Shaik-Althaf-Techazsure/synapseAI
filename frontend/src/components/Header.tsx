import { useLocation } from 'react-router-dom'
import { Bell, Wifi, Cpu } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const breadcrumbs: Record<string, { label: string; emoji: string; desc: string }> = {
  '/':        { label: 'Overview',              emoji: '🏠', desc: 'Multi-Agent Platform Home' },
  '/meeting': { label: 'Meeting Intelligence',  emoji: '🎙️', desc: 'Scribe Agent — Transcript Analysis' },
  '/focus':   { label: 'Focus Briefing',        emoji: '🎯', desc: 'Focus Agent — Daily Priorities' },
  '/context': { label: 'Context Discovery',     emoji: '🔍', desc: 'Connector Agent — Knowledge Search' },
  '/pulse':   { label: 'Team Pulse',            emoji: '📊', desc: 'Pulse Agent — Team Health Monitor' },
  '/chat':    { label: 'AI Assistant',          emoji: '💬', desc: 'Orchestrator — Multi-Agent Chat' },
}

const mockNotifications = [
  { id: 1, text: '🚨 Blocker B-001 needs escalation — 18hr unresolved', time: '2m ago', unread: true },
  { id: 2, text: '✅ Alex Chen completed OAuth flow setup ahead of schedule', time: '15m ago', unread: true },
  { id: 3, text: '📋 Scribe Agent processed Sprint Planning meeting', time: '1h ago', unread: false },
  { id: 4, text: '📣 Team health score improved +8 points this week', time: '2h ago', unread: false },
]

export default function Header() {
  const location = useLocation()
  const crumb = breadcrumbs[location.pathname] || breadcrumbs['/']
  const [showNotifs, setShowNotifs] = useState(false)
  const unreadCount = mockNotifications.filter(n => n.unread).length

  return (
    <header style={{
      position: 'fixed',
      top: 0, left: 'var(--sidebar-width)', right: 0,
      height: 58,
      background: 'rgba(7,13,26,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center',
      padding: '0 28px',
      gap: 16,
      zIndex: 99,
    }}>
      {/* Breadcrumb */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>{crumb.emoji}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, color: '#f8fafc' }}>{crumb.label}</div>
          <div style={{ fontSize: 11, color: '#4b5563', lineHeight: 1 }}>{crumb.desc}</div>
        </div>
      </div>

      {/* Live status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 100 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', animation: 'pulse-dot 2s ease-in-out infinite' }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#4ade80' }}>5 Agents Live</span>
      </div>

      {/* Azure badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 100 }}>
        <Cpu size={11} color="#60a5fa" />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#60a5fa' }}>Azure OpenAI GPT-4o</span>
      </div>

      {/* Notifications */}
      <div style={{ position: 'relative' }}>
        <button
          id="btn-notifications"
          onClick={() => setShowNotifs(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: 8, color: '#94a3b8', position: 'relative', display: 'flex', alignItems: 'center' }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              width: 16, height: 16, borderRadius: '50%',
              background: '#ef4444', color: 'white',
              fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{unreadCount}</span>
          )}
        </button>

        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8,
                width: 340,
                background: '#0d1526',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                zIndex: 200,
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>Notifications</span>
                <span style={{ fontSize: 11, color: '#60a5fa', cursor: 'pointer' }}>Mark all read</span>
              </div>
              {mockNotifications.map(n => (
                <div key={n.id} style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: n.unread ? 'rgba(124,58,237,0.05)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}>
                  <div style={{ fontSize: 12, lineHeight: 1.5, color: n.unread ? '#e2e8f0' : '#64748b' }}>{n.text}</div>
                  <div style={{ fontSize: 10, color: '#4b5563', marginTop: 4 }}>{n.time}</div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: 'white',
          boxShadow: '0 0 12px rgba(124,58,237,0.4)',
        }}>U</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>User</span>
          <span style={{ fontSize: 10, color: '#4b5563' }}>Engineering Lead</span>
        </div>
        <Wifi size={12} color="#4ade80" />
      </div>
    </header>
  )
}
