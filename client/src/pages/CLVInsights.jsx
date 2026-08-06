import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import CLVDonutChart from '../components/charts/CLVDonutChart'
import { useFilters } from '../context/FilterContext'
import { fetchCLVDistribution, fetchKPIs, fetchSegments } from '../utils/api'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#6B55D3', '#FF5F2E', '#22B26F', '#EAB308', '#2563EB', '#FF4F4F']

export default function CLVInsights() {
  const { filters, refreshKey } = useFilters()
  const [clv, setClv] = useState(null)
  const [kpis, setKpis] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    await Promise.allSettled([
      fetchCLVDistribution(filters).then(r => setClv(r.data)),
      fetchKPIs(filters).then(r => setKpis(r.data)),
    ])
    setLoading(false)
  }, [filters, refreshKey]) // eslint-disable-line

  useAutoRefresh(load, 180000)

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-primary">CLV Insights</h2>
        <p className="text-sm text-secondary mt-0.5">Customer Lifetime Value distribution and analysis</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Average CLV', value: kpis ? `₹${(kpis.avgCLV / 1000).toFixed(1)}k` : '—', color: '#6B55D3', desc: 'Per customer lifetime value' },
          { label: 'High-Value Customers', value: kpis?.highValueCount ?? '—', color: '#6B55D3', desc: 'Gold + Platinum segments' },
          { label: 'Avg Order Value', value: kpis ? `₹${kpis.avgOrderValue?.toFixed(0)}` : '—', color: '#22B26F', desc: 'Average single order spend' },
        ].map(({ label, value, color, desc }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 rounded-lg">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color }}>{label}</p>
            <p className="text-3xl font-bold text-primary">{value}</p>
            <p className="text-xs text-secondary mt-1">{desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <CLVDonutChart data={clv} loading={loading} />

        {/* Histogram bar chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 rounded-lg">
          <h3 className="font-semibold text-base text-primary mb-1">CLV Histogram</h3>
          <p className="text-xs text-secondary mb-4">Customers per CLV value range</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={clv || []} barCategoryGap="20%" margin={{ top: 5, right: 5, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="range" tick={{ fill: 'var(--chart-tick)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-secondary)' }}
              />
              <Bar dataKey="count" name="Customers" radius={[6, 6, 0, 0]}>
                {(clv || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  )
}
