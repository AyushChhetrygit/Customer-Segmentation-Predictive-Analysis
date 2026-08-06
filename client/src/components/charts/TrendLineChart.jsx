import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { motion } from 'framer-motion'

const TIME_RANGES = ['7d', '30d', '90d']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-4 py-3 text-sm">
      <p className="font-semibold text-primary mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-secondary">{p.name}:</span>
          <span className="font-semibold text-primary">
            {p.name === 'totalSpend' ? `₹${(p.value/1000).toFixed(1)}k` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function TrendLineChart({ data, loading }) {
  const [range, setRange] = useState('30d')

  if (loading) {
    return (
      <div className="glass-card p-5 rounded-lg">
        <div className="skeleton h-4 w-40 mb-4 rounded"/>
        <div className="skeleton h-56 w-full rounded-xl"/>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 rounded-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-base text-primary">Revenue & Engagement Trend</h3>
          <p className="text-xs text-secondary mt-0.5">Total spend and avg engagement over time</p>
        </div>
        <div className="flex gap-1">
          {TIME_RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                range === r ? 'border' : 'text-secondary hover:text-primary'
              }`}
              style={range === r ? { background: 'var(--accent-soft)', color: 'var(--accent-1)', borderColor: 'color-mix(in srgb, var(--accent-1) 32%, transparent)' } : undefined}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data || []} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gradSpend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6B55D3" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#6B55D3" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradEngagement" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF5F2E" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#FF5F2E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="date" tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: 'var(--chart-tick)', paddingTop: '8px' }}
          />
          <Area
            type="monotone" dataKey="totalSpend" name="Total Spend"
            stroke="#6B55D3" strokeWidth={2.5}
            fill="url(#gradSpend)" dot={false} activeDot={{ r: 5, fill: '#6B55D3' }}
          />
          <Area
            type="monotone" dataKey="avgEngagement" name="Avg Engagement"
            stroke="#FF5F2E" strokeWidth={2.5}
            fill="url(#gradEngagement)" dot={false} activeDot={{ r: 5, fill: '#FF5F2E' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
