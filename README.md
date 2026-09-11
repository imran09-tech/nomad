# IMXX Nomad - Tour & Travel Platform

A full-stack Node.js / Express web application designed for booking tours, hostels, and managing travel itineraries.

## Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JS, Webpack
- **Backend**: Node.js, Express.js
- **Database**: SQLite (Local) / PostgreSQL (Production ready)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Payments**: Stripe & Razorpay
- **Cloud/Deployment**: Ready for Vercel Serverless

## Local Development Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in your local secrets.
   ```bash
   cp .env.example .env
   ```
4. **Run the local server**:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:5000`.

## Production Deployment (Vercel)

This application is fully configured for deployment on Vercel using Serverless Functions.

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` to link the project and deploy.
3. In your Vercel Dashboard, ensure the following Environment Variables are set:
   - `VERCEL=1` (Used to trigger serverless paths)
   - `NODE_ENV=production`
   - `CLIENT_ORIGIN=https://imxx.in`
   - `JWT_SECRET`
   - `DATABASE_URL` (Required: Vercel Postgres or Supabase connection string. *SQLite cannot persist data on Vercel.*)

> **Note on File Uploads & Database**: Vercel uses a read-only filesystem. The application is configured to route `/uploads` and `nomad.db` to the `/tmp` directory when `VERCEL` is active to prevent crashes, but **this data will not persist**. For production persistence, use an external `DATABASE_URL` and a cloud storage bucket (AWS S3, Cloudinary) for images.

## Project Structure
- `/src/server.js`: Express Backend entry point.
- `/src/config`, `/src/controllers`, `/src/middleware`, `/src/routes`: Backend MVC logic.
- `/public`: Frontend static assets (HTML/CSS/JS).
- `/api/index.js`: Vercel Serverless handler.
- `vercel.json`: Vercel routing rules.
