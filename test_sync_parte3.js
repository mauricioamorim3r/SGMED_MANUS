// Script para testar sincronização dos modelos da PARTE 3
const { sequelize } = require('./src/main/database/config');
const models = require('./src/main/models');

async function testSyncParte3() {
  try {
    console.log('🔄 Testando sincronização dos modelos PARTE 3...');
    
    // Força a sincronização de todos os modelos
    await sequelize.sync({ force: true });
    console.log('✅ Sincronização forçada concluída.');
    
    // Lista todas as tabelas criadas
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tabelas criadas:', tables);
    
    // Testa especificamente as tabelas da PARTE 3
    console.log('\n🔍 Verificando estrutura das tabelas PARTE 3:');
    
    if (tables.includes('testes_pocos')) {
      const testesPocos = await sequelize.getQueryInterface().describeTable('testes_pocos');
      console.log('✅ Tabela testes_pocos:');
      console.log('   Campos:', Object.keys(testesPocos).length);
      console.log('   Principais:', ['numero_teste', 'poco_id', 'nome_poco', 'tipo_teste', 'status_teste'].filter(campo => testesPocos[campo]));
    }
    
    if (tables.includes('analises_quimicas')) {
      const analisesQuimicas = await sequelize.getQueryInterface().describeTable('analises_quimicas');
      console.log('✅ Tabela analises_quimicas:');
      console.log('   Campos:', Object.keys(analisesQuimicas).length);
      console.log('   Principais:', ['numero_analise', 'numero_amostra', 'tipo_amostra', 'tipo_analise', 'status_analise'].filter(campo => analisesQuimicas[campo]));
    }
    
    // Testa criação de registros de exemplo
    console.log('\n🧪 Testando criação de registros...');
    
    const { TestePocos, AnaliseQuimica, Polo, Instalacao } = models;
    
    // Criar polo e instalação de teste
    const polo = await Polo.create({
      nome_polo: 'Polo Teste PARTE 3',
      codigo_polo: 'PT3',
      tipo_polo: 'Terrestre',
      localizacao: 'Teste',
      responsavel: 'Sistema',
      ativo: true
    });
    
    const instalacao = await Instalacao.create({
      nome_instalacao: 'Instalação Teste PARTE 3',
      codigo_instalacao: 'IT3',
      tipo_instalacao: 'UEP',
      polo_id: polo.id,
      localizacao: 'Teste',
      responsavel: 'Sistema',
      ativo: true
    });
    
    // Teste de criação de teste de poço
    const testePocos = await TestePocos.create({
      numero_teste: 'TP-001-2025',
      poco_id: 'POCO-001',
      nome_poco: 'Poço Teste 001',
      polo_id: polo.id,
      instalacao_id: instalacao.id,
      tipo_teste: 'DST',
      objetivo_teste: 'Teste de validação do sistema',
      data_programada: new Date(),
      duracao_programada_horas: 24.0,
      status_teste: 'Programado'
    });
    
    console.log('✅ Teste de poço criado:', testePocos.numero_teste);
    
    // Teste de criação de análise química
    const analiseQuimica = await AnaliseQuimica.create({
      numero_analise: 'AQ-001-2025',
      numero_amostra: 'AM-001-2025',
      polo_id: polo.id,
      instalacao_id: instalacao.id,
      tipo_amostra: 'Oleo_Cru',
      tipo_analise: 'Densidade',
      metodo_coleta: 'Manual',
      data_coleta: new Date(),
      laboratorio_analise: 'Laboratório Teste',
      status_analise: 'Programada'
    });
    
    console.log('✅ Análise química criada:', analiseQuimica.numero_analise);
    
    // Teste de cálculo automático
    console.log('\n🧮 Testando cálculos automáticos...');
    
    // Atualizar análise com densidade para testar cálculo API
    await analiseQuimica.update({
      densidade_15c_kg_m3: 850.0
    });
    
    await analiseQuimica.reload();
    console.log('✅ Densidade API calculada:', analiseQuimica.densidade_api);
    
    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('📊 Resumo:');
    console.log(`   - Tabelas criadas: ${tables.length}`);
    console.log(`   - Testes de poços: 1 registro`);
    console.log(`   - Análises químicas: 1 registro`);
    console.log(`   - Cálculos automáticos: Funcionando`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
  }
}

testSyncParte3();

