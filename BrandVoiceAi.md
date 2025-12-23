Project Plan & Product Specification: BrandVoice AI
A Comprehensive Blueprint for a Personalized AI Content Generation & Scheduling Platform
Version: 1.0
Date: August 11, 2025
1. Executive Summaary
BrandVoice AI is a one-person-build micro-SaaS that learns a personal brand’s unique voice from the user’s own content, then instantly generates, edits, schedules, and analyzes multi-channel posts. It's designed so busy creators, coaches, and small business owners can publish high-quality, on-brand copy in minutes and generate revenue from day one.
The core competitive advantage is its deep, vector-based voice personalization and a continuous feedback loop, which ensures the AI's output becomes more aligned with the user's style over time—a significant leap beyond the generic "tone" sliders of existing tools.
Core Project Goals
Goal
Why it Matters
How We Measure Success
Give busy personal‑brand owners the ability to publish on‑brand content in minutes.
They spend hours each week writing, editing, and reshaping the same idea for multiple platforms.
Average time-to-publish ↓ (≤ 5 min per post).
Make the AI sound like them, not a generic robot.
A brand’s voice is its biggest differentiator. Generic AI copy erodes trust.
Brand‑voice similarity score (user‑rated ≥ 4/5) and repeat‑use rate > 70%.
Create a self‑sustaining micro‑SaaS that can start earning from day 1.
Solo developers need early cash flow to cover infrastructure and keep iterating.
$1k+ MRR within the first 2‑3 months (free‑tier → paid‑upgrade conversion ≥ 5%).
Keep the product simple enough for a one-person team to build and iterate.
Scope creep kills indie projects.
Feature count at launch ≤ 12 (core MVP) and dev‑hours ≤ 800 for the first version.

2. The Opportunity: Problem & Solution
The Problem
Content creation for personal brands is a time-consuming, repetitive, and often frustrating process. Creators struggle with:
Time Sink: Spending hours every week drafting and polishing content.
Inconsistent Voice: Maintaining a consistent brand tone across different platforms (LinkedIn, Instagram, Newsletters, etc.).
Creative Block: Starting from a blank page for every new post.
Manual Workflow: Juggling multiple tools for writing, scheduling, and analyzing performance.
Our Solution: BrandVoice AI
BrandVoice AI is a unified platform that solves these problems by providing an intelligent, personalized content co-pilot.
Competitive Differentiators
Feature
Generic Competitors (Jasper, Copy.ai)
BrandVoice AI's Advantage
Voice Personalization
Generic tone sliders (e.g., "Formal," "Casual").
Vector-based voice model built from the user's own past writing and refined with every piece of feedback.
Content Generation
Often focused on a single channel or format.
Multi-channel generator that intelligently reformats one core idea for a LinkedIn post, an Instagram carousel, a tweet thread, and a newsletter.
Workflow
Manual copy-paste from the generator to a separate scheduler.
Integrated scheduler with OAuth posting to LinkedIn, Twitter, and Instagram. No need to leave the app.
Analytics
No performance tracking or actionable insights.
Built-in performance tracker with AI-driven suggestions (e.g., "Best posting time," "Top hashtags").

3. Target Audience: User Personas
Persona
Primary Pain
Desired Outcome
How BrandVoice AI Solves It
1️⃣ Solopreneur Coach – “Fit-Coach Sarah”
3-hour weekly content grind; inconsistent tone.
Quick daily Instagram/Twitter posts that sound like her motivational voice.
Uploads a few past captions → AI learns “high‑energy + emojis,” generates a carousel in < 30 sec, and schedules a 3‑day batch.
2️⃣ Boutique Retail Owner – “Mia”
Needs professional LinkedIn & email copy but lacks a copywriter.
Polished product-launch announcements that read like a seasoned marketer.
Uploads past newsletters → AI produces a LinkedIn announcement + email draft, ready to be exported as DOCX or scheduled directly.
3️⃣ Thought-Leader / Academic – “Dr. Alex”
Writes long research summaries; wants bite-size social posts.
Turn a paper abstract into a 5-tweet thread & a newsletter in minutes.
Feeds an abstract → AI generates threaded tweets + a newsletter with citations and offers SEO‑friendly keywords.

