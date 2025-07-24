import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  Activity, 
  Settings,
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
  Zap
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

const API_BASE_URL = 'http://localhost:3001/api'

const MovimentacaoEstoque = ({ globalSearch }) => {
  const { hasPermission, token } = useAuth()
  const [movimentacoes, setMovimentacoes] = useState([])
  const [itensEstoque, setItensEstoque] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [filteredMovimentacoes, setFilteredMovimentacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tipoFilter, setTipoFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMovimentacao, setEditingMovimentacao] = useState(null)
  const [formData, setFormData] = useState({
    numero_movimentacao: '',
    item_estoque_id: '',
    tipo_movimentacao: 'Saida',
    quantidade_movimentada: '',
    unidade_medida: 'Unidade',
    data_solicitacao: '',
    data_aprovacao: '',
    data_execucao: '',
    data_devolucao_prevista: '',
    data_devolucao_real: '',
    status_movimentacao: 'Solicitada',
    prioridade: 'Normal',
    solicitante_id: '',
    aprovador_id: '',
    executor_id: '',
    setor_origem: '',
    setor_destino: '',
    localizacao_origem: '',
    localizacao_destino: '',
    motivo_movimentacao: '',
    numero_ordem_servico: '',
    numero_requisicao: '',
    centro_custo: '',
    projeto_associado: '',
    observacoes: ''
  })

  // Carregar dados
  useEffect(() => {
    fetchMovimentacoes()
    fetchItensEstoque()
    fetchUsuarios()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    applyFilters()
  }, [movimentacoes, searchTerm, statusFilter, tipoFilter, globalSearch])

  const fetchMovimentacoes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/movimentacao-estoque`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMovimentacoes(data.movimentacoes || data)
      } else {
        setError('Erro ao carregar movimentações de estoque')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const fetchItensEstoque = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/estoque`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setItensEstoque(data.itens || data)
      }
    } catch (err) {
      console.error('Erro ao carregar itens do estoque:', err)
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
    let filtered = [...movimentacoes]

    // Busca global
    const search = globalSearch || searchTerm
    if (search) {
      filtered = filtered.filter(mov =>
        mov.numero_movimentacao?.toLowerCase().includes(search.toLowerCase()) ||
        mov.tipo_movimentacao?.toLowerCase().includes(search.toLowerCase()) ||
        mov.motivo_movimentacao?.toLowerCase().includes(search.toLowerCase()) ||
        mov.ItemEstoque?.descricao_item?.toLowerCase().includes(search.toLowerCase()) ||
        mov.numero_ordem_servico?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(mov => mov.status_movimentacao === statusFilter)
    }

    // Filtro por tipo
    if (tipoFilter !== 'all') {
      filtered = filtered.filter(mov => mov.tipo_movimentacao === tipoFilter)
    }

    setFilteredMovimentacoes(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingMovimentacao 
        ? `${API_BASE_URL}/movimentacao-estoque/${editingMovimentacao.id}`
        : `${API_BASE_URL}/movimentacao-estoque`
      
      const method = editingMovimentacao ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          item_estoque_id: parseInt(formData.item_estoque_id),
          quantidade_movimentada: parseInt(formData.quantidade_movimentada),
          solicitante_id: formData.solicitante_id ? parseInt(formData.solicitante_id) : null,
          aprovador_id: formData.aprovador_id ? parseInt(formData.aprovador_id) : null,
          executor_id: formData.executor_id ? parseInt(formData.executor_id) : null
        })
      })

      if (response.ok) {
        await fetchMovimentacoes()
        setIsDialogOpen(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.message || 'Erro ao salvar movimentação de estoque')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (movimentacao, novoStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/movimentacao-estoque/${movimentacao.id}/${novoStatus.toLowerCase()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchMovimentacoes()
      } else {
        setError(`Erro ao ${novoStatus.toLowerCase()} movimentação`)
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const handleEdit = (movimentacao) => {
    setEditingMovimentacao(movimentacao)
    setFormData({
      numero_movimentacao: movimentacao.numero_movimentacao || '',
      item_estoque_id: movimentacao.item_estoque_id?.toString() || '',
      tipo_movimentacao: movimentacao.tipo_movimentacao || 'Saida',
      quantidade_movimentada: movimentacao.quantidade_movimentada?.toString() || '',
      unidade_medida: movimentacao.unidade_medida || 'Unidade',
      data_solicitacao: movimentacao.data_solicitacao ? 
        new Date(movimentacao.data_solicitacao).toISOString().split('T')[0] : '',
      data_aprovacao: movimentacao.data_aprovacao ? 
        new Date(movimentacao.data_aprovacao).toISOString().split('T')[0] : '',
      data_execucao: movimentacao.data_execucao ? 
        new Date(movimentacao.data_execucao).toISOString().split('T')[0] : '',
      data_devolucao_prevista: movimentacao.data_devolucao_prevista ? 
        new Date(movimentacao.data_devolucao_prevista).toISOString().split('T')[0] : '',
      data_devolucao_real: movimentacao.data_devolucao_real ? 
        new Date(movimentacao.data_devolucao_real).toISOString().split('T')[0] : '',
      status_movimentacao: movimentacao.status_movimentacao || 'Solicitada',
      prioridade: movimentacao.prioridade || 'Normal',
      solicitante_id: movimentacao.solicitante_id?.toString() || '',
      aprovador_id: movimentacao.aprovador_id?.toString() || '',
      executor_id: movimentacao.executor_id?.toString() || '',
      setor_origem: movimentacao.setor_origem || '',
      setor_destino: movimentacao.setor_destino || '',
      localizacao_origem: movimentacao.localizacao_origem || '',
      localizacao_destino: movimentacao.localizacao_destino || '',
      motivo_movimentacao: movimentacao.motivo_movimentacao || '',
      numero_ordem_servico: movimentacao.numero_ordem_servico || '',
      numero_requisicao: movimentacao.numero_requisicao || '',
      centro_custo: movimentacao.centro_custo || '',
      projeto_associado: movimentacao.projeto_associado || '',
      observacoes: movimentacao.observacoes || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (movimentacao) => {
    if (!confirm(`Tem certeza que deseja excluir a movimentação "${movimentacao.numero_movimentacao}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/movimentacao-estoque/${movimentacao.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchMovimentacoes()
      } else {
        setError('Erro ao excluir movimentação de estoque')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const resetForm = () => {
    setFormData({
      numero_movimentacao: '',
      item_estoque_id: '',
      tipo_movimentacao: 'Saida',
      quantidade_movimentada: '',
      unidade_medida: 'Unidade',
      data_solicitacao: '',
      data_aprovacao: '',
      data_execucao: '',
      data_devolucao_prevista: '',
      data_devolucao_real: '',
      status_movimentacao: 'Solicitada',
      prioridade: 'Normal',
      solicitante_id: '',
      aprovador_id: '',
      executor_id: '',
      setor_origem: '',
      setor_destino: '',
      localizacao_origem: '',
      localizacao_destino: '',
      motivo_movimentacao: '',
      numero_ordem_servico: '',
      numero_requisicao: '',
      centro_custo: '',
      projeto_associado: '',
      observacoes: ''
    })
    setEditingMovimentacao(null)
    setError('')
  }

  const getStatusBadge = (status) => {
    const configs = {
      'Solicitada': { variant: 'secondary', icon: Clock, color: 'text-blue-600' },
      'Aprovada': { variant: 'outline', icon: CheckCircle, color: 'text-green-600' },
      'Rejeitada': { variant: 'destructive', icon: AlertTriangle, color: 'text-red-600' },
      'Executada': { variant: 'default', icon: Activity, color: 'text-green-600' },
      'Devolvida': { variant: 'outline', icon: ArrowRight, color: 'text-blue-600' },
      'Cancelada': { variant: 'destructive', icon: AlertTriangle, color: 'text-red-600' }
    }
    
    const config = configs[status] || configs['Solicitada']
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
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

  const getProgressPercentage = (movimentacao) => {
    const statusProgress = {
      'Solicitada': 20,
      'Aprovada': 50,
      'Rejeitada': 0,
      'Executada': 80,
      'Devolvida': 100,
      'Cancelada': 0
    }
    return statusProgress[movimentacao.status_movimentacao] || 0
  }

  const calculateDaysOverdue = (dataPrevista) => {
    if (!dataPrevista) return null
    
    const hoje = new Date()
    const prevista = new Date(dataPrevista)
    const diffTime = hoje - prevista
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : null
  }

  const getActionButtons = (movimentacao) => {
    const buttons = []
    
    switch (movimentacao.status_movimentacao) {
      case 'Solicitada':
        buttons.push(
          <Button
            key="aprovar"
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(movimentacao, 'Aprovada')}
            className="text-green-600"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Aprovar
          </Button>
        )
        buttons.push(
          <Button
            key="rejeitar"
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(movimentacao, 'Rejeitada')}
            className="text-red-600"
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Rejeitar
          </Button>
        )
        break
      case 'Aprovada':
        buttons.push(
          <Button
            key="executar"
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(movimentacao, 'Executada')}
            className="text-blue-600"
          >
            <Activity className="h-4 w-4 mr-1" />
            Executar
          </Button>
        )
        break
      case 'Executada':
        if (movimentacao.tipo_movimentacao === 'Emprestimo') {
          buttons.push(
            <Button
              key="devolver"
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange(movimentacao, 'Devolvida')}
              className="text-green-600"
            >
              <ArrowRight className="h-4 w-4 mr-1" />
              Devolver
            </Button>
          )
        }
        break
    }

    if (movimentacao.status_movimentacao === 'Solicitada' || movimentacao.status_movimentacao === 'Aprovada') {
      buttons.push(
        <Button
          key="cancelar"
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange(movimentacao, 'Cancelada')}
          className="text-red-600"
        >
          <AlertTriangle className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
      )
    }

    return buttons
  }

  if (loading && movimentacoes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando movimentações de estoque...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Movimentação de Estoque</h2>
          <p className="text-gray-600">Gerencie as movimentações de entrada, saída e empréstimo</p>
        </div>

        {hasPermission('movimentacao_estoque', 'criar') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMovimentacao ? 'Editar Movimentação' : 'Nova Movimentação de Estoque'}
                </DialogTitle>
                <DialogDescription>
                  {editingMovimentacao 
                    ? 'Edite as informações da movimentação selecionada.'
                    : 'Adicione uma nova movimentação de estoque ao sistema.'
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numero_movimentacao">Número da Movimentação *</Label>
                    <Input
                      id="numero_movimentacao"
                      value={formData.numero_movimentacao}
                      onChange={(e) => setFormData({...formData, numero_movimentacao: e.target.value})}
                      placeholder="Ex: MOV-001-2025"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="item_estoque_id">Item do Estoque *</Label>
                    <Select value={formData.item_estoque_id} onValueChange={(value) => setFormData({...formData, item_estoque_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um item" />
                      </SelectTrigger>
                      <SelectContent>
                        {itensEstoque.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.numero_serie_equipamento} - {item.descricao_item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="tipo_movimentacao">Tipo de Movimentação</Label>
                    <Select value={formData.tipo_movimentacao} onValueChange={(value) => setFormData({...formData, tipo_movimentacao: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entrada">Entrada</SelectItem>
                        <SelectItem value="Saida">Saída</SelectItem>
                        <SelectItem value="Emprestimo">Empréstimo</SelectItem>
                        <SelectItem value="Transferencia">Transferência</SelectItem>
                        <SelectItem value="Devolucao">Devolução</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantidade_movimentada">Quantidade *</Label>
                    <Input
                      id="quantidade_movimentada"
                      type="number"
                      value={formData.quantidade_movimentada}
                      onChange={(e) => setFormData({...formData, quantidade_movimentada: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="unidade_medida">Unidade</Label>
                    <Select value={formData.unidade_medida} onValueChange={(value) => setFormData({...formData, unidade_medida: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Unidade">Unidade</SelectItem>
                        <SelectItem value="Metro">Metro</SelectItem>
                        <SelectItem value="Quilograma">Quilograma</SelectItem>
                        <SelectItem value="Litro">Litro</SelectItem>
                        <SelectItem value="Peça">Peça</SelectItem>
                        <SelectItem value="Conjunto">Conjunto</SelectItem>
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
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="status_movimentacao">Status</Label>
                    <Select value={formData.status_movimentacao} onValueChange={(value) => setFormData({...formData, status_movimentacao: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Solicitada">Solicitada</SelectItem>
                        <SelectItem value="Aprovada">Aprovada</SelectItem>
                        <SelectItem value="Rejeitada">Rejeitada</SelectItem>
                        <SelectItem value="Executada">Executada</SelectItem>
                        <SelectItem value="Devolvida">Devolvida</SelectItem>
                        <SelectItem value="Cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                    <Label htmlFor="data_aprovacao">Data de Aprovação</Label>
                    <Input
                      id="data_aprovacao"
                      type="date"
                      value={formData.data_aprovacao}
                      onChange={(e) => setFormData({...formData, data_aprovacao: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="data_execucao">Data de Execução</Label>
                    <Input
                      id="data_execucao"
                      type="date"
                      value={formData.data_execucao}
                      onChange={(e) => setFormData({...formData, data_execucao: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_devolucao_prevista">Devolução Prevista</Label>
                    <Input
                      id="data_devolucao_prevista"
                      type="date"
                      value={formData.data_devolucao_prevista}
                      onChange={(e) => setFormData({...formData, data_devolucao_prevista: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_devolucao_real">Devolução Real</Label>
                    <Input
                      id="data_devolucao_real"
                      type="date"
                      value={formData.data_devolucao_real}
                      onChange={(e) => setFormData({...formData, data_devolucao_real: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                    <Label htmlFor="aprovador_id">Aprovador</Label>
                    <Select value={formData.aprovador_id} onValueChange={(value) => setFormData({...formData, aprovador_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o aprovador" />
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
                    <Label htmlFor="executor_id">Executor</Label>
                    <Select value={formData.executor_id} onValueChange={(value) => setFormData({...formData, executor_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o executor" />
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="setor_origem">Setor de Origem</Label>
                    <Input
                      id="setor_origem"
                      value={formData.setor_origem}
                      onChange={(e) => setFormData({...formData, setor_origem: e.target.value})}
                      placeholder="Setor de origem"
                    />
                  </div>
                  <div>
                    <Label htmlFor="setor_destino">Setor de Destino</Label>
                    <Input
                      id="setor_destino"
                      value={formData.setor_destino}
                      onChange={(e) => setFormData({...formData, setor_destino: e.target.value})}
                      placeholder="Setor de destino"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="localizacao_origem">Localização de Origem</Label>
                    <Input
                      id="localizacao_origem"
                      value={formData.localizacao_origem}
                      onChange={(e) => setFormData({...formData, localizacao_origem: e.target.value})}
                      placeholder="Localização específica de origem"
                    />
                  </div>
                  <div>
                    <Label htmlFor="localizacao_destino">Localização de Destino</Label>
                    <Input
                      id="localizacao_destino"
                      value={formData.localizacao_destino}
                      onChange={(e) => setFormData({...formData, localizacao_destino: e.target.value})}
                      placeholder="Localização específica de destino"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="numero_ordem_servico">Número da OS</Label>
                    <Input
                      id="numero_ordem_servico"
                      value={formData.numero_ordem_servico}
                      onChange={(e) => setFormData({...formData, numero_ordem_servico: e.target.value})}
                      placeholder="Ordem de serviço"
                    />
                  </div>
                  <div>
                    <Label htmlFor="numero_requisicao">Número da Requisição</Label>
                    <Input
                      id="numero_requisicao"
                      value={formData.numero_requisicao}
                      onChange={(e) => setFormData({...formData, numero_requisicao: e.target.value})}
                      placeholder="Número da requisição"
                    />
                  </div>
                  <div>
                    <Label htmlFor="centro_custo">Centro de Custo</Label>
                    <Input
                      id="centro_custo"
                      value={formData.centro_custo}
                      onChange={(e) => setFormData({...formData, centro_custo: e.target.value})}
                      placeholder="Centro de custo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="projeto_associado">Projeto Associado</Label>
                    <Input
                      id="projeto_associado"
                      value={formData.projeto_associado}
                      onChange={(e) => setFormData({...formData, projeto_associado: e.target.value})}
                      placeholder="Nome do projeto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="motivo_movimentacao">Motivo da Movimentação</Label>
                    <Input
                      id="motivo_movimentacao"
                      value={formData.motivo_movimentacao}
                      onChange={(e) => setFormData({...formData, motivo_movimentacao: e.target.value})}
                      placeholder="Motivo da movimentação"
                    />
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
                    {loading ? 'Salvando...' : (editingMovimentacao ? 'Atualizar' : 'Criar')}
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
                placeholder="Buscar movimentações..."
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
                <SelectItem value="Solicitada">Solicitada</SelectItem>
                <SelectItem value="Aprovada">Aprovada</SelectItem>
                <SelectItem value="Rejeitada">Rejeitada</SelectItem>
                <SelectItem value="Executada">Executada</SelectItem>
                <SelectItem value="Devolvida">Devolvida</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="Entrada">Entrada</SelectItem>
                <SelectItem value="Saida">Saída</SelectItem>
                <SelectItem value="Emprestimo">Empréstimo</SelectItem>
                <SelectItem value="Transferencia">Transferência</SelectItem>
                <SelectItem value="Devolucao">Devolução</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-gray-600">
              <Activity className="h-4 w-4 mr-2" />
              {filteredMovimentacoes.length} movimentação(ões) encontrada(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Movimentações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMovimentacoes.map((movimentacao) => {
          const progress = getProgressPercentage(movimentacao)
          const diasAtraso = calculateDaysOverdue(movimentacao.data_devolucao_prevista)
          
          return (
            <Card key={movimentacao.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-blue-600" />
                      {movimentacao.numero_movimentacao}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <ArrowRight className="h-4 w-4 mr-1" />
                      {movimentacao.tipo_movimentacao}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(movimentacao.status_movimentacao)}
                    {getPrioridadeBadge(movimentacao.prioridade)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {movimentacao.ItemEstoque && (
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Item:</span>
                      <span className="ml-1 font-medium">{movimentacao.ItemEstoque.descricao_item}</span>
                    </div>
                  )}
                  
                  {/* Progresso da Movimentação */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Progresso:</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Quantidade:</span>
                    <Badge variant="outline" className="ml-1">
                      {movimentacao.quantidade_movimentada} {movimentacao.unidade_medida}
                    </Badge>
                  </div>

                  {(movimentacao.setor_origem || movimentacao.setor_destino) && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Rota:</span>
                      <span className="ml-1 font-medium text-xs">
                        {movimentacao.setor_origem || 'N/A'} → {movimentacao.setor_destino || 'N/A'}
                      </span>
                    </div>
                  )}

                  {movimentacao.data_solicitacao && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Solicitada:</span>
                      <span className="ml-1 font-medium">
                        {new Date(movimentacao.data_solicitacao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}

                  {movimentacao.data_execucao && (
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Executada:</span>
                      <span className="ml-1 font-medium">
                        {new Date(movimentacao.data_execucao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}

                  {diasAtraso && diasAtraso > 0 && (
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-red-600 font-medium">
                        Atrasada: {diasAtraso} dia(s)
                      </span>
                    </div>
                  )}

                  {movimentacao.Solicitante && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Solicitante:</span>
                      <span className="ml-1 font-medium">{movimentacao.Solicitante.nome}</span>
                    </div>
                  )}

                  {movimentacao.numero_ordem_servico && (
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">OS:</span>
                      <Badge variant="outline" className="ml-1">
                        {movimentacao.numero_ordem_servico}
                      </Badge>
                    </div>
                  )}
                </div>

                {movimentacao.motivo_movimentacao && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <strong>Motivo:</strong> {movimentacao.motivo_movimentacao}
                  </div>
                )}

                {movimentacao.observacoes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <strong>Observações:</strong> {movimentacao.observacoes}
                  </div>
                )}

                {/* Ações do Workflow */}
                {hasPermission('movimentacao_estoque', 'editar') && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t">
                    {getActionButtons(movimentacao)}
                  </div>
                )}

                {/* Ações CRUD */}
                {(hasPermission('movimentacao_estoque', 'editar') || hasPermission('movimentacao_estoque', 'deletar')) && (
                  <div className="flex justify-end space-x-2 pt-2 border-t">
                    {hasPermission('movimentacao_estoque', 'editar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(movimentacao)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    {hasPermission('movimentacao_estoque', 'deletar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(movimentacao)}
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

      {filteredMovimentacoes.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma movimentação encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || tipoFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira movimentação'
              }
            </p>
            {hasPermission('movimentacao_estoque', 'criar') && !searchTerm && statusFilter === 'all' && tipoFilter === 'all' && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Movimentação
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MovimentacaoEstoque

