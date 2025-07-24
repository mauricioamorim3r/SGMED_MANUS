import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const animations = {
  fadeIn: "animate-in fade-in-0 duration-300",
  slideIn: "animate-in slide-in-from-bottom-4 duration-300",
  slideUp: "animate-in slide-in-from-bottom-2 duration-500",
  slideDown: "animate-in slide-in-from-top-2 duration-500",
  slideLeft: "animate-in slide-in-from-right-2 duration-500",
  slideRight: "animate-in slide-in-from-left-2 duration-500",
  scaleIn: "animate-in zoom-in-95 duration-200",
  scaleOut: "animate-out zoom-out-95 duration-200",
  hoverLift: "hover:scale-105 transition-transform duration-200",
  hoverGlow: "hover:shadow-lg hover:shadow-primary/25 transition-shadow duration-300",
  bounce: "animate-bounce",
  pulse: "animate-pulse",
  spin: "animate-spin"
}

export const effects = {
  shadow: {
    sm: "shadow-sm",
    md: "shadow-md", 
    lg: "shadow-lg",
    xl: "shadow-xl",
    corporate: "shadow-lg shadow-blue-500/10",
    glow: "shadow-2xl shadow-primary/20"
  },
  glass: "backdrop-blur-sm bg-card/80 border border-border/50",
  gradient: {
    primary: "bg-gradient-to-r from-primary to-primary/80",
    secondary: "bg-gradient-to-r from-secondary to-secondary/80",
    success: "bg-gradient-to-r from-green-500 to-green-600",
    warning: "bg-gradient-to-r from-yellow-500 to-yellow-600",
    error: "bg-gradient-to-r from-red-500 to-red-600"
  },
  border: {
    primary: "border-primary/20",
    success: "border-green-500/20",
    warning: "border-yellow-500/20", 
    error: "border-red-500/20"
  },
  hover: "hover:scale-105 transition-transform duration-200",
  transition: {
    fast: "transition-all duration-150",
    normal: "transition-all duration-300",
    slow: "transition-all duration-500"
  }
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatDateTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('pt-BR')
}

export function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR')
}