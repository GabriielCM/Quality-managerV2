# Arquitetura do Q-Manager

## Visão Geral

O Q-Manager é uma aplicação web full-stack desenvolvida com arquitetura modular e separação clara entre backend e frontend.

## Stack Tecnológico

### Backend (NestJS)
```
┌─────────────────────────────────────────┐
│          NestJS Framework               │
├─────────────────────────────────────────┤
│  ┌──────────────────────────────────┐   │
│  │   Controllers (API Endpoints)     │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │   Services (Business Logic)       │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │   Guards (Auth & Permissions)     │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │   Prisma ORM (Database Layer)     │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
             ↓
      PostgreSQL Database
```

### Frontend (React)
```
┌─────────────────────────────────────────┐
│              React App                   │
├─────────────────────────────────────────┤
│  ┌──────────────────────────────────┐   │
│  │   Pages (Route Components)        │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │   Components (Reusable UI)        │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │   Stores (Zustand State)          │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │   API Client (Axios)              │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
             ↑
         REST API
```

## Módulos do Sistema

### 1. Módulo de Autenticação (Auth)

**Responsabilidades:**
- Login com email/senha
- Geração de JWT e Refresh Token
- Renovação automática de tokens
- Logout com revogação de tokens

**Fluxo de Autenticação:**
```
1. User → POST /auth/login → {email, senha}
2. Backend valida credenciais
3. Backend gera JWT (15min) + Refresh Token (7d)
4. Frontend armazena tokens no localStorage
5. Frontend inclui JWT em todas requisições (Authorization: Bearer)
6. Quando JWT expira, frontend usa Refresh Token automaticamente
7. Backend valida e gera novo JWT
```

**Segurança:**
- Senhas com hash bcrypt (salt rounds: 10)
- JWT com assinatura HMAC SHA256
- Refresh tokens armazenados no banco para revogação
- Tokens expiram automaticamente

### 2. Módulo de Usuários (Users)

**Responsabilidades:**
- CRUD de usuários
- Gerenciamento de permissões
- Validação de dados

**Estrutura:**
```typescript
User {
  id: string (UUID)
  nome: string
  email: string (unique)
  senha: string (hashed)
  createdAt: DateTime
  updatedAt: DateTime
  permissions: UserPermission[]
  refreshTokens: RefreshToken[]
}
```

### 3. Módulo de Permissões (Permissions)

**Sistema RBAC (Role-Based Access Control):**

**Estrutura:**
```typescript
Permission {
  id: string (UUID)
  code: string (unique) // ex: "inc.create"
  name: string          // ex: "Criar INC"
  description: string
  module: string        // ex: "inc"
}

UserPermission {
  userId: string
  permissionId: string
}
```

**Hierarquia de Permissões:**
- `admin.all` - Bypass de todas as verificações
- `{module}.{action}` - Permissões granulares por módulo

**Guards de Permissão:**
```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('inc.create', 'admin.all')
createInc() { ... }
```

### 4. Módulo INC (Incidências)

**Responsabilidades:**
- Cadastro de incidências
- Upload de arquivos (NF-e PDF + Fotos)
- Gestão de status
- Filtros e busca

**Estrutura:**
```typescript
Inc {
  id: string
  data: DateTime
  ar: number
  nfeNumero: string
  nfeAnexo: string (filename)
  um: string (UN, KG, M...)
  quantidadeRecebida: number
  quantidadeComDefeito: number
  descricaoNaoConformidade: string (opcional)
  status: string (Em análise, Aprovado, Rejeitado)
  criadoPorId: string
  fornecedorId: string (opcional)
  fornecedor: Fornecedor (relação)
  fotos: IncFoto[]
}

IncFoto {
  id: string
  incId: string
  path: string
  filename: string
}
```

### 5. Módulo Fornecedores (Suppliers)

**Responsabilidades:**
- Cadastro de fornecedores
- Validação de CNPJ
- Gestão de dados de fornecedores
- Filtros e busca

**Estrutura:**
```typescript
Fornecedor {
  id: string
  cnpj: string (unique, 14 dígitos sem máscara)
  razaoSocial: string
  codigoLogix: string
  createdAt: DateTime
  updatedAt: DateTime
  incs: Inc[]
}
```

**Validações:**
- CNPJ: Exatamente 14 dígitos numéricos
- CNPJ único no sistema
- Razão Social obrigatória
- Código Logix obrigatório

**Frontend:**
- Máscara CNPJ: XX.XXX.XXX/XXXX-XX
- Armazenamento sem máscara no backend
- Formatação automática na exibição

