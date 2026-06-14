import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { FileText, Play, Loader2, CheckCircle, AlertTriangle, Users, Zap, Clock, Copy, Send, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const SAMPLE_TRANSCRIPT = `Sarah Kim (PM): Alright everyone, let's get started with Sprint 23 planning. Big agenda today.

Alex Chen (Engineering Lead): Before we start, I need to flag our auth system — Auth0 costs are scaling badly and becoming a bottleneck. I've been evaluating Azure AD B2C.

Sarah Kim: Great timing. What's your recommendation?

Alex Chen: Azure AD B2C is the clear winner — native Microsoft 365 integration, enterprise SSO, and dramatically cheaper at scale. I recommend we migrate immediately.

Priya Sharma (QA): What about mobile clients? Token expiry could break our flows.

Alex Chen: Valid concern. Azure B2C supports 24-hour refresh tokens with silent renewal. I'll document this in the implementation guide.

Jordan Lee (DevOps): While we're modernizing — should we also migrate CI/CD to GitHub Actions? Our current pipeline is holding us back.

Sarah Kim: Both great decisions. Alex, can you own B2C migration? Jordan, draft the GitHub Actions workflow?

Alex Chen: Yes, but I'll need to raise our Azure subscription limits first. Submitting the request today.

Jordan Lee: Draft ready by next Friday.

Sarah Kim: Also — due to QA coverage gaps, we're pushing v2.1 release by two weeks. Priya, update the mobile regression matrix?

Priya Sharma: On it. Though our QA environment has been unstable — Jordan can you look into that?

Jordan Lee: Will prioritize it.

Sarah Kim: Marcus, can you review the new infrastructure vendor contracts by month end?

Marcus Johnson (Legal): Absolutely — feedback by the 25th.

Sarah Kim: Great session everyone. Clear owners, clear dates. Let's ship.`

const API_URL = 'http://localhost:8000'

export default function MeetingPage() {
  const { addToast } = useToast()
  const [transcript, setTranscript] = useState('')
  const [title, setTitle] = useState('Sprint 23 Planning — Engineering Team')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [checkedTasks, setCheckedTasks] = useState<Set<number>>(new Set())
  const [expandedDecisions, setExpandedDecisions] = useState(true)
  const [expandedBlockers, setExpandedBlockers] = useState(true)
  const [step, setStep] = useState('')

  const STEPS = [
    'Parsing transcript structure...',
    'Identifying speakers and roles...',
    'Extracting key topics...',
    'Detecting decisions made...',
    'Creating action items...',
    'Detecting blockers...',
    'Scoring meeting health...',
    'Finalizing report...'
  ]

  const analyze = async () => {
    if (!transcript.trim()) { addToast('warning', 'Transcript required', 'Please paste a meeting transcript first.'); return }
    setLoading(true)
    setResult(null)
    setCheckedTasks(new Set())
    let stepIdx = 0
    setStep(STEPS[0])
    const stepTimer = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, STEPS.length - 1)
      setStep(STEPS[stepIdx])
    }, 400)
    try {
      const res = await axios.post(`${API_URL}/api/meeting/analyze`, { transcript, meeting_title: title, participants: [] })
      setResult(res.data)
      addToast('success', 'Analysis complete!', `${res.data.tasks_created} action items extracted and assigned.`)
    } catch {
      setResult(getDemoResult(title))
      addToast('info', 'Demo mode active', 'Connect backend for live Azure OpenAI processing.')
    } finally {
      clearInterval(stepTimer)
      setLoading(false)
      setStep('')
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => addToast('success', `${label} copied!`, 'Pasted to your clipboard.'))
  }

  const toggleTask = (i: number) => {
    setCheckedTasks(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
    if (!checkedTasks.has(i)) addToast('success', 'Task marked complete!', 'Progress saved.')
  }

  const exportSummary = () => {
    if (!result) return
    const text = [
      `# Meeting Summary: ${result.meeting_title}`,
      `Health Score: ${result.summary.meeting_health_score}/100`,
      `\n## Executive Summary\n${result.summary.executive_summary}`,
      `\n## Key Decisions`,
      ...result.summary.key_decisions.map((d: any) => `- ${d.decision} (${d.made_by})`),
      `\n## Action Items`,
      ...result.summary.action_items.map((a: any) => `- [${checkedTasks.has(result.summary.action_items.indexOf(a)) ? 'x' : ' '}] ${a.task} — ${a.assignee} by ${a.due_date}`),
      `\n## Blockers`,
      ...result.summary.blockers.map((b: any) => `- ${b.blocker} (${b.owner})`),
    ].join('\n')
    navigator.clipboard.writeText(text).then(() => addToast('success', 'Full summary copied!', 'Ready to paste into Teams or Confluence.'))
  }

  const completedCount = checkedTasks.size
  const totalTasks = result?.summary.action_items.length || 0

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="agent-tag"><FileText size={12} /> Scribe Agent</div>
        <h1 className="page-title">Meeting Intelligence</h1>
        <p className="page-subtitle">Transform any meeting transcript into structured intelligence — summaries, decisions, action items, and blockers extracted by Azure OpenAI GPT-4o in seconds.</p>
      </div>

      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        {/* Input */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Meeting Details</span>
              <button id="btn-use-sample" className="btn btn-ghost" style={{ fontSize: 11, padding: '5px 10px' }}
                onClick={() => { setTranscript(SAMPLE_TRANSCRIPT); setTitle('Sprint 23 Planning — Engineering Team'); addToast('info', 'Sample loaded', 'Click Analyze to see AI in action.') }}>
                📋 Load Sample
              </button>
            </div>
            <input id="input-meeting-title" className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Meeting title" style={{ marginBottom: 10 }} />
            <textarea id="input-transcript" className="textarea" rows={14} value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="Paste your meeting transcript here...\n\nFormat: Speaker Name (Role): What they said" />
            {transcript && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{transcript.split(/\s+/).filter(Boolean).length} words</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>~{Math.ceil(transcript.split(/\s+/).length / 200)} min read</span>
              </div>
            )}
            <motion.button id="btn-analyze-meeting" className="btn btn-primary"
              style={{ marginTop: 12, width: '100%', justifyContent: 'center', fontSize: 14 }}
              onClick={analyze} disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}>
              {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> {step}</> : <><Play size={15} /> Analyze with AI</>}
            </motion.button>
            {result && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                <button className="btn btn-secondary" style={{ fontSize: 12, justifyContent: 'center' }} onClick={exportSummary}>
                  <Copy size={13} /> Copy Summary
                </button>
                <button className="btn btn-secondary" style={{ fontSize: 12, justifyContent: 'center' }} onClick={() => { setResult(null); setTranscript(''); addToast('info', 'Cleared', 'Ready for a new analysis.') }}>
                  <RotateCcw size={13} /> New Analysis
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div>
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card" style={{ textAlign: 'center', padding: '52px 24px' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'glow-pulse 2s ease-in-out infinite' }}>
                  <FileText size={26} color="white" />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Scribe Agent Processing</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Powered by Azure OpenAI GPT-4o + Semantic Kernel</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 280, margin: '0 auto' }}>
                  {STEPS.map((s, i) => (
                    <div key={s} style={{ fontSize: 12, color: s === step ? 'var(--text-primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, transition: 'color 0.3s' }}>
                      {s === step ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite', color: '#a78bfa' }} /> : <div style={{ width: 10 }} />}
                      {s}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            {result && !loading && (
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header card */}
                <div className="card" style={{ marginBottom: 14, background: 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(37,99,235,0.07))', border: '1px solid rgba(124,58,237,0.22)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 3 }}>{result.meeting_title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{result.word_count} words · {result.summary.topics_discussed.length} topics · {result.tasks_created} tasks created</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[{ val: result.summary.meeting_health_score, label: 'Health', color: '#4ade80' }, { val: result.tasks_created, label: 'Tasks', color: '#a78bfa' }, { val: result.summary.key_decisions.length, label: 'Decisions', color: '#60a5fa' }].map(m => (
                        <div key={m.label} style={{ textAlign: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{m.val}</div>
                          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>{result.summary.executive_summary}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {result.summary.topics_discussed.map((t: string) => (<span key={t} style={{ padding: '2px 8px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.22)', borderRadius: 100, fontSize: 11, color: '#a78bfa' }}>{t}</span>))}
                  </div>
                </div>

                {/* Action Items */}
                <div className="card" style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={15} color="#4ade80" /> Action Items
                      <span style={{ fontSize: 12, color: completedCount === totalTasks && totalTasks > 0 ? '#4ade80' : 'var(--text-muted)', fontWeight: 500 }}>{completedCount}/{totalTasks} done</span>
                    </div>
                    <button onClick={() => copyToClipboard(result.summary.action_items.map((a: any) => `- ${a.task} → ${a.assignee} by ${a.due_date}`).join('\n'), 'Action items')} className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }}><Copy size={11} /></button>
                  </div>
                  {totalTasks > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div className="progress-bar"><motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${(completedCount / totalTasks) * 100}%` }} transition={{ duration: 0.5 }} /></div>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {result.summary.action_items.map((item: any, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                        onClick={() => toggleTask(i)}
                        style={{ padding: '11px 14px', background: checkedTasks.has(i) ? 'rgba(5,150,105,0.05)' : 'rgba(255,255,255,0.03)', borderRadius: 10, border: `1px solid ${checkedTasks.has(i) ? 'rgba(5,150,105,0.2)' : 'rgba(255,255,255,0.06)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
                            <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${checkedTasks.has(i) ? '#4ade80' : 'rgba(255,255,255,0.2)'}`, background: checkedTasks.has(i) ? '#4ade80' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.2s' }}>
                              {checkedTasks.has(i) && <CheckCircle size={11} color="#030712" />}
                            </div>
                            <span style={{ fontSize: 13, textDecoration: checkedTasks.has(i) ? 'line-through' : 'none', opacity: checkedTasks.has(i) ? 0.5 : 1, transition: 'all 0.2s' }}>{item.task}</span>
                          </div>
                          <span className={`badge badge-${item.priority.toLowerCase()}`} style={{ flexShrink: 0 }}>{item.priority}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 14, marginTop: 6, paddingLeft: 28 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Users size={9} /> {item.assignee}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={9} /> {item.due_date}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Decisions */}
                <div className="card" style={{ marginBottom: 14 }}>
                  <button onClick={() => setExpandedDecisions(v => !v)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedDecisions ? 14 : 0, color: 'var(--text-primary)' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={15} color="#facc15" /> Key Decisions ({result.summary.key_decisions.length})</span>
                    {expandedDecisions ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                  </button>
                  <AnimatePresence>
                    {expandedDecisions && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {result.summary.key_decisions.map((d: any, i: number) => (
                            <div key={i} style={{ padding: '10px 12px', background: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.12)', borderRadius: 9 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{d.decision}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>By {d.made_by} · Impact: <span style={{ color: d.impact === 'High' ? '#f97316' : d.impact === 'Medium' ? '#facc15' : '#4ade80' }}>{d.impact}</span></div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Blockers */}
                {result.summary.blockers.length > 0 && (
                  <div className="card">
                    <button onClick={() => setExpandedBlockers(v => !v)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedBlockers ? 14 : 0, color: 'var(--text-primary)' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={15} color="#f87171" /> Blockers ({result.summary.blockers.length})</span>
                      {expandedBlockers ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                    </button>
                    <AnimatePresence>
                      {expandedBlockers && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                          {result.summary.blockers.map((b: any, i: number) => (
                            <div key={i} style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 9, marginBottom: 8 }}>
                              <div style={{ fontSize: 13, color: '#fca5a5', marginBottom: 4 }}>{b.blocker}</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Owner: {b.owner}</span>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <span className={`badge badge-${b.severity.toLowerCase()}`}>{b.severity}</span>
                                  <button className="btn btn-ghost" style={{ fontSize: 10, padding: '2px 8px', color: '#60a5fa' }} onClick={() => addToast('info', 'Escalation sent', `${b.owner} has been notified via Microsoft Teams.`)}>
                                    <Send size={9} /> Escalate
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
            {!loading && !result && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ textAlign: 'center', padding: 52, border: '1px dashed var(--border-glass)' }}>
                <FileText size={38} style={{ color: 'var(--text-muted)', margin: '0 auto 14px' }} />
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Ready to Analyze</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>Load the sample transcript or paste your own. The Scribe Agent will extract everything structured in seconds.</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function getDemoResult(title: string) {
  return { meeting_title: title, word_count: 412, tasks_created: 5, summary: { executive_summary: 'The engineering team reached consensus on modernizing two core systems: authentication (migrating to Azure AD B2C) and CI/CD (GitHub Actions). A 2-week release delay was approved to ensure QA coverage. All 5 action items have clear owners and due dates.', meeting_health_score: 82, topics_discussed: ['Authentication Architecture', 'CI/CD Migration', 'QA Coverage', 'Release Timeline', 'Infrastructure'], key_decisions: [{ decision: 'Adopt Azure AD B2C for authentication', made_by: 'Engineering Lead', impact: 'High' }, { decision: 'Delay v2.1 release by 2 weeks', made_by: 'Product Manager', impact: 'Medium' }, { decision: 'Migrate CI/CD to GitHub Actions', made_by: 'DevOps Lead', impact: 'High' }], action_items: [{ task: 'Set up Azure AD B2C tenant and configure OAuth flows', assignee: 'Alex Chen', due_date: '2024-01-19', priority: 'Critical' }, { task: 'Update QA regression matrix for mobile', assignee: 'Priya Sharma', due_date: '2024-01-18', priority: 'High' }, { task: 'Draft GitHub Actions CI/CD workflow', assignee: 'Jordan Lee', due_date: '2024-01-22', priority: 'High' }, { task: 'Communicate release delay to stakeholders', assignee: 'Sarah Kim', due_date: '2024-01-16', priority: 'Medium' }, { task: 'Review infrastructure vendor contracts', assignee: 'Marcus Johnson', due_date: '2024-01-25', priority: 'Low' }], blockers: [{ blocker: 'Azure subscription quota must be raised before B2C setup', owner: 'Alex Chen', severity: 'High' }, { blocker: 'QA environment instability — needs DevOps investigation', owner: 'Jordan Lee', severity: 'Medium' }], sentiment: 'Positive', follow_up_required: true } }
}
