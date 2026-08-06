import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

const CARD_CONFIGS = {
  cyan: {
    accent: '#6B55D3',
    iconBg: 'rgba(107,85,211,0.1)',
  },
  purple: {
    accent: '#6B55D3',
    iconBg: 'rgba(107,85,211,0.1)',
  },
  pink: {
    accent: '#FF4F4F',
    iconBg: 'rgba(255,79,79,0.1)',
  },
  green: {
    accent: '#22B26F',
    iconBg: 'rgba(34,178,111,0.1)',
  },
}

export default function KPICard({ title, value, subtitle, icon: Icon, color = 'cyan', trend, loading }) {
  const cfg = CARD_CONFIGS[color]

  if (loading) {
    return (
      <div className="glass-card p-5 rounded-lg animate-fadeIn">
        <div className="skeleton h-4 w-24 mb-3 rounded"/>
        <div className="skeleton h-8 w-32 mb-2 rounded"/>
        <div className="skeleton h-3 w-20 rounded"/>
      </div>
    )
  }

  const isPositive = trend > 0
  const trendAbs = Math.abs(trend || 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-lg p-5 cursor-default"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-2">{title}</p>
          <p className="text-2xl font-bold text-primary leading-none mb-1">{value}</p>
          {subtitle && <p className="text-xs text-secondary mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2 text-xs font-semibold"
              style={{ color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{isPositive ? '+' : '-'}{trendAbs}% vs prev period</span>
            </div>
          )}
        </div>

        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.iconBg }}>
          <Icon size={20} style={{ color: cfg.accent }} />
        </div>
      </div>
    </motion.div>
  )
}
