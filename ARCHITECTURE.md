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
  status: string (Em análise, Aprovado, Rejeitado)
  criadoPorId: string
  fotos: IncFoto[]
}

IncFoto {
  id: string
  incId: string
  path: string
  filename: string
}
```

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
└── inc/
    ├── inc.module.ts
    ├── inc.controller.ts
    ├── inc.service.ts
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
└── inc/
    ├── IncListPage.tsx
    ├── IncCreatePage.tsx
    ├── IncEditPage.tsx
    └── IncViewPage.tsx
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
       └─→ RefreshToken
       └─→ Inc ──→ IncFoto
```

**Relacionamentos:**
- User → UserPermission (1:N)
- Permission → UserPermission (1:N)
- User → RefreshToken (1:N)
- User → Inc (1:N)
- Inc → IncFoto (1:N)

**Índices:**
- Email (unique)
- Permission Code (unique)
- RefreshToken Token (unique)

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
