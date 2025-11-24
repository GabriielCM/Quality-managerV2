# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Initial Setup
```bash
# Install all dependencies for both backend and frontend
npm run install:all

# Backend database setup (required before first run)
cd backend
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed initial data (admin user and permissions)
```

### Development
```bash
# Start backend (Terminal 1)
npm run dev:backend      # Runs on http://localhost:3000

# Start frontend (Terminal 2)
npm run dev:frontend     # Runs on http://localhost:5173

# View Swagger API documentation
# Navigate to http://localhost:3000/api/docs (after backend is running)
```

### Database Operations
```bash
# From project root:
npm run prisma:studio    # Open Prisma Studio GUI for database inspection
npm run prisma:generate  # Regenerate Prisma Client after schema changes
npm run prisma:migrate   # Create and apply new migrations

# From backend directory:
npx prisma migrate dev --name <migration-name>  # Create new migration
npx prisma db push       # Push schema changes without creating migration (dev only)
```

### Build
```bash
npm run build:backend    # Build backend for production
npm run build:frontend   # Build frontend for production
```

## Architecture Overview

### Authentication Flow
The system uses a dual-token JWT authentication strategy:

1. **Access Token** (15min lifetime): Included in `Authorization: Bearer <token>` header for all API requests
2. **Refresh Token** (7d lifetime): Stored in database, used to obtain new access tokens when they expire

**Automatic Token Refresh**: The frontend Axios interceptor (`frontend/src/lib/api.ts`) automatically catches 401 errors and attempts to refresh the token using the `/api/auth/refresh` endpoint before retrying the original request.

**Token Storage**: Both tokens are stored in localStorage. Refresh tokens are also persisted in the database (`refresh_tokens` table) to enable server-side revocation during logout.

### Permission System (RBAC)

The system uses a granular Role-Based Access Control model:

**Permission Format**: `{module}.{action}` (e.g., `inc.create`, `users.delete`)

**Special Permission**: `admin.all` - Bypasses all permission checks (see `backend/src/modules/auth/guards/permissions.guard.ts`)

**Implementation**:
- Backend uses NestJS Guards: `@UseGuards(JwtAuthGuard, PermissionsGuard)` + `@Permissions('inc.create', 'admin.all')`
- Frontend uses Zustand store methods: `hasPermission(code)` and `hasAnyPermission(codes[])`
- Sidebar menu items automatically filter based on user permissions

**Default Permissions** (see `backend/prisma/seed.ts`):
- `admin.all` - Full system access
- `inc.{create|read|update|delete}` - INC module operations
- `rnc.{create|read|update|delete}` - RNC module operations
- `rnc.approve` - Approve INC by concession
- `fornecedores.{create|read|update|delete}` - Fornecedores module operations
- `users.{create|read|update|delete|manage_permissions}` - User management

### Module Structure

The system follows a consistent modular pattern for both backend and frontend:

**Backend Module** (`backend/src/modules/{module}/`):
```
{module}/
├── {module}.module.ts       # NestJS module definition
├── {module}.controller.ts   # API endpoints with Guards
├── {module}.service.ts      # Business logic
└── dto/                     # Data Transfer Objects with validation
    ├── create-{module}.dto.ts
    └── update-{module}.dto.ts
```

**Frontend Module** (`frontend/src/pages/{module}/`):
```
{module}/
├── {Module}ListPage.tsx     # List/table view
├── {Module}CreatePage.tsx   # Create form
├── {Module}EditPage.tsx     # Edit form
└── {Module}ViewPage.tsx     # Detail view
```

### File Upload Architecture

The INC module demonstrates the file upload pattern:

**Backend** (`backend/src/modules/inc/inc.controller.ts`):
- Uses Multer interceptors: `@UseInterceptors(FileFieldsInterceptor([...]))`
- Files are stored in `backend/uploads/` directory
- Filenames are UUIDs to prevent conflicts
- File metadata is stored in database (e.g., `Inc.nfeAnexo`, `IncFoto.path`)

**Frontend**:
- Uses FormData to send multipart/form-data requests
- Files are appended with `formData.append('nfeFile', file)` and `formData.append('fotos', file)` for arrays
- Content-Type header is set to `multipart/form-data`

**Cleanup**: Deleting an INC or photo should also delete the physical file from `uploads/` directory (see `inc.service.ts`)

## Specialized Agents

Q-Manager has specialized agents that automate common development tasks. **Always prefer using these agents over manual implementation** for consistency and speed.

### Available Agents

#### 1. Module Generator Agent (`module-generator`)

