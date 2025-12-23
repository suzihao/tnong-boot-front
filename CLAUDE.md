# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lithe Admin** is a lightweight, modern admin dashboard template built with Vue 3, Naive UI, Vite, TailwindCSS, TypeScript, and Pinia. The application is designed for rapid development and progressive iteration with low coupling and flexible extensibility.

## Development Commands

```bash
# Development server (runs on port 999)
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint:check    # Check code quality
pnpm lint:fix      # Auto-fix code issues

# Formatting
pnpm format:check  # Check code style
pnpm format:fix    # Auto-format code

# Testing
pnpm test:unit    # Run unit tests with Vitest

# Building
pnpm build        # Build production bundle (includes type-check)
pnpm build-only   # Build without type-check
pnpm preview      # Preview production build
```

## Architecture & Key Concepts

### 1. Dynamic Routing System

The application uses **dynamic routing** driven by backend menus. This is the core architecture pattern:

- **Static Routes** (`src/router/index.ts`): Only sign-in, no-permission, wecom-callback, knowledge editor, and error page routes are hardcoded
- **Dynamic Routes**: Main application layout and content routes are registered at runtime after login
- **Layout Component** (`src/layout/index.vue`): Acts as the parent wrapper for all authenticated routes, dynamically configured by router guard

**Flow**:
1. User logs in → `useUserStore.login()`
2. Token is stored and `fetchMenusAndPerms()` is called to fetch backend menus
3. Backend menu data (with type: 1=category, 2=menu, 3=button) is transformed to route format
4. Router guard (`src/router/guard.ts`) registers the layout and child routes dynamically
5. Navigation automatically redirects to the first accessible leaf route

**Key Files**:
- `src/router/guard.ts`: Handles authentication checks and dynamic route registration
- `src/router/helper.ts`: Contains `resolveMenu()` (converts to Naive UI format) and `resolveRoute()` (converts to Vue Router format)
- `src/router/interface.ts`: Type definitions for menu/route options

### 2. State Management (Pinia)

Centralized store in `src/stores/`:

- **`user.ts`** (Primary store):
  - Stores: token, user info, menuList, routeList, permissions
  - Key methods: `login()`, `logout()`, `fetchMenusAndPerms()`, `resolveMenuRoute()`, `hasPerm()`
  - Uses `@vueuse/core` `useStorage()` for persistent token/user storage in localStorage
  - Handles menu transformation from backend format to UI format

- **`preferences.ts`**: Theme, layout, and UI preferences
- **`tabs.ts`**: Multi-tab navigation state

**Important**: Always use `storeToRefs()` when exporting store refs for proper reactivity with setup composition API.

### 3. Component Structure

- **Reusable Components** (`src/components/`):
  - `ButtonAnimation*`: Provides animated button feedback system via injection
  - `CollapseTransition*`: Smooth expand/collapse animations
  - `ScrollContainer`: Scrollable content wrapper
  - `EmptyPlaceholder`, `HintHelp`: UI utilities

- **Layout Components** (`src/layout/`):
  - `aside/`: Sidebar menu navigation
  - `header/`: Top navigation, logo, user actions
  - `main/`: Main content area
  - `tabs/`: Multi-tab interface for opened pages
  - `mobile/`: Responsive mobile layout variants
  - `footer/`: Footer area

- **View Components** (`src/views/`):
  - Follow feature-based structure (system, dashboard, data-show, etc.)
  - Components with paths like `system/user/` auto-resolve to views

### 4. API & HTTP Configuration

**Request Configuration** (`src/utils/request.ts`):
- Uses Axios with interceptors
- Base URL: `import.meta.env.VITE_API_BASE_URL` (defaults to `/api`)
- **Request Interceptor**: Automatically adds `Authorization: Bearer {token}` header
- **Response Interceptor**:
  - Returns parsed API response
  - Handles 401 errors by clearing user state and redirecting to login
  - Rejects on non-200 status codes

**API Endpoints** (`src/api/`):
- `auth.ts`: Login, logout, wecom-callback endpoints
- `menu.ts`: Fetch user menus and permissions
- All responses follow `ApiResponse<T>` format with `code`, `message`, `data`, `timestamp`

### 5. Styling & Theming

- **Tailwind CSS 4** with Vite integration (`@tailwindcss/vite`)
- **Dark Mode Support**: Implemented via Pinia preferences store and CSS variables
- **Theme System** (`src/theme/`):
  - `common.ts`: Shared theme variables
  - `light.ts`, `dark.ts`: Mode-specific Naive UI component overrides
- **Icons**: Iconify integration with Tailwind 4 plugin
  - Usage: `<span class="icon-[fluent--data-area-32-regular]"></span>`
  - Configured prefixes in `src/assets/base.css`

### 6. Build & Code Splitting

**Vite Configuration** (`vite.config.ts`):
- Runs on port 999 with strict port enforcement
- Code splitting chunks for key dependencies (echarts, naive-ui, vue, pinia, etc.)
- EsBuild drops console/debugger in production
- Asset handling with hash-based naming (exceptions for background images)

**TypeScript**:
- Strict mode enabled
- Module resolution with `@` alias pointing to `src/`
- Separate configs for app, node, vitest

## Common Development Patterns

### Adding a New Menu Item & Route

1. Backend returns menu with `path`, `name`, `component`, `children` in API response
2. Store transforms it via `transformMenusToOptions()` in user.ts
3. Router helper converts to Vue Router format via `resolveRoute()`
4. Create corresponding component at `src/views/{path}/index.vue` or `src/views/{path}.vue`
5. Component path is auto-resolved from menu's component field or path

### Checking User Permissions

```ts
const userStore = useUserStore()
if (userStore.hasPerm('permissionCode')) {
  // User has permission
}
```

### Creating Themed Components

Use Naive UI's `useThemeVars()` composable and override theme in `useComponentThemeOverrides()` from composables.

### Multi-Tab Navigation

Tab state is managed by `tabs.ts` store. Routes with `meta.showTab = true` appear as tabs in the tab bar.

## Environment Configuration

Key environment variables:
- `VITE_API_BASE_URL`: API base URL (default: `/api`)
- Dev server restricted to specific hosts: `report.tnong.com`, `192.168.1.100`
- Port: 999 (strict enforcement)

## Important Notes

- **No automatic redirects on 404**: 404s are caught by the wildcard `/:pathMatch(.*)*` route and shown via the error page view
- **Menu types**: 1=directory, 2=menu (leaf), 3=button (ignored in routing)
- **Component resolution**: Supports both `/path/file.vue` and `/path/file/index.vue` patterns
- **Token persistence**: Uses localStorage via `@vueuse/core` — manually clear if needed
- **First leaf route**: Router guard auto-redirects unauthenticated users to first valid route with a component
