export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-claude-bg to-claude-bg-secondary py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl lg:text-7xl font-bold text-claude-text mb-6 leading-tight">
            AI-Powered Content Creation
            <br />
            <span className="text-claude-accent">For Every Platform</span>
          </h1>
          <p className="text-xl lg:text-2xl text-claude-text-secondary mb-8 max-w-3xl mx-auto">
            Generate professional scripts, videos, captions, and thumbnails for YouTube, Instagram, TikTok, LinkedIn, and Twitter in minutes. Save 5+ hours every week.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="/auth/signup"
              className="px-8 py-4 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg font-semibold text-lg transition-colors shadow-lg"
            >
              Start Free Trial
            </a>
            <a
              href="#features"
              className="px-8 py-4 bg-white hover:bg-claude-bg-secondary text-claude-text rounded-lg font-semibold text-lg transition-colors border-2 border-claude-border"
            >
              See How It Works
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-claude-text-tertiary">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>5 generations free</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
