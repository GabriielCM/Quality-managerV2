# Novos Agentes Especializados para Q-Manager

Este documento cont�m propostas de novos agentes especializados que podem ser implementados no Q-Manager para automatizar tarefas complexas e melhorar a efici�ncia do desenvolvimento.

---

## 1. Workflow Manager Agent

### Nome
`workflow-manager`

### Objetivo
Gerenciar e automatizar workflows complexos que envolvem m�ltiplos m�dulos e etapas sequenciais, como o fluxo INC � RNC � Devolu��o.

### Responsabilidades
- Analisar fluxos de trabalho existentes
- Criar novos workflows multi-etapa
- Validar transi��es de estado
- Implementar l�gica de valida��o entre etapas
- Gerar testes para workflows completos
- Documentar fluxos de trabalho

### Quando Usar
- Ao criar novos processos que envolvem m�ltiplos m�dulos
- Quando precisar modificar workflows existentes (INC�RNC�Devolu��o)
- Para validar que todas as transi��es de estado est�o corretas
- Ao adicionar novas etapas em processos existentes
- Para gerar documenta��o de workflows

### Inputs
- Descri��o do workflow (m�dulos envolvidos, etapas, status)
- Regras de neg�cio (valida��es, condi��es)
- Pontos de integra��o entre m�dulos
- Estados poss�veis e transi��es permitidas

### Outputs
- C�digo para gerenciar transi��es de estado
- Valida��es de neg�cio implementadas
- Testes E2E para o workflow completo
- Diagrama de fluxo atualizado
- Documenta��o do processo

### Casos de Uso

**Exemplo 1:**
```
User: "Preciso adicionar uma nova etapa de aprova��o financeira entre RNC aceita e cria��o de devolu��o"
Agent: Analisa workflow atual � Identifica ponto de inser��o � Cria nova etapa � Atualiza valida��es � Gera testes
```

**Exemplo 2:**
```
User: "O workflow de devolu��o precisa de uma nova valida��o: apenas devolu��es com peso acima de 100kg precisam de aprova��o do gerente"
Agent: Analisa regra � Identifica etapa afetada � Implementa valida��o � Atualiza testes � Documenta
```

---

## 2. Database Migration Agent

### Nome
`database-migrator`

### Objetivo
Auxiliar na cria��o, execu��o e valida��o de migra��es Prisma, garantindo integridade e consist�ncia do banco de dados.

### Responsabilidades
- Gerar migra��es Prisma a partir de mudan�as no schema
- Validar migra��es antes da execu��o
- Criar scripts de rollback quando poss�vel
- Detectar breaking changes e alertar
- Sugerir �ndices para performance
- Gerar seeds para novos modelos
- Atualizar documenta��o de schema

### Quando Usar
- Ao adicionar novos campos em modelos existentes
- Ao criar novos modelos/tabelas
- Ao modificar relacionamentos
- Antes de executar migra��es em produ��o
- Para validar integridade de dados ap�s migra��o
- Ao otimizar schema para performance

### Inputs
- Schema Prisma atualizado
- Descri��o das mudan�as desejadas
- Dados de produ��o (opcional, para valida��o)
- Requisitos de performance

### Outputs
- Arquivos de migra��o Prisma
- Scripts SQL gerados
- Scripts de rollback (quando poss�vel)
- Valida��es de integridade
- Sugest�es de �ndices
- Seeds atualizados
- Documenta��o atualizada

### Casos de Uso

**Exemplo 1:**
```
User: "Preciso adicionar um campo 'observacao' opcional na tabela Devolucao"
Agent: Analisa schema � Gera migra��o � Cria rollback � Valida integridade � Atualiza DTOs
```

**Exemplo 2:**
```
User: "Vou executar as migra��es em produ��o. Pode validar?"
Agent: Analisa migra��es pendentes � Detecta breaking changes � Sugere ordem de execu��o � Gera backup plan
```

---




## 4. Notification Manager Agent

### Nome
`notification-manager`

