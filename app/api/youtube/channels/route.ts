import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache for channel data
const cache = new Map()
const CACHE_TTL = 1800000 // 30 minutes for channels

type ChannelOrder = 'relevance' | 'date' | 'viewCount' | 'rating' | 'title' | 'videoCount'

interface ChannelFilters {
  subscriberCountMin?: number
  subscriberCountMax?: number
  videoCountMin?: number
  videoCountMax?: number
  viewCountMin?: number
  viewCountMax?: number
  country?: string
  keywords?: string[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const maxResults = parseInt(searchParams.get('maxResults') || '24')
    const regionCode = searchParams.get('regionCode') || 'US'
    const order = (searchParams.get('order') || 'relevance') as ChannelOrder
    const relevanceLanguage = searchParams.get('relevanceLanguage') || 'en'
    const safeSearch = searchParams.get('safeSearch') || 'moderate'

    // Filter parameters
    const subscriberCountMin = parseInt(searchParams.get('subscriberCountMin') || '0')
    const subscriberCountMax = parseInt(searchParams.get('subscriberCountMax') || '100000000000')
    const videoCountMin = parseInt(searchParams.get('videoCountMin') || '0')
    const videoCountMax = parseInt(searchParams.get('videoCountMax') || '100000000')
    const viewCountMin = parseInt(searchParams.get('viewCountMin') || '0')
    const viewCountMax = parseInt(searchParams.get('viewCountMax') || '100000000000000')
    const country = searchParams.get('country')

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey || apiKey === 'your_youtube_api_key_here') {
      return NextResponse.json({
        error: 'YouTube API key not configured. Please add YOUTUBE_API_KEY to your .env file.',
        setupRequired: true
      }, { status: 500 })
    }

