# React Coding Standards

## File Creation & Generation

- Use Vite (`npm create vite@latest`) for scaffolding new projects
- Use `--template typescript` when creating new projects for strict type checking
- Generate component folders with multiple files (component, styles, types, index)
- Enable strict mode in `tsconfig.json` with `"strict": true`

---

## Naming Conventions

### Files

- Use **PascalCase** for component files: `UserProfile.tsx`, `HeroList.tsx`
- Use **camelCase** for non-component files: `useAuthHook.ts`, `authService.ts`, `userModel.ts`
- Use **kebab-case** for CSS/SCSS module files: `user-profile.module.css`
- Never use abbreviations in file names
- Standard type suffixes: `.component.tsx`, `.hook.ts`, `.service.ts`, `.model.ts`, `.type.ts`, `.util.ts`, `.config.ts`, `.context.tsx`, `.reducer.ts`, `.store.ts`

**Example folder structure:**
```
UserProfile/
  UserProfile.tsx           ← component
  UserProfile.module.css    ← styles
  UserProfile.types.ts      ← local types
  index.ts                  ← re-export
```

### Components, Interfaces, Enums

- Use **PascalCase** for all React components, interfaces, enums, and type aliases
- Component name must match the file name: `hero-list.component.tsx` → `HeroList`
- Prefix interfaces with `I` only when needed for disambiguation; prefer descriptive names
- Append conventional suffix to types: `UserProps`, `AuthState`, `UserModel`

### Custom Hooks

- Always prefix with `use`: `useAuth`, `useUserList`, `useFetchData`
- File name matches hook name: `useAuth.ts` → `export function useAuth()`

### Methods & Functions

- Initialize state/values: `init` + name (e.g., `initFilterForm`)
- Fetch data from API: `fetch` + operation (e.g., `fetchUser`)
- Create data: `create` + operation (e.g., `createUser`)
- Update data: `update` + operation (e.g., `updateUser`)
- Delete data: `delete` + operation (e.g., `deleteUser`)
- Get values: `get` + value name
- Set values: `set` + value name
- Event handlers: `on` + event + element name (e.g., `onClickSubmit`, `onChangeInput`)

### Properties & Variables

- Use **camelCase** for all props, state, and variables
- Boolean properties/state must start with `is` or `has` (e.g., `isActive`, `hasError`)
- Arrays must end with `List` (e.g., `usersList`)
- Event arguments: use `e`
- Response arguments: use `res`
- Error arguments: use `err`
- Loop index: use `i`, then `j`, `k` for nested loops
- Avoid using "not" in names; use the `!` operator instead

---

## Code Style

### General

- Apply **Single Responsibility Principle (SRP)** — one concern per file/component
- Keep components small (limit to ~75–150 lines; extract sub-components when larger)
- Use single declaration per variable statement
- Always use curly braces for conditional blocks (except single-line JSX)
- Open curly braces on the same line
- Single space after commas, colons, and semicolons

### Functions & Arrow Functions

- Prefer **arrow functions** for component definitions and callbacks
- Prefer named exports over default exports for better refactoring support
- Only wrap arrow function parameters in parentheses when required by TypeScript types:
  - Correct: `x => x + x`
  - Correct: `(x: T) => x === y`

### Types

- Always type props, state, and function arguments
- Avoid `any` type unless absolutely unavoidable; prefer `unknown`
- Use common types: `string`, `number`, `boolean`, arrays (`string[]`)
- Use utility types: `Record<>`, `Partial<>`, `Pick<>`, `Omit<>`, `ReturnType<>`
- Note: `[string]` (tuple) ≠ `string[]` (array)

---

## Component Structure & Organization

### Functional Component Property Order

1. Props destructuring / `const` from hooks (context, redux, router)
2. `useRef` declarations
3. `useState` declarations
4. `useMemo` / `useCallback` declarations
5. Derived values (computed from state/props without hooks)
6. `useEffect` hooks
7. Event handlers and helper functions
8. Return (JSX)

```tsx
// ✅ Correct order
const UserProfile: React.FC<UserProfileProps> = ({ userId, isEditable }) => {
  // 1. External hooks
  const { data: user } = useUser(userId);
  const navigate = useNavigate();

  // 2. Refs
  const formRef = useRef<HTMLFormElement>(null);

  // 3. State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 4. Memos / callbacks
  const fullName = useMemo(() => `${user?.firstName} ${user?.lastName}`, [user]);

  // 5. Effects
  useEffect(() => {
    initUserData();
  }, [userId]);

  // 6. Handlers
  const onClickSubmit = () => { /* ... */ };
  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };

  // 7. Private helpers
  const initUserData = () => { /* ... */ };

  // 8. Render
  return <div>...</div>;
};
```

