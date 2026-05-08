# Postman Testing Guide - Revive Egypt Backend

This guide helps you test Auth and Users endpoints quickly with one Postman environment that works for both PC and phone testing.

The collection now also includes Posts test cases (list, create, like, comment, delete) and additional Users profile/update tests.

## Prerequisites

1. Start backend from the `backend` folder:
```bash
npm run dev
```

2. Confirm MongoDB is available and backend `.env` is configured.

3. Make sure your API is reachable:
- PC test: `http://localhost:4000`
- Phone/LAN test: `http://<your-pc-ip>:4000`

4. Open Postman desktop app.

## Step 1: Create Postman Environment

Create environment `Revive Egypt` with these variables:

- `base_url`: `http://localhost:4000` (or your LAN IP for mobile/LAN testing)
- `access_token`: leave empty
- `user_id`: leave empty

You can switch only `base_url` later without editing request URLs.

## Step 2: Health Check

Request:

`GET {{base_url}}/health`

Expected 200:
```json
{
  "status": "ok",
  "service": "Revive Egypt API"
}
```

## Step 3: Register User

Request:

`POST {{base_url}}/api/auth/register`

Headers:
```text
Content-Type: application/json
```

Body:
```json
{
  "name": "Nefertari",
  "email": "nefertari@example.com",
  "password": "secret123",
  "role": "Visitor"
}
```

## Step 4: Login

Request:

`POST {{base_url}}/api/auth/login`

Body:
```json
{
  "email": "nefertari@example.com",
  "password": "secret123"
}
```

Expected response contains `data.accessToken`.

## Step 5: Auto-Save Token in Postman

In the `Tests` tab of Register and Login requests, paste:

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
  const data = pm.response.json();
  if (data?.data?.accessToken) {
    pm.environment.set("access_token", data.data.accessToken);
  }
  if (data?.data?.user?._id) {
    pm.environment.set("user_id", data.data.user._id);
  }
}
```

For protected requests, use header:

```text
Authorization: Bearer {{access_token}}
```

## Step 6: Get Current User

Request:

`GET {{base_url}}/api/users/me`

Expected 200 with current user object.

## Step 7: Admin Flow

1. Promote your test user to Admin in MongoDB:
```javascript
db.users.updateOne(
  { email: "nefertari@example.com" },
  { $set: { role: "Admin" } }
)
```

2. Login again to get a fresh admin token.

3. Test admin endpoints:
- `GET {{base_url}}/api/users`
- `POST {{base_url}}/api/users`
- `GET {{base_url}}/api/users/{{user_id}}`
- `PATCH {{base_url}}/api/users/{{user_id}}`
- `DELETE {{base_url}}/api/users/{{user_id}}`

4. Test extra user endpoints:
- `PATCH {{base_url}}/api/users/me`
- `GET {{base_url}}/api/users/profile/{{user_id}}`

5. Test posts endpoints:
- `GET {{base_url}}/api/posts`
- `GET {{base_url}}/api/posts?userId={{user_id}}`
- `POST {{base_url}}/api/posts`
- `POST {{base_url}}/api/posts/{{post_id}}/like`
- `POST {{base_url}}/api/posts/{{post_id}}/comments`
- `DELETE {{base_url}}/api/posts/{{post_id}}`

Example create body:
```json
{
  "name": "Guide Cleopatra",
  "email": "cleopatra.guide@example.com",
  "password": "guidepass123",
  "role": "Guide"
}
```

## Error Scenarios to Verify

1. Invalid login credentials -> `401`
2. Missing Authorization header on protected route -> `401`
3. Invalid token -> `401`
4. Visitor token on admin route -> `403`
5. Invalid register payload -> `400`

In the Postman collection, run the `Error and Security Tests` folder to validate these quickly with built-in assertions.

Run the `Posts` folder after login so `{{access_token}}` and `{{user_id}}` are already set.

## Mobile and PC Testing Notes

1. If testing from your PC, use `base_url = http://localhost:4000`.
2. If testing across LAN/phone, use `base_url = http://<your-pc-ip>:4000`.
3. Keep backend running on `0.0.0.0` (already configured in this project).
4. Ensure same Wi-Fi and firewall allows port `4000`.

## Troubleshooting

1. Health check fails:
- Verify backend started successfully.
- Verify port `4000` is free.

2. `401 Unauthorized`:
- Token missing/expired.
- Wrong `Authorization` format.

3. `403 Forbidden`:
- Token user is not Admin for admin endpoints.

4. No response from phone/LAN:
- Wrong IP in `base_url`.
- Different network.
- Firewall blocks inbound `4000`.

Happy testing.