### Objetivo
Configurar, testar e gerenciar o sistema de notifica��es, incluindo cria��o de novos tipos e valida��o de triggers.

### Responsabilidades
- Criar novos tipos de notifica��o
- Configurar triggers autom�ticos
- Implementar runners para notifica��es agendadas
- Testar sistema de deduplica��o
- Validar prefer�ncias de usu�rio
- Gerar templates de notifica��o
- Documentar sistema de notifica��es

### Quando Usar
- Ao adicionar novos tipos de notifica��o
- Para configurar notifica��es de novos m�dulos
- Ao modificar l�gica de triggers
- Para testar sistema de notifica��es
- Ao debugar problemas de notifica��es duplicadas
- Para otimizar performance do sistema

### Inputs
- Tipo de notifica��o desejado
- Condi��es de trigger (prazo, evento, etc.)
- M�dulo relacionado
- Urg�ncia e canal
- Template de mensagem

### Outputs
- NotificationType criado no seed
- NotificationModule implementado
- Runner configurado (se agendado)
- Testes de trigger
- Valida��o de deduplica��o
- Documenta��o atualizada

### Casos de Uso

**Exemplo 1:**
```
User: "Preciso de uma notifica��o quando uma devolu��o ficar 3 dias sem atualiza��o na etapa de NF-e"
Agent: Cria tipo � Implementa runner � Configura trigger � Testa deduplica��o � Documenta
```

**Exemplo 2:**
```
User: "As notifica��es de RNC est�o duplicando"
Agent: Analisa uniqueKey � Identifica problema � Corrige l�gica � Adiciona teste de regress�o
```

---

## 5. Data Seeder Agent

### Nome
`data-seeder`

### Objetivo
Gerar e gerenciar dados de seed para testes, desenvolvimento e demonstra��es, mantendo consist�ncia e realismo.

### Responsabilidades
- Criar seeds realistas para todos os m�dulos
- Manter consist�ncia de relacionamentos
- Gerar dados de teste para cen�rios espec�ficos
- Criar fixtures para testes E2E
- Documentar seeds dispon�veis
- Validar integridade referencial

### Quando Usar
- Ao criar novos m�dulos que precisam de dados de exemplo
- Para popular banco de desenvolvimento
- Para criar cen�rios de teste espec�ficos
- Ao preparar demos para clientes
- Para testes de performance com volumes realistas
- Ao resetar banco de desenvolvimento

### Inputs
- M�dulos a serem populados
- Volume de dados desejado
- Relacionamentos a serem criados
- Cen�rios espec�ficos (opcional)
- Constraints de neg�cio

### Outputs
- Arquivos de seed Prisma
- Fixtures para testes
- Scripts de popula��o
- Documenta��o de dados gerados
- Valida��es de integridade

### Casos de Uso

**Exemplo 1:**
```
User: "Preciso de 100 INCs de teste com distribui��o realista de status"
Agent: Gera fornecedores � Cria INCs variadas � Distribui status � Cria RNCs para algumas � Valida rela��es
```

**Exemplo 2:**
```
User: "Quero testar o workflow completo de devolu��o. Preciso de dados de exemplo."
Agent: Cria INC � Gera RNC aceita � Cria devolu��o em etapa 2 � Documenta cen�rio
```

---

## 6. Performance Optimizer Agent

### Nome
`performance-optimizer`

### Objetivo
Analisar e otimizar performance da aplica��o, identificando gargalos e sugerindo melhorias.

### Responsabilidades
- Analisar queries N+1 em Prisma
- Sugerir �ndices de banco de dados
- Identificar componentes React pesados
- Otimizar bundling do frontend
- Sugerir caching estrat�gico
- Analisar uso de mem�ria
- Gerar relat�rios de performance

### Quando Usar
- Quando a aplica��o estiver lenta
- Antes de releases de produ��o
- Para auditorias de performance
- Ao adicionar grandes volumes de dados
- Para otimizar queries espec�ficas
- Ao refatorar componentes complexos

