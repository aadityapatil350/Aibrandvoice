'use client'

import { useState, useEffect, useRef } from 'react'
import {
  YouTubeLogo,
  InstagramLogo,
  TikTokLogo,
  TwitterLogo,
  LinkedInLogo,
  RedditLogo,
  BlogLogo
} from '@/components/ui/PlatformLogos'
import BrandProfileSelector from '@/components/tools/BrandProfileSelector'
import { SlidingSidebar } from '@/components/ui/SlidingSidebar'

// Types
type Platform = 'YOUTUBE' | 'INSTAGRAM' | 'TWITTER' | 'LINKEDIN' | 'BLOG' | 'REDDIT'
type ContentType = 'POST' | 'CAPTION' | 'TITLE' | 'DESCRIPTION' | 'THREAD' | 'ARTICLE' | 'AD_COPY' | 'PRODUCT_DESCRIPTION' | 'LANDING_PAGE' | 'EMAIL' | 'STORY' | 'REEL' | 'SHORT' | 'CAROUSEL' | 'SCRIPT' | 'REDDIT_POST' | 'REDDIT_COMMENT' | 'REDDIT_AMA'
type Goal = 'reach' | 'engagement' | 'clicks' | 'sales' | 'followers'
type Tone = 'professional' | 'casual' | 'viral' | 'educational' | 'storytelling' | 'humorous' | 'inspiring'
type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'mr' | 'gu' | 'bn' | 'pa' | 'ar' | 'zh' | 'ja' | 'ko' | 'ru'

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
  bulkResults?: Array<{ setNumber: number; results: PlatformResult[] }>
  overallScore: number
  recommendations: string[]
}

type MessageRole = 'user' | 'assistant' | 'system'

interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  results?: OptimizerResponse
  config?: {
    platform: Platform
    contentType: ContentType
    goal: Goal
    tone: Tone
    language: string
  }
  isStreaming?: boolean
}

interface SavedChat {
  id: string
  title: string
  timestamp: Date
  config?: {
    platform: Platform
    contentType: ContentType
    goal: Goal
    tone: Tone
    languages: Language[]
  }
  messages: ChatMessage[]
}

// Platform configurations with proper logos
const platforms: { id: Platform; name: string; description: string; color: string }[] = [
  { id: 'YOUTUBE', name: 'YouTube', description: 'Videos, Shorts, Community', color: '#FF0000' },
  { id: 'INSTAGRAM', name: 'Instagram', description: 'Posts, Reels, Stories', color: '#E4405F' },
  { id: 'TWITTER', name: 'Twitter/X', description: 'Tweets & Threads', color: '#000000' },
  { id: 'LINKEDIN', name: 'LinkedIn', description: 'Professional network', color: '#0077B5' },
  { id: 'REDDIT', name: 'Reddit', description: 'Community discussions', color: '#FF4500' },
  { id: 'BLOG', name: 'Blog/Web', description: 'Articles & SEO', color: '#F59E0B' },
]

const platformIcons: Record<Platform, React.FC<{ className?: string }>> = {
  YOUTUBE: YouTubeLogo,
  INSTAGRAM: InstagramLogo,
  TWITTER: TwitterLogo,
  LINKEDIN: LinkedInLogo,
  REDDIT: RedditLogo,
  BLOG: BlogLogo,
}

const platformContentTypes: Record<Platform, Array<{ value: ContentType; label: string; emoji: string }>> = {
  YOUTUBE: [
    { value: 'TITLE', label: 'Video Title', emoji: '📌' },
    { value: 'DESCRIPTION', label: 'Video Description', emoji: '📝' },
    { value: 'POST', label: 'Community Post', emoji: '💬' },
    { value: 'SCRIPT', label: 'Script Writer', emoji: '🎬' },
  ],
  INSTAGRAM: [
    { value: 'CAPTION', label: 'Post Caption', emoji: '✍️' },
    { value: 'REEL', label: 'Reel Caption', emoji: '🎬' },
    { value: 'STORY', label: 'Story', emoji: '📖' },
    { value: 'CAROUSEL', label: 'Carousel', emoji: '🎠' },
    { value: 'SCRIPT', label: 'Script Writer', emoji: '🎬' },
  ],
  TWITTER: [
    { value: 'POST', label: 'Single Tweet', emoji: '🐦' },
    { value: 'THREAD', label: 'Thread', emoji: '🧵' },
  ],
  LINKEDIN: [
    { value: 'POST', label: 'Post', emoji: '💼' },
    { value: 'ARTICLE', label: 'Article', emoji: '📰' },
  ],
  REDDIT: [
    { value: 'REDDIT_POST', label: 'Text Post', emoji: '📝' },
    { value: 'REDDIT_COMMENT', label: 'Comment', emoji: '💬' },
    { value: 'REDDIT_AMA', label: 'AMA', emoji: '❓' },
    { value: 'TITLE', label: 'Title Only', emoji: '📌' },
  ],
  BLOG: [
    { value: 'ARTICLE', label: 'Blog Article', emoji: '📰' },
    { value: 'TITLE', label: 'SEO Title', emoji: '📌' },
    { value: 'DESCRIPTION', label: 'Meta Description', emoji: '📝' },
    { value: 'LANDING_PAGE', label: 'Landing Page', emoji: '🌐' },
  ],
}

// Universal goals (all platforms)
const universalGoals: Array<{ value: Goal; label: string; icon: string; description: string }> = [
  { value: 'sales', label: 'Drive Sales', icon: '💰', description: 'Convert followers to customers' },
  { value: 'engagement', label: 'Boost Engagement', icon: '💬', description: 'Increase likes, comments, shares' },
  { value: 'reach', label: 'Expand Reach', icon: '🌍', description: 'Get discovered by new audiences' },
  { value: 'clicks', label: 'Get Clicks', icon: '🔗', description: 'Drive traffic to your link' },
  { value: 'followers', label: 'Gain Followers', icon: '👥', description: 'Grow your audience' },
]

// Universal tones (all platforms)
const universalTones: Array<{ value: Tone; label: string; icon: string; description: string }> = [
  { value: 'professional', label: 'Professional', icon: '👔', description: 'Expert & credible' },
  { value: 'casual', label: 'Casual', icon: '😊', description: 'Friendly & approachable' },
  { value: 'viral', label: 'Viral/Trending', icon: '🔥', description: 'Catchy & shareable' },
  { value: 'educational', label: 'Educational', icon: '📚', description: 'Informative & helpful' },
  { value: 'storytelling', label: 'Storytelling', icon: '📖', description: 'Narrative & emotional' },
  { value: 'humorous', label: 'Humorous', icon: '😄', description: 'Funny & entertaining' },
  { value: 'inspiring', label: 'Inspiring', icon: '✨', description: 'Motivational & uplifting' },
]

const platformGoals: Record<Platform, Array<{ value: Goal; label: string; icon: string }>> = {
  YOUTUBE: [
    { value: 'sales', label: 'Sell Products', icon: '💰' },
    { value: 'reach', label: 'More Views', icon: '👁️' },
    { value: 'engagement', label: 'Engagement', icon: '💬' },
    { value: 'clicks', label: 'Get Clicks', icon: '🔗' },
    { value: 'followers', label: 'Subscribers', icon: '👥' },
  ],
  INSTAGRAM: [
    { value: 'sales', label: 'Sell Products', icon: '💰' },
    { value: 'engagement', label: 'Engagement', icon: '❤️' },
    { value: 'reach', label: 'Explore', icon: '🔍' },
    { value: 'clicks', label: 'Link Clicks', icon: '🔗' },
    { value: 'followers', label: 'Followers', icon: '👥' },
  ],
  TWITTER: [
    { value: 'sales', label: 'Sell Products', icon: '💰' },
    { value: 'engagement', label: 'Engagement', icon: '💬' },
    { value: 'reach', label: 'Go Viral', icon: '🔥' },
    { value: 'clicks', label: 'Clicks', icon: '🔗' },
    { value: 'followers', label: 'Followers', icon: '👥' },
  ],
  LINKEDIN: [
    { value: 'sales', label: 'Generate Leads', icon: '💰' },
    { value: 'engagement', label: 'Engagement', icon: '💬' },
    { value: 'reach', label: 'Impressions', icon: '👁️' },
    { value: 'clicks', label: 'Website Clicks', icon: '🔗' },
  ],
  REDDIT: [
    { value: 'engagement', label: 'Discussion', icon: '⬆️' },
    { value: 'reach', label: 'Front Page', icon: '🏆' },
    { value: 'clicks', label: 'Traffic', icon: '🔗' },
  ],
  BLOG: [
    { value: 'sales', label: 'Conversions', icon: '💰' },
    { value: 'reach', label: 'SEO Traffic', icon: '🔍' },
    { value: 'engagement', label: 'Engagement', icon: '💬' },
  ],
}

