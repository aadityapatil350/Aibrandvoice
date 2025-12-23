/**
 * Template Gallery Component
 * @fileoverview Component for browsing and selecting thumbnail templates
 */

import React, { useState, useEffect } from 'react';
import { Platform } from '@/types/platforms';
import { getPlatformConfig } from '@/lib/platforms';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  Input, 
  Badge,
  Select
} from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * Template interface
 */
interface Template {
  id: string;
  name: string;
  platform: Platform;
  dimensions: {
    width: number;
    height: number;
  };
  overlays: any[];
  isDefault: boolean;
  isActive: boolean;
  previewUrl?: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Template Gallery component props
 */
interface TemplateGalleryProps {
  /** Selected platform for filtering */
  platform: Platform;
  /** Callback when template is selected */
  onSelect: (templateId: string, template: Template) => void;
  /** Callback when gallery is closed */
  onClose: () => void;
  /** Custom CSS class names */
  className?: string;
}

/**
 * Category options
 */
const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'business', label: 'Business' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'technology', label: 'Technology' },
  { value: 'travel', label: 'Travel' }
];

/**
 * Sort options
 */
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'popular', label: 'Most Popular' }
];

/**
 * Template Gallery component
 */
export default function TemplateGallery({
  platform,
  onSelect,
  onClose,
  className
}: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  /**
   * Fetch templates from API
   */
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ai/thumbnail/templates', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch templates');
      }

      setTemplates(result.templates || []);
    } catch (error) {
      console.error('Templates fetch error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter and sort templates
   */
  useEffect(() => {
    let filtered = templates;

    // Filter by platform
    filtered = filtered.filter(template =>
      template.platform === platform
    );

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popular':
          return (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0);
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  }, [templates, platform, searchTerm, selectedCategory, sortBy]);

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  /**
   * Handle template selection
   */
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  /**
   * Handle template confirmation
   */
  const handleConfirmSelection = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate.id, selectedTemplate);
    }
  };

  /**
   * Get template preview URL
   */
  const getTemplatePreviewUrl = (template: Template) => {
    if (template.previewUrl) {
      return template.previewUrl;
    }
    
    // Generate placeholder URL based on template dimensions
    const { width, height } = template.dimensions;
    return `https://picsum.photos/seed/${template.id}/${width}/${height}.jpg`;
  };

  const platformConfig = getPlatformConfig(platform);

  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center bg-black/50', className)}>
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-claude-border">
          <div>
            <h2 className="text-2xl font-bold text-claude-text">
              Template Gallery
            </h2>
            <p className="text-claude-text-secondary">
              Choose a template for your {platformConfig.name} thumbnail
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-claude-border bg-claude-bg-secondary">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={categoryOptions}
              className="lg:w-48"
            />
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={sortOptions}
              className="lg:w-48"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-claude-accent"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">{error}</div>
              <Button onClick={fetchTemplates}>Try Again</Button>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-claude-text-secondary">
                No templates found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-lg',
                    selectedTemplate?.id === template.id && 'ring-2 ring-claude-accent'
                  )}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardContent className="p-4">
                    {/* Template Preview */}
                    <div className="aspect-video bg-claude-bg-secondary rounded-lg mb-3 overflow-hidden">
                      <img
                        src={getTemplatePreviewUrl(template)}
                        alt={template.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to colored placeholder on error
                          e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial' font-size='14'%3E${template.name}%3C/text%3E%3C/svg%3E`;
                        }}
                      />
                    </div>
                    
                    {/* Template Info */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-claude-text line-clamp-1">
                          {template.name}
                        </h3>
                        {template.isDefault && (
                          <Badge variant="secondary" size="sm">
                            Default
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-claude-text-secondary">
                        <span>{template.dimensions.width}×{template.dimensions.height}</span>
                        <span>•</span>
                        <span>{template.category}</span>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" size="sm">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="secondary" size="sm">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-claude-border bg-claude-bg">
          <div className="text-sm text-claude-text-secondary">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSelection}
              disabled={!selectedTemplate}
            >
              Use Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}