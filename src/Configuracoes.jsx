import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Target,
  Palette,
  Monitor,
  Globe,
  Calculator,
  Database,
  FileText,
  Zap,
  Shield,
  Bell,
  Mail,
  Clock,
  BarChart3,
  Sliders,
  Toggle
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

const API_BASE_URL = 'http://localhost:3001/api'

const Configuracoes = () => {
  const { hasPermission, token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [configuracoes, setConfiguracoes] = useState({
    // Configurações Gerais
    nome_empresa: '',
    logo_empresa: '',
    tema_sistema: 'claro',
    idioma_sistema: 'pt-BR',
    fuso_horario: 'America/Sao_Paulo',
    formato_data: 'DD/MM/YYYY',
    formato_hora: '24h',
    moeda_padrao: 'BRL',
    
    // Configurações de Unidades
    unidade_pressao_padrao: 'bar',
    unidade_temperatura_padrao: 'celsius',
    unidade_vazao_padrao: 'm3_h',
    unidade_densidade_padrao: 'kg_m3',
    unidade_viscosidade_padrao: 'cst',
    
    // Configurações de Notificações
    notificacoes_email: true,
    notificacoes_sistema: true,
    notificacoes_calibracao: true,
    notificacoes_manutencao: true,
    notificacoes_vencimento: true,
    dias_antecedencia_vencimento: 30,
    
    // Configurações de Backup
    backup_automatico: true,
    frequencia_backup: 'diario',
    retencao_backup_dias: 30,
    
    // Configurações de Segurança
    tempo_sessao_minutos: 480,
    tentativas_login_max: 3,
    complexidade_senha: true,
    autenticacao_dois_fatores: false,
    
    // Configurações de Relatórios
    formato_relatorio_padrao: 'PDF',
    incluir_logo_relatorios: true,
    incluir_assinatura_digital: false,
    
    // Configurações de Campos Visíveis
    campos_visiveis: {
      polos: {
        codigo_polo: true,
        nome_polo: true,
        localizacao: true,
        responsavel: true,
        data_inicio_operacao: true,
        status_operacional: true,
        observacoes: false
      },
      instalacoes: {
        tag_instalacao: true,
        nome_instalacao: true,
        tipo_instalacao: true,
        polo_id: true,
        localizacao: true,
        responsavel: true,
        data_inicio_operacao: true,
        status_operacional: true,
        observacoes: false
      },
      pontos_medicao: {
        tag_ponto: true,
        tipo_medicao: true,
        fluido_medido: true,
        instalacao_id: true,
        localizacao: true,
        responsavel: true,
        data_instalacao: true,
        status_operacional: true,
        observacoes: false
      },
      placas_orificio: {
        tag_placa: true,
        diametro_orificio_mm: true,
        diametro_tubulacao_mm: true,
        material_placa: true,
        tipo_tomada_pressao: true,
        ponto_medicao_id: true,
        data_instalacao: true,
        status_operacional: true,
        observacoes: false
      }
    }
  })

  const [camposPersonalizados, setCamposPersonalizados] = useState([])

  useEffect(() => {
    fetchConfiguracoes()
    fetchCamposPersonalizados()
  }, [])

  const fetchConfiguracoes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/configuracoes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setConfiguracoes(prev => ({ ...prev, ...data }))
      } else {
        setError('Erro ao carregar configurações')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const fetchCamposPersonalizados = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/campos-personalizados`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCamposPersonalizados(data.campos || [])
      }
    } catch (err) {
      console.error('Erro ao carregar campos personalizados:', err)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const response = await fetch(`${API_BASE_URL}/configuracoes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(configuracoes)
      })

      if (response.ok) {
        setSuccess('Configurações salvas com sucesso!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.message || 'Erro ao salvar configurações')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      fetchConfiguracoes()
    }
  }

  const handleCampoVisibilidade = (modulo, campo, visivel) => {
    setConfiguracoes(prev => ({
      ...prev,
      campos_visiveis: {
        ...prev.campos_visiveis,
        [modulo]: {
          ...prev.campos_visiveis[modulo],
          [campo]: visivel
        }
      }
    }))
  }

  const adicionarCampoPersonalizado = async (modulo, nomeCampo, tipoCampo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/campos-personalizados`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          modulo,
          nome_campo: nomeCampo,
          tipo_campo: tipoCampo,
          visivel: true
        })
      })

      if (response.ok) {
        await fetchCamposPersonalizados()
        setSuccess('Campo personalizado adicionado com sucesso!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Erro ao adicionar campo personalizado')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const getUnidadeLabel = (unidade) => {
    const unidades = {
      // Pressão
      'bar': 'bar',
      'psi': 'psi',
      'kpa': 'kPa',
      'mpa': 'MPa',
      
      // Temperatura
      'celsius': '°C',
      'fahrenheit': '°F',
      'kelvin': 'K',
      
      // Vazão
      'm3_h': 'm³/h',
      'm3_d': 'm³/dia',
      'l_min': 'L/min',
      'gpm': 'GPM',
      
      // Densidade
      'kg_m3': 'kg/m³',
      'g_cm3': 'g/cm³',
      'api': '°API',
      
      // Viscosidade
      'cst': 'cSt',
      'cp': 'cP',
      'pas': 'Pa·s'
    }
    return unidades[unidade] || unidade
  }

  if (loading && !configuracoes.nome_empresa) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
          <p className="text-gray-600">Personalize o comportamento e aparência do SGM</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="unidades">Unidades</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="campos">Campos</TabsTrigger>
          <TabsTrigger value="avancado">Avançado</TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="geral">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configure informações básicas da empresa e aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome_empresa">Nome da Empresa</Label>
                  <Input
                    id="nome_empresa"
                    value={configuracoes.nome_empresa}
                    onChange={(e) => setConfiguracoes(prev => ({...prev, nome_empresa: e.target.value}))}
                    placeholder="Nome da sua empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="logo_empresa">URL do Logo</Label>
                  <Input
                    id="logo_empresa"
                    value={configuracoes.logo_empresa}
                    onChange={(e) => setConfiguracoes(prev => ({...prev, logo_empresa: e.target.value}))}
                    placeholder="https://exemplo.com/logo.png"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tema_sistema">Tema do Sistema</Label>
                  <Select 
                    value={configuracoes.tema_sistema} 
                    onValueChange={(value) => setConfiguracoes(prev => ({...prev, tema_sistema: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claro">Claro</SelectItem>
                      <SelectItem value="escuro">Escuro</SelectItem>
                      <SelectItem value="automatico">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="idioma_sistema">Idioma</Label>
                  <Select 
                    value={configuracoes.idioma_sistema} 
                    onValueChange={(value) => setConfiguracoes(prev => ({...prev, idioma_sistema: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fuso_horario">Fuso Horário</Label>
                  <Select 
                    value={configuracoes.fuso_horario} 
                    onValueChange={(value) => setConfiguracoes(prev => ({...prev, fuso_horario: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">Brasília (UTC-3)</SelectItem>
                      <SelectItem value="America/New_York">Nova York (UTC-5)</SelectItem>
                      <SelectItem value="Europe/London">Londres (UTC+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="formato_data">Formato de Data</Label>
                  <Select 
                    value={configuracoes.formato_data} 
                    onValueChange={(value) => setConfiguracoes(prev => ({...prev, formato_data: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="formato_hora">Formato de Hora</Label>
                  <Select 
                    value={configuracoes.formato_hora} 
                    onValueChange={(value) => setConfiguracoes(prev => ({...prev, formato_hora: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 horas</SelectItem>
                      <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="moeda_padrao">Moeda Padrão</Label>
                  <Select 
                    value={configuracoes.moeda_padrao} 
                    onValueChange={(value) => setConfiguracoes(prev => ({...prev, moeda_padrao: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (R$)</SelectItem>
                      <SelectItem value="USD">Dólar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Unidades */}
        <TabsContent value="unidades">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Unidades de Medida Padrão
              </CardTitle>
              <CardDescription>
                Configure as unidades padrão para cada grandeza física
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="unidade_pressao_padrao">Pressão</Label>
                    <Select 
                      value={configuracoes.unidade_pressao_padrao} 
                      onValueChange={(value) => setConfiguracoes(prev => ({...prev, unidade_pressao_padrao: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">bar</SelectItem>
                        <SelectItem value="psi">psi</SelectItem>
                        <SelectItem value="kpa">kPa</SelectItem>
                        <SelectItem value="mpa">MPa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="unidade_temperatura_padrao">Temperatura</Label>
                    <Select 
                      value={configuracoes.unidade_temperatura_padrao} 
                      onValueChange={(value) => setConfiguracoes(prev => ({...prev, unidade_temperatura_padrao: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="celsius">°C</SelectItem>
                        <SelectItem value="fahrenheit">°F</SelectItem>
                        <SelectItem value="kelvin">K</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="unidade_vazao_padrao">Vazão</Label>
                    <Select 
                      value={configuracoes.unidade_vazao_padrao} 
                      onValueChange={(value) => setConfiguracoes(prev => ({...prev, unidade_vazao_padrao: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="m3_h">m³/h</SelectItem>
                        <SelectItem value="m3_d">m³/dia</SelectItem>
                        <SelectItem value="l_min">L/min</SelectItem>
                        <SelectItem value="gpm">GPM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="unidade_densidade_padrao">Densidade</Label>
                    <Select 
                      value={configuracoes.unidade_densidade_padrao} 
                      onValueChange={(value) => setConfiguracoes(prev => ({...prev, unidade_densidade_padrao: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg_m3">kg/m³</SelectItem>
                        <SelectItem value="g_cm3">g/cm³</SelectItem>
                        <SelectItem value="api">°API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="unidade_viscosidade_padrao">Viscosidade</Label>
                    <Select 
                      value={configuracoes.unidade_viscosidade_padrao} 
                      onValueChange={(value) => setConfiguracoes(prev => ({...prev, unidade_viscosidade_padrao: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cst">cSt</SelectItem>
                        <SelectItem value="cp">cP</SelectItem>
                        <SelectItem value="pas">Pa·s</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Calculadora de Conversão</h4>
                <p className="text-blue-700 text-sm">
                  O sistema incluirá uma calculadora de conversão automática entre diferentes unidades de medida.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Notificações */}
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure quando e como receber notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notificacoes_email">Notificações por Email</Label>
                    <p className="text-sm text-gray-600">Receber notificações importantes por email</p>
                  </div>
                  <Switch
                    id="notificacoes_email"
                    checked={configuracoes.notificacoes_email}
                    onCheckedChange={(checked) => setConfiguracoes(prev => ({...prev, notificacoes_email: checked}))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notificacoes_sistema">Notificações no Sistema</Label>
                    <p className="text-sm text-gray-600">Mostrar notificações na interface do sistema</p>
                  </div>
                  <Switch
                    id="notificacoes_sistema"
                    checked={configuracoes.notificacoes_sistema}
                    onCheckedChange={(checked) => setConfiguracoes(prev => ({...prev, notificacoes_sistema: checked}))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notificacoes_calibracao">Alertas de Calibração</Label>
                    <p className="text-sm text-gray-600">Notificar sobre vencimentos de calibração</p>
                  </div>
                  <Switch
                    id="notificacoes_calibracao"
                    checked={configuracoes.notificacoes_calibracao}
                    onCheckedChange={(checked) => setConfiguracoes(prev => ({...prev, notificacoes_calibracao: checked}))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notificacoes_manutencao">Alertas de Manutenção</Label>
                    <p className="text-sm text-gray-600">Notificar sobre manutenções programadas</p>
                  </div>
                  <Switch
                    id="notificacoes_manutencao"
                    checked={configuracoes.notificacoes_manutencao}
                    onCheckedChange={(checked) => setConfiguracoes(prev => ({...prev, notificacoes_manutencao: checked}))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notificacoes_vencimento">Alertas de Vencimento</Label>
                    <p className="text-sm text-gray-600">Notificar sobre documentos e certificados vencendo</p>
                  </div>
                  <Switch
                    id="notificacoes_vencimento"
                    checked={configuracoes.notificacoes_vencimento}
                    onCheckedChange={(checked) => setConfiguracoes(prev => ({...prev, notificacoes_vencimento: checked}))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dias_antecedencia_vencimento">Dias de Antecedência para Alertas</Label>
                <Input
                  id="dias_antecedencia_vencimento"
                  type="number"
                  value={configuracoes.dias_antecedencia_vencimento}
                  onChange={(e) => setConfiguracoes(prev => ({...prev, dias_antecedencia_vencimento: parseInt(e.target.value)}))}
                  className="w-32"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Quantos dias antes do vencimento enviar alertas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Segurança */}
        <TabsContent value="seguranca">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Segurança
              </CardTitle>
              <CardDescription>
                Configure políticas de segurança e autenticação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tempo_sessao_minutos">Tempo de Sessão (minutos)</Label>
                  <Input
                    id="tempo_sessao_minutos"
                    type="number"
                    value={configuracoes.tempo_sessao_minutos}
                    onChange={(e) => setConfiguracoes(prev => ({...prev, tempo_sessao_minutos: parseInt(e.target.value)}))}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Tempo limite para inatividade da sessão
                  </p>
                </div>
                <div>
                  <Label htmlFor="tentativas_login_max">Máximo de Tentativas de Login</Label>
                  <Input
                    id="tentativas_login_max"
                    type="number"
                    value={configuracoes.tentativas_login_max}
                    onChange={(e) => setConfiguracoes(prev => ({...prev, tentativas_login_max: parseInt(e.target.value)}))}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Número máximo de tentativas antes de bloquear
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="complexidade_senha">Exigir Senha Complexa</Label>
                    <p className="text-sm text-gray-600">Senhas devem ter maiúsculas, minúsculas, números e símbolos</p>
                  </div>
                  <Switch
                    id="complexidade_senha"
                    checked={configuracoes.complexidade_senha}
                    onCheckedChange={(checked) => setConfiguracoes(prev => ({...prev, complexidade_senha: checked}))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autenticacao_dois_fatores">Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-gray-600">Exigir código adicional para login</p>
                  </div>
                  <Switch
                    id="autenticacao_dois_fatores"
                    checked={configuracoes.autenticacao_dois_fatores}
                    onCheckedChange={(checked) => setConfiguracoes(prev => ({...prev, autenticacao_dois_fatores: checked}))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="backup_automatico">Backup Automático</Label>
                    <p className="text-sm text-gray-600">Realizar backup automático dos dados</p>
                  </div>
                  <Switch
                    id="backup_automatico"
                    checked={configuracoes.backup_automatico}
                    onCheckedChange={(checked) => setConfiguracoes(prev => ({...prev, backup_automatico: checked}))}
                  />
                </div>
              </div>

              {configuracoes.backup_automatico && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequencia_backup">Frequência do Backup</Label>
                    <Select 
                      value={configuracoes.frequencia_backup} 
                      onValueChange={(value) => setConfiguracoes(prev => ({...prev, frequencia_backup: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diario">Diário</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="retencao_backup_dias">Retenção (dias)</Label>
                    <Input
                      id="retencao_backup_dias"
                      type="number"
                      value={configuracoes.retencao_backup_dias}
                      onChange={(e) => setConfiguracoes(prev => ({...prev, retencao_backup_dias: parseInt(e.target.value)}))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Campos */}
        <TabsContent value="campos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Visibilidade de Campos
              </CardTitle>
              <CardDescription>
                Configure quais campos são visíveis em cada módulo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(configuracoes.campos_visiveis).map(([modulo, campos]) => (
                <div key={modulo} className="space-y-4">
                  <h4 className="text-lg font-semibold capitalize">
                    {modulo.replace('_', ' ')}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(campos).map(([campo, visivel]) => (
                      <div key={campo} className="flex items-center justify-between">
                        <Label htmlFor={`${modulo}_${campo}`} className="capitalize">
                          {campo.replace(/_/g, ' ')}
                        </Label>
                        <Switch
                          id={`${modulo}_${campo}`}
                          checked={visivel}
                          onCheckedChange={(checked) => handleCampoVisibilidade(modulo, campo, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold mb-4">Campos Personalizados</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Adicione campos personalizados aos módulos conforme necessário.
                </p>
                
                {camposPersonalizados.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {camposPersonalizados.map((campo) => (
                      <div key={campo.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{campo.nome_campo}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{campo.modulo}</Badge>
                          <Badge variant="secondary">{campo.tipo_campo}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-700 text-sm">
                    <strong>Funcionalidade em Desenvolvimento:</strong> Em breve você poderá adicionar e editar campos personalizados 
                    diretamente pela interface, definindo o tipo de dado e configurações específicas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Avançadas */}
        <TabsContent value="avancado">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sliders className="h-5 w-5 mr-2" />
                Configurações Avançadas
              </CardTitle>
              <CardDescription>
                Configurações técnicas e de relatórios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Relatórios</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="formato_relatorio_padrao">Formato Padrão</Label>
                    <Select 
                      value={configuracoes.formato_relatorio_padrao} 
                      onValueChange={(value) => setConfiguracoes(prev => ({...prev, formato_relatorio_padrao: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="Excel">Excel</SelectItem>
                        <SelectItem value="CSV">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="incluir_logo_relatorios">Incluir Logo nos Relatórios</Label>
                      <p className="text-sm text-gray-600">Adicionar logo da empresa nos relatórios gerados</p>
                    </div>
                    <Switch
                      id="incluir_logo_relatorios"
                      checked={configuracoes.incluir_logo_relatorios}
                      onCheckedChange={(checked) => setConfiguracoes(prev => ({...prev, incluir_logo_relatorios: checked}))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="incluir_assinatura_digital">Assinatura Digital</Label>
                      <p className="text-sm text-gray-600">Incluir assinatura digital nos relatórios</p>
                    </div>
                    <Switch
                      id="incluir_assinatura_digital"
                      checked={configuracoes.incluir_assinatura_digital}
                      onCheckedChange={(checked) => setConfiguracoes(prev => ({...prev, incluir_assinatura_digital: checked}))}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold mb-4">Informações do Sistema</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Versão do Sistema</Label>
                    <p className="text-gray-600">SGM v2.1.0</p>
                  </div>
                  <div>
                    <Label>Última Atualização</Label>
                    <p className="text-gray-600">23/07/2025</p>
                  </div>
                  <div>
                    <Label>Banco de Dados</Label>
                    <p className="text-gray-600">PostgreSQL 14.2</p>
                  </div>
                  <div>
                    <Label>Ambiente</Label>
                    <p className="text-gray-600">Produção</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Configuracoes

