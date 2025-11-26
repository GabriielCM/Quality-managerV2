# Novos Agentes Especializados para Q-Manager

Este documento contém propostas de novos agentes especializados que podem ser implementados no Q-Manager para automatizar tarefas complexas e melhorar a eficiência do desenvolvimento.

---

## 1. Workflow Manager Agent

### Nome
`workflow-manager`

### Objetivo
Gerenciar e automatizar workflows complexos que envolvem múltiplos módulos e etapas sequenciais, como o fluxo INC ’ RNC ’ Devolução.

### Responsabilidades
- Analisar fluxos de trabalho existentes
- Criar novos workflows multi-etapa
- Validar transições de estado
- Implementar lógica de validação entre etapas
- Gerar testes para workflows completos
- Documentar fluxos de trabalho

### Quando Usar
- Ao criar novos processos que envolvem múltiplos módulos
- Quando precisar modificar workflows existentes (INC’RNC’Devolução)
- Para validar que todas as transições de estado estão corretas
- Ao adicionar novas etapas em processos existentes
- Para gerar documentação de workflows

### Inputs
- Descrição do workflow (módulos envolvidos, etapas, status)
- Regras de negócio (validações, condições)
- Pontos de integração entre módulos
- Estados possíveis e transições permitidas

### Outputs
- Código para gerenciar transições de estado
- Validações de negócio implementadas
- Testes E2E para o workflow completo
- Diagrama de fluxo atualizado
- Documentação do processo

### Casos de Uso

**Exemplo 1:**
```
User: "Preciso adicionar uma nova etapa de aprovação financeira entre RNC aceita e criação de devolução"
Agent: Analisa workflow atual ’ Identifica ponto de inserção ’ Cria nova etapa ’ Atualiza validações ’ Gera testes
```

**Exemplo 2:**
```
User: "O workflow de devolução precisa de uma nova validação: apenas devoluções com peso acima de 100kg precisam de aprovação do gerente"
Agent: Analisa regra ’ Identifica etapa afetada ’ Implementa validação ’ Atualiza testes ’ Documenta
```

---

## 2. Database Migration Agent

### Nome
`database-migrator`

### Objetivo
Auxiliar na criação, execução e validação de migrações Prisma, garantindo integridade e consistência do banco de dados.

### Responsabilidades
- Gerar migrações Prisma a partir de mudanças no schema
- Validar migrações antes da execução
- Criar scripts de rollback quando possível
- Detectar breaking changes e alertar
- Sugerir índices para performance
- Gerar seeds para novos modelos
- Atualizar documentação de schema

### Quando Usar
- Ao adicionar novos campos em modelos existentes
- Ao criar novos modelos/tabelas
- Ao modificar relacionamentos
- Antes de executar migrações em produção
- Para validar integridade de dados após migração
- Ao otimizar schema para performance

### Inputs
- Schema Prisma atualizado
- Descrição das mudanças desejadas
- Dados de produção (opcional, para validação)
- Requisitos de performance

### Outputs
- Arquivos de migração Prisma
- Scripts SQL gerados
- Scripts de rollback (quando possível)
- Validações de integridade
- Sugestões de índices
- Seeds atualizados
- Documentação atualizada

### Casos de Uso

**Exemplo 1:**
```
User: "Preciso adicionar um campo 'observacao' opcional na tabela Devolucao"
Agent: Analisa schema ’ Gera migração ’ Cria rollback ’ Valida integridade ’ Atualiza DTOs
```

**Exemplo 2:**
```
User: "Vou executar as migrações em produção. Pode validar?"
Agent: Analisa migrações pendentes ’ Detecta breaking changes ’ Sugere ordem de execução ’ Gera backup plan
```

---

## 3. Permission Auditor Agent

### Nome
`permission-auditor`

### Objetivo
Auditar e gerenciar o sistema de permissões RBAC, identificando lacunas de segurança e inconsistências.

### Responsabilidades
- Auditar endpoints sem proteção adequada
- Identificar permissões órfãs (não usadas)
- Detectar endpoints sem documentação de permissões
- Validar consistência entre backend e frontend
- Sugerir permissões granulares para novos módulos
- Gerar relatórios de auditoria
- Criar testes de autorização

### Quando Usar
- Antes de releases de produção
- Ao adicionar novos endpoints
- Para auditorias de segurança
- Quando detectar problemas de autorização
- Para validar que permissões estão corretas
- Ao refatorar sistema de permissões

### Inputs
- Controladores backend (endpoints)
- Guards e decoradores aplicados
- Permissões definidas no seed
- Componentes frontend com verificações

### Outputs
- Relatório de auditoria completo
- Lista de endpoints desprotegidos
- Permissões órfãs
- Inconsistências backend/frontend
- Sugestões de melhorias
- Testes de autorização gerados

### Casos de Uso

**Exemplo 1:**
```
User: "Preciso de um relatório de segurança antes do deploy"
Agent: Escaneia todos os endpoints ’ Identifica 3 endpoints sem guards ’ Encontra 2 permissões não usadas ’ Gera relatório
```

**Exemplo 2:**
```
User: "Acabei de adicionar 5 novos endpoints no módulo devolucao"
Agent: Analisa endpoints ’ Verifica guards ’ Valida permissões no seed ’ Testa frontend ’ Confirma consistência
```

---

## 4. Notification Manager Agent

### Nome
`notification-manager`

### Objetivo
Configurar, testar e gerenciar o sistema de notificações, incluindo criação de novos tipos e validação de triggers.

### Responsabilidades
- Criar novos tipos de notificação
- Configurar triggers automáticos
- Implementar runners para notificações agendadas
- Testar sistema de deduplicação
- Validar preferências de usuário
- Gerar templates de notificação
- Documentar sistema de notificações

### Quando Usar
- Ao adicionar novos tipos de notificação
- Para configurar notificações de novos módulos
- Ao modificar lógica de triggers
- Para testar sistema de notificações
- Ao debugar problemas de notificações duplicadas
- Para otimizar performance do sistema

### Inputs
- Tipo de notificação desejado
- Condições de trigger (prazo, evento, etc.)
- Módulo relacionado
- Urgência e canal
- Template de mensagem

### Outputs
- NotificationType criado no seed
- NotificationModule implementado
- Runner configurado (se agendado)
- Testes de trigger
- Validação de deduplicação
- Documentação atualizada

### Casos de Uso

**Exemplo 1:**
```
User: "Preciso de uma notificação quando uma devolução ficar 3 dias sem atualização na etapa de NF-e"
Agent: Cria tipo ’ Implementa runner ’ Configura trigger ’ Testa deduplicação ’ Documenta
```

**Exemplo 2:**
```
User: "As notificações de RNC estão duplicando"
Agent: Analisa uniqueKey ’ Identifica problema ’ Corrige lógica ’ Adiciona teste de regressão
```

---

## 5. Data Seeder Agent

### Nome
`data-seeder`

### Objetivo
Gerar e gerenciar dados de seed para testes, desenvolvimento e demonstrações, mantendo consistência e realismo.

### Responsabilidades
- Criar seeds realistas para todos os módulos
- Manter consistência de relacionamentos
- Gerar dados de teste para cenários específicos
- Criar fixtures para testes E2E
- Documentar seeds disponíveis
- Validar integridade referencial

### Quando Usar
- Ao criar novos módulos que precisam de dados de exemplo
- Para popular banco de desenvolvimento
- Para criar cenários de teste específicos
- Ao preparar demos para clientes
- Para testes de performance com volumes realistas
- Ao resetar banco de desenvolvimento

### Inputs
- Módulos a serem populados
- Volume de dados desejado
- Relacionamentos a serem criados
- Cenários específicos (opcional)
- Constraints de negócio

### Outputs
- Arquivos de seed Prisma
- Fixtures para testes
- Scripts de população
- Documentação de dados gerados
- Validações de integridade

### Casos de Uso

**Exemplo 1:**
```
User: "Preciso de 100 INCs de teste com distribuição realista de status"
Agent: Gera fornecedores ’ Cria INCs variadas ’ Distribui status ’ Cria RNCs para algumas ’ Valida relações
```

**Exemplo 2:**
```
User: "Quero testar o workflow completo de devolução. Preciso de dados de exemplo."
Agent: Cria INC ’ Gera RNC aceita ’ Cria devolução em etapa 2 ’ Documenta cenário
```

---

## 6. Performance Optimizer Agent

### Nome
`performance-optimizer`

### Objetivo
Analisar e otimizar performance da aplicação, identificando gargalos e sugerindo melhorias.