4. Product Specification & Design Blueprint
4.1 High-Level User Flow
flowchart TD
    A[Landing / Signup] --> B[Onboarding (Brand Profile)]
    B --> C[Dashboard (Home)]
    C --> D[Content Request Modal]
    D --> E[AI Generation + Editor]
    E -->|Save Draft| F[My Drafts Library]
    E -->|Publish / Schedule| G[Scheduler / Export]
    G --> H[Analytics Dashboard]
    H --> I[Feedback Loop (Thumbs‑up / Down, Comments)]
    I --> B %% Personalization Loop


4.2 Minimum Viable Product (MVP) Core Features
Onboarding Wizard: Captures brand description, audience, tone, and voice samples (PDF/DOCX/URL) to build the core personalization vector.
Content Request Modal: A structured form to turn a user's brief (channel, goal, message, keywords) into a high-quality prompt for the AI.
AI Generation & Inline Editor: A rich-text editor pre-populated with the AI draft, featuring one-click AI suggestions for rewrites and refinements.
Scheduler & Export: A drag-and-drop calendar for scheduling posts via connected accounts (OAuth) or exporting content as DOCX/PDF/TXT files.
Feedback Loop: Simple 👍 / 👎 buttons on every draft to continuously fine-tune the user's personal voice model.
Billing & Tiers: A free tier to drive adoption and usage-based paid plans (Stripe integration) to ensure early revenue.
Out of Scope for MVP: Full-blown AI summarization, multilingual support, on-premise processing.
4.3 Screen-by-Screen Wireframe Descriptions
This section details the layout, key components, and user actions for each screen in the application.
<details>
<summary><strong>Click to expand detailed wireframes for all 8 screens...</strong></summary>
2.1 Landing / Signup (Public)
Layout: Hero Section → Features Strip → Social Proof → Footer.
Hero: Headline ("AI-Powered Personal-Brand Content in Seconds"), sub-headline, primary CTA "Start Free," secondary link "Watch Demo."
Interaction: CTA opens a signup modal (Email/Password + Google OAuth). "Watch Demo" opens a YouTube embed.
2.2 Onboarding – Brand Profile (Wizard, 4 steps)
Layout: Full-screen modal with a progress bar.
Step 1 (Brand Overview): Brand name, short description, industry dropdown.
Step 2 (Audience & Tone): Target audience tags, tone selector tiles, key values.
Step 3 (Voice Samples): Drag-and-drop file upload (PDF, DOCX) or URL paste area.
Step 4 (Settings & Finish): Language, default content length, privacy toggle. Finish button creates the Brand Profile in the database.
2.3 Dashboard (Home)
Layout: Sticky Header → CTA Row → Quick Stats → Recent Drafts → Upcoming Schedule.
Components: Search bar, Avatar dropdown, "Create New Content" button, stat cards, horizontally scrolling draft cards, and a mini-calendar widget.
2.4 Content Request Modal (Overlay)
Layout: Centered modal with "Quick" & "Advanced" tabs.
Fields: Content Type (icons), Goal (dropdown), Platform (chips), Core Message (textarea), Keywords (tags), Length (slider), Tone Override (toggle).
Action: "Generate" button assembles the full prompt and calls the AI.
2.5 Editor Screen (Full-Page)
Layout: Sticky Header → Main Editor (70% width) → Side Panel (30% width).
Main Editor: Rich-text area (e.g., TipTap) with the AI draft and inline suggestions.
Side Panel: Tabs for alternative suggestions, keyword analysis, and a view of the brand persona.
Bottom Bar: 👍 / 👎 feedback buttons and a "Regenerate" dropdown.
2.6 Scheduler & Export
Layout: Calendar View (60%, drag-and-drop) and Post Settings Pane (40%).
Settings: Platform selection, time picker, caption field, UTM builder, optional image upload.
Actions: "Save to Queue" and "Export" (PDF, DOCX, TXT).
2.7 Analytics Dashboard
Layout: Metric Cards → Post-Performance Table → Trend Chart → Insights Panel.
Visuals: Key metrics (Impressions, Engagement), a sortable table of posts, a line chart, and an AI-generated list of actionable insights.
2.8 Feedback Loop (Embedded)
Mechanism: 👍 / 👎 buttons are saved with draft IDs. This data is aggregated nightly to fine-tune a custom prompt prefix for the user, continuously improving personalization.
</details>
4.4 Reusable Component Library & Design System
A consistent design system will accelerate development and ensure a cohesive user experience.
Core Components: BtnPrimary, BtnGhost, InputText, TagSelect, SegmentedControl, Card, Modal, Badge, CalendarGrid, AnalyticsChart.
Design Checklist:
Color Palette: Primary: #0066FF, Accent: #FF6600, Dark Mode BG: #1A1A1A.
Typography: Headers: Inter Bold, Body: Inter Regular.
Spacing: 8-pixel base grid system.
Iconography: Feather icons (or similar).
Accessibility: WCAG AA contrast, ARIA labels, keyboard navigation.
5. Go-to-Market & Business Strategy
5.1 Monetization & Pricing Model
Tier
Monthly Price
Key Features
Free
$0
10 generations/month, export only, no scheduling.
Starter
$19
100 generations/month, 3 scheduled posts/week, basic analytics.
Pro
$49
Unlimited generations, full calendar scheduling, multi-platform OAuth posting, advanced analytics + AI insights.

