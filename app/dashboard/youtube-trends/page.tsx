'use client'

import { useState, useEffect } from 'react'
import { YouTubeLogo } from '@/components/ui/PlatformLogos'

type TabType = 'overview' | 'outliers' | 'niches' | 'categories'

interface Outlier {
  id: string
  youtubeVideoId: string
  outlierType: string
  outlierScore: number
  viewsVsBaseline: number
  detectedReasons: string[]
  title: string
  thumbnailUrl: string
}

interface TrendSnapshot {
  id: string
  capturedAt: string
  totalVideos: number
  avgViews: number
  avgEngagementRate: number
  outlierCount: number
}

interface Niche {
  id: string
  name: string
  trendScore: number
  trendDirection: string
  totalChannels: number
}

export default function YouTubeTrendsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [regionCode, setRegionCode] = useState('IN')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Overview data
  const [latestSnapshot, setLatestSnapshot] = useState<TrendSnapshot | null>(null)
  const [outliers, setOutliers] = useState<Outlier[]>([])
  const [niches, setNiches] = useState<Niche[]>([])

  // Categories
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const fetchOverview = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch categories
      const categoriesRes = await fetch(
        `/api/youtube/trends?action=categories&regionCode=${regionCode}`
      )
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.categories || [])
      }

      // Fetch latest snapshot
      const snapshotRes = await fetch(
        `/api/youtube/snapshots?regionCode=${regionCode}${selectedCategory ? `&categoryId=${selectedCategory}` : ''}&limit=1`
      )
      if (snapshotRes.ok) {
        const snapshotData = await snapshotRes.json()
        if (snapshotData.snapshots?.length > 0) {
          setLatestSnapshot(snapshotData.snapshots[0])
        }
      }

      // Fetch recent outliers
      const outliersRes = await fetch(
        `/api/youtube/outliers?regionCode=${regionCode}&limit=12`
      )
      if (outliersRes.ok) {
        const outliersData = await outliersRes.json()
        setOutliers(outliersData.outliers || [])
      }

      // Fetch niches
      const nichesRes = await fetch('/api/youtube/niche?action=list')
      if (nichesRes.ok) {
        const nichesData = await nichesRes.json()
        setNiches(nichesData.niches || [])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const collectNewSnapshot = async () => {
    setLoading(true)
    setError(null)

    try {
      const body: any = { regionCode }
      if (selectedCategory) {
        body.category = selectedCategory
      }

      const response = await fetch('/api/youtube/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('Failed to collect trends')
      }

      const data = await response.json()
      setLatestSnapshot({
        id: data.snapshotId,
        capturedAt: new Date().toISOString(),
        totalVideos: data.totalVideos,
        avgViews: data.avgViews,
        avgEngagementRate: data.avgEngagementRate,
        outlierCount: data.outlierCount,
      })

      // Refresh outliers
      const outliersRes = await fetch(
        `/api/youtube/outliers?regionCode=${regionCode}&limit=12`
      )
      if (outliersRes.ok) {
        const outliersData = await outliersRes.json()
        setOutliers(outliersData.outliers || [])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to collect trends')
    } finally {
      setLoading(false)
    }
  }

  const analyzeNiche = async (keyword: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/youtube/niche?action=analyze&keyword=${encodeURIComponent(keyword)}&regionCode=${regionCode}`
      )

      if (!response.ok) {
        throw new Error('Failed to analyze niche')
      }

      const data = await response.json()
      alert(`Analysis complete! Found ${data.totalVideos} videos with ${data.outlierCount} outliers.`)
    } catch (err: any) {
      setError(err.message || 'Failed to analyze niche')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [regionCode, selectedCategory])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <YouTubeLogo className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Trend Analytics</h1>
                <p className="text-sm text-gray-500">Track trends, outliers & niches</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={regionCode}
                onChange={(e) => setRegionCode(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="IN">India</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
              </select>
              <button
                onClick={collectNewSnapshot}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Collecting...' : 'Collect Trends'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('outliers')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'outliers'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Outliers
          </button>
          <button
            onClick={() => setActiveTab('niches')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'niches'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Niches
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'categories'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Categories
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            {latestSnapshot && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <p className="text-sm text-gray-500 mb-1">Videos Tracked</p>
                  <p className="text-3xl font-semibold text-gray-900">{latestSnapshot.totalVideos}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <p className="text-sm text-gray-500 mb-1">Avg Views</p>
                  <p className="text-3xl font-semibold text-gray-900">{formatNumber(Math.round(latestSnapshot.avgViews))}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <p className="text-sm text-gray-500 mb-1">Avg Engagement</p>
                  <p className="text-3xl font-semibold text-gray-900">{latestSnapshot.avgEngagementRate.toFixed(1)}%</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <p className="text-sm text-gray-500 mb-1">Outliers Detected</p>
                  <p className="text-3xl font-semibold text-red-600">{latestSnapshot.outlierCount}</p>
                </div>
              </div>
            )}

            {/* Recent Outliers */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Outliers</h2>
              {outliers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {outliers.slice(0, 6).map((outlier) => (
                    <div
                      key={outlier.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={outlier.thumbnailUrl || `https://i.ytimg.com/vi/${outlier.youtubeVideoId}/mqdefault.jpg`}
                          alt=""
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            {outlier.outlierType}
                          </span>
                          <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-2">
                            {outlier.title || `Video: ${outlier.youtubeVideoId}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {outlier.outlierScore.toFixed(1)}x outlier • {outlier.viewsVsBaseline.toFixed(1)}x views
                          </p>
                        </div>
                      </div>
                      {outlier.detectedReasons?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {outlier.detectedReasons.slice(0, 2).map((reason, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No outliers detected yet. Click "Collect Trends" to start.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'outliers' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">All Outliers</h2>
            {outliers.length > 0 ? (
              <div className="space-y-4">
                {outliers.map((outlier) => (
                  <div
                    key={outlier.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={outlier.thumbnailUrl || `https://i.ytimg.com/vi/${outlier.youtubeVideoId}/mqdefault.jpg`}
                          alt=""
                          className="w-32 h-20 object-cover rounded"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              {outlier.outlierType}
                            </span>
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                              {outlier.outlierScore.toFixed(1)}σ
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {outlier.title || `Video: ${outlier.youtubeVideoId}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {outlier.viewsVsBaseline.toFixed(1)}x above baseline
                          </p>
                        </div>
                      </div>
                      <a
                        href={`https://www.youtube.com/watch?v=${outlier.youtubeVideoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                      >
                        Watch
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No outliers detected yet.</p>
            )}
          </div>
        )}

        {activeTab === 'niches' && (
          <div className="space-y-6">
            {/* Niche Analyzer */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Analyze Niche</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  id="niche-keyword"
                  placeholder="Enter niche keyword (e.g., 'faceless cash cow', 'cricket highlights')"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement
                      analyzeNiche(target.value)
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('niche-keyword') as HTMLInputElement
                    if (input.value) analyzeNiche(input.value)
                  }}
                  disabled={loading}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Analyze
                </button>
              </div>
            </div>

            {/* Tracked Niches */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tracked Niches</h2>
              {niches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {niches.map((niche) => (
                    <div key={niche.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900">{niche.name}</h3>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        {niche.trendDirection === 'rising' && (
                          <span className="text-green-600">↑ Rising</span>
                        )}
                        {niche.trendDirection === 'stable' && (
                          <span className="text-gray-600">→ Stable</span>
                        )}
                        {niche.trendDirection === 'declining' && (
                          <span className="text-red-600">↓ Declining</span>
                        )}
                        <span>• {niche.totalChannels} channels</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No niches tracked yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setSelectedCategory('')}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  !selectedCategory
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <p className="font-medium">All Categories</p>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <p className="font-medium">{cat.name}</p>
                </button>
              ))}
            </div>
            {selectedCategory && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Filtering by category. Click "Collect Trends" to get data for this category.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
