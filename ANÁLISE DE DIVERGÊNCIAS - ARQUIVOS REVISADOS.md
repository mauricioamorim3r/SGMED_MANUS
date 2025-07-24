# ANÁLISE DE DIVERGÊNCIAS - ARQUIVOS REVISADOS
## ESPINHA DORSAL DA APLICAÇÃO SGM

**Data:** 23/07/2025  
**Análise:** Arquivos revisados vs Sistema atual  

---

## 🔍 DIVERGÊNCIAS IDENTIFICADAS

### **PARTE 2: MÓDULOS ESPECIALIZADOS**

#### **2.1 MÓDULO PLACAS DE ORIFÍCIO**

**✅ ALTERAÇÕES NECESSÁRIAS:**

1. **Campo de Conformidade:**
   - **Atual:** `conforme_aga3` (BOOLEAN)
   - **Novo:** `conformidade_a_qual_norma` (ENUM)
   - **Opções:** 'Conforme_AGA_3', 'Conforme_ISO_5167'
   - **Ação:** Substituir campo existente

2. **Validação ISO 5167:**
   - **Observação:** "FALTA INSERIR VALIDAÇÃO ISO 5167 !"
   - **Ação:** Implementar validação para ISO 5167

#### **2.2 MÓDULO TRECHOS RETOS**

**❌ CAMPOS PARA REMOÇÃO (Tachados):**

1. `acabamento_interno` - ENUM - Removido completamente
2. `posicao_condicionador` - DECIMAL(8,2) - Removido completamente  
3. `numero_condicionadores` - INTEGER - Removido completamente

**✅ ALTERAÇÕES NECESSÁRIAS:**

1. **Campo de Conformidade:**
   - **Atual:** `conforme_aga3` (BOOLEAN)
   - **Novo:** `conformidade_a_qual_norma` (ENUM)
   - **Opções:** 'Conforme_AGA_3', 'Conforme_ISO_5167'
   - **Ação:** Substituir campo existente

2. **Validação ISO 5167:**
   - **Observação:** "Validação ISO 5167 - FALNTA INSERIR"
   - **Ação:** Implementar validação para ISO 5167

#### **2.3 MÓDULO INCERTEZAS DE MEDIÇÃO**

**📝 ALTERAÇÃO DE NOMENCLATURA:**
- **De:** "2.3 MÓDULO INCERTEZAS (SIMPLIFICADO)"
- **Para:** "2.3 MÓDULO INCERTEZAS DE MEDIÇÃO"

**❌ CAMPOS PARA REMOÇÃO (Tachados):**

1. `status_analise` - ENUM - Removido completamente
2. `data_analise` - DATE - Removido completamente
3. `analista_responsavel` - STRING(100) - Removido completamente
4. `observacoes_analise` - TEXT - Removido completamente

#### **2.4 MÓDULO CERTIFICADOS DE CALIBRAÇÃO**

**❌ CAMPOS PARA REMOÇÃO (Tachados):**

1. `acreditacao_laboratorio` - STRING(50) - Removido completamente
2. `responsavel_tecnico` - STRING(100) - Removido completamente

---

## 🎯 RESUMO DAS AÇÕES NECESSÁRIAS

### **REMOÇÕES (6 campos):**
- Trechos Retos: `acabamento_interno`, `posicao_condicionador`, `numero_condicionadores`
- Incertezas: `status_analise`, `data_analise`, `analista_responsavel`, `observacoes_analise`
- Certificados: `acreditacao_laboratorio`, `responsavel_tecnico`

### **ALTERAÇÕES (2 módulos):**
- Placas de Orifício: Campo `conformidade_a_qual_norma`
- Trechos Retos: Campo `conformidade_a_qual_norma`

### **ADIÇÕES (2 validações):**
- Placas de Orifício: Validação ISO 5167
- Trechos Retos: Validação ISO 5167

### **NOMENCLATURA (1 alteração):**
- Módulo Incertezas: Remover "(SIMPLIFICADO)" do título

---

## 🔧 IMPACTO NO SISTEMA

### **MODELOS DE DADOS:**
- ✅ Atualizar 4 modelos (placas_orificio, trechos_retos, incertezas, certificados)
- ✅ Remover 6 campos obsoletos
- ✅ Adicionar 2 campos de conformidade
- ✅ Implementar 2 validações ISO 5167

### **APIS:**
- ✅ Atualizar endpoints para novos campos
- ✅ Remover validações de campos obsoletos
- ✅ Adicionar validações ISO 5167

### **BANCO DE DADOS:**
- ✅ Migração para remover colunas
- ✅ Migração para adicionar novos campos
- ✅ Atualizar dados existentes

### **FRONTEND:**
- ✅ Atualizar formulários
- ✅ Remover campos obsoletos da interface
- ✅ Adicionar dropdown para conformidade

---

## ⏱️ CRONOGRAMA DE IMPLEMENTAÇÃO

### **FASE 1: Preparação (1 dia)**
- Backup do banco de dados atual
- Análise de dependências
- Preparação de scripts de migração

### **FASE 2: Backend (2 dias)**
- Atualização dos modelos de dados
- Implementação das migrações
- Atualização das APIs
- Testes de validação

### **FASE 3: Validação (1 dia)**
- Testes de integração
- Validação de dados migrados
- Verificação de conformidade

### **TOTAL: 4 dias de trabalho**

---

## 🚨 RISCOS IDENTIFICADOS

### **BAIXO RISCO:**
- Remoção de campos não utilizados
- Alteração de nomenclatura

### **MÉDIO RISCO:**
- Alteração do campo de conformidade (requer migração de dados)
- Implementação de novas validações

### **MITIGAÇÃO:**
- Backup completo antes das alterações
- Testes extensivos em ambiente de desenvolvimento
- Migração gradual com validação de dados

---

## ✅ PRÓXIMOS PASSOS

1. **Implementar alterações** conforme análise
2. **Testar funcionalidades** após alterações
3. **Validar conformidade** com especificações
4. **Continuar com PARTE 3** após aprovação

---

*Análise realizada pelo SGM Development Team*  
*Para aprovação e implementação das alterações*

