import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  MapPin, 
  Building, 
  Users,
  Activity,
  AlertTriangle,
  CheckCircle
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

const Polos = ({ globalSearch }) => {
  const { hasPermission, token } = useAuth()
  const [polos, setPolos] = useState([])
  const [filteredPolos, setFilteredPolos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPolo, setEditingPolo] = useState(null)
  const [formData, setFormData] = useState({
    nome_polo: '',
    codigo_polo: '',
    localizacao: '',
    responsavel_tecnico: '',
    contato_responsavel: '',
    status_polo: 'Ativo',
    observacoes: ''
  })

  // Carregar dados
  useEffect(() => {
    fetchPolos()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    applyFilters()
  }, [polos, searchTerm, statusFilter, globalSearch])

  const fetchPolos = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/polos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPolos(data.polos || data)
      } else {
        setError('Erro ao carregar polos')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...polos]

    // Busca global
    const search = globalSearch || searchTerm
    if (search) {
      filtered = filtered.filter(polo =>
        polo.nome_polo?.toLowerCase().includes(search.toLowerCase()) ||
        polo.codigo_polo?.toLowerCase().includes(search.toLowerCase()) ||
        polo.localizacao?.toLowerCase().includes(search.toLowerCase()) ||
        polo.responsavel_tecnico?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(polo => polo.status_polo === statusFilter)
    }

    setFilteredPolos(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingPolo 
        ? `${API_BASE_URL}/polos/${editingPolo.id}`
        : `${API_BASE_URL}/polos`
      
      const method = editingPolo ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchPolos()
        setIsDialogOpen(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.message || 'Erro ao salvar polo')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (polo) => {
    setEditingPolo(polo)
    setFormData({
      nome_polo: polo.nome_polo || '',
      codigo_polo: polo.codigo_polo || '',
      localizacao: polo.localizacao || '',
      responsavel_tecnico: polo.responsavel_tecnico || '',
      contato_responsavel: polo.contato_responsavel || '',
      status_polo: polo.status_polo || 'Ativo',
      observacoes: polo.observacoes || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (polo) => {
    if (!confirm(`Tem certeza que deseja excluir o polo "${polo.nome_polo}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/polos/${polo.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchPolos()
      } else {
        setError('Erro ao excluir polo')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const resetForm = () => {
    setFormData({
      nome_polo: '',
      codigo_polo: '',
      localizacao: '',
      responsavel_tecnico: '',
      contato_responsavel: '',
      status_polo: 'Ativo',
      observacoes: ''
    })
    setEditingPolo(null)
    setError('')
  }

  const getStatusBadge = (status) => {
    const configs = {
      'Ativo': { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      'Inativo': { variant: 'secondary', icon: AlertTriangle, color: 'text-gray-600' },
      'Manutencao': { variant: 'destructive', icon: AlertTriangle, color: 'text-orange-600' }
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

  if (loading && polos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando polos...</p>
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

      {/* Header com Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Polos</h2>
          <p className="text-gray-600">Gerencie os polos do sistema</p>
        </div>

        {hasPermission('polos', 'criar') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Polo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPolo ? 'Editar Polo' : 'Novo Polo'}
                </DialogTitle>
                <DialogDescription>
                  {editingPolo 
                    ? 'Edite as informações do polo selecionado.'
                    : 'Adicione um novo polo ao sistema.'
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome_polo">Nome do Polo *</Label>
                    <Input
                      id="nome_polo"
                      value={formData.nome_polo}
                      onChange={(e) => setFormData({...formData, nome_polo: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="codigo_polo">Código do Polo *</Label>
                    <Input
                      id="codigo_polo"
                      value={formData.codigo_polo}
                      onChange={(e) => setFormData({...formData, codigo_polo: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="localizacao">Localização *</Label>
                  <Input
                    id="localizacao"
                    value={formData.localizacao}
                    onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="responsavel_tecnico">Responsável Técnico</Label>
                    <Input
                      id="responsavel_tecnico"
                      value={formData.responsavel_tecnico}
                      onChange={(e) => setFormData({...formData, responsavel_tecnico: e.target.value})}
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
                  <Label htmlFor="status_polo">Status</Label>
                  <Select value={formData.status_polo} onValueChange={(value) => setFormData({...formData, status_polo: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                      <SelectItem value="Manutencao">Manutenção</SelectItem>
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
                    {loading ? 'Salvando...' : (editingPolo ? 'Atualizar' : 'Criar')}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar polos..."
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
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-gray-600">
              <Activity className="h-4 w-4 mr-2" />
              {filteredPolos.length} polo(s) encontrado(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Polos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPolos.map((polo) => (
          <Card key={polo.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{polo.nome_polo}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {polo.codigo_polo}
                  </CardDescription>
                </div>
                {getStatusBadge(polo.status_polo)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Localização:</span>
                  <span className="ml-1 font-medium">{polo.localizacao}</span>
                </div>
                
                {polo.responsavel_tecnico && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Responsável:</span>
                    <span className="ml-1 font-medium">{polo.responsavel_tecnico}</span>
                  </div>
                )}

                {polo.contato_responsavel && (
                  <div className="text-xs text-gray-500">
                    Contato: {polo.contato_responsavel}
                  </div>
                )}
              </div>

              {polo.observacoes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                  <strong>Observações:</strong> {polo.observacoes}
                </div>
              )}

              {(hasPermission('polos', 'editar') || hasPermission('polos', 'deletar')) && (
                <div className="flex justify-end space-x-2 pt-3 border-t">
                  {hasPermission('polos', 'editar') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(polo)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  )}
                  {hasPermission('polos', 'deletar') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(polo)}
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
        ))}
      </div>

      {filteredPolos.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum polo encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro polo'
              }
            </p>
            {hasPermission('polos', 'criar') && !searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Polo
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Polos