**Relacionamento com INC:**
- Um fornecedor pode ter múltiplas INCs
- Uma INC pode ter um fornecedor (opcional)
- Relacionamento estabelecido via `fornecedorId` na tabela Inc

### 6. Módulo RNC (Relatório de Não Conformidade)

**Responsabilidades:**
- Geração de RNC a partir de INCs em análise
- Aprovação de INC por concessão
- Gerenciamento de reincidências
- Geração automática de PDF
- Numeração sequencial por fornecedor/ano
- Controle de prazos de resposta (7 dias)
- Histórico de aceites e recusas de planos de ação

**Estrutura:**
```typescript
Rnc {
  id: string
  numero: string (RNC:001/2025)
  sequencial: number (1, 2, 3...)
  ano: number (2025, 2026...)
  data: DateTime

  // Dados importados da INC
  ar: number
  nfeNumero: string
  um: string
  quantidadeRecebida: number
  quantidadeComDefeito: number
  descricaoNaoConformidade: string

  // Campos específicos RNC
  reincidente: boolean
  rncAnteriorId: string (opcional)
  status: string (RNC enviada, Aguardando resposta, Em análise, Concluída, RNC aceita)
  pdfPath: string (filename)
  planoAcaoPdfPath: string (filename do plano de ação do fornecedor)
  prazoInicio: DateTime (data de início do prazo de 7 dias)

  // Relacionamentos
  incId: string
  fornecedorId: string
  criadoPorId: string
  inc: Inc
  fornecedor: Fornecedor
  criadoPor: User
  rncAnterior: Rnc (opcional)
  rncsFilhas: Rnc[]
  historico: RncHistorico[]
  devolucao: Devolucao (opcional, 1:1)
}

RncHistorico {
  id: string
  rncId: string
  tipo: string (ACEITE ou RECUSA)
  data: DateTime
  pdfPath: string (caminho do PDF anexado)
  justificativa: string (obrigatória apenas para RECUSA)
  prazoInicio: DateTime (início do prazo de 7 dias)
  prazoFim: DateTime (fim do prazo = prazoInicio + 7 dias)
  criadoPorId: string

  // Relacionamentos
  rnc: Rnc
  criadoPor: User
}
```

**Status da INC:**
- `Em análise` → Estado inicial, aguarda decisão
- `RNC enviada` → RNC foi gerada (azul)
- `Aprovado por concessão` → Aprovado sem gerar RNC (verde)
- `Aprovado` → Aprovado normal
- `Rejeitado` → Rejeitado

**Fluxo de Geração de RNC:**
```
1. INC criada com status "Em análise"
2. Usuário acessa "Análise de INCs"
3. Opção 1: Gerar RNC
   - Importa dados da INC
   - Permite editar descrição
   - Marca reincidência (opcional)
   - Gera número sequencial (RNC:001/2025)
   - Cria PDF automaticamente
   - Atualiza INC para "RNC enviada"
4. Opção 2: Aprovar por Concessão
   - Atualiza INC para "Aprovado por concessão"
```

**Numeração Sequencial:**
- Formato: `RNC:XXX/YYYY`
- Sequencial independente por fornecedor
- Reseta a cada ano novo
- Exemplo: RNC:001/2025, RNC:002/2025

**Geração de PDF (PDFKit):**
- PDF gerado automaticamente ao criar RNC
- Inclui todos os dados da RNC e INC original
- Destaque visual para reincidências
- Armazenado em `/uploads`
- Download disponível na interface

**Reincidência:**
- Flag boolean `reincidente`
- Referência à RNC anterior do mesmo fornecedor
- Exibição destacada em vermelho no PDF
- Lista de RNCs filhas (reincidências posteriores)

### 7. Módulo de Notificações (Notifications)

**Responsabilidades:**
- Gerenciamento de notificações do sistema
- Configuração de tipos de notificação
- Preferências de notificação por usuário
- Prevenção de duplicatas
- Notificações de prazos e eventos críticos

**Estrutura:**
```typescript
NotificationType {
  id: string
  codigo: string (unique - ex: "rnc_prazo_2dias", "rnc_prazo_1dia")
  nome: string (ex: "RNC - Prazo 2 Dias")
  descricao: string
  modulo: string (ex: "rnc", "inc", "devolucao")
  canal: string (default: "sistema", futuro: "email")
  ativo: boolean (admin pode desativar globalmente)

  // Relacionamentos
  userSettings: UserNotificationSetting[]
  notifications: Notification[]
}

UserNotificationSetting {
  id: string
  userId: string
  notificationTypeId: string
  habilitado: boolean (default: true)

  // Relacionamentos
  user: User
  notificationType: NotificationType
}

Notification {
  id: string
  notificationTypeId: string
  userId: string
  titulo: string
  mensagem: string
  urgente: boolean (default: false)
  lida: boolean (default: false)
  dataLeitura: DateTime (opcional)

  // Contexto para navegação
  entityType: string (ex: "rnc", "inc")
  entityId: string

  // Prevenção de duplicatas
  uniqueKey: string (unique - formato: {codigo}_{entityId}_{timestamp})

  // Relacionamentos
  notificationType: NotificationType
  user: User
}
```

**Funcionalidades:**
- Notificações automáticas de prazos de RNC (2 dias, 1 dia, vencido)
- Sistema de deduplicação via uniqueKey
- Configuração por usuário de quais notificações receber
- Contador de notificações não lidas
- Navegação contextual para entidades relacionadas
- Suporte a notificações urgentes

**Permissões:**
- `notifications.read` - Ver notificações
- `notifications.manage_types` - Gerenciar tipos (admin)
- `notifications.manage_settings` - Configurar preferências de usuários (admin)

### 8. Módulo de Devolução (Devolucao)

**Responsabilidades:**
- Gerenciamento do processo de devolução de mercadorias
- Workflow em 4 etapas
- Upload de documentos (NF-e, comprovantes)
- Controle de status e rastreamento
- Compensação fiscal

**Estrutura:**
```typescript
enum DevolucaoStatus {
  RNC_ACEITA
  DEVOLUCAO_SOLICITADA
  NFE_EMITIDA
  DEVOLUCAO_COLETADA
  DEVOLUCAO_RECEBIDA
  FINALIZADO
}

enum MeioCompensacao {
  TRANSFERENCIA_DIRETA
  COMPENSACAO_PAGAMENTOS_FUTUROS
}

Devolucao {
  id: string
  rncId: string (unique - relacionamento 1:1 com RNC)

  // Etapa 1 - Solicitação de Faturamento
  arOrigem: number
  quantidadeTotal: number
  pesoKg: number
  motivo: string
  transportadora: string
  frete: string (FOB ou CIF)
  meioCompensacao: MeioCompensacao

  // Etapa 2 - Emissão da NF-e
  nfeNumero: string (opcional)
  nfePdfPath: string (opcional)
  nfeEmitidaPorId: string (opcional)
  nfeEmitidaEm: DateTime (opcional)

  // Etapa 3a - Confirmação de Coleta
  dataColeta: DateTime (opcional)
  coletaConfirmadaPorId: string (opcional)

  // Etapa 3b - Confirmação de Recebimento
  dataRecebimento: DateTime (opcional)
  recebimentoConfirmadoPorId: string (opcional)

  // Etapa 4 - Compensação Fiscal
  dataCompensacao: DateTime (opcional)
  comprovantePath: string (opcional - PDF ou imagem)
  compensacaoConfirmadaPorId: string (opcional)

  // Controle
  status: DevolucaoStatus (default: RNC_ACEITA)
  criadoPorId: string

  // Relacionamentos
  rnc: Rnc
  criadoPor: User
  nfeEmitidaPor: User (opcional)
  coletaConfirmadaPor: User (opcional)
  recebimentoConfirmadoPor: User (opcional)
  compensacaoConfirmadaPor: User (opcional)
}
```

**Workflow de Devolução:**
```
1. Criar Solicitação (a partir de RNC aceita)
   - Preencher dados: AR origem, quantidade, peso, transportadora, frete, compensação
   - Status: DEVOLUCAO_SOLICITADA

2. Emitir NF-e
   - Upload do PDF da NF-e
   - Informar número da NF-e
   - Registrar usuário e data de emissão
   - Status: NFE_EMITIDA

3a. Confirmar Coleta (para frete CIF)
   - Registrar data de coleta
   - Registrar usuário confirmante
   - Status: DEVOLUCAO_COLETADA

3b. Confirmar Recebimento (para frete FOB ou após coleta)
   - Registrar data de recebimento
   - Registrar usuário confirmante
   - Status: DEVOLUCAO_RECEBIDA

4. Confirmar Compensação Fiscal (finaliza)
   - Upload de comprovante (PDF ou imagem)
   - Registrar data de compensação
   - Registrar usuário confirmante
   - Status: FINALIZADO
```

