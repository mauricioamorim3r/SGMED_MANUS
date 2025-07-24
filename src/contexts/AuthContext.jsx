import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = async (credentials) => {
    setLoading(true)
    try {
      // Simulação de login - em produção, fazer chamada real para API
      const userData = {
        id: 1,
        username: credentials.username,
        email: credentials.username + '@sgm.com',
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'admin'],
        token: 'demo-token-123'
      }
      setUser(userData)
      return { success: true, user: userData }
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext