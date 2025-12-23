'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import BrandProfileSelector from '@/components/tools/BrandProfileSelector'

// Types
type Platform = 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK' | 'TWITTER' | 'LINKEDIN' | 'BLOG'
type Mode = 'content_optimization' | 'ad_copy_generation'
type ContentType = 'POST' | 'CAPTION' | 'TITLE' | 'DESCRIPTION' | 'THREAD' | 'ARTICLE' | 'AD_COPY' | 'PRODUCT_DESCRIPTION' | 'LANDING_PAGE' | 'EMAIL' | 'STORY' | 'REEL' | 'SHORT' | 'CAROUSEL'
type Goal = 'reach' | 'engagement' | 'clicks' | 'sales' | 'followers'
type Tone = 'professional' | 'casual' | 'viral' | 'educational' | 'storytelling' | 'humorous' | 'inspiring'
type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'hi' | 'ar' | 'zh' | 'ja' | 'ko' | 'ru'

interface PlatformResult {
  platform: string
  content: {
    title?: string
    description?: string
    caption?: string
    hashtags: string[]
    hook?: string
    cta?: string
    variants?: Array<{ type: string; title?: string; description?: string }>
  }
  scores: {
    engagement: number
    seo: number
    overall: number
  }
  suggestions: string[]
}

interface OptimizerResponse {
  success: boolean
  results: PlatformResult[]
  overallScore: number
  recommendations: string[]
}

interface HistoryItem {
  id: string
  mode: Mode
  contentType: ContentType
  originalContent: string
  results: OptimizerResponse
  timestamp: Date
  platforms: Platform[]
}

const platforms: { id: Platform; name: string; icon: string; color: string }[] = [
  { id: 'YOUTUBE', name: 'YouTube', icon: '📺', color: 'bg-red-500' },
  { id: 'INSTAGRAM', name: 'Instagram', icon: '📸', color: 'bg-pink-500' },
  { id: 'TIKTOK', name: 'TikTok', icon: '🎵', color: 'bg-black' },
  { id: 'TWITTER', name: 'Twitter/X', icon: '𝕏', color: 'bg-blue-500' },
  { id: 'LINKEDIN', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
  { id: 'BLOG', name: 'Blog/Web', icon: '📝', color: 'bg-orange-500' },
]

const contentTypes = [
  { value: 'POST', label: 'Social Post' },
  { value: 'CAPTION', label: 'Caption' },
  { value: 'TITLE', label: 'Title' },
  { value: 'DESCRIPTION', label: 'Description' },
  { value: 'THREAD', label: 'Thread' },
  { value: 'ARTICLE', label: 'Article' },
  { value: 'AD_COPY', label: 'Ad Copy' },
  { value: 'PRODUCT_DESCRIPTION', label: 'Product Description' },
  { value: 'LANDING_PAGE', label: 'Landing Page' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'STORY', label: 'Story' },
  { value: 'REEL', label: 'Reel' },
  { value: 'SHORT', label: 'Short' },
  { value: 'CAROUSEL', label: 'Carousel' },
]

const goals = [
  { value: 'reach', label: 'Max Reach', icon: '📡', description: 'Expand your audience' },
  { value: 'engagement', label: 'Engagement', icon: '💬', description: 'Get comments, likes, shares' },
  { value: 'clicks', label: 'Clicks', icon: '🖱️', description: 'Drive traffic to links' },
  { value: 'sales', label: 'Sales', icon: '💰', description: 'Convert to customers' },
  { value: 'followers', label: 'Followers', icon: '👥', description: 'Grow your community' },
]

const tones = [
  { value: 'professional', label: 'Professional', icon: '👔' },
  { value: 'casual', label: 'Casual', icon: '😊' },
  { value: 'viral', label: 'Viral', icon: '🔥' },
  { value: 'educational', label: 'Educational', icon: '📚' },
  { value: 'storytelling', label: 'Storytelling', icon: '📖' },
  { value: 'humorous', label: 'Humorous', icon: '😄' },
  { value: 'inspiring', label: 'Inspiring', icon: '✨' },
]

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ar', label: 'Arabic' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ru', label: 'Russian' },
]

const adFormats = [
  { value: 'display', label: 'Display Ad' },
  { value: 'video', label: 'Video Ad' },
  { value: 'social', label: 'Social Media Ad' },
  { value: 'search', label: 'Search Ad' },
  { value: 'native', label: 'Native Ad' },
]