**Validações:**
- Apenas RNCs com status "RNC aceita" podem gerar devoluções
- Relacionamento 1:1 entre RNC e Devolução (uma RNC pode ter no máximo uma devolução)
- Workflow sequencial: cada etapa só pode ser executada após a anterior
- Uploads de arquivos validados (PDF para NF-e, PDF/JPG/PNG para comprovante)

**Permissões:**
- `devolucao.create` - Criar solicitação de devolução
- `devolucao.read` - Visualizar devoluções
- `devolucao.emitir_nfe` - Emitir NF-e (etapa 2)
- `devolucao.confirmar_coleta` - Confirmar coleta (etapa 3a)
- `devolucao.confirmar_recebimento` - Confirmar recebimento (etapa 3b)
- `devolucao.confirmar_compensacao` - Confirmar compensação (etapa 4)
- `devolucao.delete` - Deletar devolução

## Fluxos Principais do Sistema

### Fluxo Completo: INC → RNC → Devolução

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CICLO COMPLETO                               │
└─────────────────────────────────────────────────────────────────────┘

1. CRIAÇÃO DE INC
   Usuario cria INC → Status: "Em análise"
   - Upload NF-e (PDF)
   - Upload Fotos (Imagens)
   - Dados: AR, quantidade, defeitos
   - Sistema notifica responsáveis

2. ANÁLISE DA INC
   Opção A: Aprovar por Concessão
     → INC Status: "Aprovado por concessão"
     → FIM DO FLUXO

   Opção B: Gerar RNC
     → INC Status: "RNC enviada"
     → Avança para etapa 3

3. PROCESSAMENTO DA RNC
   RNC criada → Status: "RNC enviada"
   - Número gerado: RNC:XXX/YYYY
   - PDF gerado automaticamente
   - Prazo iniciado: 7 dias
   - Sistema notifica responsáveis (2 dias antes, 1 dia antes, vencido)

   Fornecedor envia Plano de Ação:
     → Aceitar Plano → Status: "RNC aceita" → Avança para etapa 4
     → Recusar Plano → Adiciona ao histórico, reinicia prazo de 7 dias

4. PROCESSO DE DEVOLUÇÃO (se RNC aceita)

   Etapa 1: Criar Solicitação
     → Status: "DEVOLUCAO_SOLICITADA"
     → Dados: AR origem, quantidade, peso, transportadora, frete, compensação

   Etapa 2: Emitir NF-e
     → Upload PDF da NF-e
     → Status: "NFE_EMITIDA"
     → Sistema registra emissor e data

   Etapa 3: Confirmação de Movimentação
     3a. Confirmar Coleta (se frete CIF)
       → Status: "DEVOLUCAO_COLETADA"

     3b. Confirmar Recebimento
       → Status: "DEVOLUCAO_RECEBIDA"

   Etapa 4: Compensação Fiscal
     → Upload comprovante (PDF ou imagem)
     → Status: "FINALIZADO"
     → FIM DO FLUXO
```

### Fluxo de Notificações Automáticas

```
NotificationRunner (Cron Job)
  ↓
Verifica RNCs com prazos próximos
  ↓
Para cada RNC:
  - Calcula dias restantes
  - Verifica se já notificou (uniqueKey)
  - Consulta preferências do usuário
  ↓
Cria Notification se:
  - 2 dias restantes E usuário habilitou
  - 1 dia restante E usuário habilitou
  - Prazo vencido E usuário habilitou
  ↓
Notification salva no banco
  ↓
Frontend consulta via polling/websocket
  ↓
Exibe badge e lista de notificações
```

### Criação de INC com Upload

```
Frontend (React)
  ↓
FormData {
  ar, nfeNumero, um, ...
  nfeFile: File (PDF)
  fotos: File[] (Imagens)
}
  ↓
POST /api/inc
  ↓
Backend (NestJS)
  ↓
Multer Middleware
  - Salva arquivos em /uploads
  - Gera nomes únicos (UUID)
  ↓
IncService
  - Valida dados
  - Cria registro no banco
  - Associa arquivos
  ↓
Prisma ORM
  ↓
