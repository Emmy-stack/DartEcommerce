# Darté - Modern Marketplace Application

## Overview

Darté is a full-stack marketplace application that connects buyers and sellers in a modern e-commerce platform. The application features a React TypeScript frontend with a Node.js Express backend, utilizing PostgreSQL for data persistence and Neon Database as the cloud database provider.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack monorepo architecture with clear separation between client-side and server-side code:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

## Key Components

### Database Schema (shared/schema.ts)
- **Users**: Stores user profiles with role-based access (buyer/seller/admin)
- **Categories**: Product categorization system with visual styling
- **Products**: Main product catalog with seller associations
- **Favorites**: User wishlist functionality
- **Cart Items**: Shopping cart management
- **Orders**: Order processing and history
- **Seller Applications**: Seller approval workflow
- **Sessions**: Authentication session storage

### Authentication System
- **Provider**: Replit Auth integration
- **Strategy**: Passport.js with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **User Roles**: Multi-tier access control (buyer, seller, admin)

### API Structure
- **RESTful Design**: Express routes with proper HTTP methods
- **Authentication Middleware**: Protected routes with user context
- **Error Handling**: Centralized error management
- **Request Logging**: Detailed API request/response logging

### Frontend Components
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Comprehensive shadcn/ui integration
- **Theme System**: Light/dark mode support
- **Form Handling**: React Hook Form with Zod validation

## Data Flow

1. **Authentication Flow**:
   - User initiates login through Replit Auth
   - Server validates OIDC tokens and creates session
   - Client receives authenticated user context
   - Role-based route protection applied

2. **Product Management**:
   - Sellers create products through dashboard
   - Admin approval required for seller accounts
   - Products categorized and displayed on marketplace
   - Real-time favorites and cart management

3. **E-commerce Operations**:
   - Browse products by category or search
   - Add to favorites/cart functionality
   - Order processing and history tracking
   - Seller dashboard for inventory management

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **@neondatabase/serverless**: Connection pooling and WebSocket support

### Authentication & Security
- **Replit Auth**: OAuth 2.0 / OIDC provider
- **Passport.js**: Authentication middleware
- **Express Sessions**: Secure session management

### UI & Styling
- **Tailwind CSS**: Utility-first styling framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **shadcn/ui**: Pre-built component system

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production
- **Drizzle Kit**: Database migration management

## Deployment Strategy

### Development Environment
- **Hot Module Replacement**: Vite dev server with Express middleware
- **Development Logging**: Detailed request/response tracking
- **Environment Variables**: Database URL and session secrets

### Production Build
- **Frontend**: Vite static build output to `dist/public`
- **Backend**: ESBuild bundling of server code to `dist/index.js`
- **Database**: Drizzle migrations with PostgreSQL
- **Session Storage**: Production-ready PostgreSQL session store

### Environment Configuration
- **DATABASE_URL**: Required for Neon Database connection
- **SESSION_SECRET**: Required for secure session management
- **REPL_ID & ISSUER_URL**: Required for Replit Auth integration
- **REPLIT_DOMAINS**: Required for OIDC domain validation

The application is designed to be Replit-native, leveraging Replit's authentication system and development environment while maintaining the flexibility to deploy elsewhere with minimal configuration changes.