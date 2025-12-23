/**
 * Select component
 * @fileoverview Reusable select component with multiple variants and states
 */

import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Select variant types
 */
export type SelectVariant = 'default' | 'filled' | 'outlined';
export type SelectSize = 'sm' | 'md' | 'lg';

/**
 * Select option interface
 */
export interface SelectOption {
  /** Option value */
  value: string;
  /** Option label */
  label: string;
  /** Option disabled state */
  disabled?: boolean;
  /** Option icon */
  icon?: React.ReactNode;
}

/**
 * Select component props
 */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Select variant style */
  variant?: SelectVariant;
  /** Select size */
  size?: SelectSize;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Options array */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Custom CSS class names */
  className?: string;
  /** Container custom CSS class names */
  containerClassName?: string;
}

/**
 * Base select styles
 */
const baseSelectStyles = [
  'w-full',
  'rounded-md',
  'font-medium',
  'transition-colors',
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed',
  'disabled:opacity-50',
  'appearance-none',
  'bg-no-repeat',
  'bg-right',
  'pr-10'
];

/**
 * Select variant styles
 */
const variantStyles: Record<SelectVariant, string[]> = {
  default: [
    'border',
    'border-claude-border',
    'bg-claude-bg',
    'text-claude-text',
    'focus-visible:ring-claude-accent',
    'focus:border-claude-accent',
    'bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")]'
  ],
  filled: [
    'border-0',
    'bg-claude-bg-secondary',
    'text-claude-text',
    'focus-visible:ring-claude-accent',
    'hover:bg-claude-bg-tertiary',
    'bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")]'
  ],
  outlined: [
    'border-2',
    'border-transparent',
    'bg-claude-bg',
    'text-claude-text',
    'focus-visible:ring-claude-accent',
    'focus:border-claude-accent',
    'bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")]'
  ]
};

/**
 * Select size styles
 */
const sizeStyles: Record<SelectSize, string[]> = {
  sm: ['h-8', 'px-3', 'text-sm', 'bg-[length:1rem]'],
  md: ['h-10', 'px-4', 'text-sm', 'bg-[length:1.25rem]'],
  lg: ['h-12', 'px-4', 'text-base', 'bg-[length:1.5rem]']
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
 * Select component
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    error = false, 
    errorMessage,
    label,
    helperText,
    options,
    placeholder,
    className,
    containerClassName,
    children,
    ...props 
  }, ref) => {
    const selectClasses = cn(
      ...baseSelectStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
      error && errorStyles,
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
          <select
            ref={ref}
            className={selectClasses}
            aria-invalid={error}
            aria-describedby={errorMessage ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.icon && `${option.icon} `}{option.label}
              </option>
            ))}
            {children}
          </select>
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

Select.displayName = 'Select';

export { Select };