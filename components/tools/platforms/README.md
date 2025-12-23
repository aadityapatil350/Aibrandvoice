# Platform Components

This directory contains reusable platform selection and configuration components that can be used across all three tools (Thumbnail Generator, SEO Optimizer, and Hashtag Generator).

## Components

### PlatformSelector

A dropdown/select component for choosing platforms with support for single and multiple selection modes.

```tsx
import { PlatformSelector } from '@/components/tools/platforms';

<PlatformSelector
  selectedPlatforms={selectedPlatforms}
  onSelectionChange={handleSelectionChange}
  allowMultiple={true}
  showDescriptions={true}
  showIcons={true}
/>
```

**Props:**
- `selectedPlatforms`: Currently selected platform(s)
- `onSelectionChange`: Callback when selection changes
- `allowMultiple`: Enable multiple platform selection
- `showDescriptions`: Show platform descriptions
- `showIcons`: Show platform icons
- `className`: Custom CSS classes
- `disabled`: Disable the component
- `loading`: Show loading state
- `error`: Error message

### PlatformConfig

Component for platform-specific settings with dynamic form fields based on selected platform.

```tsx
import { PlatformConfig } from '@/components/tools/platforms';

<PlatformConfig
  platforms={selectedPlatforms}
  values={platformConfigs}
  onConfigChange={handleConfigChange}
  showAdvanced={true}
/>
```

**Props:**
- `platforms`: Platform(s) to configure
- `values`: Current configuration values
- `onConfigChange`: Callback when configuration changes
- `showAdvanced`: Show advanced SEO settings
- `className`: Custom CSS classes
- `disabled`: Disable the component

### PlatformInfo

Information display component showing platform-specific best practices and recommendations.

```tsx
import { PlatformInfo } from '@/components/tools/platforms';

<PlatformInfo
  platform="youtube"
  showBestPractices={true}
  showDimensions={true}
  showCharacterLimits={true}
  showHashtagRecommendations={true}
  showSeoSettings={true}
  compact={false}
/>
```

**Props:**
- `platform`: Platform to display information for
- `showBestPractices`: Show best practices
- `showDimensions`: Show optimal dimensions
- `showCharacterLimits`: Show character limits
- `showHashtagRecommendations`: Show hashtag recommendations
- `showSeoSettings`: Show SEO settings
- `compact`: Compact view mode
- `className`: Custom CSS classes

### MultiPlatformToggle

Toggle between single and multi-platform modes with comparison view.

```tsx
import { MultiPlatformToggle } from '@/components/tools/platforms';

<MultiPlatformToggle
  isMultiPlatform={isMultiPlatform}
  onToggle={handleToggle}
  platforms={availablePlatforms}
  selectedPlatforms={selectedPlatforms}
  onSelectionChange={handleSelectionChange}
  showComparison={true}
/>
```

**Props:**
- `isMultiPlatform`: Whether multi-platform mode is enabled
- `onToggle`: Callback when toggle state changes
- `platforms`: Available platforms
- `selectedPlatforms`: Currently selected platforms
- `onSelectionChange`: Callback when platform selection changes
- `showComparison`: Show platform comparison view
- `className`: Custom CSS classes
- `disabled`: Disable the component

## Supported Platforms

- **YouTube** (`youtube`): Video sharing platform
- **Instagram** (`instagram`): Visual content platform
- **TikTok** (`tiktok`): Short-form video platform
- **LinkedIn** (`linkedin`): Professional networking platform
- **Twitter** (`twitter`): Microblogging platform
- **Blog** (`blog`): Long-form content platform

## Platform Configuration

Each platform has specific configuration options:

### Dimensions
- Width and height in pixels
- Aspect ratio (e.g., 16:9, 1:1, 9:16)

### Character Limits
- Title character limits
- Description character limits
- Caption character limits
- Maximum hashtags

### Hashtag Recommendations
- Minimum number of hashtags
- Maximum number of hashtags
- Optimal number of hashtags

### SEO Settings
- Title length recommendations (min/max/optimal)
- Description length recommendations (min/max/optimal)
- Keyword density recommendations (min/max)

### Best Practices
- Platform-specific tips and recommendations
- Content formatting guidelines
- Engagement strategies

## Usage Examples

### Basic Usage

```tsx
import React, { useState } from 'react';
import { PlatformSelector, PlatformConfig, PlatformInfo } from '@/components/tools/platforms';
import { Platform } from '@/types/platforms';

export function MyTool() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('youtube');
  const [config, setConfig] = useState({});

  return (
    <div>
      <PlatformSelector
        selectedPlatforms={selectedPlatform}
        onSelectionChange={setSelectedPlatform}
        allowMultiple={false}
      />
      
      <PlatformConfig
        platforms={selectedPlatform}
        values={config}
        onConfigChange={(platform, newConfig) => {
          setConfig(prev => ({ ...prev, [platform]: newConfig }));
        }}
      />
      
      <PlatformInfo platform={selectedPlatform} />
    </div>
  );
}
```

### Multi-Platform Usage

```tsx
import React, { useState } from 'react';
import { 
  PlatformSelector, 
  PlatformConfig, 
  PlatformInfo, 
  MultiPlatformToggle 
} from '@/components/tools/platforms';
import { Platform } from '@/types/platforms';

export function MultiPlatformTool() {
  const [isMultiPlatform, setIsMultiPlatform] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['youtube']);
  const [configs, setConfigs] = useState({});

  return (
    <div>
      <MultiPlatformToggle
        isMultiPlatform={isMultiPlatform}
        onToggle={setIsMultiPlatform}
        platforms={['youtube', 'instagram', 'tiktok']}
        selectedPlatforms={selectedPlatforms}
        onSelectionChange={setSelectedPlatforms}
      />
      
      <PlatformSelector
        selectedPlatforms={isMultiPlatform ? selectedPlatforms : selectedPlatforms[0]}
        onSelectionChange={(platforms) => {
          if (Array.isArray(platforms)) {
            setSelectedPlatforms(platforms);
          } else {
            setSelectedPlatforms([platforms]);
          }
        }}
        allowMultiple={isMultiPlatform}
      />
      
      <PlatformConfig
        platforms={isMultiPlatform ? selectedPlatforms : selectedPlatforms[0]}
        values={configs}
        onConfigChange={(platform, newConfig) => {
          setConfigs(prev => ({ ...prev, [platform]: newConfig }));
        }}
      />
      
      {isMultiPlatform ? (
        <div className="grid grid-cols-2 gap-4">
          {selectedPlatforms.map(platform => (
            <PlatformInfo key={platform} platform={platform} compact />
          ))}
        </div>
      ) : (
        <PlatformInfo platform={selectedPlatforms[0]} />
      )}
    </div>
  );
}
```

## Styling

All components use Tailwind CSS classes and follow the design system defined in `tailwind.config.js`. They use the `claude` color palette for consistent styling.

## Accessibility

- All components support keyboard navigation
- Proper ARIA labels and roles
- Focus management
- Screen reader compatibility

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```tsx
import type { 
  Platform, 
  PlatformSettings, 
  PlatformSelectorProps,
  PlatformConfigProps,
  PlatformInfoProps,
  MultiPlatformToggleProps 
} from '@/types/platforms';
```

## Demo

See `PlatformDemo.tsx` for a complete example of all components working together.