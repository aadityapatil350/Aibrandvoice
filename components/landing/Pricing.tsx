export default function Pricing() {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out BrandVoice AI',
      features: [
        '5 script/caption generations/month',
        '100 subtitle minutes/month',
        '1 hashtag set/month',
        'Single platform posting',
        'View-only analytics',
        'Community support'
      ],
      cta: 'Start Free',
      href: '/auth/signup',
      popular: false
    },
    {
      name: 'Pro',
      price: '$99',
      priceInr: '₹4,999',
      period: 'per month',
      description: 'For solo creators & influencers',
      features: [
        'Unlimited script/caption generation',
        'Unlimited subtitles',
        'Unlimited hashtag generation',
        'Bulk scheduling (100 posts/month)',
        'Multi-platform scheduling (5 platforms)',
        'Brand voice customization',
        'Team collaboration (2 members)',
        'Full analytics dashboard',
        'Priority support'
      ],
      cta: 'Start Free Trial',
      href: '/auth/signup?plan=pro',
      popular: true
    },
    {
      name: 'Team',
      price: '$499',
      priceInr: '₹19,999',
      period: 'per month',
      description: 'For agencies & content teams',
      features: [
        'Everything in Pro',
        'Team collaboration (10+ members)',
        'Advanced analytics + ROI tracking',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Priority support',
        'Custom training sessions'
      ],
      cta: 'Contact Sales',
      href: '/contact',
      popular: false
    }
  ]

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-claude-text mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-claude-text-secondary max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border-2 p-8 ${
                tier.popular
                  ? 'border-claude-accent shadow-xl scale-105'
                  : 'border-claude-border'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-claude-accent text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-claude-text mb-2">{tier.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-claude-text">{tier.price}</span>
                  {tier.priceInr && (
                    <span className="text-lg text-claude-text-secondary ml-2">
                      / {tier.priceInr}
                    </span>
                  )}
                </div>
                <p className="text-claude-text-tertiary text-sm">{tier.period}</p>
                <p className="text-claude-text-secondary mt-3">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-claude-text-secondary text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={tier.href}
                className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                  tier.popular
                    ? 'bg-claude-accent hover:bg-claude-accent-hover text-white'
                    : 'bg-claude-bg-secondary hover:bg-claude-bg-tertiary text-claude-text border border-claude-border'
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
