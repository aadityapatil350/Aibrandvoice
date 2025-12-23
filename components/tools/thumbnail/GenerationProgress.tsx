/**
 * Generation Progress Component
 * @fileoverview Component for tracking real-time generation status
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  Badge,
  Progress
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
  progress?: number;
}

/**
 * Generation Progress component props
 */
interface GenerationProgressProps {
  /** Current generation result */
  generation: GenerationResult;
  /** Callback when progress is closed */
  onClose: () => void;
  /** Custom CSS class names */
  className?: string;
}

/**
 * Status messages
 */
const statusMessages = {
  PENDING: 'Your thumbnail is being prepared...',
  PROCESSING: 'AI is generating your thumbnail...',
  COMPLETED: 'Thumbnail generated successfully!',
  FAILED: 'Generation failed. Please try again.'
};

/**
 * Status colors
 */
const statusColors = {
  PENDING: 'secondary',
  PROCESSING: 'warning',
  COMPLETED: 'success',
  FAILED: 'error'
} as const;

/**
 * Estimated time by status
 */
const estimatedTimes = {
  PENDING: 2,
  PROCESSING: 5,
  COMPLETED: 0,
  FAILED: 0
};

/**
 * Generation Progress component
 */
export default function GenerationProgress({
  generation,
  onClose,
  className
}: GenerationProgressProps) {
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(5);
  const [elapsedTime, setElapsedTime] = useState(0);

  /**
   * Calculate progress based on status
   */
  useEffect(() => {
    switch (generation.status) {
      case 'PENDING':
        setProgress(10);
        break;
      case 'PROCESSING':
        setProgress(generation.progress || 50);
        break;
      case 'COMPLETED':
        setProgress(100);
        break;
      case 'FAILED':
        setProgress(0);
        break;
      default:
        setProgress(0);
    }
    
    setEstimatedTime(estimatedTimes[generation.status] || 0);
  }, [generation.status, generation.progress]);

  /**
   * Track elapsed time
   */
  useEffect(() => {
    if (generation.status === 'PENDING' || generation.status === 'PROCESSING') {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [generation.status]);

  /**
   * Handle retry
   */
  const handleRetry = () => {
    // This would trigger a retry of the generation
    // For now, just close the progress modal
    onClose();
  };

  /**
   * Handle save to history
   */
  const handleSaveToHistory = async () => {
    if (!generation.thumbnailUrl) return;

    try {
      const response = await fetch('/api/ai/thumbnail/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generationId: generation.id,
          title: generation.prompt,
          description: `Generated thumbnail with AI`,
          tags: ['ai-generated', 'thumbnail'],
          isPublic: false
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save thumbnail');
      }

      // Show success message
      alert('Thumbnail saved to your collection!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save thumbnail. Please try again.');
    }
  };

  /**
   * Format time display
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Get progress variant
   */
  const getProgressVariant = () => {
    switch (generation.status) {
      case 'COMPLETED': return 'success';
      case 'FAILED': return 'error';
      case 'PROCESSING': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center bg-black/50', className)}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-claude-text">
                Generating Thumbnail
              </h3>
              <Badge variant={statusColors[generation.status]}>
                {generation.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div>
              <Progress
                value={progress}
                max={100}
                variant={getProgressVariant()}
                showLabel={true}
                label="Progress"
                animated={generation.status === 'PROCESSING'}
              />
            </div>

            {/* Status Message */}
            <div className="text-center">
              <p className="text-claude-text font-medium">
                {statusMessages[generation.status]}
              </p>
              {generation.status === 'PROCESSING' && (
                <p className="text-sm text-claude-text-secondary mt-1">
                  Estimated time: {estimatedTime} seconds
                </p>
              )}
            </div>

            {/* Preview for completed/failed */}
            {(generation.status === 'COMPLETED' || generation.status === 'FAILED') && (
              <div className="space-y-4">
                {generation.thumbnailUrl ? (
                  <div className="aspect-video bg-claude-bg-secondary rounded-lg overflow-hidden">
                    <img
                      src={generation.thumbnailUrl}
                      alt="Generated thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-claude-bg-secondary rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">
                        {generation.status === 'FAILED' ? '❌' : '✅'}
                      </div>
                      <p className="text-sm text-claude-text-secondary">
                        {generation.error || 'No thumbnail available'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Details */}
            {generation.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {generation.error}
                </p>
              </div>
            )}

            {/* Generation Info */}
            <div className="text-xs text-claude-text-tertiary space-y-1">
              <div>Generation ID: {generation.id}</div>
              <div>Started: {new Date(generation.createdAt).toLocaleString()}</div>
              {elapsedTime > 0 && (
                <div>Elapsed time: {formatTime(elapsedTime)}</div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2">
              {generation.status === 'COMPLETED' && (
                <>
                  <Button
                    onClick={handleSaveToHistory}
                    className="w-full"
                  >
                    Save to Collection
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full"
                  >
                    Close
                  </Button>
                </>
              )}
              
              {generation.status === 'FAILED' && (
                <>
                  <Button
                    onClick={handleRetry}
                    className="w-full"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full"
                  >
                    Close
                  </Button>
                </>
              )}
              
              {(generation.status === 'PENDING' || generation.status === 'PROCESSING') && (
                <>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full"
                  >
                    Run in Background
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}