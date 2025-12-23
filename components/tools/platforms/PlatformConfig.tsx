/**
 * Platform Config component
 * @fileoverview Component for platform-specific settings with dynamic form fields
 */

import React, { useState, useEffect } from 'react';
import { Platform, PlatformConfigProps, PlatformSettings } from '@/types/platforms';
import { getPlatformConfig } from '@/lib/platforms';
import { Card, CardHeader, CardContent, Input, Badge, Button } from '@/components/ui';

/**
 * Platform Config component
 */
export const PlatformConfig: React.FC<PlatformConfigProps> = ({
  platforms,
  values,
  onConfigChange,
  showAdvanced = false,
  className,
  disabled = false
}) => {
  const [activePlatform, setActivePlatform] = useState<Platform>(
    Array.isArray(platforms) ? platforms[0] : platforms
  );

  /**
   * Get current platform configuration
   */
  const currentPlatformConfig = getPlatformConfig(activePlatform);
  const currentValues = values[activePlatform] || {};

  /**
   * Handle platform switch
   */
  const handlePlatformSwitch = (platform: Platform) => {
    setActivePlatform(platform);
  };

  /**
   * Handle configuration change
   */
  const handleConfigChange = (field: string, value: any) => {
    onConfigChange(activePlatform, { [field]: value });
  };

  /**
   * Handle dimension change
   */
  const handleDimensionChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value) || 0;
    const currentDimensions = currentValues.dimensions || currentPlatformConfig.settings.dimensions;
    if (currentDimensions) {
      onConfigChange(activePlatform, {
        dimensions: {
          ...currentDimensions,
          [dimension]: numValue
        }
      });
    }
  };

  /**
   * Handle character limit change
   */
  const handleCharacterLimitChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const currentLimits = currentValues.characterLimits || currentPlatformConfig.settings.characterLimits;
    onConfigChange(activePlatform, {
      characterLimits: {
        ...currentLimits,
        [field]: numValue
      }
    });
  };

  /**
   * Handle hashtag recommendation change
   */
  const handleHashtagChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const currentHashtags = currentValues.hashtagRecommendations || currentPlatformConfig.settings.hashtagRecommendations;
    if (currentHashtags) {
      onConfigChange(activePlatform, {
        hashtagRecommendations: {
          ...currentHashtags,
          [field]: numValue
        }
      });
    }
  };

  /**
   * Handle SEO setting change
   */
  const handleSeoChange = (category: string, field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const currentSeo = currentValues.seoSettings || currentPlatformConfig.settings.seoSettings;
    if (currentSeo) {
      onConfigChange(activePlatform, {
        seoSettings: {
          ...currentSeo,
          [category]: {
            ...(currentSeo as any)[category],
            [field]: numValue
          }
        }
      });
    }
  };

  /**
   * Reset to default settings
   */
  const handleReset = () => {
    onConfigChange(activePlatform, currentPlatformConfig.settings);
  };

  /**
   * Render platform tabs
   */
  const renderPlatformTabs = () => {
    if (!Array.isArray(platforms)) return null;

    return (
      <div className="flex space-x-1 mb-4 border-b border-claude-border">
        {platforms.map((platform) => {
          const config = getPlatformConfig(platform);
          return (
            <button
              key={platform}
              onClick={() => handlePlatformSwitch(platform)}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activePlatform === platform
                  ? 'border-claude-accent text-claude-accent'
                  : 'border-transparent text-claude-text-secondary hover:text-claude-text'
              }`}
              disabled={disabled}
            >
              <span>{config.icon}</span>
              <span>{config.name}</span>
            </button>
          );
        })}
      </div>
    );
  };

  /**
   * Render dimension settings
   */
  const renderDimensionSettings = () => {
    const dimensions = currentValues.dimensions || currentPlatformConfig.settings.dimensions;
    if (!dimensions) return null;

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-claude-text">Image Dimensions</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-claude-text-secondary mb-1">
              Width (px)
            </label>
            <Input
              type="number"
              value={dimensions.width}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              disabled={disabled}
              size="sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-claude-text-secondary mb-1">
              Height (px)
            </label>
            <Input
              type="number"
              value={dimensions.height}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              disabled={disabled}
              size="sm"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" size="sm">
            {dimensions.aspectRatio}
          </Badge>
          <span className="text-xs text-claude-text-tertiary">Aspect Ratio</span>
        </div>
      </div>
    );
  };

  /**
   * Render character limit settings
   */
  const renderCharacterLimitSettings = () => {
    const characterLimits = currentValues.characterLimits || currentPlatformConfig.settings.characterLimits;
    if (!characterLimits) return null;

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-claude-text">Character Limits</h4>
        <div className="space-y-3">
          {characterLimits.title && (
            <div>
              <label className="block text-xs font-medium text-claude-text-secondary mb-1">
                Title Characters
              </label>
              <Input
                type="number"
                value={characterLimits.title}
                onChange={(e) => handleCharacterLimitChange('title', e.target.value)}
                disabled={disabled}
                size="sm"
              />
            </div>
          )}
          {characterLimits.description && (
            <div>
              <label className="block text-xs font-medium text-claude-text-secondary mb-1">
                Description Characters
              </label>
              <Input
                type="number"
                value={characterLimits.description}
                onChange={(e) => handleCharacterLimitChange('description', e.target.value)}
                disabled={disabled}
                size="sm"
              />
            </div>
          )}
          {characterLimits.caption && (
            <div>
              <label className="block text-xs font-medium text-claude-text-secondary mb-1">
                Caption Characters
              </label>
              <Input
                type="number"
                value={characterLimits.caption}
                onChange={(e) => handleCharacterLimitChange('caption', e.target.value)}
                disabled={disabled}
                size="sm"
              />
            </div>
          )}
          {characterLimits.maxHashtags && (
            <div>
              <label className="block text-xs font-medium text-claude-text-secondary mb-1">
                Max Hashtags
              </label>
              <Input
                type="number"
                value={characterLimits.maxHashtags}
                onChange={(e) => handleCharacterLimitChange('maxHashtags', e.target.value)}
                disabled={disabled}
                size="sm"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render hashtag recommendation settings
   */
  const renderHashtagSettings = () => {
    const hashtagRecommendations = currentValues.hashtagRecommendations || currentPlatformConfig.settings.hashtagRecommendations;
    if (!hashtagRecommendations) return null;

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-claude-text">Hashtag Recommendations</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-claude-text-secondary mb-1">
              Minimum
            </label>
            <Input
              type="number"
              value={hashtagRecommendations.min}
              onChange={(e) => handleHashtagChange('min', e.target.value)}
              disabled={disabled}
              size="sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-claude-text-secondary mb-1">
              Optimal
            </label>
            <Input
              type="number"
              value={hashtagRecommendations.optimal}
              onChange={(e) => handleHashtagChange('optimal', e.target.value)}
              disabled={disabled}
              size="sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-claude-text-secondary mb-1">
              Maximum
            </label>
            <Input
              type="number"
              value={hashtagRecommendations.max}
              onChange={(e) => handleHashtagChange('max', e.target.value)}
              disabled={disabled}
              size="sm"
            />
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render SEO settings
   */
  const renderSeoSettings = () => {
    const seoSettings = currentValues.seoSettings || currentPlatformConfig.settings.seoSettings;
    if (!seoSettings) return null;

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-claude-text">SEO Settings</h4>
        
        {seoSettings.titleLength && (
          <div>
            <h5 className="text-xs font-medium text-claude-text-secondary mb-2">Title Length</h5>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-claude-text-tertiary mb-1">Min</label>
                <Input
                  type="number"
                  value={seoSettings.titleLength.min}
                  onChange={(e) => handleSeoChange('titleLength', 'min', e.target.value)}
                  disabled={disabled}
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-xs text-claude-text-tertiary mb-1">Optimal</label>
                <Input
                  type="number"
                  value={seoSettings.titleLength.optimal}
                  onChange={(e) => handleSeoChange('titleLength', 'optimal', e.target.value)}
                  disabled={disabled}
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-xs text-claude-text-tertiary mb-1">Max</label>
                <Input
                  type="number"
                  value={seoSettings.titleLength.max}
                  onChange={(e) => handleSeoChange('titleLength', 'max', e.target.value)}
                  disabled={disabled}
                  size="sm"
                />
              </div>
            </div>
          </div>
        )}

        {seoSettings.descriptionLength && (
          <div>
            <h5 className="text-xs font-medium text-claude-text-secondary mb-2">Description Length</h5>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-claude-text-tertiary mb-1">Min</label>
                <Input
                  type="number"
                  value={seoSettings.descriptionLength.min}
                  onChange={(e) => handleSeoChange('descriptionLength', 'min', e.target.value)}
                  disabled={disabled}
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-xs text-claude-text-tertiary mb-1">Optimal</label>
                <Input
                  type="number"
                  value={seoSettings.descriptionLength.optimal}
                  onChange={(e) => handleSeoChange('descriptionLength', 'optimal', e.target.value)}
                  disabled={disabled}
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-xs text-claude-text-tertiary mb-1">Max</label>
                <Input
                  type="number"
                  value={seoSettings.descriptionLength.max}
                  onChange={(e) => handleSeoChange('descriptionLength', 'max', e.target.value)}
                  disabled={disabled}
                  size="sm"
                />
              </div>
            </div>
          </div>
        )}

        {seoSettings.keywordDensity && (
          <div>
            <h5 className="text-xs font-medium text-claude-text-secondary mb-2">Keyword Density (%)</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-claude-text-tertiary mb-1">Min</label>
                <Input
                  type="number"
                  value={seoSettings.keywordDensity.min}
                  onChange={(e) => handleSeoChange('keywordDensity', 'min', e.target.value)}
                  disabled={disabled}
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-xs text-claude-text-tertiary mb-1">Max</label>
                <Input
                  type="number"
                  value={seoSettings.keywordDensity.max}
                  onChange={(e) => handleSeoChange('keywordDensity', 'max', e.target.value)}
                  disabled={disabled}
                  size="sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{currentPlatformConfig.icon}</span>
            <h3 className="text-lg font-medium text-claude-text">
              {currentPlatformConfig.name} Configuration
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={disabled}
          >
            Reset to Default
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {renderPlatformTabs()}
        
        <div className="space-y-6">
          {renderDimensionSettings()}
          {renderCharacterLimitSettings()}
          {renderHashtagSettings()}
          {showAdvanced && renderSeoSettings()}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformConfig;