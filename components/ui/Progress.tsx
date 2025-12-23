/**
 * Progress component
 * @fileoverview Reusable progress indicator component with multiple variants
 */

import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Progress variant types
 */
export type ProgressVariant = 'default' | 'success' | 'warning' | 'error';
export type ProgressSize = 'sm' | 'md' | 'lg';

/**
 * Progress component props
 */
export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Progress value (0-100) */
  value?: number;
  /** Maximum value */
  max?: number;
  /** Progress variant style */
  variant?: ProgressVariant;
  /** Progress size */
  size?: ProgressSize;
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label */
  label?: string;
  /** Animated progress */
  animated?: boolean;
  /** Striped progress */
  striped?: boolean;
  /** Indeterminate state */
  indeterminate?: boolean;
  /** Custom CSS class names */
  className?: string;
  /** Container custom CSS class names */
  containerClassName?: string;
}

/**
 * Base progress container styles
 */
const baseProgressContainerStyles = [
  'w-full',
  'flex',
  'flex-col',
  'space-y-2'
];

/**
 * Base progress bar styles
 */
const baseProgressStyles = [
  'w-full',
  'bg-claude-bg-secondary',
  'rounded-full',
  'overflow-hidden',
  'relative'
];

/**
 * Progress variant styles
 */
const variantStyles: Record<ProgressVariant, string[]> = {
  default: ['bg-claude-accent'],
  success: ['bg-green-500'],
  warning: ['bg-yellow-500'],
  error: ['bg-red-500']
};

/**
 * Progress size styles
 */
const sizeStyles: Record<ProgressSize, { container: string[]; bar: string[] }> = {
  sm: {
    container: ['text-xs'],
    bar: ['h-1']
  },
  md: {
    container: ['text-sm'],
    bar: ['h-2']
  },
  lg: {
    container: ['text-base'],
    bar: ['h-3']
  }
};

/**
 * Animation styles
 */
const animationStyles = {
  animated: [
    'transition-all',
    'duration-300',
    'ease-in-out'
  ],
  striped: [
    'bg-gradient-to-r',
    'from-transparent',
    'via-white/20',
    'to-transparent',
    'bg-[length:1rem_1rem]'
  ],
  indeterminate: [
    'animate-pulse'
  ]
};

/**
 * Progress component
 */
const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    value = 0,
    max = 100,
    variant = 'default',
    size = 'md',
    showLabel = false,
    label,
    animated = true,
    striped = false,
    indeterminate = false,
    className,
    containerClassName,
    ...props 
  }, ref) => {
    // Calculate percentage
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    // Generate label
    const progressLabel = label || `${Math.round(percentage)}%`;
    
    // Progress bar classes
    const progressBarClasses = cn(
      ...baseProgressStyles,
      ...sizeStyles[size].bar,
      className
    );
    
    // Progress fill classes
    const progressFillClasses = cn(
      'h-full',
      'rounded-full',
      ...variantStyles[variant],
      animated && animationStyles.animated,
      striped && animationStyles.striped,
      indeterminate && animationStyles.indeterminate,
      indeterminate && 'w-1/3'
    );
    
    // Container classes
    const containerClasses = cn(
      ...baseProgressContainerStyles,
      ...sizeStyles[size].container,
      containerClassName
    );
    
    return (
      <div className={containerClasses} ref={ref} {...props}>
        {/* Label */}
        {showLabel && (
          <div className="flex justify-between items-center">
            <span className="font-medium text-claude-text">
              {label || 'Progress'}
            </span>
            <span className="font-medium text-claude-text-secondary">
              {progressLabel}
            </span>
          </div>
        )}
        
        {/* Progress bar */}
        <div className={progressBarClasses}>
          <div
            className={progressFillClasses}
            style={{
              width: indeterminate ? undefined : `${percentage}%`
            }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={label || 'Progress'}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };