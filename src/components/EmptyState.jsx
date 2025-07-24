import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Database, 
  Plus, 
  Upload,
  FileText,
  AlertCircle,
  Search
} from 'lucide-react'

const EmptyState = ({ 
  icon: Icon = Database,
  title = "Nenhum dado encontrado",
  description = "Não há registros cadastrados ainda.",
  actionLabel = "Adicionar Primeiro Item",
  onAction,
  showImportButton = true,
  onImport,
  searchTerm = ""
}) => {
  // Se há termo de busca, mostra estado de busca vazia
  if (searchTerm) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-16 px-8">
          <div className="rounded-full bg-gray-100 p-6 mb-6">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum resultado encontrado
          </h3>
          <p className="text-gray-500 text-center mb-6 max-w-md">
            Não encontramos resultados para "{searchTerm}". 
            Tente ajustar os filtros ou termos de busca.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Estado vazio normal
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-16 px-8">
        <div className="rounded-full bg-blue-100 p-6 mb-6">
          <Icon className="h-12 w-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-500 text-center mb-6 max-w-md">
          {description}
        </p>
        <div className="flex gap-3">
          {onAction && (
            <Button onClick={onAction} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {actionLabel}
            </Button>
          )}
          {showImportButton && onImport && (
            <Button variant="outline" onClick={onImport} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importar Dados
            </Button>
          )}
        </div>
        
        {/* Dicas úteis */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Primeiros passos:</p>
              <ul className="text-blue-700 space-y-1">
                <li>• Clique em "Adicionar" para inserir dados manualmente</li>
                <li>• Use "Importar" para carregar dados em lote via CSV</li>
                <li>• Baixe o template para formato correto</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Variações específicas para diferentes módulos
export const EmptyEquipamentos = (props) => (
  <EmptyState
    icon={Database}
    title="Nenhum equipamento cadastrado"
    description="Comece adicionando equipamentos de medição para começar a usar o sistema."
    actionLabel="Cadastrar Equipamento"
    {...props}
  />
)

export const EmptyPolos = (props) => (
  <EmptyState
    icon={Database}
    title="Nenhum polo cadastrado"
    description="Cadastre polos operacionais para organizar suas instalações e equipamentos."
    actionLabel="Cadastrar Polo"
    {...props}
  />
)

export const EmptyUsuarios = (props) => (
  <EmptyState
    icon={Database}
    title="Nenhum usuário cadastrado"
    description="Adicione usuários para que possam acessar e operar o sistema."
    actionLabel="Cadastrar Usuário"
    {...props}
  />
)

export const EmptyAnalises = (props) => (
  <EmptyState
    icon={FileText}
    title="Nenhuma análise química cadastrada"
    description="Registre análises químicas para acompanhar a qualidade dos fluidos."
    actionLabel="Nova Análise"
    {...props}
  />
)

export const EmptyTestes = (props) => (
  <EmptyState
    icon={Database}
    title="Nenhum teste de poço cadastrado"
    description="Registre testes de poços para acompanhar a performance produtiva."
    actionLabel="Novo Teste"
    {...props}
  />
)

export default EmptyState