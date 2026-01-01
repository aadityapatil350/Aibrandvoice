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
  'Luxury', 'Minimalist', 'Playful', 'Sophisticated',
  'Approachable', 'Enthusiastic', 'Tech-savvy', 'Encouraging'
]

const industries = [
  'Technology & Software Development',
  'Fashion & Beauty',
  'Food & Beverage',
  'Fitness & Wellness',
  'Education',
  'Entertainment',
  'Finance',
  'Healthcare',
  'Real Estate',
  'Travel',
  'Automotive',
  'Retail',
  'Manufacturing',
  'SaaS',
  'E-commerce',
  'Media & Publishing',
  'Consulting',
  'Non-profit'
]

const contentTypes = [
  'Quick Tips (60 seconds)',
  'In-depth Tutorials (10-15 min)',
  'Project Builds',
  'Tech Explainers',
  'Tool Reviews',
  'Live Coding Sessions',
  'Blog Posts',
  'Social Media Posts',
  'Newsletters',
  'Case Studies',
  'Whitepapers',
  'Webinars',
  'Podcasts'
]

// Helper component for field hints
const FieldHint = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
    <div className="flex items-start gap-2">
      <span className="text-blue-500 text-sm">💡</span>
      <p className="text-xs text-blue-700 leading-relaxed">{children}</p>
    </div>
  </div>
)

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
    brandColors: initialData?.brandColors || {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#F59E0B',
      background: '#1F2937',
      text: '#F3F4F6'
    },
    tone: initialData?.tone || [],

    // Competitive Analysis
    competitorChannels: initialData?.competitorChannels || [],
    inspirationChannels: initialData?.inspirationChannels || [],
    targetKeywords: initialData?.targetKeywords || [],
    contentTypeFocus: initialData?.contentTypeFocus || [],
    uniqueSellingProposition: initialData?.uniqueSellingProposition || '',
    contentPillars: initialData?.contentPillars || [],

    // Voice Preferences (Critical for AI Training)
    communicationStyle: initialData?.communicationStyle || '',
    formality: initialData?.formality || 'casual',
    emotionalTone: initialData?.emotionalTone || 'Enthusiastic and encouraging',
    complexity: initialData?.complexity || 'moderate',
    callToActionStyle: initialData?.callToActionStyle || 'direct',

    // Competitor Analysis Data
    competitorAnalysis: initialData?.competitorAnalysis || {}
  })

  const [scrapingStatus, setScrapingStatus] = useState('')
  const [competitorData, setCompetitorData] = useState<any[]>(
    initialData?.competitorAnalysis?.competitors || []
  )
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
      competitorChannels: formData.competitorChannels.filter((_: any, i: number) => i !== index)
    })
  }

  const handleCompetitorChange = (index: number, value: string) => {
    const updated = [...formData.competitorChannels]
    updated[index] = value
    setFormData({ ...formData, competitorChannels: updated })
  }

  const handleAddInspiration = () => {
    setFormData({
      ...formData,
      inspirationChannels: [...formData.inspirationChannels, '']
    })
  }

  const handleRemoveInspiration = (index: number) => {
    setFormData({
      ...formData,
      inspirationChannels: formData.inspirationChannels.filter((_: any, i: number) => i !== index)
    })
  }

  const handleInspirationChange = (index: number, value: string) => {
    const updated = [...formData.inspirationChannels]
    updated[index] = value
    setFormData({ ...formData, inspirationChannels: updated })
  }

  const handleAddContentPillar = () => {
    setFormData({
      ...formData,
      contentPillars: [...formData.contentPillars, '']
    })
  }

  const handleRemoveContentPillar = (index: number) => {
    setFormData({
      ...formData,
      contentPillars: formData.contentPillars.filter((_: any, i: number) => i !== index)
    })
  }

  const handleContentPillarChange = (index: number, value: string) => {
    const updated = [...formData.contentPillars]
    updated[index] = value
    setFormData({ ...formData, contentPillars: updated })
  }

  const handleAnalyzeCompetitors = async () => {
    if (formData.competitorChannels.filter((c: any) => c).length === 0) {
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
          channels: formData.competitorChannels.filter((c: any) => c),
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
      competitorAnalysis: {
        competitors: competitorData,
        analyzedAt: new Date().toISOString()
      }
    }

    onSave(payload)
  }

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto">
        {/* Header with AI Training Info */}
        <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🧠</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isEdit ? 'Edit Brand Profile' : 'Create Your AI Brand Voice'}
              </h2>
              <p className="text-gray-700 mb-3">
                Build a comprehensive profile to train AI on your unique brand voice and content style.
              </p>
              <div className="grid md:grid-cols-3 gap-3 mt-4">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm text-gray-600">Define your brand identity & voice</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm text-gray-600">Analyze competitors for insights</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm text-gray-600">Generate on-brand content automatically</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Basic Brand Information */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Basic Brand Information</h3>
                  <p className="text-sm text-gray-500">Foundation of your AI-powered brand voice</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Brand Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Tech Influencer Pro"
                    required
                    className="text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select your industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Brand Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Describe your brand, mission, and what makes you unique. Be specific - this helps AI understand your brand personality."
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  required
                />
                <FieldHint>
                  <strong>AI Training Tip:</strong> A clear, detailed description helps the AI capture your brand's essence. Mention your mission, values, and what sets you apart.
                </FieldHint>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Website URL
                  </label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourbrand.com"
                    type="url"
                    className="text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Target Audience <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="e.g., Developers, tech enthusiasts aged 18-35"
                    required
                    className="text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Unique Selling Proposition (USP) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.uniqueSellingProposition}
                  onChange={(e) => setFormData({ ...formData, uniqueSellingProposition: e.target.value })}
                  placeholder="What makes your brand unique? Why should people choose you?"
                  required
                  className="text-base"
                />
                <FieldHint>
                  <strong>AI Training Tip:</strong> Your USP helps AI differentiate your content from competitors and highlight your unique value in every piece of content.
                </FieldHint>
              </div>
            </CardContent>
          </Card>

          {/* 2. Content Strategy */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📝</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Content Strategy</h3>
                  <p className="text-sm text-gray-500">Define what content you create and why</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Content Pillars <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs font-normal text-gray-500">(Add 3-6 main topics you focus on)</span>
                </label>
                {formData.contentPillars.map((pillar: string, index: number) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={pillar}
                      onChange={(e) => handleContentPillarChange(index, e.target.value)}
                      placeholder={`e.g., ${['Web Development Tutorials', 'AI & Machine Learning', 'Career Advice for Developers'][index] || 'Content Pillar'}`}
                      className="flex-1 text-base"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleRemoveContentPillar(index)}
                      className="px-4"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddContentPillar}
                  className="mt-2"
                >
                  + Add Content Pillar
                </Button>
                <FieldHint>
                  <strong>AI Training Tip:</strong> Content pillars are the main topics you consistently create content about. They help AI understand your expertise areas and generate relevant topic ideas.
                </FieldHint>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Content Types You Create
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {contentTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
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
                              contentTypeFocus: formData.contentTypeFocus.filter((t: any) => t !== type)
                            })
                          }
                        }}
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Target Keywords
                  <span className="ml-2 text-xs font-normal text-gray-500">(Separate with commas)</span>
                </label>
                <Input
                  value={formData.targetKeywords.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    targetKeywords: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  placeholder="e.g., web development, react, nextjs, typescript, ai development"
                  className="text-base"
                />
                <FieldHint>
                  <strong>AI Training Tip:</strong> Keywords help AI optimize content for search and ensure it covers topics your audience is looking for.
                </FieldHint>
              </div>
            </CardContent>
          </Card>

          {/* 3. Voice & Tone (Most Important for AI) */}
          <Card className="border-2 border-amber-300">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎙️</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">Voice & Tone Preferences</h3>
                  <p className="text-sm text-gray-500">Critical for AI to match your writing style</p>
                </div>
                <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                  IMPORTANT
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Brand Tone & Voice Attributes <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs font-normal text-gray-500">(Select 3-6 that best describe your brand)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {toneOptions.map((tone) => (
                    <label key={tone} className={cn(
                      "flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all",
                      formData.tone.includes(tone)
                        ? "bg-amber-50 border-amber-500 shadow-sm"
                        : "border-gray-200 hover:bg-gray-50"
                    )}>
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
                              tone: formData.tone.filter((t: any) => t !== tone)
                            })
                          }
                        }}
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700 font-medium">{tone}</span>
                    </label>
                  ))}
                </div>
                <FieldHint>
                  <strong>AI Training Tip:</strong> These tone attributes are the backbone of your brand voice. Choose ones that truly represent how you communicate.
                </FieldHint>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Communication Style <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.communicationStyle}
                  onChange={(e) => setFormData({ ...formData, communicationStyle: e.target.value })}
                  rows={3}
                  placeholder="e.g., Clear, concise, and example-driven. Uses analogies to explain complex concepts. Balances technical depth with accessibility."
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Formality Level
                  </label>
                  <select
                    value={formData.formality}
                    onChange={(e) => setFormData({ ...formData, formality: e.target.value })}
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="formal">Formal (Professional, structured)</option>
                    <option value="casual">Casual (Conversational, relaxed)</option>
                    <option value="mixed">Mixed (Adapts to context)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Content Complexity
                  </label>
                  <select
                    value={formData.complexity}
                    onChange={(e) => setFormData({ ...formData, complexity: e.target.value })}
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="simple">Simple (Easy to understand)</option>
                    <option value="moderate">Moderate (Balanced depth)</option>
                    <option value="complex">Complex (Technical, detailed)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Call-to-Action Style
                  </label>
                  <select
                    value={formData.callToActionStyle}
                    onChange={(e) => setFormData({ ...formData, callToActionStyle: e.target.value })}
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="direct">Direct (Clear, action-focused)</option>
                    <option value="subtle">Subtle (Gentle suggestions)</option>
                    <option value="none">None (No CTAs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Emotional Tone
                </label>
                <Input
                  value={formData.emotionalTone}
                  onChange={(e) => setFormData({ ...formData, emotionalTone: e.target.value })}
                  placeholder="e.g., Enthusiastic and encouraging, celebrating wins and normalizing struggles"
                  className="text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* 4. Competitive Analysis (Optional but Recommended) */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🔍</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">Competitive Analysis</h3>
                  <p className="text-sm text-gray-500">Optional: Learn from competitors to differentiate your content</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  OPTIONAL
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Competitor YouTube Channels
                </label>
                {formData.competitorChannels.map((channel: any, index: number) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={channel}
                      onChange={(e) => handleCompetitorChange(index, e.target.value)}
                      placeholder="https://youtube.com/@competitor"
                      className="flex-1 text-base"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleRemoveCompetitor(index)}
                      className="px-4"
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

              {formData.competitorChannels.filter((c: string) => c).length > 0 && (
                <Button
                  type="button"
                  onClick={handleAnalyzeCompetitors}
                  disabled={isScraping}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isScraping ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing Competitors...
                    </div>
                  ) : (
                    '🔍 Analyze Competitors'
                  )}
                </Button>
              )}

              {scrapingStatus && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">{scrapingStatus}</p>
                </div>
              )}

              {competitorData.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Competitor Insights:</h4>
                  {competitorData.map((competitor, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <p className="font-medium text-gray-900">{competitor.channelName}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Subscribers: {competitor.subscribers?.toLocaleString()} |
                        Videos: {competitor.videoCount} |
                        Avg Views: {competitor.avgViews?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Top content: {competitor.topContent?.slice(0, 3).join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-200 pt-5 mt-5">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Inspiration YouTube Channels
                  <span className="ml-2 text-xs font-normal text-gray-500">(Channels that inspire your content)</span>
                </label>
                {formData.inspirationChannels.map((channel: any, index: number) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={channel}
                      onChange={(e) => handleInspirationChange(index, e.target.value)}
                      placeholder="https://youtube.com/@inspiration"
                      className="flex-1 text-base"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleRemoveInspiration(index)}
                      className="px-4"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddInspiration}
                  className="mt-2"
                >
                  + Add Inspiration Channel
                </Button>
                <FieldHint>
                  <strong>AI Training Tip:</strong> Inspiration channels help AI understand content styles, formats, and approaches you admire. Different from competitors - these are channels you learn from and want to emulate.
                </FieldHint>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 pb-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-base py-6 shadow-lg shadow-amber-500/30"
            >
              <span className="text-lg mr-2">✨</span>
              {isEdit ? 'Update Brand Profile' : 'Create Brand Profile & Start Training'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto px-8 py-6 text-base"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
