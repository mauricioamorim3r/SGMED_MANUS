import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Utilitários para cores corporativas
export const colors = {
  primary: {
    50: 'oklch(0.95 0.02 220)',
    100: 'oklch(0.90 0.04 220)',
    200: 'oklch(0.80 0.06 220)',
    300: 'oklch(0.70 0.08 220)',
    400: 'oklch(0.60 0.10 220)',
    500: 'oklch(0.50 0.12 220)',
    600: 'oklch(0.40 0.12 220)',
    700: 'oklch(0.35 0.12 220)',
    800: 'oklch(0.30 0.12 220)',
    900: 'oklch(0.25 0.12 220)',
  },
  secondary: {
    50: 'oklch(0.98 0.005 240)',
    100: 'oklch(0.96 0.01 240)',
    200: 'oklch(0.94 0.01 240)',
    300: 'oklch(0.92 0.02 200)',
    400: 'oklch(0.88 0.01 240)',
    500: 'oklch(0.80 0.02 240)',
    600: 'oklch(0.70 0.02 240)',
    700: 'oklch(0.60 0.02 240)',
    800: 'oklch(0.45 0.02 240)',
    900: 'oklch(0.25 0.02 240)',
  }
}

// Utilitários para animações
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  scaleIn: 'animate-scale-in',
  hoverLift: 'hover-lift',
}

// Utilitários para efeitos
export const effects = {
  glass: 'glass-effect',
  gradientPrimary: 'gradient-primary',
  gradientSecondary: 'gradient-secondary',
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    corporate: 'shadow-lg shadow-primary/10',
  }
}

// Utilitários para status
export const statusColors = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  active: 'bg-primary/10 text-primary border-primary/20',
  inactive: 'bg-gray-100 text-gray-600 border-gray-200',
}

// Utilitários para módulos
export const moduleColors = {
  core: 'bg-blue-500',
  specialized: 'bg-purple-500',
  advanced: 'bg-orange-500',
  management: 'bg-red-500',
  system: 'bg-green-500',
}

// Função para formatar números
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Função para formatar datas
export function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

// Função para formatar data e hora
export function formatDateTime(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Função para gerar gradientes dinâmicos
export function generateGradient(color1, color2, direction = '135deg') {
  return `linear-gradient(${direction}, ${color1}, ${color2})`
}

// Função para calcular contraste de cor
export function getContrastColor(bgColor) {
  // Implementação simplificada - em produção usar uma biblioteca como chroma-js
  const lightColors = ['yellow', 'lime', 'cyan', 'white']
  return lightColors.some(color => bgColor.includes(color)) ? 'text-gray-900' : 'text-white'
}