    // Check cache
    const cacheKey = `channels-${query}-${maxResults}-${regionCode}-${order}-${subscriberCountMin}-${subscriberCountMax}-${videoCountMin}-${videoCountMax}-${viewCountMin}-${viewCountMax}-${country || 'all'}`
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json({ ...cached.data, fromCache: true })
      }
    }

    let channels: any[] = []

    // If no query, fetch trending channels by using popular video search
    if (!query || query.trim() === '') {
      try {
        // Try multiple search strategies with pagination to get MORE channels
        const searchQueries = [
          'popular videos',
          'trending now',
          'viral videos',
          'top videos',
          'best videos',
          'new videos',
          'featured',
          'entertainment',
          'education',
          'music',
          'technology',
          'gaming',
          'sports',
          'news',
        ]

        // Fetch up to 3 pages per search query to get more variety
        for (const searchQ of searchQueries) {
          if (channels.length >= maxResults * 2) break // Fetch extra for filtering

          for (let page = 0; page < 3; page++) {
            if (channels.length >= maxResults * 2) break

            const trendingUrl = new URL('https://www.googleapis.com/youtube/v3/search')
            trendingUrl.searchParams.set('part', 'snippet')
            trendingUrl.searchParams.set('type', 'video')
            trendingUrl.searchParams.set('q', searchQ)
            trendingUrl.searchParams.set('order', 'viewCount')
            trendingUrl.searchParams.set('maxResults', '50')
            trendingUrl.searchParams.set('regionCode', regionCode)
            trendingUrl.searchParams.set('relevanceLanguage', relevanceLanguage)
            trendingUrl.searchParams.set('safeSearch', safeSearch)
            trendingUrl.searchParams.set('key', apiKey)
            // Add pagination token if available
            if (page > 0) {
              trendingUrl.searchParams.set('pageToken', `page-${searchQ}-${page}`)
            }

            try {
              const trendingResponse = await fetch(trendingUrl.toString())

              if (!trendingResponse.ok) {
                if (page === 0) {
                  console.error(`YouTube search for "${searchQ}" failed:`, trendingResponse.status)
                }
                break
              }

              const trendingData = await trendingResponse.json()
              const videoCount = trendingData.items?.length || 0

              if (videoCount > 0) {
                // Extract unique channels from videos
                const channelMap = new Map<string, any>()
                trendingData.items?.forEach((item: any) => {
                  const channelId = item.snippet.channelId
                  if (channelId && !channelMap.has(channelId)) {
                    channelMap.set(channelId, {
                      channelId,
                      title: item.snippet.channelTitle,
                    })
                  }
                })

                const newChannelIds = Array.from(channelMap.keys())
                  .filter(id => !channels.find((c: any) => c.channelId === id))
                  .slice(0, maxResults * 2 - channels.length)

                if (newChannelIds.length > 0) {
                  const newChannels = await fetchChannelDetails(newChannelIds, apiKey)
                  channels = [...channels, ...newChannels]
                  console.log(`[${searchQ} page ${page}] Extracted ${newChannelIds.length} new channels, total: ${channels.length}`)
                }
              }
            } catch (pageError) {
              console.error(`Error fetching page ${page} for "${searchQ}":`, pageError)
              break
            }
          }
        }

        console.log(`Trending mode complete: fetched ${channels.length} total unique channels`)
      } catch (error) {
        console.error('Error fetching trending channels:', error)
      }
    } else {
      try {
        // Search for channels matching the query
        const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
        searchUrl.searchParams.set('part', 'snippet')
        searchUrl.searchParams.set('q', query)
        searchUrl.searchParams.set('type', 'channel')
        searchUrl.searchParams.set('maxResults', Math.min(50, maxResults).toString())
        searchUrl.searchParams.set('order', order)
        searchUrl.searchParams.set('regionCode', regionCode)
        searchUrl.searchParams.set('relevanceLanguage', relevanceLanguage)
        searchUrl.searchParams.set('safeSearch', safeSearch)
        searchUrl.searchParams.set('key', apiKey)

        const searchResponse = await fetch(searchUrl.toString())
        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          const directChannelIds = searchData.items?.map((item: any) => item.id.channelId) || []

          if (directChannelIds.length > 0) {
            channels = await fetchChannelDetails(directChannelIds, apiKey)
            console.log(`Direct channel search found ${channels.length} channels`)
          }
        }

        // Search for VIDEOS to find TOP CHANNELS in this niche (get more channels)
        const videoSearchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
        videoSearchUrl.searchParams.set('part', 'snippet')
        videoSearchUrl.searchParams.set('q', query)
        videoSearchUrl.searchParams.set('type', 'video')
        videoSearchUrl.searchParams.set('order', 'viewCount')
        videoSearchUrl.searchParams.set('maxResults', '50')
        videoSearchUrl.searchParams.set('regionCode', regionCode)
        videoSearchUrl.searchParams.set('relevanceLanguage', relevanceLanguage)
        videoSearchUrl.searchParams.set('key', apiKey)

        const videoSearchResponse = await fetch(videoSearchUrl.toString())
        if (videoSearchResponse.ok) {
          const videoSearchData = await videoSearchResponse.json()
          const channelMap = new Map<string, any>()

          videoSearchData.items?.forEach((item: any) => {
            const channelId = item.snippet.channelId
            if (channelId && !channelMap.has(channelId)) {
              channelMap.set(channelId, {
                channelId,
                title: item.snippet.channelTitle,
              })
            }
          })

          const additionalChannelIds = Array.from(channelMap.keys())
            .filter(id => !channels.find((c: any) => c.channelId === id))
            .slice(0, Math.max(0, maxResults * 2 - channels.length)) // Fetch extra for filtering

          if (additionalChannelIds.length > 0) {
            const additionalChannels = await fetchChannelDetails(additionalChannelIds, apiKey)
            channels = [...channels, ...additionalChannels]
            console.log(`Video search added ${additionalChannels.length} channels, total: ${channels.length}`)
          }
        }

        // If still not enough, try related search queries
        if (channels.length < maxResults) {
          const relatedQueries = [
            `${query} channel`,
            `${query} videos`,
            `${query} tutorial`,
            `${query} creators`,
          ]

          for (const relatedQ of relatedQueries) {
            if (channels.length >= maxResults * 2) break

            const relatedSearchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
            relatedSearchUrl.searchParams.set('part', 'snippet')
            relatedSearchUrl.searchParams.set('q', relatedQ)
            relatedSearchUrl.searchParams.set('type', 'video')
            relatedSearchUrl.searchParams.set('order', 'relevance')
            relatedSearchUrl.searchParams.set('maxResults', '50')
            relatedSearchUrl.searchParams.set('regionCode', regionCode)
            relatedSearchUrl.searchParams.set('relevanceLanguage', relevanceLanguage)
            relatedSearchUrl.searchParams.set('key', apiKey)

            try {
              const relatedResponse = await fetch(relatedSearchUrl.toString())
              if (relatedResponse.ok) {
                const relatedData = await relatedResponse.json()
                const relatedChannelMap = new Map<string, any>()

                relatedData.items?.forEach((item: any) => {
                  const channelId = item.snippet.channelId
                  if (channelId && !relatedChannelMap.has(channelId)) {
                    relatedChannelMap.set(channelId, { channelId })
                  }
                })

                const relatedChannelIds = Array.from(relatedChannelMap.keys())
                  .filter(id => !channels.find((c: any) => c.channelId === id))
                  .slice(0, maxResults * 2 - channels.length)

                if (relatedChannelIds.length > 0) {
                  const relatedChannels = await fetchChannelDetails(relatedChannelIds, apiKey)
                  channels = [...channels, ...relatedChannels]
                  console.log(`Related search "${relatedQ}" added ${relatedChannels.length} channels, total: ${channels.length}`)
                }
              }
            } catch (e) {
              console.error(`Related search failed for "${relatedQ}":`, e)
            }
          }
        }
      } catch (error) {
        console.error('Error during query search:', error)
      }
    }

    // Apply filters
    let filteredChannels = channels.filter((channel: any) => {
      // Subscriber count filter
      if (channel.subscriberCount < subscriberCountMin || channel.subscriberCount > subscriberCountMax) {
        return false
      }

      // Video count filter
      if (channel.videoCount < videoCountMin || channel.videoCount > videoCountMax) {
        return false
      }

      // View count filter
      const views = BigInt(channel.viewCount || '0')
      const minViews = BigInt(viewCountMin)
      const maxViews = BigInt(viewCountMax)
      if (views < minViews || views > maxViews) {
        return false
      }

      // Country filter
      if (country && channel.country !== country) {
        return false
      }

      return true
    })

    // Sort channels based on order parameter
    filteredChannels = sortChannels(filteredChannels, order)

    // Limit results
    filteredChannels = filteredChannels.slice(0, maxResults)

    const result = {
      channels: filteredChannels,
      count: filteredChannels.length,
      filters: {
        subscriberCountMin,
        subscriberCountMax,
        videoCountMin,
        videoCountMax,
        viewCountMin,
        viewCountMax,
        country,
        order,
        regionCode
      }
    }

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('YouTube Channels API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch YouTube channels' },
      { status: 500 }
    )
  }
}