PostgreSQL
```

## Padrões de Arquitetura

### Backend (NestJS)

**1. Modularização**
```
modules/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   ├── guards/
│   └── decorators/
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
├── permissions/
│   ├── permissions.module.ts
│   ├── permissions.controller.ts
│   ├── permissions.service.ts
│   └── dto/
├── inc/
│   ├── inc.module.ts
│   ├── inc.controller.ts
│   ├── inc.service.ts
│   └── dto/
├── fornecedores/
│   ├── fornecedores.module.ts
│   ├── fornecedores.controller.ts
│   ├── fornecedores.service.ts
│   └── dto/
├── rnc/
│   ├── rnc.module.ts
│   ├── rnc.controller.ts
│   ├── rnc.service.ts
│   └── dto/
├── notifications/
│   ├── notifications.module.ts
│   ├── notifications.controller.ts
│   ├── notifications.service.ts
│   ├── notification-runner.service.ts
│   ├── dto/
│   ├── interfaces/
│   └── modules/ (módulos de notificação específicos)
└── devolucao/
    ├── devolucao.module.ts
    ├── devolucao.controller.ts
    ├── devolucao.service.ts
    └── dto/
```

**2. DTOs (Data Transfer Objects)**
- Validação com `class-validator`
- Transformação com `class-transformer`
- Documentação automática com Swagger

**3. Guards**
- `JwtAuthGuard` - Valida JWT
- `PermissionsGuard` - Valida permissões
- `LocalAuthGuard` - Valida login

**4. Interceptors**
- Transformação de respostas
- Logging de requisições
- Tratamento de erros

### Frontend (React)

**1. Componentização**
```
components/
├── layouts/
│   ├── MainLayout.tsx
│   ├── Sidebar.tsx
│   └── Header.tsx
└── PrivateRoute.tsx

pages/
├── LoginPage.tsx
├── DashboardPage.tsx
├── users/
│   ├── UsersPage.tsx
│   ├── UserModal.tsx
│   ├── PermissionsModal.tsx
│   └── NotificationSettingsModal.tsx
├── inc/
│   ├── IncListPage.tsx
│   ├── IncCreatePage.tsx
│   ├── IncEditPage.tsx
│   └── IncViewPage.tsx
├── fornecedores/
│   ├── FornecedoresListPage.tsx
│   ├── FornecedorCreatePage.tsx
│   ├── FornecedorEditPage.tsx
│   ├── FornecedorViewPage.tsx
│   └── FornecedorForm.tsx
├── rnc/
│   ├── RncAnalysisPage.tsx
│   ├── RncCreatePage.tsx
│   ├── RncListPage.tsx
│   └── RncViewPage.tsx
├── notifications/
│   └── NotificationsPage.tsx
└── devolucao/
    ├── DevolucaoListPage.tsx
    ├── DevolucaoCreatePage.tsx
    └── DevolucaoViewPage.tsx
```

**2. State Management (Zustand)**
```typescript
// Global State
authStore {
  user: User | null
  isAuthenticated: boolean
  login()
  logout()
  hasPermission()
}
```

**3. API Client (Axios)**
```typescript
// Interceptors
- Request: Adiciona JWT automaticamente
- Response: Renova token se expirado
```

**4. Roteamento (React Router)**
```typescript
<Routes>
  <Route path="/login" />
  <Route path="/" element={<PrivateRoute />}>
    <Route path="dashboard" />
    <Route path="users" />
    <Route path="inc" />
  </Route>
</Routes>
```

## Banco de Dados

### Schema Prisma

```prisma
User ──┬─→ UserPermission ──→ Permission
       ├─→ RefreshToken
       ├─→ UserNotificationSetting ──→ NotificationType
       ├─→ Notification ──→ NotificationType
       ├─→ Inc ──┬─→ IncFoto
       │         ├─→ Fornecedor
       │         └─→ Rnc
       ├─→ Rnc ──┬─→ Inc
       │         ├─→ Fornecedor
       │         ├─→ RncAnterior (self-relation)
       │         ├─→ RncHistorico
       │         └─→ Devolucao (1:1)
       ├─→ RncHistorico ──→ Rnc
       └─→ Devolucao ──┬─→ Rnc (1:1)
                       └─→ User (múltiplas relações: criador, emissor NFe, etc.)

Fornecedor ──┬─→ Inc (1:N)
             └─→ Rnc (1:N)

NotificationType ──┬─→ UserNotificationSetting (1:N)
                   └─→ Notification (1:N)
