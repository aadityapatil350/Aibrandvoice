/**
 * Platform Info component
 * @fileoverview Information display component showing platform-specific best practices and recommendations
 */

'use client'

import React from 'react';
import { Platform, PlatformInfoProps } from '@/types/platforms';
import { getPlatformConfig } from '@/lib/platforms';
import { Card, CardHeader, CardContent, Badge } from '@/components/ui';

/**
 * Platform Info component
 */
const PlatformInfo: React.FC<PlatformInfoProps> = ({
  platform,
  showBestPractices = true,
  showDimensions = true,
  showCharacterLimits = true,
  showHashtagRecommendations = true,
  showSeoSettings = true,
  className,
  compact = false
}) => {
  const platformConfig = getPlatformConfig(platform);

  /**
   * Render best practices
   */
  const renderBestPractices = () => {
    if (!showBestPractices || !platformConfig.settings.bestPractices) return null;

    return (
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <h4 className="text-sm font-medium text-claude-text">Best Practices</h4>
        <ul className={compact ? 'space-y-1' : 'space-y-2'}>
          {platformConfig.settings.bestPractices.map((practice, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-claude-accent mt-1">•</span>
              <span className={compact ? 'text-xs' : 'text-sm'} text-claude-text-secondary>
                {practice}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  /**
   * Render dimensions
   */
  const renderDimensions = () => {
    if (!showDimensions || !platformConfig.settings.dimensions) return null;

    const { width, height, aspectRatio } = platformConfig.settings.dimensions;

    return (
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <h4 className="text-sm font-medium text-claude-text">Optimal Dimensions</h4>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" size={compact ? 'sm' : 'md'}>
              {width} × {height}
            </Badge>
            <span className={`${compact ? 'text-xs' : 'text-sm'} text-claude-text-tertiary`}>
              pixels
            </span>
          </div>
          <Badge variant="secondary" size={compact ? 'sm' : 'md'}>
            {aspectRatio}
          </Badge>
        </div>
      </div>
    );
  };

  /**
   * Render character limits
   */
  const renderCharacterLimits = () => {
    if (!showCharacterLimits || !platformConfig.settings.characterLimits) return null;

    const limits = platformConfig.settings.characterLimits;

    return (
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <h4 className="text-sm font-medium text-claude-text">Character Limits</h4>
        <div className={compact ? 'space-y-1' : 'space-y-2'}>
          {limits.title && (
            <div className="flex justify-between items-center">
              <span className={compact ? 'text-xs' : 'text-sm'} text-claude-text-secondary>
                Title
              </span>
              <Badge variant="secondary" size={compact ? 'sm' : 'md'}>
                {limits.title}
              </Badge>
            </div>
          )}
          {limits.description && (
            <div className="flex justify-between items-center">
              <span className={compact ? 'text-xs' : 'text-sm'} text-claude-text-secondary>
                Description
              </span>
              <Badge variant="secondary" size={compact ? 'sm' : 'md'}>
                {limits.description}
              </Badge>
            </div>
          )}
          {limits.caption && (
            <div className="flex justify-between items-center">
              <span className={compact ? 'text-xs' : 'text-sm'} text-claude-text-secondary>
                Caption
              </span>
              <Badge variant="secondary" size={compact ? 'sm' : 'md'}>
                {limits.caption}
              </Badge>
            </div>
          )}
          {limits.maxHashtags && (
            <div className="flex justify-between items-center">
              <span className={compact ? 'text-xs' : 'text-sm'} text-claude-text-secondary>
                Max Hashtags
              </span>
              <Badge variant="secondary" size={compact ? 'sm' : 'md'}>
                {limits.maxHashtags}
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render hashtag recommendations
   */
  const renderHashtagRecommendations = () => {
    if (!showHashtagRecommendations || !platformConfig.settings.hashtagRecommendations) return null;

    const { min, max, optimal } = platformConfig.settings.hashtagRecommendations;

    return (
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <h4 className="text-sm font-medium text-claude-text">Hashtag Recommendations</h4>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" size={compact ? 'sm' : 'md'}>
            {min} - {max}
          </Badge>
          <span className={`${compact ? 'text-xs' : 'text-sm'} text-claude-text-tertiary`}>
            (optimal: {optimal})
          </span>
        </div>
      </div>
    );
  };

  /**
   * Render SEO settings
   */
  const renderSeoSettings = () => {
    if (!showSeoSettings || !platformConfig.settings.seoSettings) return null;

    const seoSettings = platformConfig.settings.seoSettings;

    return (
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <h4 className="text-sm font-medium text-claude-text">SEO Guidelines</h4>
        
        {seoSettings.titleLength && (
          <div className={compact ? 'space-y-1' : 'space-y-2'}>
            <h5 className={compact ? 'text-xs' : 'text-sm'} text-claude-text-secondary>
              Title Length
            </h5>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" size={compact ? 'sm' : 'md'}>
                {seoSettings.titleLength.optimal}
              </Badge>
              <span className={`${compact ? 'text-xs' : 'text-sm'} text-claude-text-tertiary`}>
                (range: {seoSettings.titleLength.min} - {seoSettings.titleLength.max})
              </span>
            </div>
          </div>
        )}

        {seoSettings.descriptionLength && (
          <div className={compact ? 'space-y-1' : 'space-y-2'}>
            <h5 className={compact ? 'text-xs' : 'text-sm'} text-claude-text-secondary>
              Description Length
            </h5>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" size={compact ? 'sm' : 'md'}>
                {seoSettings.descriptionLength.optimal}
              </Badge>
              <span className={`${compact ? 'text-xs' : 'text-sm'} text-claude-text-tertiary`}>
                (range: {seoSettings.descriptionLength.min} - {seoSettings.descriptionLength.max})
              </span>
            </div>
          </div>
        )}

        {seoSettings.keywordDensity && (
          <div className={compact ? 'space-y-1' : 'space-y-2'}>
            <h5 className={compact ? 'text-xs' : 'text-sm'} text-claude-text-secondary>
              Keyword Density
            </h5>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" size={compact ? 'sm' : 'md'}>
                {seoSettings.keywordDensity.min}%-{seoSettings.keywordDensity.max}%
              </Badge>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * Render formatting guidelines
   */
  const renderFormattingGuidelines = () => {
    if (!platformConfig.settings.formatting) return null;
    
    const formatting = platformConfig.settings.formatting;
    const { allowedTags, lineBreaks, emojis, mentions, links } = formatting;

    return (
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <h4 className="text-sm font-medium text-claude-text">Formatting Guidelines</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Badge variant={lineBreaks ? 'success' : 'error'} size={compact ? 'sm' : 'md'}>
              Line Breaks
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={emojis ? 'success' : 'error'} size={compact ? 'sm' : 'md'}>
              Emojis
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={mentions ? 'success' : 'error'} size={compact ? 'sm' : 'md'}>
              Mentions
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={links ? 'success' : 'error'} size={compact ? 'sm' : 'md'}>
              Links
            </Badge>
          </div>
        </div>
        {allowedTags.length > 0 && (
          <div className="mt-2">
            <span className={`${compact ? 'text-xs' : 'text-sm'} text-claude-text-tertiary`}>
              Allowed tags: {allowedTags.join(', ')}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (compact) {
    // Compact view for inline display
    return (
      <div className={`p-3 bg-claude-bg-secondary rounded-lg ${className}`}>
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-lg">{platformConfig.icon}</span>
          <h3 className="text-sm font-medium text-claude-text">{platformConfig.name}</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {renderDimensions()}
          {renderCharacterLimits()}
          {renderHashtagRecommendations()}
        </div>
      </div>
    );
  }

  // Full card view
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{platformConfig.icon}</span>
          <div>
            <h3 className="text-lg font-medium text-claude-text">{platformConfig.name}</h3>
            <p className="text-sm text-claude-text-secondary">{platformConfig.description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderBestPractices()}
          {renderDimensions()}
          {renderCharacterLimits()}
          {renderHashtagRecommendations()}
          {renderSeoSettings()}
          {renderFormattingGuidelines()}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformInfo;