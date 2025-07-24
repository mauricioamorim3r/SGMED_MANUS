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
  BarChart3
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

const Estoque = ({ globalSearch }) => {
  const { hasPermission, token } = useAuth()
  const [itens, setItens] = useState([])
  const [equipamentos, setEquipamentos] = useState([])
  const [filteredItens, setFilteredItens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [setorFilter, setSetorFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    numero_serie_equipamento: '',
    descricao_item: '',
    categoria_item: 'Equipamento',
    setor_estoque: 'Almoxarifado',
    localizacao_fisica: '',
    prateleira: '',
    posicao: '',
    codigo_barras: '',
    numero_patrimonio: '',
    fornecedor: '',
    data_aquisicao: '',
    valor_aquisicao: '',
    status_estoque: 'Disponivel',
    quantidade_disponivel: '1',
    quantidade_reservada: '0',
    unidade_medida: 'Unidade',
    data_ultima_inspecao: '',
    periodicidade_inspecao_meses: '',
    proxima_inspecao: '',
    data_vencimento_garantia: '',
    garantia_fabricante_meses: '',
    em_quarentena: false,
    data_inicio_quarentena: '',
    motivo_quarentena: '',
    observacoes: ''
  })

  // Carregar dados
  useEffect(() => {
    fetchItens()
    fetchEquipamentos()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    applyFilters()
  }, [itens, searchTerm, statusFilter, setorFilter, globalSearch])

  const fetchItens = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/estoque`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setItens(data.itens || data)
      } else {
        setError('Erro ao carregar itens do estoque')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const fetchEquipamentos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/equipamentos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEquipamentos(data.equipamentos || data)
      }
    } catch (err) {
      console.error('Erro ao carregar equipamentos:', err)
    }
  }

  const applyFilters = () => {
    let filtered = [...itens]

    // Busca global
    const search = globalSearch || searchTerm
    if (search) {
      filtered = filtered.filter(item =>
        item.numero_serie_equipamento?.toLowerCase().includes(search.toLowerCase()) ||
        item.descricao_item?.toLowerCase().includes(search.toLowerCase()) ||
        item.categoria_item?.toLowerCase().includes(search.toLowerCase()) ||
        item.fornecedor?.toLowerCase().includes(search.toLowerCase()) ||
        item.numero_patrimonio?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status_estoque === statusFilter)
    }

    // Filtro por setor
    if (setorFilter !== 'all') {
      filtered = filtered.filter(item => item.setor_estoque === setorFilter)
    }

    setFilteredItens(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingItem 
        ? `${API_BASE_URL}/estoque/${editingItem.id}`
        : `${API_BASE_URL}/estoque`
      
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          valor_aquisicao: parseFloat(formData.valor_aquisicao) || null,
          quantidade_disponivel: parseInt(formData.quantidade_disponivel) || 1,
          quantidade_reservada: parseInt(formData.quantidade_reservada) || 0,
          periodicidade_inspecao_meses: parseInt(formData.periodicidade_inspecao_meses) || null,
          garantia_fabricante_meses: parseInt(formData.garantia_fabricante_meses) || null,
          em_quarentena: formData.em_quarentena === 'true' || formData.em_quarentena === true
        })
      })

      if (response.ok) {
        await fetchItens()
        setIsDialogOpen(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.message || 'Erro ao salvar item do estoque')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusAction = async (item, action) => {
    try {
      const response = await fetch(`${API_BASE_URL}/estoque/${item.id}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchItens()
      } else {
        setError(`Erro ao ${action} item`)
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      numero_serie_equipamento: item.numero_serie_equipamento || '',
      descricao_item: item.descricao_item || '',
      categoria_item: item.categoria_item || 'Equipamento',
      setor_estoque: item.setor_estoque || 'Almoxarifado',
      localizacao_fisica: item.localizacao_fisica || '',
      prateleira: item.prateleira || '',
      posicao: item.posicao || '',
      codigo_barras: item.codigo_barras || '',
      numero_patrimonio: item.numero_patrimonio || '',
      fornecedor: item.fornecedor || '',
      data_aquisicao: item.data_aquisicao ? 
        new Date(item.data_aquisicao).toISOString().split('T')[0] : '',
      valor_aquisicao: item.valor_aquisicao?.toString() || '',
      status_estoque: item.status_estoque || 'Disponivel',
      quantidade_disponivel: item.quantidade_disponivel?.toString() || '1',
      quantidade_reservada: item.quantidade_reservada?.toString() || '0',
      unidade_medida: item.unidade_medida || 'Unidade',
      data_ultima_inspecao: item.data_ultima_inspecao ? 
        new Date(item.data_ultima_inspecao).toISOString().split('T')[0] : '',
      periodicidade_inspecao_meses: item.periodicidade_inspecao_meses?.toString() || '',
      proxima_inspecao: item.proxima_inspecao ? 
        new Date(item.proxima_inspecao).toISOString().split('T')[0] : '',
      data_vencimento_garantia: item.data_vencimento_garantia ? 
        new Date(item.data_vencimento_garantia).toISOString().split('T')[0] : '',
      garantia_fabricante_meses: item.garantia_fabricante_meses?.toString() || '',
      em_quarentena: item.em_quarentena || false,
      data_inicio_quarentena: item.data_inicio_quarentena ? 
        new Date(item.data_inicio_quarentena).toISOString().split('T')[0] : '',
      motivo_quarentena: item.motivo_quarentena || '',
      observacoes: item.observacoes || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (item) => {
    if (!confirm(`Tem certeza que deseja excluir o item "${item.descricao_item}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/estoque/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchItens()
      } else {
        setError('Erro ao excluir item do estoque')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const resetForm = () => {
    setFormData({
      numero_serie_equipamento: '',
      descricao_item: '',
      categoria_item: 'Equipamento',
      setor_estoque: 'Almoxarifado',
      localizacao_fisica: '',
      prateleira: '',
      posicao: '',
      codigo_barras: '',
      numero_patrimonio: '',
      fornecedor: '',
      data_aquisicao: '',
      valor_aquisicao: '',
      status_estoque: 'Disponivel',
      quantidade_disponivel: '1',
      quantidade_reservada: '0',
      unidade_medida: 'Unidade',
      data_ultima_inspecao: '',
      periodicidade_inspecao_meses: '',
      proxima_inspecao: '',
      data_vencimento_garantia: '',
      garantia_fabricante_meses: '',
      em_quarentena: false,
      data_inicio_quarentena: '',
      motivo_quarentena: '',
      observacoes: ''
    })
    setEditingItem(null)
    setError('')
  }

  const getStatusBadge = (status) => {
    const configs = {
      'Disponivel': { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      'Reservado': { variant: 'secondary', icon: Lock, color: 'text-blue-600' },
      'Emprestado': { variant: 'outline', icon: Activity, color: 'text-orange-600' },
      'Manutencao': { variant: 'destructive', icon: AlertTriangle, color: 'text-red-600' },
      'Descartado': { variant: 'outline', icon: AlertTriangle, color: 'text-gray-600' }
    }
    
    const config = configs[status] || configs['Disponivel']
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const getGarantiaStatus = (dataVencimento) => {
    if (!dataVencimento) return null
    
    const hoje = new Date()
    const vencimento = new Date(dataVencimento)
    const diffTime = vencimento - hoje
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { status: 'vencida', color: 'destructive', text: 'Vencida' }
    } else if (diffDays <= 30) {
      return { status: 'vencendo', color: 'outline', text: `${diffDays} dias` }
    } else {
      return { status: 'vigente', color: 'default', text: 'Vigente' }
    }
  }

  const getInspecaoStatus = (proximaInspecao) => {
    if (!proximaInspecao) return null
    
    const hoje = new Date()
    const proxima = new Date(proximaInspecao)
    const diffTime = proxima - hoje
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { status: 'vencida', color: 'destructive', text: 'Vencida' }
    } else if (diffDays <= 15) {
      return { status: 'urgente', color: 'outline', text: `${diffDays} dias` }
    } else {
      return { status: 'ok', color: 'default', text: 'Em dia' }
    }
  }

  const getActionButtons = (item) => {
    const buttons = []
    
    if (item.status_estoque === 'Disponivel') {
      buttons.push(
        <Button
          key="reservar"
          size="sm"
          variant="outline"
          onClick={() => handleStatusAction(item, 'reservar')}
          className="text-blue-600"
        >
          <Lock className="h-4 w-4 mr-1" />
          Reservar
        </Button>
      )
    }
    
    if (item.status_estoque === 'Reservado') {
      buttons.push(
        <Button
          key="liberar"
          size="sm"
          variant="outline"
          onClick={() => handleStatusAction(item, 'liberar-reserva')}
          className="text-green-600"
        >
          <Unlock className="h-4 w-4 mr-1" />
          Liberar
        </Button>
      )
    }
    
    if (!item.em_quarentena && item.status_estoque !== 'Descartado') {
      buttons.push(
        <Button
          key="quarentena"
          size="sm"
          variant="outline"
          onClick={() => handleStatusAction(item, 'quarentena')}
          className="text-orange-600"
        >
          <AlertTriangle className="h-4 w-4 mr-1" />
          Quarentena
        </Button>
      )
    }
    
    if (item.em_quarentena) {
      buttons.push(
        <Button
          key="liberar-quarentena"
          size="sm"
          variant="outline"
          onClick={() => handleStatusAction(item, 'liberar-quarentena')}
          className="text-green-600"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Liberar Quarentena
        </Button>
      )
    }

    return buttons
  }

  if (loading && itens.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando itens do estoque...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Estoque</h2>
          <p className="text-gray-600">Gerencie o inventário de equipamentos e materiais</p>
        </div>

        {hasPermission('estoque', 'criar') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Editar Item do Estoque' : 'Novo Item do Estoque'}
                </DialogTitle>
                <DialogDescription>
                  {editingItem 
                    ? 'Edite as informações do item selecionado.'
                    : 'Adicione um novo item ao estoque.'
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numero_serie_equipamento">Número de Série *</Label>
                    <Input
                      id="numero_serie_equipamento"
                      value={formData.numero_serie_equipamento}
                      onChange={(e) => setFormData({...formData, numero_serie_equipamento: e.target.value})}
                      placeholder="Ex: EQ-001-2025"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="descricao_item">Descrição do Item *</Label>
                    <Input
                      id="descricao_item"
                      value={formData.descricao_item}
                      onChange={(e) => setFormData({...formData, descricao_item: e.target.value})}
                      placeholder="Descrição detalhada"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="categoria_item">Categoria</Label>
                    <Select value={formData.categoria_item} onValueChange={(value) => setFormData({...formData, categoria_item: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Equipamento">Equipamento</SelectItem>
                        <SelectItem value="Ferramenta">Ferramenta</SelectItem>
                        <SelectItem value="Material">Material</SelectItem>
                        <SelectItem value="Peça de Reposição">Peça de Reposição</SelectItem>
                        <SelectItem value="Consumível">Consumível</SelectItem>
                        <SelectItem value="EPI">EPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="setor_estoque">Setor do Estoque</Label>
                    <Select value={formData.setor_estoque} onValueChange={(value) => setFormData({...formData, setor_estoque: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Almoxarifado">Almoxarifado</SelectItem>
                        <SelectItem value="Oficina">Oficina</SelectItem>
                        <SelectItem value="Laboratorio">Laboratório</SelectItem>
                        <SelectItem value="Campo">Campo</SelectItem>
                        <SelectItem value="Manutencao">Manutenção</SelectItem>
                        <SelectItem value="Quarentena">Quarentena</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status_estoque">Status</Label>
                    <Select value={formData.status_estoque} onValueChange={(value) => setFormData({...formData, status_estoque: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Disponivel">Disponível</SelectItem>
                        <SelectItem value="Reservado">Reservado</SelectItem>
                        <SelectItem value="Emprestado">Emprestado</SelectItem>
                        <SelectItem value="Manutencao">Manutenção</SelectItem>
                        <SelectItem value="Descartado">Descartado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="localizacao_fisica">Localização Física</Label>
                    <Input
                      id="localizacao_fisica"
                      value={formData.localizacao_fisica}
                      onChange={(e) => setFormData({...formData, localizacao_fisica: e.target.value})}
                      placeholder="Ex: Galpão A"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prateleira">Prateleira</Label>
                    <Input
                      id="prateleira"
                      value={formData.prateleira}
                      onChange={(e) => setFormData({...formData, prateleira: e.target.value})}
                      placeholder="Ex: P-01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="posicao">Posição</Label>
                    <Input
                      id="posicao"
                      value={formData.posicao}
                      onChange={(e) => setFormData({...formData, posicao: e.target.value})}
                      placeholder="Ex: A1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="codigo_barras">Código de Barras</Label>
                    <Input
                      id="codigo_barras"
                      value={formData.codigo_barras}
                      onChange={(e) => setFormData({...formData, codigo_barras: e.target.value})}
                      placeholder="Código único"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="numero_patrimonio">Número do Patrimônio</Label>
                    <Input
                      id="numero_patrimonio"
                      value={formData.numero_patrimonio}
                      onChange={(e) => setFormData({...formData, numero_patrimonio: e.target.value})}
                      placeholder="Número patrimonial"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fornecedor">Fornecedor</Label>
                    <Input
                      id="fornecedor"
                      value={formData.fornecedor}
                      onChange={(e) => setFormData({...formData, fornecedor: e.target.value})}
                      placeholder="Nome do fornecedor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_aquisicao">Data de Aquisição</Label>
                    <Input
                      id="data_aquisicao"
                      type="date"
                      value={formData.data_aquisicao}
                      onChange={(e) => setFormData({...formData, data_aquisicao: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="valor_aquisicao">Valor de Aquisição (R$)</Label>
                    <Input
                      id="valor_aquisicao"
                      type="number"
                      step="0.01"
                      value={formData.valor_aquisicao}
                      onChange={(e) => setFormData({...formData, valor_aquisicao: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantidade_disponivel">Quantidade Disponível</Label>
                    <Input
                      id="quantidade_disponivel"
                      type="number"
                      value={formData.quantidade_disponivel}
                      onChange={(e) => setFormData({...formData, quantidade_disponivel: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantidade_reservada">Quantidade Reservada</Label>
                    <Input
                      id="quantidade_reservada"
                      type="number"
                      value={formData.quantidade_reservada}
                      onChange={(e) => setFormData({...formData, quantidade_reservada: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unidade_medida">Unidade de Medida</Label>
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
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="data_ultima_inspecao">Última Inspeção</Label>
                    <Input
                      id="data_ultima_inspecao"
                      type="date"
                      value={formData.data_ultima_inspecao}
                      onChange={(e) => setFormData({...formData, data_ultima_inspecao: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="periodicidade_inspecao_meses">Periodicidade Inspeção (meses)</Label>
                    <Input
                      id="periodicidade_inspecao_meses"
                      type="number"
                      value={formData.periodicidade_inspecao_meses}
                      onChange={(e) => setFormData({...formData, periodicidade_inspecao_meses: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="proxima_inspecao">Próxima Inspeção</Label>
                    <Input
                      id="proxima_inspecao"
                      type="date"
                      value={formData.proxima_inspecao}
                      onChange={(e) => setFormData({...formData, proxima_inspecao: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data_vencimento_garantia">Vencimento da Garantia</Label>
                    <Input
                      id="data_vencimento_garantia"
                      type="date"
                      value={formData.data_vencimento_garantia}
                      onChange={(e) => setFormData({...formData, data_vencimento_garantia: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="garantia_fabricante_meses">Garantia Fabricante (meses)</Label>
                    <Input
                      id="garantia_fabricante_meses"
                      type="number"
                      value={formData.garantia_fabricante_meses}
                      onChange={(e) => setFormData({...formData, garantia_fabricante_meses: e.target.value})}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold mb-3">Quarentena</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="em_quarentena">Em Quarentena</Label>
                      <Select value={formData.em_quarentena.toString()} onValueChange={(value) => setFormData({...formData, em_quarentena: value === 'true'})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">Não</SelectItem>
                          <SelectItem value="true">Sim</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="data_inicio_quarentena">Data Início Quarentena</Label>
                      <Input
                        id="data_inicio_quarentena"
                        type="date"
                        value={formData.data_inicio_quarentena}
                        onChange={(e) => setFormData({...formData, data_inicio_quarentena: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="motivo_quarentena">Motivo da Quarentena</Label>
                      <Input
                        id="motivo_quarentena"
                        value={formData.motivo_quarentena}
                        onChange={(e) => setFormData({...formData, motivo_quarentena: e.target.value})}
                        placeholder="Motivo da quarentena"
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
                    {loading ? 'Salvando...' : (editingItem ? 'Atualizar' : 'Criar')}
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
                placeholder="Buscar itens..."
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
                <SelectItem value="Disponivel">Disponível</SelectItem>
                <SelectItem value="Reservado">Reservado</SelectItem>
                <SelectItem value="Emprestado">Emprestado</SelectItem>
                <SelectItem value="Manutencao">Manutenção</SelectItem>
                <SelectItem value="Descartado">Descartado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={setorFilter} onValueChange={setSetorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Setores</SelectItem>
                <SelectItem value="Almoxarifado">Almoxarifado</SelectItem>
                <SelectItem value="Oficina">Oficina</SelectItem>
                <SelectItem value="Laboratorio">Laboratório</SelectItem>
                <SelectItem value="Campo">Campo</SelectItem>
                <SelectItem value="Manutencao">Manutenção</SelectItem>
                <SelectItem value="Quarentena">Quarentena</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-gray-600">
              <Package className="h-4 w-4 mr-2" />
              {filteredItens.length} item(ns) encontrado(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Itens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItens.map((item) => {
          const garantiaStatus = getGarantiaStatus(item.data_vencimento_garantia)
          const inspecaoStatus = getInspecaoStatus(item.proxima_inspecao)
          
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <Package className="h-5 w-5 mr-2 text-blue-600" />
                      {item.numero_serie_equipamento}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Target className="h-4 w-4 mr-1" />
                      {item.categoria_item}
                    </CardDescription>
                  </div>
                  {getStatusBadge(item.status_estoque)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="font-medium text-gray-900">
                    {item.descricao_item}
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Setor:</span>
                    <Badge variant="outline" className="ml-1">
                      {item.setor_estoque}
                    </Badge>
                  </div>

                  {(item.localizacao_fisica || item.prateleira || item.posicao) && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Local:</span>
                      <span className="ml-1 font-medium">
                        {[item.localizacao_fisica, item.prateleira, item.posicao].filter(Boolean).join(' - ')}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Disponível:</span>
                      <span className="ml-1 font-medium">{item.quantidade_disponivel}</span>
                    </div>
                    {item.quantidade_reservada > 0 && (
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">Reservado:</span>
                        <span className="ml-1 font-medium">{item.quantidade_reservada}</span>
                      </div>
                    )}
                  </div>

                  {item.fornecedor && (
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Fornecedor:</span>
                      <span className="ml-1 font-medium">{item.fornecedor}</span>
                    </div>
                  )}

                  {garantiaStatus && (
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Garantia:</span>
                      <Badge variant={garantiaStatus.color} className="ml-1">
                        {garantiaStatus.text}
                      </Badge>
                    </div>
                  )}

                  {inspecaoStatus && (
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Inspeção:</span>
                      <Badge variant={inspecaoStatus.color} className="ml-1">
                        {inspecaoStatus.text}
                      </Badge>
                    </div>
                  )}

                  {item.em_quarentena && (
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                      <span className="text-orange-600 font-medium">Em Quarentena</span>
                      {item.motivo_quarentena && (
                        <span className="ml-1 text-xs text-gray-500">
                          ({item.motivo_quarentena})
                        </span>
                      )}
                    </div>
                  )}

                  {item.data_aquisicao && (
                    <div className="text-xs text-gray-500">
                      Adquirido em: {new Date(item.data_aquisicao).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>

                {item.observacoes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <strong>Observações:</strong> {item.observacoes}
                  </div>
                )}

                {/* Ações de Status */}
                {hasPermission('estoque', 'editar') && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t">
                    {getActionButtons(item)}
                  </div>
                )}

                {/* Ações CRUD */}
                {(hasPermission('estoque', 'editar') || hasPermission('estoque', 'deletar')) && (
                  <div className="flex justify-end space-x-2 pt-2 border-t">
                    {hasPermission('estoque', 'editar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    {hasPermission('estoque', 'deletar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item)}
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

      {filteredItens.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum item encontrado no estoque
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || setorFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando seu primeiro item ao estoque'
              }
            </p>
            {hasPermission('estoque', 'criar') && !searchTerm && statusFilter === 'all' && setorFilter === 'all' && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Item
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Estoque

