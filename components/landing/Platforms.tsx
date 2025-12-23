export default function Platforms() {
  const platforms = [
    { name: 'YouTube', features: '20+ Features', color: 'bg-red-100 text-red-700' },
    { name: 'Instagram', features: '22+ Features', color: 'bg-pink-100 text-pink-700' },
    { name: 'TikTok', features: '15+ Features', color: 'bg-purple-100 text-purple-700' },
    { name: 'Twitter/X', features: '10+ Features', color: 'bg-blue-100 text-blue-700' },
    { name: 'LinkedIn', features: '12+ Features', color: 'bg-indigo-100 text-indigo-700' },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-claude-text mb-4">
            One Tool. Every Platform.
          </h2>
          <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
            Create platform-optimized content for all major social networks from a single dashboard
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="border-2 border-claude-border rounded-lg p-6 text-center hover:border-claude-accent transition-all hover:shadow-md"
            >
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${platform.color}`}>
                {platform.features}
              </div>
              <h3 className="font-bold text-lg text-claude-text">{platform.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