const platformTones: Record<Platform, Array<{ value: Tone; label: string; icon: string }>> = {
  YOUTUBE: [
    { value: 'professional', label: 'Professional', icon: '👔' },
    { value: 'educational', label: 'Educational', icon: '📚' },
    { value: 'casual', label: 'Casual', icon: '😊' },
    { value: 'humorous', label: 'Entertaining', icon: '🎮' },
    { value: 'storytelling', label: 'Storytelling', icon: '📖' },
    { value: 'inspiring', label: 'Inspiring', icon: '✨' },
  ],
  INSTAGRAM: [
    { value: 'inspiring', label: 'Inspiring', icon: '✨' },
    { value: 'casual', label: 'Casual', icon: '😊' },
    { value: 'viral', label: 'Viral', icon: '🔥' },
    { value: 'professional', label: 'Professional', icon: '👔' },
    { value: 'storytelling', label: 'Storytelling', icon: '📖' },
    { value: 'humorous', label: 'Funny', icon: '😄' },
  ],
  TWITTER: [
    { value: 'viral', label: 'Viral', icon: '🔥' },
    { value: 'casual', label: 'Casual', icon: '😊' },
    { value: 'professional', label: 'Professional', icon: '👔' },
    { value: 'humorous', label: 'Witty', icon: '😄' },
    { value: 'educational', label: 'Educational', icon: '📚' },
    { value: 'storytelling', label: 'Storytelling', icon: '📖' },
  ],
  LINKEDIN: [
    { value: 'professional', label: 'Professional', icon: '👔' },
    { value: 'educational', label: 'Thought Leader', icon: '💡' },
    { value: 'inspiring', label: 'Inspiring', icon: '✨' },
    { value: 'casual', label: 'Casual', icon: '😊' },
    { value: 'storytelling', label: 'Storytelling', icon: '📖' },
  ],
  REDDIT: [
    { value: 'educational', label: 'Informative', icon: '📚' },
    { value: 'casual', label: 'Casual', icon: '😊' },
    { value: 'humorous', label: 'Witty', icon: '😄' },
    { value: 'professional', label: 'Professional', icon: '👔' },
  ],
  BLOG: [
    { value: 'professional', label: 'Professional', icon: '👔' },
    { value: 'educational', label: 'Educational', icon: '📚' },
    { value: 'casual', label: 'Conversational', icon: '😊' },
    { value: 'storytelling', label: 'Storytelling', icon: '📖' },
    { value: 'inspiring', label: 'Inspiring', icon: '✨' },
  ],
}

