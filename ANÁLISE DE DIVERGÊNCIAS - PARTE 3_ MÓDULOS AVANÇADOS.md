# ANÁLISE DE DIVERGÊNCIAS - PARTE 3: MÓDULOS AVANÇADOS
## ESPINHA DORSAL DA APLICAÇÃO SGM

**Data:** 23/07/2025  
**Análise:** PARTE 3 revisada vs Sistema atual  

---

## 🔍 DIVERGÊNCIAS IDENTIFICADAS

### **3.1 MÓDULO TESTES DE POÇOS (TP)**

**❌ CAMPOS PARA REMOÇÃO (Tachados):**

1. `fase_poco` - ENUM - Removido completamente
2. `duracao_real_horas` - DECIMAL(6,2) - Removido (será calculado)
3. `responsavel_teste` - STRING(100) - Removido completamente
4. `empresa_servico` - STRING(100) - Removido completamente
5. `profundidade_inicial` - DECIMAL(8,2) - Removido completamente
6. `profundidade_final` - DECIMAL(8,2) - Removido completamente
7. `intervalo_testado` - STRING(100) - Removido completamente
8. `formacao_geologica` - STRING(100) - Removido completamente
9. `tipo_fluido_producao` - ENUM - Removido completamente
10. `pressao_estatica_bar` - DECIMAL(8,2) - Removido completamente
11. `pressao_fluxo_bar` - DECIMAL(8,2) - Removido completamente
12. `temperatura_fundo_c` - DECIMAL(6,2) - Removido completamente
13. `densidade_oleo_api` - DECIMAL(5,2) - Removido completamente
14. `viscosidade_oleo_cp` - DECIMAL(8,3) - Removido completamente
15. `densidade_gas_ar` - DECIMAL(6,4) - Removido completamente
16. `salinidade_agua_ppm` - DECIMAL(10,2) - Removido completamente
17. `ph_agua` - DECIMAL(4,2) - Removido completamente
18. `indice_produtividade` - DECIMAL(10,4) - Removido completamente
19. `skin_factor` - DECIMAL(8,4) - Removido completamente
20. `permeabilidade_md` - DECIMAL(10,4) - Removido completamente
21. `porosidade_percentual` - DECIMAL(5,2) - Removido completamente
22. `saturacao_oleo_percentual` - DECIMAL(5,2) - Removido completamente
23. `observacoes_tecnicas` - TEXT - Removido completamente
24. `relatorio_final` - STRING(200) - Removido completamente
25. `dados_pressao_tempo` - TEXT - Removido completamente
26. `dados_producao_tempo` - TEXT - Removido completamente

### **3.2 MÓDULO ANÁLISES FÍSICO-QUÍMICAS (FQ)**

**❌ CAMPOS PARA REMOÇÃO (Tachados):**

1. `responsavel_coleta` - STRING(100) - Removido completamente
2. `preservacao_amostra` - STRING(200) - Removido completamente
3. `acreditacao_laboratorio` - STRING(50) - Removido completamente
4. `analista_responsavel` - STRING(100) - Removido completamente
5. `cadeia_custodia` - TEXT - Removido completamente
6. `observacoes` - TEXT - Removido completamente

**✅ FUNCIONALIDADE ADICIONAL IDENTIFICADA:**

1. **Configuração de Campos Visíveis:**
   - **Observação:** "Usuário pode configurar quais analises e campos devem ficar visíveis dentro do Módulo Análises Físico-Químicas (FQ). Essa configuração deve ser feita e gerenciada pelo módulo de configuração da aplicação."
   - **Ação:** Integrar com sistema de configurações já implementado

---

## 🎯 RESUMO DAS AÇÕES NECESSÁRIAS

### **REMOÇÕES (32 campos):**
- **Testes de Poços:** 26 campos tachados
- **Análises FQ:** 6 campos tachados

### **FUNCIONALIDADES MANTIDAS:**
- Todos os campos não tachados conforme especificação
- Workflows de status implementados
- Cálculos automáticos preservados
- APIs conforme documentação

### **INTEGRAÇÃO COM CONFIGURAÇÕES:**
- Sistema de configuração de campos já implementado
- Aplicar ao módulo FQ conforme solicitado

---

## 🔧 IMPACTO NO SISTEMA

### **MODELOS DE DADOS:**
- ✅ Criar 2 novos modelos (testes_pocos, analises_quimicas)
- ✅ Implementar apenas campos não tachados
- ✅ Aplicar validações e relacionamentos
- ✅ Integrar com sistema de configurações

### **APIS:**
- ✅ Implementar 32 endpoints conforme especificação
- ✅ Workflows de transição de status
- ✅ Cálculos automáticos especializados

### **BANCO DE DADOS:**
- ✅ Criar tabelas com estrutura simplificada
- ✅ Relacionamentos com polos, instalações, pontos
- ✅ Índices para performance

---

## ⏱️ CRONOGRAMA DE IMPLEMENTAÇÃO

### **FASE 1: Modelos e Estrutura (2 dias)**
- Criar modelos Testes de Poços e Análises FQ
- Implementar relacionamentos
- Configurar validações

### **FASE 2: APIs e Serviços (2 dias)**
- Implementar serviços completos
- Criar rotas e endpoints
- Workflows de status

### **FASE 3: Integração e Testes (1 dia)**
- Integrar com sistema de configurações
- Testes de funcionalidade
- Validação de cálculos

### **TOTAL: 5 dias de trabalho**

---

## 🚨 RISCOS IDENTIFICADOS

### **BAIXO RISCO:**
- Criação de novos módulos (não afeta existentes)
- Campos bem definidos na especificação

### **MÉDIO RISCO:**
- Workflows complexos de status
- Cálculos automáticos especializados

### **MITIGAÇÃO:**
- Implementação incremental
- Testes unitários para cálculos
- Validação de workflows

---

## ✅ PRÓXIMOS PASSOS

1. **Implementar modelos** conforme especificação simplificada
2. **Criar APIs** com workflows completos
3. **Integrar configurações** para campos visíveis
4. **Testar funcionalidades** após implementação
5. **Validar conformidade** com especificações

---

*Análise realizada pelo SGM Development Team*  
*Para implementação da PARTE 3: MÓDULOS AVANÇADOS*

