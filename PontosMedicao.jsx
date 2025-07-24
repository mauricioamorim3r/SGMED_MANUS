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
  Zap, 
  MapPin, 
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
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

const API_BASE_URL = 'http://localhost:3001/api'

const PontosMedicao = ({ globalSearch }) => {
  const { hasPermission, token } = useAuth()
  const [pontos, setPontos] = useState([])
  const [instalacoes, setInstalacoes] = useState([])
  const [filteredPontos, setFilteredPontos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [instalacaoFilter, setInstalacaoFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPonto, setEditingPonto] = useState(null)
  const [formData, setFormData] = useState({
    tag_ponto: '',
    instalacao_id: '',
    tipo_medicao: 'Vazao',
    localizacao_ponto: '',
    descricao_processo: '',
    fluido_processo: '',
    condicoes_operacao: '',
    frequencia_calibracao_meses: 12,
    data_proxima_calibracao: '',
    status_ponto: 'Ativo',
    observacoes: ''
  })

  // Carregar dados
  useEffect(() => {
    fetchPontos()
    fetchInstalacoes()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    applyFilters()
  }, [pontos, searchTerm, statusFilter, instalacaoFilter, globalSearch])

  const fetchPontos = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/pontos-medicao`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPontos(data.pontos || data)
      } else {
        setError('Erro ao carregar pontos de medição')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const fetchInstalacoes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/instalacoes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setInstalacoes(data.instalacoes || data)
      }
    } catch (err) {
      console.error('Erro ao carregar instalações:', err)
    }
  }

  const applyFilters = () => {
    let filtered = [...pontos]

    // Busca global
    const search = globalSearch || searchTerm
    if (search) {
      filtered = filtered.filter(ponto =>
        ponto.tag_ponto?.toLowerCase().includes(search.toLowerCase()) ||
        ponto.localizacao_ponto?.toLowerCase().includes(search.toLowerCase()) ||
        ponto.descricao_processo?.toLowerCase().includes(search.toLowerCase()) ||
        ponto.fluido_processo?.toLowerCase().includes(search.toLowerCase()) ||
        ponto.Instalacao?.nome_instalacao?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ponto => ponto.status_ponto === statusFilter)
    }

    // Filtro por instalação
    if (instalacaoFilter !== 'all') {
      filtered = filtered.filter(ponto => ponto.instalacao_id === parseInt(instalacaoFilter))
    }

    setFilteredPontos(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingPonto 
        ? `${API_BASE_URL}/pontos-medicao/${editingPonto.id}`
        : `${API_BASE_URL}/pontos-medicao`
      
      const method = editingPonto ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          instalacao_id: parseInt(formData.instalacao_id),
          frequencia_calibracao_meses: parseInt(formData.frequencia_calibracao_meses)
        })
      })

      if (response.ok) {
        await fetchPontos()
        setIsDialogOpen(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.message || 'Erro ao salvar ponto de medição')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (ponto) => {
    setEditingPonto(ponto)
    setFormData({
      tag_ponto: ponto.tag_ponto || '',
      instalacao_id: ponto.instalacao_id?.toString() || '',
      tipo_medicao: ponto.tipo_medicao || 'Vazao',
      localizacao_ponto: ponto.localizacao_ponto || '',
      descricao_processo: ponto.descricao_processo || '',
      fluido_processo: ponto.fluido_processo || '',
      condicoes_operacao: ponto.condicoes_operacao || '',
      frequencia_calibracao_meses: ponto.frequencia_calibracao_meses || 12,
      data_proxima_calibracao: ponto.data_proxima_calibracao ? 
        new Date(ponto.data_proxima_calibracao).toISOString().split('T')[0] : '',
      status_ponto: ponto.status_ponto || 'Ativo',
      observacoes: ponto.observacoes || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (ponto) => {
    if (!confirm(`Tem certeza que deseja excluir o ponto "${ponto.tag_ponto}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/pontos-medicao/${ponto.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchPontos()
      } else {
        setError('Erro ao excluir ponto de medição')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const resetForm = () => {
    setFormData({
      tag_ponto: '',
      instalacao_id: '',
      tipo_medicao: 'Vazao',
      localizacao_ponto: '',
      descricao_processo: '',
      fluido_processo: '',
      condicoes_operacao: '',
      frequencia_calibracao_meses: 12,
      data_proxima_calibracao: '',
      status_ponto: 'Ativo',
      observacoes: ''
    })
    setEditingPonto(null)
    setError('')
  }

  const getStatusBadge = (status) => {
    const configs = {
      'Ativo': { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      'Inativo': { variant: 'secondary', icon: AlertTriangle, color: 'text-gray-600' },
      'Manutencao': { variant: 'destructive', icon: AlertTriangle, color: 'text-orange-600' },
      'Descomissionado': { variant: 'outline', icon: AlertTriangle, color: 'text-red-600' }
    }
    
    const config = configs[status] || configs['Ativo']
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const getTipoMedicaoIcon = (tipo) => {
    const icons = {
      'Vazao': Zap,
      'Pressao': Target,
      'Temperatura': Activity,
      'Nivel': Activity,
      'Densidade': Activity,
      'Outros': Activity
    }
    return icons[tipo] || Activity
  }

  const getCalibracaoStatus = (dataProxima) => {
    if (!dataProxima) return { status: 'Sem Programação', color: 'text-gray-500', days: null }
    
    const hoje = new Date()
    const proxima = new Date(dataProxima)
    const diffTime = proxima - hoje
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { status: 'Vencido', color: 'text-red-600', days: Math.abs(diffDays) }
    } else if (diffDays <= 7) {
      return { status: 'Urgente', color: 'text-orange-600', days: diffDays }
    } else if (diffDays <= 30) {
      return { status: 'Atenção', color: 'text-yellow-600', days: diffDays }
    } else {
      return { status: 'Em Dia', color: 'text-green-600', days: diffDays }
    }
  }

  if (loading && pontos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pontos de medição...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Pontos de Medição</h2>
          <p className="text-gray-600">Gerencie os pontos de medição do sistema</p>
        </div>

        {hasPermission('pontos_medicao', 'criar') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Ponto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPonto ? 'Editar Ponto de Medição' : 'Novo Ponto de Medição'}
                </DialogTitle>
                <DialogDescription>
                  {editingPonto 
                    ? 'Edite as informações do ponto de medição selecionado.'
                    : 'Adicione um novo ponto de medição ao sistema.'
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tag_ponto">TAG do Ponto *</Label>
                    <Input
                      id="tag_ponto"
                      value={formData.tag_ponto}
                      onChange={(e) => setFormData({...formData, tag_ponto: e.target.value})}
                      placeholder="Ex: FT-001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="instalacao_id">Instalação *</Label>
                    <Select value={formData.instalacao_id} onValueChange={(value) => setFormData({...formData, instalacao_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma instalação" />
                      </SelectTrigger>
                      <SelectContent>
                        {instalacoes.map((instalacao) => (
                          <SelectItem key={instalacao.id} value={instalacao.id.toString()}>
                            {instalacao.nome_instalacao} ({instalacao.codigo_instalacao})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo_medicao">Tipo de Medição</Label>
                    <Select value={formData.tipo_medicao} onValueChange={(value) => setFormData({...formData, tipo_medicao: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vazao">Vazão</SelectItem>
                        <SelectItem value="Pressao">Pressão</SelectItem>
                        <SelectItem value="Temperatura">Temperatura</SelectItem>
                        <SelectItem value="Nivel">Nível</SelectItem>
                        <SelectItem value="Densidade">Densidade</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status_ponto">Status</Label>
                    <Select value={formData.status_ponto} onValueChange={(value) => setFormData({...formData, status_ponto: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                        <SelectItem value="Manutencao">Manutenção</SelectItem>
                        <SelectItem value="Descomissionado">Descomissionado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="localizacao_ponto">Localização do Ponto</Label>
                  <Input
                    id="localizacao_ponto"
                    value={formData.localizacao_ponto}
                    onChange={(e) => setFormData({...formData, localizacao_ponto: e.target.value})}
                    placeholder="Ex: Linha de produção principal"
                  />
                </div>

                <div>
                  <Label htmlFor="descricao_processo">Descrição do Processo</Label>
                  <Textarea
                    id="descricao_processo"
                    value={formData.descricao_processo}
                    onChange={(e) => setFormData({...formData, descricao_processo: e.target.value})}
                    rows={2}
                    placeholder="Descreva o processo de medição"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fluido_processo">Fluido do Processo</Label>
                    <Input
                      id="fluido_processo"
                      value={formData.fluido_processo}
                      onChange={(e) => setFormData({...formData, fluido_processo: e.target.value})}
                      placeholder="Ex: Gás natural, Petróleo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="condicoes_operacao">Condições de Operação</Label>
                    <Input
                      id="condicoes_operacao"
                      value={formData.condicoes_operacao}
                      onChange={(e) => setFormData({...formData, condicoes_operacao: e.target.value})}
                      placeholder="Ex: 50 bar, 80°C"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequencia_calibracao_meses">Frequência de Calibração (meses)</Label>
                    <Input
                      id="frequencia_calibracao_meses"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.frequencia_calibracao_meses}
                      onChange={(e) => setFormData({...formData, frequencia_calibracao_meses: parseInt(e.target.value) || 12})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_proxima_calibracao">Próxima Calibração</Label>
                    <Input
                      id="data_proxima_calibracao"
                      type="date"
                      value={formData.data_proxima_calibracao}
                      onChange={(e) => setFormData({...formData, data_proxima_calibracao: e.target.value})}
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
                    {loading ? 'Salvando...' : (editingPonto ? 'Atualizar' : 'Criar')}
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
                placeholder="Buscar pontos..."
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
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
                <SelectItem value="Manutencao">Manutenção</SelectItem>
                <SelectItem value="Descomissionado">Descomissionado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={instalacaoFilter} onValueChange={setInstalacaoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por instalação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Instalações</SelectItem>
                {instalacoes.map((instalacao) => (
                  <SelectItem key={instalacao.id} value={instalacao.id.toString()}>
                    {instalacao.nome_instalacao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-gray-600">
              <Activity className="h-4 w-4 mr-2" />
              {filteredPontos.length} ponto(s) encontrado(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pontos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPontos.map((ponto) => {
          const TipoIcon = getTipoMedicaoIcon(ponto.tipo_medicao)
          const calibracao = getCalibracaoStatus(ponto.data_proxima_calibracao)
          
          return (
            <Card key={ponto.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <TipoIcon className="h-5 w-5 mr-2 text-blue-600" />
                      {ponto.tag_ponto}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {ponto.tipo_medicao}
                    </CardDescription>
                  </div>
                  {getStatusBadge(ponto.status_ponto)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {ponto.Instalacao && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Instalação:</span>
                      <span className="ml-1 font-medium">{ponto.Instalacao.nome_instalacao}</span>
                    </div>
                  )}
                  
                  {ponto.localizacao_ponto && (
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Local:</span>
                      <span className="ml-1 font-medium">{ponto.localizacao_ponto}</span>
                    </div>
                  )}

                  {ponto.fluido_processo && (
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Fluido:</span>
                      <span className="ml-1 font-medium">{ponto.fluido_processo}</span>
                    </div>
                  )}

                  {ponto.data_proxima_calibracao && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Próxima Calibração:</span>
                      <span className={`ml-1 font-medium ${calibracao.color}`}>
                        {new Date(ponto.data_proxima_calibracao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}

                  {calibracao.status !== 'Sem Programação' && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Status Calibração:</span>
                      <Badge variant="outline" className={`ml-1 ${calibracao.color}`}>
                        {calibracao.status}
                        {calibracao.days !== null && (
                          <span className="ml-1">
                            ({calibracao.days}d)
                          </span>
                        )}
                      </Badge>
                    </div>
                  )}
                </div>

                {ponto.descricao_processo && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <strong>Processo:</strong> {ponto.descricao_processo}
                  </div>
                )}

                {ponto.observacoes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <strong>Observações:</strong> {ponto.observacoes}
                  </div>
                )}

                {(hasPermission('pontos_medicao', 'editar') || hasPermission('pontos_medicao', 'deletar')) && (
                  <div className="flex justify-end space-x-2 pt-3 border-t">
                    {hasPermission('pontos_medicao', 'editar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(ponto)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    {hasPermission('pontos_medicao', 'deletar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(ponto)}
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

      {filteredPontos.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum ponto de medição encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || instalacaoFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro ponto de medição'
              }
            </p>
            {hasPermission('pontos_medicao', 'criar') && !searchTerm && statusFilter === 'all' && instalacaoFilter === 'all' && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Ponto
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PontosMedicao

