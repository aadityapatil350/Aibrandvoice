export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Upload Your Brand Voice',
      description: 'Share your past content or describe your brand tone. Our AI learns your unique style in minutes.',
      icon: '📤'
    },
    {
      number: '2',
      title: 'Generate Content',
      description: 'Pick your platform and content type. Get scripts, captions, thumbnails, and videos instantly.',
      icon: '✨'
    },
    {
      number: '3',
      title: 'Edit & Refine',
      description: 'Use our inline editor to perfect your content. Get AI suggestions for improvements.',
      icon: '✏️'
    },
    {
      number: '4',
      title: 'Schedule & Publish',
      description: 'Schedule to multiple platforms at optimal times. Track performance and grow your audience.',
      icon: '🚀'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-claude-text mb-4">
            How It Works
          </h2>
          <p className="text-xl text-claude-text-secondary max-w-2xl mx-auto">
            From idea to published content in 4 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-claude-accent text-white text-2xl font-bold mb-4">
                  {step.number}
                </div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold text-claude-text mb-3">{step.title}</h3>
                <p className="text-claude-text-secondary">{step.description}</p>
              </div>
              {step.number !== '4' && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-claude-border transform -translate-x-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
