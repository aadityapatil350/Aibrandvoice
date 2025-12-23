/**
 * Platform constants and data
 * @fileoverview Contains platform configurations and utility functions
 */

import { Platform, PlatformConfig } from '@/types/platforms';

/**
 * Platform icons using emoji for simplicity
 * Can be replaced with SVG icons or images later
 */
export const PLATFORM_ICONS: Record<Platform, string> = {
  youtube: '📺',
  instagram: '📷',
  tiktok: '🎵',
  linkedin: '💼',
  twitter: '🐦',
  blog: '📝'
};

/**
 * Platform colors
 */
export const PLATFORM_COLORS: Record<Platform, string> = {
  youtube: '#FF0000',
  instagram: '#E4405F',
  tiktok: '#000000',
  linkedin: '#0077B5',
  twitter: '#1DA1F2',
  blog: '#4285F4'
};

/**
 * Complete platform configurations
 */
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    description: 'Video sharing platform with focus on long-form content',
    icon: PLATFORM_ICONS.youtube,
    color: PLATFORM_COLORS.youtube,
    settings: {
      dimensions: {
        width: 1280,
        height: 720,
        aspectRatio: '16:9'
      },
      characterLimits: {
        title: 100,
        description: 5000,
        maxHashtags: 15
      },
      hashtagRecommendations: {
        min: 3,
        max: 15,
        optimal: 8
      },
      seoSettings: {
        titleLength: {
          min: 30,
          max: 100,
          optimal: 60
        },
        descriptionLength: {
          min: 100,
          max: 5000,
          optimal: 1000
        },
        keywordDensity: {
          min: 1,
          max: 3
        }
      },
      bestPractices: [
        'Use compelling thumbnails that stand out',
        'Include keywords in title and description',
        'Add timestamps for longer videos',
        'Use relevant tags and hashtags',
        'Create custom thumbnails for better CTR'
      ],
      formatting: {
        allowedTags: ['strong', 'em', 'u', 'br'],
        lineBreaks: true,
        emojis: true,
        mentions: true,
        links: true
      }
    }
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    description: 'Visual content platform focused on images and short videos',
    icon: PLATFORM_ICONS.instagram,
    color: PLATFORM_COLORS.instagram,
    settings: {
      dimensions: {
        width: 1080,
        height: 1080,
        aspectRatio: '1:1'
      },
      characterLimits: {
        caption: 2200,
        maxHashtags: 30
      },
      hashtagRecommendations: {
        min: 5,
        max: 30,
        optimal: 15
      },
      bestPractices: [
        'Use high-quality images and videos',
        'Write engaging captions with first line hook',
        'Use relevant hashtags strategically',
        'Tag relevant accounts and locations',
        'Post consistently at optimal times'
      ],
      formatting: {
        allowedTags: ['strong', 'em'],
        lineBreaks: true,
        emojis: true,
        mentions: true,
        links: false
      }
    }
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Short-form video platform with focus on trends and music',
    icon: PLATFORM_ICONS.tiktok,
    color: PLATFORM_COLORS.tiktok,
    settings: {
      dimensions: {
        width: 1080,
        height: 1920,
        aspectRatio: '9:16'
      },
      characterLimits: {
        caption: 150,
        maxHashtags: 5
      },
      hashtagRecommendations: {
        min: 2,
        max: 5,
        optimal: 3
      },
      bestPractices: [
        'Use trending sounds and effects',
        'Keep content short and engaging',
        'Use popular but relevant hashtags',
        'Include clear call-to-action',
        'Post during peak engagement hours'
      ],
      formatting: {
        allowedTags: [],
        lineBreaks: false,
        emojis: true,
        mentions: true,
        links: false
      }
    }
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Professional networking platform for business content',
    icon: PLATFORM_ICONS.linkedin,
    color: PLATFORM_COLORS.linkedin,
    settings: {
      dimensions: {
        width: 1200,
        height: 627,
        aspectRatio: '1.91:1'
      },
      characterLimits: {
        caption: 3000,
        maxHashtags: 10
      },
      hashtagRecommendations: {
        min: 3,
        max: 10,
        optimal: 5
      },
      seoSettings: {
        titleLength: {
          min: 40,
          max: 100,
          optimal: 70
        },
        descriptionLength: {
          min: 100,
          max: 3000,
          optimal: 500
        },
        keywordDensity: {
          min: 1,
          max: 2
        }
      },
      bestPractices: [
        'Maintain professional tone',
        'Share valuable insights and expertise',
        'Use industry-specific hashtags',
        'Tag relevant companies and people',
        'Include clear call-to-action'
      ],
      formatting: {
        allowedTags: ['strong', 'em', 'u', 'br'],
        lineBreaks: true,
        emojis: false,
        mentions: true,
        links: true
      }
    }
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter',
    description: 'Microblogging platform for real-time updates',
    icon: PLATFORM_ICONS.twitter,
    color: PLATFORM_COLORS.twitter,
    settings: {
      dimensions: {
        width: 1200,
        height: 675,
        aspectRatio: '16:9'
      },
      characterLimits: {
        caption: 280,
        maxHashtags: 5
      },
      hashtagRecommendations: {
        min: 1,
        max: 5,
        optimal: 2
      },
      bestPractices: [
        'Keep tweets concise and impactful',
        'Use relevant hashtags sparingly',
        'Include media for higher engagement',
        'Tag relevant accounts',
        'Post during peak hours'
      ],
      formatting: {
        allowedTags: [],
        lineBreaks: true,
        emojis: true,
        mentions: true,
        links: true
      }
    }
  },
  blog: {
    id: 'blog',
    name: 'Blog',
    description: 'Long-form content platform for detailed articles',
    icon: PLATFORM_ICONS.blog,
    color: PLATFORM_COLORS.blog,
    settings: {
      dimensions: {
        width: 1200,
        height: 630,
        aspectRatio: '1.91:1'
      },
      characterLimits: {
        title: 60,
        description: 160
      },
      hashtagRecommendations: {
        min: 5,
        max: 20,
        optimal: 10
      },
      seoSettings: {
        titleLength: {
          min: 30,
          max: 60,
          optimal: 50
        },
        descriptionLength: {
          min: 120,
          max: 160,
          optimal: 150
        },
        keywordDensity: {
          min: 1,
          max: 3
        }
      },
      bestPractices: [
        'Write compelling, SEO-friendly titles',
        'Structure content with headers',
        'Include internal and external links',
        'Optimize for search engines',
        'Use relevant categories and tags'
      ],
      formatting: {
        allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'em', 'u', 'br', 'ul', 'ol', 'li', 'blockquote', 'code'],
        lineBreaks: true,
        emojis: false,
        mentions: false,
        links: true
      }
    }
  }
};

