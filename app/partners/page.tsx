'use client'

import { useState, useEffect } from 'react'

interface BusinessPartner {
  id: string
  business_name: string
  business_type: string
  region: string
  charity_ratio: number
  total_packages: number
  total_sales: number
  total_revenue: number
  charity_items_generated: number
  verified: boolean
  active: boolean
  joined_at: string
  contact_email: string
  contact_phone: string
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<BusinessPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all')

  useEffect(() => {
    fetchPartners()
  }, [filter])

  const fetchPartners = async () => {
    // TODO: Implement API endpoint
    setLoading(false)
    // Mock data for now
    setPartners([])
  }

  const handleVerify = async (partnerId: string) => {
    if (confirm('Verify this business partner?')) {
      // TODO: Implement verification
      alert('Partner verified!')
      fetchPartners()
    }
  }

  const handleToggleActive = async (partnerId: string, currentStatus: boolean) => {
    if (confirm(`${currentStatus ? 'Deactivate' : 'Activate'} this partner?`)) {
      // TODO: Implement toggle
      alert('Status updated!')
      fetchPartners()
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Business Partners</h1>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-orange-500' : 'bg-gray-700'}`}
          >
            All Partners
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-orange-500' : 'bg-gray-700'}`}
          >
            Pending Verification
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-4 py-2 rounded ${filter === 'verified' ? 'bg-orange-500' : 'bg-gray-700'}`}
          >
            Verified
          </button>
        </div>

        {/* Partners Table */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : partners.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No business partners yet</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Business</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Region</th>
                  <th className="px-4 py-3 text-right">Sales</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                  <th className="px-4 py-3 text-right">Charity</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id} className="border-t border-gray-700">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold">{partner.business_name}</div>
                        <div className="text-sm text-gray-400">{partner.contact_email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{partner.business_type}</td>
                    <td className="px-4 py-3 text-sm">{partner.region}</td>
                    <td className="px-4 py-3 text-right">{partner.total_sales}</td>
                    <td className="px-4 py-3 text-right">${partner.total_revenue.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-green-400">{partner.charity_items_generated}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${partner.verified ? 'bg-green-600' : 'bg-yellow-600'}`}>
                          {partner.verified ? 'Verified' : 'Pending'}
                        </span>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${partner.active ? 'bg-blue-600' : 'bg-gray-600'}`}>
                          {partner.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        {!partner.verified && (
                          <button
                            onClick={() => handleVerify(partner.id)}
                            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleActive(partner.id, partner.active)}
                          className={`px-3 py-1 rounded text-sm ${partner.active ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                          {partner.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
