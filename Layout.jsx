import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'
import LoginForm from '../auth/LoginForm'

const Layout = ({ children, currentView, setCurrentView }) => {
  const { isAuthenticated, loading } = useAuth()
  const [globalSearch, setGlobalSearch] = useState('')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando SGM...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          currentView={currentView} 
          onSearch={setGlobalSearch}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {React.cloneElement(children, { globalSearch })}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout

