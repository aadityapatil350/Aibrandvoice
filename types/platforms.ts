/**
 * Platform types and interfaces for multi-platform tools
 * @fileoverview Defines all platform-related types, interfaces, and constants
 */

/**
 * Supported social media and content platforms
 */
export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'twitter' | 'blog';

/**
 * Platform configuration interface
 */
export interface PlatformConfig {
  /** Platform identifier */
  id: Platform;
  /** Display name for the platform */
  name: string;
  /** Platform description */
  description: string;
  /** Platform icon (can be emoji, SVG path, or image URL) */
  icon: string;
  /** Platform color theme */
  color: string;
  /** Platform-specific settings */
  settings: PlatformSettings;
}

/**
 * Platform-specific settings interface
 */
export interface PlatformSettings {
  /** Thumbnail/image dimensions */
  dimensions?: {
    width: number;
    height: number;
    aspectRatio: string;
  };
  /** Character limits for content */
  characterLimits?: {
    title?: number;
    description?: number;
    caption?: number;
    maxHashtags?: number;
  };
  /** Hashtag recommendations */
  hashtagRecommendations?: {
    min: number;
    max: number;
    optimal: number;
  };
  /** SEO-specific settings */
  seoSettings?: {
    titleLength: {
      min: number;
      max: number;
      optimal: number;
    };
    descriptionLength: {
      min: number;
      max: number;
      optimal: number;
    };
    keywordDensity: {
      min: number;
      max: number;
    };
  };
  /** Best practices and tips */
  bestPractices?: string[];
  /** Content formatting guidelines */
  formatting?: {
    allowedTags: string[];
    lineBreaks: boolean;
    emojis: boolean;
    mentions: boolean;
    links: boolean;
  };
}

/**
 * Platform selector component props
 */
export interface PlatformSelectorProps {
  /** Currently selected platform(s) */
  selectedPlatforms: Platform | Platform[];
  /** Callback when platform selection changes */
  onSelectionChange: (platforms: Platform | Platform[]) => void;
  /** Whether multiple platforms can be selected */
  allowMultiple?: boolean;
  /** Whether to show platform descriptions */
  showDescriptions?: boolean;
  /** Whether to show platform icons */
  showIcons?: boolean;
  /** Custom CSS class names */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string;
}

/**
 * Platform configuration component props
 */
export interface PlatformConfigProps {
  /** Current platform(s) to configure */
  platforms: Platform | Platform[];
  /** Current configuration values */
  values: Record<Platform, Partial<PlatformSettings>>;
  /** Callback when configuration changes */
  onConfigChange: (platform: Platform, config: Partial<PlatformSettings>) => void;
  /** Whether to show advanced settings */
  showAdvanced?: boolean;
  /** Custom CSS class names */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Platform info component props
 */
export interface PlatformInfoProps {
  /** Platform to display information for */
  platform: Platform;
  /** Whether to show best practices */
  showBestPractices?: boolean;
  /** Whether to show dimensions */
  showDimensions?: boolean;
  /** Whether to show character limits */
  showCharacterLimits?: boolean;
  /** Whether to show hashtag recommendations */
  showHashtagRecommendations?: boolean;
  /** Whether to show SEO settings */
  showSeoSettings?: boolean;
  /** Custom CSS class names */
  className?: string;
  /** Compact view mode */
  compact?: boolean;
}

/**
 * Multi-platform toggle component props
 */
export interface MultiPlatformToggleProps {
  /** Whether multi-platform mode is enabled */
  isMultiPlatform: boolean;
  /** Callback when toggle state changes */
  onToggle: (isMultiPlatform: boolean) => void;
  /** Available platforms */
  platforms: Platform[];
  /** Currently selected platforms */
  selectedPlatforms: Platform[];
  /** Callback when platform selection changes */
  onSelectionChange: (platforms: Platform[]) => void;
  /** Whether to show comparison view */
  showComparison?: boolean;
  /** Custom CSS class names */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Platform comparison data interface
 */
export interface PlatformComparison {
  platform: Platform;
  metrics: {
    engagement: number;
    reach: number;
    conversion: number;
    growth: number;
  };
  strengths: string[];
  weaknesses: string[];
}

/**
 * Platform optimization result interface
 */
export interface PlatformOptimizationResult {
  platform: Platform;
  success: boolean;
  data: {
    optimizedContent: string;
    score: number;
    suggestions: string[];
    warnings: string[];
  };
  error?: string;
}