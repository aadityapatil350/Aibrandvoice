/**
 * Multi-Platform Toggle component
 * @fileoverview Toggle between single and multi-platform modes with comparison view
 */

import React, { useState } from 'react';
import { Platform, MultiPlatformToggleProps, PlatformComparison } from '@/types/platforms';
import { getPlatformConfig, getAllPlatforms } from '@/lib/platforms';
import { Card, CardHeader, CardContent, Button, Badge, Checkbox } from '@/components/ui';

/**
 * Multi-Platform Toggle component
 */
export const MultiPlatformToggle: React.FC<MultiPlatformToggleProps> = ({
  isMultiPlatform,
  onToggle,
  platforms,
  selectedPlatforms,
  onSelectionChange,
  showComparison = false,
  className,
  disabled = false
}) => {
  const [comparisonData, setComparisonData] = useState<PlatformComparison[]>([]);

  /**
   * Handle toggle change
   */
  const handleToggleChange = (multiPlatform: boolean) => {
    onToggle(multiPlatform);
    
    // If switching to multi-platform and no platforms selected, select all
    if (multiPlatform && selectedPlatforms.length === 0) {
      onSelectionChange(platforms);
    } else if (!multiPlatform && selectedPlatforms.length > 1) {
      // If switching to single-platform, keep only the first selected
      onSelectionChange([selectedPlatforms[0]]);
    }
  };

  /**
   * Handle platform selection change
   */
  const handlePlatformChange = (platform: Platform, checked: boolean) => {
    if (checked) {
      const newSelection = [...selectedPlatforms, platform];
      onSelectionChange(newSelection);
    } else {
      const newSelection = selectedPlatforms.filter(p => p !== platform);
      onSelectionChange(newSelection);
    }
  };

  /**
   * Select all platforms
   */
  const handleSelectAll = () => {
    onSelectionChange(platforms);
  };

  /**
   * Clear all selections
   */
  const handleClearAll = () => {
    onSelectionChange([]);
  };

  /**
   * Generate mock comparison data (in real app, this would come from API)
   */
  const generateComparisonData = (): PlatformComparison[] => {
    return selectedPlatforms.map(platform => {
      const config = getPlatformConfig(platform);
      return {
        platform,
        metrics: {
          engagement: Math.floor(Math.random() * 100),
          reach: Math.floor(Math.random() * 100),
          conversion: Math.floor(Math.random() * 100),
          growth: Math.floor(Math.random() * 100)
        },
        strengths: [
          `High engagement on ${config.name}`,
          `Strong ${config.name} community`,
          `Great for ${config.name} content`
        ],
        weaknesses: [
          `Limited ${config.name} reach`,
          `High competition on ${config.name}`,
          `${config.name} algorithm changes`
        ]
      };
    });
  };

  /**
   * Toggle comparison view
   */
  const handleToggleComparison = () => {
    if (comparisonData.length === 0) {
      setComparisonData(generateComparisonData());
    } else {
      setComparisonData([]);
    }
  };

  /**
   * Render comparison table
   */
  const renderComparisonTable = () => {
    if (comparisonData.length === 0) return null;

    return (
      <div className="mt-6">
        <h4 className="text-sm font-medium text-claude-text mb-4">Platform Comparison</h4>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-claude-border">
                <th className="text-left p-2 text-sm font-medium text-claude-text">Platform</th>
                <th className="text-center p-2 text-sm font-medium text-claude-text">Engagement</th>
                <th className="text-center p-2 text-sm font-medium text-claude-text">Reach</th>
                <th className="text-center p-2 text-sm font-medium text-claude-text">Conversion</th>
                <th className="text-center p-2 text-sm font-medium text-claude-text">Growth</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((data) => {
                const config = getPlatformConfig(data.platform);
                return (
                  <tr key={data.platform} className="border-b border-claude-border">
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        <span>{config.icon}</span>
                        <span className="text-sm font-medium">{config.name}</span>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant={data.metrics.engagement > 70 ? 'success' : data.metrics.engagement > 40 ? 'warning' : 'error'} size="sm">
                        {data.metrics.engagement}%
                      </Badge>
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant={data.metrics.reach > 70 ? 'success' : data.metrics.reach > 40 ? 'warning' : 'error'} size="sm">
                        {data.metrics.reach}%
                      </Badge>
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant={data.metrics.conversion > 70 ? 'success' : data.metrics.conversion > 40 ? 'warning' : 'error'} size="sm">
                        {data.metrics.conversion}%
                      </Badge>
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant={data.metrics.growth > 70 ? 'success' : data.metrics.growth > 40 ? 'warning' : 'error'} size="sm">
                        {data.metrics.growth}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {comparisonData.map((data) => {
            const config = getPlatformConfig(data.platform);
            return (
              <Card key={data.platform} variant="outlined">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <span>{config.icon}</span>
                    <h5 className="text-sm font-medium">{config.name}</h5>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h6 className="text-xs font-medium text-claude-text mb-1">Strengths</h6>
                      <ul className="space-y-1">
                        {data.strengths.map((strength, index) => (
                          <li key={index} className="text-xs text-claude-text-secondary">
                            • {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h6 className="text-xs font-medium text-claude-text mb-1">Weaknesses</h6>
                      <ul className="space-y-1">
                        {data.weaknesses.map((weakness, index) => (
                          <li key={index} className="text-xs text-claude-text-secondary">
                            • {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-claude-text">Platform Mode</h3>
          <Badge variant={isMultiPlatform ? 'success' : 'secondary'}>
            {isMultiPlatform ? 'Multi-Platform' : 'Single-Platform'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Toggle Switch */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant={!isMultiPlatform ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleToggleChange(false)}
            disabled={disabled}
          >
            Single Platform
          </Button>
          <Button
            variant={isMultiPlatform ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleToggleChange(true)}
            disabled={disabled}
          >
            Multi-Platform
          </Button>
        </div>

        {/* Platform Selection */}
        {isMultiPlatform && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-claude-text">Select Platforms</h4>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={disabled}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={disabled}
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {platforms.map((platform) => {
                const config = getPlatformConfig(platform);
                const isSelected = selectedPlatforms.includes(platform);
                
                return (
                  <div
                    key={platform}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-claude-accent bg-claude-accent-light'
                        : 'border-claude-border hover:border-claude-border-hover'
                    }`}
                    onClick={() => handlePlatformChange(platform, !isSelected)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handlePlatformChange(platform, e.target.checked);
                        }}
                        disabled={disabled}
                      />
                      <span className="text-lg">{config.icon}</span>
                      <span className="text-sm font-medium">{config.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedPlatforms.length > 0 && (
              <div className="mt-4">
                <span className="text-sm text-claude-text-secondary">
                  {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''} selected
                </span>
              </div>
            )}
          </div>
        )}

        {/* Comparison Toggle */}
        {showComparison && isMultiPlatform && selectedPlatforms.length > 1 && (
          <div className="mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleComparison}
              disabled={disabled}
            >
              {comparisonData.length > 0 ? 'Hide' : 'Show'} Platform Comparison
            </Button>
            
            {renderComparisonTable()}
          </div>
        )}

        {/* Single Platform Info */}
        {!isMultiPlatform && selectedPlatforms.length === 1 && (
          <div className="mt-4 p-3 bg-claude-bg-secondary rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getPlatformConfig(selectedPlatforms[0]).icon}</span>
              <span className="text-sm font-medium">
                Optimizing for {getPlatformConfig(selectedPlatforms[0]).name}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiPlatformToggle;