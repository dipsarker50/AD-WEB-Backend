# Deployment Guide: Fixing JWT Token Storage for Render

## Problem
JWT tokens work in localhost but not when deployed on Render due to cookie security restrictions and CORS issues in production environments.

## Root Causes
1. **Cookie Security**: Production requires `secure: true` for HTTPS, `sameSite: 'none'` for cross-site requests
2. **CORS Configuration**: Static origin arrays don't handle dynamic subdomains well
3. **Trust Proxy**: Render uses proxies that need to be trusted for proper HTTPS detection
4. **Cross-Domain Restrictions**: Modern browsers block third-party cookies by default

## Solutions Implemented

### 1. Enhanced CORS Configuration (`src/main.ts`)
- Added dynamic origin validation with subdomain support
- Enabled trust proxy for Render's infrastructure
- Added more permissive headers and options for production

### 2. Improved Cookie Settings (`src/agent/agent.controller.ts`)
- Production cookies use `secure: true` and `sameSite: 'none'`
- Added `partitioned: true` for Chrome's third-party cookie restrictions
- Enhanced error logging and debugging
- Always include token in response body as fallback

### 3. Environment Variables Required for Render

Add these environment variables in your Render dashboard:

```bash
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=your_jwt_secret_key
# ... other environment variables
```

## Frontend Integration Recommendations

### Option 1: Use Token from Response Body (Recommended)
```javascript
// In your frontend login function
const response = await fetch('/agent/login', {
  method: 'POST',
  credentials: 'include', // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(loginData)
});

const data = await response.json();

if (data.success && data.token) {
  // Store token in localStorage as backup
  localStorage.setItem('access_token', data.token);
}
```

### Option 2: Send Token in Authorization Header
```javascript
// For subsequent requests
const token = localStorage.getItem('access_token');

fetch('/protected-route', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include'
});
```

## Testing the Solution

### 1. Local Testing
```bash
npm run start:dev
```
- Verify cookies work in localhost
- Check browser developer tools for cookie storage

### 2. Production Testing on Render
- Deploy to Render with proper environment variables
- Test login flow in browser developer tools
- Verify token is available in response body
- Check network tab for cookie headers

## Troubleshooting

### If cookies still don't work:
1. Ensure HTTPS is enabled on both frontend and backend
2. Check that `FRONTEND_URL` exactly matches your frontend domain
3. Verify browser allows third-party cookies (or use localStorage fallback)
4. Check Render logs for cookie setting errors

### If CORS errors persist:
1. Verify `FRONTEND_URL` environment variable is set correctly
2. Check that frontend sends requests with `credentials: 'include'`
3. Ensure frontend domain matches exactly (including protocol and port)

### Debug Information
The backend now logs:
- Cookie setting attempts and results
- Environment configuration
- Authentication attempts with token source

Check Render logs to see these debug messages and identify issues.

## Security Notes
- Cookies use `httpOnly: true` to prevent XSS attacks
- Production uses `secure: true` for HTTPS-only transmission
- Tokens have 20-minute expiration for security
- CORS is properly configured to prevent unauthorized access