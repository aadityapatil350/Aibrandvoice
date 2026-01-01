/**
 * Thumbnail Generator Component
 * @fileoverview Main component for the AI Thumbnail Generator tool
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { Platform } from '@/types/platforms';
import { getPlatformConfig } from '@/lib/platforms';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  Input, 
  Textarea, 
  Select, 
  Badge,
  Progress
} from '@/components/ui';
import { PlatformSelector } from '@/components/tools/platforms';
import ThumbnailPreview from './ThumbnailPreview';
import TemplateGallery from './TemplateGallery';
import GenerationProgress from './GenerationProgress';

/**
 * Thumbnail generation form data interface
 */
interface ThumbnailFormData {
  platform: Platform;
  contentType: string;
  title: string;
  description: string;
  style: string;
  targetAudience: string;
  keywords: string;
  templateId?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

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
 * Content type options
 */
const contentTypeOptions = [
  { value: 'video', label: 'Video' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'social', label: 'Social Media Post' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'review', label: 'Review' },
  { value: 'news', label: 'News Article' }
];

/**
 * Style options
 */
const styleOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'bold', label: 'Bold & Eye-catching' },
  { value: 'minimal', label: 'Minimalist' },
  { value: 'creative', label: 'Creative' },
  { value: 'educational', label: 'Educational' }
];

/**
 * Thumbnail Generator component
 */
