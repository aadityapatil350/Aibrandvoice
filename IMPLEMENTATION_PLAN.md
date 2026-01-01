# Implementation Plan: Enhanced Channel Saving & Trending Logic

## Overview
This plan outlines improvements to:
1. **Trending Channel Algorithm** - Better logic for discovering and ranking trending channels
2. **Channel Saving with Profile Selection** - Allow users to choose which brand profile to save channels to
3. **Rich Channel Metadata Storage** - Store full channel information, not just URLs
4. **Enhanced Brand Profile Display** - Show rich channel information in brand profile details

---

## Part 1: Improve Trending Channel Algorithm

### Current Issue
- Uses generic search terms ("popular videos", "trending now", etc.)
- No filtering based on user's niche/industry
- All channels treated equally regardless of relevance

### Proposed Improvement

#### 1.1 Use Brand Profile Context (Optional but Better)
- **Change**: Pass brand profile info to channel discovery
- **How**: When user is on YouTube research page, optionally pass selected brand profile ID
- **API Enhancement**: `/api/youtube/channels` can accept `brandProfileId` query parameter
- **Logic**: Use brand profile's industry, target audience, content pillars for better search

#### 1.2 Enhanced Trending Algorithm `/api/youtube/channels/route.ts`
```
WHEN no query provided (trending mode):
  1. Use brand profile industry/niche if available
  2. Search for popular videos in these categories:
     - "[industry] tutorial" (e.g., "AI tutorial")
     - "[industry] tips and tricks"
     - "how to [audience skill]"
     - General trending (fallback)
  3. Rank channels by:
     - Engagement rate (views/subscribers ratio)
     - Upload frequency (recent activity)
     - Subscriber growth indicator (if available)
     - Content quality (title length, descriptions)
  4. Return top channels by relevance score
```

#### 1.3 Implementation Details
**File**: `app/api/youtube/channels/route.ts`

- Add new search strategy function: `generateSmartSearchQueries(brandProfile)`
- Calculate engagement score for each channel
- Add ranking/sorting by relevance not just subscriber count
- Cache results per brand profile (different key)

**Pseudo-code**:
```typescript
function generateSmartSearchQueries(profileId?: string, industry?: string): string[] {
  const baseQueries = []

  if (industry) {
    baseQueries.push(`${industry} tips`)
    baseQueries.push(`${industry} tutorial`)
    baseQueries.push(`${industry} expert`)
  }

  baseQueries.push('popular videos')
  baseQueries.push('trending content')

  return baseQueries
}

function calculateEngagementScore(channel): number {
  const avgEngagement = (channel.viewCount / channel.videoCount) / channel.subscriberCount
  // Higher engagement = more influential
  return avgEngagement
}
```

---

## Part 2: Channel Saving with Profile Selection

### Current Issue
- Auto-saves to first profile (poor UX)
- Only saves URL, not rich metadata
- User doesn't know which profile channel is saved to

### Solution

#### 2.1 Add Profile Selection Modal
**File**: `app/dashboard/youtube-research/page.tsx`

Create new state and component:
```typescript
const [showProfileSelector, setShowProfileSelector] = useState(false)
const [selectedProfileForSave, setSelectedProfileForSave] = useState<string | null>(null)
const [channelToSave, setChannelToSave] = useState<Channel | null>(null)
const [saveChannelType, setSaveChannelType] = useState<'competitor' | 'inspirational' | null>(null)
```

New component: `ProfileSelectorModal` that shows:
- List of user's brand profiles
- "Select profile..." message if none exist
- Button to "Create new profile"
- Cancel button

#### 2.2 Enhanced handleSaveChannel Function
**File**: `app/dashboard/youtube-research/page.tsx`

**Old Flow**:
```
User clicks Competitor/Inspiration
  → Auto-save to first profile
  → Show alert
```

**New Flow**:
```
User clicks Competitor/Inspiration
  → Check if user has profiles
     - No profiles: Show "Create profile first" message
     - 1 profile: Auto-select it, show confirmation
     - 2+ profiles: Show modal to choose profile
  → Store channel data + profile choice
  → Call enhanced API with rich metadata
  → Show success with profile name
```

