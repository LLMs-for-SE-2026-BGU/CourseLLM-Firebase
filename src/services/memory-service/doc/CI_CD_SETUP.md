# CI/CD Pipeline Documentation

## Overview

The Memory Service has a comprehensive CI/CD pipeline using GitHub Actions that automatically runs tests, security checks, and builds on every push and pull request.

## Pipeline Structure

### Main CI Pipeline (`memory-service-ci.yml`)

Runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Only when files in `src/services/memory-service/` change

### Jobs

#### 1. **Lint**
- Runs ESLint to check code quality
- Verifies code formatting with Prettier
- Fast feedback on code style issues

#### 2. **Unit Tests**
- Runs all Jest unit tests
- Generates code coverage reports
- Uploads coverage to Codecov (optional)
- Tests run in isolation with mocked dependencies

#### 3. **E2E Tests**
- Spins up a PostgreSQL database in CI
- Runs end-to-end integration tests
- Tests real API endpoints with database
- Verifies complete user workflows

#### 4. **Build**
- Builds Docker image for the service
- Uses Docker BuildKit for caching
- Runs only after all tests pass
- Tagged with commit SHA

#### 5. **Security**
- Runs `npm audit` for dependency vulnerabilities
- Checks for outdated packages
- Continues on non-critical issues

#### 6. **Status Check**
- Final verification that all required checks passed
- Blocks merging if any critical job fails

## Running Tests Locally

### Run All Tests
```bash
npm run test:all
```
This runs:
1. ESLint
2. Unit tests with coverage
3. E2E tests

### Run Individual Test Suites

```bash
# Unit tests only
npm test

# Unit tests with coverage
npm run test:cov

# Unit tests in watch mode
npm run test:watch

# E2E tests only
npm run test:e2e

# Lint only
npm run lint
```

## Test Structure

### Unit Tests
- **Location**: `src/**/*.spec.ts`
- **Framework**: Jest
- **Coverage**: Enabled with `--coverage` flag
- **Mocks**: Uses Jest mocks for dependencies

Example:
```typescript
// src/users/users.service.spec.ts
describe('UsersService', () => {
  it('should register a new user', async () => {
    // Test with mocked dependencies
  });
});
```

### E2E Tests
- **Location**: `test/*.e2e-spec.ts`
- **Framework**: Jest + Supertest
- **Database**: Real PostgreSQL instance
- **Endpoints**: Tests actual HTTP API

Example:
```typescript
// test/app.e2e-spec.ts
describe('/api/v1/memory/register (POST)', () => {
  it('should register a new user', () => {
    return request(app.getHttpServer())
      .post('/api/v1/memory/register')
      .send({ userID: 'test', name: 'Test', role: 'student' })
      .expect(200);
  });
});
```

## CI Environment Variables

The CI pipeline uses these environment variables:

```yaml
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/memory_service_test?schema=public
MEM0_API_KEY: test_key_for_ci
NODE_ENV: test
```

## GitHub Actions Services

### PostgreSQL Service
```yaml
services:
  postgres:
    image: postgres:15-alpine
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: memory_service_test
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

## Manual Test Workflow

For running tests on-demand:

1. Go to **Actions** tab in GitHub
2. Select **Memory Service Tests (Manual)**
3. Click **Run workflow**
4. Choose test type:
   - `all` - Run everything
   - `unit` - Unit tests only
   - `e2e` - E2E tests only
   - `lint` - Linting only

## CI Performance

Typical run times:
- **Lint**: ~30 seconds
- **Unit Tests**: ~10 seconds
- **E2E Tests**: ~20 seconds
- **Build**: ~2-3 minutes
- **Security**: ~20 seconds

**Total CI time**: ~4-5 minutes

## Test Coverage

Current coverage targets:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

View coverage report locally:
```bash
npm run test:cov
open coverage/lcov-report/index.html
```

## Debugging Failed Tests

### Local Debugging

```bash
# Run tests in debug mode
npm run test:debug

# Set breakpoint in your test or code
# In VS Code: F5 to start debugging
```

### CI Debugging

1. Check the **Actions** tab for failed workflows
2. Click on the failed job to see logs
3. Look for error messages in collapsed sections
4. Common issues:
   - Database connection failures
   - Missing environment variables
   - Dependency installation problems
   - Timeout issues

## Best Practices

### Writing Tests

1. ✅ **Unit tests should be fast** (< 100ms each)
2. ✅ **Mock external dependencies** (database, APIs)
3. ✅ **E2E tests should be comprehensive**
4. ✅ **Test error cases**, not just happy paths
5. ✅ **Use descriptive test names**
6. ✅ **Clean up test data** in `afterEach`/`afterAll`

### CI/CD Best Practices

1. ✅ **Run tests before pushing** (`npm run test:all`)
2. ✅ **Keep CI fast** (< 10 minutes total)
3. ✅ **Don't skip CI checks** with `[skip ci]`
4. ✅ **Fix broken tests immediately**
5. ✅ **Monitor test coverage trends**
6. ✅ **Update dependencies regularly**

## Adding New Tests

### Add Unit Test
1. Create `*.spec.ts` file next to your source file
2. Import testing utilities from `@nestjs/testing`
3. Mock all dependencies
4. Write test cases
5. Run `npm test` to verify

### Add E2E Test
1. Add test to `test/app.e2e-spec.ts`
2. Use `supertest` to make HTTP requests
3. Use real database connection
4. Test complete user workflows
5. Run `npm run test:e2e` to verify

## Troubleshooting

### "Cannot find module" errors
```bash
# Regenerate Prisma Client
npx prisma generate

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database connection issues
```bash
# Check if PostgreSQL is running
docker ps

# Start database if needed
docker-compose up -d

# Verify connection
npm run db:init
```

### Test timeouts
```bash
# Increase timeout in jest.config or test file
jest.setTimeout(30000);
```

## CI/CD Files

```
.github/workflows/
├── memory-service-ci.yml     # Main CI pipeline
└── memory-service-test.yml   # Manual test workflow

src/services/memory-service/
├── test/
│   ├── app.e2e-spec.ts       # E2E tests
│   └── jest-e2e.json         # E2E config
└── src/
    └── **/*.spec.ts          # Unit tests
```

## Future Enhancements

Potential improvements:
- [ ] Add integration with Codecov for coverage reports
- [ ] Add performance/load testing
- [ ] Add automated dependency updates (Dependabot)
- [ ] Add staging deployment workflow
- [ ] Add smoke tests for production
- [ ] Add visual regression testing
- [ ] Add API contract testing

## Related Documentation

- [README.md](./README.md) - Main service documentation
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database setup guide
- [GitHub Actions Docs](https://docs.github.com/en/actions) - Official documentation