Revenue Goal: Achieve $3.5k+ MRR within 6 months by converting free users and upselling starters. Usage-based overages will push high-volume users to the Pro plan.
5.2 Go-to-Market (GTM) Playbook
Validate: Launch a landing page with a "Get early access" form. Run $100-$200 in targeted ads to gauge interest.
Beta Launch: Invite the first 30-50 sign-ups for a free beta in exchange for feedback and testimonials.
Community Launch: Post in niche communities (Reddit, Discord, LinkedIn Groups) relevant to our personas.
Content Marketing: Use the tool to create our own marketing content, showcasing its power.
Iterate: Use feedback from beta users to prioritize the public launch feature set.
5.3 Key Performance Indicators (KPIs)
Metric
Target (First 3 Months)
Paid Conversion Rate
≥ 5%
Monthly Active Users (MAU)
30% of total sign-ups
User-Rated Voice Alignment
≥ 4.0 / 5.0
Monthly Churn (Paid)
≤ 5%
MRR
$3k - $5k by Month 4

6. Technical Implementation Plan
6.1 Proposed Tech Stack
Layer
Technology
Reasoning
Frontend
Next.js (React) + TailwindCSS
Fast, great developer experience, easy to deploy on Vercel.
Backend & DB
Supabase
All-in-one solution with auth, storage, and a PostgreSQL DB with the pgvector extension for voice modeling.
AI Models
OpenAI (GPT-4o, Embeddings)
High-quality generation, simple API, pay-as-you-go.
Serverless Functions
Vercel/Supabase Edge Functions
For handling prompt assembly, API calls, and webhooks.
Payments
Stripe
Industry standard for subscription and metered billing.

6.2 Development Roadmap (10 Sprints, ~4-5 months)
Sprint 0 – Foundations: Set up repo, CI/CD, Supabase auth, and DB schema.
Sprint 1 – Onboarding: Build the 4-step wizard and voice sample vectorization.
Sprint 2 – Dashboard: Build the home screen, draft list, and stat cards.
Sprint 3 – Generation Core: Build the content request modal and OpenAI integration.
Sprint 4 – Editor: Implement the rich-text editor and inline AI suggestions.
Sprint 5 – Scheduler & Export: Build the calendar UI and export functionality.
Sprint 6 – Analytics: Implement the basic analytics dashboard.
Sprint 7 – Feedback & Personalization: Build the feedback mechanism and the fine-tuning logic.
Sprint 8 – Polish & Beta Prep: UI refinements, dark mode, accessibility audit.
Sprint 9 – Billing & Launch: Integrate Stripe and open the doors for paid plans.
7. Immediate Next Steps
Define UVP: Finalize a 2-sentence tagline and 3 core benefits.
Build Validation Page: Create a simple landing page using Webflow/Vercel to collect emails.
Run Ad Test: Launch a small ad campaign on Meta/LinkedIn targeting the primary personas.
Conduct Interviews: Schedule 15-minute calls with interested users to validate pain points.
Scaffold MVP: Set up the Next.js + Supabase starter repository.




Got it — you want a full logical file & folder structure for the BrandVoice AI MVP, using Next.js + Prisma + Supabase, hosted on Vercel, with no code — just a map of every file that will logically exist to implement the BRD you gave me.
I’ll break this into:
High-level app structure (folders)


Pages & routes (Next.js app dir style)


Components (UI & feature-specific)


Lib & utils (AI, DB, analytics, etc.)


Database (Prisma schema)


API routes


Misc / config files