async function fetchChannelDetails(channelIds: string[], apiKey: string): Promise<any[]> {
  const channelsUrl = new URL('https://www.googleapis.com/youtube/v3/channels')
  channelsUrl.searchParams.set('part', 'statistics,snippet,brandingSettings')
  channelsUrl.searchParams.set('id', channelIds.join(','))
  channelsUrl.searchParams.set('key', apiKey)

  const channelsResponse = await fetch(channelsUrl.toString())
  if (!channelsResponse.ok) {
    return []
  }

  const channelsData = await channelsResponse.json()

  return channelsData.items?.map((channel: any) => {
    const stats = channel.statistics
    const subscriberCount = parseInt(stats.subscriberCount || '0')
    const videoCount = parseInt(stats.videoCount || '0')
    const viewCount = BigInt(stats.viewCount || '0')

    return {
      id: channel.id,
      channelId: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnailUrl: channel.snippet.thumbnails?.high?.url ||
                    channel.snippet.thumbnails?.medium?.url ||
                    channel.snippet.thumbnails?.default?.url,
      subscriberCount,
      videoCount,
      viewCount: viewCount.toString(),
      publishedAt: channel.snippet.publishedAt,
      country: channel.snippet.country,
      keywords: channel.brandingSettings?.channel?.keywords || '',
      url: `https://www.youtube.com/channel/${channel.id}`,
    }
  }) || []
}

function sortChannels(channels: any[], order: ChannelOrder): any[] {
  const sorted = [...channels]

  switch (order) {
    case 'relevance':
      // Keep original order from API
      break
    case 'date':
      sorted.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      break
    case 'viewCount':
      sorted.sort((a, b) => {
        const viewsA = BigInt(a.viewCount || '0')
        const viewsB = BigInt(b.viewCount || '0')
        // Sort by total views, then by subscribers as tiebreaker
        if (viewsB !== viewsA) return viewsB > viewsA ? 1 : -1
        return b.subscriberCount - a.subscriberCount
      })
      break
    case 'videoCount':
      sorted.sort((a, b) => b.videoCount - a.videoCount)
      break
    case 'title':
      sorted.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'rating':
      // YouTube doesn't provide channel ratings, sort by subscribers as proxy
      sorted.sort((a, b) => b.subscriberCount - a.subscriberCount)
      break
    default:
      // Default to subscriber count
      sorted.sort((a, b) => b.subscriberCount - a.subscriberCount)
  }

  return sorted
}
