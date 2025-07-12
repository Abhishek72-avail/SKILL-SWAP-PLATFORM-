# SkillSwap - Professional Skill Exchange Platform

## Overview

SkillSwap is a full-stack web application that enables professionals to exchange skills through a structured platform. Users can list their offered skills, browse available skills from other users, send swap requests, and manage their professional profiles. The application features a modern React frontend with a Node.js/Express backend, using MongoDB Atlas for data persistence and custom username/password authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

- **Frontend**: React with TypeScript, using Vite for development and building
- **Backend**: Express.js server with TypeScript
- **Database**: MongoDB Atlas with Mongoose ODM for data modeling
- **Authentication**: Custom username/password system with Passport.js and bcrypt
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
- **Database Layer**: Mongoose ODM with MongoDB Atlas
- **Authentication**: Passport.js with Local Strategy for username/password authentication
- **Session Management**: Express sessions stored in MongoDB
- **API Design**: RESTful endpoints with proper error handling and logging

### Database Schema
The MongoDB database includes the following main collections:
- **Users**: Profile information with username/password authentication, ratings, and preferences
- **Skills**: User skills categorized as "offered" or "wanted"
- **SwapRequests**: Skill exchange requests between users
- **Reviews**: User feedback and ratings system
- **Sessions**: Authentication session storage for custom login system

## Data Flow

1. **Authentication Flow**: Users register and sign in with username/password, with sessions stored in MongoDB
2. **Skill Management**: Users can create, update, and delete their skills through forms
3. **Discovery**: Browse other users' skills with search and filtering capabilities
4. **Request System**: Send swap requests specifying offered and wanted skills
5. **Review System**: Rate and review completed skill exchanges

## External Dependencies

### Core Dependencies
- **Mongoose**: MongoDB object modeling and validation
- **MongoDB Atlas**: Cloud-hosted MongoDB database
- **Passport.js**: Authentication middleware with Local Strategy
- **bcrypt**: Password hashing for secure authentication
- **TanStack Query**: Server state management and caching

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
- **Database**: MongoDB Atlas with Mongoose connection management

### Production Build Process
1. **Frontend Build**: Vite builds React app to static files
2. **Backend Build**: esbuild bundles Express server for production
3. **Database Connection**: MongoDB Atlas handles data persistence
4. **Static Serving**: Express serves built frontend in production

### Environment Configuration
- **MONGODB_URL**: MongoDB Atlas connection string
- **SESSION_SECRET**: Secure session encryption key for custom authentication

## Recent Changes (January 2025)

- **Database Migration**: Successfully migrated from PostgreSQL with Drizzle ORM to MongoDB Atlas with Mongoose
- **Authentication System**: Replaced Replit Auth with custom username/password authentication using Passport.js Local Strategy
- **User Registration**: Added custom registration page with username, password, and optional location fields
- **Session Management**: Implemented MongoDB-based session storage with connect-mongo
- **Security**: Added bcrypt password hashing for secure credential storage
- **Pages**: Created dedicated sign-in and registration pages with professional design

The application uses environment-based configuration with development and production modes, ensuring proper security measures and performance optimizations for each environment.