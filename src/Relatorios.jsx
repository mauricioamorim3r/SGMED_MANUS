import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Target,
  Zap,
  Shield,
  Eye,
  RefreshCw,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  Share,
  Mail,
  Printer,
  FileSpreadsheet,
  FileImage,
  Database,
  Activity,
  MapPin,
  Gauge
} from 'lucide-react'
import { 
  generateEquipmentReport, 
  generateChemicalAnalysisReport, 
  generateWellTestReport 
} from '@/lib/pdfUtils'
import { 
  DataExporter, 
  exportEquipments, 
  exportChemicalAnalyses, 
  exportWellTests, 
  exportStock, 
  exportStockMovements, 
  exportChangeControl 
} from '@/lib/exportUtils'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

const API_BASE_URL = 'http://localhost:3001/api'

const Relatorios = () => {
  const { hasPermission, token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [relatoriosSalvos, setRelatoriosSalvos] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRelatorio, setEditingRelatorio] = useState(null)
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false)
  
  const [filtros, setFiltros] = useState({
    modulo: '',
    data_inicio: '',
    data_fim: '',
    status: '',
    responsavel: '',
    polo: '',
    instalacao: '',
    tipo_fluido: '',
    incluir_graficos: true,
    incluir_detalhes: true,
    incluir_anexos: false,
    formato: 'PDF',
    orientacao: 'retrato',
    tamanho_papel: 'A4'
  })

  const [relatorioPersonalizado, setRelatorioPersonalizado] = useState({
    nome: '',
    descricao: '',
    modulos_incluidos: [],
    campos_selecionados: {},
    filtros_padrao: {},
    formato_padrao: 'PDF',
    agendamento: {
      ativo: false,
      frequencia: 'mensal',
      dia_mes: 1,
      hora: '08:00',
      emails_destino: []
    }
  })

  const modulosDisponiveis = [
    { id: 'polos', nome: 'Polos', icon: MapPin },
    { id: 'instalacoes', nome: 'Instalações', icon: Target },
    { id: 'pontos_medicao', nome: 'Pontos de Medição', icon: Gauge },
    { id: 'placas_orificio', nome: 'Placas de Orifício', icon: Settings },
    { id: 'incertezas', nome: 'Incertezas de Medição', icon: BarChart3 },
    { id: 'trechos_retos', nome: 'Trechos Retos', icon: Activity },
    { id: 'testes_pocos', nome: 'Testes de Poços', icon: Zap },
    { id: 'analises_quimicas', nome: 'Análises Químicas', icon: FileText },
    { id: 'estoque', nome: 'Estoque', icon: Database },
    { id: 'movimentacao_estoque', nome: 'Movimentação de Estoque', icon: TrendingUp },
    { id: 'controle_mudancas', nome: 'Controle de Mudanças', icon: Shield },
    { id: 'usuarios', nome: 'Usuários', icon: Users }
  ]

  const tiposRelatorio = [
    {
      id: 'operacional',
      nome: 'Relatório Operacional',
      descricao: 'Status geral dos equipamentos e medições',
      icon: Activity,
      modulos: ['polos', 'instalacoes', 'pontos_medicao', 'placas_orificio']
    },
    {
      id: 'calibracao',
      nome: 'Relatório de Calibração',
      descricao: 'Situação das calibrações e vencimentos',
      icon: Settings,
      modulos: ['pontos_medicao', 'placas_orificio', 'incertezas']
    },
    {
      id: 'qualidade',
      nome: 'Relatório de Qualidade',
      descricao: 'Análises químicas e testes de qualidade',
      icon: CheckCircle,
      modulos: ['analises_quimicas', 'testes_pocos']
    },
    {
      id: 'gestao',
      nome: 'Relatório de Gestão',
      descricao: 'Estoque, movimentações e mudanças',
      icon: BarChart3,
      modulos: ['estoque', 'movimentacao_estoque', 'controle_mudancas']
    },
    {
      id: 'auditoria',
      nome: 'Relatório de Auditoria',
      descricao: 'Logs de sistema e atividades dos usuários',
      icon: Shield,
      modulos: ['usuarios', 'controle_mudancas']
    }
  ]

  useEffect(() => {
    fetchRelatoriosSalvos()
  }, [])

  const fetchRelatoriosSalvos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/relatorios-salvos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRelatoriosSalvos(data.relatorios || [])
      }
    } catch (err) {
      console.error('Erro ao carregar relatórios salvos:', err)
    }
  }

  const gerarRelatorio = async (tipo = 'personalizado') => {
    try {
      setGerandoRelatorio(true)
      setError('')
      setSuccess('')

      // Fetch data based on report type
      let data = null
      
      if (tipo === 'operacional') {
        // Fetch equipment and measurement points data
        const equipmentResponse = await fetch(`${API_BASE_URL}/equipamentos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const equipmentData = await equipmentResponse.json()
        
        if (filtros.formato === 'PDF') {
          await generateEquipmentReport(equipmentData.equipamentos || [])
        } else if (filtros.formato === 'Excel') {
          const exportData = exportEquipments(equipmentData.equipamentos || [])
          DataExporter.exportToExcel(exportData, `relatorio_equipamentos_${new Date().toISOString().split('T')[0]}`)
        } else if (filtros.formato === 'CSV') {
          const exportData = exportEquipments(equipmentData.equipamentos || [])
          DataExporter.exportToCSV(exportData, `relatorio_equipamentos_${new Date().toISOString().split('T')[0]}`)
        }
      } else if (tipo === 'qualidade') {
        // Fetch chemical analysis data
        const analysisResponse = await fetch(`${API_BASE_URL}/analises-quimicas`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const analysisData = await analysisResponse.json()
        
        if (filtros.formato === 'Excel') {
          const exportData = exportChemicalAnalyses(analysisData.analises || [])
          DataExporter.exportToExcel(exportData, `relatorio_analises_${new Date().toISOString().split('T')[0]}`)
        } else if (filtros.formato === 'CSV') {
          const exportData = exportChemicalAnalyses(analysisData.analises || [])
          DataExporter.exportToCSV(exportData, `relatorio_analises_${new Date().toISOString().split('T')[0]}`)
        }
      } else if (tipo === 'gestao') {
        // Fetch stock data
        const stockResponse = await fetch(`${API_BASE_URL}/estoque`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const stockData = await stockResponse.json()
        
        if (filtros.formato === 'Excel') {
          const exportData = exportStock(stockData.itens || [])
          DataExporter.exportToExcel(exportData, `relatorio_estoque_${new Date().toISOString().split('T')[0]}`)
        } else if (filtros.formato === 'CSV') {
          const exportData = exportStock(stockData.itens || [])
          DataExporter.exportToCSV(exportData, `relatorio_estoque_${new Date().toISOString().split('T')[0]}`)
        }
      } else {
        // Custom report - for now, generate equipment report
        const equipmentResponse = await fetch(`${API_BASE_URL}/equipamentos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const equipmentData = await equipmentResponse.json()
        
        if (filtros.formato === 'PDF') {
          await generateEquipmentReport(equipmentData.equipamentos || [])
        } else if (filtros.formato === 'Excel') {
          const exportData = exportEquipments(equipmentData.equipamentos || [])
          DataExporter.exportToExcel(exportData, `relatorio_personalizado_${new Date().toISOString().split('T')[0]}`)
        } else if (filtros.formato === 'CSV') {
          const exportData = exportEquipments(equipmentData.equipamentos || [])
          DataExporter.exportToCSV(exportData, `relatorio_personalizado_${new Date().toISOString().split('T')[0]}`)
        }
      }
        
      setSuccess('Relatório gerado e baixado com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Erro ao gerar relatório:', err)
      setError('Erro ao gerar relatório: ' + err.message)
    } finally {
      setGerandoRelatorio(false)
    }
  }

  const salvarRelatorio = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/relatorios-salvos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(relatorioPersonalizado)
      })

      if (response.ok) {
        await fetchRelatoriosSalvos()
        setSuccess('Relatório salvo com sucesso!')
        setTimeout(() => setSuccess(''), 3000)
        setIsDialogOpen(false)
      } else {
        setError('Erro ao salvar relatório')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const agendarRelatorio = async (relatorio) => {
    try {
      const response = await fetch(`${API_BASE_URL}/relatorios-salvos/${relatorio.id}/agendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(relatorio.agendamento)
      })

      if (response.ok) {
        setSuccess('Relatório agendado com sucesso!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Erro ao agendar relatório')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const getFormatoIcon = (formato) => {
    const icons = {
      'PDF': FileText,
      'Excel': FileSpreadsheet,
      'CSV': FileText,
      'PNG': FileImage
    }
    return icons[formato] || FileText
  }

  const getFormatoColor = (formato) => {
    const colors = {
      'PDF': 'text-red-600',
      'Excel': 'text-green-600',
      'CSV': 'text-blue-600',
      'PNG': 'text-purple-600'
    }
    return colors[formato] || 'text-gray-600'
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
          <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
          <p className="text-gray-600">Gere relatórios personalizados e análises do sistema</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Relatório
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Relatório Personalizado</DialogTitle>
              <DialogDescription>
                Configure um relatório personalizado com filtros e campos específicos
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="configuracao" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="configuracao">Configuração</TabsTrigger>
                <TabsTrigger value="campos">Campos</TabsTrigger>
                <TabsTrigger value="agendamento">Agendamento</TabsTrigger>
              </TabsList>

              <TabsContent value="configuracao" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome_relatorio">Nome do Relatório</Label>
                    <Input
                      id="nome_relatorio"
                      value={relatorioPersonalizado.nome}
                      onChange={(e) => setRelatorioPersonalizado(prev => ({...prev, nome: e.target.value}))}
                      placeholder="Nome do relatório"
                    />
                  </div>
                  <div>
                    <Label htmlFor="formato_padrao">Formato Padrão</Label>
                    <Select 
                      value={relatorioPersonalizado.formato_padrao} 
                      onValueChange={(value) => setRelatorioPersonalizado(prev => ({...prev, formato_padrao: value}))}
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

                <div>
                  <Label htmlFor="descricao_relatorio">Descrição</Label>
                  <Textarea
                    id="descricao_relatorio"
                    value={relatorioPersonalizado.descricao}
                    onChange={(e) => setRelatorioPersonalizado(prev => ({...prev, descricao: e.target.value}))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Módulos Incluídos</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {modulosDisponiveis.map((modulo) => {
                      const Icon = modulo.icon
                      return (
                        <div key={modulo.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={modulo.id}
                            checked={relatorioPersonalizado.modulos_incluidos.includes(modulo.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setRelatorioPersonalizado(prev => ({
                                  ...prev,
                                  modulos_incluidos: [...prev.modulos_incluidos, modulo.id]
                                }))
                              } else {
                                setRelatorioPersonalizado(prev => ({
                                  ...prev,
                                  modulos_incluidos: prev.modulos_incluidos.filter(m => m !== modulo.id)
                                }))
                              }
                            }}
                          />
                          <Label htmlFor={modulo.id} className="flex items-center">
                            <Icon className="h-4 w-4 mr-1" />
                            {modulo.nome}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="campos" className="space-y-4">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Seleção de Campos
                  </h3>
                  <p className="text-gray-500">
                    Funcionalidade em desenvolvimento. Em breve você poderá selecionar campos específicos para cada módulo.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="agendamento" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ativar_agendamento"
                    checked={relatorioPersonalizado.agendamento.ativo}
                    onCheckedChange={(checked) => setRelatorioPersonalizado(prev => ({
                      ...prev,
                      agendamento: { ...prev.agendamento, ativo: checked }
                    }))}
                  />
                  <Label htmlFor="ativar_agendamento">Ativar agendamento automático</Label>
                </div>

                {relatorioPersonalizado.agendamento.ativo && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="frequencia">Frequência</Label>
                        <Select 
                          value={relatorioPersonalizado.agendamento.frequencia} 
                          onValueChange={(value) => setRelatorioPersonalizado(prev => ({
                            ...prev,
                            agendamento: { ...prev.agendamento, frequencia: value }
                          }))}
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
                        <Label htmlFor="dia_mes">Dia do Mês</Label>
                        <Input
                          id="dia_mes"
                          type="number"
                          min="1"
                          max="31"
                          value={relatorioPersonalizado.agendamento.dia_mes}
                          onChange={(e) => setRelatorioPersonalizado(prev => ({
                            ...prev,
                            agendamento: { ...prev.agendamento, dia_mes: parseInt(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="hora">Hora</Label>
                        <Input
                          id="hora"
                          type="time"
                          value={relatorioPersonalizado.agendamento.hora}
                          onChange={(e) => setRelatorioPersonalizado(prev => ({
                            ...prev,
                            agendamento: { ...prev.agendamento, hora: e.target.value }
                          }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="emails_destino">Emails de Destino (separados por vírgula)</Label>
                      <Textarea
                        id="emails_destino"
                        value={relatorioPersonalizado.agendamento.emails_destino.join(', ')}
                        onChange={(e) => setRelatorioPersonalizado(prev => ({
                          ...prev,
                          agendamento: { 
                            ...prev.agendamento, 
                            emails_destino: e.target.value.split(',').map(email => email.trim()) 
                          }
                        }))}
                        placeholder="email1@empresa.com, email2@empresa.com"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={salvarRelatorio} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Relatório'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="rapidos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rapidos">Relatórios Rápidos</TabsTrigger>
          <TabsTrigger value="personalizados">Relatórios Salvos</TabsTrigger>
          <TabsTrigger value="filtros">Filtros Avançados</TabsTrigger>
        </TabsList>

        {/* Relatórios Rápidos */}
        <TabsContent value="rapidos">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiposRelatorio.map((tipo) => {
              const Icon = tipo.icon
              return (
                <Card key={tipo.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Icon className="h-5 w-5 mr-2 text-blue-600" />
                      {tipo.nome}
                    </CardTitle>
                    <CardDescription>{tipo.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Módulos incluídos:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tipo.modulos.map((moduloId) => {
                            const modulo = modulosDisponiveis.find(m => m.id === moduloId)
                            return (
                              <Badge key={moduloId} variant="outline" className="text-xs">
                                {modulo?.nome}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => gerarRelatorio(tipo.id)}
                          disabled={gerandoRelatorio}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          {gerandoRelatorio ? 'Gerando...' : 'Gerar'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Relatórios Salvos */}
        <TabsContent value="personalizados">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatoriosSalvos.map((relatorio) => {
              const FormatoIcon = getFormatoIcon(relatorio.formato_padrao)
              const formatoColor = getFormatoColor(relatorio.formato_padrao)
              
              return (
                <Card key={relatorio.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        {relatorio.nome}
                      </span>
                      <FormatoIcon className={`h-5 w-5 ${formatoColor}`} />
                    </CardTitle>
                    <CardDescription>{relatorio.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Módulos incluídos:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {relatorio.modulos_incluidos?.map((moduloId) => {
                            const modulo = modulosDisponiveis.find(m => m.id === moduloId)
                            return (
                              <Badge key={moduloId} variant="outline" className="text-xs">
                                {modulo?.nome}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>

                      {relatorio.agendamento?.ativo && (
                        <div className="flex items-center text-sm text-green-600">
                          <Clock className="h-4 w-4 mr-1" />
                          Agendado ({relatorio.agendamento.frequencia})
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => gerarRelatorio('personalizado')}
                          disabled={gerandoRelatorio}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          {gerandoRelatorio ? 'Gerando...' : 'Gerar'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {relatoriosSalvos.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Nenhum relatório salvo
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Crie seu primeiro relatório personalizado
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Relatório
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Filtros Avançados */}
        <TabsContent value="filtros">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtros Avançados
              </CardTitle>
              <CardDescription>
                Configure filtros detalhados para personalizar seus relatórios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="modulo_filtro">Módulo</Label>
                  <Select value={filtros.modulo} onValueChange={(value) => setFiltros(prev => ({...prev, modulo: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os módulos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os módulos</SelectItem>
                      {modulosDisponiveis.map((modulo) => (
                        <SelectItem key={modulo.id} value={modulo.id}>
                          {modulo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="data_inicio">Data Início</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={filtros.data_inicio}
                    onChange={(e) => setFiltros(prev => ({...prev, data_inicio: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="data_fim">Data Fim</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={filtros.data_fim}
                    onChange={(e) => setFiltros(prev => ({...prev, data_fim: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="status_filtro">Status</Label>
                  <Select value={filtros.status} onValueChange={(value) => setFiltros(prev => ({...prev, status: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os status</SelectItem>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                      <SelectItem value="Manutenção">Manutenção</SelectItem>
                      <SelectItem value="Calibração">Calibração</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="polo_filtro">Polo</Label>
                  <Input
                    id="polo_filtro"
                    value={filtros.polo}
                    onChange={(e) => setFiltros(prev => ({...prev, polo: e.target.value}))}
                    placeholder="Filtrar por polo"
                  />
                </div>
                <div>
                  <Label htmlFor="instalacao_filtro">Instalação</Label>
                  <Input
                    id="instalacao_filtro"
                    value={filtros.instalacao}
                    onChange={(e) => setFiltros(prev => ({...prev, instalacao: e.target.value}))}
                    placeholder="Filtrar por instalação"
                  />
                </div>
                <div>
                  <Label htmlFor="tipo_fluido_filtro">Tipo de Fluido</Label>
                  <Select value={filtros.tipo_fluido} onValueChange={(value) => setFiltros(prev => ({...prev, tipo_fluido: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os fluidos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os fluidos</SelectItem>
                      <SelectItem value="Gás Natural">Gás Natural</SelectItem>
                      <SelectItem value="Óleo">Óleo</SelectItem>
                      <SelectItem value="Água">Água</SelectItem>
                      <SelectItem value="Condensado">Condensado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold mb-4">Opções de Formatação</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="formato_relatorio">Formato</Label>
                    <Select value={filtros.formato} onValueChange={(value) => setFiltros(prev => ({...prev, formato: value}))}>
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
                  <div>
                    <Label htmlFor="orientacao">Orientação</Label>
                    <Select value={filtros.orientacao} onValueChange={(value) => setFiltros(prev => ({...prev, orientacao: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retrato">Retrato</SelectItem>
                        <SelectItem value="paisagem">Paisagem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tamanho_papel">Tamanho do Papel</Label>
                    <Select value={filtros.tamanho_papel} onValueChange={(value) => setFiltros(prev => ({...prev, tamanho_papel: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="A3">A3</SelectItem>
                        <SelectItem value="Letter">Letter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="incluir_graficos"
                      checked={filtros.incluir_graficos}
                      onCheckedChange={(checked) => setFiltros(prev => ({...prev, incluir_graficos: checked}))}
                    />
                    <Label htmlFor="incluir_graficos">Incluir gráficos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="incluir_detalhes"
                      checked={filtros.incluir_detalhes}
                      onCheckedChange={(checked) => setFiltros(prev => ({...prev, incluir_detalhes: checked}))}
                    />
                    <Label htmlFor="incluir_detalhes">Incluir detalhes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="incluir_anexos"
                      checked={filtros.incluir_anexos}
                      onCheckedChange={(checked) => setFiltros(prev => ({...prev, incluir_anexos: checked}))}
                    />
                    <Label htmlFor="incluir_anexos">Incluir anexos</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setFiltros({
                  modulo: '',
                  data_inicio: '',
                  data_fim: '',
                  status: '',
                  responsavel: '',
                  polo: '',
                  instalacao: '',
                  tipo_fluido: '',
                  incluir_graficos: true,
                  incluir_detalhes: true,
                  incluir_anexos: false,
                  formato: 'PDF',
                  orientacao: 'retrato',
                  tamanho_papel: 'A4'
                })}>
                  Limpar Filtros
                </Button>
                <Button onClick={() => gerarRelatorio('personalizado')} disabled={gerandoRelatorio}>
                  <Download className="h-4 w-4 mr-2" />
                  {gerandoRelatorio ? 'Gerando...' : 'Gerar Relatório'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Relatorios

