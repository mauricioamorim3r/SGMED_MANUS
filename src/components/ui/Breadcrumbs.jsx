import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const breadcrumbMap = {
  '/dashboard': { label: 'Dashboard', icon: Home },
  '/polos': { label: 'Polos', parent: '/dashboard' },
  '/instalacoes': { label: 'Instalações', parent: '/dashboard' },
  '/equipamentos': { label: 'Equipamentos', parent: '/dashboard' },
  '/pontos-medicao': { label: 'Pontos de Medição', parent: '/dashboard' },
  '/placas-orificio': { label: 'Placas de Orifício', parent: '/dashboard' },
  '/incertezas': { label: 'Incertezas', parent: '/dashboard' },
  '/trechos-retos': { label: 'Trechos Retos', parent: '/dashboard' },
  '/testes-pocos': { label: 'Testes de Poços', parent: '/dashboard' },
  '/analises-quimicas': { label: 'Análises Químicas', parent: '/dashboard' },
  '/estoque': { label: 'Estoque', parent: '/dashboard' },
  '/movimentacao-estoque': { label: 'Movimentação de Estoque', parent: '/dashboard' },
  '/controle-mudancas': { label: 'Controle de Mudanças', parent: '/dashboard' },
  '/usuarios': { label: 'Usuários', parent: '/dashboard' },
  '/sessoes': { label: 'Sessões', parent: '/dashboard' },
  '/auditoria': { label: 'Auditoria', parent: '/dashboard' },
  '/configuracoes': { label: 'Configurações', parent: '/dashboard' },
  '/relatorios': { label: 'Relatórios', parent: '/dashboard' },
}

const generateBreadcrumbs = (pathname) => {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = []
  
  // Always start with SGM
  breadcrumbs.push({
    label: 'SGM',
    href: '/dashboard',
    icon: Home
  })

  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const breadcrumbInfo = breadcrumbMap[currentPath]
    
    if (breadcrumbInfo) {
      breadcrumbs.push({
        label: breadcrumbInfo.label,
        href: index === segments.length - 1 ? null : currentPath, // Last item is not clickable
        icon: breadcrumbInfo.icon
      })
    } else {
      // Handle dynamic routes like /equipamentos/123
      const decodedSegment = decodeURIComponent(segment)
      breadcrumbs.push({
        label: decodedSegment.charAt(0).toUpperCase() + decodedSegment.slice(1),
        href: index === segments.length - 1 ? null : currentPath
      })
    }
  })

  return breadcrumbs
}

export const Breadcrumbs = ({ className, separator = <ChevronRight className="h-4 w-4" /> }) => {
  const location = useLocation()
  const breadcrumbs = generateBreadcrumbs(location.pathname)

  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground mb-6", className)}>
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <span className="mx-2 text-muted-foreground/60">
              {separator}
            </span>
          )}
          
          {breadcrumb.href ? (
            <Link
              to={breadcrumb.href}
              className="flex items-center hover:text-foreground transition-colors font-medium"
            >
              {breadcrumb.icon && (
                <breadcrumb.icon className="h-4 w-4 mr-1" />
              )}
              {breadcrumb.label}
            </Link>
          ) : (
            <span className="flex items-center text-foreground font-medium">
              {breadcrumb.icon && (
                <breadcrumb.icon className="h-4 w-4 mr-1" />
              )}
              {breadcrumb.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}

// Hook para usar breadcrumbs customizados
export const useBreadcrumbs = () => {
  const [customBreadcrumbs, setCustomBreadcrumbs] = React.useState([])
  
  const setBreadcrumbs = React.useCallback((breadcrumbs) => {
    setCustomBreadcrumbs(breadcrumbs)
  }, [])
  
  return {
    breadcrumbs: customBreadcrumbs,
    setBreadcrumbs
  }
}

export default Breadcrumbs