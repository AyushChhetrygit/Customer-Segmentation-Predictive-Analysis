import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Play, CalendarClock, ListFilter, LayoutTemplate, UserCheck, Gift, QrCode } from 'lucide-react'
import { motion } from 'framer-motion'
import EmailHistoryTable from '../components/EmailHistoryTable'

const API_BASE = 'http://localhost:8000/api/v1'
const RETENTION_SEGMENT = 'HIGH-CHURN-RETENTION'

const TARGET_SEGMENTS = [
  { value: RETENTION_SEGMENT, label: 'High Churn Retention' },
  { value: 'VIP', label: 'VIP Customers' },
  { value: 'AT-RISK', label: 'At-Risk (Churn)' },
  { value: 'INACTIVE', label: 'Inactive / Dormant' },
  { value: 'NEW', label: 'New Customers' },
]

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState([])
  const [templates, setTemplates] = useState([])
  const [selectedSegment, setSelectedSegment] = useState(RETENTION_SEGMENT)
  const [segmentPreview, setSegmentPreview] = useState([])
  const [loadingPreview, setLoadingPreview] = useState(false)

  const [newCampaign, setNewCampaign] = useState({
    name: 'High Churn Retention Campaign',
    target_segment: RETENTION_SEGMENT,
    template_id: ''
  })

  // Load Initial Data
  useEffect(() => {
    fetchData()
  }, [])

  // Load Audience Preview on segment change
  useEffect(() => {
    fetchSegmentPreview(selectedSegment)
  }, [selectedSegment])

  const fetchData = async () => {
    try {
      const [campRes, tempRes] = await Promise.all([
        axios.get(`${API_BASE}/campaigns`),
        axios.get(`${API_BASE}/templates`)
      ])
      setCampaigns(campRes.data)
      setTemplates(tempRes.data)
      if (tempRes.data.length > 0) {
        const retentionTemplate = tempRes.data.find(t => t.name === 'High Churn Retention Campaign')
        setNewCampaign(prev => ({ ...prev, template_id: retentionTemplate?.id || tempRes.data[0].id }))
      }
    } catch (error) {
      toast.error("Failed to load backend data. Is FastAPI running on port 8000?")
      console.error(error)
    }
  }

  const fetchSegmentPreview = async (seg) => {
    setLoadingPreview(true)
    try {
      const res = await axios.get(`${API_BASE}/segments/${seg}`)
      setSegmentPreview(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleCreateCampaign = async (e) => {
    e.preventDefault()
    try {
      if (!newCampaign.name || !newCampaign.template_id) {
        return toast.error("Please fill all required fields")
      }
      await axios.post(`${API_BASE}/campaigns`, newCampaign)
      toast.success("Campaign Draft Created")
      setNewCampaign({ ...newCampaign, name: '' })
      fetchData()
    } catch (err) {
      toast.error("Error creating campaign")
    }
  }

  const triggerCampaign = async (id) => {
    try {
      await axios.post(`${API_BASE}/campaigns/${id}/send`)
      toast.success("Campaign Triggered successfully! Check history.")
      fetchData()
    } catch (err) {
      toast.error("Failed to trigger campaign")
    }
  }

  const isRetentionCampaign = selectedSegment === RETENTION_SEGMENT
  const offerCounts = segmentPreview.reduce((acc, customer) => {
    const offerType = customer.attributes?.OfferType || 'No offer'
    acc[offerType] = (acc[offerType] || 0) + 1
    return acc
  }, {})
  const sampleRetentionCustomer = segmentPreview.find(customer => customer.attributes?.OfferCode)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <CalendarClock style={{ color: 'var(--accent-1)' }} size={32} />
          Email Campaigns
        </h1>
        <p className="text-secondary mt-1">Automate retention and engagement emails to specific segments.</p>
      </header>

      {isRetentionCampaign && (
        <section className="glass-card p-5 rounded-lg border border-subtle">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Gift size={20} style={{ color: 'var(--accent-1)' }} />
                <h2 className="text-xl font-semibold text-primary">High Churn Retention Automation</h2>
              </div>
              <p className="text-sm text-secondary max-w-2xl">
                The campaign targets customers marked as High churn risk, creates a unique fake demo email,
                generates a personal offer code, and attaches a redeem link plus QR code to the email.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-full lg:min-w-[520px]">
              {[
                { label: 'High-risk audience', value: segmentPreview.length, color: 'var(--danger)' },
                { label: 'Cashback', value: offerCounts.Cashback || 0, color: 'var(--success)' },
                { label: 'Discount QR', value: offerCounts['Discount QR'] || 0, color: 'var(--accent-1)' },
                { label: 'Reactivation', value: offerCounts['Reactivation Coupon'] || 0, color: 'var(--warning)' },
              ].map(item => (
                <div key={item.label} className="rounded-lg border border-subtle px-3 py-2" style={{ background: 'var(--control-bg)' }}>
                  <p className="text-xs text-secondary">{item.label}</p>
                  <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {sampleRetentionCustomer && (
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-4 border-t border-subtle pt-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-primary">Sample generated offer</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <p className="text-secondary">Customer: <span className="font-medium text-primary">{sampleRetentionCustomer.name}</span></p>
                  <p className="text-secondary">Fake email: <span className="font-medium text-primary">{sampleRetentionCustomer.email}</span></p>
                  <p className="text-secondary">Reason: <span className="font-medium text-primary">{sampleRetentionCustomer.attributes.ChurnReason}</span></p>
                  <p className="text-secondary">Offer: <span className="font-medium text-primary">{sampleRetentionCustomer.attributes.OfferType} ({sampleRetentionCustomer.attributes.OfferValue})</span></p>
                  <p className="text-secondary">Code: <span className="font-mono font-medium" style={{ color: 'var(--accent-1)' }}>{sampleRetentionCustomer.attributes.OfferCode}</span></p>
                  <a className="font-medium underline" style={{ color: 'var(--accent-1)' }} href={sampleRetentionCustomer.attributes.RedeemLink} target="_blank" rel="noreferrer">
                    Open redeem link
                  </a>
                </div>
              </div>
              <div className="rounded-lg border border-subtle p-3 flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
                <img
                  src={sampleRetentionCustomer.attributes.QRCodeImageUrl}
                  alt="Sample retention QR code"
                  className="w-32 h-32 rounded"
                />
              </div>
            </div>
          )}
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Campaign Form */}
        <div className="glass-card p-6 rounded-lg border border-subtle">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus size={20} style={{ color: 'var(--success)' }} />
            New Campaign
          </h2>
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div>
              <label className="block text-sm text-secondary mb-1">Campaign Name</label>
              <input 
                type="text" 
                required
                className="w-full border border-subtle rounded-lg px-4 py-2 text-primary focus:outline-none"
                style={{ background: 'var(--control-bg)' }}
                placeholder="e.g. High Churn Retention Campaign"
                value={newCampaign.name}
                onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm text-secondary mb-1 flex items-center gap-2">
                <ListFilter size={16} /> Target Segment
              </label>
              <select 
                className="w-full border border-subtle rounded-lg px-4 py-2 text-primary appearance-none"
                style={{ background: 'var(--control-bg)' }}
                value={newCampaign.target_segment}
                onChange={e => {
                  setNewCampaign({...newCampaign, target_segment: e.target.value})
                  setSelectedSegment(e.target.value)
                }}
              >
                {TARGET_SEGMENTS.map(segment => (
                  <option key={segment.value} value={segment.value}>{segment.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-secondary mb-1 flex items-center gap-2">
                <LayoutTemplate size={16} /> Email Template
              </label>
              <select 
                className="w-full border border-subtle rounded-lg px-4 py-2 text-primary appearance-none"
                style={{ background: 'var(--control-bg)' }}
                value={newCampaign.template_id}
                onChange={e => setNewCampaign({...newCampaign, template_id: parseInt(e.target.value)})}
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="w-full mt-4 py-2.5 btn-primary">
              Save Draft
            </button>
          </form>
        </div>

        {/* Middle/Right Column: Audience Preview */}
        <div className="lg:col-span-2 glass-card p-6 rounded-lg border border-subtle flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UserCheck size={20} style={{ color: 'var(--accent-1)' }} />
              Audience Preview ({segmentPreview.length})
            </span>
            <span className="text-xs px-3 py-1 rounded-full text-secondary border border-subtle" style={{ background: 'var(--control-bg)' }}>
              Segment: {selectedSegment}
            </span>
          </h2>
          
          <div className="flex-1 overflow-auto pr-2 rounded-lg border border-subtle" style={{ maxHeight: '360px', background: 'var(--control-bg)' }}>
            {loadingPreview ? (
              <p className="text-secondary p-4 text-center">Crunching Data...</p>
            ) : segmentPreview.length === 0 ? (
              <p className="text-secondary p-4 text-center">No customers match this segment criteria.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 border-b border-subtle" style={{ background: 'var(--bg-card)' }}>
                  <tr>
                    <th className="px-4 py-2 text-secondary font-medium">Customer</th>
                    <th className="px-4 py-2 text-secondary font-medium">Email</th>
                    <th className="px-4 py-2 text-secondary font-medium">Risk</th>
                    <th className="px-4 py-2 text-secondary font-medium">Reason</th>
                    <th className="px-4 py-2 text-secondary font-medium">Offer</th>
                    <th className="px-4 py-2 text-secondary font-medium">Code</th>
                    <th className="px-4 py-2 text-secondary font-medium">QR</th>
                    <th className="px-4 py-2 text-secondary font-medium">Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                  {segmentPreview.slice(0, 50).map(p => (
                    <tr key={p.customer_id}>
                      <td className="px-4 py-2 font-medium">{p.name}</td>
                      <td className="px-4 py-2 text-secondary">{p.email}</td>
                      <td className="px-4 py-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${p.churn_risk === 'High' ? 'badge-high' : 'badge-low'}`}>
                          {p.churn_risk}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-secondary min-w-44">
                        {p.attributes.ChurnReason || '-'}
                      </td>
                      <td className="px-4 py-2 text-secondary">
                        {p.attributes.OfferType ? `${p.attributes.OfferType}: ${p.attributes.OfferValue}` : '-'}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs" style={{ color: 'var(--accent-1)' }}>
                        {p.attributes.OfferCode || '-'}
                      </td>
                      <td className="px-4 py-2">
                        {p.attributes.QRCodeImageUrl ? (
                          <a href={p.attributes.RedeemLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--accent-1)' }}>
                            <QrCode size={14} /> Link
                          </a>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-2 font-mono">${(p.attributes.TotalSpend).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {segmentPreview.length > 50 && (
              <div className="p-3 text-center text-xs text-secondary italic border-t border-subtle" style={{ background: 'var(--bg-card)' }}>
                + {segmentPreview.length - 50} more users...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Active Campaigns and Logs */}
      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Campaign Management
        </h2>
        
        {campaigns.length === 0 ? (
          <p className="text-secondary glass-card p-6 text-center rounded-lg font-medium">No campaigns created yet.</p>
        ) : (
          campaigns.map(camp => (
            <div key={camp.id} className="glass-card p-6 rounded-lg border border-subtle flex flex-col md:flex-row gap-6 items-start">
              {/* Campaign Status Card */}
              <div className="w-full md:w-1/3 space-y-3">
                <div className="flex justify-between">
                  <h3 className="text-lg font-bold">{camp.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${
                    camp.status === 'DRAFT' ? 'bg-neutral-500/10 text-neutral-500' :
                    camp.status === 'SCHEDULED' ? 'bg-violet-500/10 text-violet-600' :
                    camp.status === 'RUNNING' ? 'bg-orange-500/10 text-orange-600' :
                    'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    {camp.status}
                  </span>
                </div>
                <p className="text-sm text-secondary">Target Object: <span className="font-bold text-primary">{camp.target_segment}</span></p>
                <p className="text-xs text-secondary mt-2">Created: {new Date(camp.created_at).toLocaleDateString()}</p>
                
                {camp.status === 'DRAFT' && (
                  <button 
                    onClick={() => triggerCampaign(camp.id)}
                    className="mt-4 w-full flex items-center justify-center gap-2 font-semibold px-4 py-2 rounded-lg transition-colors"
                    style={{ background: 'var(--success)', color: '#ffffff' }}
                  >
                    <Play size={16} fill="currentColor"/> Run Now
                  </button>
                )}
              </div>

              {/* Logs Table */}
              <div className="w-full md:w-2/3">
                <h4 className="text-sm font-semibold mb-2 text-secondary uppercase tracking-wider">Execution Logs</h4>
                <EmailHistoryTable campaignId={camp.id} />
              </div>
            </div>
          ))
        )}
      </div>

    </motion.div>
  )
}
