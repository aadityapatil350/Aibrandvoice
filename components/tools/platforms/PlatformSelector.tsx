/**
 * Platform Selector component
 * @fileoverview Dropdown/select component for choosing platforms with single and multiple selection modes
 */

import React, { useState, useEffect } from 'react';
import { Platform, PlatformSelectorProps } from '@/types/platforms';
import { getPlatformConfig, getAllPlatforms } from '@/lib/platforms';
import { Select, Checkbox, Badge, Card, CardContent } from '@/components/ui';

/**
 * Platform Selector component
 */
export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatforms,
  onSelectionChange,
  allowMultiple = false,
  showDescriptions = false,
  showIcons = true,
  className,
  disabled = false,
  loading = false,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const platforms = getAllPlatforms();

  /**
   * Filter platforms based on search term
   */
  const filteredPlatforms = platforms.filter(platform =>
    platform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    platform.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Handle single platform selection
   */
  const handleSingleSelect = (platform: Platform) => {
    onSelectionChange(platform);
    setIsOpen(false);
  };

  /**
   * Handle multiple platform selection
   */
  const handleMultipleSelect = (platform: Platform, checked: boolean) => {
    const currentSelection = Array.isArray(selectedPlatforms) ? selectedPlatforms : [selectedPlatforms].filter(Boolean);
    
    if (checked) {
      const newSelection = [...currentSelection, platform];
      onSelectionChange(newSelection);
    } else {
      const newSelection = currentSelection.filter(p => p !== platform);
      onSelectionChange(newSelection.length > 0 ? newSelection : [] as Platform[]);
    }
  };

  /**
   * Check if platform is selected
   */
  const isPlatformSelected = (platform: Platform): boolean => {
    if (Array.isArray(selectedPlatforms)) {
      return selectedPlatforms.includes(platform);
    }
    return selectedPlatforms === platform;
  };

  /**
   * Get selected platform names for display
   */
  const getSelectedDisplay = (): string => {
    if (Array.isArray(selectedPlatforms)) {
      if (selectedPlatforms.length === 0) return 'Select platforms';
      if (selectedPlatforms.length === 1) {
        return getPlatformConfig(selectedPlatforms[0]).name;
      }
      return `${selectedPlatforms.length} platforms selected`;
    }
    if (selectedPlatforms) {
      return getPlatformConfig(selectedPlatforms).name;
    }
    return 'Select platform';
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-claude-bg-secondary rounded w-1/4 mb-2"></div>
            <div className="h-8 bg-claude-bg-secondary rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-red-600 text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (allowMultiple) {
    // Multiple selection mode with checkboxes
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-claude-text">Select Platforms</h3>
              {Array.isArray(selectedPlatforms) && selectedPlatforms.length > 0 && (
                <Badge variant="secondary">
                  {selectedPlatforms.length} selected
                </Badge>
              )}
            </div>
            
            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search platforms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-claude-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-claude-accent focus:border-transparent"
                disabled={disabled}
              />
            </div>

            {/* Platform checkboxes */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredPlatforms.map((platform) => (
                <div key={platform.id} className="flex items-center space-x-3 p-2 rounded hover:bg-claude-bg-secondary">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={`platform-${platform.id}`}
                      checked={isPlatformSelected(platform.id)}
                      onChange={(e) => handleMultipleSelect(platform.id, e.target.checked)}
                      disabled={disabled}
                    />
                    <label
                      htmlFor={`platform-${platform.id}`}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      {showIcons && (
                        <span className="text-lg">{platform.icon}</span>
                      )}
                      <div>
                        <div className="font-medium">{platform.name}</div>
                        {showDescriptions && (
                          <div className="text-xs text-claude-text-secondary">
                            {platform.description}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected platforms display */}
            {Array.isArray(selectedPlatforms) && selectedPlatforms.length > 0 && (
              <div className="pt-2 border-t border-claude-border">
                <div className="text-xs text-claude-text-tertiary mb-2">Selected:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedPlatforms.map((platform) => {
                    const config = getPlatformConfig(platform);
                    return (
                      <Badge key={platform} variant="default" size="sm">
                        {showIcons && <span className="mr-1">{config.icon}</span>}
                        {config.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Single selection mode with dropdown
  return (
    <div className={className} onKeyDown={handleKeyDown}>
      <Select
        value={Array.isArray(selectedPlatforms) ? '' : (selectedPlatforms || '')}
        onChange={(e) => handleSingleSelect(e.target.value as Platform)}
        disabled={disabled}
        error={!!error}
        errorMessage={error}
        className="w-full"
        options={filteredPlatforms.map((platform) => ({
          value: platform.id,
          label: platform.name,
          icon: showIcons ? platform.icon : undefined
        }))}
        placeholder={getSelectedDisplay()}
      />

      {showDescriptions && !Array.isArray(selectedPlatforms) && selectedPlatforms && (
        <div className="mt-2 p-2 bg-claude-bg-secondary rounded text-sm text-claude-text-secondary">
          {getPlatformConfig(selectedPlatforms).description}
        </div>
      )}
    </div>
  );
};

export default PlatformSelector;