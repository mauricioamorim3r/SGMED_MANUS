// ============================================================================
// ROUTES PARA TESTES DE POÇOS - SGM
// ============================================================================

const express = require('express');
const router = express.Router();

// Simulação de dados - será substituído por conexão real com banco
let testesPocos = [];

/**
 * GET /api/testes-pocos
 * Lista todos os testes de poços
 */
router.get('/', async (req, res) => {
  try {
    // Filtros opcionais
    const { polo_id, poco, tipo_teste, status, data_inicio, data_fim, search } = req.query;
    
    let filteredTestes = [...testesPocos];
    
    if (polo_id) {
      filteredTestes = filteredTestes.filter(teste => teste.polo_id === parseInt(polo_id));
    }
    
    if (poco) {
      filteredTestes = filteredTestes.filter(teste => 
        teste.nome_poco.toLowerCase().includes(poco.toLowerCase())
      );
    }
    
    if (tipo_teste) {
      filteredTestes = filteredTestes.filter(teste => teste.tipo_teste === tipo_teste);
    }
    
    if (status && status !== 'all') {
      filteredTestes = filteredTestes.filter(teste => teste.status_teste === status);
    }
    
    if (data_inicio) {
      filteredTestes = filteredTestes.filter(teste => 
        new Date(teste.data_inicio) >= new Date(data_inicio)
      );
    }
    
    if (data_fim) {
      filteredTestes = filteredTestes.filter(teste => 
        new Date(teste.data_fim || teste.data_inicio) <= new Date(data_fim)
      );
    }
    
    if (search) {
      filteredTestes = filteredTestes.filter(teste => 
        teste.nome_poco.toLowerCase().includes(search.toLowerCase()) ||
        teste.nome_teste.toLowerCase().includes(search.toLowerCase()) ||
        teste.responsavel_teste.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      data: filteredTestes,
      total: filteredTestes.length,
      message: 'Testes de poços carregados com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao buscar testes de poços:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao carregar testes de poços'
    });
  }
});

/**
 * GET /api/testes-pocos/:id
 * Busca teste de poço por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const teste = testesPocos.find(t => t.id === parseInt(id));
    
    if (!teste) {
      return res.status(404).json({
        success: false,
        error: 'Teste de poço não encontrado',
        message: `Teste com ID ${id} não existe`
      });
    }
    
    res.json({
      success: true,
      data: teste,
      message: 'Teste de poço encontrado'
    });
    
  } catch (error) {
    console.error('Erro ao buscar teste de poço:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/testes-pocos
 * Cria novo teste de poço
 */
