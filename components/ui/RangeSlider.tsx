'use client'

import { useState, useRef, useEffect } from 'react'

interface RangeSliderProps {
  min: number
  max: number
  step: number
  valueMin: number
  valueMax: number
  onChangeMin: (value: number) => void
  onChangeMax: (value: number) => void
  formatValue?: (value: number) => string
  color?: string
}

export default function RangeSlider({
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
  formatValue = (v) => v.toString(),
  color = 'blue'
}: RangeSliderProps) {
  const [isDraggingMin, setIsDraggingMin] = useState(false)
  const [isDraggingMax, setIsDraggingMax] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return {
          track: 'bg-red-500',
          thumb: 'bg-red-600 border-red-700',
          bg: 'bg-red-200'
        }
      case 'blue':
        return {
          track: 'bg-blue-500',
          thumb: 'bg-blue-600 border-blue-700',
          bg: 'bg-blue-200'
        }
      case 'purple':
        return {
          track: 'bg-purple-500',
          thumb: 'bg-purple-600 border-purple-700',
          bg: 'bg-purple-200'
        }
      case 'green':
        return {
          track: 'bg-green-500',
          thumb: 'bg-green-600 border-green-700',
          bg: 'bg-green-200'
        }
      default:
        return {
          track: 'bg-gray-500',
          thumb: 'bg-gray-600 border-gray-700',
          bg: 'bg-gray-200'
        }
    }
  }

  const colors = getColorClasses()

  const calculateNewValue = (clientX: number): number => {
    if (!trackRef.current) return min

    const rect = trackRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const range = max - min
    let newValue = min + percentage * range

    // Round to step - use precise decimal handling to avoid floating-point errors
    const steps = Math.round((newValue - min) / step)
    newValue = min + (steps * step)

    // Clamp to min/max and fix floating point precision
    newValue = Math.max(min, Math.min(max, newValue))
    // Round to appropriate decimal places based on step
    const decimals = step.toString().split('.')[1]?.length || 0
    newValue = Number(newValue.toFixed(decimals))

    return newValue
  }

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, isMin: boolean) => {
    e.preventDefault()
    if (isMin) {
      setIsDraggingMin(true)
    } else {
      setIsDraggingMax(true)
    }
  }

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!trackRef.current) return
    if (!isDraggingMin && !isDraggingMax) return

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
    const newValue = calculateNewValue(clientX)

    if (isDraggingMin) {
      if (newValue < valueMax) {
        onChangeMin(Math.max(min, newValue))
      }
    } else if (isDraggingMax) {
      if (newValue > valueMin) {
        onChangeMax(Math.min(max, newValue))
      }
    }
  }

  const handleMouseUp = () => {
    setIsDraggingMin(false)
    setIsDraggingMax(false)
  }

  useEffect(() => {
    if (isDraggingMin || isDraggingMax) {
      const moveHandler = (e: MouseEvent | TouchEvent) => handleMouseMove(e)
      const upHandler = () => handleMouseUp()

      document.addEventListener('mousemove', moveHandler as EventListener)
      document.addEventListener('touchmove', moveHandler as EventListener)
      document.addEventListener('mouseup', upHandler)
      document.addEventListener('touchend', upHandler)

      return () => {
        document.removeEventListener('mousemove', moveHandler as EventListener)
        document.removeEventListener('touchmove', moveHandler as EventListener)
        document.removeEventListener('mouseup', upHandler)
        document.removeEventListener('touchend', upHandler)
      }
    }
  }, [isDraggingMin, isDraggingMax, valueMin, valueMax, min, max, step])

  const getPercentage = (value: number) => {
    return ((value - min) / (max - min)) * 100
  }

  const minPercent = getPercentage(valueMin)
  const maxPercent = getPercentage(valueMax)

  return (
    <div className="w-full">
      <div className="relative h-2 mb-4" ref={trackRef}>
        {/* Background track */}
        <div className={`absolute w-full h-2 ${colors.bg} rounded-full`} />

        {/* Active track between handles */}
        <div
          className={`absolute h-2 ${colors.track} rounded-full`}
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`
          }}
        />

        {/* Min handle */}
        <div
          className={`absolute w-5 h-5 ${colors.thumb} border-2 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 top-1/2 hover:scale-110 transition-transform ${
            isDraggingMin ? 'scale-110 shadow-lg' : ''
          }`}
          style={{ left: `${minPercent}%` }}
          onMouseDown={(e) => handleMouseDown(e, true)}
          onTouchStart={(e) => handleMouseDown(e, true)}
        />

        {/* Max handle */}
        <div
          className={`absolute w-5 h-5 ${colors.thumb} border-2 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 top-1/2 hover:scale-110 transition-transform ${
            isDraggingMax ? 'scale-110 shadow-lg' : ''
          }`}
          style={{ left: `${maxPercent}%` }}
          onMouseDown={(e) => handleMouseDown(e, false)}
          onTouchStart={(e) => handleMouseDown(e, false)}
        />
      </div>

      {/* Value labels */}
      <div className="flex justify-between text-sm font-semibold text-gray-700">
        <span>{formatValue(valueMin)}</span>
        <span>{formatValue(valueMax)}</span>
      </div>
    </div>
  )
}
