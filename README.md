# Q-Manager

Sistema de Gestão Modular desenvolvido com Node.js (NestJS) e React.

## Características

- Sistema de autenticação completo com JWT e Refresh Token
- Controle de acesso baseado em permissões (RBAC)
- Arquitetura modular e escalável
- Upload de arquivos (PDFs e imagens)
- Interface responsiva com Tailwind CSS
- Documentação automática com Swagger
- Banco de dados PostgreSQL com Prisma ORM

## Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **Prisma** - ORM para PostgreSQL
- **JWT** - Autenticação
- **Passport** - Estratégias de autenticação
- **Multer** - Upload de arquivos
- **Swagger** - Documentação da API
- **bcrypt** - Hash de senhas

### Frontend
- **React** - Biblioteca UI
- **Vite** - Build tool
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **React Router** - Roteamento
- **React Hook Form** - Formulários
- **React Hot Toast** - Notificações

## Estrutura do Projeto

```
Q-manager/
├── backend/                 # API NestJS
│   ├── prisma/             # Schema e migrations do banco
│   ├── src/
│   │   ├── modules/        # Módulos da aplicação
│   │   │   ├── auth/       # Autenticação e autorização
│   │   │   ├── users/      # Gerenciamento de usuários
│   │   │   ├── permissions/# Gerenciamento de permissões
│   │   │   └── inc/        # Módulo de INC
│   │   ├── prisma/         # Serviço Prisma
│   │   ├── app.module.ts   # Módulo principal
│   │   └── main.ts         # Entry point
│   └── uploads/            # Arquivos enviados
│
└── frontend/               # Aplicação React
    ├── src/
    │   ├── components/     # Componentes reutilizáveis
    │   ├── pages/          # Páginas da aplicação
    │   ├── stores/         # Estado global (Zustand)
    │   ├── lib/            # Utilitários e configurações
    │   ├── App.tsx         # Componente principal
    │   └── main.tsx        # Entry point
    └── public/
```

## Pré-requisitos

- Node.js (versão 18 ou superior)
- PostgreSQL (versão 14 ou superior)
- npm ou yarn

## Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd Q-manager
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de exemplo de variáveis de ambiente
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/qmanager?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_REFRESH_EXPIRATION="7d"

# App
PORT=3000
NODE_ENV=development

# Upload
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760
```

### 3. Configurar Banco de Dados

```bash
# Criar as tabelas no banco de dados
npm run prisma:migrate

# Gerar o Prisma Client
npm run prisma:generate

# Popular o banco com dados iniciais (usuários e permissões)
npm run prisma:seed
```

### 4. Configurar Frontend

```bash
cd ../frontend

# Instalar dependências
npm install
```

## Executando a Aplicação

### Backend (Terminal 1)

```bash
cd backend

# Modo desenvolvimento
npm run start:dev

# Ou modo produção
npm run build
npm run start:prod
```

O backend estará disponível em: `http://localhost:3000`
Documentação Swagger: `http://localhost:3000/api/docs`

### Frontend (Terminal 2)

```bash
cd frontend

# Modo desenvolvimento
npm run dev

# Ou build para produção
npm run build
npm run preview
```

O frontend estará disponível em: `http://localhost:5173`

## Credenciais de Teste

Após executar o seed do banco de dados, você terá os seguintes usuários:

**Administrador (todas as permissões):**
- Email: `admin@qmanager.com`
- Senha: `admin123`

**Usuário Comum (permissões limitadas):**
- Email: `user@qmanager.com`
- Senha: `admin123`

## Módulos do Sistema

### 1. Autenticação
- Login com JWT
- Refresh token automático
- Logout com revogação de tokens

### 2. Usuários
- CRUD completo de usuários
- Gerenciamento de permissões por usuário
- Hash de senhas com bcrypt

### 3. Permissões (RBAC)
- Sistema de permissões granulares
- Agrupamento por módulos
- Permissão especial "admin.all" (acesso total)

