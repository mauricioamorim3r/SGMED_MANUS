import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Settings, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Target,
  MapPin,
  Calendar,
  Shield,
  Lock,
  Unlock,
  Eye,
  Clock,
  BarChart3,
  ArrowRight,
  User,
  FileText,
  Zap,
  AlertCircle,
  Users,
  Clipboard,
  TrendingUp
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '../ui/alert'
import { Progress } from '../ui/progress'

const API_BASE_URL = 'http://localhost:3001/api'

const ControleMudancas = ({ globalSearch }) => {
  const { hasPermission, token } = useAuth()
  const [mudancas, setMudancas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [filteredMudancas, setFilteredMudancas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tipoFilter, setTipoFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMudanca, setEditingMudanca] = useState(null)
  const [formData, setFormData] = useState({
    numero_moc: '',
    titulo_mudanca: '',
    tipo_mudanca: 'Temporaria',
    categoria_mudanca: 'Processo',
    descricao_mudanca: '',
    justificativa_mudanca: '',
    data_solicitacao: '',
    data_implementacao_prevista: '',
    data_implementacao_real: '',
    data_conclusao: '',
    status_moc: 'Iniciada',
    prioridade: 'Normal',
    nivel_risco: 'Baixo',
    solicitante_id: '',
    responsavel_implementacao_id: '',
    aprovador_nivel_1_id: '',
    aprovador_nivel_2_id: '',
    aprovador_nivel_3_id: '',
    data_aprovacao_nivel_1: '',
    data_aprovacao_nivel_2: '',
    data_aprovacao_nivel_3: '',
    area_afetada: '',
    equipamentos_afetados: '',
    sistemas_afetados: '',
    procedimentos_afetados: '',
    impacto_seguranca: '',
    impacto_meio_ambiente: '',
    impacto_operacional: '',
    impacto_financeiro: '',
    medidas_mitigacao: '',
    plano_implementacao: '',
    plano_rollback: '',
    recursos_necessarios: '',
    treinamento_necessario: '',
    documentos_atualizados: '',
    comunicacao_realizada: '',
    testes_realizados: '',
    validacao_pos_implementacao: '',
    licoes_aprendidas: '',
    observacoes: ''
  })

  // Carregar dados
  useEffect(() => {
    fetchMudancas()
    fetchUsuarios()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    applyFilters()
  }, [mudancas, searchTerm, statusFilter, tipoFilter, globalSearch])

  const fetchMudancas = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/controle-mudancas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMudancas(data.mudancas || data)
      } else {
        setError('Erro ao carregar controle de mudanças')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsuarios(data.usuarios || data)
      }
    } catch (err) {
      console.error('Erro ao carregar usuários:', err)
    }
  }

  const applyFilters = () => {
    let filtered = [...mudancas]

    // Busca global
    const search = globalSearch || searchTerm
    if (search) {
      filtered = filtered.filter(mudanca =>
        mudanca.numero_moc?.toLowerCase().includes(search.toLowerCase()) ||
        mudanca.titulo_mudanca?.toLowerCase().includes(search.toLowerCase()) ||
        mudanca.tipo_mudanca?.toLowerCase().includes(search.toLowerCase()) ||
        mudanca.categoria_mudanca?.toLowerCase().includes(search.toLowerCase()) ||
        mudanca.area_afetada?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(mudanca => mudanca.status_moc === statusFilter)
    }

    // Filtro por tipo
    if (tipoFilter !== 'all') {
      filtered = filtered.filter(mudanca => mudanca.tipo_mudanca === tipoFilter)
    }

    setFilteredMudancas(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingMudanca 
        ? `${API_BASE_URL}/controle-mudancas/${editingMudanca.id}`
        : `${API_BASE_URL}/controle-mudancas`
      
      const method = editingMudanca ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          solicitante_id: formData.solicitante_id ? parseInt(formData.solicitante_id) : null,
          responsavel_implementacao_id: formData.responsavel_implementacao_id ? parseInt(formData.responsavel_implementacao_id) : null,
          aprovador_nivel_1_id: formData.aprovador_nivel_1_id ? parseInt(formData.aprovador_nivel_1_id) : null,
          aprovador_nivel_2_id: formData.aprovador_nivel_2_id ? parseInt(formData.aprovador_nivel_2_id) : null,
          aprovador_nivel_3_id: formData.aprovador_nivel_3_id ? parseInt(formData.aprovador_nivel_3_id) : null
        })
      })

      if (response.ok) {
        await fetchMudancas()
        setIsDialogOpen(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.message || 'Erro ao salvar controle de mudança')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (mudanca, novoStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/controle-mudancas/${mudanca.id}/${novoStatus.toLowerCase()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchMudancas()
      } else {
        setError(`Erro ao ${novoStatus.toLowerCase()} mudança`)
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const handleEdit = (mudanca) => {
    setEditingMudanca(mudanca)
    setFormData({
      numero_moc: mudanca.numero_moc || '',
      titulo_mudanca: mudanca.titulo_mudanca || '',
      tipo_mudanca: mudanca.tipo_mudanca || 'Temporaria',
      categoria_mudanca: mudanca.categoria_mudanca || 'Processo',
      descricao_mudanca: mudanca.descricao_mudanca || '',
      justificativa_mudanca: mudanca.justificativa_mudanca || '',
      data_solicitacao: mudanca.data_solicitacao ? 
        new Date(mudanca.data_solicitacao).toISOString().split('T')[0] : '',
      data_implementacao_prevista: mudanca.data_implementacao_prevista ? 
        new Date(mudanca.data_implementacao_prevista).toISOString().split('T')[0] : '',
      data_implementacao_real: mudanca.data_implementacao_real ? 
        new Date(mudanca.data_implementacao_real).toISOString().split('T')[0] : '',
      data_conclusao: mudanca.data_conclusao ? 
        new Date(mudanca.data_conclusao).toISOString().split('T')[0] : '',
      status_moc: mudanca.status_moc || 'Iniciada',
      prioridade: mudanca.prioridade || 'Normal',
      nivel_risco: mudanca.nivel_risco || 'Baixo',
      solicitante_id: mudanca.solicitante_id?.toString() || '',
      responsavel_implementacao_id: mudanca.responsavel_implementacao_id?.toString() || '',
      aprovador_nivel_1_id: mudanca.aprovador_nivel_1_id?.toString() || '',
      aprovador_nivel_2_id: mudanca.aprovador_nivel_2_id?.toString() || '',
      aprovador_nivel_3_id: mudanca.aprovador_nivel_3_id?.toString() || '',
      data_aprovacao_nivel_1: mudanca.data_aprovacao_nivel_1 ? 
        new Date(mudanca.data_aprovacao_nivel_1).toISOString().split('T')[0] : '',
      data_aprovacao_nivel_2: mudanca.data_aprovacao_nivel_2 ? 
        new Date(mudanca.data_aprovacao_nivel_2).toISOString().split('T')[0] : '',
      data_aprovacao_nivel_3: mudanca.data_aprovacao_nivel_3 ? 
        new Date(mudanca.data_aprovacao_nivel_3).toISOString().split('T')[0] : '',
      area_afetada: mudanca.area_afetada || '',
      equipamentos_afetados: mudanca.equipamentos_afetados || '',
      sistemas_afetados: mudanca.sistemas_afetados || '',
      procedimentos_afetados: mudanca.procedimentos_afetados || '',
      impacto_seguranca: mudanca.impacto_seguranca || '',
      impacto_meio_ambiente: mudanca.impacto_meio_ambiente || '',
      impacto_operacional: mudanca.impacto_operacional || '',
      impacto_financeiro: mudanca.impacto_financeiro || '',
      medidas_mitigacao: mudanca.medidas_mitigacao || '',
      plano_implementacao: mudanca.plano_implementacao || '',
      plano_rollback: mudanca.plano_rollback || '',
      recursos_necessarios: mudanca.recursos_necessarios || '',
      treinamento_necessario: mudanca.treinamento_necessario || '',
      documentos_atualizados: mudanca.documentos_atualizados || '',
      comunicacao_realizada: mudanca.comunicacao_realizada || '',
      testes_realizados: mudanca.testes_realizados || '',
      validacao_pos_implementacao: mudanca.validacao_pos_implementacao || '',
      licoes_aprendidas: mudanca.licoes_aprendidas || '',
      observacoes: mudanca.observacoes || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (mudanca) => {
    if (!confirm(`Tem certeza que deseja excluir a mudança "${mudanca.numero_moc}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/controle-mudancas/${mudanca.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchMudancas()
      } else {
        setError('Erro ao excluir controle de mudança')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const resetForm = () => {
    setFormData({
      numero_moc: '',
      titulo_mudanca: '',
      tipo_mudanca: 'Temporaria',
      categoria_mudanca: 'Processo',
      descricao_mudanca: '',
      justificativa_mudanca: '',
      data_solicitacao: '',
      data_implementacao_prevista: '',
      data_implementacao_real: '',
      data_conclusao: '',
      status_moc: 'Iniciada',
      prioridade: 'Normal',
      nivel_risco: 'Baixo',
      solicitante_id: '',
      responsavel_implementacao_id: '',
      aprovador_nivel_1_id: '',
      aprovador_nivel_2_id: '',
      aprovador_nivel_3_id: '',
      data_aprovacao_nivel_1: '',
      data_aprovacao_nivel_2: '',
      data_aprovacao_nivel_3: '',
      area_afetada: '',
      equipamentos_afetados: '',
      sistemas_afetados: '',
      procedimentos_afetados: '',
      impacto_seguranca: '',
      impacto_meio_ambiente: '',
      impacto_operacional: '',
      impacto_financeiro: '',
      medidas_mitigacao: '',
      plano_implementacao: '',
      plano_rollback: '',
      recursos_necessarios: '',
      treinamento_necessario: '',
      documentos_atualizados: '',
      comunicacao_realizada: '',
      testes_realizados: '',
      validacao_pos_implementacao: '',
      licoes_aprendidas: '',
      observacoes: ''
    })
    setEditingMudanca(null)
    setError('')
  }

  const getStatusBadge = (status) => {
    const configs = {
      'Iniciada': { variant: 'secondary', icon: Clock, color: 'text-blue-600' },
      'Em Analise': { variant: 'outline', icon: Eye, color: 'text-orange-600' },
      'Aprovada Nivel 1': { variant: 'outline', icon: CheckCircle, color: 'text-green-600' },
      'Aprovada Nivel 2': { variant: 'outline', icon: CheckCircle, color: 'text-green-600' },
      'Aprovada Nivel 3': { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      'Rejeitada': { variant: 'destructive', icon: AlertTriangle, color: 'text-red-600' },
      'Implementada': { variant: 'default', icon: Activity, color: 'text-green-600' },
      'Concluida': { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      'Cancelada': { variant: 'destructive', icon: AlertTriangle, color: 'text-red-600' }
    }
    
    const config = configs[status] || configs['Iniciada']
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const getRiscoBadge = (risco) => {
    const configs = {
      'Baixo': { variant: 'default', color: 'text-green-600' },
      'Medio': { variant: 'outline', color: 'text-orange-600' },
      'Alto': { variant: 'destructive', color: 'text-red-600' },
      'Critico': { variant: 'destructive', color: 'text-red-600' }
    }
    
    const config = configs[risco] || configs['Baixo']

    return (
      <Badge variant={config.variant} className={config.color}>
        <Shield className="h-3 w-3 mr-1" />
        {risco}
      </Badge>
    )
  }

  const getPrioridadeBadge = (prioridade) => {
    const configs = {
      'Baixa': { variant: 'outline', color: 'text-gray-600' },
      'Normal': { variant: 'secondary', color: 'text-blue-600' },
      'Alta': { variant: 'outline', color: 'text-orange-600' },
      'Urgente': { variant: 'destructive', color: 'text-red-600' }
    }
    
    const config = configs[prioridade] || configs['Normal']

    return (
      <Badge variant={config.variant} className={config.color}>
        {prioridade}
      </Badge>
    )
  }

  const getProgressPercentage = (mudanca) => {
    const statusProgress = {
      'Iniciada': 10,
      'Em Analise': 25,
      'Aprovada Nivel 1': 40,
      'Aprovada Nivel 2': 60,
      'Aprovada Nivel 3': 75,
      'Rejeitada': 0,
      'Implementada': 90,
      'Concluida': 100,
      'Cancelada': 0
    }
    return statusProgress[mudanca.status_moc] || 0
  }

  const getApprovalLevel = (mudanca) => {
    if (mudanca.data_aprovacao_nivel_3) return 3
    if (mudanca.data_aprovacao_nivel_2) return 2
    if (mudanca.data_aprovacao_nivel_1) return 1
    return 0
  }

  const getActionButtons = (mudanca) => {
    const buttons = []
    const approvalLevel = getApprovalLevel(mudanca)
    
    switch (mudanca.status_moc) {
      case 'Iniciada':
        buttons.push(
          <Button
            key="analisar"
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(mudanca, 'Em Analise')}
            className="text-blue-600"
          >
            <Eye className="h-4 w-4 mr-1" />
            Analisar
          </Button>
        )
        break
      case 'Em Analise':
        if (approvalLevel === 0) {
          buttons.push(
            <Button
              key="aprovar1"
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange(mudanca, 'Aprovada Nivel 1')}
              className="text-green-600"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Aprovar Nível 1
            </Button>
          )
        }
        buttons.push(
          <Button
            key="rejeitar"
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(mudanca, 'Rejeitada')}
            className="text-red-600"
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Rejeitar
          </Button>
        )
        break
      case 'Aprovada Nivel 1':
        buttons.push(
          <Button
            key="aprovar2"
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(mudanca, 'Aprovada Nivel 2')}
            className="text-green-600"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Aprovar Nível 2
          </Button>
        )
        break
      case 'Aprovada Nivel 2':
        buttons.push(
          <Button
            key="aprovar3"
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(mudanca, 'Aprovada Nivel 3')}
            className="text-green-600"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Aprovar Nível 3
          </Button>
        )
        break
      case 'Aprovada Nivel 3':
        buttons.push(
          <Button
            key="implementar"
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(mudanca, 'Implementada')}
            className="text-blue-600"
          >
            <Activity className="h-4 w-4 mr-1" />
            Implementar
          </Button>
        )
        break
      case 'Implementada':
        buttons.push(
          <Button
            key="concluir"
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(mudanca, 'Concluida')}
            className="text-green-600"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Concluir
          </Button>
        )
        break
    }

    if (['Iniciada', 'Em Analise', 'Aprovada Nivel 1', 'Aprovada Nivel 2'].includes(mudanca.status_moc)) {
      buttons.push(
        <Button
          key="cancelar"
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange(mudanca, 'Cancelada')}
          className="text-red-600"
        >
          <AlertTriangle className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
      )
    }

    return buttons
  }

  if (loading && mudancas.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando controle de mudanças...</p>
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Controle de Mudanças (MOC)</h2>
          <p className="text-gray-600">Management of Change - Gerencie mudanças organizacionais</p>
        </div>

        {hasPermission('controle_mudancas', 'criar') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Mudança
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMudanca ? 'Editar Controle de Mudança' : 'Novo Controle de Mudança'}
                </DialogTitle>
                <DialogDescription>
                  {editingMudanca 
                    ? 'Edite as informações da mudança selecionada.'
                    : 'Adicione um novo controle de mudança ao sistema.'
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numero_moc">Número MOC *</Label>
                    <Input
                      id="numero_moc"
                      value={formData.numero_moc}
                      onChange={(e) => setFormData({...formData, numero_moc: e.target.value})}
                      placeholder="Ex: MOC-001-2025"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="titulo_mudanca">Título da Mudança *</Label>
                    <Input
                      id="titulo_mudanca"
                      value={formData.titulo_mudanca}
                      onChange={(e) => setFormData({...formData, titulo_mudanca: e.target.value})}
                      placeholder="Título descritivo da mudança"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="tipo_mudanca">Tipo de Mudança</Label>
                    <Select value={formData.tipo_mudanca} onValueChange={(value) => setFormData({...formData, tipo_mudanca: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Temporaria">Temporária</SelectItem>
                        <SelectItem value="Permanente">Permanente</SelectItem>
                        <SelectItem value="Emergencial">Emergencial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="categoria_mudanca">Categoria</Label>
                    <Select value={formData.categoria_mudanca} onValueChange={(value) => setFormData({...formData, categoria_mudanca: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Processo">Processo</SelectItem>
                        <SelectItem value="Equipamento">Equipamento</SelectItem>
                        <SelectItem value="Sistema">Sistema</SelectItem>
                        <SelectItem value="Procedimento">Procedimento</SelectItem>
                        <SelectItem value="Organizacional">Organizacional</SelectItem>
                        <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select value={formData.prioridade} onValueChange={(value) => setFormData({...formData, prioridade: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="nivel_risco">Nível de Risco</Label>
                    <Select value={formData.nivel_risco} onValueChange={(value) => setFormData({...formData, nivel_risco: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baixo">Baixo</SelectItem>
                        <SelectItem value="Medio">Médio</SelectItem>
                        <SelectItem value="Alto">Alto</SelectItem>
                        <SelectItem value="Critico">Crítico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="descricao_mudanca">Descrição da Mudança *</Label>
                    <Textarea
                      id="descricao_mudanca"
                      value={formData.descricao_mudanca}
                      onChange={(e) => setFormData({...formData, descricao_mudanca: e.target.value})}
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="justificativa_mudanca">Justificativa *</Label>
                    <Textarea
                      id="justificativa_mudanca"
                      value={formData.justificativa_mudanca}
                      onChange={(e) => setFormData({...formData, justificativa_mudanca: e.target.value})}
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="data_solicitacao">Data de Solicitação</Label>
                    <Input
                      id="data_solicitacao"
                      type="date"
                      value={formData.data_solicitacao}
                      onChange={(e) => setFormData({...formData, data_solicitacao: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_implementacao_prevista">Implementação Prevista</Label>
                    <Input
                      id="data_implementacao_prevista"
                      type="date"
                      value={formData.data_implementacao_prevista}
                      onChange={(e) => setFormData({...formData, data_implementacao_prevista: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_implementacao_real">Implementação Real</Label>
                    <Input
                      id="data_implementacao_real"
                      type="date"
                      value={formData.data_implementacao_real}
                      onChange={(e) => setFormData({...formData, data_implementacao_real: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_conclusao">Data de Conclusão</Label>
                    <Input
                      id="data_conclusao"
                      type="date"
                      value={formData.data_conclusao}
                      onChange={(e) => setFormData({...formData, data_conclusao: e.target.value})}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold mb-3">Responsáveis e Aprovadores</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="solicitante_id">Solicitante</Label>
                      <Select value={formData.solicitante_id} onValueChange={(value) => setFormData({...formData, solicitante_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o solicitante" />
                        </SelectTrigger>
                        <SelectContent>
                          {usuarios.map((usuario) => (
                            <SelectItem key={usuario.id} value={usuario.id.toString()}>
                              {usuario.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="responsavel_implementacao_id">Responsável pela Implementação</Label>
                      <Select value={formData.responsavel_implementacao_id} onValueChange={(value) => setFormData({...formData, responsavel_implementacao_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          {usuarios.map((usuario) => (
                            <SelectItem key={usuario.id} value={usuario.id.toString()}>
                              {usuario.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label htmlFor="aprovador_nivel_1_id">Aprovador Nível 1</Label>
                      <Select value={formData.aprovador_nivel_1_id} onValueChange={(value) => setFormData({...formData, aprovador_nivel_1_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione aprovador" />
                        </SelectTrigger>
                        <SelectContent>
                          {usuarios.map((usuario) => (
                            <SelectItem key={usuario.id} value={usuario.id.toString()}>
                              {usuario.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="aprovador_nivel_2_id">Aprovador Nível 2</Label>
                      <Select value={formData.aprovador_nivel_2_id} onValueChange={(value) => setFormData({...formData, aprovador_nivel_2_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione aprovador" />
                        </SelectTrigger>
                        <SelectContent>
                          {usuarios.map((usuario) => (
                            <SelectItem key={usuario.id} value={usuario.id.toString()}>
                              {usuario.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="aprovador_nivel_3_id">Aprovador Nível 3</Label>
                      <Select value={formData.aprovador_nivel_3_id} onValueChange={(value) => setFormData({...formData, aprovador_nivel_3_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione aprovador" />
                        </SelectTrigger>
                        <SelectContent>
                          {usuarios.map((usuario) => (
                            <SelectItem key={usuario.id} value={usuario.id.toString()}>
                              {usuario.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold mb-3">Áreas e Sistemas Afetados</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="area_afetada">Área Afetada</Label>
                      <Input
                        id="area_afetada"
                        value={formData.area_afetada}
                        onChange={(e) => setFormData({...formData, area_afetada: e.target.value})}
                        placeholder="Área ou setor afetado"
                      />
                    </div>
                    <div>
                      <Label htmlFor="equipamentos_afetados">Equipamentos Afetados</Label>
                      <Input
                        id="equipamentos_afetados"
                        value={formData.equipamentos_afetados}
                        onChange={(e) => setFormData({...formData, equipamentos_afetados: e.target.value})}
                        placeholder="Lista de equipamentos"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="sistemas_afetados">Sistemas Afetados</Label>
                      <Input
                        id="sistemas_afetados"
                        value={formData.sistemas_afetados}
                        onChange={(e) => setFormData({...formData, sistemas_afetados: e.target.value})}
                        placeholder="Sistemas impactados"
                      />
                    </div>
                    <div>
                      <Label htmlFor="procedimentos_afetados">Procedimentos Afetados</Label>
                      <Input
                        id="procedimentos_afetados"
                        value={formData.procedimentos_afetados}
                        onChange={(e) => setFormData({...formData, procedimentos_afetados: e.target.value})}
                        placeholder="Procedimentos a serem alterados"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold mb-3">Análise de Impactos</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="impacto_seguranca">Impacto na Segurança</Label>
                      <Textarea
                        id="impacto_seguranca"
                        value={formData.impacto_seguranca}
                        onChange={(e) => setFormData({...formData, impacto_seguranca: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="impacto_meio_ambiente">Impacto no Meio Ambiente</Label>
                      <Textarea
                        id="impacto_meio_ambiente"
                        value={formData.impacto_meio_ambiente}
                        onChange={(e) => setFormData({...formData, impacto_meio_ambiente: e.target.value})}
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="impacto_operacional">Impacto Operacional</Label>
                      <Textarea
                        id="impacto_operacional"
                        value={formData.impacto_operacional}
                        onChange={(e) => setFormData({...formData, impacto_operacional: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="impacto_financeiro">Impacto Financeiro</Label>
                      <Textarea
                        id="impacto_financeiro"
                        value={formData.impacto_financeiro}
                        onChange={(e) => setFormData({...formData, impacto_financeiro: e.target.value})}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold mb-3">Planos e Medidas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="medidas_mitigacao">Medidas de Mitigação</Label>
                      <Textarea
                        id="medidas_mitigacao"
                        value={formData.medidas_mitigacao}
                        onChange={(e) => setFormData({...formData, medidas_mitigacao: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="plano_implementacao">Plano de Implementação</Label>
                      <Textarea
                        id="plano_implementacao"
                        value={formData.plano_implementacao}
                        onChange={(e) => setFormData({...formData, plano_implementacao: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="plano_rollback">Plano de Rollback</Label>
                      <Textarea
                        id="plano_rollback"
                        value={formData.plano_rollback}
                        onChange={(e) => setFormData({...formData, plano_rollback: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="recursos_necessarios">Recursos Necessários</Label>
                      <Textarea
                        id="recursos_necessarios"
                        value={formData.recursos_necessarios}
                        onChange={(e) => setFormData({...formData, recursos_necessarios: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : (editingMudanca ? 'Atualizar' : 'Criar')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar mudanças..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Iniciada">Iniciada</SelectItem>
                <SelectItem value="Em Analise">Em Análise</SelectItem>
                <SelectItem value="Aprovada Nivel 1">Aprovada Nível 1</SelectItem>
                <SelectItem value="Aprovada Nivel 2">Aprovada Nível 2</SelectItem>
                <SelectItem value="Aprovada Nivel 3">Aprovada Nível 3</SelectItem>
                <SelectItem value="Rejeitada">Rejeitada</SelectItem>
                <SelectItem value="Implementada">Implementada</SelectItem>
                <SelectItem value="Concluida">Concluída</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="Temporaria">Temporária</SelectItem>
                <SelectItem value="Permanente">Permanente</SelectItem>
                <SelectItem value="Emergencial">Emergencial</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-gray-600">
              <Settings className="h-4 w-4 mr-2" />
              {filteredMudancas.length} mudança(s) encontrada(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Mudanças */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMudancas.map((mudanca) => {
          const progress = getProgressPercentage(mudanca)
          const approvalLevel = getApprovalLevel(mudanca)
          
          return (
            <Card key={mudanca.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-blue-600" />
                      {mudanca.numero_moc}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Target className="h-4 w-4 mr-1" />
                      {mudanca.categoria_mudanca}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(mudanca.status_moc)}
                    {getRiscoBadge(mudanca.nivel_risco)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="font-medium text-gray-900">
                    {mudanca.titulo_mudanca}
                  </div>
                  
                  {/* Progresso da Mudança */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Progresso:</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Tipo:</span>
                    <Badge variant="outline" className="ml-1">
                      {mudanca.tipo_mudanca}
                    </Badge>
                  </div>

                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Prioridade:</span>
                    <div className="ml-1">
                      {getPrioridadeBadge(mudanca.prioridade)}
                    </div>
                  </div>

                  {mudanca.area_afetada && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Área:</span>
                      <span className="ml-1 font-medium">{mudanca.area_afetada}</span>
                    </div>
                  )}

                  {mudanca.data_solicitacao && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Solicitada:</span>
                      <span className="ml-1 font-medium">
                        {new Date(mudanca.data_solicitacao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}

                  {mudanca.data_implementacao_prevista && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Implementação:</span>
                      <span className="ml-1 font-medium">
                        {new Date(mudanca.data_implementacao_prevista).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}

                  {/* Níveis de Aprovação */}
                  {approvalLevel > 0 && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Aprovações:</span>
                      <div className="ml-1 flex gap-1">
                        {[1, 2, 3].map(level => (
                          <Badge 
                            key={level}
                            variant={level <= approvalLevel ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            N{level}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {mudanca.Solicitante && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Solicitante:</span>
                      <span className="ml-1 font-medium">{mudanca.Solicitante.nome}</span>
                    </div>
                  )}
                </div>

                {mudanca.descricao_mudanca && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <strong>Descrição:</strong> {mudanca.descricao_mudanca.substring(0, 100)}
                    {mudanca.descricao_mudanca.length > 100 && '...'}
                  </div>
                )}

                {mudanca.justificativa_mudanca && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                    <strong>Justificativa:</strong> {mudanca.justificativa_mudanca.substring(0, 100)}
                    {mudanca.justificativa_mudanca.length > 100 && '...'}
                  </div>
                )}

                {/* Ações do Workflow */}
                {hasPermission('controle_mudancas', 'editar') && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t">
                    {getActionButtons(mudanca)}
                  </div>
                )}

                {/* Ações CRUD */}
                {(hasPermission('controle_mudancas', 'editar') || hasPermission('controle_mudancas', 'deletar')) && (
                  <div className="flex justify-end space-x-2 pt-2 border-t">
                    {hasPermission('controle_mudancas', 'editar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(mudanca)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    {hasPermission('controle_mudancas', 'deletar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(mudanca)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredMudancas.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma mudança encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || tipoFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro controle de mudança'
              }
            </p>
            {hasPermission('controle_mudancas', 'criar') && !searchTerm && statusFilter === 'all' && tipoFilter === 'all' && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Mudança
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ControleMudancas

