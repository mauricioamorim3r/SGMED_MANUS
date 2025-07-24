// ============================================================================
// UTILITÁRIOS PARA EXPORTAÇÃO DE DADOS - SGM
// ============================================================================

import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export class DataExporter {
  /**
   * Exporta dados para Excel
   */
  static exportToExcel(data, filename, sheetName = 'Dados') {
    try {
      // Criar workbook
      const wb = XLSX.utils.book_new();
      
      // Converter dados para worksheet
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Configurar largura das colunas
      const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;
      
      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      // Salvar arquivo
      const fileName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      return true;
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      throw new Error('Falha na exportação para Excel');
    }
  }

  /**
   * Exporta dados para CSV
   */
  static exportToCSV(data, filename) {
    try {
      const csv = Papa.unparse(data, {
        delimiter: ',',
        header: true,
        encoding: 'utf-8'
      });
      
      // Criar blob e download
      const blob = new Blob(['\uFEFF' + csv], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      throw new Error('Falha na exportação para CSV');
    }
  }

  /**
   * Importa dados de arquivo CSV
   */
  static importFromCSV(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'utf-8',
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error('Erro ao processar arquivo CSV'));
          } else {
            resolve(results.data);
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * Importa dados de arquivo Excel
   */
  static importFromExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);
          resolve(data);
        } catch (error) {
          reject(new Error('Erro ao processar arquivo Excel'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
      
      reader.readAsBinaryString(file);
    });
  }
}

// Funções específicas para módulos SGM

export const exportEquipments = (equipments) => {
  const data = equipments.map(eq => ({
    'Tag': eq.tag_equipamento || '',
    'Nome': eq.nome_equipamento || '',
    'Número Série': eq.numero_serie || '',
    'Fabricante': eq.fabricante || '',
    'Modelo': eq.modelo || '',
    'Tipo': eq.tipo_equipamento || '',
    'Status': eq.status_atual || '',
    'Data Instalação': eq.data_instalacao ? new Date(eq.data_instalacao).toLocaleDateString('pt-BR') : '',
    'Localização': eq.localizacao || '',
    'Responsável': eq.responsavel_tecnico || ''
  }));
  
  return data;
};

export const exportChemicalAnalyses = (analyses) => {
  const data = analyses.map(analysis => ({
    'ID Amostra': analysis.identificacao_amostra || '',
    'Tipo Análise': analysis.tipo_analise || '',
    'Data Coleta': analysis.data_coleta ? new Date(analysis.data_coleta).toLocaleDateString('pt-BR') : '',
    'Laboratório': analysis.laboratorio || '',
    'Responsável': analysis.responsavel_coleta || '',
    'Densidade 15°C': analysis.densidade_15c_gcm3 || '',
    'Grau API': analysis.grau_api || '',
    'Viscosidade 40°C': analysis.viscosidade_cinematica_40c_cst || '',
    'Teor Enxofre (%)': analysis.teor_enxofre_percentual || '',
    'Poder Calorífico': analysis.poder_calorifico_kcal_m3 || '',
    'Índice Wobbe': analysis.indice_wobbe || '',
    'Status': analysis.status_analise || ''
  }));
  
  return data;
};

export const exportWellTests = (tests) => {
  const data = tests.map(test => ({
    'Nome Poço': test.nome_poco || '',
    'Nome Teste': test.nome_teste || '',
    'Tipo Teste': test.tipo_teste || '',
    'Data Início': test.data_inicio ? new Date(test.data_inicio).toLocaleDateString('pt-BR') : '',
    'Duração (h)': test.duracao_real_horas || '',
    'Vazão Óleo (m³/d)': test.vazao_oleo_m3d || '',
    'Vazão Água (m³/d)': test.vazao_agua_m3d || '',
    'Vazão Gás (m³/d)': test.vazao_gas_m3d || '',
    'ROP Água (%)': test.rop_agua_percentual || '',
    'BSW (%)': test.bsw_percentual || '',
    'Pressão Inicial': test.pressao_inicial_kgfcm2 || '',
    'Pressão Final': test.pressao_final_kgfcm2 || '',
    'Status': test.status_teste || '',
    'Responsável': test.responsavel_teste || ''
  }));
  
  return data;
};

export const exportStock = (items) => {
  const data = items.map(item => ({
    'Código': item.codigo_item || '',
    'Descrição': item.descricao || '',
    'Categoria': item.categoria || '',
    'Unidade': item.unidade_medida || '',
    'Fabricante': item.fabricante || '',
    'Modelo': item.modelo || '',
    'Quantidade Atual': item.quantidade_atual || 0,
    'Estoque Mínimo': item.estoque_minimo || 0,
    'Estoque Máximo': item.estoque_maximo || 0,
    'Valor Unitário': item.valor_unitario || 0,
    'Valor Total': item.valor_total_estoque || 0,
    'Localização': item.localizacao_fisica || '',
    'Data Aquisição': item.data_aquisicao ? new Date(item.data_aquisicao).toLocaleDateString('pt-BR') : '',
    'Data Validade': item.data_validade ? new Date(item.data_validade).toLocaleDateString('pt-BR') : '',
    'Status': item.status_item || ''
  }));
  
  return data;
};