**Code Structure**:
```typescript
const handleSaveChannel = async (channel: Channel, type: 'competitor' | 'inspirational') => {
  const profiles = await fetchBrandProfiles()

  if (profiles.length === 0) {
    alert('Please create a brand profile first!')
    return
  }

  if (profiles.length === 1) {
    // Auto-save to only profile
    await saveChannelToProfile(profiles[0].id, channel, type)
  } else {
    // Show profile selector modal
    setChannelToSave(channel)
    setSaveChannelType(type)
    setShowProfileSelector(true)
  }
}

const saveChannelToProfile = async (profileId: string, channel: Channel, type: string) => {
  const response = await fetch(`/api/brand-profiles/${profileId}/channels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Send full channel metadata
      channelData: {
        channelId: channel.channelId,
        title: channel.title,
        description: channel.description,
        thumbnailUrl: channel.thumbnailUrl,
        subscriberCount: channel.subscriberCount,
        videoCount: channel.videoCount,
        viewCount: channel.viewCount,
        url: channel.url,
      },
      type: type,
    })
  })

  // ... handle response
}
```

#### 2.3 New ProfileSelectorModal Component
**File**: `components/youtube/ProfileSelectorModal.tsx`

```typescript
interface ProfileSelectorModalProps {
  isOpen: boolean
  profiles: BrandProfile[]
  onSelect: (profileId: string) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export default function ProfileSelectorModal({
  isOpen, profiles, onSelect, onCancel, isLoading
}: ProfileSelectorModalProps) {
  // Show modal with:
  // - Title: "Select a Brand Profile to Save to"
  // - List of profiles with description snippets
  // - Select button for each
  // - Cancel button
  // - Loading state
}
```

---

## Part 3: Enhanced Channel Metadata Storage

### Current Storage
```prisma
model BrandProfile {
  competitorChannels  String[]  // Just URLs: ["https://youtube.com/...", ...]
  inspirationChannels String[]  // Just URLs: ["https://youtube.com/...", ...]
}
```

### Options

#### Option A: Keep Simple String Arrays (Recommended for now)
**Pros**: Minimal schema changes, maintains current structure, works with existing code
**Cons**: Limited metadata, requires re-fetching from YouTube API

**Implementation**:
- Keep URL storage as-is
- When displaying in brand profile, fetch rich data from our API
- Cache channel metadata in component state

#### Option B: Create YouTube Channel Relationship Table (Future Enhancement)
**Pros**: Richer data, better for analytics, supports sharing channels between profiles
**Cons**: Schema migration, more complex API, requires more development time

**For Now**: Implement Option A, prepare architecture for Option B migration

### Store Channel Metadata Alongside URL

Since we're already storing URLs, we can add a complementary JSON field:

```prisma
model BrandProfile {
  // Existing
  competitorChannels      String[]
  inspirationChannels     String[]

  // New: Rich metadata
  competitorChannelData   Json?    // { "channel-url": { title, subs, ... } }
  inspirationChannelData  Json?    // { "channel-url": { title, subs, ... } }
}
```

**Structure of JSON**:
```json
{
  "https://youtube.com/@channel1": {
    "channelId": "UC...",
    "title": "Channel Title",
    "description": "...",
    "thumbnailUrl": "...",
    "subscriberCount": 50000,
    "videoCount": 150,
    "viewCount": "5000000",
    "fetchedAt": "2026-01-01T14:00:00Z"
  }
}
```

---

## Part 4: Enhanced Brand Profile Display

### Current Display
Shows just URLs as links in text format

### Enhanced Display

#### 4.1 Channel Cards
For each saved channel, show:
- Channel thumbnail (circle, size: 40x40)
- Channel title (bold, clickable to YouTube)
- Subscriber count (formatted: 50K, 1M, etc.)
- Video count
- Total views
- Remove button (trash icon)
- Edit type button (switch between competitor/inspiration)

#### 4.2 Organization
```
Competitor Channels (2)
├─ Channel Card 1
├─ Channel Card 2

Inspiration Channels (1)
├─ Channel Card 1
```

#### 4.3 Files to Update
- `app/dashboard/brand-profiles/page.tsx` (lines 897-945)
- New component: `components/brand-profiles/ChannelCard.tsx`

---

## Part 5: API Enhancements

### 5.1 Update POST `/api/brand-profiles/[id]/channels`

**Current**:
```typescript
body: {
  channelUrl: string
  type: 'competitor' | 'inspiration'
}
```

**New**:
```typescript
body: {
  channelData: {
    channelId: string
    title: string
    description: string
    thumbnailUrl: string
    subscriberCount: number
    videoCount: number
    viewCount: string
    url: string
  }
  type: 'competitor' | 'inspiration'
}
```

**Updates**:
- Extract URL from channelData
- Add to competitorChannels or inspirationChannels array (as before)
- Also store metadata in competitorChannelData or inspirationChannelData
- Return updated profile with new data

### 5.2 New GET `/api/brand-profiles/[id]/channels`

**Purpose**: Retrieve all saved channels for a profile with full metadata

**Response**:
```json
{
  "channels": [
    {
      "type": "competitor",
      "url": "https://youtube.com/@channel1",
      "data": {
        "channelId": "UC...",
        "title": "...",
        "subscriberCount": 50000,
        ...
      },
      "savedAt": "2026-01-01T14:00:00Z"
    }
  ]
}
```

---

## Implementation Steps (Execution Order)

### Phase 1: Channel Saving with Profile Selection (Core Feature)
1. Add profile selection state to YouTube research page
2. Create ProfileSelectorModal component
3. Enhance handleSaveChannel function
4. Update API to accept and store rich channel metadata
5. Test: Save channels to different profiles
6. Test: View saved channels in brand profile page

### Phase 2: Improved Display
7. Create ChannelCard component
8. Update brand profile page to display rich channel info
9. Add remove/edit buttons for channels
10. Test: Display in brand profile page

### Phase 3: Trending Algorithm Enhancement (Optional but Recommended)
11. Gather brand profile context in YouTube research page
12. Enhance search strategy in API
13. Implement engagement/relevance scoring
14. Test: Check if trending results are more relevant

### Phase 4: Optional Metadata Optimization
15. Add complementary JSON fields to schema (competitorChannelData, inspirationChannelData)
16. Migrate existing URLs to include metadata
17. Implement caching strategy

---

## Files to Create/Modify

### CREATE:
- `components/youtube/ProfileSelectorModal.tsx` (new modal component)
- `components/brand-profiles/ChannelCard.tsx` (channel display card)
- `IMPLEMENTATION_PLAN.md` (this file)

### MODIFY:
- `app/dashboard/youtube-research/page.tsx` (save flow)
- `app/api/brand-profiles/[id]/channels/route.ts` (API enhancement)
- `app/dashboard/brand-profiles/page.tsx` (display)
- `prisma/schema.prisma` (optional: add JSON fields)

### OPTIONAL:
- `app/api/youtube/channels/route.ts` (trending logic improvement)

---

## Key Improvements Summary

| Feature | Before | After |
|---------|--------|-------|
| Channel Saving | Auto-save to first profile | Choose profile from list |
| Metadata | Only URL stored | URL + rich channel data |
| Display | Plain URL links | Channel cards with thumbnails, stats |
| UX Clarity | Unclear which profile | Clear profile selection + confirmation |
| Trending | Generic search terms | Smart queries based on brand profile |
| Error Handling | Generic alerts | Specific guidance (e.g., "Create profile first") |

---

## Benefits

1. **Better UX**: Users know exactly which profile they're saving to
2. **Richer Data**: Channel metadata persisted for offline viewing
3. **Scalability**: Foundation for future features (analytics, sharing, bulk operations)
4. **Relevance**: Smarter trending channels based on user's brand
5. **Maintainability**: Cleaner code structure with component separation

---

## Technical Considerations

### Backward Compatibility
- Existing URL-only saved channels will continue to work
- New API accepts both formats (URL-only or rich data)
- Display gracefully handles missing metadata

### Performance
- Profile list is already fetched by component
- Modal appears instantly (cached data)
- Metadata stored once per channel save
- No additional API calls for display (data embedded)

### Migration Path
- Phase 1-2 can be completed without schema changes
- Phase 3-4 are enhancements, not blockers
- Can migrate from URL-only to rich data gradually

