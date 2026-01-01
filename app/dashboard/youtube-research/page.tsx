'use client'

import { useState, useEffect } from 'react'
import { YouTubeLogo } from '@/components/ui/PlatformLogos'
import RangeSlider from '@/components/ui/RangeSlider'
import ChannelFilters from '@/components/youtube/ChannelFilters'
import ProfileSelectorModal from '@/components/youtube/ProfileSelectorModal'

interface Video {
  id: string
  youtubeVideoId: string
  title: string
  description: string
  channelId: string
  channelTitle: string
  thumbnailUrl: string
  publishedAt: string
  views: number
  likes: number
  comments: number
  duration: string
  durationInSeconds?: number
  engagementRate: number
  viewsPerHour?: number
  meritScore?: number
  url: string
  subscriberCount?: number
  channelAvgViews?: number
  multiplier?: number
  avgViewsPerVideo?: number
  channelVideoCount?: number
  channelTotalViews?: string
}

interface Channel {
  id: string
  channelId: string
  title: string
  description: string
  thumbnailUrl: string
  subscriberCount: number
  videoCount: number
  viewCount: string
  url: string
}

interface Outlier {
  id: string
  youtubeVideoId: string
  outlierType: string
  outlierScore: number
  viewsVsBaseline: number
  detectedReasons: string[]
  title?: string
  thumbnailUrl?: string
  keyFactors?: any
  // Additional analytics fields
  views?: number
  likes?: number
  comments?: number
  engagementRate?: number
  channelTitle?: string
  publishedAt?: string
  niche?: string
  category?: string
  titleLength?: number
  hasNumber?: boolean
  hasQuestion?: boolean
  hasEmoji?: boolean
  duration?: string
}

interface Analytics {
  averageViews: number
  averageLikes: number
  averageEngagement: number
  averageTitleLength: number
  patterns: {
    numbersUsed: string
    questionsUsed: string
  }
  topPerformer: Video
}

type TabType = 'videos' | 'channels' | 'saved'

