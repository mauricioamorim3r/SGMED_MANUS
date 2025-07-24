import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react'
import { DataExporter } from '@/lib/exportUtils'

const ExportButton = ({ 
  data, 
  filename, 
  exportFunction,
  className = "",
  size = "sm",
  variant = "outline"
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleExport = async (format) => {
    if (!data || data.length === 0) {
      alert('Não há dados para exportar')
      return
    }

    setIsExporting(true)
    setShowDropdown(false)
    
    try {
      let exportData = data
      
      // Apply export function if provided (for data transformation)
      if (exportFunction) {
        exportData = exportFunction(data)
      }

      const timestamp = new Date().toISOString().split('T')[0]
      const finalFilename = `${filename}_${timestamp}`

      if (format === 'excel') {
        DataExporter.exportToExcel(exportData, finalFilename)
      } else if (format === 'csv') {
        DataExporter.exportToCSV(exportData, finalFilename)
      }
    } catch (error) {
      console.error('Erro ao exportar:', error)
      alert('Erro ao exportar dados')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative inline-block">
      <Button 
        variant={variant} 
        size={size} 
        className={`${className} flex items-center`}
        disabled={isExporting}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? 'Exportando...' : 'Exportar'}
        <ChevronDown className="h-4 w-4 ml-1" />
      </Button>
      
      {showDropdown && (
        <div className="absolute z-50 mt-1 min-w-[160px] bg-white border border-gray-200 rounded-md shadow-lg">
          <div 
            className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            onClick={() => handleExport('excel')}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel (.xlsx)
          </div>
          <div 
            className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            onClick={() => handleExport('csv')}
          >
            <FileText className="h-4 w-4 mr-2" />
            CSV (.csv)
          </div>
        </div>
      )}
    </div>
  )
}

export default ExportButton