const { createClient } = require('@supabase/supabase-js')

// Load from .env manually
const fs = require('fs')
const envFile = fs.readFileSync('.env', 'utf8')
const envVars = {}
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    let value = match[2].trim()
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    envVars[key] = value
  }
})

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testAuth() {
  console.log('🔍 Testing Supabase connection...\n')
  console.log('URL:', envVars.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Key:', envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...\n')

  // Test 1: Try to sign up
  console.log('📝 Test 1: Attempting to create a test user...')
  const testEmail = 'testuser@gmail.com' // Using gmail.com instead
  const testPassword = 'password123'

  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  })

  if (signupError) {
    console.error('❌ Signup Error:', signupError.message)
    console.error('Error details:', signupError)
  } else {
    console.log('✅ Signup successful!')
    console.log('User ID:', signupData.user?.id)
    console.log('Email:', signupData.user?.email)
    console.log('Session:', signupData.session ? 'Created' : 'Not created (email confirmation may be required)')
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Test 2: Try to sign in
  console.log('🔑 Test 2: Attempting to sign in...')
  const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })

  if (signinError) {
    console.error('❌ Signin Error:', signinError.message)
    console.error('Error details:', signinError)
  } else {
    console.log('✅ Signin successful!')
    console.log('User ID:', signinData.user?.id)
    console.log('Email:', signinData.user?.email)
    console.log('Session created:', !!signinData.session)
  }
}

testAuth().catch(console.error)