### Inputs
- C�digo backend (services)
- Componentes frontend
- Logs de queries
- M�tricas de performance
- Volume de dados esperado

### Outputs
- Relat�rio de performance
- Queries otimizadas
- �ndices sugeridos
- Componentes refatorados
- Estrat�gias de caching
- Benchmarks antes/depois

### Casos de Uso

**Exemplo 1:**
```
User: "A listagem de RNCs est� muito lenta com 1000+ registros"
Agent: Analisa query � Identifica N+1 � Adiciona include otimizado � Sugere �ndice � Implementa pagina��o
```

**Exemplo 2:**
```
User: "O dashboard demora 5 segundos para carregar"
Agent: Analisa componentes � Identifica renders desnecess�rios � Implementa memoization � Adiciona lazy loading
```

---

## 7. Code Reviewer Agent

### Nome
`code-reviewer`

### Objetivo
Revisar c�digo seguindo padr�es do Q-Manager, identificando problemas de qualidade, seguran�a e performance.

### Responsabilidades
- Revisar c�digo seguindo style guide do projeto
- Identificar code smells e anti-patterns
- Validar tipagem TypeScript
- Verificar tratamento de erros
- Identificar vulnerabilidades de seguran�a
- Sugerir melhorias de legibilidade
- Validar testes adequados

### Quando Usar
- Antes de commits importantes
- Para revisar Pull Requests
- Ao refatorar c�digo legado
- Para validar c�digo de terceiros
- Antes de releases
- Para auditorias de qualidade

### Inputs
- Arquivos modificados
- Diff de mudan�as
- Contexto do m�dulo
- Requisitos de neg�cio

### Outputs
- Lista de problemas encontrados
- Sugest�es de melhorias
- Code snippets corrigidos
- Classifica��o por severidade
- Checklist de qualidade

### Casos de Uso

**Exemplo 1:**
```
User: "Pode revisar meu service de devolu��o?"
Agent: Analisa c�digo � Identifica falta de try/catch � Detecta any types � Sugere valida��es adicionais � Recomenda testes
```

**Exemplo 2:**
```
User: "Vou fazer merge dessa PR. Pode revisar?"
Agent: Analisa diff � Valida que guards est�o aplicados � Verifica DTOs � Confirma testes existem � Aprova
```

---

## Implementa��o Recomendada

Para implementar esses agentes, recomenda-se criar arquivos `.md` na pasta `.claude/agents/` seguindo o padr�o dos agentes existentes:

1. Copiar estrutura dos agentes existentes (frontmatter YAML)
2. Definir `name`, `description`, `model`, e `color`
3. Detalhar expertise, processo e outputs
4. Adicionar exemplos claros de uso
5. Documentar no CLAUDE.md quando e como usar cada agente

## Prioriza��o de Implementa��o

**Alta Prioridade:**
1. **workflow-manager** - Cr�tico para manter consist�ncia dos fluxos complexos
2. **permission-auditor** - Essencial para seguran�a
3. **database-migrator** - Reduz erros em migra��es

**M�dia Prioridade:**
4. **notification-manager** - �til para expandir sistema de notifica��es
5. **performance-optimizer** - Importante conforme sistema escala
6. **code-reviewer** - Melhora qualidade geral

**Baixa Prioridade:**
7. **data-seeder** - Nice to have para desenvolvimento

---

## Integra��o com Agentes Existentes

Esses novos agentes complementam os existentes:

- **module-generator** � Usa **permission-auditor** para validar permiss�es
- **test-generator** � Usa **workflow-manager** para gerar testes de workflows
- **api-documenter** � Usa **permission-auditor** para documentar autoriza��es
- **database-migrator** � Usa **module-generator** para atualizar DTOs
- **performance-optimizer** � Usa **code-reviewer** para validar otimiza��es

---

Este sistema de agentes especializados forma um ecossistema completo para desenvolvimento, manuten��o e otimiza��o do Q-Manager.
