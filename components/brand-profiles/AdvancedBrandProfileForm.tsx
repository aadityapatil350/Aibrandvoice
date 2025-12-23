import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface AdvancedBrandProfileFormProps {
  initialData?: any
  onSave: (data: any) => void
  onCancel: () => void
  isEdit?: boolean
}

const toneOptions = [
  'Professional', 'Casual', 'Friendly', 'Authoritative',
  'Inspiring', 'Humorous', 'Educational', 'Conversational',
  'Bold', 'Empathetic', 'Technical', 'Creative',
  'Luxury', 'Minimalist', 'Playful', 'Sophisticated'
]

const industries = [
  'Technology', 'Fashion & Beauty', 'Food & Beverage',
  'Fitness & Wellness', 'Education', 'Entertainment',
  'Finance', 'Healthcare', 'Real Estate', 'Travel',
  'Automotive', 'Retail', 'Manufacturing', 'SaaS',
  'E-commerce', 'Media & Publishing', 'Consulting', 'Non-profit'
]

const contentTypes = [
  'YouTube Videos', 'Blog Posts', 'Social Media', 'Newsletters',
  'Case Studies', 'Whitepapers', 'Webinars', 'Podcasts'
]

export default function AdvancedBrandProfileForm({
  initialData,
  onSave,
  onCancel,
  isEdit = false
}: AdvancedBrandProfileFormProps) {
  const [formData, setFormData] = useState({
    // Basic Info
    name: initialData?.name || '',
    description: initialData?.description || '',
    website: initialData?.website || '',
    industry: initialData?.industry || '',
    targetAudience: initialData?.targetAudience || '',
    brandColors: initialData?.brandColors || {},
    tone: initialData?.tone || [],

    // Competitive Analysis
    competitorChannels: initialData?.competitorChannels || [],
    targetKeywords: initialData?.targetKeywords || [],
    contentTypeFocus: initialData?.contentTypeFocus || [],
    uniqueSellingProposition: initialData?.uniqueSellingProposition || '',
    brandValues: initialData?.brandValues || [],
    contentPillars: initialData?.contentPillars || [],

    // Voice Preferences
    communicationStyle: initialData?.communicationStyle || '',
    formality: initialData?.formality || 'mixed',
    emotionalTone: initialData?.emotionalTone || '',
    complexity: initialData?.complexity || 'moderate',
    callToActionStyle: initialData?.callToActionStyle || 'direct',

    // YouTube Specific
    youtubeChannelUrl: initialData?.youtubeChannelUrl || '',
    analyzeCompetitors: initialData?.analyzeCompetitors || false
  })

  const [scrapingStatus, setScrapingStatus] = useState('')
  const [competitorData, setCompetitorData] = useState<any[]>([])
  const [isScraping, setIsScraping] = useState(false)

  const handleAddCompetitor = () => {
    setFormData({
      ...formData,
      competitorChannels: [...formData.competitorChannels, '']
    })
  }

  const handleRemoveCompetitor = (index: number) => {
    setFormData({
      ...formData,
      competitorChannels: formData.competitorChannels.filter((_, i) => i !== index)
    })
  }

  const handleCompetitorChange = (index: number, value: string) => {
    const updated = [...formData.competitorChannels]
    updated[index] = value
    setFormData({ ...formData, competitorChannels: updated })
  }

  const handleAnalyzeCompetitors = async () => {
    if (formData.competitorChannels.filter(c => c).length === 0) {
      alert('Please add at least one competitor channel URL')
      return
    }

    setIsScraping(true)
    setScrapingStatus('Starting competitive analysis...')

    try {
      const response = await fetch('/api/brand-profiles/analyze-competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channels: formData.competitorChannels.filter(c => c),
          industry: formData.industry
        })
      })

      const data = await response.json()

      if (response.ok) {
        setCompetitorData(data.analysis)
        setScrapingStatus('Analysis complete! Review insights below.')

        // Auto-suggest tone and content pillars based on analysis
        if (data.insights?.suggestedTones) {
          setFormData(prev => ({
            ...prev,
            tone: [...new Set([...prev.tone, ...data.insights.suggestedTones])]
          }))
        }
      } else {
        setScrapingStatus('Error: ' + data.error)
      }
    } catch (error) {
      setScrapingStatus('Error analyzing competitors')
    } finally {
      setIsScraping(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...formData,
      competitorAnalysis: competitorData
    }

    onSave(payload)
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-claude-text-secondary hover:text-claude-text transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Profiles
      </button>

      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-claude-text mb-2">
            {isEdit ? 'Edit Brand Profile' : 'Create Advanced Brand Profile'}
          </h2>
          <p className="text-claude-text-secondary">
            Build a comprehensive brand profile with competitive analysis and AI-powered insights
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-claude-text">Basic Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-claude-text mb-2">
                    Brand Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., TechCorp Solutions"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-claude-text mb-2">
                    Industry *
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent"
                    required
                  >
                    <option value="">Select industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-claude-text mb-2">
                  Brand Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Describe your brand, mission, and what makes you unique..."
                  className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-claude-text mb-2">
                    Website
                  </label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourbrand.com"
                    type="url"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-claude-text mb-2">
                    Target Audience
                  </label>
                  <Input
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="e.g., B2B SaaS companies, 50-200 employees"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-claude-text mb-2">
                  Unique Selling Proposition
                </label>
                <Input
                  value={formData.uniqueSellingProposition}
                  onChange={(e) => setFormData({ ...formData, uniqueSellingProposition: e.target.value })}
                  placeholder="What makes your brand unique compared to competitors?"
                />
              </div>
            </CardContent>
          </Card>

          {/* Competitive Analysis */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-claude-text">Competitive Analysis</h3>
              <p className="text-sm text-claude-text-secondary">
                Add competitor YouTube channels to analyze their content strategy and voice
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-claude-text mb-2">
                  Competitor YouTube Channels
                </label>
                {formData.competitorChannels.map((channel, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={channel}
                      onChange={(e) => handleCompetitorChange(index, e.target.value)}
                      placeholder="https://youtube.com/@competitor"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleRemoveCompetitor(index)}
                      className="px-3 py-2"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCompetitor}
                  className="mt-2"
                >
                  + Add Competitor
                </Button>
              </div>

              <Button
                type="button"
                onClick={handleAnalyzeCompetitors}
                disabled={isScraping || formData.competitorChannels.filter(c => c).length === 0}
                className="w-full"
              >
                {isScraping ? 'Analyzing...' : '🔍 Analyze Competitors'}
              </Button>

              {scrapingStatus && (
                <div className="p-3 bg-claude-bg-secondary rounded-lg">
                  <p className="text-sm text-claude-text">{scrapingStatus}</p>
                </div>
              )}

              {competitorData.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-claude-text">Competitor Insights:</h4>
                  {competitorData.map((competitor, index) => (
                    <div key={index} className="p-3 border border-claude-border rounded-lg">
                      <p className="font-medium text-claude-text">{competitor.channelName}</p>
                      <p className="text-sm text-claude-text-secondary mt-1">
                        Subscribers: {competitor.subscribers?.toLocaleString()} |
                        Videos: {competitor.videoCount} |
                        Avg Views: {competitor.avgViews?.toLocaleString()}
                      </p>
                      <p className="text-xs text-claude-text-tertiary mt-2">
                        Top content: {competitor.topContent?.slice(0, 3).join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Strategy */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-claude-text">Content Strategy</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-claude-text mb-2">
                  Content Types Focus
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {contentTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.contentTypeFocus.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              contentTypeFocus: [...formData.contentTypeFocus, type]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              contentTypeFocus: formData.contentTypeFocus.filter(t => t !== type)
                            })
                          }
                        }}
                        className="rounded border-claude-border"
                      />
                      <span className="text-sm text-claude-text">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-claude-text mb-2">
                  Content Pillars
                </label>
                <Input
                  value={formData.contentPillars.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    contentPillars: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  placeholder="e.g., Educational content, Industry news, How-to guides"
                />
                <p className="text-xs text-claude-text-tertiary mt-1">
                  Separate multiple pillars with commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-claude-text mb-2">
                  Target Keywords
                </label>
                <Input
                  value={formData.targetKeywords.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    targetKeywords: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  placeholder="e.g., SaaS, productivity, business growth"
                />
                <p className="text-xs text-claude-text-tertiary mt-1">
                  Keywords you want to rank for
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Voice & Tone */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-claude-text">Voice & Tone Preferences</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-claude-text mb-2">
                  Brand Tone & Voice
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {toneOptions.map((tone) => (
                    <label key={tone} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.tone.includes(tone)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              tone: [...formData.tone, tone]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              tone: formData.tone.filter(t => t !== tone)
                            })
                          }
                        }}
                        className="rounded border-claude-border"
                      />
                      <span className="text-sm text-claude-text">{tone}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-claude-text mb-2">
                    Formality Level
                  </label>
                  <select
                    value={formData.formality}
                    onChange={(e) => setFormData({ ...formData, formality: e.target.value })}
                    className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent"
                  >
                    <option value="formal">Formal</option>
                    <option value="mixed">Mixed</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-claude-text mb-2">
                    Content Complexity
                  </label>
                  <select
                    value={formData.complexity}
                    onChange={(e) => setFormData({ ...formData, complexity: e.target.value })}
                    className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent"
                  >
                    <option value="simple">Simple</option>
                    <option value="moderate">Moderate</option>
                    <option value="complex">Complex</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-claude-text mb-2">
                    Emotional Tone
                  </label>
                  <select
                    value={formData.emotionalTone}
                    onChange={(e) => setFormData({ ...formData, emotionalTone: e.target.value })}
                    className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent"
                  >
                    <option value="">Select tone</option>
                    <option value="neutral">Neutral</option>
                    <option value="warm">Warm</option>
                    <option value="energetic">Energetic</option>
                    <option value="professional">Professional</option>
                    <option value="playful">Playful</option>
                    <option value="inspiring">Inspiring</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-claude-text mb-2">
                    Call-to-Action Style
                  </label>
                  <select
                    value={formData.callToActionStyle}
                    onChange={(e) => setFormData({ ...formData, callToActionStyle: e.target.value })}
                    className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent"
                  >
                    <option value="direct">Direct</option>
                    <option value="subtle">Subtle</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-claude-accent hover:bg-claude-accent-hover"
            >
              {isEdit ? 'Update Profile' : 'Create Profile'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}