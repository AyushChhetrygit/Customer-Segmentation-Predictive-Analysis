import { motion } from 'framer-motion'
import { Filter, X } from 'lucide-react'
import { useFilters } from '../../context/FilterContext'

const SEGMENTS = ['', 'Bronze', 'Silver', 'Gold', 'Platinum']
const CHURN_RISKS = ['', 'Low', 'Medium', 'High']

const selectStyle = {
  background: 'var(--control-bg)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-secondary)',
  borderRadius: '8px',
  padding: '6px 28px 6px 10px',
  fontSize: '13px',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
}

export default function GlobalFilters() {
  const { filters, updateFilter, resetFilters } = useFilters()
  const hasActive = filters.segment || filters.churnRisk || filters.processedAt

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 flex-wrap px-4 lg:px-6 py-3 border-b border-subtle"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="flex items-center gap-1.5 text-xs font-medium text-secondary">
        <Filter size={13} />
        <span>Filters:</span>
      </div>

      {/* Segment */}
      <div className="relative">
        <select
          value={filters.segment}
          onChange={e => updateFilter('segment', e.target.value)}
          style={selectStyle}
        >
          {SEGMENTS.map(s => (
            <option key={s} value={s} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
              {s || 'All Segments'}
            </option>
          ))}
        </select>
      </div>

      {/* Churn Risk */}
      <div className="relative">
        <select
          value={filters.churnRisk}
          onChange={e => updateFilter('churnRisk', e.target.value)}
          style={selectStyle}
        >
          {CHURN_RISKS.map(r => (
            <option key={r} value={r} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
              {r || 'All Churn Risks'}
            </option>
          ))}
        </select>
      </div>

      {/* Date filter */}
      <input
        type="date"
        value={filters.processedAt}
        onChange={e => updateFilter('processedAt', e.target.value)}
        style={{ ...selectStyle, padding: '6px 10px' }}
        title="Filter by ProcessedAt date"
      />

      {/* Clear */}
      {hasActive && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs transition-colors"
          style={{ color: 'var(--danger)' }}
        >
          <X size={12} /> Clear
        </button>
      )}

      {hasActive && (
        <div className="ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent-1)', borderColor: 'color-mix(in srgb, var(--accent-1) 32%, transparent)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-1)' }} />
          Filters active
        </div>
      )}
    </motion.div>
  )
}
