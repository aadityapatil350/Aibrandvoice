'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface SlidingSidebarProps {
  /** Whether the sidebar is open */
  isOpen: boolean
  /** Callback when sidebar should close */
  onClose: () => void
  /** Sidebar content */
  children: React.ReactNode
  /** Position of the sidebar */
  position?: 'left' | 'right'
  /** Width of the sidebar (default: 400px) */
  width?: string
  /** Custom className */
  className?: string
  /** Overlay backdrop click closes sidebar */
  closeOnBackdropClick?: boolean
  /** Show backdrop overlay */
  showBackdrop?: boolean
}

export function SlidingSidebar({
  isOpen,
  onClose,
  children,
  position = 'right',
  width = '400px',
  className,
  closeOnBackdropClick = true,
  showBackdrop = true,
}: SlidingSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (
      closeOnBackdropClick &&
      sidebarRef.current &&
      !sidebarRef.current.contains(e.target as Node)
    ) {
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      {showBackdrop && (
        <div
          className={cn(
            'fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ease-out',
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          'fixed top-0 h-full bg-white shadow-2xl z-50',
          'transition-transform duration-300 ease-out',
          position === 'right' ? 'right-0' : 'left-0',
          isOpen
            ? position === 'right'
              ? 'translate-x-0'
              : 'translate-x-0'
            : position === 'right'
            ? 'translate-x-full'
            : '-translate-x-full',
          className
        )}
        style={{ width }}
      >
        {/* Scrollable content area */}
        <div className="h-full overflow-y-auto overscroll-contain">
          {children}
        </div>

        {/* Close button (fixed at top right) */}
        <button
          onClick={onClose}
          className={cn(
            'absolute top-4 z-10 p-2 rounded-lg',
            'transition-all duration-200',
            'hover:bg-gray-100 active:bg-gray-200',
            position === 'right' ? 'right-4' : 'left-4',
            'text-gray-500 hover:text-gray-700'
          )}
          aria-label="Close sidebar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </>
  )
}

export default SlidingSidebar
