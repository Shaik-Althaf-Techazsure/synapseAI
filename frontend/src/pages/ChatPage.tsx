import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { MessageSquare, Send, Loader2, Bot, User, Zap, FileText, Target, Search, Activity, Copy, RotateCcw, ChevronRight } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useTypewriter } from '../hooks/useTypewriter'

const API_URL = 'http://localhost:8000'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agent?: string
  timestamp: Date
  isStreaming?: boolean
}

const agentColors: Record<string, string> = {
  Scribe: '#7c3aed', Focus: '#2563eb', Connector: '#06b6d4',
  Pulse: '#059669', Orchestrator: '#db2777', Memory: '#f97316',
}

const agentEmojis: Record<string, string> = {
  Scribe: '🎙️', Focus: '🎯', Connector: '🔍', Pulse: '📊', Orchestrator: '🧠', Memory: '💾',
}

const quickPrompts = [
  { icon: Target, text: 'What should I focus on today?', agent: 'Focus', color: '#2563eb' },
  { icon: FileText, text: 'Summarize our last sprint meeting', agent: 'Scribe', color: '#7c3aed' },
  { icon: Search, text: 'Find context on authentication decisions', agent: 'Connector', color: '#06b6d4' },
  { icon: Activity, text: "What's blocking the team right now?", agent: 'Pulse', color: '#059669' },
]

const followUps: Record<string, string[]> = {
  Scribe: ['Show me just the action items', 'Who are the main decision makers?', 'What blockers were raised?'],
  Focus: ['What is the most urgent task?', 'Show my meeting prep for today', 'What did I miss while away?'],
  Connector: ['Who is the expert on this?', 'Show me related decisions', 'When was this last discussed?'],
  Pulse: ['Which blocker needs escalation?', 'Who has low collaboration?', 'How is sprint velocity trending?'],
  Orchestrator: ['Give me a full team briefing', 'What should the team prioritize?', 'Find any risks this week'],
}

function StreamingMessage({ content, agent }: { content: string; agent?: string }) {
  const { displayText } = useTypewriter(content, 14, true)
  const formatted = displayText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
  return <span dangerouslySetInnerHTML={{ __html: formatted }} />
}

