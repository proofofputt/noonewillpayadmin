'use client'

import { useState } from 'react'
import { Line, Bar } from 'recharts'

export default function ReferralsAnalytics() {
  const [dateRange, setDateRange] = useState('7d')

  const topReferrers = [
    { email: 'alice@example.com', code: 'ALIC123456', referrals: 23, points: 2850, conversionRate: 87 },
    { email: 'bob@example.com', code: 'BOB1234567', referrals: 18, points: 2150, conversionRate: 82 },
    { email: 'carol@example.com', code: 'CARO123456', referrals: 15, points: 1920, conversionRate: 90 },
  ]

  const referralGrowth = [
    { date: '2024-01-01', referrals: 5, signups: 12 },
    { date: '2024-01-02', referrals: 8, signups: 18 },
    { date: '2024-01-03', referrals: 12, signups: 25 },
    { date: '2024-01-04', referrals: 15, signups: 32 },
    { date: '2024-01-05', referrals: 21, signups: 45 },
    { date: '2024-01-06', referrals: 28, signups: 58 },
    { date: '2024-01-07', referrals: 35, signups: 73 },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-bitcoin mb-2">Referral Analytics</h1>
            <p className="text-gray-400">Track referral performance and allocation distribution</p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Referrals"
            value="247"
            change="+23%"
            positive
            icon="🔗"
          />
          <MetricCard
            title="Conversion Rate"
            value="78%"
            change="+5%"
            positive
            icon="✅"
          />
          <MetricCard
            title="Avg Points/User"
            value="578"
            change="+12%"
            positive
            icon="⭐"
          />
          <MetricCard
            title="Total Allocation Pool"
            value="142,850"
            change="+18%"
            positive
            icon="💰"
          />
        </div>

        {/* Top Referrers */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-ordinal">Top Referrers</h2>
          <div className="space-y-3">
            {topReferrers.map((referrer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-950 rounded border border-gray-800"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-bitcoin">#{index + 1}</div>
                  <div>
                    <div className="font-medium">{referrer.email}</div>
                    <div className="text-sm text-gray-500 font-mono">{referrer.code}</div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Referrals</div>
                    <div className="text-xl font-bold">{referrer.referrals}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Points</div>
                    <div className="text-xl font-bold text-bitcoin">{referrer.points}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Conv. Rate</div>
                    <div className="text-xl font-bold text-green-400">{referrer.conversionRate}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Allocation Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-runes">Points Distribution</h2>
            <div className="space-y-4">
              <DistributionBar
                label="Personal Scores (35%)"
                value={35}
                color="bg-bitcoin"
                amount="49,897"
              />
              <DistributionBar
                label="Referral Bonuses (45%)"
                value={45}
                color="bg-ordinal"
                amount="64,282"
              />
              <DistributionBar
                label="Quality Bonuses (20%)"
                value={20}
                color="bg-runes"
                amount="28,570"
              />
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">Regional Breakdown</h2>
            <div className="space-y-3">
              <RegionRow region="DC" users={89} percentage={47} />
              <RegionRow region="MD" users={56} percentage={30} />
              <RegionRow region="VA" users={38} percentage={20} />
              <RegionRow region="Other" users={6} percentage={3} />
            </div>
          </div>
        </div>

        {/* Referral Network Graph */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h2 className="text-2xl font-bold mb-6">Referral Network</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-6xl mb-4">📊</p>
              <p>Network visualization coming soon</p>
              <p className="text-sm mt-2">View referral chains and connections</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  change,
  positive,
  icon
}: {
  title: string
  value: string
  change: string
  positive: boolean
  icon: string
}) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className={`text-sm ${positive ? 'text-green-400' : 'text-red-400'}`}>
          {change}
        </span>
      </div>
      <div className="text-3xl font-bold text-bitcoin mb-1">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  )
}

function DistributionBar({
  label,
  value,
  color,
  amount
}: {
  label: string
  value: number
  color: string
  amount: string
}) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-mono">{amount} pts</span>
      </div>
      <div className="bg-gray-800 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function RegionRow({ region, users, percentage }: { region: string; users: number; percentage: number }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-950 rounded">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-bitcoin rounded-lg flex items-center justify-center text-black font-bold">
          {region}
        </div>
        <div className="text-sm text-gray-400">{users} users</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-24 bg-gray-800 rounded-full h-2">
          <div
            className="bg-bitcoin h-2 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-sm font-bold w-12 text-right">{percentage}%</div>
      </div>
    </div>
  )
}
