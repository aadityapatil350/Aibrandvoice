import Hero from '@/components/landing/Hero'
import Platforms from '@/components/landing/Platforms'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Stats from '@/components/landing/Stats'
import Pricing from '@/components/landing/Pricing'
import FAQ from '@/components/landing/FAQ'
import CTA from '@/components/landing/CTA'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Platforms />
      <Features />
      <HowItWorks />
      <Stats />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  )
}
