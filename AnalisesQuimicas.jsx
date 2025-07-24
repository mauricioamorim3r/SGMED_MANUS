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
  Flask, 
  Activity, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Target,
  Gauge,
  Thermometer,
  Clock,
  Play,
  Pause,
  Square,
  BarChart3,
  Beaker,
  Droplets,
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

const AnalisesQuimicas = ({ globalSearch }) => {
  const { hasPermission, token } = useAuth()
  const [analises, setAnalises] = useState([])
  const [pontos, setPontos] = useState([])
  const [filteredAnalises, setFilteredAnalises] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tipoFilter, setTipoFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAnalise, setEditingAnalise] = useState(null)
  const [formData, setFormData] = useState({
    numero_analise: '',
    ponto_medicao_id: '',
    tipo_analise: 'Óleo',
    tipo_amostra: 'Líquida',
    data_coleta: '',
    data_recebimento: '',
    data_inicio_analise: '',
    data_conclusao: '',
    status_analise: 'Coletada',
    densidade_15c_kg_m3: '',
    densidade_20c_kg_m3: '',
    viscosidade_cinematica_40c_cst: '',
    viscosidade_cinematica_100c_cst: '',
    ponto_fulgor_celsius: '',
    ponto_fluidez_celsius: '',
    teor_agua_percentual: '',
    teor_sedimentos_percentual: '',
    teor_sal_mg_l: '',
    acidez_total_mg_koh_g: '',
    indice_acidez_mg_koh_g: '',
    corrosividade_lamina_cobre: '',
    estabilidade_oxidacao_minutos: '',
    residuo_carbono_percentual: '',
    cinzas_percentual: '',
    enxofre_total_percentual: '',
    destilacao_10_percentual_celsius: '',
    destilacao_50_percentual_celsius: '',
    destilacao_90_percentual_celsius: '',
    pressao_vapor_reid_kpa: '',
    octanagem_ron: '',
    octanagem_mon: '',
    cetanagem: '',
    poder_calorifico_superior_mj_kg: '',
    poder_calorifico_inferior_mj_kg: '',
    conformidade_anp: '',
    observacoes: ''
  })

  // Carregar dados
  useEffect(() => {
    fetchAnalises()
    fetchPontos()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    applyFilters()
  }, [analises, searchTerm, statusFilter, tipoFilter, globalSearch])

  const fetchAnalises = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/analises-quimicas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalises(data.analises || data)
      } else {
        setError('Erro ao carregar análises físico-químicas')
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
    let filtered = [...analises]

    // Busca global
    const search = globalSearch || searchTerm
    if (search) {
      filtered = filtered.filter(analise =>
        analise.numero_analise?.toLowerCase().includes(search.toLowerCase()) ||
        analise.tipo_analise?.toLowerCase().includes(search.toLowerCase()) ||
        analise.tipo_amostra?.toLowerCase().includes(search.toLowerCase()) ||
        analise.PontoMedicao?.tag_ponto?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(analise => analise.status_analise === statusFilter)
    }

    // Filtro por tipo
    if (tipoFilter !== 'all') {
      filtered = filtered.filter(analise => analise.tipo_analise === tipoFilter)
    }

    setFilteredAnalises(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingAnalise 
        ? `${API_BASE_URL}/analises-quimicas/${editingAnalise.id}`
        : `${API_BASE_URL}/analises-quimicas`
      
      const method = editingAnalise ? 'PUT' : 'POST'

      // Converter campos numéricos
      const numericFields = [
        'densidade_15c_kg_m3', 'densidade_20c_kg_m3', 'viscosidade_cinematica_40c_cst',
        'viscosidade_cinematica_100c_cst', 'ponto_fulgor_celsius', 'ponto_fluidez_celsius',
        'teor_agua_percentual', 'teor_sedimentos_percentual', 'teor_sal_mg_l',
        'acidez_total_mg_koh_g', 'indice_acidez_mg_koh_g', 'estabilidade_oxidacao_minutos',
        'residuo_carbono_percentual', 'cinzas_percentual', 'enxofre_total_percentual',
        'destilacao_10_percentual_celsius', 'destilacao_50_percentual_celsius',
        'destilacao_90_percentual_celsius', 'pressao_vapor_reid_kpa', 'octanagem_ron',
        'octanagem_mon', 'cetanagem', 'poder_calorifico_superior_mj_kg',
        'poder_calorifico_inferior_mj_kg'
      ]

      const processedData = { ...formData }
      processedData.ponto_medicao_id = parseInt(formData.ponto_medicao_id)

      numericFields.forEach(field => {
        if (processedData[field] !== '') {
          processedData[field] = parseFloat(processedData[field])
        } else {
          processedData[field] = null
        }
      })

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(processedData)
      })

      if (response.ok) {
        await fetchAnalises()
        setIsDialogOpen(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.message || 'Erro ao salvar análise físico-química')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (analise, novoStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/analises-quimicas/${analise.id}/${novoStatus.toLowerCase()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchAnalises()
      } else {
        setError(`Erro ao ${novoStatus.toLowerCase()} análise`)
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const handleEdit = (analise) => {
    setEditingAnalise(analise)
    setFormData({
      numero_analise: analise.numero_analise || '',
      ponto_medicao_id: analise.ponto_medicao_id?.toString() || '',
      tipo_analise: analise.tipo_analise || 'Óleo',
      tipo_amostra: analise.tipo_amostra || 'Líquida',
      data_coleta: analise.data_coleta ? 
        new Date(analise.data_coleta).toISOString().split('T')[0] : '',
      data_recebimento: analise.data_recebimento ? 
        new Date(analise.data_recebimento).toISOString().split('T')[0] : '',
      data_inicio_analise: analise.data_inicio_analise ? 
        new Date(analise.data_inicio_analise).toISOString().split('T')[0] : '',
      data_conclusao: analise.data_conclusao ? 
        new Date(analise.data_conclusao).toISOString().split('T')[0] : '',
      status_analise: analise.status_analise || 'Coletada',
      densidade_15c_kg_m3: analise.densidade_15c_kg_m3?.toString() || '',
      densidade_20c_kg_m3: analise.densidade_20c_kg_m3?.toString() || '',
      viscosidade_cinematica_40c_cst: analise.viscosidade_cinematica_40c_cst?.toString() || '',
      viscosidade_cinematica_100c_cst: analise.viscosidade_cinematica_100c_cst?.toString() || '',
      ponto_fulgor_celsius: analise.ponto_fulgor_celsius?.toString() || '',
      ponto_fluidez_celsius: analise.ponto_fluidez_celsius?.toString() || '',
      teor_agua_percentual: analise.teor_agua_percentual?.toString() || '',
      teor_sedimentos_percentual: analise.teor_sedimentos_percentual?.toString() || '',
      teor_sal_mg_l: analise.teor_sal_mg_l?.toString() || '',
      acidez_total_mg_koh_g: analise.acidez_total_mg_koh_g?.toString() || '',
      indice_acidez_mg_koh_g: analise.indice_acidez_mg_koh_g?.toString() || '',
      corrosividade_lamina_cobre: analise.corrosividade_lamina_cobre || '',
      estabilidade_oxidacao_minutos: analise.estabilidade_oxidacao_minutos?.toString() || '',
      residuo_carbono_percentual: analise.residuo_carbono_percentual?.toString() || '',
      cinzas_percentual: analise.cinzas_percentual?.toString() || '',
      enxofre_total_percentual: analise.enxofre_total_percentual?.toString() || '',
      destilacao_10_percentual_celsius: analise.destilacao_10_percentual_celsius?.toString() || '',
      destilacao_50_percentual_celsius: analise.destilacao_50_percentual_celsius?.toString() || '',
      destilacao_90_percentual_celsius: analise.destilacao_90_percentual_celsius?.toString() || '',
      pressao_vapor_reid_kpa: analise.pressao_vapor_reid_kpa?.toString() || '',
      octanagem_ron: analise.octanagem_ron?.toString() || '',
      octanagem_mon: analise.octanagem_mon?.toString() || '',
      cetanagem: analise.cetanagem?.toString() || '',
      poder_calorifico_superior_mj_kg: analise.poder_calorifico_superior_mj_kg?.toString() || '',
      poder_calorifico_inferior_mj_kg: analise.poder_calorifico_inferior_mj_kg?.toString() || '',
      conformidade_anp: analise.conformidade_anp || '',
      observacoes: analise.observacoes || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (analise) => {
    if (!confirm(`Tem certeza que deseja excluir a análise "${analise.numero_analise}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/analises-quimicas/${analise.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchAnalises()
      } else {
        setError('Erro ao excluir análise físico-química')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const resetForm = () => {
    setFormData({
      numero_analise: '',
      ponto_medicao_id: '',
      tipo_analise: 'Óleo',
      tipo_amostra: 'Líquida',
      data_coleta: '',
      data_recebimento: '',
      data_inicio_analise: '',
      data_conclusao: '',
      status_analise: 'Coletada',
      densidade_15c_kg_m3: '',
      densidade_20c_kg_m3: '',
      viscosidade_cinematica_40c_cst: '',
      viscosidade_cinematica_100c_cst: '',
      ponto_fulgor_celsius: '',
      ponto_fluidez_celsius: '',
      teor_agua_percentual: '',
      teor_sedimentos_percentual: '',
      teor_sal_mg_l: '',
      acidez_total_mg_koh_g: '',
      indice_acidez_mg_koh_g: '',
      corrosividade_lamina_cobre: '',
      estabilidade_oxidacao_minutos: '',
      residuo_carbono_percentual: '',
      cinzas_percentual: '',
      enxofre_total_percentual: '',
      destilacao_10_percentual_celsius: '',
      destilacao_50_percentual_celsius: '',
      destilacao_90_percentual_celsius: '',
      pressao_vapor_reid_kpa: '',
      octanagem_ron: '',
      octanagem_mon: '',
      cetanagem: '',
      poder_calorifico_superior_mj_kg: '',
      poder_calorifico_inferior_mj_kg: '',
      conformidade_anp: '',
      observacoes: ''
    })
    setEditingAnalise(null)
    setError('')
  }

  const getStatusBadge = (status) => {
    const configs = {
      'Coletada': { variant: 'secondary', icon: Clock, color: 'text-blue-600' },
      'Recebida': { variant: 'outline', icon: Settings, color: 'text-orange-600' },
      'Em Análise': { variant: 'default', icon: Play, color: 'text-green-600' },
      'Concluída': { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      'Cancelada': { variant: 'destructive', icon: Square, color: 'text-red-600' }
    }
    
    const config = configs[status] || configs['Coletada']
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const getConformidadeBadge = (conformidade) => {
    if (!conformidade) return null
    
    const isConforme = conformidade.toLowerCase().includes('conforme')
    return (
      <Badge variant={isConforme ? 'default' : 'destructive'} className="flex items-center gap-1">
        {isConforme ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
        {conformidade}
      </Badge>
    )
  }

  const getProgressPercentage = (analise) => {
    const statusProgress = {
      'Coletada': 20,
      'Recebida': 40,
      'Em Análise': 70,
      'Concluída': 100,
      'Cancelada': 0
    }
    return statusProgress[analise.status_analise] || 0
  }

  const calculateDensidadeAPI = (densidade20c) => {
    if (!densidade20c) return null
    const densidadeGcm3 = densidade20c / 1000
    const api = (141.5 / densidadeGcm3) - 131.5
    return api.toFixed(2)
  }

  const getActionButtons = (analise) => {
    const buttons = []
    
    switch (analise.status_analise) {
      case 'Coletada':
        buttons.push(
          <Button
            key="receber"
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(analise, 'Recebida')}
            className="text-blue-600"
          >
            <Target className="h-4 w-4 mr-1" />
            Receber
          </Button>
        )
        break
      case 'Recebida':
        buttons.push(
          <Button
            key="iniciar"
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(analise, 'Em Análise')}
            className="text-green-600"
          >
            <Play className="h-4 w-4 mr-1" />
            Iniciar Análise
          </Button>
        )
        break
      case 'Em Análise':
        buttons.push(
          <Button
            key="concluir"
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(analise, 'Concluída')}
            className="text-green-600"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Concluir
          </Button>
        )
        break
    }

    if (analise.status_analise !== 'Concluída' && analise.status_analise !== 'Cancelada') {
      buttons.push(
        <Button
          key="cancelar"
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange(analise, 'Cancelada')}
          className="text-red-600"
        >
          <Square className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
      )
    }

    return buttons
  }

  if (loading && analises.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando análises físico-químicas...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Análises Físico-Químicas</h2>
          <p className="text-gray-600">Gerencie as análises laboratoriais do sistema</p>
        </div>

        {hasPermission('analises_quimicas', 'criar') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Análise
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAnalise ? 'Editar Análise Físico-Química' : 'Nova Análise Físico-Química'}
                </DialogTitle>
                <DialogDescription>
                  {editingAnalise 
                    ? 'Edite as informações da análise selecionada.'
                    : 'Adicione uma nova análise físico-química ao sistema.'
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numero_analise">Número da Análise *</Label>
                    <Input
                      id="numero_analise"
                      value={formData.numero_analise}
                      onChange={(e) => setFormData({...formData, numero_analise: e.target.value})}
                      placeholder="Ex: AQ-001-2025"
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

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="tipo_analise">Tipo de Análise</Label>
                    <Select value={formData.tipo_analise} onValueChange={(value) => setFormData({...formData, tipo_analise: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Óleo">Óleo</SelectItem>
                        <SelectItem value="Gás">Gás</SelectItem>
                        <SelectItem value="Água">Água</SelectItem>
                        <SelectItem value="Condensado">Condensado</SelectItem>
                        <SelectItem value="Combustível">Combustível</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tipo_amostra">Tipo de Amostra</Label>
                    <Select value={formData.tipo_amostra} onValueChange={(value) => setFormData({...formData, tipo_amostra: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Líquida">Líquida</SelectItem>
                        <SelectItem value="Gasosa">Gasosa</SelectItem>
                        <SelectItem value="Sólida">Sólida</SelectItem>
                        <SelectItem value="Bifásica">Bifásica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status_analise">Status da Análise</Label>
                    <Select value={formData.status_analise} onValueChange={(value) => setFormData({...formData, status_analise: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Coletada">Coletada</SelectItem>
                        <SelectItem value="Recebida">Recebida</SelectItem>
                        <SelectItem value="Em Análise">Em Análise</SelectItem>
                        <SelectItem value="Concluída">Concluída</SelectItem>
                        <SelectItem value="Cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="data_coleta">Data de Coleta</Label>
                    <Input
                      id="data_coleta"
                      type="date"
                      value={formData.data_coleta}
                      onChange={(e) => setFormData({...formData, data_coleta: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_recebimento">Data de Recebimento</Label>
                    <Input
                      id="data_recebimento"
                      type="date"
                      value={formData.data_recebimento}
                      onChange={(e) => setFormData({...formData, data_recebimento: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_inicio_analise">Data Início Análise</Label>
                    <Input
                      id="data_inicio_analise"
                      type="date"
                      value={formData.data_inicio_analise}
                      onChange={(e) => setFormData({...formData, data_inicio_analise: e.target.value})}
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

                {/* Propriedades Físicas */}
                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold mb-3">Propriedades Físicas</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="densidade_15c_kg_m3">Densidade 15°C (kg/m³)</Label>
                      <Input
                        id="densidade_15c_kg_m3"
                        type="number"
                        step="0.01"
                        value={formData.densidade_15c_kg_m3}
                        onChange={(e) => setFormData({...formData, densidade_15c_kg_m3: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="densidade_20c_kg_m3">Densidade 20°C (kg/m³)</Label>
                      <Input
                        id="densidade_20c_kg_m3"
                        type="number"
                        step="0.01"
                        value={formData.densidade_20c_kg_m3}
                        onChange={(e) => setFormData({...formData, densidade_20c_kg_m3: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="viscosidade_cinematica_40c_cst">Viscosidade 40°C (cSt)</Label>
                      <Input
                        id="viscosidade_cinematica_40c_cst"
                        type="number"
                        step="0.01"
                        value={formData.viscosidade_cinematica_40c_cst}
                        onChange={(e) => setFormData({...formData, viscosidade_cinematica_40c_cst: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="viscosidade_cinematica_100c_cst">Viscosidade 100°C (cSt)</Label>
                      <Input
                        id="viscosidade_cinematica_100c_cst"
                        type="number"
                        step="0.01"
                        value={formData.viscosidade_cinematica_100c_cst}
                        onChange={(e) => setFormData({...formData, viscosidade_cinematica_100c_cst: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Propriedades Térmicas */}
                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold mb-3">Propriedades Térmicas</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="ponto_fulgor_celsius">Ponto de Fulgor (°C)</Label>
                      <Input
                        id="ponto_fulgor_celsius"
                        type="number"
                        step="0.1"
                        value={formData.ponto_fulgor_celsius}
                        onChange={(e) => setFormData({...formData, ponto_fulgor_celsius: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ponto_fluidez_celsius">Ponto de Fluidez (°C)</Label>
                      <Input
                        id="ponto_fluidez_celsius"
                        type="number"
                        step="0.1"
                        value={formData.ponto_fluidez_celsius}
                        onChange={(e) => setFormData({...formData, ponto_fluidez_celsius: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="poder_calorifico_superior_mj_kg">PCS (MJ/kg)</Label>
                      <Input
                        id="poder_calorifico_superior_mj_kg"
                        type="number"
                        step="0.01"
                        value={formData.poder_calorifico_superior_mj_kg}
                        onChange={(e) => setFormData({...formData, poder_calorifico_superior_mj_kg: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="poder_calorifico_inferior_mj_kg">PCI (MJ/kg)</Label>
                      <Input
                        id="poder_calorifico_inferior_mj_kg"
                        type="number"
                        step="0.01"
                        value={formData.poder_calorifico_inferior_mj_kg}
                        onChange={(e) => setFormData({...formData, poder_calorifico_inferior_mj_kg: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Composição */}
                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold mb-3">Composição</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="teor_agua_percentual">Teor de Água (%)</Label>
                      <Input
                        id="teor_agua_percentual"
                        type="number"
                        step="0.01"
                        value={formData.teor_agua_percentual}
                        onChange={(e) => setFormData({...formData, teor_agua_percentual: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="teor_sedimentos_percentual">Teor de Sedimentos (%)</Label>
                      <Input
                        id="teor_sedimentos_percentual"
                        type="number"
                        step="0.01"
                        value={formData.teor_sedimentos_percentual}
                        onChange={(e) => setFormData({...formData, teor_sedimentos_percentual: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="teor_sal_mg_l">Teor de Sal (mg/L)</Label>
                      <Input
                        id="teor_sal_mg_l"
                        type="number"
                        step="0.01"
                        value={formData.teor_sal_mg_l}
                        onChange={(e) => setFormData({...formData, teor_sal_mg_l: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="enxofre_total_percentual">Enxofre Total (%)</Label>
                      <Input
                        id="enxofre_total_percentual"
                        type="number"
                        step="0.01"
                        value={formData.enxofre_total_percentual}
                        onChange={(e) => setFormData({...formData, enxofre_total_percentual: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="conformidade_anp">Conformidade ANP</Label>
                    <Select value={formData.conformidade_anp} onValueChange={(value) => setFormData({...formData, conformidade_anp: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conformidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Conforme">Conforme</SelectItem>
                        <SelectItem value="Não Conforme">Não Conforme</SelectItem>
                        <SelectItem value="Pendente">Pendente</SelectItem>
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
                    {loading ? 'Salvando...' : (editingAnalise ? 'Atualizar' : 'Criar')}
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
                placeholder="Buscar análises..."
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
                <SelectItem value="Coletada">Coletada</SelectItem>
                <SelectItem value="Recebida">Recebida</SelectItem>
                <SelectItem value="Em Análise">Em Análise</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="Óleo">Óleo</SelectItem>
                <SelectItem value="Gás">Gás</SelectItem>
                <SelectItem value="Água">Água</SelectItem>
                <SelectItem value="Condensado">Condensado</SelectItem>
                <SelectItem value="Combustível">Combustível</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-gray-600">
              <Flask className="h-4 w-4 mr-2" />
              {filteredAnalises.length} análise(s) encontrada(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Análises */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnalises.map((analise) => {
          const progress = getProgressPercentage(analise)
          const densidadeAPI = calculateDensidadeAPI(analise.densidade_20c_kg_m3)
          
          return (
            <Card key={analise.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <Flask className="h-5 w-5 mr-2 text-blue-600" />
                      {analise.numero_analise}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Beaker className="h-4 w-4 mr-1" />
                      {analise.tipo_analise} - {analise.tipo_amostra}
                    </CardDescription>
                  </div>
                  {getStatusBadge(analise.status_analise)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {analise.PontoMedicao && (
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Ponto:</span>
                      <span className="ml-1 font-medium">{analise.PontoMedicao.tag_ponto}</span>
                    </div>
                  )}
                  
                  {/* Progresso da Análise */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Progresso:</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {analise.data_coleta && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Coletada:</span>
                      <span className="ml-1 font-medium">
                        {new Date(analise.data_coleta).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}

                  {analise.data_conclusao && (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Concluída:</span>
                      <span className="ml-1 font-medium">
                        {new Date(analise.data_conclusao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}

                  {/* Propriedades Principais */}
                  {(analise.densidade_20c_kg_m3 || analise.viscosidade_cinematica_40c_cst) && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {analise.densidade_20c_kg_m3 && (
                        <div className="flex items-center">
                          <Droplets className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-600">Densidade:</span>
                          <span className="ml-1 font-medium text-xs">{analise.densidade_20c_kg_m3} kg/m³</span>
                        </div>
                      )}
                      {analise.viscosidade_cinematica_40c_cst && (
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-600">Viscosidade:</span>
                          <span className="ml-1 font-medium text-xs">{analise.viscosidade_cinematica_40c_cst} cSt</span>
                        </div>
                      )}
                    </div>
                  )}

                  {densidadeAPI && (
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">°API:</span>
                      <Badge variant="outline" className="ml-1 font-mono text-xs">
                        {densidadeAPI}°
                      </Badge>
                    </div>
                  )}

                  {analise.conformidade_anp && (
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">ANP:</span>
                      <div className="ml-1">
                        {getConformidadeBadge(analise.conformidade_anp)}
                      </div>
                    </div>
                  )}
                </div>

                {analise.observacoes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <strong>Observações:</strong> {analise.observacoes}
                  </div>
                )}

                {/* Ações do Workflow */}
                {hasPermission('analises_quimicas', 'editar') && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t">
                    {getActionButtons(analise)}
                  </div>
                )}

                {/* Ações CRUD */}
                {(hasPermission('analises_quimicas', 'editar') || hasPermission('analises_quimicas', 'deletar')) && (
                  <div className="flex justify-end space-x-2 pt-2 border-t">
                    {hasPermission('analises_quimicas', 'editar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(analise)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    {hasPermission('analises_quimicas', 'deletar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(analise)}
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

      {filteredAnalises.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Flask className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma análise físico-química encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || tipoFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira análise'
              }
            </p>
            {hasPermission('analises_quimicas', 'criar') && !searchTerm && statusFilter === 'all' && tipoFilter === 'all' && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Análise
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AnalisesQuimicas

