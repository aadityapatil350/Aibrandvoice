import Link from 'next/link'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import EmailPasswordLogin from '@/components/auth/EmailPasswordLogin'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-claude-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-claude-bg-secondary border border-claude-border rounded-2xl p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-claude-text mb-2">
              Welcome back
            </h1>
            <p className="text-claude-text-secondary">
              Sign in to your BrandVoice account
            </p>
          </div>

          {/* Email/Password Login */}
          <div className="space-y-4">
            <EmailPasswordLogin />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-claude-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-claude-bg-secondary text-claude-text-tertiary">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <GoogleSignInButton />
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-claude-text-secondary">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/signup"
              className="text-claude-accent hover:text-claude-accent-hover font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-claude-text-tertiary">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-claude-text-secondary">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-claude-text-secondary">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
