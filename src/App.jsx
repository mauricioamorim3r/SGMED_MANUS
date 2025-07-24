import React, { useState } from 'react'

// Import layout components
import LoginForm from './components/LoginForm'
import Header from './components/Header'
import Sidebar from './components/Sidebar'

// Import contexts
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationProvider } from '@/contexts/NotificationContext'

// Import UI components
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

// Import module components
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
import ApiTest from './components/ApiTest'


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
      case 'api-test': return <ApiTest />
      default: return <Dashboard />
    }
  }

  if (!user) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="sgm-theme">
        <div className="min-h-screen bg-background">
          <LoginForm onLogin={handleLogin} />
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="sgm-theme">
      <NotificationProvider>
        <div className="min-h-screen bg-background">
          <Header user={user} onLogout={handleLogout} />
          <div className="flex">
            <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
            <main className="flex-1 p-6">
              <Breadcrumbs />
              {renderModule()}
            </main>
          </div>
        </div>
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App