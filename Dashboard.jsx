import React from 'react'
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Settings,
  Database,
  Wifi,
  WifiOff,
  Server,
  Globe
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  Bar, 
  LineChart as RechartsLineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts'
import { cn, animations, effects, formatNumber, formatDateTime } from '@/lib/utils'

// Dados simulados para demonstração
const kpiData = [
  {
    title: 'Total de Equipamentos',
    value: 1247,
    change: '+12%',
    trend: 'up',
    icon: Activity,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Instalados',
    value: 1156,
    change: '+8%',
    trend: 'up',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Em Calibração',
    value: 23,
    change: '-5%',
    trend: 'down',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    title: 'Vencidos',
    value: 8,
    change: '-15%',
    trend: 'down',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
]

const chartData = [
  { month: 'Jan', medições: 1200, calibrações: 45 },
  { month: 'Fev', medições: 1350, calibrações: 52 },
  { month: 'Mar', medições: 1180, calibrações: 38 },
  { month: 'Abr', medições: 1420, calibrações: 61 },
  { month: 'Mai', medições: 1380, calibrações: 48 },
  { month: 'Jun', medições: 1500, calibrações: 55 },
]

const statusData = [
  { name: 'Operacional', value: 85, color: '#10b981' },
  { name: 'Manutenção', value: 10, color: '#f59e0b' },
  { name: 'Inativo', value: 5, color: '#ef4444' },
]

const performanceData = [
  { time: '00:00', precisão: 98.5, disponibilidade: 99.2 },
  { time: '04:00', precisão: 98.8, disponibilidade: 99.1 },
  { time: '08:00', precisão: 98.3, disponibilidade: 98.9 },
  { time: '12:00', precisão: 98.7, disponibilidade: 99.3 },
  { time: '16:00', precisão: 98.9, disponibilidade: 99.0 },
  { time: '20:00', precisão: 98.6, disponibilidade: 99.2 },
]

const alertsData = [
  {
    id: 1,
    type: 'warning',
    title: 'Calibração Pendente',
    description: 'PM-001 - Entrada Principal',
    time: '2 horas atrás',
    priority: 'medium'
  },
  {
    id: 2,
    type: 'error',
    title: 'Falha de Comunicação',
    description: 'Instalação UPGN-02',
    time: '4 horas atrás',
    priority: 'high'
  },
  {
    id: 3,
    type: 'info',
    title: 'Manutenção Programada',
    description: 'Polo Sergipe - Amanhã 08:00',
    time: '1 dia',
    priority: 'low'
  },
]

export function Dashboard() {
  const [backendStatus, setBackendStatus] = React.useState('online')
  const [systemInfo, setSystemInfo] = React.useState({
    version: '1.0.0',
    environment: 'production',
    uptime: '99.9%',
    lastUpdate: new Date().toISOString(),
  })

  React.useEffect(() => {
    // Simular verificação do backend
    const checkBackend = async () => {
      try {
        const response = await fetch('https://nghki1cl06l9.manus.space/api/health')
        setBackendStatus(response.ok ? 'online' : 'offline')
      } catch {
        setBackendStatus('offline')
      }
    }

    checkBackend()
    const interval = setInterval(checkBackend, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header do Dashboard */}
      <div className={cn("space-y-2", animations.slideUp)}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Sistema de Gerenciamento Metrológico - Deploy Permanente
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={backendStatus === 'online' ? 'default' : 'destructive'}
              className={cn("gap-1", animations.scaleIn)}
            >
              {backendStatus === 'online' ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {backendStatus === 'online' ? 'Online' : 'Offline'}
            </Badge>
            <Badge variant="outline" className={animations.scaleIn}>
              Permanente
            </Badge>
          </div>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card 
              key={kpi.title} 
              className={cn(
                effects.shadow.corporate,
                effects.glass,
                animations.hoverLift,
                animations.slideUp
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center",
                  kpi.bgColor
                )}>
                  <Icon className={cn("h-4 w-4", kpi.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(kpi.value)}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className={cn(
                    "h-3 w-3",
                    kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  )} />
                  <span className={cn(
                    kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {kpi.change}
                  </span>
                  <span>vs mês anterior</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Gráficos e Métricas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de Barras - Medições e Calibrações */}
        <Card className={cn(
          effects.shadow.corporate,
          effects.glass,
          animations.slideUp
        )}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Medições e Calibrações
            </CardTitle>
            <CardDescription>
              Evolução mensal dos processos metrológicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="medições" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  name="Medições"
                />
                <Bar 
                  dataKey="calibrações" 
                  fill="hsl(var(--chart-2))" 
                  radius={[4, 4, 0, 0]}
                  name="Calibrações"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Status dos Equipamentos */}
        <Card className={cn(
          effects.shadow.corporate,
          effects.glass,
          animations.slideUp
        )}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Status dos Equipamentos
            </CardTitle>
            <CardDescription>
              Distribuição atual do status operacional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  dataKey="value"
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance em Tempo Real e Alertas */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance 24h */}
        <Card className={cn(
          "lg:col-span-2",
          effects.shadow.corporate,
          effects.glass,
          animations.slideUp
        )}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              Performance 24h
            </CardTitle>
            <CardDescription>
              Precisão e disponibilidade do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsLineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" />
                <YAxis domain={[95, 100]} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="precisão" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Precisão (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="disponibilidade" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Disponibilidade (%)"
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alertas Importantes */}
        <Card className={cn(
          effects.shadow.corporate,
          effects.glass,
          animations.slideUp
        )}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Alertas Importantes
            </CardTitle>
            <CardDescription>
              Notificações que requerem atenção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alertsData.map((alert, index) => (
              <div 
                key={alert.id} 
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border",
                  alert.type === 'error' && 'bg-red-50 border-red-200',
                  alert.type === 'warning' && 'bg-yellow-50 border-yellow-200',
                  alert.type === 'info' && 'bg-blue-50 border-blue-200',
                  animations.slideUp
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={cn(
                  "h-2 w-2 rounded-full mt-2",
                  alert.priority === 'high' && 'bg-red-500',
                  alert.priority === 'medium' && 'bg-yellow-500',
                  alert.priority === 'low' && 'bg-blue-500'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {alert.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {alert.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {alert.time}
                  </p>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              className={cn("w-full", animations.hoverLift)}
            >
              Ver Todos os Alertas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status do Sistema */}
      <Card className={cn(
        effects.shadow.corporate,
        effects.glass,
        animations.slideUp
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Status do Sistema - Deploy Permanente
          </CardTitle>
          <CardDescription>
            Monitoramento em tempo real dos componentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Frontend React */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Frontend React</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
              <Progress value={100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                defpxswg.manus.space
              </p>
            </div>

            {/* Backend Flask */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Backend Flask</span>
                <Badge 
                  variant={backendStatus === 'online' ? 'default' : 'destructive'}
                  className={backendStatus === 'online' ? 'bg-green-100 text-green-800' : ''}
                >
                  {backendStatus === 'online' ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <Progress value={backendStatus === 'online' ? 100 : 0} className="h-2" />
              <p className="text-xs text-muted-foreground">
                nghki1cl06l9.manus.space
              </p>
            </div>

            {/* URLs Permanentes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">URLs Permanentes</span>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  Ativas
                </Badge>
              </div>
              <Progress value={100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Links nunca expiram
              </p>
            </div>

            {/* Dados de Demo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dados de Demo</span>
                <Badge variant="outline">2 Polos</Badge>
              </div>
              <Progress value={100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Sergipe e Bahia
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Informações do Backend */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Database className="h-4 w-4" />
              Informações do Backend:
            </h4>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <span className="text-muted-foreground">Versão:</span>
                <p className="font-medium">{systemInfo.version}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Framework:</span>
                <p className="font-medium">Flask</p>
              </div>
              <div>
                <span className="text-muted-foreground">Ambiente:</span>
                <p className="font-medium capitalize">{systemInfo.environment}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Módulos:</span>
                <p className="font-medium">15</p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>URL: https://nghki1cl06l9.manus.space</p>
              <p>Módulos Implementados - Deploy Permanente</p>
              <p>15 módulos completos do SGM com URLs permanentes</p>
              <div className="mt-2 space-y-1">
                <p>✓ Polos</p>
                <p>✓ Instalações</p>
                <p>✓ Pontos de Medição</p>
                <p>✓ Placas de Orifício</p>
                <p>✓ Incertezas de Medição</p>
                <p>✓ Trechos Retos</p>
                <p>✓ Testes de Poços</p>
                <p>✓ Análises Químicas</p>
                <p>✓ Estoque</p>
                <p>✓ Movimentação de Estoque</p>
                <p>✓ Controle de Mudanças</p>
                <p>✓ Usuários</p>
                <p>✓ Configurações</p>
                <p>✓ Relatórios</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

