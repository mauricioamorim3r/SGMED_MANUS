// ============================================================================
// UTILITÁRIOS PARA GERAÇÃO DE PDF - SGM
// ============================================================================

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFGenerator {
  constructor() {
    this.doc = new jsPDF();
    this.margin = 20;
    this.lineHeight = 10;
    this.currentY = this.margin;
  }

  // Configurar cabeçalho padrão
  addHeader(title, subtitle = '') {
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += this.lineHeight + 5;

    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }

    // Data e hora
    const now = new Date();
    const dateStr = `Gerado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`;
    this.doc.setFontSize(10);
    this.doc.text(dateStr, this.margin, this.currentY);
    this.currentY += this.lineHeight + 10;

    // Linha separadora
    this.doc.line(this.margin, this.currentY, 190, this.currentY);
    this.currentY += 10;
  }

  // Adicionar seção de texto
  addSection(title, content) {
    this.checkPageBreak();
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += this.lineHeight + 3;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    if (Array.isArray(content)) {
      content.forEach(line => {
        this.checkPageBreak();
        this.doc.text(line, this.margin, this.currentY);
        this.currentY += this.lineHeight;
      });
    } else {
      const lines = this.doc.splitTextToSize(content, 170);
      lines.forEach(line => {
        this.checkPageBreak();
        this.doc.text(line, this.margin, this.currentY);
        this.currentY += this.lineHeight;
      });
    }
    this.currentY += 5;
  }

  // Adicionar tabela
  addTable(headers, rows) {
    this.checkPageBreak(30); // Espaço mínimo para tabela
    
    const cellWidth = 170 / headers.length;
    const cellHeight = 8;
    let startX = this.margin;
    
    // Cabeçalho da tabela
    this.doc.setFillColor(200, 200, 200);
    this.doc.rect(startX, this.currentY, 170, cellHeight, 'F');
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    
    headers.forEach((header, index) => {
      const x = startX + (index * cellWidth) + 2;
      this.doc.text(header, x, this.currentY + 5);
    });
    
    this.currentY += cellHeight;

    // Linhas da tabela
    this.doc.setFont('helvetica', 'normal');
    rows.forEach(row => {
      this.checkPageBreak(cellHeight);
      
      // Fundo alternado
      if (rows.indexOf(row) % 2 === 1) {
        this.doc.setFillColor(240, 240, 240);
        this.doc.rect(startX, this.currentY, 170, cellHeight, 'F');
      }
      
      row.forEach((cell, index) => {
        const x = startX + (index * cellWidth) + 2;
        const cellText = String(cell || '');
        const truncated = cellText.length > 20 ? cellText.substring(0, 17) + '...' : cellText;
        this.doc.text(truncated, x, this.currentY + 5);
      });
      
      this.currentY += cellHeight;
    });
    
    // Borda da tabela
    this.doc.rect(startX, this.currentY - (rows.length + 1) * cellHeight, 170, (rows.length + 1) * cellHeight);
    
    this.currentY += 10;
  }

  // Verificar quebra de página
  checkPageBreak(minSpace = 20) {
    if (this.currentY + minSpace > 280) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  // Adicionar rodapé
  addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      
      // Rodapé esquerdo
      this.doc.text('Sistema de Gerenciamento Metrológico (SGM)', this.margin, 285);
      
      // Rodapé direito
      this.doc.text(`Página ${i} de ${pageCount}`, 170, 285);
    }
  }

  // Salvar PDF
  save(filename) {
    this.addFooter();
    this.doc.save(filename);
  }

  // Obter blob do PDF
  getBlob() {
    this.addFooter();
    return this.doc.output('blob');
  }
}

// Funções específicas para relatórios SGM