### Class Component Property Order (if used)

1. Static properties
2. Public properties / state
3. Private properties
4. Constructor
5. Lifecycle methods (in execution order)
6. Public methods
7. Private methods
8. Render method

### React Lifecycle Methods (Class Components — in order)

1. `constructor`
2. `static getDerivedStateFromProps`
3. `componentDidMount`
4. `shouldComponentUpdate`
5. `getSnapshotBeforeUpdate`
6. `componentDidUpdate`
7. `componentWillUnmount`

### Equivalent Lifecycle Hooks (Functional Components)

| Class Lifecycle       | Hook Equivalent                          |
|-----------------------|------------------------------------------|
| `componentDidMount`   | `useEffect(() => {}, [])`                |
| `componentDidUpdate`  | `useEffect(() => {}, [dep])`             |
| `componentWillUnmount`| `useEffect(() => { return () => {} }, [])` |
| `shouldComponentUpdate` | `React.memo()` / `useMemo`            |

---

## Props & State

### Props

- Define all props in a dedicated `interface` or `type`:
  ```tsx
  interface UserCardProps {
    userId: string;
    isEditable: boolean;
    onClickEdit: () => void;
  }
  ```
- Use `?` for optional props
- Use `children?: React.ReactNode` for components that accept children
- Avoid passing raw objects as props when only a few fields are needed (use `Pick<>`)

### State

- Initialize simple values during declaration: `useState(false)`, `useState('')`, `useState([])`
- Initialize complex values with a factory function: `useState(() => initFilterForm())`
- Use separate `init` functions for complex state initialization
- Prefer `useReducer` over multiple `useState` calls when state is complex or interdependent

---

## Access Modifiers & Visibility

- `export` — accessible outside the module
- No export (module-private) — accessible only within the file
- For class components:
  - `public` — accessible outside the class
  - `protected` — accessible in the class and subclasses
  - `private` — accessible only within the class
  - Never prefix private properties/methods with an underscore

---

## Imports & Exports

### Import Organization

Group imports in this order (separate groups with blank lines):

1. **React imports** — `react`, `react-dom`, `react-router-dom`
2. **3rd party imports** — external libraries (Redux, Axios, Lodash, etc.)
3. **Relative imports** — project files using relative paths (`../../`, `./`)
   - Sort by path depth descending (more `../` first), then alphabetically
   - Service/hook imports before component imports at the same level

**Rules:**
- Sort alphabetically within each group
- Sort members alphabetically in multi-member imports
- Separate each group with a blank line

**Example:**

❌ **Incorrect:**
```tsx
import { useState } from 'react';
import UserCard from './components/UserCard/UserCard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../../core/services/user.service';
import { useDispatch } from 'react-redux';
```

✅ **Correct:**
```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { useDispatch } from 'react-redux';

import { UserService } from '../../core/services/user.service';
import UserCard from './components/UserCard/UserCard';
```

### Export Organization

- Create `index.ts` files in folders to group related exports:
  ```ts
  // components/index.ts
  export * from './UserCard/UserCard';
  export * from './UserProfile/UserProfile';
  ```
- Common in `models/`, `hooks/`, `utils/`, `components/` folders

### Path Aliases