1. High-Level Directory Structure
ruby
CopyEdit
brandvoice-ai/
│
├── app/                     # Next.js app directory (routes)
├── components/              # UI & feature components
├── lib/                      # Reusable backend logic (AI, auth, analytics)
├── prisma/                   # Prisma schema & migrations
├── public/                   # Static assets
├── styles/                   # Global styles
├── utils/                    # Small helper utilities
├── types/                    # TS/JS type definitions
├── .env                      # Environment variables
├── next.config.js            # Next.js config
├── package.json
└── README.md


2. Pages & Routes (app/)
bash
CopyEdit
app/
│
├── (public)/
│   ├── page.tsx                          # Landing Page
│   ├── signup/
│   │   └── page.tsx                      # Signup / OAuth
│   ├── login/
│   │   └── page.tsx                      # Login
│   ├── demo/
│   │   └── page.tsx                      # Watch demo / explainer
│
├── (protected)/
│   ├── dashboard/
│   │   └── page.tsx                      # Dashboard home
│   ├── onboarding/
│   │   ├── step1-brand-overview.tsx
│   │   ├── step2-audience-tone.tsx
│   │   ├── step3-voice-samples.tsx
│   │   ├── step4-settings.tsx
│   │   └── layout.tsx                    # Wizard layout
│   ├── drafts/
│   │   ├── page.tsx                      # Draft library
│   │   └── [id]/page.tsx                  # Draft detail
│   ├── generate/
│   │   └── page.tsx                      # Content Request Modal page
│   ├── editor/
│   │   └── [id]/page.tsx                  # Rich text editor
│   ├── scheduler/
│   │   └── page.tsx                      # Calendar view
│   ├── analytics/
│   │   └── page.tsx                      # Analytics dashboard
│   ├── settings/
│   │   └── page.tsx                      # User settings / billing
│
├── api/
│   ├── auth/
│   │   ├── callback/route.ts             # OAuth callbacks
│   │   └── logout/route.ts               # Logout endpoint
│   ├── ai/
│   │   ├── generate/route.ts             # AI content generation
│   │   ├── refine/route.ts               # AI rewrites
│   │   └── voice-train/route.ts          # Train vector model
│   ├── drafts/
│   │   ├── create/route.ts
│   │   ├── update/route.ts
│   │   ├── delete/route.ts
│   │   └── list/route.ts
│   ├── scheduler/
│   │   ├── create/route.ts
│   │   ├── delete/route.ts
│   │   └── list/route.ts
│   ├── analytics/
│   │   ├── performance/route.ts
│   │   └── insights/route.ts
│   ├── feedback/
│   │   └── submit/route.ts
│   ├── billing/
│   │   ├── create-checkout-session/route.ts
│   │   ├── webhook/route.ts
│   │   └── subscription-status/route.ts
│   └── upload/
│       └── voice-sample/route.ts


3. Components/
UI Library
mathematica
CopyEdit
components/ui/
├── Button.tsx
├── Input.tsx
├── Select.tsx
├── TagSelect.tsx
├── Modal.tsx
├── Card.tsx
├── Calendar.tsx
├── Badge.tsx
├── Tabs.tsx
├── Tooltip.tsx
├── Chart.tsx

Feature Components
bash
CopyEdit
components/landing/
├── Hero.tsx
├── FeaturesStrip.tsx
├── SocialProof.tsx
├── Footer.tsx

components/onboarding/
├── ProgressBar.tsx
├── FileUploader.tsx
├── ToneSelector.tsx
├── AudienceTags.tsx

components/dashboard/
├── StatCard.tsx
├── DraftCard.tsx
├── MiniCalendar.tsx

components/generation/
├── ContentRequestForm.tsx
├── KeywordTags.tsx

components/editor/
├── RichTextEditor.tsx
├── SuggestionsPanel.tsx
├── PersonaView.tsx
├── FeedbackButtons.tsx

components/scheduler/
├── CalendarGrid.tsx
├── TimePicker.tsx
├── PlatformSelector.tsx

components/analytics/
├── MetricCard.tsx
├── PostPerformanceTable.tsx
├── TrendChart.tsx
├── InsightsList.tsx


