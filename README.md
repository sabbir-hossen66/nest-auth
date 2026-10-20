# NestJS Authentication Server (PostgreSQL / NeonDB)

A clean, modular, production-ready NestJS authentication backend built with TypeScript, native PostgreSQL (`pg` pool, no Prisma, no PgBouncer), Bcrypt password hashing, and JWT tokens.

---

## 📁 Project Architecture & Modular Structure

```text
src/
├── common/                               # Reusable guards, decorators, interfaces
│   ├── decorators/
│   │   └── current-user.decorator.ts     # @CurrentUser() custom decorator
│   ├── guards/
│   │   └── jwt-auth.guard.ts             # JwtAuthGuard for route protection
│   └── interfaces/
│       └── jwt-payload.interface.ts      # Typed JWT payload
├── database/                             # Native PostgreSQL connection pool
│   ├── database.module.ts                # Global Database module
│   └── database.service.ts               # Connection pool, Neon SSL support, auto-table creation
├── modules/
│   ├── users/                            # User data layer
│   │   ├── dto/
│   │   │   └── create-user.dto.ts        # User creation DTO
│   │   ├── entities/
│   │   │   └── user.entity.ts            # User interface & SafeUser type
│   │   ├── users.repository.ts           # Clean SQL queries (parameterized)
│   │   ├── users.service.ts              # User retrieval & sanitization logic
│   │   └── users.module.ts
│   └── auth/                             # Authentication domain
│       ├── dto/
│       │   ├── sign-up.dto.ts            # Sign-up request validation
│       │   └── sign-in.dto.ts            # Sign-in request validation
│       ├── strategies/
│       │   └── jwt.strategy.ts           # Passport JWT validation strategy
│       ├── auth.controller.ts            # Thin HTTP controller
│       ├── auth.service.ts               # Complete authentication business logic
│       └── auth.module.ts
├── app.controller.ts                     # Health / status endpoint
├── app.module.ts                         # Root application module
└── main.ts                               # App bootstrap, CORS, Global Validation Pipe, Prefix
```

---

## ⚙️ Environment Configuration

Open `.env` and set your NeonDB connection string:

```env
PORT=8000
DATABASE_URL=postgresql://<user>:<password>@<neon-host>/<database>?sslmode=require
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
```

> **Note:** The server automatically manages table initialization on launch:
>
> ```sql
> CREATE TABLE IF NOT EXISTS users (
>   id SERIAL PRIMARY KEY,
>   email VARCHAR(255) UNIQUE NOT NULL,
>   name VARCHAR(255) NOT NULL,
>   password VARCHAR(255) NOT NULL,
>   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
>   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
> );
> ```

---

## 🚀 How to Run

```bash
# Run in development mode (hot-reload)
npm run start:dev

# Run tests
npm test
npm run test:e2e

# Build for production
npm run build
npm run start:prod
```

---

## 📡 API Endpoints

Base URL: `http://localhost:8000/api`

### 1. User Registration (Sign Up)

- **Method:** `POST`
- **URL:** `http://localhost:8000/api/auth/signup`
- **Body:**
  ```json
  {
    "name": "Sabbir Hossen",
    "email": "sabbir@example.com",
    "password": "password123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": 1,
      "email": "sabbir@example.com",
      "name": "Sabbir Hossen",
      "created_at": "2026-10-20T...",
      "updated_at": "2026-10-20T..."
    },
    "accessToken": "eyJhbGciOi..."
  }
  ```

### 2. User Login (Sign In)

- **Method:** `POST`
- **URL:** `http://localhost:8000/api/auth/signin`
- **Body:**
  ```json
  {
    "email": "sabbir@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Signed in successfully",
    "user": {
      "id": 1,
      "email": "sabbir@example.com",
      "name": "Sabbir Hossen",
      "created_at": "2026-10-20T...",
      "updated_at": "2026-10-20T..."
    },
    "accessToken": "eyJhbGciOi..."
  }
  ```

### 3. Current User Profile (Protected Route)

- **Method:** `GET`
- **URL:** `http://localhost:8000/api/auth/me`
- **Header:** `Authorization: Bearer <accessToken>`
- **Response (200 OK):**
  ```json
  {
    "user": {
      "id": 1,
      "email": "sabbir@example.com",
      "name": "Sabbir Hossen",
      "created_at": "2026-10-20T...",
      "updated_at": "2026-10-20T..."
    }
  }
  ```
