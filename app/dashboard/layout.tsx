import Sidebar from '@/components/dashboard/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-claude-bg">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