export default function ThumbnailGenerator() {
  const [formData, setFormData] = useState<ThumbnailFormData>({
    platform: 'youtube',
    contentType: 'video',
    title: '',
    description: '',
    style: 'professional',
    targetAudience: '',
    keywords: '',
    dimensions: undefined
  });

  const [currentGeneration, setCurrentGeneration] = useState<GenerationResult | null>(null);
  const [generations, setGenerations] = useState<GenerationResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  /**
   * Handle form field changes
   */
  const handleFieldChange = useCallback((field: keyof ThumbnailFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Handle platform change
   */
  const handlePlatformChange = useCallback((platform: Platform) => {
    const platformConfig = getPlatformConfig(platform);
    setFormData(prev => ({
      ...prev,
      platform,
      dimensions: platformConfig.settings.dimensions
    }));
  }, []);

  /**
   * Handle template selection
   */
  const handleTemplateSelect = useCallback((templateId: string, template: any) => {
    setFormData(prev => ({
      ...prev,
      templateId,
      dimensions: template.dimensions
    }));
    setShowTemplateGallery(false);
  }, []);

  /**
   * Validate form
   */
  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) {
      errors.push('Title is required');
    }
    
    if (formData.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }
    
    if (formData.description && formData.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }
    
    return errors;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      alert(`Please fix the following errors:\n${errors.join('\n')}`);
      return;
    }

    setIsGenerating(true);
    setShowProgress(true);

    try {
      const response = await fetch('/api/ai/thumbnail/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: formData.platform.toUpperCase(),
          contentType: formData.contentType,
          title: formData.title,
          description: formData.description,
          style: formData.style,
          targetAudience: formData.targetAudience,
          keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
          templateId: formData.templateId,
          dimensions: formData.dimensions
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate thumbnail');
      }

      const newGeneration: GenerationResult = {
        id: result.generationId,
        status: result.status,
        prompt: result.prompt,
        createdAt: new Date().toISOString()
      };

      setCurrentGeneration(newGeneration);
      setGenerations(prev => [newGeneration, ...prev.slice(0, 9)]); // Keep last 10

      // Start polling for status
      pollGenerationStatus(result.generationId);

    } catch (error) {
      console.error('Generation error:', error);
      const errorGeneration: GenerationResult = {
        id: `error-${Date.now()}`,
        status: 'FAILED',
        prompt: formData.title,
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date().toISOString()
      };
      setCurrentGeneration(errorGeneration);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Poll generation status
   */
  const pollGenerationStatus = async (generationId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/ai/thumbnail/status/${generationId}`);
        const result = await response.json();

        if (response.ok && result.success) {
          const generation = result.generation;
          
          setCurrentGeneration(prev => prev ? { ...prev, ...generation } : null);
          setGenerations(prev => 
            prev.map(g => g.id === generationId ? { ...g, ...generation } : g)
          );

          if (generation.status === 'COMPLETED' || generation.status === 'FAILED') {
            clearInterval(pollInterval);
            setShowProgress(false);
          }
        }
      } catch (error) {
        console.error('Status polling error:', error);
        clearInterval(pollInterval);
      }
    }, 2000);

    // Clean up after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setShowProgress(false);
    }, 120000);
  };

  /**
   * Handle form reset
   */
  const handleReset = () => {
    setFormData({
      platform: 'youtube',
      contentType: 'video',
      title: '',
      description: '',
      style: 'professional',
      targetAudience: '',
      keywords: '',
      dimensions: getPlatformConfig('youtube').settings.dimensions
    });
    setCurrentGeneration(null);
  };

  const platformConfig = getPlatformConfig(formData.platform);
  const currentDimensions = formData.dimensions || platformConfig.settings.dimensions;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-claude-text">
                Create Your Thumbnail
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Platform Selection */}
                <div>
                  <label className="block text-sm font-medium text-claude-text mb-2">
                    Platform
                  </label>
                  <PlatformSelector
                    selectedPlatforms={formData.platform}
                    onSelectionChange={(platform) => handlePlatformChange(platform as Platform)}
                    allowMultiple={false}
                    showIcons={true}
                    showDescriptions={true}
                  />
                </div>

                {/* Content Type */}
                <div>
                  <Select
                    label="Content Type"
                    value={formData.contentType}
                    onChange={(e) => handleFieldChange('contentType', e.target.value)}
                    options={contentTypeOptions}
                    disabled={isGenerating}
                  />
                </div>

                {/* Title */}
                <div>
                  <Input
                    label="Title"
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="Enter your content title"
                    maxLength={200}
                    disabled={isGenerating}
                    required
                  />
                  <div className="mt-1 text-xs text-claude-text-tertiary text-right">
                    {formData.title.length}/200
                  </div>
                </div>

                {/* Description */}
                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Brief description of your content"
                  maxLength={1000}
                  showCharacterCount={true}
                  rows={3}
                  disabled={isGenerating}
                />

                {/* Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Style"
                    value={formData.style}
                    onChange={(e) => handleFieldChange('style', e.target.value)}
                    options={styleOptions}
                    disabled={isGenerating}
                  />

                  <div>
                    <Input
                      label="Target Audience"
                      value={formData.targetAudience}
                      onChange={(e) => handleFieldChange('targetAudience', e.target.value)}
                      placeholder="e.g., Content creators, Developers"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                {/* Keywords */}
                <Input
                  label="Keywords"
                  value={formData.keywords}
                  onChange={(e) => handleFieldChange('keywords', e.target.value)}
                  placeholder="Enter keywords separated by commas"
                  helperText="Add relevant keywords to improve generation quality"
                  disabled={isGenerating}
                />

                {/* Dimensions Display */}
                <div className="flex items-center space-x-4 p-4 bg-claude-bg-secondary rounded-lg">
                  <div>
                    <span className="text-sm text-claude-text-secondary">Dimensions:</span>
                    <div className="font-medium text-claude-text">
                      {currentDimensions?.width} × {currentDimensions?.height}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {platformConfig.settings.dimensions?.aspectRatio || '16:9'}
                  </Badge>
                  <div className="ml-auto">
                    <Badge variant="default">
                      {platformConfig.icon} {platformConfig.name}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    loading={isGenerating}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Thumbnail'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTemplateGallery(true)}
                    disabled={isGenerating}
                  >
                    Browse Templates
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleReset}
                    disabled={isGenerating}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview and History Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <ThumbnailPreview
            generation={currentGeneration}
            dimensions={currentDimensions}
            platform={formData.platform}
            isLoading={isGenerating}
          />

          {/* Recent Generations */}
          {generations.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-claude-text">
                  Recent Generations
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generations.slice(0, 5).map((generation) => (
                    <div
                      key={generation.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-claude-bg-secondary cursor-pointer"
                      onClick={() => setCurrentGeneration(generation)}
                    >
                      <div className="flex-shrink-0">
                        {generation.thumbnailUrl ? (
                          <img
                            src={generation.thumbnailUrl}
                            alt={generation.prompt}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-claude-bg-tertiary rounded flex items-center justify-center">
                            <span className="text-claude-text-tertiary text-xs">
                              {generation.status === 'FAILED' ? '✗' : '⏳'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-claude-text truncate">
                          {generation.prompt}
                        </p>
                        <p className="text-xs text-claude-text-secondary">
                          {new Date(generation.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          generation.status === 'COMPLETED' ? 'success' :
                          generation.status === 'FAILED' ? 'error' :
                          generation.status === 'PROCESSING' ? 'warning' : 'secondary'
                        }
                        size="sm"
                      >
                        {generation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Template Gallery Modal */}
      {showTemplateGallery && (
        <TemplateGallery
          platform={formData.platform}
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplateGallery(false)}
        />
      )}

      {/* Generation Progress Modal */}
      {showProgress && currentGeneration && (
        <GenerationProgress
          generation={currentGeneration}
          onClose={() => setShowProgress(false)}
        />
      )}
    </div>
  );
}