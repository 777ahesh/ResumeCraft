# ResumeBuilder Pro - Resume Creation Application

## Overview

ResumeBuilder Pro is a full-stack web application that allows users to create, edit, and manage professional resumes using pre-designed templates. The application features a React frontend with a Node.js/Express backend, PostgreSQL database integration, and real-time resume editing capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and build processes

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Session Management**: Express sessions with PostgreSQL session store

### Database Strategy
- **Primary Database**: PostgreSQL (configured via Drizzle)
- **Development Fallback**: In-memory storage implementation
- **Schema Management**: Drizzle migrations with schema definitions in shared directory

## Key Components

### Authentication System
- JWT token-based authentication
- User registration and login functionality
- Password hashing with bcrypt
- Admin role management for privileged operations
- Session tracking for analytics

### Resume Management
- Template-based resume creation
- Real-time WYSIWYG editing interface
- Multiple resume templates (6 professional designs)
- PDF generation capabilities
- Cloud storage for user resumes

### Template System
- Pre-designed professional templates
- Category-based organization (professional, creative, executive, minimal, tech, academic)
- Admin-managed template creation and updates
- Template preview functionality

### User Interface
- Responsive design with mobile support
- Canvas-based resume editor
- Control panel for resume data management
- Dashboard for resume overview and management
- Admin panel for system administration

## Data Flow

### Authentication Flow
1. User registers/logs in through auth modal
2. Server validates credentials and generates JWT token
3. Token stored in localStorage for subsequent requests
4. Protected routes verify token via middleware

### Resume Creation Flow
1. User selects template from template selector
2. New resume created with default data structure
3. User redirected to editor with resume ID
4. Real-time editing updates resume data
5. Changes saved automatically or manually to database

### Data Persistence
- User data and resumes stored in PostgreSQL
- Session information tracked for analytics
- Template configurations managed by admins
- File uploads and PDF generation handled server-side

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection driver
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives for shadcn/ui
- **wouter**: Lightweight routing library
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT authentication

### Development Tools
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **tailwindcss**: Utility-first CSS framework
- **framer-motion**: Animation library

## Deployment Strategy

### Build Process
- Frontend built with Vite to static assets
- Backend compiled with esbuild for production
- TypeScript compilation for type checking
- Assets served from dist/public directory

### Environment Configuration
- Database connection via DATABASE_URL environment variable
- JWT secret configuration
- Development vs production environment handling
- Replit-specific configurations for cloud deployment

### Server Setup
- Express server handles both API routes and static file serving
- Development mode uses Vite middleware for HMR
- Production mode serves pre-built static assets
- Database migrations managed via Drizzle CLI