const ctaTypes = [
  { value: 'shop_now', label: 'Shop Now' },
  { value: 'learn_more', label: 'Learn More' },
  { value: 'sign_up', label: 'Sign Up' },
  { value: 'download', label: 'Download' },
  { value: 'contact', label: 'Contact Us' },
]

export default function ContentOptimizerPage() {
  // Mode state
  const [mode, setMode] = useState<Mode>('content_optimization')

  // Input state
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['INSTAGRAM', 'TIKTOK'])
  const [contentType, setContentType] = useState<ContentType>('POST')
  const [inputContent, setInputContent] = useState('')
  const [topic, setTopic] = useState('')
  const [url, setUrl] = useState('')
  const [goal, setGoal] = useState<Goal>('engagement')
  const [language, setLanguage] = useState<Language>('en')
  const [tone, setTone] = useState<Tone>('professional')
  const [targetAudience, setTargetAudience] = useState('')
  const [keywords, setKeywords] = useState('')
  const [brandProfileId, setBrandProfileId] = useState('')
  const [adFormat, setAdFormat] = useState('social')
  const [ctaType, setCtaType] = useState('learn_more')

  // UI state
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<OptimizerResponse | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<string>('A')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<'input' | 'results'>('input')

  // Refs
  const resultsRef = useRef<HTMLDivElement>(null)

  // Scroll to results when available
  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [results])

  const handleOptimize = async () => {
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform')
      return
    }

    if (!inputContent && !topic) {
      alert('Please enter content or a topic')
      return
    }

    setLoading(true)
    setActiveTab('results')

    try {
      const response = await fetch('/api/ai/content-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          platforms: selectedPlatforms,
          contentType,
          content: inputContent,
          topic,
          url,
          goal,
          language,
          tone,
          targetAudience,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          brandProfileId: brandProfileId || undefined,
          adFormat: mode === 'ad_copy_generation' ? adFormat : undefined,
          ctaType: mode === 'ad_copy_generation' ? ctaType : undefined,
        }),
      })

      const data = await response.json()

      if (data.success && data.results) {
        setResults(data.results)
        setSelectedPlatform(data.results.results[0]?.platform as Platform || selectedPlatforms[0])

        // Add to history
        const historyItem: HistoryItem = {
          id: data.optimizationId || Date.now().toString(),
          mode,
          contentType,
          originalContent: inputContent || topic,
          results: data.results,
          timestamp: new Date(),
          platforms: selectedPlatforms,
        }
        setHistory(prev => [historyItem, ...prev].slice(0, 20))
      } else {
        alert(data.error || 'Optimization failed')
      }
    } catch (error) {
      console.error('Optimization error:', error)
      alert('Optimization failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const exportContent = (platform: Platform) => {
    const platformResult = results?.results.find(r => r.platform === platform)
    if (!platformResult) return

    const content = platformResult.content
    let exportText = `=== ${platform} Optimized Content ===\n\n`

    if (content.title) exportText += `Title: ${content.title}\n\n`
    if (content.hook) exportText += `Hook: ${content.hook}\n\n`
    if (content.caption || content.description) {
      exportText += `Content:\n${content.caption || content.description}\n\n`
    }
    if (content.cta) exportText += `CTA: ${content.cta}\n\n`
    if (content.hashtags.length > 0) {
      exportText += `Hashtags: ${content.hashtags.join(' ')}\n`
    }

    const blob = new Blob([exportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${platform.toLowerCase()}-optimized-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportAllContent = () => {
    if (!results) return

    let allContent = `=== Universal Content Optimizer Results ===\n`
    allContent += `Generated: ${new Date().toLocaleString()}\n`
    allContent += `Overall Score: ${results.overallScore}/100\n\n`

    results.results.forEach(result => {
      allContent += `\n${'='.repeat(50)}\n`
      allContent += `PLATFORM: ${result.platform}\n`
      allContent += `Overall Score: ${result.scores.overall}/100\n`
      allContent += `${'='.repeat(50)}\n\n`

      const content = result.content
      if (content.title) allContent += `Title: ${content.title}\n\n`
      if (content.hook) allContent += `Hook: ${content.hook}\n\n`
      if (content.caption || content.description) {
        allContent += `Content:\n${content.caption || content.description}\n\n`
      }
      if (content.cta) allContent += `CTA: ${content.cta}\n\n`
      if (content.hashtags.length > 0) {
        allContent += `Hashtags: ${content.hashtags.join(' ')}\n`
      }
    })

    allContent += `\n\n${'='.repeat(50)}\n`
    allContent += `RECOMMENDATIONS\n`
    allContent += `${'='.repeat(50)}\n\n`
    results.recommendations.forEach((rec, i) => {
      allContent += `${i + 1}. ${rec}\n`
    })

    const blob = new Blob([allContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `all-platforms-optimized-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const currentPlatformData = results?.results.find(r => r.platform === selectedPlatform)
  const currentVariant =
    currentPlatformData?.content.variants?.find(v => v.type === selectedVariant) ||
    currentPlatformData?.content.variants?.[0]

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-claude-bg to-claude-bg-secondary">
      {/* Header */}
      <div className="border-b border-claude-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-claude-text flex items-center gap-3">
                <span className="text-3xl">🚀</span>
                Universal Content Optimizer
              </h1>
              <p className="text-claude-text-secondary text-sm mt-1">
                One prompt → Optimized content for every platform
              </p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 text-sm border border-claude-border rounded-lg hover:bg-claude-bg-secondary transition-colors flex items-center gap-2"
            >
              <span>📜</span>
              <span>History ({history.length})</span>
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setMode('content_optimization')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                mode === 'content_optimization'
                  ? 'bg-claude-accent text-white'
                  : 'bg-claude-bg-secondary text-claude-text hover:bg-claude-bg-tertiary'
              }`}
            >
              ✍️ Content Optimization
            </button>
            <button
              onClick={() => setMode('ad_copy_generation')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                mode === 'ad_copy_generation'
                  ? 'bg-claude-accent text-white'
                  : 'bg-claude-bg-secondary text-claude-text hover:bg-claude-bg-tertiary'
              }`}
            >
              📢 Ad Copy Generator
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          <div className="flex h-full">
            {/* Left Panel - Input */}
            <div className={`transition-all duration-300 ${results ? 'w-1/2' : 'w-full'} border-r border-claude-border overflow-y-auto`}>
              <div className="p-6 space-y-6">
                {/* Platform Selector */}
                <div>
                  <label className="block text-sm font-semibold text-claude-text mb-3">
                    Select Platforms *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {platforms.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => {
                          setSelectedPlatforms(prev =>
                            prev.includes(platform.id)
                              ? prev.filter(p => p !== platform.id)
                              : [...prev, platform.id]
                          )
                        }}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                          selectedPlatforms.includes(platform.id)
                            ? 'border-claude-accent bg-claude-accent/10'
                            : 'border-claude-border hover:border-claude-accent/50'
                        }`}
                      >
                        <span className="text-2xl">{platform.icon}</span>
                        <span className="text-xs font-medium">{platform.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Type & Goal */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-claude-text mb-2">
                      Content Type
                    </label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value as ContentType)}
                      className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent"
                    >
                      {contentTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-claude-text mb-2">
                      Primary Goal
                    </label>
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value as Goal)}
                      className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent"
                    >
                      {goals.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.icon} {g.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Main Input Area - ChatGPT-like */}
                <div>
                  <label className="block text-sm font-semibold text-claude-text mb-2">
                    {mode === 'ad_copy_generation' ? 'Product/Service Description' : 'Your Content or Topic'}
                  </label>
                  <div className="relative">
                    <textarea
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      rows={6}
                      placeholder={mode === 'ad_copy_generation'
                        ? "Describe your product or service...\n\nExample: Premium organic coffee subscription box delivering freshly roasted beans monthly. Sourced from sustainable farms, roasted to order, and delivered within 48 hours."
                        : "Enter your content, paste a draft, or describe what you want to create...\n\nExample: 5 productivity tips for remote workers to maintain work-life balance"
                      }
                      className="w-full px-4 py-3 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent resize-none text-sm"
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-claude-text-tertiary">
                      {inputContent.length} chars
                    </div>
                  </div>

                  {/* Additional Inputs */}
                  <div className="mt-3 space-y-3">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Topic or main idea (optional)"
                      className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm"
                    />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Reference URL (optional)"
                      className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm"
                    />
                  </div>
                </div>

                {/* Tone & Language */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-claude-text mb-2">
                      Tone & Style
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value as Tone)}
                      className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent"
                    >
                      {tones.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.icon} {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-claude-text mb-2">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as Language)}
                      className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent"
                    >
                      {languages.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Audience & Keywords */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-claude-text mb-2">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g., Professionals 25-35"
                      className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-claude-text mb-2">
                      Keywords
                    </label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="productivity, remote work"
                      className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm"
                    />
                  </div>
                </div>

                {/* Brand Voice */}
                <div>
                  <label className="block text-sm font-semibold text-claude-text mb-2">
                    Brand Voice (optional)
                  </label>
                  <BrandProfileSelector
                    value={brandProfileId}
                    onChange={setBrandProfileId}
                  />
                </div>

                {/* Ad Copy Specific Options */}
                {mode === 'ad_copy_generation' && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-claude-bg-secondary rounded-lg">
                    <div>
                      <label className="block text-sm font-semibold text-claude-text mb-2">
                        Ad Format
                      </label>
                      <select
                        value={adFormat}
                        onChange={(e) => setAdFormat(e.target.value)}
                        className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm"
                      >
                        {adFormats.map((format) => (
                          <option key={format.value} value={format.value}>
                            {format.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-claude-text mb-2">
                        CTA Type
                      </label>
                      <select
                        value={ctaType}
                        onChange={(e) => setCtaType(e.target.value)}
                        className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm"
                      >
                        {ctaTypes.map((cta) => (
                          <option key={cta.value} value={cta.value}>
                            {cta.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleOptimize}
                  disabled={loading || selectedPlatforms.length === 0 || (!inputContent && !topic)}
                  className="w-full px-6 py-4 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Optimize for {selectedPlatforms.length} Platform{selectedPlatforms.length > 1 ? 's' : ''}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Panel - Results */}
            {results && (
              <div className="w-1/2 overflow-y-auto bg-white" ref={resultsRef}>
                <div className="sticky top-0 bg-white border-b border-claude-border z-10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-claude-text">Optimized Results</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <span>⭐</span>
                          <span>Score: {results.overallScore}/100</span>
                        </div>
                        <span className="text-xs text-claude-text-secondary">
                          {selectedPlatforms.length} platforms
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={exportAllContent}
                        className="px-3 py-1.5 text-sm border border-claude-border rounded-lg hover:bg-claude-bg-secondary transition-colors"
                      >
                        📥 Export All
                      </button>
                    </div>
                  </div>

                  {/* Platform Tabs */}
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {results.results.map((result) => {
                      const platformInfo = platforms.find(p => p.id === result.platform)
                      return (
                        <button
                          key={result.platform}
                          onClick={() => setSelectedPlatform(result.platform as Platform)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 transition-all whitespace-nowrap ${
                            selectedPlatform === result.platform
                              ? 'border-claude-accent bg-claude-accent/10'
                              : 'border-claude-border hover:border-claude-accent/50'
                          }`}
                        >
                          <span className="text-lg">{platformInfo?.icon}</span>
                          <span className="text-sm font-medium">{platformInfo?.name}</span>
                          <span className="text-xs text-claude-text-secondary">
                            {result.scores.overall}/100
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Platform Content */}
                {currentPlatformData && (
                  <div className="p-6 space-y-6">
                    {/* Scores */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-claude-bg-secondary rounded-lg text-center">
                        <div className="text-2xl font-bold text-claude-accent">
                          {currentPlatformData.scores.engagement}
                        </div>
                        <div className="text-xs text-claude-text-secondary">Engagement</div>
                      </div>
                      <div className="p-3 bg-claude-bg-secondary rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {currentPlatformData.scores.seo}
                        </div>
                        <div className="text-xs text-claude-text-secondary">SEO Score</div>
                      </div>
                      <div className="p-3 bg-claude-bg-secondary rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {currentPlatformData.scores.overall}
                        </div>
                        <div className="text-xs text-claude-text-secondary">Overall</div>
                      </div>
                    </div>

                    {/* Variant Selector */}
                    {currentPlatformData.content.variants && currentPlatformData.content.variants.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-claude-text mb-2">
                          A/B Test Variants
                        </label>
                        <div className="flex gap-2">
                          {currentPlatformData.content.variants.map((variant) => (
                            <button
                              key={variant.type}
                              onClick={() => setSelectedVariant(variant.type)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                selectedVariant === variant.type
                                  ? 'bg-claude-accent text-white'
                                  : 'bg-claude-bg-secondary text-claude-text hover:bg-claude-bg-tertiary'
                              }`}
                            >
                              Variant {variant.type}
                            </button>
                          ))}
                          <button
                            onClick={() => setSelectedVariant('original')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              selectedVariant === 'original'
                                ? 'bg-claude-accent text-white'
                                : 'bg-claude-bg-secondary text-claude-text hover:bg-claude-bg-tertiary'
                            }`}
                          >
                            Original
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Title */}
                    {(currentVariant?.title || currentPlatformData.content.title) && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-claude-text">
                              Title
                            </label>
                            <button
                              onClick={() => copyToClipboard(currentVariant?.title || currentPlatformData.content.title || '')}
                              className="text-xs px-2 py-1 border border-claude-border rounded hover:bg-claude-bg-secondary"
                            >
                              📋 Copy
                            </button>
                          </div>
                          <div className="p-3 bg-claude-bg-secondary rounded-lg text-claude-text">
                            {currentVariant?.title || currentPlatformData.content.title}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Hook */}
                    {currentPlatformData.content.hook && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-claude-text">
                              🔥 Hook
                            </label>
                            <button
                              onClick={() => copyToClipboard(currentPlatformData.content.hook || '')}
                              className="text-xs px-2 py-1 border border-claude-border rounded hover:bg-claude-bg-secondary"
                            >
                              📋 Copy
                            </button>
                          </div>
                          <div className="p-3 bg-gradient-to-r from-claude-accent/10 to-orange-100 rounded-lg text-claude-text border-l-4 border-claude-accent">
                            {currentPlatformData.content.hook}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Content/Description */}
                    {(currentVariant?.description || currentPlatformData.content.caption || currentPlatformData.content.description) && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-claude-text">
                              Content
                            </label>
                            <button
                              onClick={() => copyToClipboard(currentVariant?.description || currentPlatformData.content.caption || currentPlatformData.content.description || '')}
                              className="text-xs px-2 py-1 border border-claude-border rounded hover:bg-claude-bg-secondary"
                            >
                              📋 Copy
                            </button>
                          </div>
                          <div className="p-4 bg-claude-bg-secondary rounded-lg text-claude-text whitespace-pre-wrap text-sm">
                            {currentVariant?.description || currentPlatformData.content.caption || currentPlatformData.content.description}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* CTA */}
                    {currentPlatformData.content.cta && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-claude-text">
                              Call-to-Action
                            </label>
                            <button
                              onClick={() => copyToClipboard(currentPlatformData.content.cta || '')}
                              className="text-xs px-2 py-1 border border-claude-border rounded hover:bg-claude-bg-secondary"
                            >
                              📋 Copy
                            </button>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg text-claude-text border-l-4 border-blue-500">
                            {currentPlatformData.content.cta}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Hashtags */}
                    {currentPlatformData.content.hashtags.length > 0 && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-claude-text">
                              Hashtags
                            </label>
                            <button
                              onClick={() => copyToClipboard(currentPlatformData.content.hashtags.join(' '))}
                              className="text-xs px-2 py-1 border border-claude-border rounded hover:bg-claude-bg-secondary"
                            >
                              📋 Copy All
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {currentPlatformData.content.hashtags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-claude-accent/10 text-claude-accent rounded text-sm cursor-pointer hover:bg-claude-accent/20"
                                onClick={() => copyToClipboard(tag)}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Suggestions */}
                    {currentPlatformData.suggestions.length > 0 && (
                      <Card variant="outlined">
                        <CardContent className="pt-6">
                          <label className="text-sm font-semibold text-claude-text mb-3 block">
                            💡 AI Suggestions
                          </label>
                          <ul className="space-y-2">
                            {currentPlatformData.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-claude-text-secondary">
                                <span className="text-claude-accent mt-0.5">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Export Single Platform */}
                    <button
                      onClick={() => exportContent(selectedPlatform)}
                      className="w-full px-4 py-3 border-2 border-claude-border rounded-lg hover:border-claude-accent hover:bg-claude-bg-secondary transition-all flex items-center justify-center gap-2"
                    >
                      📥 Export {selectedPlatform} Content
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-claude-border shadow-xl z-20 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-claude-border flex items-center justify-between">
            <h3 className="font-semibold text-claude-text">Generation History</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="p-1 hover:bg-claude-bg-secondary rounded"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setResults(item.results)
                  setSelectedPlatform(item.results.results[0]?.platform as Platform)
                  setShowHistory(false)
                }}
                className="w-full text-left p-3 border border-claude-border rounded-lg hover:border-claude-accent hover:bg-claude-bg transition-all"
              >
                <div className="text-sm font-medium text-claude-text line-clamp-2">
                  {item.originalContent.substring(0, 50)}...
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-claude-text-secondary">
                  <span>{item.platforms.length} platforms</span>
                  <span>•</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              </button>
            ))}
            {history.length === 0 && (
              <div className="text-center py-8 text-claude-text-secondary">
                <div className="text-4xl mb-2">📜</div>
                <p className="text-sm">No history yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
