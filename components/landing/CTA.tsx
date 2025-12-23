export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-claude-accent to-claude-accent-hover">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to 10x Your Content Output?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of creators saving 5+ hours every week with AI-powered content generation
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/auth/signup"
            className="px-8 py-4 bg-white hover:bg-claude-bg-secondary text-claude-accent rounded-lg font-semibold text-lg transition-colors shadow-lg"
          >
            Start Free Trial
          </a>
          <a
            href="#pricing"
            className="px-8 py-4 bg-transparent hover:bg-white/10 text-white rounded-lg font-semibold text-lg transition-colors border-2 border-white"
          >
            View Pricing
          </a>
        </div>
        <p className="text-white/80 text-sm mt-6">
          No credit card required • 5 generations free forever • Cancel anytime
        </p>
      </div>
    </section>
  )
}
