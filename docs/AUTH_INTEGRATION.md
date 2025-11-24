# 🔐 Authentication Integration Guide

## Overview

Your SIEM Dashboard now has complete JWT-based authentication integration with the Flask backend.

---

## ✅ What Was Updated

### 1. **Environment Configuration**

**`.env`** and **`.env.example`**
```bash
REACT_APP_API_URL=http://localhost:5000/api  # Updated to include /api
REACT_APP_USE_MOCK_DATA=false
```

### 2. **Protected API Client** (`src/api/apiClient.js`)

Created a new axios instance with:
- ✅ Automatic JWT token injection on all requests
- ✅ Authorization header: `Bearer <token>`
- ✅ Automatic 401 error handling
- ✅ Auto-redirect to login on unauthorized access
- ✅ Automatic token cleanup on auth failure

### 3. **Login Page** (`src/pages/LoginPage.jsx`)

Updated `handleLogin` to:
- ✅ Store JWT token in localStorage
- ✅ Store user information
- ✅ Set authentication flag
- ✅ Better error handling
- ✅ Success message display

### 4. **Register Page** (`src/pages/RegisterPage.jsx`)

Updated `handleRegister` to:
- ✅ Use correct API endpoint
- ✅ Show success message
- ✅ Auto-redirect after 1.5 seconds
- ✅ Improved error messages

### 5. **Protected Route** (`src/components/ProtectedRoute.jsx`)

Enhanced to check:
- ✅ Authentication flag (`isAuthenticated`)
- ✅ JWT token presence
- ✅ Proper redirect to login if either missing

### 6. **Dashboard** (`src/AdvancedDashboard.jsx`)

Updated to:
- ✅ Use protected API client
- ✅ Call logout endpoint on backend
- ✅ Clear all auth data on logout
- ✅ Automatic token validation

---

## 🚀 Quick Start

### Step 1: Start Backend
```bash
cd SIEM_Tool_AWS
python app.py
# Backend running on http://localhost:5000
```

### Step 2: Start Frontend
```bash
cd cloud-security-ui
npm start
# Frontend running on http://localhost:3000
```

### Step 3: Test Authentication Flow

1. **Register New User**
   - Navigate to: http://localhost:3000/register
   - Fill in: Name, Email, Password
   - Click "Register"
   - Should redirect to login

2. **Login**
   - Navigate to: http://localhost:3000/login
   - Enter credentials
   - Click "Login"
   - Should redirect to dashboard

3. **Access Dashboard**
   - Should see metrics and data
   - Token automatically sent with requests

4. **Logout**
   - Click "Logout" button
   - Should clear session and redirect to login

---

## 🔍 How It Works

### Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. User enters credentials on Login Page              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  2. POST /api/login with { email, password }           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  3. Backend validates and returns JWT token             │
│     Response: { token, user: { name, email } }          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  4. Frontend stores in localStorage:                    │
│     - token: "eyJhbGciOiJIUzI1..."                      │
│     - user: {"name":"John","email":"john@example.com"}  │
│     - isAuthenticated: "true"                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  5. Redirect to Dashboard (/)                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  6. ProtectedRoute checks token existence               │
│     - If valid: Render dashboard                        │
│     - If missing: Redirect to /login                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  7. API requests automatically include:                 │
│     Authorization: Bearer <token>                       │
└─────────────────────────────────────────────────────────┘
```

### API Request Flow

```javascript
// User clicks to fetch metrics
fetchALBMetrics()
  ↓
// apiClient.js interceptor adds token
headers: { Authorization: "Bearer eyJhbGc..." }
  ↓
// Request sent to backend
GET /api/metrics/alb?time_range=1h
  ↓
// Backend validates token
jwt.verify(token, secret)
  ↓
// If valid: Return data
{ RequestCount: {...}, TargetResponseTime: {...} }
  ↓