export default function ContentOptimizerPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('YOUTUBE')
  const [contentType, setContentType] = useState<ContentType>('CAPTION')
  const [goal, setGoal] = useState<Goal>('sales')
  const [tone, setTone] = useState<Tone>('casual')
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>(['en'])
  const [targetAudience, setTargetAudience] = useState('')
  const [keywords, setKeywords] = useState('')
  const [brandProfileId, setBrandProfileId] = useState('')
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkCount, setBulkCount] = useState(3)
  const [videoDuration, setVideoDuration] = useState<string>('5-10')
  const [keyPoints, setKeyPoints] = useState('')

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [savedChats, setSavedChats] = useState<SavedChat[]>([])
  const [showSavedChats, setShowSavedChats] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chatTitle, setChatTitle] = useState('')

  const [selectedVariant, setSelectedVariant] = useState<string>('A')
  const [showSettings, setShowSettings] = useState(false)
  const [selectedBulkSet, setSelectedBulkSet] = useState<number>(1)
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const firstType = platformContentTypes[selectedPlatform]?.[0]
    if (firstType) setContentType(firstType.value)
    const firstGoal = platformGoals[selectedPlatform]?.[0]
    if (firstGoal) setGoal(firstGoal.value)
    const firstTone = platformTones[selectedPlatform]?.[0]
    if (firstTone) setTone(firstTone.value as Tone)
  }, [selectedPlatform])

  useEffect(() => {
    const saved = localStorage.getItem('content-optimizer-chats')
    if (saved) {
      try {
        setSavedChats(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load saved chats:', e)
      }
    }
  }, [])

  useEffect(() => {
    if (savedChats.length > 0) {
      localStorage.setItem('content-optimizer-chats', JSON.stringify(savedChats))
    }
  }, [savedChats])

  useEffect(() => {
    // Only set welcome message if completely empty (no messages at all)
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [selectedPlatform])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading || selectedLanguages.length === 0) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage + (keyPoints ? `\n\nKey Points: ${keyPoints}` : ''),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setKeyPoints('')
    setLoading(true)

    // Create assistant messages for each language
    const languageNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      ta: 'Tamil',
      te: 'Telugu',
      kn: 'Kannada',
      ml: 'Malayalam',
      mr: 'Marathi',
      gu: 'Gujarati',
      bn: 'Bengali',
      pa: 'Punjabi',
    }

    // Generate content for all selected languages
    const resultsByLanguage: Record<string, any> = {}

    for (const lang of selectedLanguages) {
      try {
        const response = await fetch('/api/ai/content-optimizer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: goal === 'sales' ? 'ad_copy_generation' : 'content_optimization',
            platforms: [selectedPlatform],
            contentType,
            content: keyPoints ? `${inputMessage}\n\nKey Points:\n${keyPoints}` : inputMessage,
            goal,
            language: lang,
            tone,
            targetAudience,
            keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
            brandProfileId: brandProfileId || undefined,
            bulkMode,
            bulkCount: bulkMode ? bulkCount : 1,
            videoDuration: (selectedPlatform === 'YOUTUBE' || selectedPlatform === 'INSTAGRAM') && contentType === 'SCRIPT' ? videoDuration : undefined,
          }),
        })

        const data = await response.json()

        if (data.success && data.results) {
          resultsByLanguage[lang] = {
            languageName: languageNames[lang],
            results: data.results,
          }
        }
      } catch (error) {
        console.error(`Error generating content for ${lang}:`, error)
      }
    }

    setLoading(false)

    // Add results for each language as separate messages
    const languageFlags: Record<string, string> = {
      en: '🇺🇸',
      hi: '🇮🇳',
      ta: '🇮🇳',
      te: '🇮🇳',
      kn: '🇮🇳',
      ml: '🇮🇳',
      mr: '🇮🇳',
      gu: '🇮🇳',
      bn: '🇮🇳',
      pa: '🇮🇳',
    }

    const assistantMessages: ChatMessage[] = Object.entries(resultsByLanguage).map(([lang, data], index) => {
      const results = data.results
      let responseText = `## ${languageFlags[lang]} ${data.languageName}\n\n`
      responseText += `**Overall Score:** ${results.overallScore || 85}/100\n\n`

      if (results.results && results.results.length > 0) {
        const result = results.results[0]
        responseText += `**Engagement Score:** ${result.scores.engagement}/100\n`
        responseText += `**SEO Score:** ${result.scores.seo}/100\n\n`

        if (result.content.title) {
          responseText += `### Title\n${result.content.title}\n\n`
        }
        if (result.content.hook) {
          responseText += `### 🔥 Hook\n${result.content.hook}\n\n`
        }
        if (result.content.caption || result.content.description) {
          responseText += `### Content\n${result.content.caption || result.content.description}\n\n`
        }
        if (result.content.cta) {
          responseText += `### Call to Action\n${result.content.cta}\n\n`
        }
        if (result.content.hashtags && result.content.hashtags.length > 0) {
          responseText += `### Hashtags\n${result.content.hashtags.join(' ')}\n\n`
        }
      }

      responseText += `\n---\n\n**Recommendations:**\n`
      results.recommendations?.forEach((rec: string) => {
        responseText += `• ${rec}\n`
      })

      return {
        id: (Date.now() + 1 + index).toString(),
        role: 'assistant' as const,
        content: responseText,
        timestamp: new Date(),
        config: {
          platform: selectedPlatform,
          contentType,
          goal,
          tone,
          language: lang as Language,
        },
        results: results,
      }
    })

    setMessages((prev) => [...prev, ...assistantMessages])

    // Save chat to localStorage
    const newChat: SavedChat = {
      id: currentChatId || Date.now().toString(),
      title: inputMessage.slice(0, 50) + (inputMessage.length > 50 ? '...' : ''),
      timestamp: new Date(Date.now()),
      config: {
        platform: selectedPlatform,
        contentType,
        goal,
        tone,
        languages: selectedLanguages,
      },
      messages: [
        ...messages,
        userMessage,
        ...assistantMessages,
      ],
    }

    const updatedChats = currentChatId
      ? savedChats.map(c => c.id === currentChatId ? newChat : c)
      : [...savedChats, newChat]

    setSavedChats(updatedChats)
    localStorage.setItem('content-optimizer-chats', JSON.stringify(updatedChats))
    if (!currentChatId) setCurrentChatId(newChat.id)
  }

  const saveChat = () => {
    if (messages.length <= 1) return
    const title = chatTitle || `Chat - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    const savedChat: SavedChat = {
      id: currentChatId || Date.now().toString(),
      title,
      timestamp: new Date(),
      messages: [...messages],
    }
    setSavedChats((prev) => {
      const filtered = prev.filter(c => c.id !== savedChat.id)
      return [savedChat, ...filtered]
    })
    setCurrentChatId(savedChat.id)
    setChatTitle('')
  }

  const loadChat = (chatId: string) => {
    const chat = savedChats.find(c => c.id === chatId)
    if (chat) {
      setMessages(chat.messages)
      setCurrentChatId(chatId)
      setShowSavedChats(false)
    }
  }

  const deleteChat = (chatId: string) => {
    setSavedChats(prev => prev.filter(c => c.id !== chatId))
  }

  const startNewChat = () => {
    setMessages([])
    setCurrentChatId(null)
    setChatTitle('')
    setExpandedResults(new Set())
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const toggleExpand = (messageId: string) => {
    setExpandedResults((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const currentPlatformData = messages
    .flatMap(m => m.results?.bulkResults ? m.results.bulkResults[selectedBulkSet - 1]?.results || [] : m.results?.results || [])
    .find(r => r.platform === selectedPlatform)

  const currentVariant =
    currentPlatformData?.content.variants?.find(v => v.type === selectedVariant) ||
    currentPlatformData?.content.variants?.[0]

  const PlatformIconComponent = platformIcons[selectedPlatform]
  const platformColor = platforms.find(p => p.id === selectedPlatform)?.color || '#F59E0B'

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Saved Chats Sidebar */}
      {showSavedChats && (
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 text-sm">Saved Chats</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {savedChats.map((chat) => (
              <div
                key={chat.id}
                className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer group"
                onClick={() => loadChat(chat.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{chat.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(chat.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteChat(chat.id)
                    }}
                    className="p-1 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {savedChats.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-2">📜</div>
                <p className="text-sm">No saved chats</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header - Only show when there are messages */}
        {messages.some(m => m.content !== '') && (
          <div className="bg-white border-b border-gray-200 shrink-0">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                  <span className="text-base">✨</span>
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">Create Content</h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {messages.length > 1 && (
                  <>
                    <input
                      type="text"
                      value={chatTitle}
                      onChange={(e) => setChatTitle(e.target.value)}
                      placeholder="Chat name..."
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 w-32"
                    />
                    <button
                      onClick={saveChat}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                      title="Save chat"
                    >
                      💾
                    </button>
                  </>
                )}
                <button
                  onClick={startNewChat}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                  title="New chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area - Only show when there are messages */}
        {messages.some(m => m.content !== '') && (
          <div className="flex-1 overflow-y-auto">
            <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
              {messages.filter(m => m.content !== '').map((message) => (
              <div
                key={message.id}
                className={`mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                      <span className="text-base">✨</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">Create Content</span>
                      {message.config && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <PlatformIconComponent className="w-3.5 h-3.5" />
                          <span className="text-xs text-gray-500">
                            {platformGoals[message.config?.platform]?.find(g => g.value === message.config?.goal)?.label}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div
                  className={`${
                    message.role === 'user'
                      ? 'bg-gray-900 text-white rounded-2xl rounded-br-md shadow-md'
                      : 'bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-md border border-gray-100'
                  } px-6 py-5 max-w-full`}
                >
                  {message.isStreaming ? (
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-200" />
                      </div>
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  ) : (
                    <div
                      className="prose prose-sm max-w-none whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: message.content
                          .replace(/^### (.*$)/gim, '<h4 class="font-semibold text-gray-900 mt-3 mb-2">$1</h4>')
                          .replace(/^## (.*$)/gim, '<h3 class="font-bold text-gray-900 mt-4 mb-2">$1</h3>')
                          .replace(/^# (.*$)/gim, '<h2 class="text-lg font-bold text-gray-900 mt-4 mb-2">$1</h2>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
                          .replace(/\n/g, '<br>'),
                      }}
                    />
                  )}
                </div>

                {/* Results Actions */}
                {message.results && !message.isStreaming && (
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => toggleExpand(message.id)}
                      className="text-sm font-medium px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors shadow-sm"
                    >
                      {expandedResults.has(message.id) ? '▼ Hide Details' : '▶ Show Details'}
                    </button>
                    <button
                      onClick={() => {
                        const content = currentPlatformData?.content
                        if (content) {
                          const fullContent = [
                            content.title,
                            content.hook,
                            content.caption || content.description,
                            content.cta,
                            content.hashtags?.join(' '),
                          ].filter(Boolean).join('\n\n')
                          copyToClipboard(fullContent)
                        }
                      }}
                      className="text-sm font-medium px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors shadow-sm"
                    >
                      📋 Copy All
                    </button>
                  </div>
                )}

                {/* Expanded Results */}
                {expandedResults.has(message.id) && currentPlatformData && (
                  <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Scores Header */}
                    <div className="grid grid-cols-3 divide-x divide-gray-100">
                      <div className="p-4 text-center bg-gradient-to-br from-amber-50 to-orange-50">
                        <div className="text-2xl font-bold text-amber-600">{currentPlatformData.scores.engagement}</div>
                        <div className="text-xs text-gray-600 font-medium">Engagement</div>
                      </div>
                      <div className="p-4 text-center bg-gradient-to-br from-green-50 to-emerald-50">
                        <div className="text-2xl font-bold text-green-600">{currentPlatformData.scores.seo}</div>
                        <div className="text-xs text-gray-600 font-medium">SEO</div>
                      </div>
                      <div className="p-4 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
                        <div className="text-2xl font-bold text-blue-600">{currentPlatformData.scores.overall}</div>
                        <div className="text-xs text-gray-600 font-medium">Overall</div>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Variants */}
                      {currentPlatformData.content.variants && currentPlatformData.content.variants.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">A/B Test Variants</div>
                          <div className="flex gap-2 flex-wrap">
                            {currentPlatformData.content.variants.map((variant) => (
                              <button
                                key={variant.type}
                                onClick={() => setSelectedVariant(variant.type)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                  selectedVariant === variant.type
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                Variant {variant.type}
                              </button>
                            ))}
                            <button
                              onClick={() => setSelectedVariant('original')}
                              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                selectedVariant === 'original'
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Original
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Content Sections */}
                      {(currentVariant?.title || currentPlatformData.content.title) && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900">Title</span>
                            <button
                              onClick={() => copyToClipboard(currentVariant?.title || currentPlatformData.content.title || '')}
                              className="text-xs font-medium text-amber-600 hover:text-amber-700"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl text-sm">{currentVariant?.title || currentPlatformData.content.title}</div>
                        </div>
                      )}

                      {currentPlatformData.content.hook && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900">🔥 Hook</span>
                            <button
                              onClick={() => copyToClipboard(currentPlatformData.content.hook || '')}
                              className="text-xs font-medium text-amber-600 hover:text-amber-700"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl text-sm border-l-4 border-amber-500">
                            {currentPlatformData.content.hook}
                          </div>
                        </div>
                      )}

                      {(currentVariant?.description || currentPlatformData.content.caption || currentPlatformData.content.description) && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900">Content</span>
                            <button
                              onClick={() => copyToClipboard(currentVariant?.description || currentPlatformData.content.caption || currentPlatformData.content.description || '')}
                              className="text-xs font-medium text-amber-600 hover:text-amber-700"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl text-sm whitespace-pre-wrap">{currentVariant?.description || currentPlatformData.content.caption || currentPlatformData.content.description}</div>
                        </div>
                      )}

                      {currentPlatformData.content.cta && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900">Call to Action</span>
                            <button
                              onClick={() => copyToClipboard(currentPlatformData.content.cta || '')}
                              className="text-xs font-medium text-amber-600 hover:text-amber-700"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-xl text-sm border-l-4 border-blue-500">
                            {currentPlatformData.content.cta}
                          </div>
                        </div>
                      )}

                      {currentPlatformData.content.hashtags.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-gray-900">Hashtags</span>
                            <button
                              onClick={() => copyToClipboard(currentPlatformData.content.hashtags.join(' '))}
                              className="text-xs font-medium text-amber-600 hover:text-amber-700"
                            >
                              Copy All
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {currentPlatformData.content.hashtags.map((tag, index) => (
                              <button
                                key={index}
                                onClick={() => copyToClipboard(tag)}
                                className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        )}

        {/* Input Area */}
        <div className={`${messages.some(m => m.content !== '') ? 'shrink-0 pb-6' : 'flex-1 flex items-center justify-center'}`}>
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className={`${messages.some(m => m.content !== '') ? 'max-w-3xl mx-auto' : 'max-w-2xl mx-auto'}`}>
              {/* Suggestion Chips - Only show when no messages */}
              {!messages.some(m => m.content !== '') && (
                <div className="mb-6 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setInputMessage('Create a viral post about AI productivity')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                >
                  AI productivity tips
                </button>
                <button
                  onClick={() => setInputMessage('Write an engaging product launch announcement')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                >
                  Product launch
                </button>
                <button
                  onClick={() => setInputMessage('Generate a motivational morning post')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                >
                  Daily motivation
                </button>
                <button
                  onClick={() => setInputMessage('Create an educational thread about web development')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                >
                  Tech tutorial
                </button>
              </div>
              )}

              {/* Main Input Container */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Additional Input Field (for key points when needed) */}
                {contentType === 'SCRIPT' && (
                  <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                    <input
                      type="text"
                      value={keyPoints}
                      onChange={(e) => setKeyPoints(e.target.value)}
                      placeholder="Key points to cover (optional)..."
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-700 placeholder-gray-400"
                    />
                  </div>
                )}

                {/* Main Input Area */}
                <div className="flex items-end gap-3 px-4 py-4">
                  <div className="flex-1">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      placeholder="Describe what you want to create..."
                      rows={1}
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-400 resize-none"
                      style={{ minHeight: '24px', maxHeight: '200px' }}
                    />
                  </div>

                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || loading || selectedLanguages.length === 0}
                    className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                      !inputMessage.trim() || loading || selectedLanguages.length === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md'
                    }`}
                  >
                    {loading ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Footer Info */}
                <div className="px-4 pb-3 flex items-center justify-between text-xs text-gray-400">
                  <span>Press Enter to send, Shift + Enter for new line</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowSavedChats(!showSavedChats)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors ${
                        showSavedChats ? 'bg-amber-50 text-amber-600' : 'hover:bg-gray-100 text-gray-500'
                      }`}
                      title="Saved chats"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <span>Saved</span>
                    </button>
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors ${
                        showSettings ? 'bg-amber-50 text-amber-600' : 'hover:bg-gray-100 text-gray-500'
                      }`}
                      title="Settings"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Settings</span>
                    </button>
                    <span>{selectedLanguages.length} language{selectedLanguages.length > 1 ? 's' : ''} selected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel - Sliding Sidebar */}
      <SlidingSidebar
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        position="right"
        width="420px"
        showBackdrop={true}
      >
        <div className="p-8 space-y-6 pt-16">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Settings</h2>
            <p className="text-sm text-gray-500">Configure your content generation</p>
          </div>

          {/* Platform & Content Type - Combined */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
            <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Content Setup
            </label>

            {/* Platform */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Platform</label>
              <div className="grid grid-cols-3 gap-2">
                {platforms.map((platform) => {
                  const IconComponent = platformIcons[platform.id]
                  return (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`p-3 rounded-xl flex flex-col items-center transition-all duration-200 ${
                        selectedPlatform === platform.id
                          ? 'bg-white ring-2 ring-amber-500 shadow-md scale-105'
                          : 'bg-white hover:bg-gray-50 hover:scale-102'
                      }`}
                      title={platform.name}
                    >
                      <IconComponent className="w-6 h-6" />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content Type - Compact */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Content Type</label>
              <div className="grid grid-cols-2 gap-2">
                {platformContentTypes[selectedPlatform]?.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setContentType(type.value)
                      if (type.value === 'SCRIPT') {
                        setVideoDuration('5-10')
                      }
                    }}
                    className={`px-3 py-3 rounded-xl text-sm font-medium text-left transition-all duration-200 ${
                      contentType === type.value
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-base">{type.emoji}</span> {type.label}
                  </button>
                ))}
              </div>

              {/* Video Duration Dropdown */}
              {(selectedPlatform === 'YOUTUBE' || selectedPlatform === 'INSTAGRAM') && contentType === 'SCRIPT' && (
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {selectedPlatform === 'YOUTUBE' ? 'Video Duration' : 'Reel Duration'}
                  </label>
                  <select
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm bg-white font-medium"
                  >
                    {selectedPlatform === 'YOUTUBE' ? (
                      <>
                        <option value="shorts">YouTube Short (under 60 sec)</option>
                        <option value="1-3">Short Video (1-3 minutes)</option>
                        <option value="5-10">Medium Video (5-10 minutes)</option>
                        <option value="10-20">Long Video (10-20 minutes)</option>
                        <option value="20+">Deep Dive (20+ minutes)</option>
                      </>
                    ) : (
                      <>
                        <option value="shorts">Instagram Reel (15-30 sec)</option>
                        <option value="1-3">Long Reel (1-3 minutes)</option>
                      </>
                    )}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Goal & Tone */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
            <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Style & Purpose
            </label>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as Goal)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm bg-white appearance-none cursor-pointer font-medium"
                >
                  {platformGoals[selectedPlatform]?.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.icon} {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm bg-white appearance-none cursor-pointer font-medium"
                >
                  {platformTones[selectedPlatform]?.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Language & Brand Profile */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
            <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Preferences
            </label>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Languages ({selectedLanguages.length} selected)
                </label>
                <div className="border border-gray-200 rounded-xl p-3 max-h-40 overflow-y-auto bg-white">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'en', label: 'English', flag: '🇺🇸' },
                      { value: 'hi', label: 'Hindi', flag: '🇮🇳' },
                      { value: 'ta', label: 'Tamil', flag: '🇮🇳' },
                      { value: 'te', label: 'Telugu', flag: '🇮🇳' },
                      { value: 'kn', label: 'Kannada', flag: '🇮🇳' },
                      { value: 'ml', label: 'Malayalam', flag: '🇮🇳' },
                      { value: 'mr', label: 'Marathi', flag: '🇮🇳' },
                      { value: 'gu', label: 'Gujarati', flag: '🇮🇳' },
                      { value: 'bn', label: 'Bengali', flag: '🇮🇳' },
                      { value: 'pa', label: 'Punjabi', flag: '🇮🇳' },
                    ].map((lang) => (
                      <label
                        key={lang.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm font-medium ${
                          selectedLanguages.includes(lang.value as Language)
                            ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(lang.value as Language)}
                          onChange={(e) => {
                            if (e.target.checked) {
                            setSelectedLanguages([...selectedLanguages, lang.value as Language])
                            } else {
                            setSelectedLanguages(selectedLanguages.filter(l => l !== lang.value as Language))
                            }
                          }}
                          className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                        />
                        <span>{lang.flag} {lang.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {selectedLanguages.length === 0 && (
                  <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Please select at least one language
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Profile</label>
                <BrandProfileSelector
                  value={brandProfileId}
                  onChange={setBrandProfileId}
                />
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-5 border border-gray-200">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Advanced Options
            </label>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Tech professionals 25-35"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Keywords (SEO)</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="productivity, remote work, AI"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Bulk Generation</label>
                  <p className="text-xs text-gray-500">Generate multiple variations</p>
                </div>
                <button
                  onClick={() => setBulkMode(!bulkMode)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    bulkMode ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                      bulkMode ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {bulkMode && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Variations</label>
                  <input
                    type="number"
                    value={bulkCount}
                    onChange={(e) => setBulkCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={10}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={() => setShowSettings(false)}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/30 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            Apply Settings
          </button>
        </div>
      </SlidingSidebar>
    </div>
  )
}
