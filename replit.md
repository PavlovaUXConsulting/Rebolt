# Overview

This is a full-stack banking application built with React and Express that enables users to send money to recipients through various payment methods including PayPal, Venmo, and Rebolt. The application features a modern banking interface with transaction management, recipient selection, and a multi-step payment flow.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client is built using React with TypeScript and follows a modern component-based architecture:

- **Routing**: Uses Wouter for lightweight client-side routing with pages for Dashboard and SendMoney
- **State Management**: React Query for server state management and local React state for UI interactions
- **UI Components**: Shadcn/ui component library with Radix UI primitives for consistent design system
- **Styling**: Tailwind CSS with custom banking-themed color variables and CSS modules for specific components
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture

The server follows a REST API pattern using Express:

- **Framework**: Express.js with TypeScript for type safety
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Storage Pattern**: Repository pattern with IStorage interface for data access abstraction
- **API Structure**: RESTful endpoints for users, recipients, and transactions

## Database Design

PostgreSQL database with three main entities:

- **Users**: Stores user authentication and profile information
- **Recipients**: Manages payment recipients with support for multiple payment services
- **Transactions**: Records all payment transactions with status tracking and reference information

The schema uses Drizzle ORM with Zod validation schemas for type safety throughout the application.

## Payment Flow Architecture

Multi-step wizard pattern for money transfers:

1. **Recipient Selection**: Search and select from existing recipients or add new ones
2. **Payment Method**: Choose between PayPal, Venmo, or Rebolt based on recipient preferences
3. **Amount Entry**: Specify transfer amount, reference note, and source account
4. **Confirmation**: Review transaction details before submission
5. **Success**: Transaction completion with options for additional actions

## Authentication & Security

Currently uses a simplified authentication model with password storage (note: production implementation would require proper password hashing and session management).

## External Dependencies

- **Database**: Neon PostgreSQL serverless database with connection pooling
- **Payment Services**: Integration placeholders for PayPal, Venmo, and Rebolt (using imported logos and service identification)
- **UI Libraries**: Radix UI primitives for accessible component foundations
- **Development Tools**: Replit-specific tooling for development environment integration