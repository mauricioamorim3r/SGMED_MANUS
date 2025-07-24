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
  User, 
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
  Users,
  FileText,
  Zap,
  AlertCircle,
  Mail,
  Phone,
  Building,
  UserCheck,
  UserX,
  Key
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

const Usuarios = ({ globalSearch }) => {
  const { hasPermission, token } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [filteredUsuarios, setFilteredUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [perfilFilter, setPerfilFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmar_senha: '',
    telefone: '',
    cargo: '',
    departamento: '',
    setor: '',
    perfil_acesso: 'Operador',
    status_usuario: 'Ativo',
    data_admissao: '',
    data_ultimo_acesso: '',
    numero_cracha: '',
    centro_custo: '',
    supervisor_id: '',
    observacoes: ''
  })

  // Carregar dados
  useEffect(() => {
    fetchUsuarios()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    applyFilters()
  }, [usuarios, searchTerm, statusFilter, perfilFilter, globalSearch])

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsuarios(data.usuarios || data)
      } else {
        setError('Erro ao carregar usuários')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...usuarios]

    // Busca global
    const search = globalSearch || searchTerm
    if (search) {
      filtered = filtered.filter(usuario =>
        usuario.nome?.toLowerCase().includes(search.toLowerCase()) ||
        usuario.email?.toLowerCase().includes(search.toLowerCase()) ||
        usuario.cargo?.toLowerCase().includes(search.toLowerCase()) ||
        usuario.departamento?.toLowerCase().includes(search.toLowerCase()) ||
        usuario.setor?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(usuario => usuario.status_usuario === statusFilter)
    }

    // Filtro por perfil
    if (perfilFilter !== 'all') {
      filtered = filtered.filter(usuario => usuario.perfil_acesso === perfilFilter)
    }

    setFilteredUsuarios(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validar senhas
    if (!editingUsuario && formData.senha !== formData.confirmar_senha) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    try {
      const url = editingUsuario 
        ? `${API_BASE_URL}/usuarios/${editingUsuario.id}`
        : `${API_BASE_URL}/usuarios`
      
      const method = editingUsuario ? 'PUT' : 'POST'

      const submitData = { ...formData }
      delete submitData.confirmar_senha
      
      // Não enviar senha vazia em edição
      if (editingUsuario && !submitData.senha) {
        delete submitData.senha
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...submitData,
          supervisor_id: formData.supervisor_id ? parseInt(formData.supervisor_id) : null
        })
      })

      if (response.ok) {
        await fetchUsuarios()
        setIsDialogOpen(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.message || 'Erro ao salvar usuário')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (usuario, novoStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${usuario.id}/${novoStatus.toLowerCase()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchUsuarios()
      } else {
        setError(`Erro ao ${novoStatus.toLowerCase()} usuário`)
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const handleResetPassword = async (usuario) => {
    if (!confirm(`Tem certeza que deseja resetar a senha do usuário "${usuario.nome}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${usuario.id}/reset-senha`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        alert('Senha resetada com sucesso. Nova senha temporária enviada por email.')
      } else {
        setError('Erro ao resetar senha')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario)
    setFormData({
      nome: usuario.nome || '',
      email: usuario.email || '',
      senha: '',
      confirmar_senha: '',
      telefone: usuario.telefone || '',
      cargo: usuario.cargo || '',
      departamento: usuario.departamento || '',
      setor: usuario.setor || '',
      perfil_acesso: usuario.perfil_acesso || 'Operador',
      status_usuario: usuario.status_usuario || 'Ativo',
      data_admissao: usuario.data_admissao ? 
        new Date(usuario.data_admissao).toISOString().split('T')[0] : '',
      data_ultimo_acesso: usuario.data_ultimo_acesso ? 
        new Date(usuario.data_ultimo_acesso).toISOString().split('T')[0] : '',
      numero_cracha: usuario.numero_cracha || '',
      centro_custo: usuario.centro_custo || '',
      supervisor_id: usuario.supervisor_id?.toString() || '',
      observacoes: usuario.observacoes || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (usuario) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${usuario.nome}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${usuario.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchUsuarios()
      } else {
        setError('Erro ao excluir usuário')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      confirmar_senha: '',
      telefone: '',
      cargo: '',
      departamento: '',
      setor: '',
      perfil_acesso: 'Operador',
      status_usuario: 'Ativo',
      data_admissao: '',
      data_ultimo_acesso: '',
      numero_cracha: '',
      centro_custo: '',
      supervisor_id: '',
      observacoes: ''
    })
    setEditingUsuario(null)
    setError('')
  }

  const getStatusBadge = (status) => {
    const configs = {
      'Ativo': { variant: 'default', icon: UserCheck, color: 'text-green-600' },
      'Inativo': { variant: 'secondary', icon: UserX, color: 'text-gray-600' },
      'Bloqueado': { variant: 'destructive', icon: Lock, color: 'text-red-600' },
      'Pendente': { variant: 'outline', icon: Clock, color: 'text-orange-600' }
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

  const getPerfilBadge = (perfil) => {
    const configs = {
      'Administrador': { variant: 'destructive', color: 'text-red-600' },
      'Supervisor': { variant: 'default', color: 'text-blue-600' },
      'Operador': { variant: 'secondary', color: 'text-green-600' },
      'Consulta': { variant: 'outline', color: 'text-gray-600' }
    }
    
    const config = configs[perfil] || configs['Operador']

    return (
      <Badge variant={config.variant} className={config.color}>
        <Shield className="h-3 w-3 mr-1" />
        {perfil}
      </Badge>
    )
  }

  const calculateDaysSinceLastAccess = (dataUltimoAcesso) => {
    if (!dataUltimoAcesso) return null
    
    const hoje = new Date()
    const ultimoAcesso = new Date(dataUltimoAcesso)
    const diffTime = hoje - ultimoAcesso
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const getActionButtons = (usuario) => {
    const buttons = []
    
    if (usuario.status_usuario === 'Ativo') {
      buttons.push(
        <Button
          key="bloquear"
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange(usuario, 'Bloqueado')}
          className="text-red-600"
        >
          <Lock className="h-4 w-4 mr-1" />
          Bloquear
        </Button>
      )
      buttons.push(
        <Button
          key="inativar"
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange(usuario, 'Inativo')}
          className="text-gray-600"
        >
          <UserX className="h-4 w-4 mr-1" />
          Inativar
        </Button>
      )
    }
    
    if (usuario.status_usuario === 'Inativo') {
      buttons.push(
        <Button
          key="ativar"
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange(usuario, 'Ativo')}
          className="text-green-600"
        >
          <UserCheck className="h-4 w-4 mr-1" />
          Ativar
        </Button>
      )
    }
    
    if (usuario.status_usuario === 'Bloqueado') {
      buttons.push(
        <Button
          key="desbloquear"
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange(usuario, 'Ativo')}
          className="text-green-600"
        >
          <Unlock className="h-4 w-4 mr-1" />
          Desbloquear
        </Button>
      )
    }

    buttons.push(
      <Button
        key="reset-senha"
        size="sm"
        variant="outline"
        onClick={() => handleResetPassword(usuario)}
        className="text-blue-600"
      >
        <Key className="h-4 w-4 mr-1" />
        Reset Senha
      </Button>
    )

    return buttons
  }

  if (loading && usuarios.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuários...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Usuários</h2>
          <p className="text-gray-600">Gerencie usuários, permissões e acessos do sistema</p>
        </div>

        {hasPermission('usuarios', 'criar') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
                </DialogTitle>
                <DialogDescription>
                  {editingUsuario 
                    ? 'Edite as informações do usuário selecionado.'
                    : 'Adicione um novo usuário ao sistema.'
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Nome completo do usuário"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="email@empresa.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="senha">
                      {editingUsuario ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'}
                    </Label>
                    <Input
                      id="senha"
                      type="password"
                      value={formData.senha}
                      onChange={(e) => setFormData({...formData, senha: e.target.value})}
                      placeholder="Senha do usuário"
                      required={!editingUsuario}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmar_senha">
                      {editingUsuario ? 'Confirmar Nova Senha' : 'Confirmar Senha *'}
                    </Label>
                    <Input
                      id="confirmar_senha"
                      type="password"
                      value={formData.confirmar_senha}
                      onChange={(e) => setFormData({...formData, confirmar_senha: e.target.value})}
                      placeholder="Confirme a senha"
                      required={!editingUsuario || formData.senha}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input
                      id="cargo"
                      value={formData.cargo}
                      onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                      placeholder="Cargo do usuário"
                    />
                  </div>
                  <div>
                    <Label htmlFor="numero_cracha">Número do Crachá</Label>
                    <Input
                      id="numero_cracha"
                      value={formData.numero_cracha}
                      onChange={(e) => setFormData({...formData, numero_cracha: e.target.value})}
                      placeholder="Número do crachá"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="departamento">Departamento</Label>
                    <Select value={formData.departamento} onValueChange={(value) => setFormData({...formData, departamento: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operações">Operações</SelectItem>
                        <SelectItem value="Manutenção">Manutenção</SelectItem>
                        <SelectItem value="Qualidade">Qualidade</SelectItem>
                        <SelectItem value="Segurança">Segurança</SelectItem>
                        <SelectItem value="Meio Ambiente">Meio Ambiente</SelectItem>
                        <SelectItem value="Engenharia">Engenharia</SelectItem>
                        <SelectItem value="Administração">Administração</SelectItem>
                        <SelectItem value="TI">TI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="setor">Setor</Label>
                    <Input
                      id="setor"
                      value={formData.setor}
                      onChange={(e) => setFormData({...formData, setor: e.target.value})}
                      placeholder="Setor específico"
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

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="perfil_acesso">Perfil de Acesso</Label>
                    <Select value={formData.perfil_acesso} onValueChange={(value) => setFormData({...formData, perfil_acesso: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Administrador">Administrador</SelectItem>
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                        <SelectItem value="Operador">Operador</SelectItem>
                        <SelectItem value="Consulta">Consulta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status_usuario">Status</Label>
                    <Select value={formData.status_usuario} onValueChange={(value) => setFormData({...formData, status_usuario: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                        <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="data_admissao">Data de Admissão</Label>
                    <Input
                      id="data_admissao"
                      type="date"
                      value={formData.data_admissao}
                      onChange={(e) => setFormData({...formData, data_admissao: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="supervisor_id">Supervisor</Label>
                  <Select value={formData.supervisor_id} onValueChange={(value) => setFormData({...formData, supervisor_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.filter(u => u.perfil_acesso === 'Supervisor' || u.perfil_acesso === 'Administrador').map((usuario) => (
                        <SelectItem key={usuario.id} value={usuario.id.toString()}>
                          {usuario.nome}
                        </SelectItem>
                      ))}
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
                    {loading ? 'Salvando...' : (editingUsuario ? 'Atualizar' : 'Criar')}
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
                placeholder="Buscar usuários..."
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
                <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={perfilFilter} onValueChange={setPerfilFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Perfis</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
                <SelectItem value="Operador">Operador</SelectItem>
                <SelectItem value="Consulta">Consulta</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              {filteredUsuarios.length} usuário(s) encontrado(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsuarios.map((usuario) => {
          const diasSemAcesso = calculateDaysSinceLastAccess(usuario.data_ultimo_acesso)
          
          return (
            <Card key={usuario.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      {usuario.nome}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Mail className="h-4 w-4 mr-1" />
                      {usuario.email}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(usuario.status_usuario)}
                    {getPerfilBadge(usuario.perfil_acesso)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {usuario.cargo && (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Cargo:</span>
                      <span className="ml-1 font-medium">{usuario.cargo}</span>
                    </div>
                  )}

                  {usuario.departamento && (
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Departamento:</span>
                      <Badge variant="outline" className="ml-1">
                        {usuario.departamento}
                      </Badge>
                    </div>
                  )}

                  {usuario.setor && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Setor:</span>
                      <span className="ml-1 font-medium">{usuario.setor}</span>
                    </div>
                  )}

                  {usuario.telefone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Telefone:</span>
                      <span className="ml-1 font-medium">{usuario.telefone}</span>
                    </div>
                  )}

                  {usuario.numero_cracha && (
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Crachá:</span>
                      <Badge variant="outline" className="ml-1">
                        {usuario.numero_cracha}
                      </Badge>
                    </div>
                  )}

                  {usuario.data_admissao && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Admissão:</span>
                      <span className="ml-1 font-medium">
                        {new Date(usuario.data_admissao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}

                  {usuario.data_ultimo_acesso && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Último acesso:</span>
                      <span className="ml-1 font-medium">
                        {new Date(usuario.data_ultimo_acesso).toLocaleDateString('pt-BR')}
                      </span>
                      {diasSemAcesso > 30 && (
                        <Badge variant="outline" className="ml-1 text-orange-600">
                          {diasSemAcesso} dias
                        </Badge>
                      )}
                    </div>
                  )}

                  {usuario.Supervisor && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Supervisor:</span>
                      <span className="ml-1 font-medium">{usuario.Supervisor.nome}</span>
                    </div>
                  )}

                  {usuario.centro_custo && (
                    <div className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Centro de Custo:</span>
                      <span className="ml-1 font-medium">{usuario.centro_custo}</span>
                    </div>
                  )}
                </div>

                {usuario.observacoes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <strong>Observações:</strong> {usuario.observacoes}
                  </div>
                )}

                {/* Ações de Status */}
                {hasPermission('usuarios', 'editar') && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t">
                    {getActionButtons(usuario)}
                  </div>
                )}

                {/* Ações CRUD */}
                {(hasPermission('usuarios', 'editar') || hasPermission('usuarios', 'deletar')) && (
                  <div className="flex justify-end space-x-2 pt-2 border-t">
                    {hasPermission('usuarios', 'editar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(usuario)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    {hasPermission('usuarios', 'deletar') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(usuario)}
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

      {filteredUsuarios.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum usuário encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || perfilFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro usuário'
              }
            </p>
            {hasPermission('usuarios', 'criar') && !searchTerm && statusFilter === 'all' && perfilFilter === 'all' && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Usuário
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Usuarios