```

**Relacionamentos Detalhados:**

**User:**
- User → UserPermission (1:N)
- User → RefreshToken (1:N)
- User → UserNotificationSetting (1:N)
- User → Notification (1:N)
- User → Inc (1:N, criadoPor)
- User → Rnc (1:N, criadoPor)
- User → RncHistorico (1:N, criadoPor)
- User → Devolucao (1:N cada, criadoPor/nfeEmitidaPor/coletaConfirmadaPor/recebimentoConfirmadoPor/compensacaoConfirmadaPor)

**Permission:**
- Permission → UserPermission (1:N)

**Inc:**
- Inc → IncFoto (1:N)
- Inc → Fornecedor (N:1, obrigatório)
- Inc → Rnc (1:N)
- Inc → User (N:1, criadoPor)

**Rnc:**
- Rnc → Inc (N:1, obrigatório)
- Rnc → Fornecedor (N:1, obrigatório)
- Rnc → User (N:1, criadoPor)
- Rnc → Rnc (self-relation, rncAnterior opcional)
- Rnc → RncHistorico (1:N)
- Rnc → Devolucao (1:1, opcional)

**Devolucao:**
- Devolucao → Rnc (1:1, obrigatório)
- Devolucao → User (N:1, criadoPor)
- Devolucao → User (N:1, nfeEmitidaPor, opcional)
- Devolucao → User (N:1, coletaConfirmadaPor, opcional)
- Devolucao → User (N:1, recebimentoConfirmadoPor, opcional)
- Devolucao → User (N:1, compensacaoConfirmadaPor, opcional)

**NotificationType:**
- NotificationType → UserNotificationSetting (1:N)
- NotificationType → Notification (1:N)

**Fornecedor:**
- Fornecedor → Inc (1:N)
- Fornecedor → Rnc (1:N)

**Índices:**
- User.email (unique)
- Permission.code (unique)
- RefreshToken.token (unique)
- Fornecedor.cnpj (unique)
- Rnc.numero (unique)
- Rnc.[fornecedorId, sequencial, ano] (unique composite)
- NotificationType.codigo (unique)
- UserNotificationSetting.[userId, notificationTypeId] (unique composite)
- Notification.uniqueKey (unique)
- Notification.[userId, lida] (index)
- Notification.createdAt (index)
- Devolucao.rncId (unique)

## Segurança

### Camadas de Segurança

1. **Autenticação** - JWT com assinatura
2. **Autorização** - RBAC com permissões granulares
3. **Validação** - DTOs com class-validator
4. **CORS** - Configurado para frontend específico
5. **Hash** - bcrypt para senhas
6. **Sanitização** - Remoção de campos sensíveis

### Boas Práticas Implementadas

- ✅ Tokens com expiração
- ✅ Refresh tokens revogáveis
- ✅ Senhas nunca retornadas em APIs
- ✅ Validação em todas as entradas
- ✅ Guards em todas as rotas protegidas
- ✅ HTTPS recomendado em produção

## Escalabilidade

### Preparado para:

1. **Múltiplos Módulos** - Arquitetura modular
2. **Caching** - Fácil adicionar Redis
3. **Background Jobs** - Suporte a Bull/BullMQ
4. **Microservices** - Fácil separar módulos
5. **Load Balancing** - Stateless design
6. **Horizontal Scaling** - Tokens no banco

## Performance

### Otimizações Implementadas:

- ✅ Lazy loading de módulos React
- ✅ Conexão pool PostgreSQL
- ✅ Índices no banco de dados
- ✅ Validação eficiente com DTOs
- ✅ Code splitting no frontend

### Recomendações para Produção:

- [ ] Implementar cache (Redis)
- [ ] Adicionar CDN para assets
- [ ] Configurar gzip/brotli
- [ ] Implementar rate limiting
- [ ] Adicionar monitoring (Sentry)
- [ ] Configurar logs estruturados

## Testes

### Estratégia Recomendada:

**Backend:**
- Unit tests (Services)
- Integration tests (Controllers)
- E2E tests (API completa)

**Frontend:**
- Unit tests (Components)
- Integration tests (Pages)
- E2E tests (User flows)

**Ferramentas:**
- Jest (Unit/Integration)
- Cypress/Playwright (E2E)
- Supertest (API testing)

## CI/CD

### Pipeline Recomendado:

```yaml
1. Install
2. Lint
3. Test
4. Build
5. Deploy
   - Backend → Cloud (AWS/GCP/Azure)
   - Frontend → CDN (Vercel/Netlify)
   - Database → Managed PostgreSQL
```

## Monitoramento

### Métricas Importantes:

- Request rate
- Error rate
- Response time
- Database query time
- Token refresh rate
- Failed login attempts

### Ferramentas Sugeridas:

- **APM**: New Relic, Datadog
- **Logs**: Winston + ELK Stack
- **Errors**: Sentry
- **Uptime**: Pingdom, UptimeRobot
