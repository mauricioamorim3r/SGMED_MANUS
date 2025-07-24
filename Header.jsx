import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Input } from '../ui/input'

const Header = ({ currentView, onSearch }) => {
  const { user, logout } = useAuth()

  const getPageTitle = (view) => {
    const titles = {
      'dashboard': 'Dashboard',
      'equipamentos': 'Equipamentos',
      'polos': 'Polos',
      'instalacoes': 'Instalações',
      'pontos': 'Pontos de Medição',
      'certificados': 'Certificados',
      'placas-orificio': 'Placas de Orifício',
      'incertezas': 'Incertezas de Medição',
      'trechos-retos': 'Trechos Retos',
      'testes-pocos': 'Testes de Poços',
      'analises-fq': 'Análises Físico-Químicas',
      'estoque': 'Estoque',
      'movimentacao': 'Movimentação de Estoque',
      'moc': 'Controle de Mudanças (MOC)',
      'usuarios': 'Usuários',
      'configuracoes': 'Configurações',
      'auditoria': 'Auditoria'
    }
    return titles[view] || 'SGM'
  }

  const mockNotifications = [
    {
      id: 1,
      type: 'warning',
      title: 'Calibração Vencida',
      message: 'Equipamento FT-9144 com calibração vencida há 3 dias',
      time: '2 min atrás',
      icon: AlertTriangle,
      color: 'text-orange-500'
    },
    {
      id: 2,
      type: 'success',
      title: 'Teste Concluído',
      message: 'Teste de poço TP-001-2025 finalizado com sucesso',
      time: '1 hora atrás',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      id: 3,
      type: 'info',
      title: 'MOC Pendente',
      message: 'MOC-2025-001 aguardando aprovação técnica',
      time: '3 horas atrás',
      icon: Clock,
      color: 'text-blue-500'
    }
  ]

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Título da Página e Breadcrumb */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getPageTitle(currentView)}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
              <span>SGM</span>
              <span>/</span>
              <span>{getPageTitle(currentView)}</span>
            </div>
          </div>
        </div>

        {/* Barra de Busca */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar em todo o sistema..."
              className="pl-10 pr-4"
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Ações do Header */}
        <div className="flex items-center space-x-4">
          {/* Status do Sistema */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <Badge variant="outline" className="text-green-600 border-green-200">
              Sistema Online
            </Badge>
          </div>

          {/* Notificações */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {mockNotifications.length}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {mockNotifications.map((notification) => {
                const Icon = notification.icon
                return (
                  <DropdownMenuItem key={notification.id} className="flex items-start space-x-3 p-3">
                    <Icon className={`h-4 w-4 mt-0.5 ${notification.color}`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-500">{notification.message}</p>
                      <p className="text-xs text-gray-400">{notification.time}</p>
                    </div>
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-sm text-blue-600">
                Ver todas as notificações
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menu do Usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <div className="bg-blue-100 p-1.5 rounded-full">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{user?.nome_completo}</p>
                  <p className="text-xs text-gray-500">{user?.perfil}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default Header