**Use for**: Creating new business entity modules (Products, Suppliers, Orders, etc.)

**What it does**:
- Generates complete full-stack CRUD module (backend + frontend)
- Creates Prisma model and migration
- Generates DTOs with validation
- Creates NestJS controller and service with guards
- Adds permissions to seed
- Creates React pages (List, Create, Edit, View)
- Adds routes and sidebar menu item
- Generates unit tests

**Example**:
```typescript
// Just describe your module requirements:
"Create a Products module with fields: code (string, unique), description (string),
price (float), and stock (integer, default 0)"

// The agent generates everything in ~5 minutes vs 2-3 hours manually
```

**When to use**: Every time you need a new module. This is the **preferred method**.

#### 2. Test Generator Agent (`test-generator`)

**Use for**: Generating comprehensive test suites

**What it does**:
- Creates unit tests for services
- Generates integration tests for controllers
- Creates E2E tests for API flows
- Generates React component tests
- Creates test fixtures and mocks
- Ensures 80%+ coverage

**Example**:
```typescript
// After implementing a feature:
"I've finished implementing the OrderService. Generate comprehensive tests."

// The agent creates complete test suite with all edge cases
```

**When to use**: After implementing any new feature, before deployment, when coverage is low.

#### 3. API Documentation Agent (`api-documenter`)

**Use for**: Maintaining API documentation

**What it does**:
- Parses Swagger decorators
- Generates comprehensive endpoint docs
- Creates OpenAPI 3.0 spec
- Generates Postman/Insomnia collections
- Detects documentation drift
- Validates all endpoints are documented

**Example**:
```typescript
// Before release:
"We're releasing v1.2 tomorrow. Update all API documentation."

// The agent scans codebase and generates complete, up-to-date docs
```

**When to use**: After API changes, before releases, for external integrations.

---

## Adding New Modules

### Recommended: Use Module Generator Agent ⭐

**This is the preferred method** for creating new modules:

1. Describe your module requirements to Claude
2. The `module-generator` agent will create everything automatically
3. Review and test the generated code
4. Run migrations and seed

**Benefits**:
- 95% faster (5 min vs 2-3 hours)
- Consistent with project patterns
- Includes tests automatically
- Zero mistakes in boilerplate

### Manual Method (For Reference Only)

If you need to create a module manually for learning or special cases:

#### 1. Backend Module Creation

```bash
cd backend
npx nest g module modules/{module-name}
npx nest g controller modules/{module-name}
npx nest g service modules/{module-name}
```

### 2. Update Prisma Schema

Add model in `backend/prisma/schema.prisma`:
```prisma
model NewModule {
  id        String   @id @default(uuid())
  // ... fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("new_modules")
}
```

Then run:
```bash
npx prisma migrate dev --name add_new_module
npx prisma generate
```

### 3. Add Permissions

Edit `backend/prisma/seed.ts` to include new permissions:
```typescript
{ code: 'newmodule.create', name: 'Criar NewModule', module: 'newmodule' },
{ code: 'newmodule.read', name: 'Visualizar NewModule', module: 'newmodule' },
// ... etc
```

Re-run seed: `npm run prisma:seed`

### 4. Implement Backend with Guards

In controller:
```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('newmodule.read', 'admin.all')
@Get()
findAll() { ... }
```

### 5. Frontend Pages and Routes

Create pages in `frontend/src/pages/newmodule/` and add routes in `frontend/src/App.tsx`:
```typescript
<Route path="newmodule">
  <Route index element={<NewModuleListPage />} />
  <Route path="create" element={<NewModuleCreatePage />} />
  {/* ... */}
</Route>
```

### 6. Update Sidebar Menu

Edit `frontend/src/components/layouts/Sidebar.tsx`:
```typescript
const menuItems = [
  // ...
  {
    name: 'New Module',
    href: '/newmodule',
    icon: SomeIcon,
    permissions: ['newmodule.read', 'admin.all']
  },
];
```

## Key Implementation Patterns

### DTOs with Validation

All backend endpoints use DTOs with class-validator decorators:
```typescript
export class CreateIncDto {
  @IsInt()
  ar: number;

  @IsString()
  @IsNotEmpty()
  nfeNumero: string;

  @IsNumber()
  quantidadeRecebida: number;
  // ...
}
```

Validation is automatically enforced via global ValidationPipe in `backend/src/main.ts`.

### Frontend State Management

Uses Zustand for global state (`frontend/src/stores/`):
- `authStore.ts` - Authentication state, user info, permissions
- Each store exposes actions as methods (e.g., `login()`, `logout()`, `hasPermission()`)

