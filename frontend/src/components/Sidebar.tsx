import { useLocation, useNavigate } from 'react-router-dom'
import {
  Zap, FileText, Target, Search, Activity, MessageSquare,
  Brain, ChevronRight
} from 'lucide-react'

const navItems = [
  { icon: Zap, label: 'Overview', path: '/', badge: null },
  { icon: FileText, label: 'Meeting Intelligence', path: '/meeting', badge: 'Scribe' },
  { icon: Target, label: 'Focus Briefing', path: '/focus', badge: 'Focus' },
  { icon: Search, label: 'Context Discovery', path: '/context', badge: 'Connector' },
  { icon: Activity, label: 'Team Pulse', path: '/pulse', badge: 'Pulse' },
  { icon: MessageSquare, label: 'AI Assistant', path: '/chat', badge: null },
]

const agents = ['Scribe', 'Memory', 'Focus', 'Connector', 'Pulse']

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">
            <Brain size={20} color="white" />
          </div>
          <div>
            <div className="logo-text">SynapseAI</div>
            <div className="logo-tagline">Workplace Intelligence</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Platform</div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              id={`nav-${item.path.replace('/', '') || 'home'}`}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">
                <Icon size={16} />
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          )
        })}

        <div className="nav-section-label" style={{ marginTop: 16 }}>Resources</div>
        <button className="nav-item" onClick={() => window.open('https://azure.microsoft.com/en-us/products/ai-services/openai-service', '_blank')}>
          <ChevronRight size={14} />
          <span>Azure OpenAI</span>
        </button>
        <button className="nav-item" onClick={() => window.open('https://learn.microsoft.com/en-us/semantic-kernel/overview/', '_blank')}>
          <ChevronRight size={14} />
          <span>Semantic Kernel</span>
        </button>
      </nav>

      {/* Agent Status Footer */}
      <div className="sidebar-footer">
        <div className="agent-status">
          <div className="agent-status-label">Active Agents</div>
          {agents.map((agent) => (
            <div key={agent} className="agent-pill">
              <div className="agent-dot" style={{
                animationDelay: `${agents.indexOf(agent) * 0.4}s`
              }} />
              <span>{agent} Agent</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: '#4ade80' }}>Online</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