4. lib/ (backend helpers & integrations)
bash
CopyEdit
lib/
├── supabaseClient.ts               # Supabase init
├── prisma.ts                        # Prisma client
├── auth.ts                          # Auth helpers (Supabase + NextAuth if needed)
├── ai/
│   ├── openaiClient.ts              # OpenAI API init
│   ├── promptAssembler.ts           # Turns form input into final prompt
│   ├── voiceVector.ts               # Vectorization logic with pgvector
│   └── refinement.ts                # Rewriting logic
├── analytics/
│   ├── performance.ts               # Query performance data
│   └── insights.ts                  # Generate AI insights
├── billing/
│   ├── stripeClient.ts              # Stripe init
│   ├── createCheckoutSession.ts
│   ├── handleWebhook.ts
│   └── getSubscriptionStatus.ts


5. prisma/
graphql
CopyEdit
prisma/
├── schema.prisma                    # DB schema for Supabase/PostgreSQL
├── migrations/                      # Auto-generated migrations

Tables (models)
User


BrandProfile


VoiceSample


Draft


ScheduledPost


PlatformAccount


Analytics


Feedback


Subscription



6. utils/
CopyEdit
utils/
├── formatDate.ts
├── slugify.ts
├── platformIcons.ts
├── contentLengthCalc.ts
├── generateUTM.ts


7. Misc Config
lua
CopyEdit
.env.example
next.config.js
postcss.config.js
tailwind.config.js
tsconfig.json


If you want, I can next map each file to the exact BRD feature it implements so you can see why it exists in the structure — that would make it crystal clear that no file is wasted.
Do you want me to make that mapping?
You said:
now i want you to list each logics for each feature how it should be implemented how ai should be used to build each featuree which models to use to get users best outcome
ChatGPT said:
Alright — I’ll break the BrandVoice AI MVP into each feature from your BRD, and for each feature I’ll explain:
Core Logic – how it works in the system.


AI Involvement – how we use AI to implement it.


Best Model Choice – which AI model(s) to use for the best result (accuracy, cost, and speed).


Notes for Optimization – tricks to make it better over time.



Feature-by-Feature Logic Plan
1. Onboarding Wizard: Brand Profile + Voice Training
Core Logic
Capture brand description, audience tags, tone preferences, and writing samples (upload PDF/DOCX, paste URLs, or raw text).


Store metadata in BrandProfile table.


Extract text from uploaded files (PDF parsing, HTML scraping).


Embed the text into vector embeddings using pgvector in Supabase.


Average embeddings to get User Voice Vector and store it.


AI Involvement
Use text-embedding-3-large to generate embeddings for each voice sample.


Store embeddings in VoiceSample table with user_id.


Optionally run a summary model to extract stylistic descriptors (“uses short sentences, high energy, motivational tone”).


Best Models
Embeddings: text-embedding-3-large (OpenAI) → high accuracy for style capture.


Optional style extraction: gpt-4o-mini for quick style analysis.


Optimization
Allow incremental training: every new content + feedback updates the vector.


Keep at least 3–5 samples per user to stabilize style representation.



2. Content Request Modal → AI Generation
Core Logic
User fills: platform(s), goal, core message, keywords, length, tone override.


Backend assembles prompt that combines:


User’s Brand Voice Vector context


Style descriptors from onboarding


User’s request parameters


AI generates multi-channel variants in one request.


AI Involvement
Few-shot prompting using brand voice examples (retrieve top 3 most similar past posts via vector search).


Ask AI to output JSON with each platform variant (LinkedIn, Instagram, Twitter, Newsletter).


Best Models
Generation: gpt-4o for quality-first (Pro users).


Generation: gpt-4o-mini for speed/cost (Free/Starter).


Optimization
Cache most similar examples per user to avoid repeated vector searches.


Post-process with a formatting function to add hashtags, emojis, etc., per platform norms.



3. Rich Text Editor + Inline AI Suggestions
Core Logic
Inline editing with suggestions panel (rephrase, shorten, expand, change tone).


When user selects text, send selected text + brand profile context to AI.


AI Involvement
Use gpt-4o-mini for instant edits.


For tone changes, inject tone instructions into the prompt.


Best Models
Fast edits: gpt-4o-mini or Anthropic Claude Haiku for low-latency edits.


Optimization
Keep session-wide brand context in system prompt for all edits.


Offer 2–3 alternative rewrites per request.



4. Scheduler & Export
Core Logic
Drag-and-drop posts onto a calendar.


Connect to platforms via OAuth (LinkedIn, Twitter/X, Instagram Graph API).


