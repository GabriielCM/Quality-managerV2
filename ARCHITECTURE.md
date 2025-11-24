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
  status: string (RNC enviada, Aguardando resposta, Em análise, Concluída)
  pdfPath: string (filename)

  // Relacionamentos
  incId: string
  fornecedorId: string
  criadoPorId: string
  inc: Inc
  fornecedor: Fornecedor
  criadoPor: User
  rncAnterior: Rnc (opcional)
  rncsFilhas: Rnc[]
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

## Fluxo de Dados

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
└── rnc/
    ├── rnc.module.ts
    ├── rnc.controller.ts
    ├── rnc.service.ts
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
│   └── PermissionsModal.tsx
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
└── rnc/
    ├── RncAnalysisPage.tsx
    ├── RncCreatePage.tsx
    ├── RncListPage.tsx
    └── RncViewPage.tsx
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
       ├─→ Inc ──┬─→ IncFoto
       │         ├─→ Fornecedor
       │         └─→ Rnc
       └─→ Rnc ──┬─→ Inc
                 ├─→ Fornecedor
                 └─→ RncAnterior (self-relation)

Fornecedor ──┬─→ Inc (1:N)
             └─→ Rnc (1:N)
```

**Relacionamentos:**
- User → UserPermission (1:N)
- Permission → UserPermission (1:N)
- User → RefreshToken (1:N)
- User → Inc (1:N)
- User → Rnc (1:N, criadoPor)
- Inc → IncFoto (1:N)
- Inc → Fornecedor (N:1)
- Inc → Rnc (1:N)
- Rnc → Inc (N:1, obrigatório)
- Rnc → Fornecedor (N:1, obrigatório)
- Rnc → User (N:1, criadoPor)
- Rnc → Rnc (self-relation, rncAnterior opcional)
- Fornecedor → Inc (1:N)
- Fornecedor → Rnc (1:N)

**Índices:**
- Email (unique)
- Permission Code (unique)
- RefreshToken Token (unique)
- CNPJ (unique)
- RNC numero (unique)
- RNC [fornecedorId, sequencial, ano] (unique composite)

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