Add to `tsconfig.json` and `vite.config.ts` (or `webpack.config.js`):

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@core/*": ["src/core/*"],
      "@hooks/*": ["src/hooks/*"],
      "@shared/*": ["src/shared/*"],
      "@features/*": ["src/features/*"]
    }
  }
}
```

---

## Project Structure

```
src/
  core/                   ← Singleton services, global providers, auth
    services/
    contexts/
    guards/
    interceptors/
  shared/                 ← Reusable components, hooks, utilities
    components/           ← Generic UI components (Button, Modal, Loader)
    hooks/                ← Generic custom hooks
    models/               ← Shared TypeScript models/types
    utils/                ← Utility functions
    configs/              ← App-wide configuration
  features/               ← Feature-specific modules (lazy-loaded via React.lazy)
    Users/
      components/         ← Feature sub-components
      hooks/              ← Feature-specific hooks
      services/           ← Feature-specific services
      pages/              ← Page-level components
      Users.tsx           ← Feature root
      index.ts
  assets/                 ← Static assets (images, fonts, icons)
  App.tsx
  main.tsx
```

### Core (singleton, initialize once)

- Global Providers: Auth, Theme, Router
- Services: API client, Auth service
- Guards: `PrivateRoute`, `PublicRoute`
- Interceptors: Axios interceptors

### Shared (reusable, import anywhere)

- Generic UI components: Button, Modal, Loader, FormError
- Custom hooks: `useDebounce`, `usePagination`
- Models, utils, configs

### Features (lazy-loaded)

- Page components, feature-specific components, services, and hooks
- Use `React.lazy()` + `Suspense` for code splitting

---

## Component Rules

### Functional Components

- Use `React.FC<Props>` or explicit return type `JSX.Element` for all components
- Prefer functional components over class components
- Extract reusable logic into custom hooks
- Use `React.memo()` to prevent unnecessary re-renders when appropriate
- Implement `useCallback` for event handlers passed as props
- Use `useMemo` for expensive computed values

### Props

- Destructure props at the function signature level
- Provide default values using default parameters or `||`/`??` operators
- Use spreading (`...props`) sparingly; always be explicit about passed props

### Event Handlers

- Define event handlers as named arrow functions inside the component (not inline JSX)
- Name handlers with `on` prefix: `onClickSubmit`, `onChangeEmail`

```tsx
// ✅ Correct
const onClickSubmit = () => handleSubmit();
return <button onClick={onClickSubmit}>Submit</button>;

// ❌ Avoid inline complex logic
return <button onClick={() => { validateForm(); submitForm(); }}>Submit</button>;
```

---

## Component Splitting

### The 300-Line Rule

- **A component file must not exceed 300 lines** (including imports, types, and JSX)
- When a component reaches or approaches 300 lines, split it into smaller sub-components
- This limit applies to every `.tsx` file — page components, feature components, and shared components alike

### When to Split

Split a component when any of the following is true:

- The file exceeds 300 lines
- A section of JSX is independently meaningful (e.g., a form, a table, a sidebar)
- A block of logic (state + handlers + JSX) is reusable elsewhere
- A section has its own loading/error state independent of the parent
- Conditional rendering branches are large enough to stand alone

### How to Split

Extract sub-components into a `components/` folder inside the feature:

```
UserProfile/
  UserProfile.tsx                        ← parent (orchestrator)
  components/
    UserProfileHeader/
      UserProfileHeader.tsx
      index.ts
    UserProfileForm/
      UserProfileForm.tsx
      index.ts
    UserProfileStats/
      UserProfileStats.tsx
      index.ts
  index.ts
```

The parent component becomes a thin orchestrator — it manages top-level state and composes sub-components:

```tsx
// ✅ UserProfile.tsx — stays under 300 lines by delegating to sub-components
const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { user, isLoading, errorMessage } = useFetchUser(userId);

  if (isLoading) return <Loader />;
  if (errorMessage) return <ErrorMessage message={errorMessage} />;
  if (!user) return null;

  return (
    <div className="user-profile">
      <UserProfileHeader user={user} />
      <UserProfileForm user={user} />
      <UserProfileStats userId={userId} />
    </div>
  );
};
```

### Splitting Logic Too

When a component is large because of logic (not just JSX), extract state and handlers into a custom hook:

```tsx
// ✅ Extract logic → useUserProfile.ts
function useUserProfile(userId: string) {
  const [isEditing, setIsEditing] = useState(false);
  const { user, isLoading } = useFetchUser(userId);
  const onClickEdit = () => setIsEditing(true);
  const onClickCancel = () => setIsEditing(false);
  return { user, isLoading, isEditing, onClickEdit, onClickCancel };
}

// ✅ Component stays lean
const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { user, isLoading, isEditing, onClickEdit, onClickCancel } = useUserProfile(userId);
  // JSX only — no logic clutter
};
```

### Rules Summary

| Rule | Detail |
|------|--------|
| Max lines per file | 300 lines |
| Action when limit reached | Extract sub-components or a custom hook |
| Sub-component location | `ComponentName/components/SubName/` |
| Parent responsibility | Orchestration only — compose, don't cram |
| Logic extraction | Move to a `useComponentName.ts` hook |

---

## Custom Hooks

- Always prefix with `use`
- One hook per file; file name matches hook name
- Use hooks only at the top level of components or other hooks (never in conditionals or loops)
- Hooks encapsulating API calls should handle loading, error, and data states:

```ts
function useFetchUser(userId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(userId);
  }, [userId]);

  const fetchUser = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await UserService.getById(id);
      setUser(res.data);
    } catch (err) {
      setErrorMessage('Failed to fetch user.');
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoading, errorMessage };
}
```

---

## Services

- Place API-related services in `core/services/` (used across features) or `features/<Name>/services/` (feature-scoped)
- Services are plain TypeScript modules (not classes) exporting async functions, or class-based singletons
- Use Axios (or Fetch) instances configured with base URL and interceptors
- Services should not hold UI state; return raw data and let hooks manage state

---

## Context & State Management

- Use React Context for lightweight global state (theme, auth, locale)
- Use Redux Toolkit (or Zustand) for complex, cross-feature state
- Prefer co-location: keep state as close to where it's used as possible
- Avoid prop drilling beyond 2 levels; use context or state management

---

## Comments

- Use comments to clarify, not duplicate code
- Include JSDoc comments (`/** */`) for exported functions, hooks, and complex types
- For inline clarifications, use `//` after the declaration:
  ```ts
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Controls mobile nav visibility
  ```