Save scheduled posts to ScheduledPost table.


AI Involvement
Suggest best posting times based on historical engagement.


Suggest hashtags or CTA wording before scheduling.


Best Models
Posting time prediction: In-house rule-based ML from analytics (no LLM).


Hashtag suggestion: gpt-4o-mini with recent top hashtags from platform-specific scraping.


Optimization
Learn per-user posting windows from analytics over time.



5. Analytics Dashboard + AI Insights
Core Logic
Fetch post metrics from each platform API (impressions, likes, clicks, shares).


Store in Analytics table.


Aggregate and show trends.


AI Involvement
Use gpt-4o-mini to generate plain-English insights:


“Posts with 2 emojis and < 120 characters had 23% higher engagement.”


Suggest adjustments (“Try adding a personal anecdote to LinkedIn posts”).


Best Models
Insight generation: gpt-4o-mini (fast).


Optimization
Train rules to auto-spot statistically significant changes (e.g., if engagement drops 20%).



6. Feedback Loop: Personalization Refinement
Core Logic
Every draft gets 👍/👎.


👍 = store as “approved” and add to voice training set.


👎 = mark for exclusion and store with “reason” (optional user comment).


Nightly job re-generates brand style prompt prefix and re-centers Voice Vector.


AI Involvement
Use embedding re-averaging to shift style vector.


Use AI to interpret feedback (“too formal” → adjust tone weight).


Best Models
Embedding update: text-embedding-3-large.


Feedback interpretation: gpt-4o-mini.


Optimization
Weight recent feedback higher for faster adaptation.



7. Billing & Tiers
Core Logic
Stripe subscriptions for Free / Starter / Pro.


Check subscription before allowing generation beyond quota.


AI Involvement
None directly (pure infra).


Optional: AI upsell prompts (“You’ve reached your limit — Pro gives unlimited generations”).



8. Multi-Channel Formatting
Core Logic
Same idea → multiple platform outputs (e.g., LinkedIn long form, Twitter thread, Instagram carousel captions).


Format rules applied post-generation to ensure platform compliance (char limits, hashtags).


AI Involvement
Single generation request with platform formatting rules in system prompt.


Best Models
gpt-4o for generating all variants in one JSON output.



9. Voice Model Retrieval
Core Logic
On every generation, do a vector similarity search in Supabase pgvector for the most similar past approved posts.


Use those as few-shot examples in the prompt.


AI Involvement
Embeddings search for style match: text-embedding-3-large.


Best Models
Embeddings model for retrieval.


GPT model for combining examples into system prompt.



10. File Upload & Text Extraction
Core Logic
Accept PDF, DOCX, or text.


Extract text with pdf-parse or docx parser.


Clean/normalize text for embedding.


AI Involvement
None for parsing, but LLM can summarize extracted text for metadata.



If you want, I can now map each of these logic flows to the exact file in the project structure we built earlier, so you can see exactly where every piece of AI logic will live in your codebase.
 That would turn your spec into a dev-ready AI architecture doc.
Do you want me to make that mapping?
You said:
Yes please go ahead
ChatGPT said:
Perfect — I’ll now map every AI logic flow we just discussed to the exact file(s) in the project structure we built earlier.
 This will give you a dev-ready AI architecture map so you know where each piece of logic lives.

AI Logic → File Mapping for BrandVoice AI

1. Onboarding Wizard & Voice Training
Logic: Capture brand profile + audience + tone + voice samples → extract text → embed → store vector.
 Files:
bash
CopyEdit
app/(protected)/onboarding/step1-brand-overview.tsx     # UI
app/(protected)/onboarding/step2-audience-tone.tsx      # UI
app/(protected)/onboarding/step3-voice-samples.tsx      # File upload UI
app/(protected)/onboarding/step4-settings.tsx           # UI

api/upload/voice-sample/route.ts                        # File upload API
lib/ai/voiceVector.ts                                   # Embedding creation + vector averaging
lib/ai/openaiClient.ts                                  # OpenAI init
prisma/schema.prisma                                    # VoiceSample, BrandProfile models


2. Content Request Modal → AI Generation
Logic: User fills request → assemble brand context + vector matches → generate multi-channel content.
 Files:
