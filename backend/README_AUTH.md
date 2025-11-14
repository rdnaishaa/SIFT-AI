# Authentication API Documentation

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Variables

Buat file `.env` di folder `backend/` dengan isi:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
SECRET_KEY=your-super-secret-key-min-32-characters
```

### 3. Jalankan Server

```bash
python run_server.py
```

## API Endpoints

### Base URL

```
http://localhost:8000
```

### 1. Register User Baru

**Endpoint:** `POST /auth/register`

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2025-11-08T10:30:00"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Email atau username sudah terdaftar
- `500 Internal Server Error` - Server error

### 2. Login

**Endpoint:** `POST /auth/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2025-11-08T10:30:00"
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Email atau password salah
- `500 Internal Server Error` - Server error

### 3. Get Current User (Protected Route)

**Endpoint:** `GET /auth/me`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "user_id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2025-11-08T10:30:00"
}
```

**Error Responses:**

- `401 Unauthorized` - Token tidak valid atau tidak ada
- `404 Not Found` - User tidak ditemukan
- `500 Internal Server Error` - Server error

## Struktur File

```
backend/
├── FastAPI/
│   ├── main.py           # Main FastAPI app
│   ├── database.py       # Database connection & utilities
│   ├── models.py         # Pydantic models
│   ├── auth.py           # JWT & password utilities
│   └── users.py          # Authentication routes
├── .env                  # Environment variables (tidak di-commit)
├── .env.example          # Template environment variables
└── requirements.txt      # Python dependencies
```

## Cara Menggunakan di Frontend

### 1. Register

```javascript
const register = async (username, email, password) => {
  const response = await fetch("http://localhost:8000/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json();

  if (response.ok) {
    // Simpan token
    localStorage.setItem("access_token", data.access_token);
    return data;
  } else {
    throw new Error(data.detail);
  }
};
```

### 2. Login

```javascript
const login = async (email, password) => {
  const response = await fetch("http://localhost:8000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (response.ok) {
    // Simpan token
    localStorage.setItem("access_token", data.access_token);
    return data;
  } else {
    throw new Error(data.detail);
  }
};
```

### 3. Menggunakan Protected Route

```javascript
const getCurrentUser = async () => {
  const token = localStorage.getItem("access_token");

  const response = await fetch("http://localhost:8000/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (response.ok) {
    return data;
  } else {
    throw new Error(data.detail);
  }
};
```

## Testing dengan cURL

### Register

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","email":"john@example.com","password":"securepass123"}'
```

### Login

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"securepass123"}'
```

### Get Current User

```bash
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Security Notes

1. **SECRET_KEY**: Ganti dengan key yang aman dan random (minimal 32 karakter)
2. **Password**: Minimum 6 karakter (bisa ditingkatkan sesuai kebutuhan)
3. **Token Expiration**: Default 7 hari (bisa diubah di `auth.py`)
4. **HTTPS**: Di production, gunakan HTTPS untuk semua request
5. **Password Hashing**: Menggunakan bcrypt untuk hashing password

## Interactive API Documentation

Setelah server berjalan, buka browser:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