export const generateEquipmentReport = async (equipments) => {
  const pdf = new PDFGenerator();
  
  pdf.addHeader('Relatório de Equipamentos', 'Sistema de Gerenciamento Metrológico');
  
  pdf.addSection('Resumo Executivo', [
    `Total de equipamentos: ${equipments.length}`,
    `Equipamentos ativos: ${equipments.filter(e => e.status_atual === 'Ativo').length}`,
    `Equipamentos em manutenção: ${equipments.filter(e => e.status_atual === 'Manutenção').length}`,
    `Data do relatório: ${new Date().toLocaleDateString('pt-BR')}`
  ]);

  if (equipments.length > 0) {
    const headers = ['Tag', 'Nome', 'Fabricante', 'Modelo', 'Status'];
    const rows = equipments.map(eq => [
      eq.tag_equipamento || '',
      eq.nome_equipamento || '',
      eq.fabricante || '',
      eq.modelo || '',
      eq.status_atual || ''
    ]);
    
    pdf.addTable(headers, rows);
  }

  pdf.save(`relatorio_equipamentos_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateChemicalAnalysisReport = async (analysis) => {
  const pdf = new PDFGenerator();
  
  pdf.addHeader('Relatório de Análise Química', `Amostra: ${analysis.identificacao_amostra}`);
  
  pdf.addSection('Dados da Amostra', [
    `Identificação: ${analysis.identificacao_amostra}`,
    `Tipo de análise: ${analysis.tipo_analise}`,
    `Data de coleta: ${new Date(analysis.data_coleta).toLocaleDateString('pt-BR')}`,
    `Laboratório: ${analysis.laboratorio}`,
    `Responsável: ${analysis.responsavel_coleta}`
  ]);

  pdf.addSection('Propriedades Físico-Químicas', [
    `Densidade a 15°C: ${analysis.densidade_15c_gcm3 || 'N/A'} g/cm³`,
    `Grau API: ${analysis.grau_api || 'N/A'}°`,
    `Viscosidade a 40°C: ${analysis.viscosidade_cinematica_40c_cst || 'N/A'} cSt`,
    `Ponto de fulgor: ${analysis.ponto_fulgor_celsius || 'N/A'}°C`,
    `Teor de enxofre: ${analysis.teor_enxofre_percentual || 'N/A'}%`
  ]);

  if (analysis.poder_calorifico_kcal_m3) {
    pdf.addSection('Propriedades do Gás Natural', [
      `Poder calorífico: ${analysis.poder_calorifico_kcal_m3} kcal/m³`,
      `Índice de Wobbe: ${analysis.indice_wobbe || 'N/A'}`,
      `Metano (C1): ${analysis.c1_metano_percentual || 'N/A'}%`,
      `Etano (C2): ${analysis.c2_etano_percentual || 'N/A'}%`
    ]);
  }

  pdf.save(`analise_quimica_${analysis.identificacao_amostra}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateWellTestReport = async (test) => {
  const pdf = new PDFGenerator();
  
  pdf.addHeader('Relatório de Teste de Poço', `Poço: ${test.nome_poco}`);
  
  pdf.addSection('Informações do Teste', [
    `Nome do poço: ${test.nome_poco}`,
    `Tipo de teste: ${test.tipo_teste}`,
    `Data de início: ${new Date(test.data_inicio).toLocaleDateString('pt-BR')}`,
    `Duração: ${test.duracao_real_horas || 'N/A'} horas`,
    `Responsável: ${test.responsavel_teste}`,
    `Status: ${test.status_teste}`
  ]);

  pdf.addSection('Resultados de Produção', [
    `Vazão de óleo: ${test.vazao_oleo_m3d || 'N/A'} m³/d`,
    `Vazão de água: ${test.vazao_agua_m3d || 'N/A'} m³/d`,
    `Vazão de gás: ${test.vazao_gas_m3d || 'N/A'} m³/d`,
    `ROP água: ${test.rop_agua_percentual || 'N/A'}%`,
    `BSW: ${test.bsw_percentual || 'N/A'}%`,
    `Grau API: ${test.grau_api || 'N/A'}°`
  ]);

  pdf.addSection('Dados de Pressão', [
    `Pressão inicial: ${test.pressao_inicial_kgfcm2 || 'N/A'} kgf/cm²`,
    `Pressão final: ${test.pressao_final_kgfcm2 || 'N/A'} kgf/cm²`,
    `Temperatura: ${test.temperatura_celsius || 'N/A'}°C`
  ]);

  if (test.observacoes) {
    pdf.addSection('Observações', test.observacoes);
  }

  pdf.save(`teste_poco_${test.nome_poco}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Capturar elemento HTML como PDF
export const captureElementToPDF = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Elemento não encontrado');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    logging: false,
    useCORS: true
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF();
  
  const imgWidth = 190;
  const pageHeight = pdf.internal.pageSize.height;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 10;

  pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
};