// If invalid (401): Interceptor catches
Clear localStorage → Redirect to /login
```

---

## 📝 localStorage Structure

After successful login, localStorage contains:

```javascript
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isAuthenticated": "true",
  "user": "{\"name\":\"John Doe\",\"email\":\"john@example.com\"}"
}
```

### Accessing User Info in Components

```javascript
// Get user information
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log(user.name);  // "John Doe"
console.log(user.email); // "john@example.com"

// Check if authenticated
const isAuth = localStorage.getItem('isAuthenticated') === 'true';
const token = localStorage.getItem('token');
```

---

## 🔧 Using the Protected API Client

### In Your Components

```javascript
import api from '../api/apiClient';

// All requests automatically include JWT token
const fetchData = async () => {
  try {
    // Token is automatically added to headers
    const response = await api.get('/metrics/alb', {
      params: { time_range: '1h' }
    });
    
    console.log(response.data);
  } catch (error) {
    // 401 errors automatically handled - redirects to login
    console.error('Error:', error);
  }
};

// POST request
const updateSettings = async (settings) => {
  try {
    const response = await api.post('/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Available API Endpoints

#### **Public (No Auth Required)**
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

#### **Protected (Requires JWT Token)**
- `POST /api/logout` - Logout current user
- `GET /api/me` - Get current user info
- `GET /api/metrics/alb` - ALB metrics
- `GET /api/metrics/rds` - RDS metrics
- `GET /api/metrics/vpc` - VPC stats
- `GET /api/metrics/asg` - Auto Scaling metrics
- `GET /api/metrics/sagemaker` - ML metrics
- `GET /api/threats/classifications` - Threat data
- `GET /api/threats/events` - Security events

---

## 🧪 Testing

### Manual Testing

**1. Test Registration**
```bash
# Open browser to http://localhost:3000/register
# Fill form and submit
# Should redirect to login page
```

**2. Test Login**
```bash
# Open browser to http://localhost:3000/login
# Enter credentials
# Check browser console for:
# - "Login successful!"
# - localStorage should contain token
```

**3. Test Protected Routes**
```bash
# While logged in, navigate to http://localhost:3000/
# Should see dashboard

# Clear localStorage
# Navigate to http://localhost:3000/
# Should redirect to /login
```

**4. Test Logout**
```bash
# Click logout button
# Should redirect to login
# localStorage should be cleared
```

### Testing with Browser DevTools

```javascript
// Open Console (F12)

// Check token
console.log(localStorage.getItem('token'));

// Check user
console.log(JSON.parse(localStorage.getItem('user')));

// Manually clear auth (test protection)
localStorage.clear();
// Then navigate to dashboard - should redirect to login

// Test API call
fetch('http://localhost:5000/api/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
  .then(r => r.json())
  .then(console.log);
```

### Testing with cURL

```bash
# 1. Register user
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# 2. Login and get token
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Response will include token:
# {"token": "eyJhbGc...", "user": {...}}

# 3. Test protected endpoint (replace TOKEN with actual token)
curl -X GET http://localhost:5000/api/me \
  -H "Authorization: Bearer TOKEN"

# 4. Test metrics endpoint
curl -X GET http://localhost:5000/api/metrics/alb?time_range=1h \
  -H "Authorization: Bearer TOKEN"

# 5. Logout
curl -X POST http://localhost:5000/api/logout \
  -H "Authorization: Bearer TOKEN"
```

---

## 🐛 Troubleshooting

### Issue: "401 Unauthorized" on Dashboard

**Cause:** Token invalid or missing

**Solution:**
```javascript
// Check token in console
console.log('Token:', localStorage.getItem('token'));

// If null or undefined, login again
// If present but getting 401, token might be expired
```

### Issue: Infinite Login Redirect Loop

**Cause:** Token not being saved properly

**Solution:**
```javascript
// After login, check:
console.log('isAuthenticated:', localStorage.getItem('isAuthenticated'));
console.log('token:', localStorage.getItem('token'));

// Both should have values
// isAuthenticated should be string "true" not boolean
```

### Issue: CORS Error

**Cause:** Backend CORS not configured

**Solution in Flask backend:**
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=['http://localhost:3000'])
```

### Issue: Token Not Sent with Requests

**Cause:** Not using protected API client

**Solution:**
```javascript
// ❌ Don't use
import axios from 'axios';

// ✅ Use protected client
import api from '../api/apiClient';
```

### Issue: "Network Error"

**Cause:** Backend not running or wrong URL

**Solution:**
```bash
# 1. Check backend is running
curl http://localhost:5000/api/health

# 2. Check .env file
cat .env
# Should show: REACT_APP_API_URL=http://localhost:5000/api

# 3. Restart frontend
npm start
```

---

## 🔒 Security Best Practices

### ✅ Already Implemented

1. **JWT Token Storage**
   - Stored in localStorage (accessible only by same origin)
   - Automatically included in requests
   - Cleared on logout

2. **Automatic Token Validation**
   - Backend validates on each request
   - Frontend handles 401 errors
   - Auto-redirect to login

3. **Protected Routes**
   - Checks both auth flag and token
   - Prevents unauthorized access

### 🎯 Recommended Enhancements

1. **Token Expiration Handling**
```javascript
// Add to apiClient.js
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};
```

2. **Refresh Token Implementation**
```javascript
// Store refresh token separately
localStorage.setItem('refreshToken', response.data.refreshToken);

// Use to get new access token when expired
```

3. **HTTPS in Production**
```bash
# Always use HTTPS in production
REACT_APP_API_URL=https://api.yourdomain.com
```

4. **Content Security Policy**
```html
<!-- Add to public/index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">
```

---

## 📚 Additional Features to Implement

### 1. Password Reset
```javascript
// src/pages/ForgotPassword.jsx
const handleReset = async (email) => {
  await axios.post(`${API_URL}/forgot-password`, { email });
};
```

### 2. Email Verification
```javascript
// After registration
await axios.post(`${API_URL}/verify-email`, { token });
```

### 3. User Profile Management
```javascript
// src/pages/Profile.jsx
const updateProfile = async (data) => {
  await api.put('/user/profile', data);
};
```

### 4. Two-Factor Authentication
```javascript
const enable2FA = async () => {
  const response = await api.post('/user/2fa/enable');
  return response.data.qrCode;
};
```

### 5. Session Management
```javascript
// Show active sessions
const getSessions = async () => {
  const response = await api.get('/user/sessions');
  return response.data;
};
```

---

## 📊 Monitoring & Logging

### Frontend Logging

Add to `apiClient.js`:
```javascript
api.interceptors.request.use((config) => {
  console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API] ✅ ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error(`[API] ❌ ${error.config?.url}`, error.response?.status);
    return Promise.reject(error);
  }
);
```

### Backend Logging

Already implemented in Flask backend with JWT validation logging.

---

## ✅ Testing Checklist

- [ ] Registration creates new user
- [ ] Login returns JWT token
- [ ] Token stored in localStorage
- [ ] Dashboard accessible after login
- [ ] Protected routes require authentication
- [ ] API requests include token
- [ ] 401 errors redirect to login
- [ ] Logout clears all auth data
- [ ] Logout calls backend endpoint
- [ ] Direct access to dashboard requires login
- [ ] Token persists on page refresh
- [ ] Invalid token redirects to login

---

## 🎉 You're All Set!

Your SIEM Dashboard now has:
- ✅ Complete JWT authentication
- ✅ Protected API endpoints
- ✅ Automatic token management
- ✅ Secure logout functionality
- ✅ Proper error handling
- ✅ Protected routes

**Next Steps:**
1. Test the complete flow
2. Review security settings
3. Implement additional features
4. Deploy to production

---

**Last Updated:** November 22, 2025  
**Status:** ✅ Fully Integrated
