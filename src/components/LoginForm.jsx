import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Gauge, 
  ArrowRight,
  Shield,
  Users,
  BarChart3,
  Lock,
  Mail,
  User
} from 'lucide-react'

// URL permanente do backend
const BACKEND_URL = 'https://nghki1cl06l9.manus.space'

const LoginForm = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [backendStatus, setBackendStatus] = useState('checking')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

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

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!credentials.username || !credentials.password) {
      return
    }
    
    setIsLoading(true)
    
    // Simular delay de autenticação para UX
    setTimeout(() => {
      onLogin({ 
        username: credentials.username,
        role: 'admin',
        token: 'demo-token-123'
      })
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main container */}
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        
        {/* Left side - Branding & Features */}
        <div className="hidden lg:block space-y-8 p-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Gauge className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SGM</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Sistema de Gerenciamento Metrológico</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Gestão Completa para Indústria de Óleo & Gás
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Plataforma integrada para controle metrológico, calibração de equipamentos, 
                análises químicas e compliance regulatório.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-white/20">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">ISO 5167</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Compliance</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-white/20">
                <BarChart3 className="h-8 w-8 text-indigo-600" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">17 Módulos</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Completos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-white/20">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">Multi-usuário</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Permissões</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-white/20">
                <Activity className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">Tempo Real</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Monitoramento</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl shadow-blue-500/10">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center lg:hidden">
                    <Gauge className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Bem-vindo de volta
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Acesse sua conta SGM para continuar
                </p>
                
                {/* Backend Status */}
                <div className="mt-4 flex justify-center">
                  {backendStatus === 'checking' && (
                    <Badge variant="secondary" className="flex items-center gap-2">
                      <Activity className="h-3 w-3 animate-spin" />
                      Verificando sistema...
                    </Badge>
                  )}
                  {backendStatus === 'online' && (
                    <Badge className="flex items-center gap-2 bg-green-500 hover:bg-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Sistema Online
                    </Badge>
                  )}
                  {backendStatus === 'error' && (
                    <Badge variant="destructive" className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" />
                      Sistema Offline
                    </Badge>
                  )}
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Usuário
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`h-5 w-5 transition-colors duration-200 ${
                        focusedField === 'username' 
                          ? 'text-blue-500' 
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Digite seu usuário"
                      value={credentials.username}
                      onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      className="pl-10 h-12 bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Senha
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 transition-colors duration-200 ${
                        focusedField === 'password' 
                          ? 'text-blue-500' 
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className="pl-10 pr-10 h-12 bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Demo Credentials Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Credenciais de Demonstração
                    </p>
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <p>👤 <strong>Usuário:</strong> admin (ou qualquer texto)</p>
                    <p>🔒 <strong>Senha:</strong> 123 (ou qualquer texto)</p>
                  </div>
                </div>

                {/* Login Button */}
                <Button 
                  type="submit" 
                  disabled={isLoading || !credentials.username || !credentials.password}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Activity className="h-4 w-4 animate-spin" />
                      <span>Autenticando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Entrar no Sistema</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sistema de Gerenciamento Metrológico v1.0.0
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Indústria de Óleo & Gás • Compliance ISO 5167
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LoginForm