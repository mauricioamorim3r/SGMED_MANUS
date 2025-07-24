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
  Ruler, 
  Activity, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Target,
  Gauge,
  Thermometer,
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

const API_BASE_URL = 'http://localhost:3001/api'

const TrechosRetos = ({ globalSearch }) => {
  const { hasPermission, token } = useAuth()
  const [trechos, setTrechos] = useState([])
  const [pontos, setPontos] = useState([])
  const [filteredTrechos, setFilteredTrechos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [materialFilter, setMaterialFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTrecho, setEditingTrecho] = useState(null)
  const [formData, setFormData] = useState({
    ponto_medicao_id: '',
    comprimento_montante_mm: '',
    comprimento_jusante_mm: '',
    diametro_interno_mm: '',
    rugosidade_mm: '',
    material_tubulacao: 'Aço Carbono',
    pressao_operacao_bar: '',
    temperatura_operacao_celsius: '',
    conformidade_a_qual_norma: 'Conforme AGA 3',
    status_trecho: 'Operacional',
    observacoes: ''
  })

  // Carregar dados
  useEffect(() => {
    fetchTrechos()
    fetchPontos()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    applyFilters()
  }, [trechos, searchTerm, statusFilter, materialFilter, globalSearch])

  const fetchTrechos = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/trechos-retos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTrechos(data.trechos || data)
      } else {
        setError('Erro ao carregar trechos retos')
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
    let filtered = [...trechos]

    // Busca global
    const search = globalSearch || searchTerm
    if (search) {
      filtered = filtered.filter(trecho =>
        trecho.material_tubulacao?.toLowerCase().includes(search.toLowerCase()) ||
        trecho.conformidade_a_qual_norma?.toLowerCase().includes(search.toLowerCase()) ||
        trecho.PontoMedicao?.tag_ponto?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(trecho => trecho.status_trecho === statusFilter)
    }

    // Filtro por material
    if (materialFilter !== 'all') {
      filtered = filtered.filter(trecho => trecho.material_tubulacao === materialFilter)
    }

    setFilteredTrechos(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingTrecho 
        ? `${API_BASE_URL}/trechos-retos/${editingTrecho.id}`
        : `${API_BASE_URL}/trechos-retos`
      
      const method = editingTrecho ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          ponto_medicao_id: parseInt(formData.ponto_medicao_id),
          comprimento_montante_mm: parseFloat(formData.comprimento_montante_mm),
          comprimento_jusante_mm: parseFloat(formData.comprimento_jusante_mm),
          diametro_interno_mm: parseFloat(formData.diametro_interno_mm),
          rugosidade_mm: parseFloat(formData.rugosidade_mm),
          pressao_operacao_bar: parseFloat(formData.pressao_operacao_bar),
          temperatura_operacao_celsius: parseFloat(formData.temperatura_operacao_celsius)
        })
      })

      if (response.ok) {
        await fetchTrechos()
        setIsDialogOpen(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.message || 'Erro ao salvar trecho reto')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (trecho) => {
    setEditingTrecho(trecho)
    setFormData({
      ponto_medicao_id: trecho.ponto_medicao_id?.toString() || '',
      comprimento_montante_mm: trecho.comprimento_montante_mm?.toString() || '',
      comprimento_jusante_mm: trecho.comprimento_jusante_mm?.toString() || '',
      diametro_interno_mm: trecho.diametro_interno_mm?.toString() || '',
      rugosidade_mm: trecho.rugosidade_mm?.toString() || '',
      material_tubulacao: trecho.material_tubulacao || 'Aço Carbono',
      pressao_operacao_bar: trecho.pressao_operacao_bar?.toString() || '',
      temperatura_operacao_celsius: trecho.temperatura_operacao_celsius?.toString() || '',
      conformidade_a_qual_norma: trecho.conformidade_a_qual_norma || 'Conforme AGA 3',
      status_trecho: trecho.status_trecho || 'Operacional',
      observacoes: trecho.observacoes || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (trecho) => {
    if (!confirm(`Tem certeza que deseja excluir o trecho reto do ponto "${trecho.PontoMedicao?.tag_ponto}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/trechos-retos/${trecho.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchTrechos()
      } else {
        setError('Erro ao excluir trecho reto')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const resetForm = () => {
    setFormData({
      ponto_medicao_id: '',
      comprimento_montante_mm: '',
      comprimento_jusante_mm: '',
      diametro_interno_mm: '',
      rugosidade_mm: '',
      material_tubulacao: 'Aço Carbono',
      pressao_operacao_bar: '',
      temperatura_operacao_celsius: '',
      conformidade_a_qual_norma: 'Conforme AGA 3',
      status_trecho: 'Operacional',
      observacoes: ''
    })
    setEditingTrecho(null)
    setError('')
  }

  const getStatusBadge = (status) => {
    const configs = {
      'Operacional': { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      'Manutenção': { variant: 'destructive', icon: AlertTriangle, color: 'text-orange-600' },
      'Fora de Operação': { variant: 'outline', icon: AlertTriangle, color: 'text-red-600' },
      'Em Teste': { variant: 'secondary', icon: Activity, color: 'text-blue-600' }
    }
    
    const config = configs[status] || configs['Operacional']
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const calculateReynolds = (diametro, velocidade = 10, viscosidade = 0.000018) => {
    if (!diametro) return null
    const diametroM = parseFloat(diametro) / 1000
    return ((velocidade * diametroM) / viscosidade).toExponential(2)
  }

  const getRougosidadeLevel = (rugosidade) => {
    if (!rugosidade) return { level: 'unknown', color: 'gray' }
    const value = parseFloat(rugosidade)
    if (value <= 0.05) return { level: 'lisa', color: 'green' }
    if (value <= 0.15) return { level: 'moderada', color: 'blue' }
    if (value <= 0.5) return { level: 'rugosa', color: 'yellow' }
    return { level: 'muito rugosa', color: 'red' }
  }

  if (loading && trechos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando trechos retos...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Trechos Retos</h2>
          <p className="text-gray-600">Gerencie os trechos retos de tubulação do sistema</p>
        </div>

        {hasPermission('trechos_retos', 'criar') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Trecho
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTrecho ? 'Editar Trecho Reto' : 'Novo Trecho Reto'}
                </DialogTitle>
                <DialogDescription>
                  {editingTrecho 
                    ? 'Edite as informações do trecho reto selecionado.'
                    : 'Adicione um novo trecho reto ao sistema.'
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <Label htmlFor="status_trecho">Status do Trecho</Label>
                    <Select value={formData.status_trecho} onValueChange={(value) => setFormData({...formData, status_trecho: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operacional">Operacional</SelectItem>
                        <SelectItem value="Manutenção">Manutenção</SelectItem>
                        <SelectItem value="Fora de Operação">Fora de Operação</SelectItem>
                        <SelectItem value="Em Teste">Em Teste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="comprimento_montante_mm">Comprimento Montante (mm) *</Label>
                    <Input
                      id="comprimento_montante_mm"
                      type="number"
                      step="0.1"
                      value={formData.comprimento_montante_mm}
                      onChange={(e) => setFormData({...formData, comprimento_montante_mm: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="comprimento_jusante_mm">Comprimento Jusante (mm) *</Label>
                    <Input
                      id="comprimento_jusante_mm"
                      type="number"
                      step="0.1"
                      value={formData.comprimento_jusante_mm}
                      onChange={(e) => setFormData({...formData, comprimento_jusante_mm: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="diametro_interno_mm">Diâmetro Interno (mm) *</Label>
                    <Input
                      id="diametro_interno_mm"
                      type="number"
                      step="0.01"
                      value={formData.diametro_interno_mm}
                      onChange={(e) => setFormData({...formData, diametro_interno_mm: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rugosidade_mm">Rugosidade (mm)</Label>
                    <Input
                      id="rugosidade_mm"
                      type="number"
                      step="0.001"
                      value={formData.rugosidade_mm}
                      onChange={(e) => setFormData({...formData, rugosidade_mm: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="material_tubulacao">Material da Tubulação</Label>
                    <Select value={formData.material_tubulacao} onValueChange={(value) => setFormData({...formData, material_tubulacao: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aço Carbono">Aço Carbono</SelectItem>
                        <SelectItem value="Aço Inoxidável">Aço Inoxidável</SelectItem>
                        <SelectItem value="PVC">PVC</SelectItem>
                        <SelectItem value="HDPE">HDPE</SelectItem>
                        <SelectItem value="Cobre">Cobre</SelectItem>
                        <SelectItem value="Ferro Fundido">Ferro Fundido</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pressao_operacao_bar">Pressão de Operação (bar)</Label>
                    <Input
                      id="pressao_operacao_bar"
                      type="number"
                      step="0.01"
                      value={formData.pressao_operacao_bar}
                      onChange={(e) => setFormData({...formData, pressao_operacao_bar: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="temperatura_operacao_celsius">Temperatura de Operação (°C)</Label>
                    <Input
                      id="temperatura_operacao_celsius"
                      type="number"
                      step="0.1"
                      value={formData.temperatura_operacao_celsius}
                      onChange={(e) => setFormData({...formData, temperatura_operacao_celsius: e.target.value})}
                    />
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
                    {loading ? 'Salvando...' : (editingTrecho ? 'Atualizar' : 'Criar')}
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
                placeholder="Buscar trechos..."
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
                <SelectItem value="Operacional">Operacional</SelectItem>
                <SelectItem value="Manutenção">Manutenção</SelectItem>
                <SelectItem value="Fora de Operação">Fora de Operação</SelectItem>
                <SelectItem value="Em Teste">Em Teste</SelectItem>
              </SelectContent>
            </Select>
            <Select value={materialFilter} onValueChange={setMaterialFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Materiais</SelectItem>
                <SelectItem value="Aço Carbono">Aço Carbono</SelectItem>
                <SelectItem value="Aço Inoxidável">Aço Inoxidável</SelectItem>
                <SelectItem value="PVC">PVC</SelectItem>
                <SelectItem value="HDPE">HDPE</SelectItem>
                <SelectItem value="Cobre">Cobre</SelectItem>
                <SelectItem value="Ferro Fundido">Ferro Fundido</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-gray-600">
              <Ruler className="h-4 w-4 mr-2" />
              {filteredTrechos.length} trecho(s) encontrado(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Trechos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrechos.map((trecho) => {
          const rugosidadeLevel = getRougosidadeLevel(trecho.rugosidade_mm)
          const reynolds = calculateReynolds(trecho.diametro_interno_mm)
          
          return (
            <Card key={trecho.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <Ruler className="h-5 w-5 mr-2 text-blue-600" />
                      {trecho.PontoMedicao?.tag_ponto || 'Ponto não definido'}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Settings className="h-4 w-4 mr-1" />
                      {trecho.material_tubulacao}
                    </CardDescription>
                  </div>
                  {getStatusBadge(trecho.status_trecho)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {trecho.PontoMedicao && (
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Tipo:</span>
                      <span className="ml-1 font-medium">{trecho.PontoMedicao.tipo_medicao}</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <Ruler className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Montante:</span>
                      <span className="ml-1 font-medium">{trecho.comprimento_montante_mm} mm</span>
                    </div>
                    <div className="flex items-center">
                      <Ruler className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Jusante:</span>
                      <span className="ml-1 font-medium">{trecho.comprimento_jusante_mm} mm</span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Diâmetro:</span>
                    <Badge variant="outline" className="ml-1">
                      Ø {trecho.diametro_interno_mm} mm
                    </Badge>
                  </div>

                  {trecho.rugosidade_mm && (
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Rugosidade:</span>
                      <Badge 
                        variant={rugosidadeLevel.color === 'green' ? 'default' : 
                                rugosidadeLevel.color === 'blue' ? 'secondary' :
                                rugosidadeLevel.color === 'yellow' ? 'outline' : 'destructive'}
                        className="ml-1"
                      >
                        {trecho.rugosidade_mm} mm ({rugosidadeLevel.level})
                      </Badge>
                    </div>
                  )}

                  {trecho.pressao_operacao_bar && (
                    <div className="flex items-center">
                      <Gauge className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Pressão:</span>
                      <span className="ml-1 font-medium">{trecho.pressao_operacao_bar} bar</span>
                    </div>
                  )}

                  {trecho.temperatura_operacao_celsius && (
                    <div className="flex items-center">
                      <Thermometer className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Temperatura:</span>
                      <span className="ml-1 font-medium">{trecho.temperatura_operacao_celsius} °C</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Norma:</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {trecho.conformidade_a_qual_norma}
                    </Badge>
                  </div>

                  {reynolds && (
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Reynolds (est.):</span>
                      <Badge variant="outline" className="ml-1 font-mono text-xs">
                        Re ≈ {reynolds}
                      </Badge>
                    </div>
                  )}
                </div>

                {trecho.observacoes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <strong>Observações:</strong> {trecho.observacoes}
                  </div>
                )}

                {(hasPermission('trechos_retos', 'editar') || hasPermission('trechos_retos', 'deletar')) && (
                  <div className="flex justify-end space-x-2 pt-3 border-t">
                    {hasPermission('trechos_retos', 'editar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(trecho)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    {hasPermission('trechos_retos', 'deletar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(trecho)}
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

      {filteredTrechos.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Ruler className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum trecho reto encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || materialFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro trecho reto'
              }
            </p>
            {hasPermission('trechos_retos', 'criar') && !searchTerm && statusFilter === 'all' && materialFilter === 'all' && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Trecho
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TrechosRetos

