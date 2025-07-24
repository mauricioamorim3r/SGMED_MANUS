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
  Target, 
  Ruler, 
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Calculator
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

const PlacasOrificio = ({ globalSearch }) => {
  const { hasPermission, token } = useAuth()
  const [placas, setPlacas] = useState([])
  const [pontos, setPontos] = useState([])
  const [filteredPlacas, setFilteredPlacas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tipoFilter, setTipoFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlaca, setEditingPlaca] = useState(null)
  const [formData, setFormData] = useState({
    numero_serie_placa: '',
    ponto_medicao_id: '',
    tipo_placa: 'Concêntrica',
    diametro_orificio_mm: '',
    diametro_tubulacao_mm: '',
    espessura_placa_mm: '',
    material_placa: 'Aço Inoxidável 316',
    acabamento_orificio: 'Usinado',
    conformidade_a_qual_norma: 'Conforme AGA 3',
    data_fabricacao: '',
    data_instalacao: '',
    status_placa: 'Instalada',
    observacoes: ''
  })

  // Carregar dados
  useEffect(() => {
    fetchPlacas()
    fetchPontos()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    applyFilters()
  }, [placas, searchTerm, statusFilter, tipoFilter, globalSearch])

  const fetchPlacas = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/placas-orificio`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPlacas(data.placas || data)
      } else {
        setError('Erro ao carregar placas de orifício')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const fetchPontos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pontos-medicao`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPontos(data.pontos || data)
      }
    } catch (err) {
      console.error('Erro ao carregar pontos:', err)
    }
  }

  const applyFilters = () => {
    let filtered = [...placas]

    // Busca global
    const search = globalSearch || searchTerm
    if (search) {
      filtered = filtered.filter(placa =>
        placa.numero_serie_placa?.toLowerCase().includes(search.toLowerCase()) ||
        placa.material_placa?.toLowerCase().includes(search.toLowerCase()) ||
        placa.tipo_placa?.toLowerCase().includes(search.toLowerCase()) ||
        placa.PontoMedicao?.tag_ponto?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(placa => placa.status_placa === statusFilter)
    }

    // Filtro por tipo
    if (tipoFilter !== 'all') {
      filtered = filtered.filter(placa => placa.tipo_placa === tipoFilter)
    }

    setFilteredPlacas(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingPlaca 
        ? `${API_BASE_URL}/placas-orificio/${editingPlaca.id}`
        : `${API_BASE_URL}/placas-orificio`
      
      const method = editingPlaca ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          ponto_medicao_id: parseInt(formData.ponto_medicao_id),
          diametro_orificio_mm: parseFloat(formData.diametro_orificio_mm),
          diametro_tubulacao_mm: parseFloat(formData.diametro_tubulacao_mm),
          espessura_placa_mm: parseFloat(formData.espessura_placa_mm)
        })
      })

      if (response.ok) {
        await fetchPlacas()
        setIsDialogOpen(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.message || 'Erro ao salvar placa de orifício')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (placa) => {
    setEditingPlaca(placa)
    setFormData({
      numero_serie_placa: placa.numero_serie_placa || '',
      ponto_medicao_id: placa.ponto_medicao_id?.toString() || '',
      tipo_placa: placa.tipo_placa || 'Concêntrica',
      diametro_orificio_mm: placa.diametro_orificio_mm?.toString() || '',
      diametro_tubulacao_mm: placa.diametro_tubulacao_mm?.toString() || '',
      espessura_placa_mm: placa.espessura_placa_mm?.toString() || '',
      material_placa: placa.material_placa || 'Aço Inoxidável 316',
      acabamento_orificio: placa.acabamento_orificio || 'Usinado',
      conformidade_a_qual_norma: placa.conformidade_a_qual_norma || 'Conforme AGA 3',
      data_fabricacao: placa.data_fabricacao ? 
        new Date(placa.data_fabricacao).toISOString().split('T')[0] : '',
      data_instalacao: placa.data_instalacao ? 
        new Date(placa.data_instalacao).toISOString().split('T')[0] : '',
      status_placa: placa.status_placa || 'Instalada',
      observacoes: placa.observacoes || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (placa) => {
    if (!confirm(`Tem certeza que deseja excluir a placa "${placa.numero_serie_placa}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/placas-orificio/${placa.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchPlacas()
      } else {
        setError('Erro ao excluir placa de orifício')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const resetForm = () => {
    setFormData({
      numero_serie_placa: '',
      ponto_medicao_id: '',
      tipo_placa: 'Concêntrica',
      diametro_orificio_mm: '',
      diametro_tubulacao_mm: '',
      espessura_placa_mm: '',
      material_placa: 'Aço Inoxidável 316',
      acabamento_orificio: 'Usinado',
      conformidade_a_qual_norma: 'Conforme AGA 3',
      data_fabricacao: '',
      data_instalacao: '',
      status_placa: 'Instalada',
      observacoes: ''
    })
    setEditingPlaca(null)
    setError('')
  }

  const getStatusBadge = (status) => {
    const configs = {
      'Instalada': { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      'Estoque': { variant: 'secondary', icon: Activity, color: 'text-blue-600' },
      'Manutencao': { variant: 'destructive', icon: AlertTriangle, color: 'text-orange-600' },
      'Descartada': { variant: 'outline', icon: AlertTriangle, color: 'text-red-600' }
    }
    
    const config = configs[status] || configs['Instalada']
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const calculateBetaRatio = (diametroOrificio, diametroTubulacao) => {
    if (!diametroOrificio || !diametroTubulacao) return null
    return (parseFloat(diametroOrificio) / parseFloat(diametroTubulacao)).toFixed(4)
  }

  if (loading && placas.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando placas de orifício...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Placas de Orifício</h2>
          <p className="text-gray-600">Gerencie as placas de orifício do sistema</p>
        </div>

        {hasPermission('placas_orificio', 'criar') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Placa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPlaca ? 'Editar Placa de Orifício' : 'Nova Placa de Orifício'}
                </DialogTitle>
                <DialogDescription>
                  {editingPlaca 
                    ? 'Edite as informações da placa de orifício selecionada.'
                    : 'Adicione uma nova placa de orifício ao sistema.'
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numero_serie_placa">Número de Série *</Label>
                    <Input
                      id="numero_serie_placa"
                      value={formData.numero_serie_placa}
                      onChange={(e) => setFormData({...formData, numero_serie_placa: e.target.value})}
                      placeholder="Ex: PO-001-2025"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ponto_medicao_id">Ponto de Medição *</Label>
                    <Select value={formData.ponto_medicao_id} onValueChange={(value) => setFormData({...formData, ponto_medicao_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um ponto" />
                      </SelectTrigger>
                      <SelectContent>
                        {pontos.map((ponto) => (
                          <SelectItem key={ponto.id} value={ponto.id.toString()}>
                            {ponto.tag_ponto} - {ponto.tipo_medicao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo_placa">Tipo de Placa</Label>
                    <Select value={formData.tipo_placa} onValueChange={(value) => setFormData({...formData, tipo_placa: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Concêntrica">Concêntrica</SelectItem>
                        <SelectItem value="Excêntrica">Excêntrica</SelectItem>
                        <SelectItem value="Segmental">Segmental</SelectItem>
                        <SelectItem value="Quadrante">Quadrante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status_placa">Status</Label>
                    <Select value={formData.status_placa} onValueChange={(value) => setFormData({...formData, status_placa: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Instalada">Instalada</SelectItem>
                        <SelectItem value="Estoque">Estoque</SelectItem>
                        <SelectItem value="Manutencao">Manutenção</SelectItem>
                        <SelectItem value="Descartada">Descartada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="diametro_orificio_mm">Diâmetro Orifício (mm) *</Label>
                    <Input
                      id="diametro_orificio_mm"
                      type="number"
                      step="0.01"
                      value={formData.diametro_orificio_mm}
                      onChange={(e) => setFormData({...formData, diametro_orificio_mm: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="diametro_tubulacao_mm">Diâmetro Tubulação (mm) *</Label>
                    <Input
                      id="diametro_tubulacao_mm"
                      type="number"
                      step="0.01"
                      value={formData.diametro_tubulacao_mm}
                      onChange={(e) => setFormData({...formData, diametro_tubulacao_mm: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="espessura_placa_mm">Espessura (mm)</Label>
                    <Input
                      id="espessura_placa_mm"
                      type="number"
                      step="0.01"
                      value={formData.espessura_placa_mm}
                      onChange={(e) => setFormData({...formData, espessura_placa_mm: e.target.value})}
                    />
                  </div>
                </div>

                {formData.diametro_orificio_mm && formData.diametro_tubulacao_mm && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Calculator className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Razão Beta (β): {calculateBetaRatio(formData.diametro_orificio_mm, formData.diametro_tubulacao_mm)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="material_placa">Material da Placa</Label>
                    <Select value={formData.material_placa} onValueChange={(value) => setFormData({...formData, material_placa: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aço Inoxidável 316">Aço Inoxidável 316</SelectItem>
                        <SelectItem value="Aço Inoxidável 304">Aço Inoxidável 304</SelectItem>
                        <SelectItem value="Aço Carbono">Aço Carbono</SelectItem>
                        <SelectItem value="Hastelloy">Hastelloy</SelectItem>
                        <SelectItem value="Monel">Monel</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="acabamento_orificio">Acabamento do Orifício</Label>
                    <Select value={formData.acabamento_orificio} onValueChange={(value) => setFormData({...formData, acabamento_orificio: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Usinado">Usinado</SelectItem>
                        <SelectItem value="Furado">Furado</SelectItem>
                        <SelectItem value="Eletroerosão">Eletroerosão</SelectItem>
                        <SelectItem value="Laser">Laser</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="conformidade_a_qual_norma">Conformidade com Norma</Label>
                  <Select value={formData.conformidade_a_qual_norma} onValueChange={(value) => setFormData({...formData, conformidade_a_qual_norma: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conforme AGA 3">Conforme AGA 3</SelectItem>
                      <SelectItem value="Conforme ISO 5167">Conforme ISO 5167</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data_fabricacao">Data de Fabricação</Label>
                    <Input
                      id="data_fabricacao"
                      type="date"
                      value={formData.data_fabricacao}
                      onChange={(e) => setFormData({...formData, data_fabricacao: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_instalacao">Data de Instalação</Label>
                    <Input
                      id="data_instalacao"
                      type="date"
                      value={formData.data_instalacao}
                      onChange={(e) => setFormData({...formData, data_instalacao: e.target.value})}
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
                    {loading ? 'Salvando...' : (editingPlaca ? 'Atualizar' : 'Criar')}
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
                placeholder="Buscar placas..."
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
                <SelectItem value="Instalada">Instalada</SelectItem>
                <SelectItem value="Estoque">Estoque</SelectItem>
                <SelectItem value="Manutencao">Manutenção</SelectItem>
                <SelectItem value="Descartada">Descartada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="Concêntrica">Concêntrica</SelectItem>
                <SelectItem value="Excêntrica">Excêntrica</SelectItem>
                <SelectItem value="Segmental">Segmental</SelectItem>
                <SelectItem value="Quadrante">Quadrante</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-gray-600">
              <Activity className="h-4 w-4 mr-2" />
              {filteredPlacas.length} placa(s) encontrada(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Placas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlacas.map((placa) => {
          const betaRatio = calculateBetaRatio(placa.diametro_orificio_mm, placa.diametro_tubulacao_mm)
          
          return (
            <Card key={placa.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      {placa.numero_serie_placa}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Settings className="h-4 w-4 mr-1" />
                      {placa.tipo_placa}
                    </CardDescription>
                  </div>
                  {getStatusBadge(placa.status_placa)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {placa.PontoMedicao && (
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Ponto:</span>
                      <span className="ml-1 font-medium">{placa.PontoMedicao.tag_ponto}</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <Ruler className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Ø Orifício:</span>
                      <span className="ml-1 font-medium">{placa.diametro_orificio_mm} mm</span>
                    </div>
                    <div className="flex items-center">
                      <Ruler className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Ø Tubulação:</span>
                      <span className="ml-1 font-medium">{placa.diametro_tubulacao_mm} mm</span>
                    </div>
                  </div>

                  {betaRatio && (
                    <div className="flex items-center">
                      <Calculator className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Razão Beta:</span>
                      <Badge variant="outline" className="ml-1">
                        β = {betaRatio}
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Material:</span>
                    <span className="ml-1 font-medium">{placa.material_placa}</span>
                  </div>

                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Norma:</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {placa.conformidade_a_qual_norma}
                    </Badge>
                  </div>

                  {placa.data_instalacao && (
                    <div className="text-xs text-gray-500">
                      Instalada em: {new Date(placa.data_instalacao).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>

                {placa.observacoes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <strong>Observações:</strong> {placa.observacoes}
                  </div>
                )}

                {(hasPermission('placas_orificio', 'editar') || hasPermission('placas_orificio', 'deletar')) && (
                  <div className="flex justify-end space-x-2 pt-3 border-t">
                    {hasPermission('placas_orificio', 'editar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(placa)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    {hasPermission('placas_orificio', 'deletar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(placa)}
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

      {filteredPlacas.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma placa de orifício encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || tipoFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira placa de orifício'
              }
            </p>
            {hasPermission('placas_orificio', 'criar') && !searchTerm && statusFilter === 'all' && tipoFilter === 'all' && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Placa
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PlacasOrificio

