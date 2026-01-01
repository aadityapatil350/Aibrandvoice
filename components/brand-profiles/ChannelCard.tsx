'use client'

interface ChannelCardProps {
  channel: {
    url: string
    title?: string
    subscriberCount?: number
    videoCount?: number
    viewCount?: string
    thumbnailUrl?: string
    description?: string
  }
  type: 'competitor' | 'inspiration'
  onRemove?: (url: string) => void
  isLoading?: boolean
}

export default function ChannelCard({
  channel,
  type,
  onRemove,
  isLoading = false,
}: ChannelCardProps) {
  const isCompetitor = type === 'competitor'
  const badgeColor = isCompetitor
    ? 'bg-orange-100 text-orange-700'
    : 'bg-purple-100 text-purple-700'
  const badgeLabel = isCompetitor ? 'Competitor' : 'Inspiration'

  const formatNumber = (num?: number | string): string => {
    if (!num) return '—'
    const n = typeof num === 'string' ? parseInt(num) : num
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toString()
  }

  // Extract channel name from URL
  const getChannelName = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/)(?:@|c\/|channel\/)?([^/?]+)/)
    return match ? match[1] : url
  }

  const channelName = channel.title || getChannelName(channel.url)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
      <div className="flex gap-3 mb-3">
        {/* Channel Thumbnail */}
        {channel.thumbnailUrl ? (
          <img
            src={channel.thumbnailUrl}
            alt={channelName}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 12a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}

        {/* Channel Info */}
        <div className="flex-1 min-w-0">
          <a
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 hover:text-purple-600 truncate block"
          >
            {channelName}
          </a>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${badgeColor}`}>
              {badgeLabel}
            </span>
          </div>
        </div>

        {/* Remove Button */}
        {onRemove && (
          <button
            onClick={() => onRemove(channel.url)}
            disabled={isLoading}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove channel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Channel Stats */}
      {(channel.subscriberCount || channel.videoCount || channel.viewCount) && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3 pt-3 border-t border-gray-100">
          {channel.subscriberCount !== undefined && (
            <div>
              <p className="text-gray-500">Subscribers</p>
              <p className="font-medium text-gray-900">{formatNumber(channel.subscriberCount)}</p>
            </div>
          )}
          {channel.videoCount !== undefined && (
            <div>
              <p className="text-gray-500">Videos</p>
              <p className="font-medium text-gray-900">{formatNumber(channel.videoCount)}</p>
            </div>
          )}
          {channel.viewCount !== undefined && (
            <div>
              <p className="text-gray-500">Total Views</p>
              <p className="font-medium text-gray-900">{formatNumber(channel.viewCount)}</p>
            </div>
          )}
        </div>
      )}

      {/* Visit Button */}
      <a
        href={channel.url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-block text-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all"
      >
        Visit Channel
      </a>
    </div>
  )
}
