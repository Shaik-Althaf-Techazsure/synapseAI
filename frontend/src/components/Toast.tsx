import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../context/ToastContext'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const colors = {
  success: { bg: 'rgba(5,150,105,0.12)', border: 'rgba(5,150,105,0.35)', icon: '#4ade80' },
  error:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)',  icon: '#f87171' },
  info:    { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)', icon: '#60a5fa' },
  warning: { bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.35)',  icon: '#facc15' },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = icons[toast.type]
          const c = colors[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              style={{
                pointerEvents: 'all',
                minWidth: 300, maxWidth: 400,
                background: c.bg,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${c.border}`,
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex', alignItems: 'flex-start', gap: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <Icon size={18} color={c.icon} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#f8fafc' }}>{toast.title}</div>
                {toast.message && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{toast.message}</div>}
              </div>
              <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                <X size={14} color="#4b5563" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
