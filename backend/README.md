# Node.js Express PostgreSQL Authentication Backend

A comprehensive authentication backend built with Node.js, Express, and PostgreSQL, featuring secure user management and authentication workflows.

## Features

- **User Authentication**
  - Registration with email verification
  - Login with JWT authentication
  - Password reset functionality
  - Access and refresh tokens
  - Session management

- **User Management**
  - Profile viewing and editing
  - Password changing
  - Profile image setting
  - Account deletion

- **Security**
  - Password hashing with bcrypt
  - Input validation
  - Rate limiting
  - HTTPS headers with Helmet
  - CORS protection
  - HTTP-only cookies for refresh tokens

## Prerequisites

- Node.js (v14+)
- PostgreSQL

## Installation

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Set up PostgreSQL database and update the connection details in `.env`

## Running the Application

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## API Endpoints

### Authentication

- **POST /api/auth/register** - Register a new user
- **GET /api/auth/verify-email/:token** - Verify email address
- **POST /api/auth/login** - Login user
- **POST /api/auth/logout** - Logout user
- **POST /api/auth/refresh-token** - Refresh access token
- **POST /api/auth/forgot-password** - Initiate password reset
- **POST /api/auth/reset-password/:token** - Reset password

### User Management

- **GET /api/users/me** - Get current user profile
- **PUT /api/users/profile** - Update user profile
- **PUT /api/users/change-password** - Change password
- **PUT /api/users/profile-image** - Update profile image
- **DELETE /api/users/account** - Delete user account

## Environment Variables

```
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
EMAIL_FROM=your_email@example.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Project Structure

```
server/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── utils/          # Utility functions
└── index.js        # Entry point
```

## Security Best Practices

- Passwords are hashed using bcrypt
- JWT tokens with limited lifetime
- HTTP-only cookies for refresh tokens
- Input validation for all endpoints
- Rate limiting to prevent brute force attacks
- Secure HTTP headers with Helmet
- CORS protection