Component usage:
```typescript
const { user, hasPermission } = useAuthStore();
```

### API Client Interceptors

The Axios instance (`frontend/src/lib/api.ts`) has two critical interceptors:

**Request Interceptor**: Automatically adds JWT to all requests
**Response Interceptor**: Handles 401 errors by refreshing token and retrying request

This means component code can make API calls without manually handling token expiration.

## Database Relationships

```
User ──┬─→ UserPermission ──→ Permission
       ├─→ RefreshToken
       └─→ Inc ──→ IncFoto
```

**Cascade Deletes**:
- Deleting a User removes all UserPermissions, RefreshTokens, and associated Incs
- Deleting an Inc removes all IncFotos
- Deleting a Permission removes all UserPermissions

## Environment Configuration

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/qmanager?schema=public"
JWT_SECRET="change-in-production"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="change-in-production"
JWT_REFRESH_EXPIRATION="7d"
PORT=3000
FRONTEND_URL="http://localhost:5173"
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760  # 10MB
```

**Frontend** (`frontend/src/lib/api.ts`):
- API base URL is hardcoded to `/api` (proxied by Vite to backend)
- No environment variables required for development

## Testing Credentials

After running `npm run prisma:seed`:

**Admin** (all permissions):
- Email: `admin@qmanager.com`
- Password: `admin123`

**Standard User** (limited INC permissions):
- Email: `user@qmanager.com`
- Password: `admin123`

## Common Patterns to Follow

### Backend Controller Pattern
```typescript
@Controller('module')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ModuleController {
  @Get()
  @Permissions('module.read', 'admin.all')
  findAll() { ... }

  @Post()
  @Permissions('module.create', 'admin.all')
  create(@Body() dto: CreateDto, @Req() req) {
    const userId = req.user.id;  // Get current user from JWT
    // ...
  }
}
```

### Frontend Protected Route Pattern
```typescript
// In component:
const { hasPermission } = useAuthStore();

if (!hasPermission('module.create')) {
  return <div>Access Denied</div>;
}
```

### File Upload Pattern
```typescript
// Frontend:
const formData = new FormData();
formData.append('field', value);
formData.append('file', fileObject);
await api.post('/endpoint', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Backend:
@Post()
@UseInterceptors(FileInterceptor('file'))
create(@UploadedFile() file: Express.Multer.File, @Body() dto: CreateDto) {
  // file.filename, file.path, file.mimetype available
}
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `backend/.env`
- Ensure database exists: `createdb qmanager`

### Prisma Client Out of Sync
After schema changes, always run:
```bash
npx prisma generate
npx prisma migrate dev
```

### Token Refresh Failures
- Clear localStorage in browser DevTools
- Verify refresh token exists in database
- Check JWT secrets match between `.env` and database tokens

### CORS Errors
- Verify `FRONTEND_URL` in `backend/.env` matches frontend URL
- Check CORS configuration in `backend/src/main.ts`

### File Upload Failures
- Ensure `uploads/` directory exists in backend
- Check `MAX_FILE_SIZE` in `.env`
- Verify `UPLOAD_PATH` is writable

## Development Workflow Best Practices

### For New Features
1. **Use module-generator agent** to scaffold the module
2. **Implement business logic** specific to your feature
3. **Use test-generator agent** to create comprehensive tests
4. **Use api-documenter agent** to update documentation
5. Test manually and review generated code
6. Commit changes

### For Bug Fixes
1. **Use test-generator agent** to create regression tests first
2. Fix the bug
3. Verify tests pass
4. Commit fix with tests

### For API Changes
1. Implement the changes
2. **Use test-generator agent** to update/create tests
3. **Use api-documenter agent** to update docs
4. Review Swagger documentation at `/api/docs`
5. Commit changes

### Before Releases
1. **Use test-generator agent** to ensure coverage >80%
2. **Use api-documenter agent** to validate all docs current
3. Run full test suite
4. Review changelog
5. Deploy

## Important Constraints

- **Never store sensitive data in Git**: The `.env` file is gitignored
- **Password Security**: Always use bcrypt for password hashing (salt rounds: 10)
- **Permission Checks**: All protected routes must use both `JwtAuthGuard` and `PermissionsGuard`
- **File Cleanup**: When deleting records with file uploads, ensure physical files are also deleted
- **Token Expiration**: Access tokens expire in 15 minutes by design for security
- **Use Specialized Agents**: Always prefer agents over manual implementation for modules, tests, and documentation
