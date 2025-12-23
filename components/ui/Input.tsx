/**
 * Input component
 * @fileoverview Reusable input component with multiple variants and states
 */

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Input variant types
 */
export type InputVariant = 'default' | 'filled' | 'outlined';
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * Input component props
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input variant style */
  variant?: InputVariant;
  /** Input size */
  size?: InputSize;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Custom CSS class names */
  className?: string;
  /** Container custom CSS class names */
  containerClassName?: string;
}

/**
 * Base input styles
 */
const baseInputStyles = [
  'w-full',
  'rounded-md',
  'font-medium',
  'transition-colors',
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed',
  'disabled:opacity-50',
  'placeholder-claude-text-tertiary'
];

/**
 * Input variant styles
 */
const variantStyles: Record<InputVariant, string[]> = {
  default: [
    'border',
    'border-claude-border',
    'bg-claude-bg',
    'text-claude-text',
    'focus-visible:ring-claude-accent',
    'focus:border-claude-accent'
  ],
  filled: [
    'border-0',
    'bg-claude-bg-secondary',
    'text-claude-text',
    'focus-visible:ring-claude-accent',
    'hover:bg-claude-bg-tertiary'
  ],
  outlined: [
    'border-2',
    'border-transparent',
    'bg-claude-bg',
    'text-claude-text',
    'focus-visible:ring-claude-accent',
    'focus:border-claude-accent'
  ]
};

/**
 * Input size styles
 */
const sizeStyles: Record<InputSize, string[]> = {
  sm: ['h-8', 'px-3', 'text-sm'],
  md: ['h-10', 'px-4', 'text-sm'],
  lg: ['h-12', 'px-4', 'text-base']
};

/**
 * Error styles
 */
const errorStyles = [
  'border-red-500',
  'focus-visible:ring-red-500',
  'focus:border-red-500',
  'text-red-900'
];

/**
 * Input component
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    error = false, 
    errorMessage,
    label,
    helperText,
    leftIcon,
    rightIcon,
    className,
    containerClassName,
    ...props 
  }, ref) => {
    const inputClasses = cn(
      ...baseInputStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
      error && errorStyles,
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      className
    );

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-claude-text mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-claude-text-tertiary">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={inputClasses}
            aria-invalid={error}
            aria-describedby={errorMessage ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-claude-text-tertiary">
              {rightIcon}
            </div>
          )}
        </div>
        {errorMessage && (
          <p id={`${props.id}-error`} className="mt-1 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
        {helperText && !errorMessage && (
          <p id={`${props.id}-helper`} className="mt-1 text-sm text-claude-text-tertiary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };