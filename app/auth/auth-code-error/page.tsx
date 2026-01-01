import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-claude-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-claude-bg-secondary border border-claude-border rounded-2xl p-8 shadow-lg text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          {/* Header */}
          <h1 className="text-2xl font-bold text-claude-text mb-2">
            Authentication Failed
          </h1>
          <p className="text-claude-text-secondary mb-6">
            We couldn&apos;t sign you in. This might be due to an expired link or a connection issue.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="block w-full px-4 py-3 bg-claude-accent text-white rounded-lg hover:bg-claude-accent-hover transition-colors font-medium"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="block w-full px-4 py-3 bg-white border border-claude-border rounded-lg hover:bg-claude-bg-secondary transition-colors font-medium text-claude-text"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
