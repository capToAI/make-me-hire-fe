---
alwaysApply: true
---
# NestJS Coding Standards - Cursor AI Rules

## File Creation & Generation
- Always use Nest CLI commands (`nest generate` / `nest g`) for generating modules, controllers, services, entities, DTOs, guards, interceptors, pipes, filters, etc.
- Follow modular architecture: group features inside `src/features/<feature-name>/`
- Each feature directory must contain structured subfolders: `controller/`, `services/`, `models/`
- Cross-cutting concerns, shared DTOs, and global utilities belong in `src/shared/`

## Naming Conventions

### Files
- Use kebab-case for all file names
- Follow pattern: `<descriptive-name>.<type>.ts`
- Standard type suffixes:
  - `.module.ts` - NestJS module
  - `.controller.ts` - Controller / API endpoint handler
  - `.service.ts` - Business logic provider
  - `.entity.ts` - TypeORM database entity
  - `.dto.ts` - Data Transfer Object
  - `.interface.ts` - TypeScript interface / response payload contract
  - `.guard.ts` - Authentication / Authorization guard
  - `.interceptor.ts` - Request / Response interceptor
  - `.pipe.ts` - Data validation / transformation pipe
  - `.filter.ts` - Exception filter
  - `.decorator.ts` - Custom decorator
  - `.spec.ts` - Unit test file

### Classes, Interfaces, Enums
- Use PascalCase for all class, interface, enum, and type names
- Symbol name must match file name (e.g., `user.controller.ts` → `UserController`, `create-user.dto.ts` → `CreateUserDto`)
- Append conventional suffix to class names (`Controller`, `Service`, `Module`, `Dto`, `Entity`, `Guard`, `Interceptor`)

### Methods
- Standard CRUD method names in Controllers & Services:
  - `create`: Create a new record (e.g., `create(createDto: CreateUserDto)`)
  - `findAll`: Retrieve paginated list / search results (e.g., `findAll(query: PaginationQueryDto)`)
  - `findOne`: Retrieve single record by ID (e.g., `findOne(id: string)`)
  - `findOneEntity`: Private helper to fetch database entity or throw `NotFoundException`
  - `update`: Update an existing record (e.g., `update(id: string, updateDto: UpdateUserDto)`)
  - `remove` / `delete`: Delete or soft-delete a record (e.g., `remove(id: string)`)
  - `map` + Entity: Response mapper helper (e.g., `mapUser(user: User): UserResponse`)
  - `validate` + Subject: Internal validation helper (e.g., `validateUniqueCode`)

### Properties & Variables
- Use camelCase for TypeScript properties, local variables, and method parameters
- Snake_case is permitted for database column mapping fields in entities (e.g., `user_type_id`, `created_at`, `company_id`)
- Boolean properties must start with `is` or represent state (e.g., `isActive`, `status`)
- Arrays must end with `List` or use plural naming (e.g., `allowedFilterKeys`, `userList`)
- Request arguments: use `req`
- Response arguments: use `res`
- Exception/Error arguments: use `err` or `error`

## Code Style

### General
- Apply Single Responsibility Principle (SRP) - controllers handle HTTP routes; services contain business logic; entities define data schemas
- Keep functions small and readable (limit methods to ~75 lines)
- Always use curly braces for loops and conditionals
- Open curly braces on the same line
- Single space after commas, colons, and semicolons
- Always use `async` / `await` for asynchronous TypeORM repository and service operations

### Functions & Return Types
- Explicitly declare return types on ALL public methods in services and controllers
- Use Promise types for async methods (e.g., `Promise<UserResponse>`, `Promise<void>`)
- Prefer arrow functions for array callbacks and internal mappings

### Types & Validation
- Always assign types to properties, method arguments, and DTO fields
- Avoid using `any`; create explicit interfaces or type aliases where necessary
- Use common TypeScript utility types: `Record<>`, `Partial<>`, `Pick<>`, `Omit<>`
- Decorate all DTO properties with `class-validator` and `class-transformer` decorators

## Access Modifiers & Injection

### Properties & Methods
- `public` - default for class methods; accessible outside class
- `private` - internal helper methods (e.g., `findOneEntity`, `mapUser`) used only within the service/class
- `protected` - accessible within class and subclasses
- Do NOT prefix private properties/methods with underscores

### Constructor Dependencies
- Use `private readonly` for dependency injection in constructors
- Example:
  ```typescript
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly userTypeService: UserTypeService,
  ) {}
  ```

## Property & Method Organization

### Class Properties Order
1. Injected dependencies & decorated properties (`@InjectRepository`, `@Inject`, etc.)
2. Public properties
3. Protected properties
4. Private properties
5. Getters
6. Setters
- Sort alphabetically within each group
- Separate groups with newlines

### Class Methods Order
1. Constructor
2. NestJS Lifecycle Hooks (e.g., `onModuleInit`, `onModuleDestroy`)
3. Controller Route Handlers / Public Service API methods (`create`, `findAll`, `findOne`, `update`, `remove`)
4. Protected methods
5. Private helper methods (e.g., `findOneEntity`, `mapUser`)
- **Alphabetically sort methods within each group** (except CRUD/lifecycle flows where execution logical sequence applies)
- Separate each method with a blank newline

## DTOs & Validation Rules

### Data Transfer Objects (DTOs)
- Place DTOs in `models/` directory inside feature modules or `src/shared/dto/` for shared query/pagination DTOs
- Validate incoming request payloads using `class-validator`
- Transform input types using `class-transformer` (e.g., `@Type(() => Number)`)
- Document DTO fields using `@ApiProperty()` or `@ApiPropertyOptional()` from `@nestjs/swagger`
- Use `PartialType(CreateDto)` from `@nestjs/swagger` or `@nestjs/mapped-types` for Update DTOs

