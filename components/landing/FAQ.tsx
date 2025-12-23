'use client'

import { useState } from 'react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: 'How does BrandVoice AI learn my brand voice?',
      answer: 'Upload your past content (blog posts, social media captions, videos) or describe your brand tone. Our AI analyzes your writing style, vocabulary, and tone to create a personalized voice model. The more content you provide, the more accurate it becomes.'
    },
    {
      question: 'Which platforms are supported?',
      answer: 'We support YouTube (long-form & Shorts), Instagram (Posts, Reels, Stories), TikTok, Twitter/X, LinkedIn, and blogs. You can generate platform-specific content and schedule directly to each platform.'
    },
    {
      question: 'Can I schedule content to multiple platforms at once?',
      answer: 'Yes! With the Pro and Team plans, you can cross-post the same content to multiple platforms simultaneously, or customize it for each platform before scheduling.'
    },
    {
      question: 'Do you support regional Indian languages?',
      answer: 'Absolutely! We support Hindi, Marathi, Tamil, Telugu, and 50+ other languages. You can generate scripts, captions, and subtitles in any supported language.'
    },
    {
      question: 'What kind of content can I generate?',
      answer: 'Scripts (YouTube, TikTok, Reels), captions, hashtags, thumbnails, blog posts, email copy, product descriptions, subtitles, and even faceless videos with AI avatars and voiceovers.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! Our Free tier gives you 5 generations per month forever, no credit card required. You can upgrade to Pro or Team anytime for unlimited generations and advanced features.'
    },
    {
      question: 'How much time will I save?',
      answer: 'Most users report saving 5-10 hours per week on content creation, editing, and scheduling. Bulk generation and cross-platform scheduling are the biggest time-savers.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, there are no long-term contracts. You can cancel your subscription anytime from your account settings.'
    }
  ]

  return (
    <section className="py-20 bg-claude-bg-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-claude-text mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-claude-text-secondary">
            Everything you need to know about BrandVoice AI
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-claude-border overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-claude-bg transition-colors"
              >
                <span className="font-semibold text-claude-text pr-8">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-claude-text-tertiary transition-transform flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-claude-text-secondary">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
