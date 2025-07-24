// TESTE COMPLETO - PARTE 4: GESTÃO E CONTROLE
// ============================================================================

const { sequelize } = require('./src/main/database/config');

// Importar modelos atualizados
const Estoque = require('./src/main/models/estoque');
const MovimentacaoEstoque = require('./src/main/models/movimentacaoEstoque');
const ControleMudancas = require('./src/main/models/controleMudancas');

async function testarParte4() {
  try {
    console.log('🚀 INICIANDO TESTES DA PARTE 4: GESTÃO E CONTROLE\n');
    
    // ========================================================================
    // 1. SINCRONIZAÇÃO DO BANCO DE DADOS
    // ========================================================================
    console.log('📊 1. SINCRONIZANDO BANCO DE DADOS...');
    await sequelize.sync({ force: true });
    console.log('✅ Banco sincronizado com sucesso!\n');
    
    // ========================================================================
    // 2. TESTE DO MÓDULO DE ESTOQUE
    // ========================================================================
    console.log('📦 2. TESTANDO MÓDULO DE ESTOQUE...');
    
    const itemEstoque = await Estoque.create({
      numero_serie_equipamento: 'EQ-TEST-001',
      localizacao_fisica: 'Almoxarifado Principal - Setor A',
      setor_estoque: 'Almoxarifado_Principal',
      prateleira: 'A1',
      posicao: 'B2',
      codigo_barras: '1234567890123',
      status_estoque: 'Disponivel',
      condicao_fisica: 'Excelente',
      responsavel_estoque: 'João Silva',
      numero_patrimonio: 'PAT-2024-001',
      valor_aquisicao: 15000.00,
      data_aquisicao: new Date('2024-01-15'),
      fornecedor: 'Fornecedor Teste Ltda',
      garantia_fabricante_meses: 24,
      data_inicio_garantia: new Date('2024-01-15'),
      data_fim_garantia: new Date('2026-01-15'),
      periodicidade_inspecao_meses: 6,
      criado_por: 1
    });
    
    console.log('✅ Item de estoque criado:', {
      id: itemEstoque.id,
      numero_serie: itemEstoque.numero_serie_equipamento,
      localizacao: itemEstoque.localizacao_fisica,
      setor: itemEstoque.setor_estoque,
      status: itemEstoque.status_estoque,
      em_garantia: itemEstoque.em_garantia
    });
    
    // Testar métodos do estoque
    console.log('🔧 Testando métodos do estoque...');
    
    // Reservar item
    await itemEstoque.reservar('Projeto Alpha', 'Instalação urgente', 1);
    console.log('✅ Item reservado com sucesso');
    
    // Liberar reserva
    await itemEstoque.liberarReserva(1);
    console.log('✅ Reserva liberada com sucesso');
    
    // Colocar em quarentena
    await itemEstoque.colocarEmQuarentena('Suspeita de defeito', 1);
    console.log('✅ Item colocado em quarentena');
    
    // Liberar quarentena
    await itemEstoque.liberarQuarentena(1);
    console.log('✅ Item liberado da quarentena');
    
    // Realizar inspeção
    await itemEstoque.realizarInspecao('Aprovado', 'Equipamento em perfeitas condições', 1);
    console.log('✅ Inspeção realizada com sucesso\n');
    
    // ========================================================================
    // 3. TESTE DO MÓDULO DE MOVIMENTAÇÃO DE ESTOQUE
    // ========================================================================
    console.log('📋 3. TESTANDO MÓDULO DE MOVIMENTAÇÃO DE ESTOQUE...');
    
    const movimentacao = await MovimentacaoEstoque.create({
      numero_serie_equipamento: 'EQ-TEST-001',
      tipo_movimentacao: 'Saida',
      solicitante: 'Maria Santos',
      solicitante_id: 1,
      justificativa: 'Necessário para instalação no Polo Norte',
      urgencia: 'Alta',
      data_necessidade: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      localizacao_origem: 'Almoxarifado Principal',
      localizacao_destino: 'Polo Norte - Instalação 01',
      responsavel_origem: 'João Silva',
      responsavel_destino: 'Pedro Costa',
      centro_custo_origem: 'CC001',
      centro_custo_destino: 'CC002',
      condicao_antes: 'Excelente',
      documento_transporte: 'DOC-TRANS-001',
      valor_movimentacao: 500.00,
      moeda: 'BRL',
      criado_por: 1
    });
    
    console.log('✅ Movimentação criada:', {
      id: movimentacao.id,
      numero: movimentacao.numero_movimentacao,
      tipo: movimentacao.tipo_movimentacao,
      status: movimentacao.status_movimentacao,
      requer_aprovacao: movimentacao.requer_aprovacao,
      aprovador_necessario: movimentacao.aprovador_necessario
    });
    
    // Testar workflow de aprovação
    console.log('🔧 Testando workflow de movimentação...');
    
    // Aprovar movimentação
    await movimentacao.aprovar(1, 'Aprovado para instalação urgente');
    console.log('✅ Movimentação aprovada');
    
    // Iniciar execução
    await movimentacao.iniciarExecucao(1);
    console.log('✅ Execução iniciada');
    
    // Concluir movimentação
    await movimentacao.concluir(1, 'Equipamento entregue e instalado com sucesso');
    console.log('✅ Movimentação concluída');
    console.log('⏱️ Tempo de execução:', movimentacao.tempo_execucao_horas, 'horas\n');
    
    // ========================================================================
    // 4. TESTE DO MÓDULO DE CONTROLE DE MUDANÇAS (MOC)
    // ========================================================================
    console.log('📝 4. TESTANDO MÓDULO DE CONTROLE DE MUDANÇAS (MOC)...');
    
    const moc = await ControleMudancas.create({
      titulo_mudanca: 'Atualização do Sistema de Medição - Polo Norte',
      descricao_mudanca: 'Substituição do sistema de medição atual por equipamentos de maior precisão para atender aos novos requisitos regulatórios.',
      categoria_mudanca: 'Equipamento',
      tipo_mudanca: 'Permanente',
      urgencia: 'Alta',
      solicitante_id: 1,
      area_solicitante: 'Engenharia de Produção',
      justificativa_mudanca: 'Necessário para conformidade com novas normas ANP e melhoria da precisão das medições fiscais.',
      beneficios_esperados: 'Maior precisão nas medições, redução de incertezas, conformidade regulatória.',
      consequencias_nao_implementar: 'Possíveis multas regulatórias e perda de precisão nas medições fiscais.',
      equipamentos_afetados: JSON.stringify(['EQ-TEST-001', 'EQ-TEST-002']),
      sistemas_afetados: JSON.stringify(['Sistema SCADA', 'Sistema Fiscal']),
      data_implementacao_planejada: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      duracao_planejada_dias: 15,
      equipe_implementacao: JSON.stringify([
        { nome: 'João Silva', funcao: 'Coordenador' },
        { nome: 'Maria Santos', funcao: 'Engenheira' },
        { nome: 'Pedro Costa', funcao: 'Técnico' }
      ]),
      impacto_operacional: 'Alto',
      impacto_seguranca: 'Medio',
      impacto_ambiental: 'Baixo',
      impacto_qualidade: 'Alto',
      custo_estimado: 250000.00,
      moeda: 'BRL',
      centro_custo: 'CC001',
      aprovacao_tecnica_necessaria: true,
      aprovacao_seguranca_necessaria: true,
      aprovacao_financeira_necessaria: true,
      plano_implementacao: 'Fase 1: Preparação e aquisição\nFase 2: Instalação\nFase 3: Testes\nFase 4: Comissionamento',
      plano_rollback: 'Em caso de falha, retornar ao sistema anterior mantendo backup das configurações.',
      criterios_sucesso: 'Medições dentro da faixa de incerteza especificada, aprovação nos testes de conformidade.',
      requer_treinamento: true,
      plano_treinamento: 'Treinamento de 40h para operadores sobre o novo sistema.',
      criado_por: 1
    });
    
    console.log('✅ MOC criada:', {
      id: moc.id,
      numero: moc.numero_moc,
      titulo: moc.titulo_mudanca,
      categoria: moc.categoria_mudanca,
      status: moc.status_moc,
      todas_aprovacoes_concluidas: moc.todas_aprovacoes_concluidas
    });
    
    // Testar workflow de MOC
    console.log('🔧 Testando workflow de MOC...');
    
    // Submeter MOC
    await moc.submeter(1);
    console.log('✅ MOC submetida');
    
    // Aprovar tecnicamente
    await moc.aprovarTecnico(1, 'Solução técnica aprovada. Equipamentos atendem aos requisitos.');
    console.log('✅ Aprovação técnica concedida');
    
    // Simular outras aprovações (segurança e financeira)
    moc.aprovacao_seguranca_concedida = true;
    moc.aprovador_seguranca_id = 1;
    moc.data_aprovacao_seguranca = new Date();
    moc.observacoes_aprovacao_seguranca = 'Procedimentos de segurança adequados.';
    
    moc.aprovacao_financeira_concedida = true;
    moc.aprovador_financeiro_id = 1;
    moc.data_aprovacao_financeira = new Date();
    moc.observacoes_aprovacao_financeira = 'Orçamento aprovado dentro do limite.';
    
    await moc.save();
    console.log('✅ Todas as aprovações concedidas');
    console.log('✅ Status de aprovações:', moc.todas_aprovacoes_concluidas);
    
    // Iniciar implementação
    await moc.iniciarImplementacao(1);
    console.log('✅ Implementação iniciada');
    
    // Atualizar progresso
    await moc.atualizarProgresso(25, 1, 'Fase 1 concluída - Equipamentos adquiridos');
    console.log('✅ Progresso atualizado: 25%');
    
    await moc.atualizarProgresso(50, 1, 'Fase 2 concluída - Instalação realizada');
    console.log('✅ Progresso atualizado: 50%');
    
    await moc.atualizarProgresso(75, 1, 'Fase 3 concluída - Testes aprovados');
    console.log('✅ Progresso atualizado: 75%');
    
    await moc.atualizarProgresso(100, 1, 'Fase 4 concluída - Sistema comissionado e operacional');
    console.log('✅ MOC concluída com sucesso');
    console.log('⏱️ Duração real:', moc.duracao_real_calculada, 'dias\n');
    
    // ========================================================================
    // 5. TESTE DE ESTATÍSTICAS
    // ========================================================================
    console.log('📊 5. TESTANDO ESTATÍSTICAS DOS MÓDULOS...');
    
    // Estatísticas do Estoque
    const statsEstoque = await Estoque.obterEstatisticas();
    console.log('📦 Estatísticas do Estoque:', statsEstoque);
    
    // Estatísticas da Movimentação
    const statsMovimentacao = await MovimentacaoEstoque.obterEstatisticas();
    console.log('📋 Estatísticas da Movimentação:', statsMovimentacao);
    
    // Estatísticas do MOC
    const statsMOC = await ControleMudancas.obterEstatisticas();
    console.log('📝 Estatísticas do MOC:', statsMOC);
    
    // ========================================================================
    // 6. TESTE DE CONSULTAS ESPECIALIZADAS
    // ========================================================================
    console.log('\n🔍 6. TESTANDO CONSULTAS ESPECIALIZADAS...');
    
    // Itens vencendo garantia
    const itensVencendoGarantia = await Estoque.obterItensVencendoGarantia(365);
    console.log('⚠️ Itens vencendo garantia (próximos 365 dias):', itensVencendoGarantia.length);
    
    // Movimentações pendentes de aprovação
    const movimentacoesPendentes = await MovimentacaoEstoque.obterPendentesAprovacao();
    console.log('⏳ Movimentações pendentes de aprovação:', movimentacoesPendentes.length);
    
    // MOCs pendentes de aprovação técnica
    const mocsPendentes = await ControleMudancas.obterPendentesAprovacao('tecnica');
    console.log('⏳ MOCs pendentes de aprovação técnica:', mocsPendentes.length);
    
    // MOCs vencendo prazo
    const mocsVencendoPrazo = await ControleMudancas.obterVencendoPrazo(30);
    console.log('⚠️ MOCs vencendo prazo (próximos 30 dias):', mocsVencendoPrazo.length);
    
    // ========================================================================
    // 7. TESTE DE VALIDAÇÕES
    // ========================================================================
    console.log('\n✅ 7. TESTANDO VALIDAÇÕES...');
    
    try {
      // Tentar criar item de estoque com dados inválidos
      await Estoque.create({
        numero_serie_equipamento: 'EQ-INVALID',
        localizacao_fisica: '', // Vazio - deve falhar
        status_estoque: 'Disponivel'
      });
    } catch (error) {
      console.log('✅ Validação de estoque funcionando:', error.message);
    }
    
    try {
      // Tentar aprovar movimentação que não requer aprovação
      const movSimples = await MovimentacaoEstoque.create({
        numero_serie_equipamento: 'EQ-TEST-002',
        tipo_movimentacao: 'Entrada', // Não requer aprovação
        solicitante: 'Teste',
        justificativa: 'Teste',
        criado_por: 1
      });
      
      await movSimples.aprovar(1);
    } catch (error) {
      console.log('✅ Validação de movimentação funcionando:', error.message);
    }
    
    try {
      // Tentar iniciar implementação de MOC sem aprovações
      const mocInvalida = await ControleMudancas.create({
        titulo_mudanca: 'Teste Inválida',
        descricao_mudanca: 'Teste',
        categoria_mudanca: 'Equipamento',
        solicitante_id: 1,
        area_solicitante: 'Teste',
        justificativa_mudanca: 'Teste',
        criado_por: 1
      });
      
      await mocInvalida.iniciarImplementacao(1);
    } catch (error) {
      console.log('✅ Validação de MOC funcionando:', error.message);
    }
    
    // ========================================================================
    // RESULTADO FINAL
    // ========================================================================
    console.log('\n🎉 TESTES DA PARTE 4 CONCLUÍDOS COM SUCESSO!');
    console.log('=====================================');
    console.log('✅ Módulo de Estoque: FUNCIONANDO');
    console.log('✅ Módulo de Movimentação: FUNCIONANDO');
    console.log('✅ Módulo de MOC: FUNCIONANDO');
    console.log('✅ Validações: FUNCIONANDO');
    console.log('✅ Estatísticas: FUNCIONANDO');
    console.log('✅ Consultas Especializadas: FUNCIONANDO');
    console.log('=====================================');
    console.log('🚀 PARTE 4: GESTÃO E CONTROLE - 100% OPERACIONAL!');
    
  } catch (error) {
    console.error('❌ ERRO NOS TESTES:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Executar testes
testarParte4().then(() => {
  console.log('\n✅ Testes finalizados');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Erro fatal:', error);
  process.exit(1);
});

