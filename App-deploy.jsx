import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
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
  Gauge
} from 'lucide-react'

// Componente de Login Simples
const LoginForm = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Login simples para demo
    onLogin({
      nome_completo: 'Usuário Demo',
      perfil: 'Administrador',
      status_usuario: 'Ativo'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-96">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Activity className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">SGM - Login</CardTitle>
          <CardDescription>Sistema de Gerenciamento Metrológico</CardDescription>
        </CardHeader>