### 4. INC (Incidências)
- Cadastro de incidências com:
  - AR (número)
  - NF-e (número + anexo PDF)
  - Unidade de medida
  - Quantidade recebida e com defeito
  - Status (Em análise, Aprovado, Rejeitado)
  - Múltiplas fotos
- Filtros por status, AR e data
- Visualização detalhada
- Edição e exclusão

## Estrutura de Permissões

### Permissões de INC
- `inc.create` - Criar novos INCs
- `inc.read` - Visualizar INCs
- `inc.update` - Editar INCs
- `inc.delete` - Deletar INCs

### Permissões de Usuários
- `users.create` - Criar usuários
- `users.read` - Visualizar usuários
- `users.update` - Editar usuários
- `users.delete` - Deletar usuários
- `users.manage_permissions` - Gerenciar permissões de usuários

### Permissão Especial
- `admin.all` - Acesso total ao sistema (bypass de todas as verificações)

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout

### Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Buscar usuário
- `POST /api/users` - Criar usuário
- `PATCH /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário
- `POST /api/users/:id/permissions` - Atribuir permissões

### Permissões
- `GET /api/permissions` - Listar permissões
- `GET /api/permissions/modules` - Listar módulos
- `GET /api/permissions/module/:module` - Permissões por módulo

### INC
- `GET /api/inc` - Listar INCs (com filtros)
- `GET /api/inc/:id` - Buscar INC
- `POST /api/inc` - Criar INC (multipart/form-data)
- `PATCH /api/inc/:id` - Atualizar INC (multipart/form-data)
- `DELETE /api/inc/:id` - Deletar INC
- `DELETE /api/inc/:incId/fotos/:fotoId` - Deletar foto

## Adicionando Novos Módulos

O sistema foi projetado para ser modular. Para adicionar um novo módulo:

### Backend

1. Crie um novo módulo NestJS:
```bash
cd backend
nest g module modules/nome-modulo
nest g controller modules/nome-modulo
nest g service modules/nome-modulo
```

2. Adicione o modelo no Prisma (`backend/prisma/schema.prisma`)

3. Crie as permissões no seed (`backend/prisma/seed.ts`)

4. Implemente o CRUD com guards de permissão

### Frontend

1. Crie as páginas em `frontend/src/pages/nome-modulo/`

2. Adicione as rotas em `frontend/src/App.tsx`

3. Adicione o item no menu em `frontend/src/components/layouts/Sidebar.tsx`

## Scripts Úteis

### Backend
```bash
npm run start:dev       # Inicia em modo desenvolvimento
npm run build           # Build para produção
npm run prisma:generate # Gera o Prisma Client
npm run prisma:migrate  # Executa migrations
npm run prisma:studio   # Interface visual do banco
npm run prisma:seed     # Popula banco com dados iniciais
```

### Frontend
```bash
npm run dev     # Inicia em modo desenvolvimento
npm run build   # Build para produção
npm run preview # Preview da build
npm run lint    # Executa o linter
```

## Boas Práticas Implementadas

- ✅ **Clean Architecture** - Separação de responsabilidades
- ✅ **SOLID Principles** - Código manutenível e escalável
- ✅ **DTOs** - Validação de dados com class-validator
- ✅ **Guards** - Proteção de rotas com autenticação e permissões
- ✅ **TypeScript** - Tipagem estática em todo o projeto
- ✅ **Modularização** - Fácil adição de novos módulos
- ✅ **Documentação** - Swagger para API
- ✅ **Segurança** - Hash de senhas, JWT, validações

## Segurança

- Senhas são armazenadas com hash bcrypt
- Tokens JWT com expiração configurável
- Refresh tokens armazenados no banco para revogação
- Validação de entrada em todos os endpoints
- Guards de autenticação e autorização
- CORS configurado

## Próximos Passos

Para expandir o sistema, você pode:

1. Adicionar mais módulos conforme necessário
2. Implementar auditoria de ações
3. Adicionar relatórios e dashboards
4. Implementar notificações em tempo real
5. Adicionar testes unitários e e2e
6. Configurar CI/CD
7. Implementar cache com Redis
8. Adicionar paginação nas listagens

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

## Licença

MIT
