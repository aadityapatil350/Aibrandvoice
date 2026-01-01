import { getCurrentUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  // Fetch user stats
  const brandProfilesCount = await prisma.brandProfile.count({
    where: { userId: user.id },
  })
  const contentOptimizationsCount = await prisma.contentOptimization.count({
    where: { userId: user.id },
  })
  const savedGenerationsCount = await prisma.savedGeneration.count({
    where: { userId: user.id },
  })

  const quickStats = [
    { label: 'Brand Profiles', value: brandProfilesCount.toString(), icon: '🎨' },
    { label: 'Content Generated', value: contentOptimizationsCount.toString(), icon: '✨' },
    { label: 'Saved Templates', value: savedGenerationsCount.toString(), icon: '📁' },
    { label: 'Platforms Available', value: '8', icon: '🔗' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-claude-text mb-2">
          Welcome back, {user.fullName || user.email}!
        </h1>
        <p className="text-claude-text-secondary">Here's your content overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-claude-border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
              <span className="text-3xl font-bold text-claude-text">{stat.value}</span>
            </div>
            <p className="text-sm text-claude-text-secondary">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-claude-border p-6">
          <h2 className="text-xl font-bold text-claude-text mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/dashboard/brand-profiles"
              className="block p-4 rounded-lg border border-claude-border hover:border-claude-accent hover:bg-claude-bg transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <h3 className="font-semibold text-claude-text">Create Brand Profile</h3>
                  <p className="text-sm text-claude-text-secondary">Train AI with your brand voice</p>
                </div>
              </div>
            </a>
            <a
              href="/dashboard/youtube/script"
              className="block p-4 rounded-lg border border-claude-border hover:border-claude-accent hover:bg-claude-bg transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📺</span>
                <div>
                  <h3 className="font-semibold text-claude-text">Generate YouTube Script</h3>
                  <p className="text-sm text-claude-text-secondary">Create engaging video scripts</p>
                </div>
              </div>
            </a>
            <a
              href="/dashboard/instagram/caption"
              className="block p-4 rounded-lg border border-claude-border hover:border-claude-accent hover:bg-claude-bg transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📸</span>
                <div>
                  <h3 className="font-semibold text-claude-text">Generate Instagram Caption</h3>
                  <p className="text-sm text-claude-text-secondary">Create viral-worthy captions</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-claude-border p-6">
          <h2 className="text-xl font-bold text-claude-text mb-4">Recent Activity</h2>
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-claude-text-secondary">No activity yet</p>
            <p className="text-sm text-claude-text-tertiary mt-1">
              Start creating content to see your activity here
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
