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
  Calculator, 
  TrendingUp, 
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Target,
  Settings
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

const Incertezas = ({ globalSearch }) => {
  const { hasPermission, token } = useAuth()
  const [incertezas, setIncertezas] = useState([])
  const [pontos, setPontos] = useState([])
  const [filteredIncertezas, setFilteredIncertezas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tipoFilter, setTipoFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIncerteza, setEditingIncerteza] = useState(null)
  const [formData, setFormData] = useState({
    ponto_medicao_id: '',
    tipo_calculo: 'Método A (GUM)',
    incerteza_expandida_percentual: '',
    fator_cobertura: '2',
    nivel_confianca_percentual: '95',
    contribuicoes_incerteza: '',
    data_calculo: '',
    responsavel_calculo: '',
    norma_aplicada: 'GUM (ISO/IEC Guide 98-3)',
    status_calculo: 'Válido',
    observacoes: ''
  })

  // Carregar dados
  useEffect(() => {
    fetchIncertezas()
    fetchPontos()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    applyFilters()
  }, [incertezas, searchTerm, statusFilter, tipoFilter, globalSearch])

  const fetchIncertezas = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/incertezas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIncertezas(data.incertezas || data)
      } else {
        setError('Erro ao carregar incertezas de medição')
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
    let filtered = [...incertezas]

    // Busca global
    const search = globalSearch || searchTerm
    if (search) {
      filtered = filtered.filter(incerteza =>
        incerteza.responsavel_calculo?.toLowerCase().includes(search.toLowerCase()) ||
        incerteza.tipo_calculo?.toLowerCase().includes(search.toLowerCase()) ||
        incerteza.norma_aplicada?.toLowerCase().includes(search.toLowerCase()) ||
        incerteza.PontoMedicao?.tag_ponto?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(incerteza => incerteza.status_calculo === statusFilter)
    }

    // Filtro por tipo
    if (tipoFilter !== 'all') {
      filtered = filtered.filter(incerteza => incerteza.tipo_calculo === tipoFilter)
    }

    setFilteredIncertezas(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingIncerteza 
        ? `${API_BASE_URL}/incertezas/${editingIncerteza.id}`
        : `${API_BASE_URL}/incertezas`
      
      const method = editingIncerteza ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          ponto_medicao_id: parseInt(formData.ponto_medicao_id),
          incerteza_expandida_percentual: parseFloat(formData.incerteza_expandida_percentual),
          fator_cobertura: parseFloat(formData.fator_cobertura),
          nivel_confianca_percentual: parseFloat(formData.nivel_confianca_percentual)
        })
      })

      if (response.ok) {
        await fetchIncertezas()
        setIsDialogOpen(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.message || 'Erro ao salvar incerteza de medição')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (incerteza) => {
    setEditingIncerteza(incerteza)
    setFormData({
      ponto_medicao_id: incerteza.ponto_medicao_id?.toString() || '',
      tipo_calculo: incerteza.tipo_calculo || 'Método A (GUM)',
      incerteza_expandida_percentual: incerteza.incerteza_expandida_percentual?.toString() || '',
      fator_cobertura: incerteza.fator_cobertura?.toString() || '2',
      nivel_confianca_percentual: incerteza.nivel_confianca_percentual?.toString() || '95',
      contribuicoes_incerteza: incerteza.contribuicoes_incerteza || '',
      data_calculo: incerteza.data_calculo ? 
        new Date(incerteza.data_calculo).toISOString().split('T')[0] : '',
      responsavel_calculo: incerteza.responsavel_calculo || '',
      norma_aplicada: incerteza.norma_aplicada || 'GUM (ISO/IEC Guide 98-3)',
      status_calculo: incerteza.status_calculo || 'Válido',
      observacoes: incerteza.observacoes || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (incerteza) => {
    if (!confirm(`Tem certeza que deseja excluir o cálculo de incerteza do ponto "${incerteza.PontoMedicao?.tag_ponto}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/incertezas/${incerteza.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchIncertezas()
      } else {
        setError('Erro ao excluir incerteza de medição')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const resetForm = () => {
    setFormData({
      ponto_medicao_id: '',
      tipo_calculo: 'Método A (GUM)',
      incerteza_expandida_percentual: '',
      fator_cobertura: '2',
      nivel_confianca_percentual: '95',
      contribuicoes_incerteza: '',
      data_calculo: '',
      responsavel_calculo: '',
      norma_aplicada: 'GUM (ISO/IEC Guide 98-3)',
      status_calculo: 'Válido',
      observacoes: ''
    })
    setEditingIncerteza(null)
    setError('')
  }

  const getStatusBadge = (status) => {
    const configs = {
      'Válido': { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      'Expirado': { variant: 'destructive', icon: AlertTriangle, color: 'text-red-600' },
      'Em Revisão': { variant: 'secondary', icon: Activity, color: 'text-blue-600' },
      'Suspenso': { variant: 'outline', icon: AlertTriangle, color: 'text-orange-600' }
    }
    
    const config = configs[status] || configs['Válido']
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const getIncertezaLevel = (percentual) => {
    if (!percentual) return { level: 'unknown', color: 'gray' }
    const value = parseFloat(percentual)
    if (value <= 1) return { level: 'excelente', color: 'green' }
    if (value <= 2) return { level: 'boa', color: 'blue' }
    if (value <= 5) return { level: 'aceitável', color: 'yellow' }
    return { level: 'alta', color: 'red' }
  }

  const formatContribuicoes = (contribuicoes) => {
    if (!contribuicoes) return []
    try {
      return JSON.parse(contribuicoes)
    } catch {
      return []
    }
  }

  if (loading && incertezas.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando incertezas de medição...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Incertezas de Medição</h2>
          <p className="text-gray-600">Gerencie os cálculos de incerteza do sistema</p>
        </div>

        {hasPermission('incertezas', 'criar') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Incerteza
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingIncerteza ? 'Editar Incerteza de Medição' : 'Nova Incerteza de Medição'}
                </DialogTitle>
                <DialogDescription>
                  {editingIncerteza 
                    ? 'Edite as informações do cálculo de incerteza selecionado.'
                    : 'Adicione um novo cálculo de incerteza ao sistema.'
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
                    <Label htmlFor="tipo_calculo">Tipo de Cálculo</Label>
                    <Select value={formData.tipo_calculo} onValueChange={(value) => setFormData({...formData, tipo_calculo: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Método A (GUM)">Método A (GUM)</SelectItem>
                        <SelectItem value="Método B (GUM)">Método B (GUM)</SelectItem>
                        <SelectItem value="Monte Carlo">Monte Carlo</SelectItem>
                        <SelectItem value="Propagação de Incertezas">Propagação de Incertezas</SelectItem>
                        <SelectItem value="Análise de Sensibilidade">Análise de Sensibilidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="incerteza_expandida_percentual">Incerteza Expandida (%) *</Label>
                    <Input
                      id="incerteza_expandida_percentual"
                      type="number"
                      step="0.01"
                      value={formData.incerteza_expandida_percentual}
                      onChange={(e) => setFormData({...formData, incerteza_expandida_percentual: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fator_cobertura">Fator de Cobertura (k)</Label>
                    <Input
                      id="fator_cobertura"
                      type="number"
                      step="0.01"
                      value={formData.fator_cobertura}
                      onChange={(e) => setFormData({...formData, fator_cobertura: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nivel_confianca_percentual">Nível de Confiança (%)</Label>
                    <Input
                      id="nivel_confianca_percentual"
                      type="number"
                      step="0.1"
                      value={formData.nivel_confianca_percentual}
                      onChange={(e) => setFormData({...formData, nivel_confianca_percentual: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contribuicoes_incerteza">Contribuições de Incerteza (JSON)</Label>
                  <Textarea
                    id="contribuicoes_incerteza"
                    value={formData.contribuicoes_incerteza}
                    onChange={(e) => setFormData({...formData, contribuicoes_incerteza: e.target.value})}
                    placeholder='{"temperatura": 0.5, "pressao": 0.3, "vazao": 1.2}'
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formato JSON com as contribuições de cada grandeza
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data_calculo">Data do Cálculo</Label>
                    <Input
                      id="data_calculo"
                      type="date"
                      value={formData.data_calculo}
                      onChange={(e) => setFormData({...formData, data_calculo: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsavel_calculo">Responsável pelo Cálculo</Label>
                    <Input
                      id="responsavel_calculo"
                      value={formData.responsavel_calculo}
                      onChange={(e) => setFormData({...formData, responsavel_calculo: e.target.value})}
                      placeholder="Nome do responsável"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="norma_aplicada">Norma Aplicada</Label>
                    <Select value={formData.norma_aplicada} onValueChange={(value) => setFormData({...formData, norma_aplicada: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GUM (ISO/IEC Guide 98-3)">GUM (ISO/IEC Guide 98-3)</SelectItem>
                        <SelectItem value="ISO 5168">ISO 5168</SelectItem>
                        <SelectItem value="AGA Report No. 3">AGA Report No. 3</SelectItem>
                        <SelectItem value="ISO 17025">ISO 17025</SelectItem>
                        <SelectItem value="VIM (ISO/IEC Guide 99)">VIM (ISO/IEC Guide 99)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status_calculo">Status do Cálculo</Label>
                    <Select value={formData.status_calculo} onValueChange={(value) => setFormData({...formData, status_calculo: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Válido">Válido</SelectItem>
                        <SelectItem value="Expirado">Expirado</SelectItem>
                        <SelectItem value="Em Revisão">Em Revisão</SelectItem>
                        <SelectItem value="Suspenso">Suspenso</SelectItem>
                      </SelectContent>
                    </Select>
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
                    {loading ? 'Salvando...' : (editingIncerteza ? 'Atualizar' : 'Criar')}
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
                placeholder="Buscar incertezas..."
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
                <SelectItem value="Válido">Válido</SelectItem>
                <SelectItem value="Expirado">Expirado</SelectItem>
                <SelectItem value="Em Revisão">Em Revisão</SelectItem>
                <SelectItem value="Suspenso">Suspenso</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="Método A (GUM)">Método A (GUM)</SelectItem>
                <SelectItem value="Método B (GUM)">Método B (GUM)</SelectItem>
                <SelectItem value="Monte Carlo">Monte Carlo</SelectItem>
                <SelectItem value="Propagação de Incertezas">Propagação de Incertezas</SelectItem>
                <SelectItem value="Análise de Sensibilidade">Análise de Sensibilidade</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-gray-600">
              <Calculator className="h-4 w-4 mr-2" />
              {filteredIncertezas.length} cálculo(s) encontrado(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Incertezas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIncertezas.map((incerteza) => {
          const incertezaLevel = getIncertezaLevel(incerteza.incerteza_expandida_percentual)
          const contribuicoes = formatContribuicoes(incerteza.contribuicoes_incerteza)
          
          return (
            <Card key={incerteza.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <Calculator className="h-5 w-5 mr-2 text-blue-600" />
                      {incerteza.PontoMedicao?.tag_ponto || 'Ponto não definido'}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      {incerteza.tipo_calculo}
                    </CardDescription>
                  </div>
                  {getStatusBadge(incerteza.status_calculo)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {incerteza.PontoMedicao && (
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Tipo:</span>
                      <span className="ml-1 font-medium">{incerteza.PontoMedicao.tipo_medicao}</span>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Incerteza Expandida:</span>
                      <Badge 
                        variant={incertezaLevel.color === 'green' ? 'default' : 
                                incertezaLevel.color === 'blue' ? 'secondary' :
                                incertezaLevel.color === 'yellow' ? 'outline' : 'destructive'}
                        className="font-mono"
                      >
                        {incerteza.incerteza_expandida_percentual}%
                      </Badge>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          incertezaLevel.color === 'green' ? 'bg-green-500' :
                          incertezaLevel.color === 'blue' ? 'bg-blue-500' :
                          incertezaLevel.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(parseFloat(incerteza.incerteza_expandida_percentual) * 10, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-xs text-gray-500 capitalize">
                      Nível: {incertezaLevel.level}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Fator k:</span>
                      <span className="ml-1 font-medium">{incerteza.fator_cobertura}</span>
                    </div>
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Confiança:</span>
                      <span className="ml-1 font-medium">{incerteza.nivel_confianca_percentual}%</span>
                    </div>
                  </div>

                  {incerteza.responsavel_calculo && (
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Responsável:</span>
                      <span className="ml-1 font-medium">{incerteza.responsavel_calculo}</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Norma:</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {incerteza.norma_aplicada}
                    </Badge>
                  </div>

                  {incerteza.data_calculo && (
                    <div className="text-xs text-gray-500">
                      Calculado em: {new Date(incerteza.data_calculo).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>

                {contribuicoes.length > 0 && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <strong>Principais Contribuições:</strong>
                    <div className="mt-1 space-y-1">
                      {Object.entries(contribuicoes).slice(0, 3).map(([fonte, valor]) => (
                        <div key={fonte} className="flex justify-between">
                          <span className="capitalize">{fonte}:</span>
                          <span className="font-mono">{valor}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {incerteza.observacoes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <strong>Observações:</strong> {incerteza.observacoes}
                  </div>
                )}

                {(hasPermission('incertezas', 'editar') || hasPermission('incertezas', 'deletar')) && (
                  <div className="flex justify-end space-x-2 pt-3 border-t">
                    {hasPermission('incertezas', 'editar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(incerteza)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    {hasPermission('incertezas', 'deletar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(incerteza)}
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

      {filteredIncertezas.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma incerteza de medição encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || tipoFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro cálculo de incerteza'
              }
            </p>
            {hasPermission('incertezas', 'criar') && !searchTerm && statusFilter === 'all' && tipoFilter === 'all' && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Incerteza
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Incertezas

