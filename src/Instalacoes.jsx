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
  Building, 
  MapPin, 
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Factory
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

const Instalacoes = ({ globalSearch }) => {
  const { hasPermission, token } = useAuth()
  const [instalacoes, setInstalacoes] = useState([])
  const [polos, setPolos] = useState([])
  const [filteredInstalacoes, setFilteredInstalacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [poloFilter, setPoloFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInstalacao, setEditingInstalacao] = useState(null)
  const [formData, setFormData] = useState({
    nome_instalacao: '',
    codigo_instalacao: '',
    polo_id: '',
    tipo_instalacao: 'Plataforma',
    localizacao_detalhada: '',
    responsavel_operacao: '',
    contato_responsavel: '',
    status_instalacao: 'Ativa',
    observacoes: ''
  })

  // Carregar dados
  useEffect(() => {
    fetchInstalacoes()
    fetchPolos()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    applyFilters()
  }, [instalacoes, searchTerm, statusFilter, poloFilter, globalSearch])

  const fetchInstalacoes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/instalacoes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setInstalacoes(data.instalacoes || data)
      } else {
        setError('Erro ao carregar instalações')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const fetchPolos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/polos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPolos(data.polos || data)
      }
    } catch (err) {
      console.error('Erro ao carregar polos:', err)
    }
  }

  const applyFilters = () => {
    let filtered = [...instalacoes]

    // Busca global
    const search = globalSearch || searchTerm
    if (search) {
      filtered = filtered.filter(instalacao =>
        instalacao.nome_instalacao?.toLowerCase().includes(search.toLowerCase()) ||
        instalacao.codigo_instalacao?.toLowerCase().includes(search.toLowerCase()) ||
        instalacao.localizacao_detalhada?.toLowerCase().includes(search.toLowerCase()) ||
        instalacao.responsavel_operacao?.toLowerCase().includes(search.toLowerCase()) ||
        instalacao.Polo?.nome_polo?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(instalacao => instalacao.status_instalacao === statusFilter)
    }

    // Filtro por polo
    if (poloFilter !== 'all') {
      filtered = filtered.filter(instalacao => instalacao.polo_id === parseInt(poloFilter))
    }

    setFilteredInstalacoes(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingInstalacao 
        ? `${API_BASE_URL}/instalacoes/${editingInstalacao.id}`
        : `${API_BASE_URL}/instalacoes`
      
      const method = editingInstalacao ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          polo_id: parseInt(formData.polo_id)
        })
      })

      if (response.ok) {
        await fetchInstalacoes()
        setIsDialogOpen(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.message || 'Erro ao salvar instalação')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (instalacao) => {
    setEditingInstalacao(instalacao)
    setFormData({
      nome_instalacao: instalacao.nome_instalacao || '',
      codigo_instalacao: instalacao.codigo_instalacao || '',
      polo_id: instalacao.polo_id?.toString() || '',
      tipo_instalacao: instalacao.tipo_instalacao || 'Plataforma',
      localizacao_detalhada: instalacao.localizacao_detalhada || '',
      responsavel_operacao: instalacao.responsavel_operacao || '',
      contato_responsavel: instalacao.contato_responsavel || '',
      status_instalacao: instalacao.status_instalacao || 'Ativa',
      observacoes: instalacao.observacoes || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (instalacao) => {
    if (!confirm(`Tem certeza que deseja excluir a instalação "${instalacao.nome_instalacao}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/instalacoes/${instalacao.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchInstalacoes()
      } else {
        setError('Erro ao excluir instalação')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const resetForm = () => {
    setFormData({
      nome_instalacao: '',
      codigo_instalacao: '',
      polo_id: '',
      tipo_instalacao: 'Plataforma',
      localizacao_detalhada: '',
      responsavel_operacao: '',
      contato_responsavel: '',
      status_instalacao: 'Ativa',
      observacoes: ''
    })
    setEditingInstalacao(null)
    setError('')
  }

  const getStatusBadge = (status) => {
    const configs = {
      'Ativa': { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      'Inativa': { variant: 'secondary', icon: AlertTriangle, color: 'text-gray-600' },
      'Manutencao': { variant: 'destructive', icon: AlertTriangle, color: 'text-orange-600' },
      'Descomissionada': { variant: 'outline', icon: AlertTriangle, color: 'text-red-600' }
    }
    
    const config = configs[status] || configs['Ativa']
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const getTipoIcon = (tipo) => {
    const icons = {
      'Plataforma': Factory,
      'FPSO': Building,
      'Terminal': Building,
      'Refinaria': Factory,
      'Estacao_Compressora': Factory,
      'Outros': Activity
    }
    return icons[tipo] || Activity
  }

  if (loading && instalacoes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando instalações...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Instalações</h2>
          <p className="text-gray-600">Gerencie as instalações do sistema</p>
        </div>

        {hasPermission('instalacoes', 'criar') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Instalação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingInstalacao ? 'Editar Instalação' : 'Nova Instalação'}
                </DialogTitle>
                <DialogDescription>
                  {editingInstalacao 
                    ? 'Edite as informações da instalação selecionada.'
                    : 'Adicione uma nova instalação ao sistema.'
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome_instalacao">Nome da Instalação *</Label>
                    <Input
                      id="nome_instalacao"
                      value={formData.nome_instalacao}
                      onChange={(e) => setFormData({...formData, nome_instalacao: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="codigo_instalacao">Código da Instalação *</Label>
                    <Input
                      id="codigo_instalacao"
                      value={formData.codigo_instalacao}
                      onChange={(e) => setFormData({...formData, codigo_instalacao: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="polo_id">Polo *</Label>
                    <Select value={formData.polo_id} onValueChange={(value) => setFormData({...formData, polo_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um polo" />
                      </SelectTrigger>
                      <SelectContent>
                        {polos.map((polo) => (
                          <SelectItem key={polo.id} value={polo.id.toString()}>
                            {polo.nome_polo} ({polo.codigo_polo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tipo_instalacao">Tipo de Instalação</Label>
                    <Select value={formData.tipo_instalacao} onValueChange={(value) => setFormData({...formData, tipo_instalacao: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Plataforma">Plataforma</SelectItem>
                        <SelectItem value="FPSO">FPSO</SelectItem>
                        <SelectItem value="Terminal">Terminal</SelectItem>
                        <SelectItem value="Refinaria">Refinaria</SelectItem>
                        <SelectItem value="Estacao_Compressora">Estação Compressora</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="localizacao_detalhada">Localização Detalhada</Label>
                  <Input
                    id="localizacao_detalhada"
                    value={formData.localizacao_detalhada}
                    onChange={(e) => setFormData({...formData, localizacao_detalhada: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="responsavel_operacao">Responsável pela Operação</Label>
                    <Input
                      id="responsavel_operacao"
                      value={formData.responsavel_operacao}
                      onChange={(e) => setFormData({...formData, responsavel_operacao: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contato_responsavel">Contato do Responsável</Label>
                    <Input
                      id="contato_responsavel"
                      value={formData.contato_responsavel}
                      onChange={(e) => setFormData({...formData, contato_responsavel: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status_instalacao">Status</Label>
                  <Select value={formData.status_instalacao} onValueChange={(value) => setFormData({...formData, status_instalacao: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativa">Ativa</SelectItem>
                      <SelectItem value="Inativa">Inativa</SelectItem>
                      <SelectItem value="Manutencao">Manutenção</SelectItem>
                      <SelectItem value="Descomissionada">Descomissionada</SelectItem>
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
                    {loading ? 'Salvando...' : (editingInstalacao ? 'Atualizar' : 'Criar')}
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
                placeholder="Buscar instalações..."
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
                <SelectItem value="Ativa">Ativa</SelectItem>
                <SelectItem value="Inativa">Inativa</SelectItem>
                <SelectItem value="Manutencao">Manutenção</SelectItem>
                <SelectItem value="Descomissionada">Descomissionada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={poloFilter} onValueChange={setPoloFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por polo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Polos</SelectItem>
                {polos.map((polo) => (
                  <SelectItem key={polo.id} value={polo.id.toString()}>
                    {polo.nome_polo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-gray-600">
              <Activity className="h-4 w-4 mr-2" />
              {filteredInstalacoes.length} instalação(ões) encontrada(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Instalações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstalacoes.map((instalacao) => {
          const TipoIcon = getTipoIcon(instalacao.tipo_instalacao)
          
          return (
            <Card key={instalacao.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <TipoIcon className="h-5 w-5 mr-2 text-blue-600" />
                      {instalacao.nome_instalacao}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Building className="h-4 w-4 mr-1" />
                      {instalacao.codigo_instalacao}
                    </CardDescription>
                  </div>
                  {getStatusBadge(instalacao.status_instalacao)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {instalacao.Polo && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Polo:</span>
                      <span className="ml-1 font-medium">{instalacao.Polo.nome_polo}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Factory className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Tipo:</span>
                    <span className="ml-1 font-medium">{instalacao.tipo_instalacao?.replace('_', ' ')}</span>
                  </div>

                  {instalacao.localizacao_detalhada && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Local:</span>
                      <span className="ml-1 font-medium">{instalacao.localizacao_detalhada}</span>
                    </div>
                  )}
                  
                  {instalacao.responsavel_operacao && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Responsável:</span>
                      <span className="ml-1 font-medium">{instalacao.responsavel_operacao}</span>
                    </div>
                  )}

                  {instalacao.contato_responsavel && (
                    <div className="text-xs text-gray-500">
                      Contato: {instalacao.contato_responsavel}
                    </div>
                  )}
                </div>

                {instalacao.observacoes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <strong>Observações:</strong> {instalacao.observacoes}
                  </div>
                )}

                {(hasPermission('instalacoes', 'editar') || hasPermission('instalacoes', 'deletar')) && (
                  <div className="flex justify-end space-x-2 pt-3 border-t">
                    {hasPermission('instalacoes', 'editar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(instalacao)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    {hasPermission('instalacoes', 'deletar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(instalacao)}
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

      {filteredInstalacoes.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma instalação encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || poloFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira instalação'
              }
            </p>
            {hasPermission('instalacoes', 'criar') && !searchTerm && statusFilter === 'all' && poloFilter === 'all' && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Instalação
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Instalacoes

