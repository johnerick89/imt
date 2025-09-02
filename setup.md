# Setup Guide

## Backend Setup

1. **Create environment file:**

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up database:**

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

## Frontend Setup

1. **Create environment file:**

   ```bash
   cd frontend
   # Create .env file with: VITE_API_BASE_URL=http://localhost:5000
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/imt_db"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Testing

1. **Test backend:**

   ```bash
   cd backend
   node test-server.js
   ```

2. **Test frontend:**
   - Open http://localhost:5173
   - Should redirect to login page
   - Create an account or login with existing credentials
