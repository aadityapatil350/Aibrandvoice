'use client'

import { useState } from 'react'
import BrandProfileSelector from '@/components/tools/BrandProfileSelector'

type Platform = 'youtube-long' | 'youtube-shorts' | 'instagram-reels' | 'tiktok' | 'twitter' | 'linkedin'
type Tone = 'professional' | 'casual' | 'humorous' | 'educational' | 'inspiring' | 'conversational'
type GenerationMode = 'single' | 'bulk'
type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'hi' | 'ar' | 'zh' | 'ja' | 'ko' | 'ru'

interface GeneratedScript {
  id: string
  platform: Platform
  topic: string
  script: string
  duration: string
  timestamp: Date
}

export default function ScriptGeneratorPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'clone'>('generate')

  // Generate tab state
  const [mode, setMode] = useState<GenerationMode>('single')
  const [platform, setPlatform] = useState<Platform>('youtube-long')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState<Tone>('professional')
  const [language, setLanguage] = useState<Language>('en')
  const [duration, setDuration] = useState('5')
  const [targetAudience, setTargetAudience] = useState('')
  const [keywords, setKeywords] = useState('')
  const [includeHook, setIncludeHook] = useState(true)
  const [includeCTA, setIncludeCTA] = useState(true)
  const [bulkCount, setBulkCount] = useState('3')
  const [bulkVariations, setBulkVariations] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [currentScript, setCurrentScript] = useState('')
  const [editableScript, setEditableScript] = useState('')
  const [scriptHistory, setScriptHistory] = useState<GeneratedScript[]>([])
  const [selectedBrandProfile, setSelectedBrandProfile] = useState('')

  // Tone Clone tab state
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [manualTranscript, setManualTranscript] = useState('')
  const [useManualInput, setUseManualInput] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [originalTranscript, setOriginalTranscript] = useState('')
  const [toneAnalysis, setToneAnalysis] = useState('')
  const [clonedVariations, setClonedVariations] = useState<string[]>([])
  const [variationCount, setVariationCount] = useState('3')
  const [generatingVariations, setGeneratingVariations] = useState(false)
  const [selectedVariation, setSelectedVariation] = useState('')

  const platforms = [
    { id: 'youtube-long', name: 'YouTube Long-form (5-20 min)', icon: '📺' },
    { id: 'youtube-shorts', name: 'YouTube Shorts (15-60 sec)', icon: '📱' },
    { id: 'instagram-reels', name: 'Instagram Reels (15-90 sec)', icon: '📸' },
    { id: 'tiktok', name: 'TikTok (15-60 sec)', icon: '🎵' },
    { id: 'twitter', name: 'Twitter/X Thread', icon: '🐦' },
    { id: 'linkedin', name: 'LinkedIn Video (1-3 min)', icon: '💼' },
  ]

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'humorous', label: 'Humorous' },
    { value: 'educational', label: 'Educational' },
    { value: 'inspiring', label: 'Inspiring' },
    { value: 'conversational', label: 'Conversational' },
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

  const handleGenerate = async () => {
    setGenerating(true)

    try {
      const response = await fetch('/api/ai/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          platform,
          topic,
          tone,
          language,
          duration,
          targetAudience,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          includeHook,
          includeCTA,
          bulkCount: mode === 'bulk' ? parseInt(bulkCount) : 1,
          bulkVariations,
          brandProfile: selectedBrandProfile,
        }),
      })

      const data = await response.json()

      if (data.scripts && data.scripts.length > 0) {
        const firstScript = data.scripts[0].content
        setCurrentScript(firstScript)
        setEditableScript(firstScript)

        const newScripts: GeneratedScript[] = data.scripts.map((script: any, index: number) => ({
          id: Date.now() + index + '',
          platform,
          topic,
          script: script.content,
          duration: script.duration || duration,
          timestamp: new Date(),
        }))
        setScriptHistory([...newScripts, ...scriptHistory])
      }
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setGenerating(false)
    }
  }

  const exportScript = (format: 'txt' | 'docx' | 'pdf') => {
    const content = editableScript || currentScript

    if (format === 'txt') {
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `script-${Date.now()}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      alert(`${format.toUpperCase()} export coming soon!`)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editableScript || currentScript)
    alert('Copied to clipboard!')
  }

  const handleTranscribe = async () => {
    if (useManualInput) {
      // Use manual transcript
      if (!manualTranscript.trim()) {
        alert('Please paste the transcript text')
        return
      }

      setTranscribing(true)
      try {
        // Analyze tone using the manual transcript
        const response = await fetch('/api/ai/analyze-tone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: manualTranscript }),
        })

        const data = await response.json()

        if (data.success) {
          setOriginalTranscript(manualTranscript)
          setToneAnalysis(data.toneAnalysis)
        } else {
          alert(data.error || 'Analysis failed')
        }
      } catch (error) {
        console.error('Analysis failed:', error)
        alert('Failed to analyze tone')
      } finally {
        setTranscribing(false)
      }
    } else {
      // Use YouTube URL
      setTranscribing(true)
      try {
        const response = await fetch('/api/ai/transcribe-youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ youtubeUrl }),
        })

        const data = await response.json()

        if (data.success) {
          setOriginalTranscript(data.transcript)
          setToneAnalysis(data.toneAnalysis)
        } else {
          alert(data.error || 'Transcription failed. Try using Manual Input instead.')
        }
      } catch (error) {
        console.error('Transcription failed:', error)
        alert('Failed to transcribe video. Try using Manual Input instead.')
      } finally {
        setTranscribing(false)
      }
    }
  }

  const handleGenerateVariations = async () => {
    setGeneratingVariations(true)
    try {
      const response = await fetch('/api/ai/clone-tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalTranscript,
          toneAnalysis,
          variationCount: parseInt(variationCount),
        }),
      })

      const data = await response.json()

      if (data.success && data.variations) {
        setClonedVariations(data.variations)
        if (data.variations.length > 0) {
          setSelectedVariation(data.variations[0])
        }
      } else {
        alert(data.error || 'Variation generation failed')
      }
    } catch (error) {
      console.error('Variation generation failed:', error)
      alert('Failed to generate variations')
    } finally {
      setGeneratingVariations(false)
    }
  }

  const exportTranscript = (format: 'txt' | 'docx' | 'pdf') => {
    const content = originalTranscript

    if (format === 'txt') {
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transcript-${Date.now()}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      alert(`${format.toUpperCase()} export coming soon!`)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-claude-text mb-2">Script Generator</h1>
        <p className="text-claude-text-secondary">
          Generate professional video scripts or clone tone from existing videos
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-claude-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'generate'
                ? 'text-claude-accent border-b-2 border-claude-accent'
                : 'text-claude-text-secondary hover:text-claude-text'
            }`}
          >
            📝 Generate Script
          </button>
          <button
            onClick={() => setActiveTab('clone')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'clone'
                ? 'text-claude-accent border-b-2 border-claude-accent'
                : 'text-claude-text-secondary hover:text-claude-text'
            }`}
          >
            🎭 Tone Clone
          </button>
        </div>
      </div>

      {/* Generate Script Tab */}
      {activeTab === 'generate' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Side - Compact Script Options */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-claude-border p-6">
              <h3 className="font-semibold text-claude-text mb-4">Script Details</h3>

            <div className="space-y-3">
              {/* Generation Mode - Compact */}
              <div>
                <label className="block text-sm font-semibold text-claude-text mb-2">
                  Mode
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('single')}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                      mode === 'single'
                        ? 'border-claude-accent bg-claude-accent text-white'
                        : 'border-claude-border hover:border-claude-accent'
                    }`}
                  >
                    Single
                  </button>
                  <button
                    onClick={() => setMode('bulk')}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                      mode === 'bulk'
                        ? 'border-claude-accent bg-claude-accent text-white'
                        : 'border-claude-border hover:border-claude-accent'
                    }`}
                  >
                    Bulk
                  </button>
                </div>
              </div>

              {/* Platform Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-claude-text mb-2">
                  Platform *
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as Platform)}
                  className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm"
                >
                  {platforms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.icon} {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-semibold text-claude-text mb-2">
                  Topic / Main Idea *
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={2}
                  placeholder="e.g., 5 productivity hacks for remote workers"
                  className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm"
                />
              </div>

              {/* Tone & Language - Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-claude-text mb-2">
                    Tone & Style
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as Tone)}
                    className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm"
                  >
                    {tones.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
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
                    className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm"
                  >
                    {languages.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration & Target Audience - Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                {!['twitter'].includes(platform) && (
                  <div>
                    <label className="block text-sm font-semibold text-claude-text mb-2">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      min="0.5"
                      step="0.5"
                      className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm"
                    />
                  </div>
                )}
                <div className={!['twitter'].includes(platform) ? '' : 'col-span-2'}>
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
              </div>

              {/* Keywords & Brand Voice - Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-claude-text mb-2">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="productivity, work"
                    className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-claude-text mb-2">
                    Brand Voice
                  </label>
                  <BrandProfileSelector
                    value={selectedBrandProfile}
                    onChange={setSelectedBrandProfile}
                  />
                </div>
              </div>

              {/* Hook & CTA Checkboxes - Side by Side */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeHook}
                    onChange={(e) => setIncludeHook(e.target.checked)}
                    className="rounded border-claude-border"
                  />
                  <span className="text-sm text-claude-text">Include Hook</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCTA}
                    onChange={(e) => setIncludeCTA(e.target.checked)}
                    className="rounded border-claude-border"
                  />
                  <span className="text-sm text-claude-text">Include CTA</span>
                </label>
              </div>

              {/* Bulk Options - Compact */}
              {mode === 'bulk' && (
                <div className="border-t border-claude-border pt-3 mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-claude-text mb-2">
                        Scripts Count
                      </label>
                      <input
                        type="number"
                        value={bulkCount}
                        onChange={(e) => setBulkCount(e.target.value)}
                        min="2"
                        max="10"
                        className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer pb-2">
                        <input
                          type="checkbox"
                          checked={bulkVariations}
                          onChange={(e) => setBulkVariations(e.target.checked)}
                          className="rounded border-claude-border"
                        />
                        <span className="text-sm text-claude-text">Variations</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!topic || generating}
                className="w-full px-6 py-3 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Generating...
                  </span>
                ) : (
                  <span>Generate {mode === 'bulk' ? `${bulkCount} Scripts` : 'Script'}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Generated Script */}
        <div className="space-y-4">
          {currentScript ? (
            <>
              {/* Current Script Editor */}
              <div className="bg-white rounded-lg border border-claude-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-claude-text">Generated Script</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-1.5 text-sm border border-claude-border rounded-lg hover:bg-claude-bg-secondary transition-colors"
                      title="Copy to clipboard"
                    >
                      📋 Copy
                    </button>
                    <div className="relative group">
                      <button className="px-3 py-1.5 text-sm border border-claude-border rounded-lg hover:bg-claude-bg-secondary transition-colors">
                        💾 Export
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-white border border-claude-border rounded-lg shadow-lg p-2 hidden group-hover:block z-10 min-w-[140px]">
                        <button
                          onClick={() => exportScript('txt')}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-claude-bg-secondary rounded"
                        >
                          Export as TXT
                        </button>
                        <button
                          onClick={() => exportScript('docx')}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-claude-bg-secondary rounded"
                        >
                          Export as DOCX
                        </button>
                        <button
                          onClick={() => exportScript('pdf')}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-claude-bg-secondary rounded"
                        >
                          Export as PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <textarea
                  value={editableScript}
                  onChange={(e) => setEditableScript(e.target.value)}
                  rows={24}
                  className="w-full px-4 py-3 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent font-mono text-sm resize-none"
                  placeholder="Your generated script will appear here..."
                />

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setEditableScript(currentScript)}
                    className="px-4 py-2 text-sm border border-claude-border rounded-lg hover:bg-claude-bg-secondary transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => {
                      setCurrentScript(editableScript)
                      alert('Script updated!')
                    }}
                    className="px-4 py-2 text-sm bg-claude-accent text-white rounded-lg hover:bg-claude-accent-hover transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Script History */}
              {scriptHistory.length > 1 && (
                <div className="bg-white rounded-lg border border-claude-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-claude-text text-sm">
                      History ({scriptHistory.length})
                    </h3>
                    <button
                      onClick={() => {
                        setScriptHistory([])
                        setCurrentScript('')
                        setEditableScript('')
                      }}
                      className="text-xs text-claude-text-secondary hover:text-claude-text"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {scriptHistory.map((script) => (
                      <button
                        key={script.id}
                        onClick={() => {
                          setCurrentScript(script.script)
                          setEditableScript(script.script)
                        }}
                        className="w-full text-left p-2 border border-claude-border rounded-lg hover:border-claude-accent hover:bg-claude-bg transition-all"
                      >
                        <div className="text-xs font-semibold text-claude-text truncate">
                          {script.topic}
                        </div>
                        <div className="text-xs text-claude-text-tertiary">
                          {platforms.find(p => p.id === script.platform)?.icon} {script.duration} min
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg border border-claude-border p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-claude-text mb-2">No Script Generated</h3>
              <p className="text-claude-text-secondary text-sm">
                Fill in the details and click "Generate Script"
              </p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Tone Clone Tab */}
      {activeTab === 'clone' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Side - URL Input & Controls */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-claude-border p-6">
              <h3 className="font-semibold text-claude-text mb-4">Input Method</h3>

              <div className="space-y-3">
                {/* Toggle between YouTube URL and Manual Input */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setUseManualInput(false)}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                      !useManualInput
                        ? 'border-claude-accent bg-claude-accent text-white'
                        : 'border-claude-border hover:border-claude-accent'
                    }`}
                  >
                    YouTube URL
                  </button>
                  <button
                    onClick={() => setUseManualInput(true)}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                      useManualInput
                        ? 'border-claude-accent bg-claude-accent text-white'
                        : 'border-claude-border hover:border-claude-accent'
                    }`}
                  >
                    Manual Input
                  </button>
                </div>

                {!useManualInput ? (
                  <div>
                    <label className="block text-sm font-semibold text-claude-text mb-2">
                      YouTube URL *
                    </label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm"
                    />
                    <p className="text-xs text-claude-text-secondary mt-1">
                      Note: Auto-transcription may not work for all videos. Use Manual Input if it fails.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-claude-text mb-2">
                      Paste Transcript *
                    </label>
                    <textarea
                      value={manualTranscript}
                      onChange={(e) => setManualTranscript(e.target.value)}
                      rows={8}
                      placeholder="Paste the video transcript here...&#10;&#10;Tip: On YouTube, click the 3 dots → Show transcript → Copy all text"
                      className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm font-mono"
                    />
                  </div>
                )}

                <button
                  onClick={handleTranscribe}
                  disabled={useManualInput ? !manualTranscript.trim() : !youtubeUrl || transcribing}
                  className="w-full px-6 py-3 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {transcribing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      {useManualInput ? 'Analyzing...' : 'Transcribing...'}
                    </span>
                  ) : (
                    useManualInput ? '🔍 Analyze Tone' : '🎤 Transcribe & Analyze'
                  )}
                </button>
              </div>
            </div>

            {/* Tone Analysis */}
            {toneAnalysis && (
              <div className="bg-white rounded-lg border border-claude-border p-6">
                <h3 className="font-semibold text-claude-text mb-3">Tone Analysis</h3>
                <div className="text-sm text-claude-text-secondary bg-claude-bg-secondary p-4 rounded-lg">
                  {toneAnalysis}
                </div>
              </div>
            )}

            {/* Variation Controls */}
            {originalTranscript && (
              <div className="bg-white rounded-lg border border-claude-border p-6">
                <h3 className="font-semibold text-claude-text mb-4">Generate Variations</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-claude-text mb-2">
                      Number of Variations
                    </label>
                    <input
                      type="number"
                      value={variationCount}
                      onChange={(e) => setVariationCount(e.target.value)}
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent text-sm"
                    />
                  </div>

                  <button
                    onClick={handleGenerateVariations}
                    disabled={generatingVariations}
                    className="w-full px-6 py-3 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingVariations ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Generating...
                      </span>
                    ) : (
                      `🎭 Generate ${variationCount} Variations`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Transcripts & Variations */}
          <div className="space-y-4">
            {/* Original Transcript */}
            {originalTranscript && (
              <div className="bg-white rounded-lg border border-claude-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-claude-text">Original Transcript</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(originalTranscript)
                        alert('Copied to clipboard!')
                      }}
                      className="px-3 py-1.5 text-sm border border-claude-border rounded-lg hover:bg-claude-bg-secondary transition-colors"
                    >
                      📋 Copy
                    </button>
                    <div className="relative group">
                      <button className="px-3 py-1.5 text-sm border border-claude-border rounded-lg hover:bg-claude-bg-secondary transition-colors">
                        💾 Export
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-white border border-claude-border rounded-lg shadow-lg p-2 hidden group-hover:block z-10 min-w-[140px]">
                        <button
                          onClick={() => exportTranscript('txt')}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-claude-bg-secondary rounded"
                        >
                          Export as TXT
                        </button>
                        <button
                          onClick={() => exportTranscript('docx')}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-claude-bg-secondary rounded"
                        >
                          Export as DOCX
                        </button>
                        <button
                          onClick={() => exportTranscript('pdf')}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-claude-bg-secondary rounded"
                        >
                          Export as PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <textarea
                  value={originalTranscript}
                  readOnly
                  rows={12}
                  className="w-full px-4 py-3 border border-claude-border rounded-lg focus:outline-none font-mono text-sm resize-none bg-claude-bg"
                />
              </div>
            )}

            {/* Variations */}
            {clonedVariations.length > 0 && (
              <div className="bg-white rounded-lg border border-claude-border p-6">
                <h3 className="font-semibold text-claude-text mb-4">
                  Generated Variations ({clonedVariations.length})
                </h3>

                <div className="space-y-3">
                  {/* Variation Selector */}
                  <div className="flex gap-2 flex-wrap">
                    {clonedVariations.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedVariation(clonedVariations[index])}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          selectedVariation === clonedVariations[index]
                            ? 'border-claude-accent bg-claude-accent text-white'
                            : 'border-claude-border hover:border-claude-accent'
                        }`}
                      >
                        Variation {index + 1}
                      </button>
                    ))}
                  </div>

                  {/* Selected Variation Display */}
                  {selectedVariation && (
                    <>
                      <textarea
                        value={selectedVariation}
                        onChange={(e) => {
                          const newVariations = [...clonedVariations]
                          const index = clonedVariations.indexOf(selectedVariation)
                          newVariations[index] = e.target.value
                          setClonedVariations(newVariations)
                          setSelectedVariation(e.target.value)
                        }}
                        rows={12}
                        className="w-full px-4 py-3 border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-accent font-mono text-sm resize-none"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedVariation)
                            alert('Copied to clipboard!')
                          }}
                          className="px-4 py-2 text-sm border border-claude-border rounded-lg hover:bg-claude-bg-secondary transition-colors"
                        >
                          📋 Copy
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([selectedVariation], { type: 'text/plain' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `variation-${Date.now()}.txt`
                            a.click()
                            URL.revokeObjectURL(url)
                          }}
                          className="px-4 py-2 text-sm bg-claude-accent text-white rounded-lg hover:bg-claude-accent-hover transition-colors"
                        >
                          💾 Export
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!originalTranscript && (
              <div className="bg-white rounded-lg border border-claude-border p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">🎭</div>
                <h3 className="text-xl font-bold text-claude-text mb-2">No Transcript Yet</h3>
                <p className="text-claude-text-secondary text-sm">
                  Enter a YouTube URL and click "Transcribe & Analyze"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