export const exportStockMovements = (movements) => {
  const data = movements.map(mov => ({
    'Código Item': mov.codigo_item || '',
    'Descrição': mov.descricao_item || '',
    'Tipo Movimentação': mov.tipo_movimentacao || '',
    'Quantidade': mov.quantidade || 0,
    'Valor Unitário': mov.valor_unitario || 0,
    'Valor Total': mov.valor_total || 0,
    'Data': mov.data_movimentacao ? new Date(mov.data_movimentacao).toLocaleDateString('pt-BR') : '',
    'Origem': mov.origem || '',
    'Destino': mov.destino || '',
    'Responsável': mov.responsavel || '',
    'Documento': mov.documento_referencia || '',
    'Nota Fiscal': mov.numero_nota_fiscal || '',
    'Centro Custo': mov.centro_custo || ''
  }));
  
  return data;
};

export const exportChangeControl = (changes) => {
  const data = changes.map(change => ({
    'Número MOC': change.numero_moc || '',
    'Título': change.titulo || '',
    'Tipo Mudança': change.tipo_mudanca || '',
    'Categoria': change.categoria_mudanca || '',
    'Prioridade': change.prioridade || '',
    'Status': change.status_mudanca || '',
    'Solicitante': change.solicitante || '',
    'Data Solicitação': change.data_solicitacao ? new Date(change.data_solicitacao).toLocaleDateString('pt-BR') : '',
    'Data Aprovação': change.data_aprovacao ? new Date(change.data_aprovacao).toLocaleDateString('pt-BR') : '',
    'Aprovador': change.aprovador_final || '',
    'Impacto Financeiro': change.impacto_financeiro || 0,
    'Área Responsável': change.area_responsavel || ''
  }));
  
  return data;
};

// Templates para importação

export const getTemplateStructure = (moduleName) => {
  const templates = {
    equipamentos: [
      { field: 'tag_equipamento', required: true, example: 'TT-001' },
      { field: 'nome_equipamento', required: true, example: 'Transmissor de Temperatura' },
      { field: 'numero_serie', required: true, example: 'ABC12345' },
      { field: 'fabricante', required: false, example: 'Rosemount' },
      { field: 'modelo', required: false, example: '3144P' },
      { field: 'tipo_equipamento', required: true, example: 'Transmissor_Temperatura' },
      { field: 'status_atual', required: false, example: 'Ativo' },
      { field: 'localizacao', required: false, example: 'Campo A - Área 1' }
    ],
    
    'analises-quimicas': [
      { field: 'identificacao_amostra', required: true, example: 'AM-001' },
      { field: 'tipo_analise', required: true, example: 'Análise Completa' },
      { field: 'data_coleta', required: true, example: '2024-01-15' },
      { field: 'laboratorio', required: false, example: 'Lab Central' },
      { field: 'responsavel_coleta', required: false, example: 'João Silva' },
      { field: 'densidade_15c_gcm3', required: false, example: '0.85' },
      { field: 'grau_api', required: false, example: '35.2' },
      { field: 'teor_enxofre_percentual', required: false, example: '0.3' }
    ],
    
    'testes-pocos': [
      { field: 'nome_poco', required: true, example: 'POC-001' },
      { field: 'nome_teste', required: true, example: 'Teste Produção' },
      { field: 'tipo_teste', required: true, example: 'Teste de Produção' },
      { field: 'data_inicio', required: true, example: '2024-01-15' },
      { field: 'vazao_oleo_m3d', required: false, example: '100' },
      { field: 'vazao_agua_m3d', required: false, example: '20' },
      { field: 'vazao_gas_m3d', required: false, example: '50000' },
      { field: 'responsavel_teste', required: false, example: 'Maria Santos' }
    ],
    
    estoque: [
      { field: 'codigo_item', required: true, example: 'EST-001' },
      { field: 'descricao', required: true, example: 'Válvula Esfera 2"' },
      { field: 'categoria', required: true, example: 'Válvulas' },
      { field: 'unidade_medida', required: false, example: 'UN' },
      { field: 'quantidade_atual', required: false, example: '10' },
      { field: 'estoque_minimo', required: false, example: '5' },
      { field: 'valor_unitario', required: false, example: '150.00' }
    ]
  };
  
  return templates[moduleName] || [];
};

export const generateTemplateCSV = (moduleName) => {
  const structure = getTemplateStructure(moduleName);
  const headers = structure.map(item => item.field);
  const example = structure.map(item => item.example);
  
  const csv = Papa.unparse([headers, example]);
  return csv;
};

export const downloadTemplate = (moduleName) => {
  const csv = generateTemplateCSV(moduleName);
  const blob = new Blob(['\uFEFF' + csv], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `template_${moduleName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};