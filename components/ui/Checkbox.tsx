/**
 * Checkbox component
 * @fileoverview Reusable checkbox component with multiple states
 */

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Checkbox component props
 */
export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Custom CSS class names */
  className?: string;
  /** Container custom CSS class names */
  containerClassName?: string;
  /** Indeterminate state */
  indeterminate?: boolean;
}

/**
 * Checkbox component
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    label,
    helperText,
    error = false,
    errorMessage,
    className,
    containerClassName,
    indeterminate = false,
    checked,
    ...props 
  }, ref) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);
    
    // Handle indeterminate state
    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    // Merge refs
    const mergedRef = React.useCallback(
      (node: HTMLInputElement) => {
        checkboxRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    const checkboxClasses = cn(
      'h-4',
      'w-4',
      'rounded',
      'border-claude-border',
      'text-claude-accent',
      'focus:ring-claude-accent',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50',
      error && 'border-red-500 focus:ring-red-500',
      className
    );

    const containerClasses = cn(
      'flex',
      'items-start',
      containerClassName
    );

    return (
      <div className={containerClasses}>
        <input
          ref={mergedRef}
          type="checkbox"
          className={checkboxClasses}
          aria-invalid={error}
          aria-describedby={
            errorMessage 
              ? `${props.id}-error` 
              : helperText 
                ? `${props.id}-helper` 
                : undefined
          }
          checked={indeterminate ? false : checked}
          {...props}
        />
        {(label || helperText || errorMessage) && (
          <div className="ml-2">
            {label && (
              <label 
                htmlFor={props.id}
                className={cn(
                  'text-sm',
                  'font-medium',
                  'text-claude-text',
                  error && 'text-red-900'
                )}
              >
                {label}
              </label>
            )}
            {helperText && !errorMessage && (
              <p id={`${props.id}-helper`} className="text-sm text-claude-text-tertiary mt-1">
                {helperText}
              </p>
            )}
            {errorMessage && (
              <p id={`${props.id}-error`} className="text-sm text-red-600 mt-1">
                {errorMessage}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };