# IMT Backend API

Express.js backend for the IMT Money Transfer System with comprehensive financial transaction management.

## 🏗️ Architecture

- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with role-based access control
- **Validation**: Zod schema validation
- **Security**: Helmet, CORS, rate limiting

## 📁 Structure

```
src/
├── api/                    # API modules
│   ├── auth/              # Authentication & user management
│   ├── transactions/      # Transaction processing
│   ├── customers/         # Customer & KYC management
│   ├── glaccounts/        # General ledger accounts
│   ├── charges/           # Fee management
│   ├── reports/           # Reporting & analytics
│   └── ...               # Other modules
├── middlewares/           # Custom middleware
│   ├── auth.middleware.ts # JWT authentication
│   ├── acl.middleware.ts  # Access control
│   └── audit.middleware.ts# Activity logging
├── seed/                  # Database seeding
└── server.ts             # Application entry point
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- PostgreSQL database

### Installation

```bash
npm install
cp .env.example .env
```

### Environment Variables

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:pass@localhost:5432/imt_db"
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed -- roles permissions countries currencies
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## 🔐 Authentication

### JWT Token Structure

```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "Admin",
  "organisation_id": "org_id"
}
```

### Protected Routes

All API routes except `/api/v1/auth/*` require authentication via:

```
Authorization: Bearer <jwt_token>
```

## 📊 API Modules

### Core Modules

- **Authentication** - Login, registration, password management
- **Users** - User CRUD, role assignment, status management
- **Transactions** - Money transfer processing, status tracking
- **Customers** - KYC, risk assessment, beneficiary management
- **GL Accounts** - Chart of accounts, balance management
- **Charges** - Fee calculation and management
- **Reports** - Transaction analytics and reporting

### Financial Modules

- **Exchange Rates** - Currency conversion rates
- **Bank Accounts** - Bank account management
- **Vaults** - Cash vault management
- **Tills** - Till operations and balancing

### Admin Modules

- **Roles** - Role and permission management
- **Organisations** - Multi-tenant organization management
- **Audit** - Activity logging and trail

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run seed         # Seed specific data
npm run seed-prod    # Production seeding
```

### Database Commands

```bash
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Run migrations
npx prisma studio      # Open database GUI
npx prisma db seed     # Run seed script
```

### Seeding

```bash
# Seed specific modules
npm run seed -- roles permissions users
npm run seed -- countries currencies
npm run seed -- organisations branches

# Seed all (development only)
npm run seed
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-Based Access Control** - Granular permissions
- **Rate Limiting** - 1000 requests per 15 minutes
- **CORS Protection** - Configurable origin whitelist
- **Input Validation** - Zod schema validation
- **Audit Logging** - Complete activity trail
- **Password Security** - bcrypt hashing

## 📝 API Documentation

### Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info"
}
```

## 🚀 Production Deployment

1. **Environment Setup**

   ```bash
   NODE_ENV=production
   DATABASE_URL=your_production_db_url
   JWT_SECRET=secure_production_secret
   ```

2. **Database Migration**

   ```bash
   npm run migrate-prod
   ```

3. **Build & Start**
   ```bash
   npm run build
   npm start
   ```

## 📊 Monitoring

- Health check: `GET /health`
- Audit logs: Available via `/api/v1/audit`
- Error tracking: Comprehensive error middleware

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Update API documentation
5. Test thoroughly
