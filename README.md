# SouthEnd Forex & Money Remittance System

A fullstack money transfer system built with React + Vite frontend and Express.js backend with Prisma ORM.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript + Prisma ORM + PostgreSQL
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Zod schema validation
- **Database**: PostgreSQL with Prisma migrations

## 📁 Project Structure

```
imt/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── auth.controller.ts
│   │   │       ├── auth.interfaces.ts
│   │   │       ├── auth.routes.ts
│   │   │       ├── auth.services.ts
│   │   │       ├── auth.utils.ts
│   │   │       ├── auth.validation.ts
│   │   │       └── index.ts
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts
│   │   ├── routes.ts
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── LoginPage.tsx
    │   │   └── Dashboard.tsx
    │   ├── services/
    │   │   └── AuthService.ts
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend directory:

   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://username:password@localhost:5432/imt_db"
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=http://localhost:5173
   ```

4. **Set up database:**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the frontend directory:

   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be running on `http://localhost:5173`

## 🔐 Authentication

The system uses JWT tokens for authentication:

- **Login**: `POST /api/v1/auth/login`
- **Register**: `POST /api/v1/auth/register`
- **Profile**: `GET /api/v1/auth/profile` (protected)

### API Endpoints

#### Authentication

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/profile` - Get user profile (protected)

#### Request/Response Format

**Login Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "USER",
    "status": "ACTIVE"
  }
}
```

## 🎨 Features

### Frontend

- **Login Page**: Beautiful dark theme login interface matching SouthEnd Forex branding
- **Dashboard**: Modern dashboard with various widgets showing:
  - Transaction metrics
  - Traffic analytics
  - Customer metrics
  - Corridor balances
  - Interactive graphs (placeholder)
- **Responsive Design**: Mobile-friendly interface
- **Authentication**: Protected routes with automatic redirects
- **Service Layer**: Centralized API calls with error handling

### Backend

- **Modular Architecture**: Organized by modules (auth, transactions, etc.)
- **Type Safety**: Full TypeScript implementation
- **Validation**: Zod schema validation for all inputs
- **Security**: JWT authentication, password hashing, rate limiting
- **Database**: Prisma ORM with PostgreSQL
- **Error Handling**: Comprehensive error handling and logging

## 🛠️ Development

### Backend Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Frontend Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🔧 Configuration

### Tailwind CSS

The frontend uses Tailwind CSS with custom configuration:

- Custom color palette matching the design
- Custom components for buttons, inputs, and cards
- Responsive design utilities

### Database Schema

The Prisma schema includes:

- User model with authentication fields
- User status enum (ACTIVE, INACTIVE, PENDING, BLOCKED)
- Proper indexing for performance

## 🚀 Deployment

### Backend Deployment

1. Set `NODE_ENV=production`
2. Update database URL for production
3. Set secure JWT secret
4. Run `npm run build`
5. Start with `npm start`

### Frontend Deployment

1. Update API base URL for production
2. Run `npm run build`
3. Deploy the `dist` folder to your hosting service

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, email johnerick8@gmail.com or create an issue in the repository.
