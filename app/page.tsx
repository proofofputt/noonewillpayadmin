'use client'

import { useState, useEffect } from 'react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalResponses: 0,
    totalUsers: 0,
    byRegion: { DC: 0, MD: 0, VA: 0, OTHER: 0 },
    byDifficulty: { easy: 0, medium: 0, hard: 0 },
    recentSubmissions: []
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    // Mock data - replace with actual API call
    setStats({
      totalResponses: 247,
      totalUsers: 189,
      byRegion: { DC: 89, MD: 56, VA: 38, OTHER: 6 },
      byDifficulty: { easy: 189, medium: 189, hard: 189 },
      recentSubmissions: []
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-bitcoin mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">No One Will Pay - Survey Management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Responses"
            value={stats.totalResponses}
            icon="📊"
          />
          <StatCard
            title="Unique Users"
            value={stats.totalUsers}
            icon="👥"
          />
          <StatCard
            title="DC Participants"
            value={stats.byRegion.DC}
            icon="🏛️"
          />
          <StatCard
            title="Verified Phones"
            value={Math.floor(stats.totalUsers * 0.78)}
            icon="📱"
          />
        </div>

        {/* Region Distribution */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-ordinal">Region Distribution</h2>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(stats.byRegion).map(([region, count]) => (
              <div key={region} className="text-center">
                <div className="text-3xl font-bold text-bitcoin">{count}</div>
                <div className="text-gray-400">{region}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Question Difficulty Stats */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-runes">Question Performance</h2>
          <div className="space-y-4">
            <DifficultyBar difficulty="Easy" count={stats.byDifficulty.easy} color="green" />
            <DifficultyBar difficulty="Medium" count={stats.byDifficulty.medium} color="yellow" />
            <DifficultyBar difficulty="Hard" count={stats.byDifficulty.hard} color="red" />
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h2 className="text-2xl font-bold mb-4">Recent Submissions</h2>
          <div className="space-y-3">
            <SubmissionRow email="user@example.com" region="DC" time="2 min ago" />
            <SubmissionRow email="bitcoiner@proton.me" region="VA" time="15 min ago" />
            <SubmissionRow email="hodler@gmail.com" region="MD" time="1 hour ago" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className="text-3xl font-bold text-bitcoin">{value}</span>
      </div>
      <div className="text-gray-400 text-sm">{title}</div>
    </div>
  )
}

function DifficultyBar({ difficulty, count, color }: { difficulty: string; count: number; color: string }) {
  const colorMap = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm">{difficulty}</span>
        <span className="text-sm font-mono">{count}</span>
      </div>
      <div className="bg-gray-800 rounded-full h-2">
        <div className={`${colorMap[color as keyof typeof colorMap]} h-2 rounded-full`} style={{ width: '75%' }} />
      </div>
    </div>
  )
}

function SubmissionRow({ email, region, time }: { email: string; region: string; time: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-bitcoin rounded-full flex items-center justify-center text-black font-bold">
          {email[0].toUpperCase()}
        </div>
        <div>
          <div className="font-mono text-sm">{email}</div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
      </div>
      <div className="text-sm text-gray-400">{region}</div>
    </div>
  )
}
