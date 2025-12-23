/**
 * Thumbnail Preview Component
 * @fileoverview Component for displaying generated thumbnails with platform-specific preview
 */

import React, { useState } from 'react';
import { Platform } from '@/types/platforms';
import { getPlatformConfig } from '@/lib/platforms';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  Badge,
  Select
} from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * Generation result interface
 */
interface GenerationResult {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  thumbnailUrl?: string;
  imageUrl?: string;
  prompt: string;
  error?: string;
  createdAt: string;
}

/**
 * Thumbnail Preview component props
 */
interface ThumbnailPreviewProps {
  /** Current generation result */
  generation: GenerationResult | null;
  /** Thumbnail dimensions */
  dimensions?: {
    width: number;
    height: number;
  };
  /** Target platform */
  platform: Platform;
  /** Loading state */
  isLoading?: boolean;
  /** Custom CSS class names */
  className?: string;
}

/**
 * Download options
 */
const downloadOptions = [
  { value: 'original', label: 'Original Size' },
  { value: 'thumbnail', label: 'Thumbnail Size' },
  { value: 'social', label: 'Social Media Size' },
  { value: 'print', label: 'Print Quality' }
];

/**
 * Overlay options
 */
interface OverlayOptions {
  showTitle: boolean;
  showSubtitle: boolean;
  showLogo: boolean;
  titleText: string;
  subtitleText: string;
  logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Thumbnail Preview component
 */
export default function ThumbnailPreview({
  generation,
  dimensions,
  platform,
  isLoading = false,
  className
}: ThumbnailPreviewProps) {
  const [downloadSize, setDownloadSize] = useState('original');
  const [showOverlays, setShowOverlays] = useState(false);
  const [overlayOptions, setOverlayOptions] = useState<OverlayOptions>({
    showTitle: false,
    showSubtitle: false,
    showLogo: false,
    titleText: '',
    subtitleText: '',
    logoPosition: 'bottom-right'
  });

  const platformConfig = getPlatformConfig(platform);
  const currentDimensions = dimensions || platformConfig.settings.dimensions;

  /**
   * Get status badge variant
   */
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'FAILED': return 'error';
      case 'PROCESSING': return 'warning';
      default: return 'secondary';
    }
  };

  /**
   * Handle download
   */
  const handleDownload = async () => {
    if (!generation?.thumbnailUrl) return;

    try {
      // Create download link
      const link = document.createElement('a');
      link.href = generation.thumbnailUrl;
      link.download = `thumbnail-${generation.id}-${downloadSize}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  /**
   * Handle share
   */
  const handleShare = async () => {
    if (!generation?.thumbnailUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Generated Thumbnail',
          text: 'Check out this AI-generated thumbnail!',
          url: generation.thumbnailUrl
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(generation.thumbnailUrl);
        alert('Thumbnail URL copied to clipboard!');
      } catch (error) {
        console.error('Clipboard error:', error);
      }
    }
  };

  /**
   * Handle overlay option change
   */
  const handleOverlayChange = (option: keyof OverlayOptions, value: any) => {
    setOverlayOptions(prev => ({ ...prev, [option]: value }));
  };

  /**
   * Get preview container style
   */
  const getPreviewStyle = () => {
    if (!currentDimensions) return {};

    const aspectRatio = currentDimensions.width / currentDimensions.height;
    const maxWidth = 300;
    const width = Math.min(maxWidth, currentDimensions.width);
    const height = width / aspectRatio;

    return {
      width: `${width}px`,
      height: `${height}px`,
      maxWidth: '100%'
    };
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-claude-text">
            Preview
          </h3>
          {generation && (
            <Badge variant={getStatusVariant(generation.status)}>
              {generation.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Preview Image */}
        <div className="flex justify-center">
          <div 
            className="relative bg-claude-bg-secondary rounded-lg overflow-hidden border border-claude-border"
            style={getPreviewStyle()}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-claude-bg/80">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-claude-accent"></div>
              </div>
            )}
            
            {generation?.thumbnailUrl ? (
              <img
                src={generation.thumbnailUrl}
                alt="Generated thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {platformConfig.icon}
                  </div>
                  <p className="text-sm text-claude-text-secondary">
                    {generation?.status === 'FAILED' 
                      ? generation.error || 'Generation failed'
                      : 'No thumbnail generated yet'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Overlay Preview */}
            {showOverlays && generation?.thumbnailUrl && (
              <div className="absolute inset-0 pointer-events-none">
                {overlayOptions.showTitle && overlayOptions.titleText && (
                  <div className="absolute top-4 left-4 right-4">
                    <div className="bg-black/75 text-white px-3 py-2 rounded text-center font-bold">
                      {overlayOptions.titleText}
                    </div>
                  </div>
                )}
                
                {overlayOptions.showSubtitle && overlayOptions.subtitleText && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/75 text-white px-3 py-2 rounded text-center text-sm">
                      {overlayOptions.subtitleText}
                    </div>
                  </div>
                )}
                
                {overlayOptions.showLogo && (
                  <div className={cn(
                    'absolute w-12 h-12 bg-claude-accent rounded flex items-center justify-center text-white font-bold',
                    overlayOptions.logoPosition === 'top-left' && 'top-4 left-4',
                    overlayOptions.logoPosition === 'top-right' && 'top-4 right-4',
                    overlayOptions.logoPosition === 'bottom-left' && 'bottom-4 left-4',
                    overlayOptions.logoPosition === 'bottom-right' && 'bottom-4 right-4'
                  )}>
                    BV
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dimensions Info */}
        {currentDimensions && (
          <div className="text-center text-sm text-claude-text-secondary">
            {currentDimensions.width} × {currentDimensions.height} pixels
            <span className="ml-2">
              ({platformConfig.settings.dimensions?.aspectRatio})
            </span>
          </div>
        )}

        {/* Download Options */}
        {generation?.thumbnailUrl && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Select
                value={downloadSize}
                onChange={(e) => setDownloadSize(e.target.value)}
                options={downloadOptions}
                size="sm"
                className="flex-1"
              />
              <Button
                onClick={handleDownload}
                size="sm"
                disabled={!generation.thumbnailUrl}
              >
                Download
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                disabled={!generation.thumbnailUrl}
                className="flex-1"
              >
                Share
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOverlays(!showOverlays)}
                className="flex-1"
              >
                {showOverlays ? 'Hide' : 'Show'} Overlays
              </Button>
            </div>
          </div>
        )}

        {/* Overlay Options */}
        {showOverlays && (
          <div className="space-y-3 p-4 bg-claude-bg-secondary rounded-lg">
            <h4 className="text-sm font-medium text-claude-text mb-3">
              Overlay Options
            </h4>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={overlayOptions.showTitle}
                  onChange={(e) => handleOverlayChange('showTitle', e.target.checked)}
                  className="rounded border-claude-border text-claude-accent focus:ring-claude-accent"
                />
                <span className="text-sm text-claude-text">Show Title</span>
              </label>
              
              {overlayOptions.showTitle && (
                <input
                  type="text"
                  value={overlayOptions.titleText}
                  onChange={(e) => handleOverlayChange('titleText', e.target.value)}
                  placeholder="Enter title text"
                  className="w-full px-3 py-2 border border-claude-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-claude-accent"
                />
              )}
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={overlayOptions.showSubtitle}
                  onChange={(e) => handleOverlayChange('showSubtitle', e.target.checked)}
                  className="rounded border-claude-border text-claude-accent focus:ring-claude-accent"
                />
                <span className="text-sm text-claude-text">Show Subtitle</span>
              </label>
              
              {overlayOptions.showSubtitle && (
                <input
                  type="text"
                  value={overlayOptions.subtitleText}
                  onChange={(e) => handleOverlayChange('subtitleText', e.target.value)}
                  placeholder="Enter subtitle text"
                  className="w-full px-3 py-2 border border-claude-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-claude-accent"
                />
              )}
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={overlayOptions.showLogo}
                  onChange={(e) => handleOverlayChange('showLogo', e.target.checked)}
                  className="rounded border-claude-border text-claude-accent focus:ring-claude-accent"
                />
                <span className="text-sm text-claude-text">Show Logo</span>
              </label>
              
              {overlayOptions.showLogo && (
                <Select
                  value={overlayOptions.logoPosition}
                  onChange={(e) => handleOverlayChange('logoPosition', e.target.value)}
                  options={[
                    { value: 'top-left', label: 'Top Left' },
                    { value: 'top-right', label: 'Top Right' },
                    { value: 'bottom-left', label: 'Bottom Left' },
                    { value: 'bottom-right', label: 'Bottom Right' }
                  ]}
                  size="sm"
                />
              )}
            </div>
          </div>
        )}

        {/* Generation Info */}
        {generation && (
          <div className="text-xs text-claude-text-tertiary space-y-1">
            <div>ID: {generation.id}</div>
            <div>Created: {new Date(generation.createdAt).toLocaleString()}</div>
            {generation.error && (
              <div className="text-red-600">Error: {generation.error}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}