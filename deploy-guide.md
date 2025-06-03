# Vercel Deployment Guide

## Pre-deployment Checklist

### 1. Environment Variables Required
Set these in your Vercel dashboard:
- `DATABASE_URL` - Your PostgreSQL connection string
- `SESSION_SECRET` - A secure random string for sessions
- `NODE_ENV` - Set to "production"

### 2. Build Configuration
The app uses the following build process:
```bash
npm run build
```
This creates `dist/index.js` which serves both frontend and API.

### 3. Database Setup
Ensure your PostgreSQL database is accessible from Vercel.
Run migrations: `npm run db:push`

## Deployment Steps

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy with automatic builds enabled

## Troubleshooting

### Authentication Issues
- Ensure SESSION_SECRET is set
- Check database connectivity
- Verify cookie settings for production

### Build Failures
- Ensure all dependencies are in package.json
- Check TypeScript compilation
- Verify all imports are correct