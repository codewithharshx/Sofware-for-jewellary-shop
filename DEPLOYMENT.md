# Deployment Guide - Satarkar Jewellers

This guide explains how to deploy the application for the real world.

## 1. Hosting Options

### Option A: Local Network (Easiest for a Shop)
If you only need to use the app inside your shop:
1. Keep the backend running on your main PC.
2. Find your PC's IP address (e.g., `192.168.1.10`).
3. Other devices in the shop can access it via browser at `http://192.168.1.10:5173`.

### Option B: Cloud Hosting (Professional)
To access the app from anywhere in the world:
- **Frontend**: Deploy to **Vercel** or **Netlify** (Free & Fast).
- **Backend**: Deploy to **Render**, **Railway**, or **Railway.app**.
- **Database**: The app currently uses Excel. For cloud use, you should upload the `data/` folder or move to a hosted database like MongoDB or PostgreSQL (I can help with this transition if needed).

## 2. Production Build
Before selling, always create a "Production Build" which makes the code faster and harder to steal.

1. `cd frontend`
2. `npm run build`
3. This creates a `dist` folder. You serve these static files.

## 3. Security Checklist
- [ ] Change the `JWT_SECRET` in `.env`.
- [ ] Change the admin password hash.
- [ ] Use HTTPS (SSL) for cloud deployment.
