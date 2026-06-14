import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { Search, Loader2, AlertTriangle, User, FileText, MessageSquare, Database, Star, Filter, Clock, X } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const API_URL = 'http://localhost:8000'

const typeColors: Record<string, string> = {
  Decision: '#a78bfa', Document: '#60a5fa', Conversation: '#34d399', Expert: '#f97316',
}
const typeIcons: Record<string, any> = {
  Decision: Star, Document: FileText, Conversation: MessageSquare, Expert: User,
}

const suggestions = [
  'Azure AD B2C authentication',
  'QA environment instability',
  'Sprint velocity trends',
  'GitHub Actions CI/CD',
  'Who knows about mobile tokens?',
]

const FILTER_TYPES = ['All', 'Decision', 'Document', 'Conversation', 'Expert']

export default function ContextPage() {
  const { addToast } = useToast()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const search = async (q?: string) => {
    const searchQuery = q || query
    if (!searchQuery.trim()) { addToast('warning', 'Query needed', 'Please enter a search term.'); return }
    if (q) setQuery(q)
    setLoading(true)
    setResult(null)
    setActiveFilter('All')
    setRecentSearches(prev => [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5))
    try {
      const res = await axios.post(`${API_URL}/api/context/search`, { query: searchQuery })
      setResult(res.data)
      addToast('success', 'Knowledge graph searched!', `Found ${res.data.results.length} relevant items.`)
    } catch {
      setResult(getDemoContext(searchQuery))
      addToast('info', 'Demo mode', 'Showing semantic search results from knowledge graph.')
    } finally {
      setLoading(false)
    }
  }

  const filteredResults = result?.results?.filter(
    (r: any) => activeFilter === 'All' || r.type === activeFilter
  ) || []

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="agent-tag"><Search size={12} /> Connector Agent</div>
        <h1 className="page-title">Context Discovery</h1>
        <p className="page-subtitle">
          Instantly surface relevant knowledge from across your team. The Connector Agent uses <strong style={{ color: '#e2e8f0' }}>Azure AI Search with vector embeddings</strong> to find past decisions, conversations, documents, and the right experts.
        </p>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="input-context-search"
              className="input"
              style={{ paddingLeft: 38 }}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Search team knowledge... e.g. 'who decided on authentication?' or 'find B2C docs'"
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <motion.button id="btn-context-search" className="btn btn-primary"
            onClick={() => search()} disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}>
            {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={15} />}
            {loading ? 'Searching...' : 'Search'}
          </motion.button>
        </div>

        {/* Suggestion chips */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: recentSearches.length > 0 ? 10 : 0 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>Try:</span>
          {suggestions.map(s => (
            <button key={s} id={`suggestion-${s.split(' ')[0]}`} onClick={() => search(s)}
              style={{ padding: '4px 11px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)', borderRadius: 100, fontSize: 11.5, color: '#a78bfa', cursor: 'pointer', transition: 'all 0.15s', fontWeight: 500 }}>
              {s}
            </button>
          ))}
        </div>

        {/* Recent searches */}
        {recentSearches.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} /> Recent:</span>
            {recentSearches.map(s => (
              <button key={s} onClick={() => search(s)}
                style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="card" style={{ textAlign: 'center', padding: 52 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#06b6d4,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'glow-pulse 2s ease-in-out infinite' }}>
              <Database size={22} color="white" />
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Connector Agent searching...</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Using Azure AI Search vector embeddings across the knowledge graph
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Meetings', 'Documents', 'Conversations', 'Decisions', 'Experts'].map((source, i) => (
                <motion.div key={source} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.12 }}
                  style={{ padding: '4px 12px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.18)', borderRadius: 100, fontSize: 11, color: '#22d3ee' }}>
                  Scanning {source}...
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {result && !loading && (
          <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {/* Stats + filter bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                  { label: `${result.results.length} results`, icon: Database, color: '#06b6d4' },
                  { label: `${result.knowledge_graph.nodes} nodes`, icon: Star, color: '#a78bfa' },
                  { label: `${result.knowledge_graph.connections} connections`, icon: Search, color: '#34d399' },
                ].map(s => {
                  const Icon = s.icon
                  return (
                    <div key={s.label} style={{ padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
                      <Icon size={13} color={s.color} />
                      <strong>{s.label}</strong>
                    </div>
                  )
                })}
              </div>

              {/* Filter */}
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <Filter size={12} style={{ color: 'var(--text-muted)' }} />
                {FILTER_TYPES.map(f => (
                  <button key={f} onClick={() => setActiveFilter(f)}
                    style={{ padding: '4px 11px', borderRadius: 100, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', background: activeFilter === f ? (typeColors[f] || 'rgba(124,58,237,0.25)') + (activeFilter === f ? '20' : '00') : 'rgba(255,255,255,0.04)', color: activeFilter === f ? (typeColors[f] || '#a78bfa') : 'var(--text-secondary)', border: `1px solid ${activeFilter === f ? (typeColors[f] || '#7c3aed') + '35' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            {filteredResults.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)', fontSize: 13 }}>
                No {activeFilter} results. <button onClick={() => setActiveFilter('All')} style={{ color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer' }}>Show all types</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredResults.map((r: any, i: number) => {
                  const color = typeColors[r.type] || '#a78bfa'
                  const Icon = typeIcons[r.type] || FileText
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className="card" style={{ cursor: 'pointer' }}
                      onClick={() => addToast('info', `Opening ${r.type}`, `"${r.title}" — ${r.source}`)}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${color}12`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={17} color={color} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
                            <div>
                              <span style={{ fontSize: 9, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1 }}>{r.type}</span>
                              <div style={{ fontWeight: 700, fontSize: 14, marginTop: 2 }}>{r.title}</div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: 18, fontWeight: 800, color: r.relevance_score > 0.9 ? '#4ade80' : '#a78bfa' }}>{Math.round(r.relevance_score * 100)}%</div>
                              <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>relevance</div>
                            </div>
                          </div>
                          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 10 }}>{r.snippet}</p>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📁 {r.source}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📅 {r.date}</span>
                            {r.people_involved.map((p: string) => (
                              <span key={p} style={{ fontSize: 11, padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 100, color: 'var(--text-secondary)' }}>👤 {p}</span>
                            ))}
                          </div>
                          {/* Relevance bar */}
                          <div className="progress-bar" style={{ marginTop: 10 }}>
                            <motion.div className="progress-fill" style={{ background: `linear-gradient(90deg, ${color}, ${color}70)` }}
                              initial={{ width: 0 }} animate={{ width: `${r.relevance_score * 100}%` }} transition={{ delay: i * 0.06 + 0.2, duration: 0.7 }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Knowledge graph topic clusters */}
            <div className="card" style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                🔗 Related Topic Clusters
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>— click to explore</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {result.knowledge_graph.topic_clusters.map((t: string) => (
                  <motion.button key={t} onClick={() => search(t)} whileHover={{ scale: 1.04 }}
                    style={{ padding: '6px 14px', background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.18)', borderRadius: 100, fontSize: 12.5, color: '#22d3ee', cursor: 'pointer', fontWeight: 500 }}>
                    {t}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {!result && !loading && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card"
            style={{ textAlign: 'center', padding: 60, border: '1px dashed var(--border-glass)' }}>
            <Database size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Knowledge Graph Ready</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto', lineHeight: 1.65 }}>
              The Connector Agent uses Azure AI Search with vector embeddings to semantically search across all your team's meetings, decisions, documents, and conversations. Try the suggestions above.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function getDemoContext(query: string) {
  return {
    agent: 'Connector', query,
    results: [
      { type: 'Decision', title: 'Authentication Architecture Decision (Jan 15)', snippet: 'Team agreed to use Azure AD B2C after evaluating Auth0 and Cognito. Key factors: native Microsoft 365 integration, enterprise SSO, and significantly lower cost at scale.', relevance_score: 0.97, source: 'Team Meeting — Sprint 23', date: '2024-01-15', people_involved: ['Alex Chen', 'Sarah Kim', 'Engineering Lead'] },
      { type: 'Document', title: 'Azure B2C Implementation Guide (Internal)', snippet: 'Step-by-step setup for our tenant configuration. Includes OAuth 2.0 flows, user attribute mapping, and custom policies for enterprise requirements.', relevance_score: 0.91, source: 'Confluence', date: '2024-01-16', people_involved: ['Alex Chen'] },
      { type: 'Conversation', title: 'Teams Chat: Mobile token expiry concern', snippet: 'Priya raised concerns about token expiry for mobile clients. Alex confirmed 24-hour refresh tokens with silent renewal are configured. Issue fully resolved.', relevance_score: 0.85, source: 'Microsoft Teams', date: '2024-01-17', people_involved: ['Priya Sharma', 'Alex Chen'] },
      { type: 'Expert', title: 'Subject Matter Expert: Alex Chen', snippet: 'Alex has led 3 prior Azure AD implementations. Referenced in 12 related conversations this sprint. Highly recommended contact for authentication questions.', relevance_score: 0.82, source: 'Knowledge Graph', date: '2024-01-10', people_involved: ['Alex Chen'] },
    ],
    knowledge_graph: { nodes: 47, connections: 183, topic_clusters: ['Authentication', 'Azure Services', 'Security', 'Sprint 23', 'Mobile Clients'] }
  }
}
