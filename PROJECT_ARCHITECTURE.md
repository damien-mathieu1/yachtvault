# Yacht Full Stack App - Architecture

## Project Overview
This is a monorepo managed by Turborepo containing a full-stack yacht application with Next.js frontend and backend.

## Project Structure
```
yacht-app-full-stack/
├── apps/
│   ├── frontend/      # Frontend Next.js app (port 3000)
│   └── backend/       # Backend API Next.js app (port 3001)
├── packages/          # Shared packages
│   ├── ui/           # Shared UI components
│   ├── eslint-config/ # ESLint configuration
│   └── typescript-config/ # TypeScript configuration
├── turbo.json        # Turborepo configuration
└── package.json      # Root package.json
```

## Applications

### Frontend (`apps/frontend`)
- **Framework**: Next.js 15.3.0 with App Router
- **Port**: 3000
- **Features**: 
  - React 19.1.0
  - TypeScript
  - Turbopack for fast development
  - Shared UI components from `@repo/ui`

### Backend (`apps/backend`)
- **Framework**: Next.js 15.3.0 with API Routes
- **Port**: 3001
- **Features**:
  - API Routes for backend services
  - TypeScript
  - Turbopack for fast development
  - Standalone output for deployment

## API Endpoints

### Health Check
- **GET** `/api/health` - Service health status

### Yachts
- **GET** `/api/yachts` - Fetch all yachts
- **POST** `/api/yachts` - Create a new yacht

## Development

### Prerequisites
- Node.js 18.18 or later
- pnpm (recommended package manager)

### Getting Started
```bash
# Install dependencies
pnpm install

# Start all applications in development mode
pnpm dev

# Start specific application
pnpm dev --filter=frontend
pnpm dev --filter=backend
```

### Available Scripts
- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps for production
- `pnpm lint` - Run ESLint on all apps
- `pnpm format` - Format code with Prettier
- `pnpm check-types` - Type check all apps

## Configuration

### Turbopack
Both applications are configured with Turbopack for faster development builds:
- Development: Stable and enabled by default
- Production builds: Alpha support

### Monorepo Configuration
- `outputFileTracingRoot` configured for proper dependency tracing
- Shared packages for UI components and configurations
- Turborepo manages task dependencies and caching

## Deployment
Both applications are configured with `output: 'standalone'` for optimized deployment to platforms like Vercel, Netlify, or Docker containers.
