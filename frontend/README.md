# IMT Frontend

React-based frontend for the IMT Money Transfer System with modern UI/UX and comprehensive financial management capabilities.

## 🏗️ Architecture

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Query for server state
- **Routing**: React Router v7
- **Forms**: React Hook Form with validation
- **UI Components**: Custom component library

## 📁 Structure

```
src/
├── components/           # Reusable UI components
│   ├── tables/          # Data table components
│   ├── forms/           # Form components
│   ├── modals/          # Modal dialogs
│   └── ui/              # Base UI components
├── pages/               # Application pages
│   ├── DashboardPage.tsx
│   ├── TransactionsPage.tsx
│   ├── UsersPage.tsx
│   └── ...             # Other pages
├── hooks/               # Custom React hooks
├── services/            # API service layer
├── contexts/            # React contexts
├── types/               # TypeScript definitions
└── utils/               # Utility functions
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- Backend API running

### Installation

```bash
npm install
cp .env.example .env
```

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Development

```bash
npm run dev
```

Application runs on `http://localhost:5173`

## 🎨 Key Features

### Core Pages

- **Dashboard** - Analytics, metrics, and overview
- **Transactions** - Inbound/outbound money transfers
- **Users** - User management with role-based access
- **Customers** - Customer profiles and KYC management
- **GL Accounts** - General ledger account management
- **Reports** - Financial reporting and analytics

### UI Components

- **Data Tables** - Sortable, filterable, paginated tables
- **Forms** - Validated forms with error handling
- **Modals** - Confirmation, creation, and detail modals
- **Charts** - Financial data visualization
- **Navigation** - Role-based navigation menu

### User Experience

- **Responsive Design** - Mobile-first approach
- **Dark Theme** - Professional dark UI
- **Loading States** - Skeleton loaders and spinners
- **Error Handling** - Toast notifications and error boundaries
- **Session Management** - Auto-logout with warning modal

## 🔐 Authentication & Authorization

### Session Management

- JWT token-based authentication
- Automatic session refresh
- Inactivity timeout (20 minutes)
- Role-based navigation and permissions

### Access Control

- Frontend ACL system matching backend permissions
- Conditional rendering based on user roles
- Protected routes with automatic redirects
- Permission-based action visibility

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Key Technologies

- **React Query** - Server state management and caching
- **Axios** - HTTP client with interceptors
- **React Hook Form** - Form handling and validation
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations and transitions

## 📊 Component Library

### Data Tables

- `UsersTable` - User management with actions
- `TransactionsTable` - Transaction listing
- `CustomersTable` - Customer data display
- `GlAccountsTable` - GL account management

### Forms

- `UserForm` - User creation and editing
- `TransactionForm` - Transaction processing
- `CustomerForm` - Customer registration
- `PasswordModals` - Password management

### Modals

- `ConfirmModal` - Action confirmations
- `ViewModals` - Detail view dialogs
- `InactivityWarningModal` - Session timeout warning

## 🎨 Styling

### Tailwind Configuration

- Custom color palette
- Dark theme support
- Responsive breakpoints
- Component-specific utilities

### Design System

- Consistent spacing and typography
- Reusable button and input styles
- Card-based layouts
- Professional financial UI

## 🔧 State Management

### React Query

- Automatic caching and background updates
- Optimistic updates for mutations
- Error handling and retry logic
- Loading state management

### Context Providers

- `SessionContext` - User authentication state
- `ToastContext` - Global notification system

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interactions
- Adaptive navigation

## 🚀 Production Build

### Build Process

```bash
npm run build
```

### Deployment

1. Set `VITE_API_BASE_URL` for production
2. Build the application
3. Deploy `dist/` folder to hosting service

### Performance

- Code splitting with dynamic imports
- Optimized bundle size
- Lazy loading for routes
- Image optimization

## 🧪 Development Guidelines

### Code Standards

- TypeScript for type safety
- ESLint for code quality
- Consistent component structure
- Proper error handling

### Component Patterns

- Functional components with hooks
- Custom hooks for reusable logic
- Props interfaces for type safety
- Consistent naming conventions

## 📝 API Integration

### Service Layer

- Centralized API calls
- Error handling with interceptors
- Request/response transformation
- Type-safe API contracts

### Data Flow

1. User interaction triggers action
2. Service layer makes API call
3. React Query manages state
4. UI updates automatically
5. Error handling via toast notifications
