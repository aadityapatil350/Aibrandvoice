import { useState, useEffect } from 'react'

interface BrandProfile {
  id: string
  name: string
  description?: string
  status: 'DRAFT' | 'TRAINING' | 'READY' | 'ERROR'
  industry?: string
  tone: string[]
}

interface BrandProfileSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
  showOnlyReady?: boolean
}

export default function BrandProfileSelector({
  value,
  onChange,
  className,
  disabled,
  showOnlyReady = true
}: BrandProfileSelectorProps) {
  const [profiles, setProfiles] = useState<BrandProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBrandProfiles()
  }, [])

  const fetchBrandProfiles = async () => {
    try {
      const response = await fetch('/api/brand-profiles')
      const data = await response.json()

      if (response.ok && data.profiles) {
        const filteredProfiles = showOnlyReady
          ? data.profiles.filter((p: BrandProfile) => p.status === 'READY')
          : data.profiles
        setProfiles(filteredProfiles)
      }
    } catch (error) {
      console.error('Error fetching brand profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
      TRAINING: { color: 'bg-blue-100 text-blue-700', label: 'Training' },
      READY: { color: 'bg-green-100 text-green-700', label: 'Ready' },
      ERROR: { color: 'bg-red-100 text-red-700', label: 'Error' }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <select
        className={`w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm ${className}`}
        disabled
      >
        <option>Loading brand profiles...</option>
      </select>
    )
  }

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm appearance-none bg-white ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value="">Use default voice</option>
        {profiles.length === 0 && !loading && (
          <option value="" disabled>
            {showOnlyReady ? 'No trained profiles available' : 'No profiles created yet'}
          </option>
        )}
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name}
            {profile.industry && ` (${profile.industry})`}
            {profile.status !== 'READY' && ` - ${profile.status}`}
          </option>
        ))}
      </select>

      {/* Custom dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg
          className="w-4 h-4 text-claude-text-tertiary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Selected profile info */}
      {value && profiles.find(p => p.id === value) && (
        <div className="mt-2 p-2 bg-claude-bg-secondary rounded text-xs">
          <div className="font-medium text-claude-text">
            {profiles.find(p => p.id === value)?.name}
          </div>
          {profiles.find(p => p.id === value)?.description && (
            <div className="text-claude-text-secondary mt-1 line-clamp-2">
              {profiles.find(p => p.id === value)?.description}
            </div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-claude-text-tertiary">
              Industry: {profiles.find(p => p.id === value)?.industry || 'Not specified'}
            </span>
            {!showOnlyReady && (
              getStatusBadge(profiles.find(p => p.id === value)?.status || 'DRAFT')
            )}
          </div>
        </div>
      )}
    </div>
  )
}