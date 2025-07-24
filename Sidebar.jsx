import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  BarChart3, 
  Database, 
  FileText, 
  Calendar, 
  Wrench,
  Users, 
  Settings, 
  Target,
  Zap,
  Ruler,
  TestTube,
  FlaskConical,
  Package,
  ArrowRightLeft,
  GitBranch,
  LogOut,
  User,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'

const Sidebar = ({ currentView, setCurrentView }) => {
  const { user, logout, hasPermission } = useAuth()
  const [expandedSections, setExpandedSections] = useState({
    core: true,
    especializados: true,
    avancados: true,
    gestao: true,
    sistema: true
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const menuSections = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: BarChart3,
      items: [
        { id: 'dashboard', label: 'Visão Geral', icon: BarChart3, module: 'dashboard' }
      ]
    },
    {
      id: 'core',
      title: 'Módulos Core',
      items: [
        { id: 'equipamentos', label: 'Equipamentos', icon: Database, module: 'equipamentos' },
        { id: 'polos', label: 'Polos', icon: Target, module: 'polos' },
        { id: 'instalacoes', label: 'Instalações', icon: Activity, module: 'instalacoes' },
        { id: 'pontos', label: 'Pontos de Medição', icon: Zap, module: 'pontos_medicao' },
        { id: 'certificados', label: 'Certificados', icon: FileText, module: 'certificados' }
      ]
    },
    {
      id: 'especializados',
      title: 'Módulos Especializados',
      items: [
        { id: 'placas-orificio', label: 'Placas de Orifício', icon: Target, module: 'placas_orificio' },
        { id: 'incertezas', label: 'Incertezas de Medição', icon: Ruler, module: 'incertezas' },
        { id: 'trechos-retos', label: 'Trechos Retos', icon: ArrowRightLeft, module: 'trechos_retos' }
      ]
    },
    {
      id: 'avancados',
      title: 'Módulos Avançados',
      items: [
        { id: 'testes-pocos', label: 'Testes de Poços', icon: TestTube, module: 'testes_pocos' },
        { id: 'analises-fq', label: 'Análises FQ', icon: FlaskConical, module: 'analises_quimicas' }
      ]
    },
    {
      id: 'gestao',
      title: 'Gestão e Controle',
      items: [
        { id: 'estoque', label: 'Estoque', icon: Package, module: 'estoque' },
        { id: 'movimentacao', label: 'Movimentação', icon: ArrowRightLeft, module: 'movimentacao_estoque' },
        { id: 'moc', label: 'Controle de Mudanças', icon: GitBranch, module: 'controle_mudancas' }
      ]
    },
    {
      id: 'sistema',
      title: 'Sistema',
      items: [
        { id: 'usuarios', label: 'Usuários', icon: Users, module: 'usuarios' },
        { id: 'configuracoes', label: 'Configurações', icon: Settings, module: 'configuracoes' },
        { id: 'auditoria', label: 'Auditoria', icon: FileText, module: 'auditoria' }
      ]
    }
  ]

  const renderMenuItem = (item) => {
    if (!hasPermission(item.module, 'visualizar') && !user?.perfil === 'Administrador') {
      return null
    }

    const Icon = item.icon
    const isActive = currentView === item.id

    return (
      <button
        key={item.id}
        onClick={() => setCurrentView(item.id)}
        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
        <span className="truncate">{item.label}</span>
      </button>
    )
  }

  const renderSection = (section) => {
    if (section.id === 'dashboard') {
      return (
        <div key={section.id} className="mb-4">
          {section.items.map(renderMenuItem)}
        </div>
      )
    }

    const isExpanded = expandedSections[section.id]
    const visibleItems = section.items.filter(item => 
      hasPermission(item.module, 'visualizar') || user?.perfil === 'Administrador'
    )

    if (visibleItems.length === 0) return null

    return (
      <div key={section.id} className="mb-4">
        <button
          onClick={() => toggleSection(section.id)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
        >
          <span>{section.title}</span>
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
        {isExpanded && (
          <div className="space-y-1 mt-2">
            {visibleItems.map(renderMenuItem)}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header do Sidebar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <Activity className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">SGM</h1>
            <p className="text-xs text-gray-500">Sistema Metrológico</p>
          </div>
        </div>
      </div>

      {/* Informações do Usuário */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.nome_completo}
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant={
                user?.perfil === 'Administrador' ? 'default' :
                user?.perfil === 'Supervisor' ? 'secondary' : 'outline'
              } className="text-xs">
                {user?.perfil}
              </Badge>
              {user?.status_usuario === 'Ativo' && (
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuSections.map(renderSection)}
      </nav>

      {/* Footer do Sidebar */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
        
        <div className="mt-3 text-xs text-gray-500 text-center">
          <p>SGM v1.0.0</p>
          <div className="flex items-center justify-center mt-1">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
            <span>Sistema Online</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

