import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('sgm_token'))

  useEffect(() => {
    if (token) {
      // Verificar se o token é válido
      validateToken()
    } else {
      setLoading(false)
    }
  }, [token])

  const validateToken = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        // Token inválido
        logout()
      }
    } catch (error) {
      console.error('Erro ao validar token:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, senha) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('sgm_token', data.token)
        return { success: true }
      } else {
        return { success: false, error: data.message }
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('sgm_token')
  }

  const hasPermission = (modulo, acao) => {
    if (!user || !user.permissoes) return false
    
    const permissao = user.permissoes.find(p => p.modulo === modulo)
    if (!permissao) return false

    switch (acao) {
      case 'visualizar':
        return permissao.visualizar
      case 'criar':
        return permissao.criar
      case 'editar':
        return permissao.editar
      case 'deletar':
        return permissao.deletar
      case 'aprovar':
        return permissao.aprovar
      case 'configurar':
        return permissao.configurar
      default:
        return false
    }
  }

  const isAdmin = () => {
    return user?.perfil === 'Administrador'
  }

  const isSupervisor = () => {
    return ['Administrador', 'Supervisor'].includes(user?.perfil)
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasPermission,
    isAdmin,
    isSupervisor,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext

