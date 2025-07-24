import React from 'react'
import { 
  BarChart3, 
  Database, 
  FileText, 
  Users, 
  Settings,
  Target,
  TestTube,
  FlaskConical,
  Package,
  ArrowRightLeft,
  GitBranch,
  Ruler,
  MapPin,
  Activity,
  Zap,
  Wifi
} from 'lucide-react'

const Sidebar = ({ activeModule, onModuleChange }) => {
  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'polos', name: 'Polos', icon: MapPin },
    { id: 'instalacoes', name: 'Instalações', icon: Database },
    { id: 'pontos-medicao', name: 'Pontos de Medição', icon: Target },
    { id: 'placas-orificio', name: 'Placas de Orifício', icon: Ruler },
    { id: 'incertezas', name: 'Incertezas', icon: Activity },
    { id: 'trechos-retos', name: 'Trechos Retos', icon: GitBranch },
    { id: 'testes-pocos', name: 'Testes de Poços', icon: TestTube },
    { id: 'analises-quimicas', name: 'Análises Químicas', icon: FlaskConical },
    { id: 'estoque', name: 'Estoque', icon: Package },
    { id: 'movimentacao-estoque', name: 'Movimentação', icon: ArrowRightLeft },
    { id: 'controle-mudancas', name: 'Controle de Mudanças', icon: Zap },
    { id: 'usuarios', name: 'Usuários', icon: Users },
    { id: 'configuracoes', name: 'Configurações', icon: Settings },
    { id: 'relatorios', name: 'Relatórios', icon: FileText },
    { id: 'api-test', name: '🔗 Teste API', icon: Wifi }
  ]

  return (
    <aside className="w-64 bg-gray-50 border-r min-h-screen">
      <nav className="p-4">
        <div className="space-y-1">
          {modules.map((module) => {
            const IconComponent = module.icon
            return (
              <button
                key={module.id}
                onClick={() => onModuleChange(module.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeModule === module.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-sm">{module.name}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar