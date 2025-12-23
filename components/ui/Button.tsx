/**
 * Button component
 * @fileoverview Reusable button component with multiple variants and states
 */

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button component props
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant style */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom CSS class names */
  className?: string;
  /** Button content */
  children: React.ReactNode;
}

/**
 * Base button styles
 */
const baseButtonStyles = [
  'inline-flex',
  'items-center',
  'justify-center',
  'rounded-md',
  'font-medium',
  'transition-colors',
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-offset-2',
  'disabled:pointer-events-none',
  'disabled:opacity-50',
  'relative',
  'overflow-hidden'
];

/**
 * Button variant styles
 */
const variantStyles: Record<ButtonVariant, string[]> = {
  primary: [
    'bg-claude-accent',
    'text-white',
    'hover:bg-claude-accent-hover',
    'focus-visible:ring-claude-accent'
  ],
  secondary: [
    'bg-claude-bg-secondary',
    'text-claude-text',
    'hover:bg-claude-bg-tertiary',
    'focus-visible:ring-claude-border'
  ],
  outline: [
    'border',
    'border-claude-border',
    'bg-transparent',
    'text-claude-text',
    'hover:bg-claude-bg-secondary',
    'focus-visible:ring-claude-border'
  ],
  ghost: [
    'bg-transparent',
    'text-claude-text',
    'hover:bg-claude-bg-secondary',
    'focus-visible:ring-claude-border'
  ],
  destructive: [
    'bg-red-600',
    'text-white',
    'hover:bg-red-700',
    'focus-visible:ring-red-600'
  ]
};

/**
 * Button size styles
 */
const sizeStyles: Record<ButtonSize, string[]> = {
  sm: ['h-8', 'px-3', 'text-sm'],
  md: ['h-10', 'px-4', 'text-sm'],
  lg: ['h-12', 'px-6', 'text-base']
};

/**
 * Button component
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled = false, 
    className, 
    children, 
    ...props 
  }, ref) => {
    const classes = cn(
      ...baseButtonStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
      className
    );

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };