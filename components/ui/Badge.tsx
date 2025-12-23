/**
 * Badge component
 * @fileoverview Reusable badge component for status indicators and labels
 */

import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Badge variant types
 */
export type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Badge component props
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Badge variant style */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Custom CSS class names */
  className?: string;
  /** Badge content */
  children: React.ReactNode;
}

/**
 * Base badge styles
 */
const baseBadgeStyles = [
  'inline-flex',
  'items-center',
  'justify-center',
  'rounded-full',
  'font-medium',
  'transition-colors'
];

/**
 * Badge variant styles
 */
const variantStyles: Record<BadgeVariant, string[]> = {
  default: [
    'bg-claude-accent',
    'text-white',
    'border-claude-accent'
  ],
  secondary: [
    'bg-claude-bg-secondary',
    'text-claude-text',
    'border-claude-border'
  ],
  success: [
    'bg-green-100',
    'text-green-800',
    'border-green-200'
  ],
  warning: [
    'bg-yellow-100',
    'text-yellow-800',
    'border-yellow-200'
  ],
  error: [
    'bg-red-100',
    'text-red-800',
    'border-red-200'
  ],
  info: [
    'bg-blue-100',
    'text-blue-800',
    'border-blue-200'
  ]
};

/**
 * Badge size styles
 */
const sizeStyles: Record<BadgeSize, string[]> = {
  sm: ['px-2', 'py-0.5', 'text-xs'],
  md: ['px-2.5', 'py-0.5', 'text-xs'],
  lg: ['px-3', 'py-1', 'text-sm']
};

/**
 * Badge component
 */
const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    className, 
    children, 
    ...props 
  }, ref) => {
    const classes = cn(
      ...baseBadgeStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
      className
    );

    return (
      <span ref={ref} className={classes} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };