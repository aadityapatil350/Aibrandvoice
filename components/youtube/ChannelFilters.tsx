'use client'

import { useState } from 'react'
import RangeSlider from '@/components/ui/RangeSlider'

interface ChannelFiltersProps {
  filters: {
    order: 'relevance' | 'date' | 'viewCount' | 'rating' | 'title' | 'videoCount'
    subsMin: number
    subsMax: number
    videoCountMin: number
    videoCountMax: number
    viewsMin: number
    viewsMax: number
    country: string
    language: string
  }
  onChange: (filters: any) => void
  onApply: () => void
  onReset: () => void
  isOpen: boolean
}

const SUBSCRIBER_PRESETS = [
  { label: 'All', min: 0, max: 100000000 },
  { label: 'Nano (<1K)', min: 0, max: 999 },
  { label: 'Micro (1K-10K)', min: 1000, max: 9999 },
  { label: 'Small (10K-100K)', min: 10000, max: 99999 },
  { label: 'Medium (100K-1M)', min: 100000, max: 999999 },
  { label: 'Large (1M-10M)', min: 1000000, max: 9999999 },
  { label: 'Huge (10M+)', min: 10000000, max: 100000000 },
]

const VIDEO_COUNT_PRESETS = [
  { label: 'All', min: 0, max: 100000 },
  { label: 'Starter (<50)', min: 0, max: 49 },
  { label: 'Active (50-500)', min: 50, max: 500 },
  { label: 'Pro (500-5000)', min: 500, max: 5000 },
  { label: 'Veteran (5000+)', min: 5000, max: 100000 },
]

const TOTAL_VIEWS_PRESETS = [
  { label: 'All', min: 0, max: 100000000000 },
  { label: 'Under 1M', min: 0, max: 999999 },
  { label: '1M-10M', min: 1000000, max: 9999999 },
  { label: '10M-100M', min: 10000000, max: 99999999 },
  { label: '100M-1B', min: 100000000, max: 999999999 },
  { label: '1B+', min: 1000000000, max: 100000000000 },
]

const COUNTRIES = [
  { code: '', name: 'All Countries' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'RU', name: 'Russia' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'UAE' },
]

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'it', name: 'Italian' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
]

export default function ChannelFilters({ filters, onChange, onApply, onReset, isOpen }: ChannelFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['sorting', 'subscribers'])

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(0)}B`
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  if (!isOpen) return null

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Channel Filters
          </h3>
          <button
            onClick={onReset}
            className="text-xs text-purple-600 hover:text-purple-800 font-medium"
          >
            Reset All
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Sorting Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('sorting')}
            className="w-full px-3 py-2 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Sort By</span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.includes('sorting') ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.includes('sorting') && (
            <div className="p-3 bg-white space-y-2">
              {[
                { value: 'relevance', label: 'Relevance', icon: '🎯' },
                { value: 'date', label: 'Recently Created', icon: '📅' },
                { value: 'viewCount', label: 'Total Views', icon: '👁️' },
                { value: 'videoCount', label: 'Video Count', icon: '🎬' },
                { value: 'subscriberCount', label: 'Subscribers', icon: '👥' },
                { value: 'title', label: 'Name (A-Z)', icon: '🔤' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onChange({ ...filters, order: option.value })}
                  className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center gap-2 transition-all ${
                    filters.order === option.value
                      ? 'bg-purple-100 text-purple-900 border border-purple-300'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  <span>{option.icon}</span>
                  <span className="flex-1">{option.label}</span>
                  {filters.order === option.value && (
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subscriber Count Filter */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('subscribers')}
            className="w-full px-3 py-2 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Subscribers</span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.includes('subscribers') ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.includes('subscribers') && (
            <div className="p-3 bg-white space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {SUBSCRIBER_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => onChange({ ...filters, subsMin: preset.min, subsMax: preset.max })}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                      filters.subsMin === preset.min && filters.subsMax === preset.max
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <RangeSlider
                min={0}
                max={100000000}
                step={1000}
                valueMin={filters.subsMin}
                valueMax={filters.subsMax}
                onChangeMin={(v) => onChange({ ...filters, subsMin: v })}
                onChangeMax={(v) => onChange({ ...filters, subsMax: v })}
                formatValue={formatNumber}
              />
            </div>
          )}
        </div>

        {/* Video Count Filter */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('videoCount')}
            className="w-full px-3 py-2 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Video Count</span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.includes('videoCount') ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.includes('videoCount') && (
            <div className="p-3 bg-white space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {VIDEO_COUNT_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => onChange({ ...filters, videoCountMin: preset.min, videoCountMax: preset.max })}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                      filters.videoCountMin === preset.min && filters.videoCountMax === preset.max
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <RangeSlider
                min={0}
                max={100000}
                step={100}
                valueMin={filters.videoCountMin}
                valueMax={filters.videoCountMax}
                onChangeMin={(v) => onChange({ ...filters, videoCountMin: v })}
                onChangeMax={(v) => onChange({ ...filters, videoCountMax: v })}
                formatValue={formatNumber}
              />
            </div>
          )}
        </div>

        {/* Total Views Filter */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('totalViews')}
            className="w-full px-3 py-2 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Total Views</span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.includes('totalViews') ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.includes('totalViews') && (
            <div className="p-3 bg-white space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {TOTAL_VIEWS_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => onChange({ ...filters, viewsMin: preset.min, viewsMax: preset.max })}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                      filters.viewsMin === preset.min && filters.viewsMax === preset.max
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <RangeSlider
                min={0}
                max={100000000000}
                step={1000000}
                valueMin={filters.viewsMin}
                valueMax={filters.viewsMax}
                onChangeMin={(v) => onChange({ ...filters, viewsMin: v })}
                onChangeMax={(v) => onChange({ ...filters, viewsMax: v })}
                formatValue={formatNumber}
              />
            </div>
          )}
        </div>

        {/* Location Filter */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('location')}
            className="w-full px-3 py-2 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Location & Language</span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.includes('location') ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.includes('location') && (
            <div className="p-3 bg-white space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => onChange({ ...filters, country: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Relevance Language</label>
                <select
                  value={filters.language}
                  onChange={(e) => onChange({ ...filters, language: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Apply Button */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onApply}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}
