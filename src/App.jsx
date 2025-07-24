import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  BarChart3, 
  Database, 
  FileText, 
  Users, 
  Settings,
  Target,
  Zap,
  TestTube,
  FlaskConical,
  Package,
  ArrowRightLeft,
  GitBranch,
  Ruler,
  LogOut,
  User,
  MapPin,
  Gauge,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

// Import components
import Dashboard from './Dashboard'
import Polos from './Polos'
import Instalacoes from './Instalacoes'
import PontosMedicao from './PontosMedicao'
import PlacasOrificio from './PlacasOrificio'
import Incertezas from './Incertezas'
import TrechosRetos from './TrechosRetos'
import TestesPocos from './TestesPocos'
import AnalisesQuimicas from './AnalisesQuimicas'
import Estoque from './Estoque'
import MovimentacaoEstoque from './MovimentacaoEstoque'
import ControleMudancas from './ControleMudancas'
import Usuarios from './Usuarios'
import Configuracoes from './Configuracoes'
import Relatorios from './Relatorios'

// URL permanente do backend
const BACKEND_URL = 'https://nghki1cl06l9.manus.space'

// Componente de Login Simples
const LoginForm = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [backendStatus, setBackendStatus] = useState('checking')

  useEffect(() => {
    // Verificar status do backend
    fetch(`${BACKEND_URL}/api/health`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'OK') {
          setBackendStatus('online')
        } else {
          setBackendStatus('error')
        }
      })
      .catch(() => {
        setBackendStatus('error')
      })
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    // Simulação de login - em produção, validar credenciais com backend
    if (credentials.username && credentials.password) {
      onLogin({ 
        username: credentials.username,
        role: 'admin',
        token: 'demo-token-123'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">SGM - Sistema</CardTitle>
          <CardDescription>
            Sistema de Gerenciamento Metrológico
          </CardDescription>
          <div className="mt-4">
            {backendStatus === 'checking' && (
              <Badge variant="secondary" className="flex items-center gap-2">
                <Activity className="h-3 w-3 animate-spin" />
                Verificando backend...
              </Badge>
            )}
            {backendStatus === 'online' && (
              <Badge variant="default" className="flex items-center gap-2 bg-green-500">
                <CheckCircle className="h-3 w-3" />
                Backend Online
              </Badge>
            )}
            {backendStatus === 'error' && (
              <Badge variant="destructive" className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3" />
                Backend Offline
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuário
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Entrar no Sistema
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente Header
const Header = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Gauge className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">SGM</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3" />
            Sistema Online
          </Badge>
          
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">{user.username}</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

// Componente Sidebar
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
    { id: 'relatorios', name: 'Relatórios', icon: FileText }
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

// Componente principal da aplicação
function App() {
  const [user, setUser] = useState(null)
  const [activeModule, setActiveModule] = useState('dashboard')

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    setActiveModule('dashboard')
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <Dashboard />
      case 'polos': return <Polos />
      case 'instalacoes': return <Instalacoes />
      case 'pontos-medicao': return <PontosMedicao />
      case 'placas-orificio': return <PlacasOrificio />
      case 'incertezas': return <Incertezas />
      case 'trechos-retos': return <TrechosRetos />
      case 'testes-pocos': return <TestesPocos />
      case 'analises-quimicas': return <AnalisesQuimicas />
      case 'estoque': return <Estoque />
      case 'movimentacao-estoque': return <MovimentacaoEstoque />
      case 'controle-mudancas': return <ControleMudancas />
      case 'usuarios': return <Usuarios />
      case 'configuracoes': return <Configuracoes />
      case 'relatorios': return <Relatorios />
      default: return <Dashboard />
    }
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      <div className="flex">
        <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
        <main className="flex-1 p-6">
          {renderModule()}
        </main>
      </div>
    </div>
  )
}

export default App