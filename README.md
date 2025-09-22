# IMT Money Transfer System

A comprehensive money transfer platform with role-based access control, transaction management, and financial reporting capabilities.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript + Prisma ORM + PostgreSQL
- **Authentication**: JWT tokens with role-based permissions
- **Database**: PostgreSQL with comprehensive financial schema

## 📁 Project Structure

```
imt/
├── backend/                 # Express.js API server
│   ├── src/api/            # API modules (auth, transactions, etc.)
│   ├── src/middlewares/    # Authentication, ACL, audit
│   ├── src/seed/           # Database seeding
│   └── prisma/             # Database schema & migrations
└── frontend/               # React application
    ├── src/pages/          # Application pages
    ├── src/components/     # Reusable UI components
    ├── src/hooks/          # Custom React hooks
    └── src/services/       # API service layer
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure your environment
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env  # Set VITE_API_BASE_URL
npm run dev
```

## 🔐 Key Features

### Core Modules

- **Authentication & Authorization** - JWT-based with role permissions
- **User Management** - Multi-role user system with profiles
- **Transaction Processing** - Inbound/outbound money transfers
- **Financial Management** - GL accounts, charges, exchange rates
- **Customer Management** - KYC, risk assessment, beneficiaries
- **Reporting & Analytics** - Transaction reports and dashboards
- **Audit Trail** - Comprehensive activity logging

### Security Features

- Role-based access control (RBAC)
- Session management with inactivity timeout
- Password policies and reset functionality
- Rate limiting and CORS protection
- Comprehensive audit logging

## 🛠️ Development

### Backend Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run seed         # Seed database
```

### Frontend Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview build
```

## 📊 API Endpoints

### Core APIs

- `/api/v1/auth/*` - Authentication & user management
- `/api/v1/transactions/*` - Transaction processing
- `/api/v1/customers/*` - Customer management
- `/api/v1/glaccounts/*` - Financial accounts
- `/api/v1/reports/*` - Reporting & analytics
- `/api/v1/dashboard/*` - Dashboard data

### Admin APIs

- `/api/v1/users/*` - User administration
- `/api/v1/roles/*` - Role management
- `/api/v1/organisations/*` - Organization management

## 🚀 Deployment

### Backend

1. Set production environment variables
2. Run database migrations: `npm run migrate-prod`
3. Build and start: `npm run build && npm start`

### Frontend

1. Set `VITE_API_BASE_URL` for production
2. Build: `npm run build`
3. Deploy `dist/` folder

## 📝 License

MIT License - see LICENSE file for details.

## 📞 Support

For support, contact johnerick8@gmail.com or create an issue.
