/**
 * Platform Demo component
 * @fileoverview Demo component showing how to use all platform components together
 */

import React, { useState } from 'react';
import { Platform, PlatformSettings } from '@/types/platforms';
import { 
  PlatformSelector, 
  PlatformConfig, 
  PlatformInfo, 
  MultiPlatformToggle,
  getAllPlatforms 
} from './index';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';

/**
 * Platform Demo component
 */
export const PlatformDemo: React.FC = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['youtube']);
  const [isMultiPlatform, setIsMultiPlatform] = useState(false);
  const [platformConfigs, setPlatformConfigs] = useState<Record<Platform, Partial<PlatformSettings>>>({} as Record<Platform, Partial<PlatformSettings>>);
  const [showAdvanced, setShowAdvanced] = useState(false);

  /**
   * Handle platform selection change
   */
  const handleSelectionChange = (platforms: Platform | Platform[]) => {
    if (Array.isArray(platforms)) {
      setSelectedPlatforms(platforms);
    } else {
      setSelectedPlatforms([platforms]);
    }
  };

  /**
   * Handle multi-platform toggle
   */
  const handleMultiPlatformToggle = (multiPlatform: boolean) => {
    setIsMultiPlatform(multiPlatform);
    if (!multiPlatform && selectedPlatforms.length > 1) {
      setSelectedPlatforms([selectedPlatforms[0]]);
    }
  };

  /**
   * Handle platform configuration change
   */
  const handleConfigChange = (platform: Platform, config: Partial<PlatformSettings>) => {
    setPlatformConfigs(prev => ({
      ...prev,
      [platform]: { ...prev[platform], ...config }
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    console.log('Selected platforms:', selectedPlatforms);
    console.log('Platform configs:', platformConfigs);
    console.log('Multi-platform mode:', isMultiPlatform);
  };

  const availablePlatforms = getAllPlatforms().map(p => p.id);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-claude-text mb-2">
          Platform Components Demo
        </h1>
        <p className="text-claude-text-secondary">
          Explore the platform selection and configuration components
        </p>
      </div>

      {/* Multi-Platform Toggle */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-claude-text">
            Multi-Platform Mode
          </h2>
        </CardHeader>
        <CardContent>
          <MultiPlatformToggle
            isMultiPlatform={isMultiPlatform}
            onToggle={handleMultiPlatformToggle}
            platforms={availablePlatforms}
            selectedPlatforms={selectedPlatforms}
            onSelectionChange={setSelectedPlatforms}
            showComparison={true}
          />
        </CardContent>
      </Card>

      {/* Platform Selector */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-claude-text">
            Platform Selection
          </h2>
        </CardHeader>
        <CardContent>
          <PlatformSelector
            selectedPlatforms={isMultiPlatform ? selectedPlatforms : selectedPlatforms[0]}
            onSelectionChange={handleSelectionChange}
            allowMultiple={isMultiPlatform}
            showDescriptions={true}
            showIcons={true}
          />
        </CardContent>
      </Card>

      {/* Platform Configuration */}
      {selectedPlatforms.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-claude-text">
                Platform Configuration
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PlatformConfig
              platforms={isMultiPlatform ? selectedPlatforms : selectedPlatforms[0]}
              values={platformConfigs}
              onConfigChange={handleConfigChange}
              showAdvanced={showAdvanced}
            />
          </CardContent>
        </Card>
      )}

      {/* Platform Information */}
      {selectedPlatforms.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-claude-text">
              Platform Information
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {isMultiPlatform ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedPlatforms.map((platform) => (
                    <PlatformInfo
                      key={platform}
                      platform={platform}
                      compact={true}
                    />
                  ))}
                </div>
              ) : (
                <PlatformInfo
                  platform={selectedPlatforms[0]}
                  showBestPractices={true}
                  showDimensions={true}
                  showCharacterLimits={true}
                  showHashtagRecommendations={true}
                  showSeoSettings={showAdvanced}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent>
          <div className="flex justify-center space-x-4">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={selectedPlatforms.length === 0}
            >
              Apply Settings
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedPlatforms(['youtube']);
                setIsMultiPlatform(false);
                setPlatformConfigs({} as Record<Platform, Partial<PlatformSettings>>);
                setShowAdvanced(false);
              }}
            >
              Reset Demo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current State Display */}
      <Card variant="outlined">
        <CardHeader>
          <h3 className="text-lg font-medium text-claude-text">Current State</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Multi-Platform Mode:</strong> {isMultiPlatform ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Selected Platforms:</strong> {selectedPlatforms.join(', ')}
            </div>
            <div>
              <strong>Advanced Settings:</strong> {showAdvanced ? 'Shown' : 'Hidden'}
            </div>
            <div>
              <strong>Custom Configurations:</strong> {Object.keys(platformConfigs).length} platforms configured
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformDemo;