# Node.js Authentication Backend with MongoDB

This is a Node.js backend for a full-stack authentication system using Express, MongoDB, and JWT.

## Features

- User registration with email verification
- User login with JWT authentication
- Refresh tokens
- Password reset functionality
- User profile management
- Role-based authorization
- Rate limiting
- Security headers

## Technologies

- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for emails
- Express Validator for validations
- Helmet for security headers
- Morgan for logging
- CORS for cross-origin requests

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd backend
npm install
# or with pnpm
pnpm install
```

3. Create a `.env` file in the backend directory based on `.env.example`

```
# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGO_URI=mongodb://localhost:27017/fullstack_auth_db

# JWT
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_REFRESH_EXPIRE=7d

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-app-password
```

4. Start the development server:

```bash
npm run dev
# or with pnpm
pnpm dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/status` - Check authentication status

### User Management

- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update profile
- `PATCH /api/users/me/password` - Change password
- `PATCH /api/users/me/profile-image` - Update profile image
- `DELETE /api/users/me` - Delete account

## Development

### ESLint

This project uses ESLint for code linting. Run:

```bash
npm run lint
# or with pnpm
pnpm lint
```

## Environment Variables

The following environment variables are required:

- `PORT` - Port for the server (default: 5000)
- `NODE_ENV` - Environment (development, production)
- `FRONTEND_URL` - Frontend URL for CORS and email links
- `MONGO_URI` - MongoDB connection string
- `JWT_ACCESS_SECRET` - Secret for JWT access tokens
- `JWT_ACCESS_EXPIRE` - Expiration for access tokens (default: 15m)
- `JWT_REFRESH_SECRET` - Secret for JWT refresh tokens
- `JWT_REFRESH_EXPIRE` - Expiration for refresh tokens (default: 7d)
- `EMAIL_SERVICE` - Email service (e.g., gmail)
- `EMAIL_USER` - Email username/address
- `EMAIL_PASS` - Email password

## License

This project is licensed under the MIT License.
