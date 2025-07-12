# SkillSwap - Professional Skill Exchange Platform

## Overview

SkillSwap is a full-stack web application that enables professionals to exchange skills through a structured platform. Users can list their offered skills, browse available skills from other users, send swap requests, and manage their professional profiles. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and Replit Auth for authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

- **Frontend**: React with TypeScript, using Vite for development and building
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect (OIDC)
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **React Router**: Uses Wouter for client-side routing
- **Component Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Odoo-inspired color palette
- **State Management**: TanStack Query for API data fetching and caching
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Database Layer**: Drizzle ORM with Neon serverless PostgreSQL
- **Authentication**: Passport.js with OpenID Connect strategy for Replit Auth
- **Session Management**: Express sessions stored in PostgreSQL
- **API Design**: RESTful endpoints with proper error handling and logging

### Database Schema
The schema includes the following main entities:
- **Users**: Profile information, ratings, and preferences
- **Skills**: User skills categorized as "offered" or "wanted"
- **Swap Requests**: Skill exchange requests between users
- **Reviews**: User feedback and ratings system
- **Platform Messages**: System notifications and communications
- **Sessions**: Authentication session storage (required for Replit Auth)

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, with sessions stored in PostgreSQL
2. **Skill Management**: Users can create, update, and delete their skills through forms
3. **Discovery**: Browse other users' skills with search and filtering capabilities
4. **Request System**: Send swap requests specifying offered and wanted skills
5. **Communication**: Platform messaging system for coordinating exchanges
6. **Review System**: Rate and review completed skill exchanges

## External Dependencies

### Core Dependencies
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Auth**: Authentication service integration
- **TanStack Query**: Server state management and caching
- **Zod**: Schema validation for forms and API requests

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Modern icon library
- **shadcn/ui**: Pre-built component library

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

### Development
- **Frontend**: Vite development server with hot module replacement
- **Backend**: tsx for TypeScript execution in development
- **Database**: Neon serverless PostgreSQL with connection pooling

### Production Build Process
1. **Frontend Build**: Vite builds React app to static files
2. **Backend Build**: esbuild bundles Express server for production
3. **Database Migrations**: Drizzle handles schema migrations
4. **Static Serving**: Express serves built frontend in production

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Secure session encryption key
- **REPLIT_DOMAINS**: Allowed domains for Replit Auth
- **ISSUER_URL**: OIDC issuer URL for authentication

The application uses environment-based configuration with development and production modes, ensuring proper security measures and performance optimizations for each environment.