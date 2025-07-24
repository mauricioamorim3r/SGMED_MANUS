import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Database
} from 'lucide-react'
import { DataExporter, getTemplateStructure, downloadTemplate } from '@/lib/exportUtils'
import { useAuth } from '@/contexts/AuthContext'

const TemplateImport = ({ moduleName, onImportComplete }) => {
  const { token } = useAuth()
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  // Get template structure from exportUtils
  const templateStructure = getTemplateStructure(moduleName)
  const currentTemplate = {
    name: moduleName.charAt(0).toUpperCase() + moduleName.slice(1).replace('-', ' '),
    fields: templateStructure.map(field => field.field),
    required: templateStructure.filter(field => field.required).map(field => field.field)
  }

  const handleDownloadTemplate = () => {
    downloadTemplate(moduleName)
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setSelectedFile(file)
      setImportStatus(null)
    } else {
      setImportStatus({
        type: 'error',
        message: 'Por favor, selecione um arquivo CSV válido.'
      })
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      setImportStatus({
        type: 'error',
        message: 'Por favor, selecione um arquivo para importar.'
      })
      return
    }

    setIsImporting(true)
    
    try {
      // Use DataExporter to parse CSV
      const data = await DataExporter.importFromCSV(selectedFile)
      
      // Validate required fields
      const missingFields = currentTemplate.required.filter(field => 
        !data.every(row => row[field] && row[field].trim())
      )
      
      if (missingFields.length > 0) {
        setImportStatus({
          type: 'error',
          message: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`
        })
        setIsImporting(false)
        return
      }

      // Make API call to import data
      const response = await fetch(`http://localhost:3001/api/${moduleName}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data })
      })

      if (response.ok) {
        const result = await response.json()
        setImportStatus({
          type: 'success',
          message: `${data.length} registros importados com sucesso!`
        })
        if (onImportComplete) {
          onImportComplete(data)
        }
      } else {
        const error = await response.json()
        setImportStatus({
          type: 'error',
          message: error.message || 'Erro ao importar dados'
        })
      }
    } catch (error) {
      console.error('Import error:', error)
      setImportStatus({
        type: 'error',
        message: 'Erro ao processar o arquivo. Verifique o formato.'
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Importar Dados
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Importar {currentTemplate.name}
          </DialogTitle>
          <DialogDescription>
            Importe dados em lote usando um arquivo CSV. Baixe o template primeiro para garantir o formato correto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                1. Baixar Template
              </CardTitle>
              <CardDescription>
                Baixe o template CSV com o formato correto para {currentTemplate.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-semibold mb-1">Campos obrigatórios:</p>
                  <p className="text-sm text-gray-600">
                    {currentTemplate.required.join(', ')}
                  </p>
                  <p className="text-sm font-semibold mb-1 mt-2">Todos os campos:</p>
                  <p className="text-sm text-gray-600">
                    {currentTemplate.fields.join(', ')}
                  </p>
                </div>
                <Button onClick={handleDownloadTemplate} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Baixar Template CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-4 w-4" />
                2. Selecionar Arquivo
              </CardTitle>
              <CardDescription>
                Selecione o arquivo CSV preenchido com seus dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileText className="h-4 w-4" />
                    {selectedFile.name} selecionado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Import Action */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Importar Dados</CardTitle>
              <CardDescription>
                Execute a importação dos dados para o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={handleImport} 
                  disabled={!selectedFile || isImporting}
                  className="w-full"
                >
                  {isImporting ? 'Importando...' : 'Importar Dados'}
                </Button>

                {importStatus && (
                  <Alert variant={importStatus.type === 'error' ? 'destructive' : 'default'}>
                    {importStatus.type === 'error' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {importStatus.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Verifique os dados antes de importar. 
              Esta ação criará novos registros no sistema.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TemplateImport