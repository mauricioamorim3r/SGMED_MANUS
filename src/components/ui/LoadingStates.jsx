import React from 'react'
import { Loader2, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

// Skeleton loader for cards
export const CardSkeleton = ({ className, ...props }) => (
  <div className={cn("animate-pulse", className)} {...props}>
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-8 w-8 bg-muted rounded"></div>
        </div>
        <div className="h-8 bg-muted rounded w-16"></div>
        <div className="h-3 bg-muted rounded w-20"></div>
      </div>
    </div>
  </div>
)

// Skeleton loader for tables
export const TableSkeleton = ({ rows = 5, columns = 4, className }) => (
  <div className={cn("animate-pulse space-y-2", className)}>
    {/* Header */}
    <div className="flex space-x-4 p-4 border-b">
      {[...Array(columns)].map((_, i) => (
        <div key={i} className="h-4 bg-muted rounded flex-1"></div>
      ))}
    </div>
    
    {/* Rows */}
    {[...Array(rows)].map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 p-4">
        {[...Array(columns)].map((_, colIndex) => (
          <div 
            key={colIndex} 
            className="h-4 bg-muted rounded flex-1"
            style={{ opacity: Math.random() * 0.5 + 0.5 }}
          ></div>
        ))}
      </div>
    ))}
  </div>
)

// Skeleton loader for charts
export const ChartSkeleton = ({ className }) => (
  <div className={cn("animate-pulse", className)}>
    <div className="rounded-lg border bg-card p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-muted rounded w-32"></div>
          <div className="h-4 bg-muted rounded w-20"></div>
        </div>
        <div className="h-64 bg-muted rounded"></div>
        <div className="flex justify-center space-x-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded w-16"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Loading spinner with text
export const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Carregando...', 
  className,
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {showText && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

// Loading overlay
export const LoadingOverlay = ({ loading, children, text = 'Carregando...' }) => (
  <div className="relative">
    {children}
    {loading && (
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
        <div className="bg-card p-6 rounded-lg shadow-lg border">
          <LoadingSpinner text={text} />
        </div>
      </div>
    )}
  </div>
)

// Loading button state
export const LoadingButton = ({ 
  loading, 
  children, 
  loadingText = 'Carregando...', 
  className,
  ...props 
}) => (
  <button 
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:pointer-events-none disabled:opacity-50",
      "bg-primary text-primary-foreground hover:bg-primary/90",
      "h-10 px-4 py-2",
      className
    )}
    disabled={loading}
    {...props}
  >
    {loading ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {loadingText}
      </>
    ) : (
      children
    )}
  </button>
)

// Pulsing dots loader
export const PulsingDots = ({ className }) => (
  <div className={cn("flex space-x-1", className)}>
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="w-2 h-2 bg-primary rounded-full animate-pulse"
        style={{ animationDelay: `${i * 0.2}s` }}
      ></div>
    ))}
  </div>
)

// Progress bar with steps
export const StepProgress = ({ currentStep, totalSteps, className }) => (
  <div className={cn("space-y-2", className)}>
    <div className="flex justify-between text-sm text-muted-foreground">
      <span>Passo {currentStep} de {totalSteps}</span>
      <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
    </div>
    <div className="w-full bg-muted rounded-full h-2">
      <div 
        className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      ></div>
    </div>
  </div>
)

// Activity indicator
export const ActivityIndicator = ({ active, className }) => (
  <div className={cn("flex items-center space-x-2", className)}>
    <div className={cn(
      "w-2 h-2 rounded-full transition-colors",
      active ? "bg-green-500 animate-pulse" : "bg-muted"
    )}></div>
    <span className="text-sm text-muted-foreground">
      {active ? 'Ativo' : 'Inativo'}
    </span>
  </div>
)

export default {
  CardSkeleton,
  TableSkeleton,
  ChartSkeleton,
  LoadingSpinner,
  LoadingOverlay,
  LoadingButton,
  PulsingDots,
  StepProgress,
  ActivityIndicator
}