**Example DTO:**
```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Full name of the user' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unique username for authentication' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'UUID of the associated user type' })
  @IsNotEmpty()
  @IsUUID()
  user_type_id: string;

  @ApiPropertyOptional({ description: 'Active status of the user', default: true })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
```

## Database Entity Rules (TypeORM)

- Place entities in `models/<feature-name>.entity.ts`
- Annotate entity class with `@Entity('table_name')` using plural snake_case table names
- Use `@PrimaryGeneratedColumn('uuid')` for primary keys
- Define database column specifications explicitly (`type`, `length`, `nullable`, `unique`, `default`)
- Use `@CreateDateColumn({ type: 'timestamp' })` and `@UpdateDateColumn({ type: 'timestamp' })` for auditing
- Exclude sensitive fields (e.g., password hashes) when serializing or mapping response objects

**Example Entity:**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserType } from '../../user-types/models/user-type.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password?: string;

  @Column({ type: 'uuid' })
  user_type_id: string;

  @ManyToOne(() => UserType)
  @JoinColumn({ name: 'user_type_id' })
  user_type: UserType;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
```

## Imports & Exports

### Import Organization
Group imports in this order (separate each group with a blank line):
1. **NestJS Framework imports** - `@nestjs/common`, `@nestjs/swagger`, `@nestjs/typeorm`, `@nestjs/config`, etc.
2. **3rd Party Library imports** - `typeorm`, `class-validator`, `class-transformer`, `rxjs`, etc.
3. **Relative Project imports** - Project modules, services, DTOs, entities (`../../`, `../`, `./`)
   - Sort by path depth descending (`../../` before `../` before `./`), then alphabetically
   - Services/Entities imports before Controllers/Modules at the same level

**Rules:**
- Sort imports alphabetically within each group
- Sort destructured members alphabetically in multi-member imports
- Separate each group with a blank line

**Example:**

❌ **Before (Incorrect):**
```typescript
import { User } from '../models/user.entity';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../models/create-user.dto';
import { Repository, ILike } from 'typeorm';
import { UserTypeService } from '../../user-types/services/user-type.service';
```

✅ **After (Correct):**
```typescript
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ILike, Repository } from 'typeorm';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';
import { UserTypeService } from '../../user-types/services/user-type.service';
import { CreateUserDto } from '../models/create-user.dto';
import { User } from '../models/user.entity';
```

## Project Structure

```
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── features/
│   ├── company/
│   │   ├── company.module.ts
│   │   ├── controller/
│   │   │   └── company.controller.ts
│   │   ├── models/
│   │   │   ├── company.entity.ts
│   │   │   ├── create-company.dto.ts
│   │   │   └── update-company.dto.ts
│   │   └── services/
│   │       └── company.service.ts
│   └── users/
│       ├── user.module.ts
│       ├── controller/
│       │   └── user.controller.ts
│       ├── models/
│       │   ├── create-user.dto.ts
│       │   ├── update-user.dto.ts
│       │   ├── user.entity.ts
│       │   └── user-response.interface.ts
│       └── services/
│           └── user.service.ts
└── shared/
    ├── dto/
    │   └── pagination-query.dto.ts
    ├── filters/
    ├── guards/
    ├── interceptors/
    └── utils/
        ├── crypto.ts
        └── filter.util.ts
```

## Controller & OpenAPI Documentation Rules

- Use `@ApiTags('<FeatureName>')` at class level
- Use `@Controller('<route-path>')` with lowercase plural noun (e.g., `users`, `companies`)
- Decorate every route handler with `@ApiOperation({ summary: '...' })`
- Decorate routes with explicit `@ApiResponse({ status: 200/201/400/404, description: '...' })`
- Validate UUID route parameters using `ParseUUIDPipe` (e.g., `@Param('id', ParseUUIDPipe) id: string`)

**Example Controller:**
```typescript
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input or validation error.' })
  create(@Body() createDto: CreateUserDto): Promise<UserResponse> {
    return this.service.create(createDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific user by ID' })
  @ApiParam({ name: 'id', description: 'The UUID of the user' })
  @ApiResponse({ status: 200, description: 'User details successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponse> {
    return this.service.findOne(id);
  }
}
```

## Service & Business Logic Rules

- Inject repositories via `@InjectRepository(Entity)`
- Throw built-in NestJS HTTP exceptions when domain conditions fail:
  - `NotFoundException` when a resource is not found by ID
  - `ConflictException` when a duplicate record/code exists
  - `BadRequestException` for invalid business logic payloads
- Separate public API methods (`findOne`) from private entity resolution methods (`findOneEntity`)
- Map raw entities to response contracts before returning data to controllers (strip sensitive data like password hashes)

## Module Organization Rules

- Group NestJS module metadata properties in standard order: `imports`, `controllers`, `providers`, `exports`
- Alphabetically sort items within each array property in `@Module({...})`

**Example:**
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserTypeModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

## Comments & JSDoc
- Use JSDoc comments (`/** ... */`) for class services and public methods detailing description, throw behavior, and parameter notes
- For property/variable declarations, use inline comments (`// comment`) after declaration
- Keywords: `TODO`, `FIXME`, `TEMP`
- Avoid redundant comments that simply restate clear variable names

## Code Quality & Error Handling

### Early Returns & Guard Clauses
- Avoid deeply nested `if/else` statements by checking conditions early and throwing exceptions or returning early

### Standard Pagination Response Format
- Paged endpoints must return uniform structure:
```typescript
{
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## Linting & Formatting
- Enforce code style with ESLint (`eslint.config.mjs`)
- Enforce code formatting with Prettier (`.prettierrc`)
- Run `npm run lint` and `npm run format` prior to committing backend code