/**
 * Get platform configuration by ID
 * @param platform Platform ID
 * @returns Platform configuration
 */
export function getPlatformConfig(platform: Platform): PlatformConfig {
  return PLATFORM_CONFIGS[platform];
}

/**
 * Get all available platforms
 * @returns Array of all platform configurations
 */
export function getAllPlatforms(): PlatformConfig[] {
  return Object.values(PLATFORM_CONFIGS);
}

/**
 * Get platform names array
 * @returns Array of platform names
 */
export function getPlatformNames(): string[] {
  return Object.values(PLATFORM_CONFIGS).map(config => config.name);
}

/**
 * Check if platform supports specific feature
 * @param platform Platform ID
 * @param feature Feature to check
 * @returns Whether platform supports the feature
 */
export function platformSupportsFeature(platform: Platform, feature: string): boolean {
  const config = getPlatformConfig(platform);
  
  switch (feature) {
    case 'hashtags':
      return !!config.settings.hashtagRecommendations;
    case 'seo':
      return !!config.settings.seoSettings;
    case 'thumbnails':
      return !!config.settings.dimensions;
    case 'characterLimits':
      return !!config.settings.characterLimits;
    default:
      return false;
  }
}

/**
 * Get optimal settings for a platform
 * @param platform Platform ID
 * @returns Optimal settings object
 */
export function getOptimalSettings(platform: Platform) {
  const config = getPlatformConfig(platform);
  const optimal: Record<string, any> = {};
  
  if (config.settings.seoSettings) {
    optimal.titleLength = config.settings.seoSettings.titleLength.optimal;
    optimal.descriptionLength = config.settings.seoSettings.descriptionLength.optimal;
  }
  
  if (config.settings.hashtagRecommendations) {
    optimal.hashtagCount = config.settings.hashtagRecommendations.optimal;
  }
  
  if (config.settings.characterLimits) {
    optimal.maxCharacters = config.settings.characterLimits.caption || 
                          config.settings.characterLimits.description || 
                          config.settings.characterLimits.title;
  }
  
  return optimal;
}