- Use `@param` and `@returns` in JSDoc for utility functions and hooks
- Keywords: `TODO`, `FIXME`, `TEMP`
- Add comments for bug fixes, non-obvious patterns, or external references
- Prefer better naming and smaller functions over explanatory comments

---

## Code Quality

### Guard Clauses

- Use guard clauses to avoid deep nesting
- Return early when conditions aren't met:

```tsx
// ✅ Correct
if (!user) return null;
if (!isEditable) return <ReadOnlyView user={user} />;
return <EditableView user={user} />;
```

### Return Types

- Always specify return types on exported functions and hooks
- Use `void` when there is no return value
- Use `JSX.Element` or `React.ReactNode` for component return types

### Error Boundaries

- Wrap feature-level routes with `ErrorBoundary` components
- Use `react-error-boundary` library for class-based error boundary logic

### Performance

- Use `React.memo` for components that receive stable props
- Use `useCallback` for handlers passed to memoized children
- Use `useMemo` for computationally expensive derived values
- Use `React.lazy` + `Suspense` for code-split route components
- Avoid anonymous functions and object literals as prop values in JSX (they create new references on every render)

---

## Assets

- Place static assets in `src/assets/` with subfolders (`images/`, `icons/`, `fonts/`)
- Import assets via ES module imports rather than relative string paths in JSX:
  ```tsx
  import logo from '@assets/images/logo.png';
  ```
- Use SVG components for icons when possible (via `@svgr/webpack` or Vite plugin)
- Group assets logically by type or feature

---

## Testing Structure

- **Every new feature must ship with unit tests.** When adding a new component, hook, service, utility, or context, write the corresponding test file(s) in the same change — following the structure and conventions below (see the `auth`/`Login` feature's test suite as the reference implementation). Code without tests should not be merged.
- All tests live under `src/tests/` — never colocate `*.test.ts(x)` files next to source or under a per-feature `tests/` folder
- Shared test utilities (`setup.ts`, `renderWithProviders.tsx`, etc.) live at the `src/tests/` root
- Feature tests mirror the source tree under `src/tests/features/<feature>/<subfolder>/`, where `<subfolder>` matches the source subfolder being tested (`components/`, `hooks/`, `services/`, etc.)
- Test file name matches the file under test: `Login.tsx` → `Login.test.tsx`, `useLogin.ts` → `useLogin.test.ts`

```
src/features/auth/
  Login.tsx
  hooks/useLogin.ts

src/tests/
  setup.ts
  renderWithProviders.tsx
  features/
    auth/
      components/
        Login.test.tsx
      hooks/
        useLogin.test.ts
```

---

## Linting & Formatting

- Use **ESLint** with `eslint-plugin-react`, `eslint-plugin-react-hooks`, and `@typescript-eslint`
- Use **Prettier** for consistent formatting
- Recommended ESLint rules:
  - `react-hooks/rules-of-hooks` — enforces hooks usage rules
  - `react-hooks/exhaustive-deps` — enforces `useEffect` dependency arrays
  - `@typescript-eslint/no-explicit-any` — discourages `any` usage
- Add both to project setup and integrate with your IDE and CI pipeline

---

## Quick Reference

| Angular Concept        | React Equivalent                        |
|------------------------|-----------------------------------------|
| Component              | Functional Component (`React.FC`)       |
| Module                 | Feature folder + `index.ts`             |
| Service                | Service module / Custom Hook            |
| Directive              | Custom Hook / HOC / Render Prop         |
| Pipe                   | Utility function / `useMemo`            |
| `ngOnInit`             | `useEffect(() => {}, [])`               |
| `ngOnDestroy`          | `useEffect` cleanup function            |
| `ngOnChanges`          | `useEffect(() => {}, [dep])`            |
| `@Input()`             | Props                                   |
| `@Output()` + EventEmitter | Callback props (`onEvent: () => void`) |
| `@ViewChild`           | `useRef`                                |
| `ChangeDetectionStrategy.OnPush` | `React.memo`               |
| Lazy-loaded module     | `React.lazy()` + `Suspense`             |
| RxJS Observable        | `useState` + `useEffect` / React Query  |
| `async` pipe           | Custom data-fetching hook               |
