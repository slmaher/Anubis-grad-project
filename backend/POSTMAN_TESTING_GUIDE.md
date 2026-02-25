# Postman Testing Guide - Revive Egypt Backend

This guide walks you through testing the **Auth** and **Users** modules using Postman.

## Prerequisites

1. **Start the backend server**:
   ```bash
   npm run dev
   ```
   Server should be running at `http://localhost:4000`

2. **Ensure MongoDB is running** (check your `.env` file for `MONGODB_URI`)

3. **Open Postman** (Desktop app or web version)

---

## Step 1: Set Up Postman Environment (Optional but Recommended)

Create a Postman Environment to store variables:

1. Click **Environments** → **+** (Create Environment)
2. Name it: `Revive Egypt Local`
3. Add variables:
   - `base_url`: `http://localhost:4000`
   - `access_token`: (leave empty, will be set automatically)
4. Save and select this environment

**Alternative**: Use the full URL `http://localhost:4000` directly in each request.

---

## Step 2: Test Health Check

**Request**: `GET http://localhost:4000/health`

**Headers**: None required

**Expected Response** (200 OK):
```json
{
  "status": "ok",
  "service": "Revive Egypt API"
}
```

✅ **If this works, your server is running correctly!**

---

## Step 3: Register a New User

**Request**: `POST http://localhost:4000/api/auth/register`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "name": "Nefertari",
  "email": "nefertari@example.com",
  "password": "secret123",
  "role": "Visitor"
}
```

**Expected Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65f0c3f3c2a3b31234567890",
      "name": "Nefertari",
      "email": "nefertari@example.com",
      "role": "Visitor"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**⚠️ Important**: Copy the `accessToken` value! You'll need it for protected routes.

**Common Errors**:
- **409 Conflict**: Email already exists
- **400 Bad Request**: Validation errors (check email format, password length, etc.)

---

## Step 4: Login (Alternative to Register)

**Request**: `POST http://localhost:4000/api/auth/login`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "email": "nefertari@example.com",
  "password": "secret123"
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65f0c3f3c2a3b31234567890",
      "name": "Nefertari",
      "email": "nefertari@example.com",
      "role": "Visitor"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Copy the `accessToken`** for the next steps.

---

## Step 5: Get Current User Profile (Protected Route)

**Request**: `GET http://localhost:4000/api/users/me`

**Headers**:
```
Authorization: Bearer <paste-your-access-token-here>
```

**Example**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "65f0c3f3c2a3b31234567890",
    "name": "Nefertari",
    "email": "nefertari@example.com",
    "role": "Visitor",
    "isActive": true,
    "createdAt": "2026-02-10T12:00:00.000Z",
    "updatedAt": "2026-02-10T12:00:00.000Z"
  }
}
```

**Common Errors**:
- **401 Unauthorized**: Missing or invalid token
- **401 Unauthorized**: Token expired (check `JWT_EXPIRES_IN` in `.env`)

---

## Step 6: Create an Admin User (For Testing Admin Routes)

First, register/login as a regular user, then create an Admin user manually in MongoDB, OR:

**Option A**: Register with Admin role (if your backend allows it):
```json
{
  "name": "Admin Ramses",
  "email": "admin@revive-egypt.com",
  "password": "admin123",
  "role": "Admin"
}
```

**Option B**: Use MongoDB Compass or `mongosh` to update a user's role:
```javascript
db.users.updateOne(
  { email: "nefertari@example.com" },
  { $set: { role: "Admin" } }
)
```

Then login again to get a new token with Admin role.

---

## Step 7: Admin Routes - List All Users

**Request**: `GET http://localhost:4000/api/users`

**Headers**:
```
Authorization: Bearer <admin-access-token>
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f0c3f3c2a3b31234567890",
      "name": "Nefertari",
      "email": "nefertari@example.com",
      "role": "Visitor",
      "isActive": true,
      "createdAt": "2026-02-10T12:00:00.000Z",
      "updatedAt": "2026-02-10T12:00:00.000Z"
    },
    {
      "_id": "65f0c3f3c2a3b31234567891",
      "name": "Admin Ramses",
      "email": "admin@revive-egypt.com",
      "role": "Admin",
      "isActive": true,
      "createdAt": "2026-02-10T12:00:00.000Z",
      "updatedAt": "2026-02-10T12:00:00.000Z"
    }
  ]
}
```

**Common Errors**:
- **403 Forbidden**: User role is not Admin
- **401 Unauthorized**: Missing or invalid token

---

## Step 8: Admin Routes - Create a User (e.g., Guide)

**Request**: `POST http://localhost:4000/api/users`

**Headers**:
```
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "name": "Guide Cleopatra",
  "email": "cleopatra.guide@example.com",
  "password": "guidepass123",
  "role": "Guide"
}
```

**Expected Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "65f0c3f3c2a3b31234567892",
    "name": "Guide Cleopatra",
    "email": "cleopatra.guide@example.com",
    "role": "Guide",
    "isActive": true,
    "createdAt": "2026-02-10T12:00:00.000Z",
    "updatedAt": "2026-02-10T12:00:00.000Z"
  }
}
```

---

## Step 9: Admin Routes - Get User by ID

**Request**: `GET http://localhost:4000/api/users/<user-id>`