### Responsabilidades
- Analisar queries N+1 em Prisma
- Sugerir índices de banco de dados
- Identificar componentes React pesados
- Otimizar bundling do frontend
- Sugerir caching estratégico
- Analisar uso de memória
- Gerar relatórios de performance

### Quando Usar
- Quando a aplicação estiver lenta
- Antes de releases de produção
- Para auditorias de performance
- Ao adicionar grandes volumes de dados
- Para otimizar queries específicas
- Ao refatorar componentes complexos

### Inputs
- Código backend (services)
- Componentes frontend
- Logs de queries
- Métricas de performance
- Volume de dados esperado

### Outputs
- Relatório de performance
- Queries otimizadas
- Índices sugeridos
- Componentes refatorados
- Estratégias de caching
- Benchmarks antes/depois

### Casos de Uso

**Exemplo 1:**
```
User: "A listagem de RNCs está muito lenta com 1000+ registros"
Agent: Analisa query ’ Identifica N+1 ’ Adiciona include otimizado ’ Sugere índice ’ Implementa paginação
```

**Exemplo 2:**
```
User: "O dashboard demora 5 segundos para carregar"
Agent: Analisa componentes ’ Identifica renders desnecessários ’ Implementa memoization ’ Adiciona lazy loading
```

---

## 7. Code Reviewer Agent

### Nome
`code-reviewer`

### Objetivo
Revisar código seguindo padrões do Q-Manager, identificando problemas de qualidade, segurança e performance.

### Responsabilidades
- Revisar código seguindo style guide do projeto
- Identificar code smells e anti-patterns
- Validar tipagem TypeScript
- Verificar tratamento de erros
- Identificar vulnerabilidades de segurança
- Sugerir melhorias de legibilidade
- Validar testes adequados

### Quando Usar
- Antes de commits importantes
- Para revisar Pull Requests
- Ao refatorar código legado
- Para validar código de terceiros
- Antes de releases
- Para auditorias de qualidade

### Inputs
- Arquivos modificados
- Diff de mudanças
- Contexto do módulo
- Requisitos de negócio

### Outputs
- Lista de problemas encontrados
- Sugestões de melhorias
- Code snippets corrigidos
- Classificação por severidade
- Checklist de qualidade

### Casos de Uso

**Exemplo 1:**
```
User: "Pode revisar meu service de devolução?"
Agent: Analisa código ’ Identifica falta de try/catch ’ Detecta any types ’ Sugere validações adicionais ’ Recomenda testes
```

**Exemplo 2:**
```
User: "Vou fazer merge dessa PR. Pode revisar?"
Agent: Analisa diff ’ Valida que guards estão aplicados ’ Verifica DTOs ’ Confirma testes existem ’ Aprova
```

---

## Implementação Recomendada

Para implementar esses agentes, recomenda-se criar arquivos `.md` na pasta `.claude/agents/` seguindo o padrão dos agentes existentes:

1. Copiar estrutura dos agentes existentes (frontmatter YAML)
2. Definir `name`, `description`, `model`, e `color`
3. Detalhar expertise, processo e outputs
4. Adicionar exemplos claros de uso
5. Documentar no CLAUDE.md quando e como usar cada agente

## Priorização de Implementação

**Alta Prioridade:**
1. **workflow-manager** - Crítico para manter consistência dos fluxos complexos
2. **permission-auditor** - Essencial para segurança
3. **database-migrator** - Reduz erros em migrações

**Média Prioridade:**
4. **notification-manager** - Útil para expandir sistema de notificações
5. **performance-optimizer** - Importante conforme sistema escala
6. **code-reviewer** - Melhora qualidade geral

**Baixa Prioridade:**
7. **data-seeder** - Nice to have para desenvolvimento

---

## Integração com Agentes Existentes

Esses novos agentes complementam os existentes:

- **module-generator** ’ Usa **permission-auditor** para validar permissões
- **test-generator** ’ Usa **workflow-manager** para gerar testes de workflows
- **api-documenter** ’ Usa **permission-auditor** para documentar autorizações
- **database-migrator** ’ Usa **module-generator** para atualizar DTOs
- **performance-optimizer** ’ Usa **code-reviewer** para validar otimizações

---

Este sistema de agentes especializados forma um ecossistema completo para desenvolvimento, manutenção e otimização do Q-Manager.