bash
CopyEdit
app/(protected)/generate/page.tsx                       # Content request form UI
components/generation/ContentRequestForm.tsx            # Form component
api/ai/generate/route.ts                                # AI generation endpoint
lib/ai/promptAssembler.ts                               # Build prompt from form input + brand profile
lib/ai/openaiClient.ts                                  # Call GPT model
lib/ai/voiceVector.ts                                   # Retrieve similar posts from pgvector


3. Rich Text Editor + Inline AI Suggestions
Logic: Editor with rewrite/expand/shorten → AI suggestions in real-time.
 Files:
bash
CopyEdit
app/(protected)/editor/[id]/page.tsx                    # Editor screen UI
components/editor/RichTextEditor.tsx                    # Text editing
components/editor/SuggestionsPanel.tsx                  # Suggestions sidebar
api/ai/refine/route.ts                                  # AI rewrite API
lib/ai/refinement.ts                                    # Prompt logic for edits


4. Scheduler & Export
Logic: Schedule posts via OAuth → suggest best posting times → export formats.
 Files:AC
bash
CopyEdit
app/(protected)/scheduler/page.tsx                      # Calendar UI
components/scheduler/CalendarGrid.tsx                   # Drag-and-drop calendar
components/scheduler/PlatformSelector.tsx               # Select social account
api/scheduler/create/route.ts                           # Save scheduled post
api/scheduler/list/route.ts                             # List scheduled posts
lib/analytics/performance.ts                            # Fetch past performance for best-time suggestion
lib/ai/promptAssembler.ts                                # Optional CTA/hashtag AI generation


5. Analytics Dashboard + AI Insights
Logic: Fetch engagement metrics → generate plain-English insights.
 Files:
bash
CopyEdit
app/(protected)/analytics/page.tsx                      # Analytics UI
components/analytics/MetricCard.tsx                     # Metric display
components/analytics/TrendChart.tsx                     # Chart visualization
components/analytics/InsightsList.tsx                   # Insights display
api/analytics/performance/route.ts                      # Fetch raw analytics
api/analytics/insights/route.ts                         # AI insight generation
lib/analytics/performance.ts                            # Platform API integration
lib/analytics/insights.ts                               # AI-generated recommendations


6. Feedback Loop & Personalization
Logic: 👍/👎 feedback updates vector & style prompt.
 Files:
bash
CopyEdit
components/editor/FeedbackButtons.tsx                   # UI for feedback
api/feedback/submit/route.ts                            # Store feedback
lib/ai/voiceVector.ts                                   # Update embeddings
lib/ai/promptAssembler.ts                               # Adjust prompt prefix from feedback
prisma/schema.prisma                                    # Feedback model


7. Billing & Tiers
Logic: Stripe integration → limit generation by tier.
 Files:
bash
CopyEdit
app/(protected)/settings/page.tsx                       # Billing UI
api/billing/create-checkout-session/route.ts            # Stripe checkout
api/billing/webhook/route.ts                            # Handle subscription events
api/billing/subscription-status/route.ts                # Check plan for limits
lib/billing/stripeClient.ts                             # Stripe SDK init
lib/billing/getSubscriptionStatus.ts                    # Plan checker


8. Multi-Channel Formatting
Logic: Generate LinkedIn, Twitter, Instagram versions in one pass.
 Files:
bash
CopyEdit
lib/ai/promptAssembler.ts                               # Include multi-platform rules
api/ai/generate/route.ts                                # Request all variants in JSON


9. Voice Model Retrieval
Logic: Vector search in Supabase pgvector for most similar approved posts.
 Files:
bash
CopyEdit
lib/ai/voiceVector.ts                                   # Embedding search logic
api/ai/generate/route.ts                                # Uses retrieved examples in prompt


10. File Upload & Text Extraction
Logic: Extract text from PDF/DOCX → embed → store.
 Files:
bash
CopyEdit
api/upload/voice-sample/route.ts                        # File upload handler
lib/ai/voiceVector.ts                                   # Embedding storage
utils/fileParser.ts                                     # PDF/DOCX text extraction


Model Usage Summary by Feature
Feature
Model
Purpose
Voice Training
text-embedding-3-large
Create style vector
Content Generation
gpt-4o / gpt-4o-mini
Multi-platform copy
Inline Suggestions
gpt-4o-mini
Quick edits
Insights
gpt-4o-mini
Analytics explanation
Feedback Refinement
text-embedding-3-large + gpt-4o-mini
Update style vector
Hashtags/CTAs
gpt-4o-mini
Social optimization

 
