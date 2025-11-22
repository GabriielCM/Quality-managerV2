# Q-Manager: Recommended Sub-Agents

This document outlines specialized sub-agents that should be created to accelerate development and maintain code quality in the Q-Manager project.

> **Analysis Date**: 2025-01-22
> **Based on**: Comprehensive codebase analysis
> **Purpose**: Automate repetitive tasks, enforce best practices, and improve developer productivity

---

## Priority 1: Immediate High-Value Agents

### 1. Module Generator Agent (`module-generator`)

**Purpose**: Automate the creation of complete full-stack CRUD modules following Q-Manager patterns.

**When to Use**:
- Creating a new business entity module (e.g., Products, Suppliers, Audits)
- Need to scaffold both backend and frontend code
- Want to ensure consistency with existing patterns

**Capabilities**:

**Backend Generation**:
- Create NestJS module structure (module, controller, service)
- Generate Prisma model with relationships
- Create and run database migration
- Generate DTOs with class-validator decorators
- Add CRUD endpoints with guards and permissions
- Configure Swagger documentation
- Add permissions to seed.ts
- Configure file upload handling (optional)
- Generate unit tests for service

**Frontend Generation**:
- Create page components (List, Create, Edit, View)
- Generate route configuration
- Add menu item to Sidebar with permission check
- Create form components with validation
- Generate API client functions
- Add TypeScript interfaces
- Generate component tests

**Input Format**:
```yaml
module_name: "products"
display_name: "Produtos"
icon: "Package"
fields:
  - name: "codigo"
    type: "string"
    required: true
    unique: true
  - name: "descricao"
    type: "string"
    required: true
  - name: "preco"
    type: "float"
    required: true
  - name: "estoque"
    type: "integer"
    default: 0
permissions:
  - create
  - read
  - update
  - delete
file_uploads:
  - name: "foto"
    type: "single"
    formats: ["jpg", "png"]
relationships:
  - model: "User"
    field: "criadoPorId"
    type: "belongs_to"
```

**Output**: Complete working module with all files created and integrated.

**Value Proposition**: Reduces module creation from 2-3 hours to 5-10 minutes.

---

### 2. Testing Agent (`test-generator`)

**Purpose**: Generate comprehensive test suites following Q-Manager testing standards.

**When to Use**:
- After creating new features/modules
- Improving test coverage
- Ensuring regression protection
- Before deploying to production

**Capabilities**:

**Backend Testing**:
- Generate service unit tests with Prisma mocks
- Generate controller integration tests
- Generate E2E API tests with Supertest
- Create test fixtures and factories
- Mock external dependencies
- Test permission guards
- Test file upload handling

**Frontend Testing**:
- Generate component unit tests (React Testing Library)
- Generate page integration tests
- Create E2E tests (Playwright/Cypress)
- Mock API responses
- Test user interactions
- Test permission-based rendering
- Test form validation

**Test Coverage Analysis**:
- Identify untested code paths
- Generate missing tests
- Ensure critical paths are covered
- Report coverage metrics

**Output**: Complete test suite with fixtures, mocks, and assertions.

**Value Proposition**: Addresses critical gap in quality assurance, prevents regressions.

---

### 3. API Documentation Agent (`api-documenter`)

**Purpose**: Generate and maintain comprehensive API documentation synchronized with code.

**When to Use**:
- After API changes
- Before releases
- For external integrations
- Onboarding new developers

**Capabilities**:

**Documentation Generation**:
- Parse Swagger/OpenAPI decorators
- Generate endpoint documentation with examples
- Create request/response schemas
- Document authentication flow
- List all permissions and their endpoints
- Generate error code reference
- Create Postman/Insomnia collection

**Formats**:
- Markdown documentation
- Interactive HTML docs
- OpenAPI 3.0 spec
- API client SDKs (optional)

**Maintenance**:
- Detect undocumented endpoints
- Identify documentation drift
- Suggest missing examples
- Validate response schemas

**Output**: Complete API documentation in multiple formats, always in sync with code.

**Value Proposition**: Ensures documentation accuracy, improves developer experience.

---

## Priority 2: High-Value Development Accelerators

### 4. Database Evolution Agent (`db-evolution`)

**Purpose**: Safely manage database schema changes and data migrations.

**When to Use**:
- Modifying database schema
- Adding/removing fields
- Changing relationships
- Data transformations

**Capabilities**:

**Schema Management**:
- Update Prisma schema
- Generate migrations
- Detect breaking changes
- Suggest migration strategies
- Update DTOs automatically
- Update service logic
- Regenerate Prisma Client

**Data Migration**:
- Generate data transformation scripts
- Validate data integrity
- Rollback support
- Backup recommendations

**Impact Analysis**:
- Identify affected services
- List required code updates
- Suggest refactoring steps

**Safety Checks**:
- Detect data loss risks
- Validate foreign key constraints
- Check for performance impacts (indexes)

**Output**: Safe migration with updated code and data transformation scripts.

**Value Proposition**: Reduces migration errors, prevents data loss.

---

### 5. Security Audit Agent (`security-auditor`)

**Purpose**: Proactively identify and fix security vulnerabilities.

**When to Use**:
- Before releases
- Regular security reviews
- After dependency updates
- Adding authentication/authorization

**Capabilities**:

**Security Checks**:
- Validate permission implementations
- Check for SQL injection risks
- Identify XSS vulnerabilities
- Validate file upload security
- Check input sanitization
- Review password handling
- Audit JWT implementation
- Check CORS configuration

**Dependency Scanning**:
- npm audit integration
- Identify vulnerable packages
- Suggest updates
- Check for known CVEs

**Best Practices**:
- Enforce OWASP top 10 compliance
- Check for secrets in code
- Validate environment variables
- Review error messages (info leakage)

**Reporting**:
- Security score
- Vulnerability list with severity
- Remediation suggestions
- Compliance checklist

**Output**: Security report with actionable fixes.

**Value Proposition**: Proactive security management, compliance assurance.

---

### 6. Form Generator Agent (`form-generator`)

**Purpose**: Generate React forms with validation and file upload support.

**When to Use**:
- Creating new forms
- Adding form validation
- Implementing file uploads
- Building multi-step forms

**Capabilities**:

**Form Generation**:
- Generate form components
- Add field validation
- Handle file uploads
- Multi-step form support
- Dynamic field arrays
- Conditional fields

**Validation**:
- Client-side validation rules
- Match backend DTO validation
- Custom validation functions
- Error message display

**Integration**:
- API submission handling
- Loading states
- Error handling
- Success callbacks
- Toast notifications

**Accessibility**:
- Proper labels and ARIA
- Keyboard navigation
- Error announcements
- Focus management

**Output**: Complete form component with validation and submission logic.

**Value Proposition**: Consistent form patterns, reduced development time.

---

## Priority 3: Quality of Life Improvements

### 7. Code Review Agent (`code-reviewer`)

**Purpose**: Automated code review enforcing Q-Manager best practices.

**When to Use**:
- Before commits
- Pull request reviews
- Code refactoring
- Learning best practices

**Capabilities**:

**Pattern Enforcement**:
- Check NestJS patterns (DTOs, Guards, Services)
- Verify React component patterns
- Validate Prisma usage
- Check permission implementations
- Ensure Swagger documentation

**Code Quality**:
- Identify code smells
- Detect duplicate code
- Check naming conventions
- Validate TypeScript types
- Review error handling

**Best Practices**:
- Security best practices
- Performance considerations
- Accessibility compliance
- SEO optimization (frontend)

**Suggestions**:
- Refactoring opportunities
- Missing tests
- Documentation gaps
- Performance improvements

**Output**: Detailed review with suggestions and code examples.

**Value Proposition**: Consistent code quality, enforces standards.

---

### 8. Performance Optimization Agent (`perf-optimizer`)

**Purpose**: Identify and fix performance bottlenecks.

**When to Use**:
- Performance issues reported
- Before scaling
- Regular optimization reviews
- After significant changes

**Capabilities**:

**Backend Optimization**:
- Identify N+1 queries
- Suggest database indexes
- Optimize Prisma queries
- Cache strategy recommendations
- Query profiling

**Frontend Optimization**:
- Bundle size analysis
- Code splitting suggestions
- Lazy loading opportunities
- Image optimization
- React re-render analysis
- Memoization suggestions

**Monitoring**:
- Performance metrics collection
- Bottleneck identification
- Resource usage analysis

**Recommendations**:
- Caching strategies (Redis)
- CDN configuration
- Load balancing
- Database optimization

**Output**: Performance report with actionable optimizations.

**Value Proposition**: Faster application, better user experience, lower costs.

---

### 9. Refactoring Agent (`refactoring-assistant`)

**Purpose**: Safe and systematic code refactoring.

**When to Use**:
- Technical debt reduction
- Code cleanup
- Pattern migration
- Component extraction

**Capabilities**:

**Code Analysis**:
- Identify duplicate code
- Find circular dependencies
- Detect unused code
- Locate god classes/components

**Refactoring Operations**:
- Extract reusable components
- Extract services/utilities
- Rename safely (update all references)
- Move files (update imports)
- Apply design patterns

**Validation**:
- Ensure tests still pass
- Update documentation
- Verify no breaking changes

**Output**: Refactored code with updated tests and documentation.

**Value Proposition**: Maintainable codebase, reduced technical debt.

---

## Priority 4: Advanced Automation

### 10. Deployment Agent (`deployment-assistant`)

**Purpose**: Automate deployment processes and environment management.

**When to Use**:
- Setting up new environments
- Deploying to production
- Managing infrastructure
- Rollback scenarios

**Capabilities**:

**Infrastructure Setup**:
- Generate Dockerfile
- Create docker-compose.yml
- Configure CI/CD pipelines
- Setup environment variables
- Configure reverse proxy

**Deployment**:
- Build optimized images
- Database migration execution
- Zero-downtime deployment
- Health check validation
- Rollback support

**Monitoring Setup**:
- Configure logging
- Setup error tracking (Sentry)
- Performance monitoring
- Uptime monitoring

**Output**: Complete deployment configuration and scripts.

**Value Proposition**: Consistent deployments, reduced downtime.

---

### 11. Monitoring Agent (`monitoring-setup`)

**Purpose**: Setup comprehensive application monitoring and alerting.

**When to Use**:
- Production deployment
- Performance monitoring
- Error tracking
- Usage analytics

**Capabilities**:

**Backend Monitoring**:
- API endpoint metrics
- Database query performance
- Error rate tracking
- Response time monitoring
- Resource usage (CPU, memory)

**Frontend Monitoring**:
- Core Web Vitals
- JavaScript errors
- User analytics
- Page load times
- User flows

**Alerting**:
- Configure alert rules
- Integration with Slack/Discord
- Incident management
- SLA monitoring

**Dashboards**:
- Setup Grafana dashboards
- Custom metrics visualization
- Real-time monitoring

**Output**: Complete monitoring stack with dashboards and alerts.

**Value Proposition**: Proactive issue detection, data-driven decisions.

---

### 12. Data Migration Agent (`data-migrator`)

**Purpose**: Safe data transformations and migrations between versions.

**When to Use**:
- Version upgrades
- Data cleanup
- Schema changes
- Data imports/exports

**Capabilities**:

**Migration Planning**:
- Analyze data structure
- Plan transformation steps
- Identify risks
- Estimate duration

**Execution**:
- Generate migration scripts
- Batch processing
- Progress tracking
- Validation checks

**Safety**:
- Automatic backups
- Dry run mode
- Rollback support
- Data integrity checks

**Reporting**:
- Migration summary
- Error logs
- Validation results

**Output**: Safe data migration with full audit trail.

**Value Proposition**: Risk-free data migrations, no data loss.

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
-  Create Module Generator Agent
-  Create Testing Agent
-  Create API Documentation Agent

### Phase 2: Development Acceleration (Weeks 3-4)
- ó Create Database Evolution Agent
- ó Create Security Audit Agent
- ó Create Form Generator Agent

### Phase 3: Quality Improvement (Weeks 5-6)
- ó Create Code Review Agent
- ó Create Performance Optimization Agent
- ó Create Refactoring Agent

### Phase 4: Production Readiness (Weeks 7-8)
- ó Create Deployment Agent
- ó Create Monitoring Agent
- ó Create Data Migration Agent

---

## Agent Development Guidelines

All sub-agents should:

1. **Understand Context**:
   - Read CLAUDE.md for project patterns
   - Follow existing code conventions
   - Respect the modular architecture

2. **Generate Quality Code**:
   - TypeScript with proper typing
   - Include comprehensive tests
   - Add appropriate documentation
   - Follow security best practices

3. **Be Interactive**:
   - Ask clarifying questions
   - Provide options when multiple approaches exist
   - Explain decisions and trade-offs

4. **Validate Output**:
   - Run linters and formatters
   - Execute tests
   - Check for TypeScript errors
   - Validate against schema

5. **Document Changes**:
   - Update relevant documentation
   - Create changelog entries
   - Add code comments where needed
   - Generate usage examples

---

## Success Metrics

Track the following metrics to measure sub-agent effectiveness:

1. **Time Savings**:
   - Module creation time: Target < 10 minutes (currently 2-3 hours)
   - Test generation time: Target < 5 minutes per module
   - Documentation update time: Target < 2 minutes

2. **Quality Improvements**:
   - Test coverage: Target > 80%
   - Security vulnerabilities: Target 0 high/critical
   - Code consistency: Target 100% pattern compliance

3. **Developer Experience**:
   - Developer satisfaction score
   - Onboarding time reduction
   - Bug reduction rate

4. **Deployment Reliability**:
   - Deployment success rate: Target > 99%
   - Rollback frequency: Target < 1% of deployments
   - Downtime: Target < 1 hour/month

---

## Conclusion

These specialized sub-agents will transform Q-Manager development by:

- **Accelerating Feature Development**: 60-80% time reduction for common tasks
- **Improving Code Quality**: Consistent patterns, comprehensive testing
- **Reducing Errors**: Automated validation and security checks
- **Enhancing Documentation**: Always up-to-date and comprehensive
- **Enabling Scalability**: Performance optimization and monitoring

**Recommended Starting Point**: Begin with Priority 1 agents (Module Generator, Testing, API Documentation) as they provide immediate, measurable value and address current gaps in the development workflow.

Each agent should be built iteratively, starting with core functionality and expanding based on developer feedback and usage patterns.