export default function ChatPage() {
  const { addToast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: "Hello! I'm **SynapseAI Orchestrator** — I coordinate all 5 specialized agents to answer your questions intelligently.\n\nI route every query to the right specialist automatically using **Semantic Kernel**. Try asking about your priorities, meeting summaries, team health, or knowledge search.", agent: 'Orchestrator', timestamp: new Date() },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeAgent, setActiveAgent] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text?: string) => {
    const message = text || input
    if (!message.trim() || loading) return
    setInput('')
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: message, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setActiveAgent('Routing...')
    try {
      const res = await axios.post(`${API_URL}/api/chat`, { message, history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })) })
      const data = res.data
      setActiveAgent(data.agent)
      await new Promise(r => setTimeout(r, 300))
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response, agent: data.agent, timestamp: new Date(), isStreaming: true }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      const fallback = getFallbackResponse(message)
      setActiveAgent(fallback.agent)
      await new Promise(r => setTimeout(r, 400))
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: fallback.response, agent: fallback.agent, timestamp: new Date(), isStreaming: true }])
    } finally {
      setLoading(false)
      setActiveAgent(null)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const clearChat = () => {
    setMessages([{ id: '0', role: 'assistant', content: "Hello! I'm **SynapseAI Orchestrator** — I coordinate all 5 specialized agents to answer your questions intelligently.\n\nI route every query to the right specialist automatically using **Semantic Kernel**. Try asking about your priorities, meeting summaries, team health, or knowledge search.", agent: 'Orchestrator', timestamp: new Date() }])
    addToast('info', 'Chat cleared', 'Starting a fresh conversation.')
  }

  const copyMsg = (content: string) => {
    navigator.clipboard.writeText(content).then(() => addToast('success', 'Copied!', 'Message content copied.'))
  }

  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant')
  const suggestedFollowUps = lastAssistantMsg?.agent ? (followUps[lastAssistantMsg.agent] || followUps['Orchestrator']) : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 58px)', maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
      {/* Header */}
      <div style={{ padding: '22px 0 14px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <div className="agent-tag" style={{ marginBottom: 8 }}><MessageSquare size={12} /> AI Orchestrator</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, marginBottom: 3 }}>SynapseAI Assistant</h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Azure OpenAI GPT-4o · Semantic Kernel routing · 5 specialized agents</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Scribe','Focus','Connector','Pulse','Memory'].map(a => (
            <div key={a} title={`${a} Agent`} style={{ width: 28, height: 28, borderRadius: '50%', background: `${agentColors[a]}15`, border: `1px solid ${agentColors[a]}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, cursor: 'default' }}>
              {agentEmojis[a]}
            </div>
          ))}
          <button id="btn-clear-chat" onClick={clearChat} className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }}><RotateCcw size={13} /></button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
              style={{ display: 'flex', gap: 10, marginBottom: 18, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              {/* Avatar */}
              <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: msg.role === 'user' ? 'var(--gradient-primary)' : `${agentColors[msg.agent || 'Orchestrator']}15`, border: msg.role === 'assistant' ? `1px solid ${agentColors[msg.agent || 'Orchestrator']}30` : 'none', fontSize: msg.role === 'assistant' ? 14 : 'inherit' }}>
                {msg.role === 'user' ? <User size={15} color="white" /> : <span>{agentEmojis[msg.agent || 'Orchestrator']}</span>}
              </div>
              <div style={{ maxWidth: '80%' }}>
                {msg.role === 'assistant' && msg.agent && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 5, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: `${agentColors[msg.agent]}12`, border: `1px solid ${agentColors[msg.agent]}28`, color: agentColors[msg.agent], textTransform: 'uppercase', letterSpacing: 0.8 }}>{msg.agent} Agent</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
                <div
                  style={{ padding: '11px 15px', borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px', background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--bg-card)', border: msg.role === 'assistant' ? '1px solid var(--border-glass)' : 'none', fontSize: 13.5, lineHeight: 1.75, color: msg.role === 'user' ? 'white' : 'var(--text-primary)', boxShadow: msg.role === 'user' ? '0 4px 20px rgba(124,58,237,0.25)' : 'var(--shadow-card)', position: 'relative' }}
                >
                  {msg.role === 'assistant' && msg.isStreaming && idx === messages.length - 1
                    ? <StreamingMessage content={msg.content} agent={msg.agent} />
                    : <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                  }
                </div>
                {msg.role === 'assistant' && (
                  <button onClick={() => copyMsg(msg.content)} className="btn btn-ghost" style={{ fontSize: 10, padding: '3px 7px', marginTop: 4, opacity: 0.5 }}><Copy size={9} /> Copy</button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={15} color="#a78bfa" />
            </div>
            <div style={{ padding: '11px 15px', background: 'var(--bg-card)', borderRadius: '4px 14px 14px 14px', border: '1px solid var(--border-glass)' }}>
              {activeAgent && activeAgent !== 'Routing...' ? (
                <div style={{ fontSize: 12, color: agentColors[activeAgent] || '#a78bfa', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> {agentEmojis[activeAgent]} {activeAgent} Agent responding...
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Routing to best agent...
                </div>
              )}
              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', animation: `bounce 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />)}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Follow-up suggestions */}
      {!loading && suggestedFollowUps.length > 0 && messages.length > 1 && (
        <div style={{ paddingBottom: 10, flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>💡 Suggested follow-ups:</div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {suggestedFollowUps.map(s => (
              <button key={s} onClick={() => send(s)} style={{ padding: '5px 12px', background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 100, fontSize: 11.5, color: '#a78bfa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}>
                <ChevronRight size={10} /> {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick prompts — only at start */}
      {messages.length <= 1 && (
        <div style={{ paddingBottom: 10, flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Quick starts:</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {quickPrompts.map(({ icon: Icon, text, color }) => (
              <button key={text} onClick={() => send(text)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', background: `${color}0f`, border: `1px solid ${color}28`, borderRadius: 100, fontSize: 12, color, cursor: 'pointer', fontWeight: 500 }}>
                <Icon size={11} /> {text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ paddingBottom: 20, paddingTop: 10, borderTop: '1px solid var(--border-glass)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea ref={inputRef} id="input-chat" className="textarea" rows={2} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Ask about priorities, meetings, team health, or any workplace question... (Enter to send, Shift+Enter for newline)"
            style={{ resize: 'none', flex: 1 }} />
          <motion.button id="btn-send-chat" className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim()}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ padding: '12px 16px', flexShrink: 0 }}>
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
          </motion.button>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={9} /> Azure OpenAI GPT-4o · Semantic Kernel orchestration · Intent-based agent routing
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes bounce{0%,80%,100%{transform:scale(0);opacity:.5}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  )
}

function getFallbackResponse(message: string): { response: string; agent: string } {
  const l = message.toLowerCase()
  if (l.includes('meeting') || l.includes('summary') || l.includes('transcript') || l.includes('sprint')) {
    return { agent: 'Scribe', response: "I analyzed your meeting context. The key decisions were around **Azure AD B2C adoption** and a **2-week release delay**. I've extracted 5 action items with clear assignees and deadlines.\n\n**Top Action Item:** Alex Chen must set up the B2C tenant by Jan 19 (Critical priority).\n\nWould you like me to send these action items to the team via Microsoft Teams?" }
  } else if (l.includes('priority') || l.includes('focus') || l.includes('today') || l.includes('what should') || l.includes('morning')) {
    return { agent: 'Focus', response: "Based on your calendar, tasks, and team dependencies, here's your **AI-ranked priority list**:\n\n**#1 🔴 Critical** — Review the Azure AD B2C proposal (blocking Alex + 2 others, decision needed by 10am)\n**#2 🟠 High** — Respond to Sarah's budget message (SLA breach in 2 hours)\n**#3 🟡 High** — Finalize sprint retrospective doc (stakeholder meeting at 2pm)\n\nYou have **2.5 hours of focus time** available before your first meeting. Tackle #1 now." }
  } else if (l.includes('find') || l.includes('search') || l.includes('who') || l.includes('context') || l.includes('authentication')) {
    return { agent: 'Connector', response: "I searched the team knowledge graph and found **4 highly relevant items**:\n\n🥇 **97% match** — Authentication Architecture Decision (Jan 15): Team chose Azure AD B2C over Auth0\n📄 **91% match** — Azure B2C Implementation Guide in Confluence\n💬 **85% match** — Teams chat: Priya's token expiry concern (resolved)\n👤 **Expert** — Alex Chen (3 prior Azure AD implementations, 12 related conversations)\n\nShall I connect you with Alex or surface the full decision thread?" }
  } else if (l.includes('team') || l.includes('pulse') || l.includes('health') || l.includes('block') || l.includes('velocity')) {
    return { agent: 'Pulse', response: "Team health is at **74/100** — up 8 points from last week! 📈\n\n⚠️ **Critical:** QA environment blocking 4 engineers for 18 hours — needs immediate escalation\n⚠️ **Medium:** Azure subscription quota pending approval (Alex Chen)\n\n🔍 **Isolation detected:** Jordan Lee has only 15 interactions this sprint (lowest in team)\n\n**Recommendation:** Escalate QA blocker now + pair Jordan with Sarah on next feature. Want me to draft the escalation message?" }
  }
  return { agent: 'Orchestrator', response: "I've queried all 5 SynapseAI agents for you. Here's a cross-agent summary:\n\n🎯 **Your focus today:** Azure B2C review (blocking 3 people)\n📊 **Team health:** 74/100 — 2 active blockers need attention\n🔍 **Knowledge graph:** 47 nodes connected to your current sprint\n📋 **Pending:** 5 action items from last meeting, 2 overdue\n\nWhat would you like to explore deeper? Try: *priorities*, *team blockers*, *find context*, or *meeting summary*." }
}