router.post('/', async (req, res) => {
  try {
    const {
      polo_id,
      nome_poco,
      nome_teste,
      tipo_teste,
      objetivo_teste,
      data_inicio,
      data_fim,
      duracao_planejada_horas,
      duracao_real_horas,
      pressao_inicial_kgfcm2,
      pressao_final_kgfcm2,
      vazao_oleo_m3d,
      vazao_gas_m3d,
      vazao_agua_m3d,
      rop_agua_percentual,
      bsw_percentual,
      grau_api,
      temperatura_celsius,
      equipamentos_utilizados,
      responsavel_teste,
      empresa_executora,
      status_teste,
      resultado_teste,
      observacoes
    } = req.body;
    
    // Validações básicas
    if (!nome_poco || !nome_teste || !tipo_teste || !data_inicio) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios faltando',
        message: 'Nome do poço, nome do teste, tipo e data de início são obrigatórios'
      });
    }
    
    // Calcular duração real se data_fim fornecida
    let duracaoRealCalculada = duracao_real_horas;
    if (data_fim && data_inicio && !duracaoRealCalculada) {
      const inicio = new Date(data_inicio);
      const fim = new Date(data_fim);
      duracaoRealCalculada = Math.round((fim - inicio) / (1000 * 60 * 60)); // em horas
    }
    
    const novoTeste = {
      id: testesPocos.length + 1,
      polo_id: polo_id ? parseInt(polo_id) : null,
      nome_poco,
      nome_teste,
      tipo_teste,
      objetivo_teste: objetivo_teste || '',
      data_inicio,
      data_fim: data_fim || null,
      duracao_planejada_horas: parseFloat(duracao_planejada_horas) || null,
      duracao_real_horas: duracaoRealCalculada || null,
      pressao_inicial_kgfcm2: parseFloat(pressao_inicial_kgfcm2) || null,
      pressao_final_kgfcm2: parseFloat(pressao_final_kgfcm2) || null,
      vazao_oleo_m3d: parseFloat(vazao_oleo_m3d) || null,
      vazao_gas_m3d: parseFloat(vazao_gas_m3d) || null,
      vazao_agua_m3d: parseFloat(vazao_agua_m3d) || null,
      rop_agua_percentual: parseFloat(rop_agua_percentual) || null,
      bsw_percentual: parseFloat(bsw_percentual) || null,
      grau_api: parseFloat(grau_api) || null,
      temperatura_celsius: parseFloat(temperatura_celsius) || null,
      equipamentos_utilizados: equipamentos_utilizados || '',
      responsavel_teste: responsavel_teste || '',
      empresa_executora: empresa_executora || '',
      status_teste: status_teste || 'Planejado',
      resultado_teste: resultado_teste || '',
      observacoes: observacoes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    testesPocos.push(novoTeste);
    
    res.status(201).json({
      success: true,
      data: novoTeste,
      message: 'Teste de poço criado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar teste de poço:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/testes-pocos/:id
 * Atualiza teste de poço existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const testeIndex = testesPocos.findIndex(t => t.id === parseInt(id));
    
    if (testeIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Teste de poço não encontrado'
      });
    }
    
    // Recalcular duração real se datas foram alteradas
    const dadosAtualizacao = { ...req.body };
    const testeAtual = testesPocos[testeIndex];
    
    const dataInicio = dadosAtualizacao.data_inicio || testeAtual.data_inicio;
    const dataFim = dadosAtualizacao.data_fim || testeAtual.data_fim;
    
    if (dataFim && dataInicio && !dadosAtualizacao.duracao_real_horas) {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      dadosAtualizacao.duracao_real_horas = Math.round((fim - inicio) / (1000 * 60 * 60));
    }
    
    const testeAtualizado = {
      ...testeAtual,
      ...dadosAtualizacao,
      updated_at: new Date().toISOString()
    };
    
    testesPocos[testeIndex] = testeAtualizado;
    
    res.json({
      success: true,
      data: testeAtualizado,
      message: 'Teste de poço atualizado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar teste de poço:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/testes-pocos/:id
 * Remove teste de poço
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const testeIndex = testesPocos.findIndex(t => t.id === parseInt(id));
    
    if (testeIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Teste de poço não encontrado'
      });
    }
    
    const testeRemovido = testesPocos[testeIndex];
    testesPocos.splice(testeIndex, 1);
    
    res.json({
      success: true,
      data: testeRemovido,
      message: 'Teste de poço removido com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao remover teste de poço:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/testes-pocos/tipos/lista
 * Lista tipos de testes disponíveis
 */
router.get('/tipos/lista', (req, res) => {
  const tipos = [
    'Teste de Produção',
    'Teste de Injetividade',
    'Teste de Pressão',
    'Teste de Formação',
    'Teste DST',
    'Teste de Build-up',
    'Teste de Draw-down',
    'Teste de Interferência',
    'Teste de Step-rate',
    'Outros'
  ];
  
  res.json({
    success: true,
    data: tipos,
    message: 'Tipos de testes carregados'
  });
});

/**
 * GET /api/testes-pocos/status/lista
 * Lista status disponíveis para testes
 */
router.get('/status/lista', (req, res) => {
  const status = [
    'Planejado',
    'Em Execução',
    'Concluído',
    'Suspenso',
    'Cancelado',
    'Aguardando Análise',
    'Finalizado'
  ];
  
  res.json({
    success: true,
    data: status,
    message: 'Status de testes carregados'
  });
});

/**
 * GET /api/testes-pocos/polo/:polo_id
 * Lista testes por polo
 */
router.get('/polo/:polo_id', async (req, res) => {
  try {
    const { polo_id } = req.params;
    const testesPolo = testesPocos.filter(t => t.polo_id === parseInt(polo_id));
    
    res.json({
      success: true,
      data: testesPolo,
      total: testesPolo.length,
      message: `Testes do polo ${polo_id} carregados`
    });
    
  } catch (error) {
    console.error('Erro ao buscar testes por polo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/testes-pocos/poco/:nome_poco
 * Lista testes por poço
 */
router.get('/poco/:nome_poco', async (req, res) => {
  try {
    const { nome_poco } = req.params;
    const testesPoco = testesPocos.filter(t => 
      t.nome_poco.toLowerCase() === nome_poco.toLowerCase()
    );
    
    res.json({
      success: true,
      data: testesPoco,
      total: testesPoco.length,
      message: `Testes do poço ${nome_poco} carregados`
    });
    
  } catch (error) {
    console.error('Erro ao buscar testes por poço:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/testes-pocos/calcular-rop
 * Calcula ROP (Razão Óleo-Produção) baseado nas vazões
 */
router.post('/calcular-rop', async (req, res) => {
  try {
    const { vazao_oleo_m3d, vazao_agua_m3d } = req.body;
    
    if (!vazao_oleo_m3d || !vazao_agua_m3d) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios faltando',
        message: 'Vazões de óleo e água são obrigatórias'
      });
    }
    
    const vazaoOleo = parseFloat(vazao_oleo_m3d);
    const vazaoAgua = parseFloat(vazao_agua_m3d);
    const vazaoTotal = vazaoOleo + vazaoAgua;
    
    if (vazaoTotal === 0) {
      return res.status(400).json({
        success: false,
        error: 'Vazão total não pode ser zero'
      });
    }
    
    const ropOleo = (vazaoOleo / vazaoTotal) * 100;
    const ropAgua = (vazaoAgua / vazaoTotal) * 100;
    
    res.json({
      success: true,
      data: {
        vazao_oleo_m3d: vazaoOleo,
        vazao_agua_m3d: vazaoAgua,
        vazao_total_liquidos_m3d: vazaoTotal,
        rop_oleo_percentual: parseFloat(ropOleo.toFixed(2)),
        rop_agua_percentual: parseFloat(ropAgua.toFixed(2)),
        classificacao: ropOleo >= 80 ? 'Alto teor de óleo' : 
                      ropOleo >= 50 ? 'Teor médio de óleo' : 'Alto teor de água',
        data_calculo: new Date().toISOString()
      },
      message: 'ROP calculado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao calcular ROP:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/testes-pocos/:id/relatorio
 * Gera relatório detalhado do teste
 */
router.get('/:id/relatorio', async (req, res) => {
  try {
    const { id } = req.params;
    const teste = testesPocos.find(t => t.id === parseInt(id));
    
    if (!teste) {
      return res.status(404).json({
        success: false,
        error: 'Teste de poço não encontrado'
      });
    }
    
    // Calcular métricas derivadas
    const vazaoTotalLiquidos = (teste.vazao_oleo_m3d || 0) + (teste.vazao_agua_m3d || 0);
    const ropOleo = vazaoTotalLiquidos > 0 ? 
      ((teste.vazao_oleo_m3d || 0) / vazaoTotalLiquidos) * 100 : 0;
    
    const eficiencia = teste.duracao_planejada_horas && teste.duracao_real_horas ?
      Math.min((teste.duracao_planejada_horas / teste.duracao_real_horas) * 100, 100) : null;
    
    const relatorio = {
      ...teste,
      metricas_calculadas: {
        vazao_total_liquidos_m3d: vazaoTotalLiquidos,
        rop_oleo_calculado: parseFloat(ropOleo.toFixed(2)),
        eficiencia_tempo: eficiencia ? parseFloat(eficiencia.toFixed(2)) : null,
        diferenca_pressao: teste.pressao_inicial_kgfcm2 && teste.pressao_final_kgfcm2 ?
          teste.pressao_inicial_kgfcm2 - teste.pressao_final_kgfcm2 : null,
        status_producao: vazaoTotalLiquidos > 100 ? 'Alta produção' :
                        vazaoTotalLiquidos > 50 ? 'Produção média' : 'Baixa produção'
      },
      data_relatorio: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: relatorio,
      message: 'Relatório gerado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/testes-pocos/importar
 * Importa testes de poços via CSV/bulk
 */
router.post('/importar', async (req, res) => {
  try {
    const { dados } = req.body;
    
    if (!dados || !Array.isArray(dados)) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        message: 'Array de dados é obrigatório'
      });
    }
    
    const testesImportados = [];
    const erros = [];
    
    for (let i = 0; i < dados.length; i++) {
      const teste = dados[i];
      
      try {
        // Validar dados obrigatórios
        if (!teste.nome_poco || !teste.nome_teste || !teste.tipo_teste || !teste.data_inicio) {
          erros.push(`Linha ${i + 1}: Nome do poço, nome do teste, tipo e data de início são obrigatórios`);
          continue;
        }
        
        const novoTeste = {
          id: testesPocos.length + testesImportados.length + 1,
          polo_id: teste.polo_id ? parseInt(teste.polo_id) : null,
          nome_poco: teste.nome_poco,
          nome_teste: teste.nome_teste,
          tipo_teste: teste.tipo_teste,
          objetivo_teste: teste.objetivo_teste || '',
          data_inicio: teste.data_inicio,
          data_fim: teste.data_fim || null,
          duracao_planejada_horas: parseFloat(teste.duracao_planejada_horas) || null,
          duracao_real_horas: parseFloat(teste.duracao_real_horas) || null,
          pressao_inicial_kgfcm2: parseFloat(teste.pressao_inicial_kgfcm2) || null,
          pressao_final_kgfcm2: parseFloat(teste.pressao_final_kgfcm2) || null,
          vazao_oleo_m3d: parseFloat(teste.vazao_oleo_m3d) || null,
          vazao_gas_m3d: parseFloat(teste.vazao_gas_m3d) || null,
          vazao_agua_m3d: parseFloat(teste.vazao_agua_m3d) || null,
          rop_agua_percentual: parseFloat(teste.rop_agua_percentual) || null,
          bsw_percentual: parseFloat(teste.bsw_percentual) || null,
          grau_api: parseFloat(teste.grau_api) || null,
          temperatura_celsius: parseFloat(teste.temperatura_celsius) || null,
          equipamentos_utilizados: teste.equipamentos_utilizados || '',
          responsavel_teste: teste.responsavel_teste || '',
          empresa_executora: teste.empresa_executora || '',
          status_teste: teste.status_teste || 'Planejado',
          resultado_teste: teste.resultado_teste || '',
          observacoes: teste.observacoes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        testesImportados.push(novoTeste);
        
      } catch (error) {
        erros.push(`Linha ${i + 1}: ${error.message}`);
      }
    }
    
    // Adicionar testes válidos
    testesPocos.push(...testesImportados);
    
    res.json({
      success: true,
      data: {
        importados: testesImportados.length,
        erros: erros.length,
        detalhes_erros: erros
      },
      message: `${testesImportados.length} testes de poços importados com sucesso`
    });
    
  } catch (error) {
    console.error('Erro ao importar testes de poços:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;