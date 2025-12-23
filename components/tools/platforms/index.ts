/**
 * Platform components index
 * @fileoverview Export all platform components from a single location
 */

export { default as PlatformSelector } from './PlatformSelector';
export type { PlatformSelectorProps } from '@/types/platforms';

export { default as PlatformConfig } from './PlatformConfig';
export type { PlatformConfigProps } from '@/types/platforms';

export { default as PlatformInfo } from './PlatformInfo';
export type { PlatformInfoProps } from '@/types/platforms';

export { default as MultiPlatformToggle } from './MultiPlatformToggle';
export type { MultiPlatformToggleProps } from '@/types/platforms';

// Re-export platform types and utilities
export type { 
  Platform, 
  PlatformSettings, 
  PlatformComparison,
  PlatformOptimizationResult 
} from '@/types/platforms';

export { 
  getPlatformConfig, 
  getAllPlatforms, 
  getPlatformNames,
  platformSupportsFeature,
  getOptimalSettings 
} from '@/lib/platforms';