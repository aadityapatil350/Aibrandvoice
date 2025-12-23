export default function Features() {
  const features = [
    {
      icon: '🎬',
      title: 'AI Script Generator',
      description: 'Generate engaging scripts for YouTube long-form, Shorts, Reels, and TikTok in seconds',
      highlight: 'Save 3+ hours per video'
    },
    {
      icon: '🎨',
      title: 'Smart Thumbnails',
      description: 'Create eye-catching thumbnails optimized for maximum click-through rates',
      highlight: 'Boost CTR by 40%'
    },
    {
      icon: '📝',
      title: 'Caption & Copy',
      description: 'Platform-specific captions with hashtags, emojis, and CTAs that drive engagement',
      highlight: 'Viral-optimized'
    },
    {
      icon: '🎥',
      title: 'Text-to-Video',
      description: 'Turn scripts into professional faceless videos with AI avatars and voiceovers',
      highlight: 'No camera needed'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Track performance across all platforms with actionable insights and recommendations',
      highlight: 'Data-driven growth'
    },
    {
      icon: '🔄',
      title: 'Content Repurposing',
      description: 'Transform one piece of content into 5+ formats for different platforms',
      highlight: '10x your reach'
    },
    {
      icon: '📅',
      title: 'Smart Scheduling',
      description: 'Schedule and auto-publish to multiple platforms at optimal times',
      highlight: 'Set it & forget it'
    },
    {
      icon: '🌍',
      title: 'Multi-Language',
      description: 'Generate content in Hindi, Marathi, Tamil, Telugu, and 50+ languages',
      highlight: 'Regional support'
    },
    {
      icon: '💬',
      title: 'Auto Subtitles',
      description: 'Add accurate subtitles in multiple languages with one click',
      highlight: 'Boost accessibility'
    }
  ]

  return (
    <section id="features" className="py-20 bg-claude-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-claude-text mb-4">
            Everything You Need to Grow
          </h2>
          <p className="text-xl text-claude-text-secondary max-w-3xl mx-auto">
            80+ features designed to save you time and amplify your content reach
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 border border-claude-border hover:border-claude-accent transition-all hover:shadow-lg"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-claude-text mb-2">{feature.title}</h3>
              <p className="text-claude-text-secondary mb-3">{feature.description}</p>
              <div className="inline-block px-3 py-1 bg-claude-accent-light text-claude-accent text-sm font-semibold rounded-full">
                {feature.highlight}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
