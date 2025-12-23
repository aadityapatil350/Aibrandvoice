/**
 * Textarea component
 * @fileoverview Reusable textarea component with multiple variants and states
 */

import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Textarea variant types
 */
export type TextareaVariant = 'default' | 'filled' | 'outlined';
export type TextareaSize = 'sm' | 'md' | 'lg';

/**
 * Textarea component props
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea variant style */
  variant?: TextareaVariant;
  /** Textarea size */
  size?: TextareaSize;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Show character count */
  showCharacterCount?: boolean;
  /** Maximum number of characters */
  maxLength?: number;
  /** Custom CSS class names */
  className?: string;
  /** Container custom CSS class names */
  containerClassName?: string;
  /** Resize behavior */
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

/**
 * Base textarea styles
 */
const baseTextareaStyles = [
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
 * Textarea variant styles
 */
const variantStyles: Record<TextareaVariant, string[]> = {
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
 * Textarea size styles
 */
const sizeStyles: Record<TextareaSize, string[]> = {
  sm: ['px-3', 'py-2', 'text-sm', 'min-h-[80px]'],
  md: ['px-4', 'py-3', 'text-sm', 'min-h-[120px]'],
  lg: ['px-4', 'py-4', 'text-base', 'min-h-[160px]']
};

/**
 * Resize styles
 */
const resizeStyles: Record<Required<TextareaProps>['resize'], string> = {
  none: 'resize-none',
  both: 'resize',
  horizontal: 'resize-x',
  vertical: 'resize-y'
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
 * Textarea component
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    error = false, 
    errorMessage,
    label,
    helperText,
    showCharacterCount = false,
    maxLength,
    className,
    containerClassName,
    resize = 'vertical',
    value,
    ...props 
  }, ref) => {
    const textareaClasses = cn(
      ...baseTextareaStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
      resizeStyles[resize],
      error && errorStyles,
      className
    );

    const characterCount = typeof value === 'string' ? value.length : 0;
    const isOverLimit = maxLength && characterCount > maxLength;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-claude-text mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            className={textareaClasses}
            aria-invalid={error}
            aria-describedby={errorMessage ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            maxLength={maxLength}
            value={value}
            {...props}
          />
        </div>
        
        {(errorMessage || helperText || showCharacterCount) && (
          <div className="flex justify-between items-start mt-1">
            <div className="flex-1">
              {errorMessage && (
                <p id={`${props.id}-error`} className="text-sm text-red-600">
                  {errorMessage}
                </p>
              )}
              {helperText && !errorMessage && (
                <p id={`${props.id}-helper`} className="text-sm text-claude-text-tertiary">
                  {helperText}
                </p>
              )}
            </div>
            
            {showCharacterCount && (
              <div className="ml-2 text-sm">
                <span className={cn(
                  isOverLimit ? 'text-red-600' : 'text-claude-text-tertiary'
                )}>
                  {characterCount}
                  {maxLength && `/${maxLength}`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };