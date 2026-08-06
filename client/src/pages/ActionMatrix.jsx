import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import ActionHeatmap from '../components/charts/ActionHeatmap'
import { useFilters } from '../context/FilterContext'
import { fetchActions } from '../utils/api'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const ACTION_COLORS = {
  'Loyalty Program': '#6B55D3',
  'Retention Campaign': '#FF4F4F',
  'None': '#A7A7AE',
  'VIP Treatment': '#EAB308',
  'Regular Engagement': '#22B26F',
  'Win-back Campaign': '#FF5F2E',
  'Upsell Premium': '#2563EB',
  'Discount Offer': '#FF5F2E',
}

function getActionColor(action) {
  return ACTION_COLORS[action] || '#A7A7AE'
}

export default function ActionMatrix() {
  const { filters, refreshKey } = useFilters()
  const [actions, setActions] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    await fetchActions(filters).then(r => setActions(r)).catch(console.error)
    setLoading(false)
  }, [filters, refreshKey]) // eslint-disable-line

  useAutoRefresh(load, 180000)

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-primary">Action Matrix</h2>
        <p className="text-sm text-secondary mt-0.5">Recommended actions per customer segment and risk tier</p>
      </div>

      <ActionHeatmap data={actions} loading={loading} />

      {/* Action breakdown bar chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 rounded-lg">
        <h3 className="font-semibold text-base text-primary mb-1">Action Distribution</h3>
        <p className="text-xs text-secondary mb-4">Number of customers per recommended action</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={actions?.data || []} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
            <XAxis type="number" tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="action" tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }}
              labelStyle={{ color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-secondary)' }}
            />
            <Bar dataKey="count" name="Customers" radius={[0, 6, 6, 0]}>
              {(actions?.data || []).map((entry) => (
                <Cell key={entry.action} fill={getActionColor(entry.action)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
