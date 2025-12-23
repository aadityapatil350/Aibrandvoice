export default function Stats() {
  const stats = [
    { value: '5+', label: 'Hours Saved Per Week' },
    { value: '80+', label: 'AI-Powered Features' },
    { value: '5', label: 'Platforms Supported' },
    { value: '50+', label: 'Languages Supported' }
  ]

  return (
    <section className="py-16 bg-claude-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-white/90 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
