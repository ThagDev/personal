# 📝 Git Commit Message Templates

## 🎯 **Template chuẩn**

```
<type>: <subject>

<body>

<footer>
```

## 📂 **Types và ví dụ**

### `feat` - Tính năng mới
```bash
git commit -m "feat: Add user authentication system

- Implement JWT token generation and validation  
- Add login/logout endpoints with proper validation
- Create user session management middleware
- Add password hashing with bcrypt
- Update auth guards for protected routes

Resolves #123"
```

### `fix` - Sửa lỗi
```bash
git commit -m "fix: Resolve file upload memory leak

- Fix GridFS stream not being closed properly
- Add proper error handling for upload failures  
- Implement timeout for large file uploads
- Update multer configuration limits

Fixes #456"
```

### `refactor` - Refactor code
```bash
git commit -m "refactor: Optimize database query performance

- Replace N+1 queries with aggregation pipeline
- Add database indexing for frequently queried fields
- Implement query result caching with Redis
- Reduce response time by 80% on user endpoints

Performance improvement"
```

### `perf` - Cải thiện performance
```bash
git commit -m "perf: Implement response caching and compression

- Add Redis caching for API responses
- Enable gzip compression for all endpoints
- Optimize MongoDB aggregation queries
- Reduce average response time from 200ms to 50ms"
```

### `docs` - Documentation
```bash
git commit -m "docs: Update API documentation and README

- Add comprehensive endpoint documentation
- Update installation and setup instructions
- Add troubleshooting section
- Include environment variables reference"
```

### `test` - Tests
```bash
git commit -m "test: Add comprehensive unit tests for auth module

- Add JWT service unit tests (95% coverage)
- Add auth controller integration tests
- Add auth guard test cases
- Mock external dependencies properly"
```

### `chore` - Maintenance
```bash
git commit -m "chore: Update dependencies and build configuration

- Update NestJS to v10.2.0
- Update TypeScript to v5.1.0
- Fix security vulnerabilities in dependencies
- Update build scripts and CI configuration"
```

## 🎨 **Commit message cho dự án NestJS**

### Module Development
```bash
# Tạo module mới
git commit -m "feat: Create user management module

- Add UsersController with CRUD operations
- Implement UsersService with database integration
- Add CreateUserDto and UpdateUserDto validation
- Create user entity with proper relationships
- Add user module with dependency injection"

# Refactor module
git commit -m "refactor: Optimize users module architecture

- Extract BaseService for common CRUD operations
- Implement BaseController for standardized responses
- Add proper error handling and validation
- Update user service to extend BaseService
- Improve code reusability across modules"
```

### API Development
```bash
# Tạo API endpoints
git commit -m "feat: Add file upload API endpoints

- Create upload controller with multer integration
- Add file validation (type, size, security)
- Implement GridFS storage for large files
- Add file download and streaming capabilities
- Create proper error responses and logging"

# API optimization
git commit -m "perf: Optimize API response times

- Add response caching middleware
- Implement database query optimization
- Add request/response compression
- Reduce endpoint response time by 60%"
```

### Database & Security
```bash
# Database changes
git commit -m "feat: Add database indexing and optimization

- Create compound indexes for user queries
- Add text search indexes for content
- Implement database connection pooling
- Add query performance monitoring
- Optimize slow queries identified in production"

# Security updates
git commit -m "security: Enhance API security measures

- Add rate limiting middleware
- Implement request validation and sanitization
- Add CORS configuration for production
- Update authentication token expiration
- Add security headers middleware"
```

## 🚀 **Quick Templates cho daily work**

### Work In Progress
```bash
git commit -m "wip: Implement user profile feature

- Add basic profile controller structure
- Create profile DTOs and validation
- Work in progress on profile image upload"
```

### Bug Fixes
```bash
git commit -m "fix: Resolve login endpoint 500 error

- Fix null pointer exception in auth service
- Add proper error handling for invalid credentials
- Update error response format for consistency

Fixes #789"
```

### Code Cleanup
```bash
git commit -m "style: Clean up code formatting and imports

- Remove unused imports across all modules
- Fix ESLint warnings and formatting issues
- Standardize import order and spacing
- Update code comments and documentation"
```

## 📊 **Conventional Commits Reference**

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add shopping cart` |
| `fix` | Bug fix | `fix: resolve payment error` |
| `docs` | Documentation | `docs: update API reference` |
| `style` | Code style changes | `style: fix linting errors` |
| `refactor` | Code refactoring | `refactor: extract utility function` |
| `perf` | Performance improvements | `perf: optimize database queries` |
| `test` | Adding/updating tests | `test: add user service tests` |
| `chore` | Maintenance tasks | `chore: update dependencies` |
| `ci` | CI/CD changes | `ci: add deployment workflow` |
| `build` | Build system changes | `build: update webpack config` |

---

## 💡 **Pro Tips**

1. **Đầu dòng < 50 ký tự** cho subject
2. **Body giải thích "what" và "why"**, không phải "how"
3. **Sử dụng imperative mood**: "Add feature" thay vì "Added feature"
4. **Reference issues/tickets** khi có thể
5. **Breaking changes** phải có `BREAKING CHANGE:` footer

### Ví dụ Breaking Change:
```bash
git commit -m "feat: change user authentication API structure

Update authentication endpoints to use new JWT format
for better security and performance.

BREAKING CHANGE: Auth API endpoints now require different 
request/response format. Update client applications accordingly.

Closes #123"
```

---

**📌 Save this file để tham khảo khi viết commit messages!**
