# Guia Rápido - Q-Manager

## Instalação Rápida

### 1. Instalar Dependências

```bash
# Backend
cd backend
npm install

# Frontend (em outro terminal)
cd frontend
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cd backend
cp .env.example .env
```

Edite `backend/.env` e configure sua DATABASE_URL:
```
DATABASE_URL="postgresql://user:password@localhost:5432/qmanager?schema=public"
```

### 3. Configurar Banco de Dados

```bash
cd backend

# Criar as tabelas
npm run prisma:migrate

# Gerar Prisma Client
npm run prisma:generate

# Popular com dados iniciais
npm run prisma:seed
```

### 4. Executar a Aplicação

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Acessar o Sistema

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Swagger Docs: http://localhost:3000/api/docs

### 6. Login

**Administrador:**
- Email: `admin@qmanager.com`
- Senha: `admin123`

**Usuário Comum:**
- Email: `user@qmanager.com`
- Senha: `admin123`

## Comandos Úteis

### Visualizar Banco de Dados
```bash
cd backend
npm run prisma:studio
```

### Resetar Banco de Dados
```bash
cd backend
npx prisma migrate reset
npm run prisma:seed
```

### Build para Produção

**Backend:**
```bash
cd backend
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Estrutura de Pastas

```
Q-manager/
├── backend/          # API NestJS
│   ├── prisma/       # Schema do banco
│   ├── src/          # Código-fonte
│   └── uploads/      # Arquivos enviados
│
└── frontend/         # React App
    └── src/          # Código-fonte
```

## Principais Funcionalidades

1. **Login e Autenticação** - JWT com refresh token
2. **Gestão de Usuários** - CRUD completo com permissões
3. **Gestão de Permissões** - Sistema RBAC granular
4. **Módulo INC** - Cadastro de incidências com upload de arquivos

## Próximos Passos

1. Altere as senhas padrão
2. Configure as variáveis de ambiente para produção
3. Adicione novos módulos conforme necessário
4. Customize as permissões conforme sua necessidade

## Problemas Comuns

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`

### Erro "Cannot find module"
- Execute `npm install` novamente
- Para o backend, execute `npm run prisma:generate`

### Erro de permissão
- Faça login com o usuário admin
- Verifique as permissões do usuário na tela de gestão

## Suporte

Consulte o README.md completo para mais detalhes.