export default function YouTubeResearchPage() {
  const [activeTab, setActiveTab] = useState<TabType>('channels')
  const [searchQuery, setSearchQuery] = useState('')
  const [regionCode, setRegionCode] = useState('IN')
  const [maxResults, setMaxResults] = useState('12')
  const [videos, setVideos] = useState<Video[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fromCache, setFromCache] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  // Pagination state for trending-analysis API
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [prevPageToken, setPrevPageToken] = useState<string | null>(null)
  const [videoSortBy, setVideoSortBy] = useState<'merit' | 'views' | 'engagement' | 'newest'>('merit')
  const [uploadedAfterDays, setUploadedAfterDays] = useState(7)

  // Advanced filter state
  const [showFilters, setShowFilters] = useState(false)
  const [filterMultiplierMin, setFilterMultiplierMin] = useState(1.0)
  const [filterMultiplierMax, setFilterMultiplierMax] = useState(500)
  const [filterViewsMin, setFilterViewsMin] = useState(1000)
  const [filterViewsMax, setFilterViewsMax] = useState(5000000)
  const [filterSubscribersMin, setFilterSubscribersMin] = useState(1000)
  const [filterSubscribersMax, setFilterSubscribersMax] = useState(500000)
  const [filterDurationMin, setFilterDurationMin] = useState(60) // in seconds
  const [filterDurationMax, setFilterDurationMax] = useState(14400) // 4 hours
  const [filterPublishedAfter, setFilterPublishedAfter] = useState<string>('')
  const [selectedPublicationPeriod, setSelectedPublicationPeriod] = useState<string>('')
  const [filterLanguage, setFilterLanguage] = useState<string>('en')
  const [filterVideoDuration, setFilterVideoDuration] = useState<'any' | 'short' | 'medium' | 'long'>('any')
  const [viewMode, setViewMode] = useState<'details' | 'thumbnails'>('details')
  const [columnCount, setColumnCount] = useState(5)
  const [filterPresetName, setFilterPresetName] = useState('')
  const [savedFilters, setSavedFilters] = useState<any[]>([])
  const [showSavePreset, setShowSavePreset] = useState(false)

  // Channel-specific filters
  const [channelOrder, setChannelOrder] = useState<'relevance' | 'date' | 'viewCount' | 'rating' | 'title' | 'videoCount'>('viewCount')
  const [channelSubsMin, setChannelSubsMin] = useState(0)
  const [channelSubsMax, setChannelSubsMax] = useState(100000000)
  const [channelVideoCountMin, setChannelVideoCountMin] = useState(0)
  const [channelVideoCountMax, setChannelVideoCountMax] = useState(10000)
  const [channelViewsMin, setChannelViewsMin] = useState(0)
  const [channelViewsMax, setChannelViewsMax] = useState(100000000000)
  const [channelCountry, setChannelCountry] = useState<string>('')
  const [channelRelevanceLanguage, setChannelRelevanceLanguage] = useState<string>('en')
  const [showChannelFilters, setShowChannelFilters] = useState(false)

  // Trend analytics state
  const [trendData, setTrendData] = useState<any>(null)
  const [outliers, setOutliers] = useState<Outlier[]>([])
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [collectingTrends, setCollectingTrends] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en')

  // Outlier filters and sorting
  const [outlierTypeFilter, setOutlierTypeFilter] = useState<string>('all')
  const [outlierSortBy, setOutlierSortBy] = useState<string>('score')
  const [outlierSortOrder, setOutlierSortOrder] = useState<'asc' | 'desc'>('desc')
  const [outlierSearchQuery, setOutlierSearchQuery] = useState<string>('')

  // Channel pagination and view state
  const [channelCurrentPage, setChannelCurrentPage] = useState(1)
  const [channelItemsPerPage] = useState(12)
  const [channelViewMode, setChannelViewMode] = useState<'grid' | 'list'>('grid')

  // Saved content state
  const [savedListType, setSavedListType] = useState<'all' | 'favorites' | 'competitors' | 'inspiration'>('all')
  const [savedVideos, setSavedVideos] = useState<any[]>([])
  const [brandProfiles, setBrandProfiles] = useState<any[]>([])
  const [savedChannels, setSavedChannels] = useState<any[]>([])
  const [savedContentTab, setSavedContentTab] = useState<'videos' | 'channels'>('videos')
  const [loadingSaved, setLoadingSaved] = useState(false)

  // Profile selector modal state
  const [showProfileSelector, setShowProfileSelector] = useState(false)
  const [channelToSave, setChannelToSave] = useState<Channel | null>(null)
  const [saveChannelType, setSaveChannelType] = useState<'competitor' | 'inspirational' | null>(null)
  const [savingChannel, setSavingChannel] = useState(false)

  const formatNumber = (num: number | string): string => {
    const n = typeof num === 'string' ? parseInt(num) : num
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toString()
  }

  const formatFilterNumber = (num: number): string => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatFilterDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const setPublicationDateFilter = (period: string) => {
    setSelectedPublicationPeriod(period)

    if (!period) {
      setFilterPublishedAfter('')
      return
    }

    const now = new Date()
    let date = new Date()

    switch(period) {
      case 'week':
        date.setDate(now.getDate() - 7)
        break
      case 'month':
        date.setMonth(now.getMonth() - 1)
        break
      case '3months':
        date.setMonth(now.getMonth() - 3)
        break
      case '6months':
        date.setMonth(now.getMonth() - 6)
        break
      case 'year':
        date.setFullYear(now.getFullYear() - 1)
        break
      case '2years':
        date.setFullYear(now.getFullYear() - 2)
        break
      default:
        setFilterPublishedAfter('')
        return
    }

    setFilterPublishedAfter(date.toISOString())
  }

  const resetFilters = () => {
    setFilterMultiplierMin(1.0)
    setFilterMultiplierMax(500)
    setFilterViewsMin(1000)
    setFilterViewsMax(5000000)
    setFilterSubscribersMin(1000)
    setFilterSubscribersMax(500000)
    setFilterDurationMin(60)
    setFilterDurationMax(14400)
    setFilterPublishedAfter('')
    setSelectedPublicationPeriod('')
    setFilterLanguage('en')
    setFilterVideoDuration('any')
  }

  const handleChannelFilterChange = (newFilters: any) => {
    setChannelOrder(newFilters.order)
    setChannelSubsMin(newFilters.subsMin)
    setChannelSubsMax(newFilters.subsMax)
    setChannelVideoCountMin(newFilters.videoCountMin)
    setChannelVideoCountMax(newFilters.videoCountMax)
    setChannelViewsMin(newFilters.viewsMin)
    setChannelViewsMax(newFilters.viewsMax)
    setChannelCountry(newFilters.country)
    setChannelRelevanceLanguage(newFilters.language)
  }

  const handleApplyChannelFilters = () => {
    handleChannelSearch()
    setShowChannelFilters(false)
  }

  const handleResetChannelFilters = () => {
    setChannelOrder('viewCount')
    setChannelSubsMin(0)
    setChannelSubsMax(100000000)
    setChannelVideoCountMin(0)
    setChannelVideoCountMax(10000)
    setChannelViewsMin(0)
    setChannelViewsMax(100000000000)
    setChannelCountry('')
    setChannelRelevanceLanguage('en')
    handleChannelSearch()
  }

  const saveFilterPreset = async () => {
    if (!filterPresetName.trim()) {
      alert('Please enter a preset name')
      return
    }

    try {
      const preset = {
        name: filterPresetName,
        filters: {
          multiplierMin: filterMultiplierMin,
          multiplierMax: filterMultiplierMax,
          viewsMin: filterViewsMin,
          viewsMax: filterViewsMax,
          subscribersMin: filterSubscribersMin,
          subscribersMax: filterSubscribersMax,
          durationMin: filterDurationMin,
          durationMax: filterDurationMax,
          publishedAfter: filterPublishedAfter,
          publicationPeriod: selectedPublicationPeriod,
          language: filterLanguage,
          videoDuration: filterVideoDuration,
        }
      }

      const response = await fetch('/api/youtube/filter-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preset)
      })

      if (response.ok) {
        const data = await response.json()
        setSavedFilters([...savedFilters, data.preset])
        setFilterPresetName('')
        setShowSavePreset(false)
        alert('Filter preset saved successfully!')
      }
    } catch (err) {
      console.error('Failed to save filter preset:', err)
      alert('Failed to save filter preset')
    }
  }

  const loadFilterPreset = (preset: any) => {
    const filters = preset.filters
    setFilterMultiplierMin(filters.multiplierMin)
    setFilterMultiplierMax(filters.multiplierMax)
    setFilterViewsMin(filters.viewsMin)
    setFilterViewsMax(filters.viewsMax)
    setFilterSubscribersMin(filters.subscribersMin)
    setFilterSubscribersMax(filters.subscribersMax)
    setFilterDurationMin(filters.durationMin)
    setFilterDurationMax(filters.durationMax)
    setFilterPublishedAfter(filters.publishedAfter)
    setSelectedPublicationPeriod(filters.publicationPeriod || '')
    setFilterLanguage(filters.language)
    setFilterVideoDuration(filters.videoDuration)
  }

  const fetchSavedFilters = async () => {
    try {
      const response = await fetch('/api/youtube/filter-presets')
      if (response.ok) {
        const data = await response.json()
        setSavedFilters(data.presets || [])
      }
    } catch (err) {
      console.error('Failed to fetch saved filters:', err)
    }
  }

  const deleteFilterPreset = async (presetId: string) => {
    if (!confirm('Are you sure you want to delete this filter preset?')) return

    try {
      await fetch(`/api/youtube/filter-presets?presetId=${presetId}`, { method: 'DELETE' })
      setSavedFilters(savedFilters.filter(p => p.id !== presetId))
    } catch (err) {
      console.error('Failed to delete filter preset:', err)
    }
  }

  const formatDuration = (duration: string | undefined): string => {
    if (!duration) return '--:--'
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return '--:--'
    const hours = match[1] ? parseInt(match[1]) : 0
    const minutes = match[2] ? parseInt(match[2]) : 0
    const seconds = match[3] ? parseInt(match[3]) : 0
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSearch = async (pageToken?: string) => {
    setLoading(true)
    setError(null)
    setFromCache(false)
    if (!pageToken) setCurrentPage(1) // Reset to first page on new search

    try {
      const params = new URLSearchParams({
        maxResults,
        regionCode,
        sortBy: videoSortBy,
        uploadedAfterDays: uploadedAfterDays.toString(),
      })

      // Add search query if provided
      if (searchQuery && searchQuery.trim()) {
        params.set('q', searchQuery.trim())
      }

      // Add pagination token if provided for "Load More"
      if (pageToken) {
        params.set('pageToken', pageToken)
      }

      // Add filter parameters
      params.set('minEngagementRate', filterMultiplierMin.toString()) // Using multiplier as engagement rate proxy
      params.set('maxEngagementRate', filterMultiplierMax.toString())
      params.set('minViews', filterViewsMin.toString())
      params.set('maxViews', filterViewsMax.toString())
      params.set('minSubscribers', filterSubscribersMin.toString())
      params.set('maxSubscribers', filterSubscribersMax.toString())
      params.set('minDuration', filterDurationMin.toString())
      params.set('maxDuration', filterDurationMax.toString())

      const response = await fetch(`/api/youtube/trending-analysis?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        if (data.setupRequired) {
          setError('YouTube API key not configured. Please add YOUTUBE_API_KEY to your .env file.')
        } else {
          setError(data.error || 'Failed to fetch videos')
        }
        return
      }

      // If this is a "Load More" request, append to existing videos
      if (pageToken) {
        setVideos(prev => [...prev, ...(data.videos || [])])
      } else {
        setVideos(data.videos || [])
      }

      setAnalytics(data.analytics || null)
      setFromCache(data.fromCache || false)

      // Store pagination tokens for "Load More" functionality
      setNextPageToken(data.pagination?.nextPageToken || null)
      setPrevPageToken(data.pagination?.prevPageToken || null)

      console.log(`Loaded ${data.videos?.length || 0} videos. Next token: ${data.pagination?.nextPageToken}`)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch videos')
    } finally {
      setLoading(false)
    }
  }

  const handleChannelSearch = async () => {
    setLoading(true)
    setError(null)
    setChannelCurrentPage(1) // Reset to first page on new search

    try {
      // Build query parameters for advanced filtering
      const params = new URLSearchParams()

      // Only add query if provided - empty query returns trending channels
      if (searchQuery.trim()) {
        params.set('q', searchQuery)
      }

      // Add max results
      params.set('maxResults', maxResults)

      // Add region code and language
      params.set('regionCode', regionCode)
      params.set('relevanceLanguage', channelRelevanceLanguage)

      // Add sort order
      params.set('order', channelOrder)

      // Add subscriber count filters
      params.set('subscriberCountMin', channelSubsMin.toString())
      params.set('subscriberCountMax', channelSubsMax.toString())

      // Add video count filters
      params.set('videoCountMin', channelVideoCountMin.toString())
      params.set('videoCountMax', channelVideoCountMax.toString())

      // Add total views filters
      params.set('viewCountMin', channelViewsMin.toString())
      params.set('viewCountMax', channelViewsMax.toString())

      // Add country filter if specified
      if (channelCountry) {
        params.set('country', channelCountry)
      }

      const url = `/api/youtube/channels?${params.toString()}`
      console.log('Fetching channels from:', url)

      const response = await fetch(url)
      const data = await response.json()

      console.log('Channel API response status:', response.status)
      console.log('Channel API response data:', data)

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to fetch channels'
        console.error('Channel API error:', errorMessage, data)

        if (data.setupRequired) {
          setError('⚠️ YouTube API not configured. Please set YOUTUBE_API_KEY in your .env file to use channel discovery.')
        } else {
          setError(errorMessage)
        }
        return
      }

      const channelCount = data.channels?.length || 0
      console.log(`Successfully loaded ${channelCount} channels`)
      setChannels(data.channels || [])
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch channels'
      console.error('Channel search exception:', err)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const collectTrends = async () => {
    setCollectingTrends(true)
    setError(null)

    try {
      const body: any = { regionCode, maxResults: 50 }
      if (selectedCategory) {
        body.category = selectedCategory
      }

      const response = await fetch('/api/youtube/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to collect trends')
      }

      const data = await response.json()
      setTrendData({
        totalVideos: data.totalVideos,
        avgViews: data.avgViews,
        avgEngagementRate: data.avgEngagementRate,
        outlierCount: data.outlierCount,
      })

      // Refresh outliers
      fetchOutliers()

      // Refresh video search with trending
      setSearchQuery('') // Clear search query to trigger trending
      await handleSearch()
    } catch (err: any) {
      setError(err.message || 'Failed to collect trends')
    } finally {
      setCollectingTrends(false)
    }
  }

  const analyzeNiche = async (keyword: string) => {
    if (!keyword.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/youtube/niche?action=analyze&keyword=${encodeURIComponent(keyword)}&regionCode=${regionCode}&maxResults=24`
      )

      if (!response.ok) {
        throw new Error('Failed to analyze niche')
      }

      const data = await response.json()

      // Set analytics from the response
      if (data.analytics) {
        setAnalytics({
          averageViews: data.analytics.averageViews,
          averageLikes: data.analytics.averageLikes,
          averageEngagement: data.analytics.averageEngagement,
          averageTitleLength: data.analytics.averageTitleLength || 0,
          patterns: data.analytics.patterns || { numbersUsed: '0%', questionsUsed: '0%' },
          topPerformer: data.videos?.[0] || {} as Video,
        })
      }

      // Set videos from the response
      setVideos(data.videos || [])

      // Switch to videos tab to show results
      setActiveTab('videos')

      // Update search query
      setSearchQuery(keyword)
    } catch (err: any) {
      setError(err.message || 'Failed to analyze niche')
    } finally {
      setLoading(false)
    }
  }

  const fetchOutliers = async () => {
    try {
      const response = await fetch(`/api/youtube/outliers?regionCode=${regionCode}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        const enrichedOutliers = await Promise.all(
          (data.outliers || []).map(async (outlier: Outlier) => {
            // Fetch video details to get more analytics
            try {
              const videoRes = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${outlier.youtubeVideoId}&key=${process.env.YOUTUBE_API_KEY}`
              )
              if (videoRes.ok) {
                const videoData = await videoRes.json()
                if (videoData.items?.[0]) {
                  const video = videoData.items[0]
                  const stats = video.statistics
                  const views = parseInt(stats.viewCount || '0')
                  const likes = parseInt(stats.likeCount || '0')
                  const comments = parseInt(stats.commentCount || '0')
                  const engagement = views > 0 ? ((likes + comments) / views * 100) : 0

                  // Analyze title
                  const title = video.snippet.title
                  const hasNumber = /\d/.test(title)
                  const hasQuestion = /\?/.test(title)
                  const hasEmoji = /[\u{1F600}-\u{1F64F}]/u.test(title)

                  return {
                    ...outlier,
                    title,
                    thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url || outlier.thumbnailUrl,
                    channelTitle: video.snippet.channelTitle,
                    publishedAt: video.snippet.publishedAt,
                    views,
                    likes,
                    comments,
                    engagementRate: engagement,
                    duration: video.contentDetails?.duration,
                    titleLength: title.length,
                    hasNumber,
                    hasQuestion,
                    hasEmoji,
                  }
                }
              }
            } catch (err) {
              console.error('Failed to fetch video details:', err)
            }
            return outlier
          })
        )
        setOutliers(enrichedOutliers)
      }
    } catch (err) {
      console.error('Failed to fetch outliers:', err)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/youtube/trends?action=categories&regionCode=${regionCode}`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const handleSaveVideo = async (video: Video) => {
    try {
      const response = await fetch('/api/youtube/videos/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeVideoId: video.youtubeVideoId,
          title: video.title,
          description: video.description,
          channelId: video.channelId,
          channelTitle: video.channelTitle,
          thumbnailUrl: video.thumbnailUrl,
          publishedAt: video.publishedAt,
          viewCount: video.views,
          likeCount: video.likes,
          commentCount: video.comments,
          duration: video.duration,
          engagementRate: video.engagementRate,
          subscriberCount: video.subscriberCount,
          channelAvgViews: video.channelAvgViews,
          multiplier: video.multiplier,
        })
      })

      if (response.ok) {
        alert('Video saved successfully!')
      }
    } catch (err) {
      console.error('Failed to save video:', err)
    }
  }

  const handleSaveChannel = async (channel: Channel, type: 'competitor' | 'inspirational') => {
    try {
      // Fetch profiles to find available ones
      const profiles = await fetchBrandProfiles()

      // Store channel data and show modal
      setChannelToSave(channel)
      setSaveChannelType(type)
      setShowProfileSelector(true)
    } catch (err) {
      console.error('Failed to fetch brand profiles:', err)
    }
  }

  const saveChannelToProfile = async (profileId: string) => {
    if (!channelToSave || !saveChannelType) return

    setSavingChannel(true)
    try {
      const response = await fetch(`/api/brand-profiles/${profileId}/channels`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelUrl: channelToSave.url,
          type: saveChannelType === 'competitor' ? 'competitor' : 'inspiration',
        })
      })

      if (response.ok) {
        // Close modal and reset state
        setShowProfileSelector(false)
        setChannelToSave(null)
        setSaveChannelType(null)

        // Refresh brand profiles
        await fetchBrandProfiles()

        // Show success message
        const data = await response.json()
        const profileName = data.profile?.name || 'Profile'
        const typeLabel = saveChannelType === 'competitor' ? 'Competitor' : 'Inspiration'
        console.log(`✅ Channel saved as ${typeLabel} to "${profileName}"`)
      } else {
        const data = await response.json()
        console.error('Failed to save channel:', data.error)
      }
    } catch (err) {
      console.error('Failed to save channel:', err)
    } finally {
      setSavingChannel(false)
    }
  }

  const handleProfileSelectorCancel = () => {
    setShowProfileSelector(false)
    setChannelToSave(null)
    setSaveChannelType(null)
  }

  const removeChannelFromProfile = async (profileId: string, channelUrl: string, type: 'competitor' | 'inspiration') => {
    if (!confirm(`Are you sure you want to remove this ${type} channel?`)) return

    try {
      const response = await fetch(`/api/brand-profiles/${profileId}/channels?channelId=${encodeURIComponent(channelUrl)}&type=${type}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        // Refresh brand profiles to update the display
        await fetchBrandProfiles()
        console.log('✅ Channel removed successfully')
      } else {
        const data = await response.json()
        console.error('Failed to remove channel:', data.error)
      }
    } catch (err) {
      console.error('Failed to remove channel:', err)
    }
  }

  const fetchSavedContent = async () => {
    setLoadingSaved(true)
    try {
      if (savedContentTab === 'videos') {
        const listParam = savedListType === 'all' ? '' : `?listType=${savedListType}`
        const response = await fetch(`/api/youtube/videos/save${listParam}`)
        const data = await response.json()
        setSavedVideos(data.videos || [])
      } else {
        const listParam = savedListType === 'all' ? '' : `?listType=${savedListType === 'competitors' ? 'competitors' : savedListType === 'inspiration' ? 'inspiration' : ''}`
        const response = await fetch(`/api/youtube/channels/save${listParam}`)
        const data = await response.json()
        setSavedChannels(data.channels || [])
      }
    } catch (err) {
      console.error('Failed to fetch saved content:', err)
    } finally {
      setLoadingSaved(false)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this saved video?')) return

    try {
      await fetch(`/api/youtube/videos/save?videoId=${videoId}`, { method: 'DELETE' })
      setSavedVideos(savedVideos.filter(v => v.youtubeVideoId !== videoId))
    } catch (err) {
      console.error('Failed to delete video:', err)
    }
  }

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm('Are you sure you want to delete this saved channel?')) return

    try {
      await fetch(`/api/youtube/channels/save?channelId=${channelId}`, { method: 'DELETE' })
      setSavedChannels(savedChannels.filter(c => c.channelId !== channelId))
    } catch (err) {
      console.error('Failed to delete channel:', err)
    }
  }

  // VidIQ-style analysis metrics
  const calculateEngagementMetrics = (video: any) => {
    const engagement = {
      engagementRate: 0,
      engagementScore: 0,
      views: video.views || 0,
      likes: video.likes || 0,
      comments: video.comments || 0,
      videoScore: 0
    }

    if (engagement.views > 0) {
      // Engagement Rate: (likes + comments) / views * 100
      engagement.engagementRate = ((engagement.likes + engagement.comments) / engagement.views) * 100
      // Video Score (0-100): based on engagement rate and view count
      engagement.engagementScore = Math.min(100, engagement.engagementRate * 10)
      engagement.videoScore = Math.min(100, (engagement.likes / engagement.views) * 50 + (engagement.comments / engagement.views) * 50)
    }

    return engagement
  }

  const getVideoQualityScore = (video: any) => {
    const metrics = calculateEngagementMetrics(video)
    const title = video.title || ''

    let score = 50 // Base score

    // Engagement score (0-30 points)
    score += Math.min(30, metrics.engagementRate * 3)

    // Title optimization (0-10 points)
    if (title.length > 30 && title.length < 60) score += 10 // Optimal length
    if (title.includes('|') || title.includes(':')) score += 5 // Has separators
    if (/\d/.test(title)) score += 3 // Contains numbers
    if (title.toUpperCase() === title.slice(-5)) score += 2 // Caps emphasis

    // View count (0-10 points)
    if (video.views > 100000) score += 10
    else if (video.views > 50000) score += 7
    else if (video.views > 10000) score += 5

    return Math.min(100, score)
  }

  const getChannelHealthScore = (channel: any) => {
    let score = 50 // Base score

    if (!channel) return score

    // Subscriber growth indicator (estimated)
    const avgViewsPerVideo = channel.viewCount ? parseInt(channel.viewCount) / (channel.videoCount || 1) : 0
    const viewToSubRatio = avgViewsPerVideo / (channel.subscriberCount || 1)

    // Engagement indicator
    if (viewToSubRatio > 100) score += 20 // Very high engagement
    else if (viewToSubRatio > 50) score += 15
    else if (viewToSubRatio > 10) score += 10

    // Activity level (video count)
    if (channel.videoCount > 500) score += 15
    else if (channel.videoCount > 200) score += 10
    else if (channel.videoCount > 100) score += 5

    // Subscriber count
    if (channel.subscriberCount > 1000000) score += 15
    else if (channel.subscriberCount > 100000) score += 10
    else if (channel.subscriberCount > 10000) score += 5

    return Math.min(100, score)
  }

  // Filter and sort outliers
  const filteredOutliers = outliers
    .filter((outlier) => {
      // Filter by type
      if (outlierTypeFilter !== 'all' && outlier.outlierType !== outlierTypeFilter) {
        return false
      }

      // Filter by search query
      if (outlierSearchQuery.trim()) {
        const searchLower = outlierSearchQuery.toLowerCase()
        const title = outlier.title?.toLowerCase() || ''
        const channelTitle = outlier.channelTitle?.toLowerCase() || ''
        const videoId = outlier.youtubeVideoId.toLowerCase()
        return title.includes(searchLower) || channelTitle.includes(searchLower) || videoId.includes(searchLower)
      }

      return true
    })
    .sort((a, b) => {
      let comparison = 0
      switch (outlierSortBy) {
        case 'score':
          comparison = a.outlierScore - b.outlierScore
          break
        case 'views':
          comparison = (a.views || 0) - (b.views || 0)
          break
        case 'engagement':
          comparison = (a.engagementRate || 0) - (b.engagementRate || 0)
          break
        case 'titleLength':
          comparison = (a.titleLength || 0) - (b.titleLength || 0)
          break
        case 'publishedAt':
          comparison = new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime()
          break
        default:
          comparison = 0
      }
      return outlierSortOrder === 'asc' ? comparison : -comparison
    })

  // Fetch saved content when switching to saved tab
  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedContent()
    }
  }, [activeTab, savedContentTab, savedListType])

  // Load trending videos on initial mount and when switching to videos tab
  useEffect(() => {
    if (activeTab === 'videos' && videos.length === 0) {
      handleSearch()
    }
  }, [activeTab])

  // Re-fetch when maxResults changes (only after initial load)
  useEffect(() => {
    if (videos.length > 0) {
      handleSearch()
    }
  }, [maxResults])

  // Fetch categories and outliers on mount
  useEffect(() => {
    fetchCategories()
    fetchOutliers()
    fetchSavedFilters()
    fetchBrandProfiles() // Pre-load brand profiles
  }, [regionCode])

  // Auto-load trending channels on mount (so they're ready when switching to channels tab)
  useEffect(() => {
    console.log('YouTube Research Page mounted. Initial channels length:', channels.length, 'Loading:', loading)

    // Only load if channels haven't been loaded yet
    if (channels.length === 0) {
      console.log('Calling handleChannelSearch to load trending channels...')
      handleChannelSearch()
    }
  }, []) // Run once on mount - handleChannelSearch uses current state from closure

  const fetchBrandProfiles = async () => {
    try {
      const response = await fetch('/api/brand-profiles', {
        credentials: 'include'
      })
      const data = await response.json()
      if (response.ok) {
        setBrandProfiles(data.profiles || [])
        return data.profiles || []
      } else {
        console.error('Failed to fetch brand profiles:', data.error)
        return []
      }
    } catch (err) {
      console.error('Failed to fetch brand profiles:', err)
      return []
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (activeTab === 'videos') {
        handleSearch()
      } else if (activeTab === 'channels') {
        handleChannelSearch()
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <YouTubeLogo className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">YouTube Research & Trends</h1>
              <p className="text-sm text-gray-500">Analyze competitors, trends & outliers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error State */}
        {error && (
          <div className={`border rounded-xl p-4 mb-6 flex gap-3 items-start ${
            error.includes('YouTube API')
              ? 'bg-amber-50 border-amber-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className={`flex-shrink-0 text-xl ${
              error.includes('YouTube API') ? 'text-amber-600' : 'text-red-600'
            }`}>
              {error.includes('YouTube API') ? '⚠️' : '❌'}
            </div>
            <div className="flex-1">
              <p className={`${
                error.includes('YouTube API')
                  ? 'text-amber-800'
                  : 'text-red-700'
              }`}>
                {error}
              </p>
              {error.includes('YouTube API') && (
                <p className="text-sm text-amber-700 mt-2">
                  <strong>Setup Required:</strong> Add your YouTube API key to your <code className="bg-amber-100 px-2 py-1 rounded">.env</code> file as <code className="bg-amber-100 px-2 py-1 rounded">YOUTUBE_API_KEY=your_key_here</code>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'videos'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'channels'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Channels
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'saved'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Saved
          </button>
        </div>

        {activeTab === 'videos' && (
          <>
            {/* Search Controls */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-[2]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Query
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search for videos or leave empty for trending..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={videoSortBy}
                    onChange={(e) => setVideoSortBy(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="merit">Merit Score</option>
                    <option value="views">Most Views</option>
                    <option value="engagement">Engagement</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Per Page
                  </label>
                  <select
                    value={maxResults}
                    onChange={(e) => setMaxResults(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50 (Max)</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                  </button>
                  <button
                    onClick={() => handleSearch()}
                    disabled={loading}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Filters Modal */}
            {showFilters && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Advanced Filters</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Fine-tune your search</p>
                      </div>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={resetFilters}
                        className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        Reset All
                      </button>
                      <button
                        onClick={() => setShowSavePreset(true)}
                        className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Save Preset
                      </button>
                      <button
                        onClick={() => { handleSearch(); setShowFilters(false); }}
                        className="ml-auto px-5 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-sm"
                      >
                        Apply & Search
                      </button>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Saved Presets */}
                    {savedFilters.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          Saved Presets
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {savedFilters.map((preset) => (
                            <div key={preset.id} className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 flex items-center gap-2">
                              <button
                                onClick={() => loadFilterPreset(preset)}
                                className="text-xs font-medium text-gray-700 hover:text-red-600 transition-colors"
                              >
                                {preset.name}
                              </button>
                              <button
                                onClick={() => deleteFilterPreset(preset.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      {/* Main Filters Column */}
                      <div className="lg:col-span-2 space-y-3">
                        {/* All Filters - 2x2 Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Viral Multiplier */}
                          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-3.5">
                            <div className="flex items-start gap-2 mb-3">
                              <div className="p-1 bg-red-500 rounded-md">
                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-gray-900 mb-0.5">Multiplier (Viral Filter)</h4>
                                <p className="text-xs text-gray-600">Find videos that got {filterMultiplierMin.toFixed(1)}x-{filterMultiplierMax.toFixed(0)}x more views than channel avg</p>
                              </div>
                            </div>
                            <RangeSlider
                              min={1.0}
                              max={500}
                              step={0.1}
                              valueMin={filterMultiplierMin}
                              valueMax={filterMultiplierMax}
                              onChangeMin={setFilterMultiplierMin}
                              onChangeMax={setFilterMultiplierMax}
                              formatValue={(v) => `${v.toFixed(1)}x`}
                              color="red"
                            />
                          </div>

                          {/* Views Filter */}
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Views
                            </h4>
                            <RangeSlider
                              min={1000}
                              max={100000000}
                              step={1000}
                              valueMin={filterViewsMin}
                              valueMax={filterViewsMax}
                              onChangeMin={setFilterViewsMin}
                              onChangeMax={setFilterViewsMax}
                              formatValue={formatFilterNumber}
                              color="blue"
                            />
                          </div>

                          {/* Subscribers Filter */}
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Subscribers
                            </h4>
                            <RangeSlider
                              min={1000}
                              max={10000000}
                              step={1000}
                              valueMin={filterSubscribersMin}
                              valueMax={filterSubscribersMax}
                              onChangeMin={setFilterSubscribersMin}
                              onChangeMax={setFilterSubscribersMax}
                              formatValue={formatFilterNumber}
                              color="purple"
                            />
                          </div>

                          {/* Video Duration */}
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Video duration
                            </h4>
                            <RangeSlider
                              min={60}
                              max={14400}
                              step={60}
                              valueMin={filterDurationMin}
                              valueMax={filterDurationMax}
                              onChangeMin={setFilterDurationMin}
                              onChangeMax={setFilterDurationMax}
                              formatValue={formatFilterDuration}
                              color="green"
                            />
                          </div>
                        </div>

                        {/* Publication Date */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2.5 flex items-center gap-2">
                            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Publication date
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: 'All time', value: '' },
                              { label: 'Last week', value: 'week' },
                              { label: 'Last month', value: 'month' },
                              { label: 'Last 3 months', value: '3months' },
                              { label: 'Last 6 months', value: '6months' },
                              { label: 'Last year', value: 'year' },
                              { label: 'Last 2 years', value: '2years' },
                            ].map((option) => {
                              const isActive = selectedPublicationPeriod === option.value
                              return (
                                <button
                                  key={option.value}
                                  onClick={() => setPublicationDateFilter(option.value)}
                                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                    isActive
                                      ? 'bg-orange-500 text-white shadow-sm'
                                      : 'bg-white border border-gray-300 text-gray-700 hover:border-orange-300 hover:text-orange-600'
                                  }`}
                                >
                                  {option.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* View Settings Column */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900">View Settings</h3>

                        {/* Language */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <label className="text-xs font-semibold text-gray-900 mb-2 block">Language</label>
                          <select
                            value={filterLanguage}
                            onChange={(e) => setFilterLanguage(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                          >
                            <option value="en">English</option>
                            <option value="hi">Hindi (हिन्दी)</option>
                            <option value="ta">Tamil (தமிழ்)</option>
                            <option value="te">Telugu (తెలుగు)</option>
                            <option value="mr">Marathi (मराठी)</option>
                            <option value="bn">Bengali (বাংলা)</option>
                            <option value="gu">Gujarati (ગુજરાતી)</option>
                            <option value="kn">Kannada (ಕನ್ನಡ)</option>
                            <option value="ml">Malayalam (മലയാളം)</option>
                            <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                            <option value="or">Odia (ଓଡ଼ିଆ)</option>
                            <option value="as">Assamese (অসমীয়া)</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="ja">Japanese</option>
                            <option value="ko">Korean</option>
                            <option value="pt">Portuguese</option>
                            <option value="ru">Russian</option>
                            <option value="zh">Chinese</option>
                            <option value="ar">Arabic</option>
                          </select>
                        </div>

                        {/* Video Type */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <label className="text-xs font-semibold text-gray-900 mb-2 block">Video Type</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => setFilterVideoDuration('long')}
                              className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                                filterVideoDuration === 'long'
                                  ? 'bg-red-500 text-white shadow-sm'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:border-red-300'
                              }`}
                            >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                              Long
                            </button>
                            <button
                              onClick={() => setFilterVideoDuration('short')}
                              className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                                filterVideoDuration === 'short'
                                  ? 'bg-red-500 text-white shadow-sm'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:border-red-300'
                              }`}
                            >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                              </svg>
                              Short
                            </button>
                          </div>
                        </div>

                        {/* View Mode */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <label className="text-xs font-semibold text-gray-900 mb-2 block">Display Mode</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => setViewMode('details')}
                              className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                                viewMode === 'details'
                                  ? 'bg-red-500 text-white shadow-sm'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:border-red-300'
                              }`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                              </svg>
                              Details
                            </button>
                            <button
                              onClick={() => setViewMode('thumbnails')}
                              className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                                viewMode === 'thumbnails'
                                  ? 'bg-red-500 text-white shadow-sm'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:border-red-300'
                              }`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                              </svg>
                              Grid
                            </button>
                          </div>
                        </div>

                        {/* Column Count */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <label className="text-xs font-semibold text-gray-900 mb-2 block text-center">Columns</label>
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => setColumnCount(Math.max(1, columnCount - 1))}
                              className="w-8 h-8 bg-white border border-gray-300 text-gray-700 rounded-md hover:border-red-500 hover:text-red-500 transition-all font-bold text-lg"
                            >
                              -
                            </button>
                            <span className="text-2xl font-bold text-red-500 min-w-[2rem] text-center">{columnCount}</span>
                            <button
                              onClick={() => setColumnCount(Math.min(6, columnCount + 1))}
                              className="w-8 h-8 bg-white border border-gray-300 text-gray-700 rounded-md hover:border-red-500 hover:text-red-500 transition-all font-bold text-lg"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Preset Modal */}
            {showSavePreset && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Save Filter Preset</h3>
                  <p className="text-sm text-gray-600 mb-4">Give this filter configuration a name so you can reuse it later.</p>
                  <input
                    type="text"
                    value={filterPresetName}
                    onChange={(e) => setFilterPresetName(e.target.value)}
                    placeholder="e.g., 'Viral Small Channels' or 'Tech Reviews'"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
                    onKeyPress={(e) => e.key === 'Enter' && saveFilterPreset()}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowSavePreset(false); setFilterPresetName(''); }}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveFilterPreset}
                      className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Save Preset
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Video Grid */}
            {videos.length > 0 && (() => {
              // Pagination calculations
              const totalPages = Math.ceil(videos.length / itemsPerPage)
              const startIndex = (currentPage - 1) * itemsPerPage
              const endIndex = startIndex + itemsPerPage
              const paginatedVideos = videos.slice(startIndex, endIndex)

              return (
                <>
                  <div
                    className="grid gap-6"
                    style={{
                      gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`
                    }}
                  >
                    {paginatedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-video">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration)}
                      </span>
                    </div>
                    {viewMode === 'details' && (
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                          {video.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">{video.channelTitle}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div>
                            <span className="text-gray-500">Views: </span>
                            <span className="font-medium text-gray-900">{formatNumber(video.views)}</span>
                          </div>
                          {video.meritScore !== undefined && (
                            <div>
                              <span className="text-gray-500">Merit Score: </span>
                              <span className={`font-bold ${video.meritScore >= 75 ? 'text-green-600' : video.meritScore >= 50 ? 'text-yellow-600' : 'text-gray-600'}`}>
                                {video.meritScore.toFixed(1)}/100
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">Engagement: </span>
                            <span className="font-medium text-green-600">{video.engagementRate.toFixed(2)}%</span>
                          </div>
                          {video.viewsPerHour !== undefined && (
                            <div>
                              <span className="text-gray-500">Views/Hour: </span>
                              <span className="font-medium text-blue-600">{formatNumber(video.viewsPerHour)}</span>
                            </div>
                          )}
                          {video.multiplier !== undefined && video.multiplier > 1 && (
                            <div>
                              <span className="text-gray-500">Multiplier: </span>
                              <span className="font-bold text-red-600">{video.multiplier.toFixed(1)}x</span>
                            </div>
                          )}
                          {video.subscriberCount !== undefined && (
                            <div>
                              <span className="text-gray-500">Subscribers: </span>
                              <span className="font-medium text-gray-900">{formatNumber(video.subscriberCount)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                          >
                            Watch
                          </a>
                          <button
                            onClick={() => handleSaveVideo(video)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            title="Save video"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                    {viewMode === 'thumbnails' && (
                      <div className="p-2">
                        <h3 className="text-xs font-medium text-gray-900 line-clamp-1">{video.title}</h3>
                      </div>
                    )}
                    </div>
                  ))}
                </div>

                {/* Client-side Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)

                        if (!showPage && page === 2 && currentPage > 3) {
                          return <span key={page} className="px-2 text-gray-400">...</span>
                        }
                        if (!showPage && page === totalPages - 1 && currentPage < totalPages - 2) {
                          return <span key={page} className="px-2 text-gray-400">...</span>
                        }
                        if (!showPage) return null

                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-red-500 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Load More Button for API Pagination */}
                {nextPageToken && (
                  <div className="flex items-center justify-center mt-8">
                    <button
                      onClick={() => handleSearch(nextPageToken)}
                      disabled={loading}
                      className="px-8 py-3 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Loading More...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          Load More Videos ({videos.length} loaded)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
              )
            })()}

            {!loading && !error && videos.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <YouTubeLogo className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Research</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Search for videos or browse trending content to analyze competitors and find inspiration.
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'channels' && (
          <div className="space-y-6">
            {/* Channel Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Discover Channels</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {searchQuery.trim()
                      ? `Search results for "${searchQuery}"`
                      : 'Trending channels from around the world'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setChannelViewMode('grid')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        channelViewMode === 'grid'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Grid View"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setChannelViewMode('list')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        channelViewMode === 'list'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="List View"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowChannelFilters(!showChannelFilters)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      showChannelFilters
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Filters
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-[2]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search channels or leave empty for trending..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <select
                    value={maxResults}
                    onChange={(e) => setMaxResults(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="12">12 per page</option>
                    <option value="24">24 per page</option>
                    <option value="48">48 per page</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleResetChannelFilters}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleChannelSearch}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
            </div>

            {/* Channel Filters Sidebar */}
            {showChannelFilters && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <ChannelFilters
                  filters={{
                    order: channelOrder,
                    subsMin: channelSubsMin,
                    subsMax: channelSubsMax,
                    videoCountMin: channelVideoCountMin,
                    videoCountMax: channelVideoCountMax,
                    viewsMin: channelViewsMin,
                    viewsMax: channelViewsMax,
                    country: channelCountry,
                    language: channelRelevanceLanguage,
                  }}
                  onChange={handleChannelFilterChange}
                  onApply={handleApplyChannelFilters}
                  onReset={handleResetChannelFilters}
                  isOpen={showChannelFilters}
                />
              </div>
            )}

            {channels.length > 0 && (() => {
              // Pagination calculations
              const totalPages = Math.ceil(channels.length / channelItemsPerPage)
              const startIndex = (channelCurrentPage - 1) * channelItemsPerPage
              const endIndex = startIndex + channelItemsPerPage
              const paginatedChannels = channels.slice(startIndex, endIndex)

              return (
                <>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {searchQuery.trim() ? `"${searchQuery}"` : 'Trending Channels'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {channels.length} channels found
                          {channelSubsMin > 0 || channelSubsMax < 100000000 ? ` • ${formatNumber(channelSubsMin)}-${formatNumber(channelSubsMax)} subs` : ''}
                          {channelCountry ? ` • ${channelCountry}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Sorted by</p>
                        <p className="text-sm font-medium text-purple-600 capitalize">
                          {channelOrder === 'viewCount' ? 'Total Views' :
                           channelOrder === 'videoCount' ? 'Video Count' :
                           channelOrder === 'date' ? 'Recently Created' :
                           channelOrder === 'title' ? 'Name (A-Z)' :
                           channelOrder === 'rating' ? 'Rating' :
                           'Relevance'}
                        </p>
                      </div>
                    </div>

                    {/* Grid View */}
                    {channelViewMode === 'grid' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedChannels.map((channel) => (
                          <div
                            key={channel.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <img
                                src={channel.thumbnailUrl}
                                alt={channel.title}
                                className="w-14 h-14 rounded-full object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">{channel.title}</h3>
                                <p className="text-xs text-gray-500">{formatNumber(channel.subscriberCount)} subscribers</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                              <div>
                                <p className="text-gray-500">Videos</p>
                                <p className="font-medium text-gray-900">{formatNumber(channel.videoCount)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Total Views</p>
                                <p className="font-medium text-gray-900">{formatNumber(channel.viewCount)}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={channel.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-center px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                              >
                                Visit
                              </a>
                              <button
                                onClick={() => handleSaveChannel(channel, 'competitor')}
                                className="px-3 py-2 border border-orange-300 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors"
                              >
                                Competitor
                              </button>
                              <button
                                onClick={() => handleSaveChannel(channel, 'inspirational')}
                                className="px-3 py-2 border border-purple-300 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
                              >
                                Inspiration
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* List View */}
                    {channelViewMode === 'list' && (
                      <div className="space-y-3">
                        {paginatedChannels.map((channel) => (
                          <div
                            key={channel.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src={channel.thumbnailUrl}
                                alt={channel.title}
                                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900">{channel.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{formatNumber(channel.subscriberCount)} subscribers</p>
                              </div>
                              <div className="flex items-center gap-6 text-sm">
                                <div className="text-center">
                                  <p className="text-gray-500 text-xs">Videos</p>
                                  <p className="font-medium text-gray-900">{formatNumber(channel.videoCount)}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-500 text-xs">Total Views</p>
                                  <p className="font-medium text-gray-900">{formatNumber(channel.viewCount)}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <a
                                  href={channel.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                                >
                                  Visit
                                </a>
                                <button
                                  onClick={() => handleSaveChannel(channel, 'competitor')}
                                  className="px-3 py-2 border border-orange-300 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors"
                                >
                                  Competitor
                                </button>
                                <button
                                  onClick={() => handleSaveChannel(channel, 'inspirational')}
                                  className="px-3 py-2 border border-purple-300 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
                                >
                                  Inspiration
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <button
                          onClick={() => setChannelCurrentPage(Math.max(1, channelCurrentPage - 1))}
                          disabled={channelCurrentPage === 1}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>

                        <div className="flex gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first page, last page, current page, and pages around current
                            const showPage =
                              page === 1 ||
                              page === totalPages ||
                              (page >= channelCurrentPage - 1 && page <= channelCurrentPage + 1)

                            if (!showPage && page === 2 && channelCurrentPage > 3) {
                              return <span key={page} className="px-2 text-gray-400">...</span>
                            }
                            if (!showPage && page === totalPages - 1 && channelCurrentPage < totalPages - 2) {
                              return <span key={page} className="px-2 text-gray-400">...</span>
                            }
                            if (!showPage) return null

                            return (
                              <button
                                key={page}
                                onClick={() => setChannelCurrentPage(page)}
                                className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  channelCurrentPage === page
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            )
                          })}
                        </div>

                        <button
                          onClick={() => setChannelCurrentPage(Math.min(totalPages, channelCurrentPage + 1))}
                          disabled={channelCurrentPage === totalPages}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )
            })()}

            {!loading && !error && channels.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Discover Channels</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Search for channels to discover top creators. Leave the search empty to see trending channels from around the world.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex flex-col gap-4">
                {/* Tab Selection: Videos vs Channels */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSavedContentTab('videos')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      savedContentTab === 'videos'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Videos
                  </button>
                  <button
                    onClick={() => setSavedContentTab('channels')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      savedContentTab === 'channels'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Channels by Profile
                  </button>
                </div>

                {/* For Videos: Show filter buttons */}
                {savedContentTab === 'videos' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSavedListType('all')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        savedListType === 'all'
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSavedListType('favorites')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        savedListType === 'favorites'
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Favorites
                    </button>
                  </div>
                )}

                {/* For Channels: Show brand profile selector */}
                {savedContentTab === 'channels' && brandProfiles.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">Select Brand Profile</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSavedListType('all')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          savedListType === 'all'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All Profiles
                      </button>
                      {brandProfiles.map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => setSavedListType(profile.id)}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            savedListType === profile.id
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          title={profile.description || ''}
                        >
                          {profile.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {loadingSaved ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading saved content...</p>
              </div>
            ) : savedContentTab === 'videos' && savedVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-video">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      {video.isFavorite && (
                        <span className="absolute top-2 left-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full">
                          Favorite
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">{video.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{video.channelTitle}</p>
                      {(video.viewCount || video.engagementRate || video.subscriberCount || video.channelAvgViews) && (
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          {video.viewCount && (
                            <div>
                              <span className="text-gray-500">Views: </span>
                              <span className="font-medium text-gray-900">{formatNumber(video.viewCount)}</span>
                            </div>
                          )}
                          {video.engagementRate !== undefined && (
                            <div>
                              <span className="text-gray-500">Engagement: </span>
                              <span className="font-medium text-green-600">{video.engagementRate.toFixed(2)}%</span>
                            </div>
                          )}
                          {video.subscriberCount !== undefined && (
                            <div>
                              <span className="text-gray-500">Subscribers: </span>
                              <span className="font-medium text-gray-900">{formatNumber(video.subscriberCount)}</span>
                            </div>
                          )}
                          {video.channelAvgViews !== undefined && (
                            <div>
                              <span className="text-gray-500">Avg Views: </span>
                              <span className="font-medium text-gray-900">{formatNumber(video.channelAvgViews)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <a
                          href={`https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          Watch
                        </a>
                        <button
                          onClick={() => handleDeleteVideo(video.youtubeVideoId)}
                          className="px-3 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : savedContentTab === 'channels' ? (
              <>
                {brandProfiles.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Brand Profiles</h3>
                    <p className="text-gray-500">Create a brand profile first to save channels</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {brandProfiles
                      .filter((profile) => savedListType === 'all' || savedListType === profile.id)
                      .map((profile) => {
                        const hasCompetitors = profile.competitorChannels && profile.competitorChannels.length > 0
                        const hasInspiration = profile.inspirationChannels && profile.inspirationChannels.length > 0

                        if (!hasCompetitors && !hasInspiration) {
                          return null
                        }

                        return (
                          <div key={profile.id} className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100">
                            {/* Profile Header - Enhanced */}
                            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-2xl font-bold text-white">{profile.name}</h3>
                                  {profile.industry && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-medium">
                                        {profile.industry}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-white/80 text-sm">
                                    {hasCompetitors && <p className="font-medium">{profile.competitorChannels.length} Competitors</p>}
                                    {hasInspiration && <p className="font-medium">{profile.inspirationChannels.length} Inspiration</p>}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Profile Content */}
                            <div className="bg-white p-8 space-y-8">
                              {/* Competitor Channels */}
                              {hasCompetitors && (
                                <div>
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
                                      <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a6 6 0 00-9-5.197V13a7 7 0 0114 0v5h-5z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-bold text-gray-900">Competitor Channels</h4>
                                      <p className="text-sm text-gray-500">{profile.competitorChannels.length} channel{profile.competitorChannels.length !== 1 ? 's' : ''} saved</p>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    {profile.competitorChannels.map((channelUrl: string, idx: number) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 rounded-xl hover:shadow-md transition-all duration-200"
                                      >
                                        {/* Channel Icon */}
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-200 flex-shrink-0">
                                          <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM4 9h12v2H4V9z" />
                                          </svg>
                                        </div>

                                        {/* Channel Details */}
                                        <div className="flex-1 min-w-0">
                                          <a
                                            href={channelUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-semibold text-gray-900 hover:text-orange-600 break-words block"
                                          >
                                            {channelUrl.replace('https://youtube.com/', '').replace('@', '')}
                                          </a>
                                          <p className="text-xs text-gray-600 mt-1 truncate">{channelUrl}</p>
                                          <div className="flex items-center gap-2 mt-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-200 text-orange-800">
                                              Competitor
                                            </span>
                                          </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          <a
                                            href={channelUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors"
                                          >
                                            Visit
                                          </a>
                                          <button
                                            onClick={() => removeChannelFromProfile(profile.id, channelUrl, 'competitor')}
                                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors flex items-center gap-1"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Inspiration Channels */}
                              {hasInspiration && (
                                <div className={hasCompetitors ? 'pt-6 border-t-2 border-gray-200' : ''}>
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-bold text-gray-900">Inspiration Channels</h4>
                                      <p className="text-sm text-gray-500">{profile.inspirationChannels.length} channel{profile.inspirationChannels.length !== 1 ? 's' : ''} saved</p>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    {profile.inspirationChannels.map((channelUrl: string, idx: number) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 border border-purple-200 rounded-xl hover:shadow-md transition-all duration-200"
                                      >
                                        {/* Channel Icon */}
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-200 flex-shrink-0">
                                          <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM4 9h12v2H4V9z" />
                                          </svg>
                                        </div>

                                        {/* Channel Details */}
                                        <div className="flex-1 min-w-0">
                                          <a
                                            href={channelUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-semibold text-gray-900 hover:text-purple-600 break-words block"
                                          >
                                            {channelUrl.replace('https://youtube.com/', '').replace('@', '')}
                                          </a>
                                          <p className="text-xs text-gray-600 mt-1 truncate">{channelUrl}</p>
                                          <div className="flex items-center gap-2 mt-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-200 text-purple-800">
                                              Inspiration
                                            </span>
                                          </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          <a
                                            href={channelUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-2 bg-purple-500 text-white rounded-lg text-xs font-semibold hover:bg-purple-600 transition-colors"
                                          >
                                            Visit
                                          </a>
                                          <button
                                            onClick={() => removeChannelFromProfile(profile.id, channelUrl, 'inspiration')}
                                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors flex items-center gap-1"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}

                    {brandProfiles.filter((p) => savedListType === 'all' || savedListType === p.id).every((p) => !p.competitorChannels?.length && !p.inspirationChannels?.length) && (
                      <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Saved Channels Yet</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-4">Start saving channels from the Channels tab to build your research library. Click the Competitor or Inspiration button on any channel.</p>
                        <a href="#" className="inline-block px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                          Browse Channels
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Content</h3>
                <p className="text-gray-500">Save videos and channels from your search results to build your research library.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Profile Selector Modal */}
      <ProfileSelectorModal
        isOpen={showProfileSelector}
        profiles={brandProfiles}
        channel={channelToSave}
        channelType={saveChannelType}
        isLoading={savingChannel}
        onSelect={saveChannelToProfile}
        onCancel={handleProfileSelectorCancel}
      />
    </div>
  )
}