**Example**: `GET http://localhost:4000/api/users/65f0c3f3c2a3b31234567890`

**Headers**:
```
Authorization: Bearer <admin-access-token>
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "65f0c3f3c2a3b31234567890",
    "name": "Nefertari",
    "email": "nefertari@example.com",
    "role": "Visitor",
    "isActive": true,
    "createdAt": "2026-02-10T12:00:00.000Z",
    "updatedAt": "2026-02-10T12:00:00.000Z"
  }
}
```

**Common Errors**:
- **404 Not Found**: User ID doesn't exist
- **403 Forbidden**: Not an Admin

---

## Step 10: Admin Routes - Update User

**Request**: `PATCH http://localhost:4000/api/users/<user-id>`

**Example**: `PATCH http://localhost:4000/api/users/65f0c3f3c2a3b31234567890`

**Headers**:
```
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

**Body** (raw JSON - all fields optional):
```json
{
  "name": "Nefertari Updated",
  "role": "Guide"
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "65f0c3f3c2a3b31234567890",
    "name": "Nefertari Updated",
    "email": "nefertari@example.com",
    "role": "Guide",
    "isActive": true,
    "createdAt": "2026-02-10T12:00:00.000Z",
    "updatedAt": "2026-02-10T12:01:00.000Z"
  }
}
```

---

## Step 11: Admin Routes - Deactivate User (Soft Delete)

**Request**: `DELETE http://localhost:4000/api/users/<user-id>`

**Example**: `DELETE http://localhost:4000/api/users/65f0c3f3c2a3b31234567890`

**Headers**:
```
Authorization: Bearer <admin-access-token>
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "65f0c3f3c2a3b31234567890",
    "name": "Nefertari Updated",
    "email": "nefertari@example.com",
    "role": "Guide",
    "isActive": false,
    "createdAt": "2026-02-10T12:00:00.000Z",
    "updatedAt": "2026-02-10T12:02:00.000Z"
  }
}
```

**Note**: This sets `isActive: false`. The user cannot login after this.

---

## Testing Error Scenarios

### 1. Invalid Login Credentials
**Request**: `POST http://localhost:4000/api/auth/login`
```json
{
  "email": "wrong@example.com",
  "password": "wrongpass"
}
```
**Expected**: `401 Unauthorized` - "Invalid credentials"

### 2. Missing Authorization Header
**Request**: `GET http://localhost:4000/api/users/me` (no Authorization header)
**Expected**: `401 Unauthorized` - "Missing or invalid token"

### 3. Invalid Token
**Request**: `GET http://localhost:4000/api/users/me`
**Headers**: `Authorization: Bearer invalid-token-here`
**Expected**: `401 Unauthorized` - "Invalid or expired token"

### 4. Visitor Trying Admin Route
**Request**: `GET http://localhost:4000/api/users` (with Visitor token)
**Expected**: `403 Forbidden` - "Forbidden: insufficient role"

### 5. Validation Errors
**Request**: `POST http://localhost:4000/api/auth/register`
```json
{
  "name": "A",
  "email": "invalid-email",
  "password": "123"
}
```
**Expected**: `400 Bad Request` with validation error details

---

## Postman Collection Setup Tips

### Automatically Save Token

1. In Postman, after login/register, go to **Tests** tab
2. Add this script:
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.accessToken) {
        pm.environment.set("access_token", jsonData.data.accessToken);
    }
}
```

3. Then in **Authorization** tab for protected routes, select:
   - Type: `Bearer Token`
   - Token: `{{access_token}}`

### Create a Collection

1. Create a new Collection: **Revive Egypt API**
2. Organize folders:
   - **Auth** (register, login)
   - **Users** (me, list, create, get, update, delete)
3. Set collection-level variables:
   - `base_url`: `http://localhost:4000`
4. Use `{{base_url}}/api/auth/register` in requests

---

## Quick Test Checklist

- [ ] Health check works
- [ ] Register new user
- [ ] Login with credentials
- [ ] Get current user profile (with token)
- [ ] Create Admin user (or update role in DB)
- [ ] Login as Admin
- [ ] List all users (Admin only)
- [ ] Create Guide user (Admin only)
- [ ] Get user by ID (Admin only)
- [ ] Update user (Admin only)
- [ ] Deactivate user (Admin only)
- [ ] Test error scenarios (invalid token, wrong role, etc.)

---

## Troubleshooting

**Server not starting?**
- Check MongoDB connection string in `.env`
- Ensure port 4000 is not in use
- Run `npm install` if dependencies are missing

**401 Unauthorized errors?**
- Check token is copied correctly (no extra spaces)
- Verify token hasn't expired (check `JWT_EXPIRES_IN` in `.env`)
- Ensure `Authorization: Bearer <token>` format is correct

**403 Forbidden errors?**
- User role must be `Admin` for admin routes
- Check user's `role` field in MongoDB

**Validation errors?**
- Email must be valid format
- Password must be 6-64 characters
- Name must be at least 2 characters

---

Happy Testing! 🚀
