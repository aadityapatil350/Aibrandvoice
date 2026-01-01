'use client'

import { useState } from 'react'

interface BrandProfile {
  id: string
  name: string
  description?: string
  industry?: string
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

interface ProfileSelectorModalProps {
  isOpen: boolean
  profiles: BrandProfile[]
  channel: Channel | null
  channelType: 'competitor' | 'inspirational' | null
  isLoading: boolean
  onSelect: (profileId: string) => Promise<void>
  onCancel: () => void
}

export default function ProfileSelectorModal({
  isOpen,
  profiles,
  channel,
  channelType,
  isLoading,
  onSelect,
  onCancel,
}: ProfileSelectorModalProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSelect = async () => {
    if (selectedProfileId) {
      await onSelect(selectedProfileId)
      setSelectedProfileId(null)
    }
  }

  const handleCancel = () => {
    setSelectedProfileId(null)
    onCancel()
  }

  const badgeColor = channelType === 'competitor'
    ? 'bg-orange-100 text-orange-700'
    : 'bg-purple-100 text-purple-700'

  const badgeLabel = channelType === 'competitor' ? 'Competitor' : 'Inspiration'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200 sticky top-0">
          <h2 className="text-xl font-bold text-gray-900">Save Channel to Profile</h2>
          <p className="text-sm text-gray-600 mt-1">Select where you want to save this channel</p>
        </div>

        {/* Channel Info Preview */}
        {channel && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex gap-3">
              <img
                src={channel.thumbnailUrl}
                alt={channel.title}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{channel.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${badgeColor}`}>
                    {badgeLabel}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(channel.subscriberCount / 1000000).toFixed(1)}M subscribers
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile List */}
        <div className="px-6 py-4">
          {profiles.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium mb-2">No brand profiles found</p>
              <p className="text-sm text-gray-500">Create a brand profile first to save channels</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Brand Profiles</p>
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setSelectedProfileId(profile.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedProfileId === profile.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedProfileId === profile.id
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedProfileId === profile.id && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{profile.name}</p>
                      {profile.industry && (
                        <p className="text-xs text-gray-500 mt-1">{profile.industry}</p>
                      )}
                      {profile.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{profile.description}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 sticky bottom-0">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedProfileId || isLoading || profiles.length === 0}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save to Profile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
