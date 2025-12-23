/**
 * Card component
 * @fileoverview Reusable card component with multiple variants and states
 */

import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Card variant types
 */
export type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled';
export type CardSize = 'sm' | 'md' | 'lg';

/**
 * Card component props
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card variant style */
  variant?: CardVariant;
  /** Card size */
  size?: CardSize;
  /** Hover effect */
  hoverable?: boolean;
  /** Custom CSS class names */
  className?: string;
  /** Card content */
  children: React.ReactNode;
}

/**
 * Card header component props */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Custom CSS class names */
  className?: string;
  /** Header content */
  children: React.ReactNode;
}

/**
 * Card content component props */
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Custom CSS class names */
  className?: string;
  /** Content */
  children: React.ReactNode;
}

/**
 * Card footer component props */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Custom CSS class names */
  className?: string;
  /** Footer content */
  children: React.ReactNode;
}

/**
 * Base card styles
 */
const baseCardStyles = [
  'rounded-lg',
  'transition-all',
  'duration-200'
];

/**
 * Card variant styles
 */
const variantStyles: Record<CardVariant, string[]> = {
  default: [
    'border',
    'border-claude-border',
    'bg-claude-bg'
  ],
  outlined: [
    'border-2',
    'border-claude-border',
    'bg-claude-bg'
  ],
  elevated: [
    'border',
    'border-claude-border',
    'bg-claude-bg',
    'shadow-md',
    'hover:shadow-lg'
  ],
  filled: [
    'border-0',
    'bg-claude-bg-secondary'
  ]
};

/**
 * Card size styles
 */
const sizeStyles: Record<CardSize, string[]> = {
  sm: ['p-4'],
  md: ['p-6'],
  lg: ['p-8']
};

/**
 * Hover styles
 */
const hoverStyles = [
  'hover:border-claude-accent',
  'hover:shadow-md',
  'cursor-pointer'
];

/**
 * Card component
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    hoverable = false, 
    className, 
    children, 
    ...props 
  }, ref) => {
    const classes = cn(
      ...baseCardStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
      hoverable && hoverStyles,
      className
    );

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card header component
 */
const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mb-4 last:mb-0', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * Card content component
 */
const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('text-claude-text', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

/**
 * Card footer component
 */
const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mt-4 pt-4 border-t border-claude-border', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };