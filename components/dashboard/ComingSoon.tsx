export default function ComingSoon({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-claude-text mb-2">{title}</h1>
        <p className="text-claude-text-secondary">{description}</p>
      </div>

      <div className="bg-white rounded-lg border border-claude-border p-12 text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-2xl font-bold text-claude-text mb-2">Coming Soon</h3>
        <p className="text-claude-text-secondary mb-6 max-w-md mx-auto">
          We're working hard to bring you this feature. Stay tuned for updates!
        </p>
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-claude-accent-light text-claude-accent rounded-lg font-semibold">
          <span>🚀</span>
          <span>In Development</span>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-claude-border p-6">
          <div className="text-3xl mb-3">⚡</div>
          <h4 className="font-semibold text-claude-text mb-2">Fast & Efficient</h4>
          <p className="text-sm text-claude-text-secondary">
            Generate high-quality content in seconds with our AI-powered tools
          </p>
        </div>
        <div className="bg-white rounded-lg border border-claude-border p-6">
          <div className="text-3xl mb-3">🎯</div>
          <h4 className="font-semibold text-claude-text mb-2">Platform Optimized</h4>
          <p className="text-sm text-claude-text-secondary">
            Content tailored specifically for each platform's best practices
          </p>
        </div>
        <div className="bg-white rounded-lg border border-claude-border p-6">
          <div className="text-3xl mb-3">✨</div>
          <h4 className="font-semibold text-claude-text mb-2">Your Brand Voice</h4>
          <p className="text-sm text-claude-text-secondary">
            AI learns your unique style to create authentic content
          </p>
        </div>
      </div>
    </div>
  )
}
