# DG Interns Hub — Job & Internship Portal

A responsive web application that helps students discover internships, explore job opportunities, and submit applications online.

## Live Demo

- **Frontend:** https://week7-job-landing-90r850edb-officialnishanth45-8712.vercel.app
- **Backend:** https://week7-job-landing.onrender.com
- **GitHub Repository:** https://github.com/ganishanth27-oss/week7-job-landing

## Features

- Browse available jobs and internships
- Search, filter, and sort job listings
- View individual job details
- Submit internship applications
- User authentication and protected pages
- Dashboard and application tracking
- Form validation and error handling
- Responsive interface for desktop and mobile

## Technology Stack

**Frontend**
- React
- Vite
- React Router
- JavaScript and CSS

**Backend**
- Node.js
- Express.js
- MongoDB Atlas

**Deployment**
- Vercel for the frontend
- Render for the backend
- GitHub for source control

## Run Locally

### 1. Clone the frontend repository

```bash
git clone https://github.com/ganishanth27-oss/week7-job-landing.git
cd week7-job-landing
npm install
```

### 2. Configure the frontend

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:5000
```

Replace `5000` with the actual port used by your backend.

### 3. Start the frontend

```bash
npm run dev
```

### 4. Start the backend

Open a separate terminal:

```bash
cd "D:\DG intern\week8-backend"
npm install
npm run dev
```

Configure the backend's required environment variables, including the MongoDB connection string and allowed frontend origin, using the backend's existing configuration.

## Production Deployment

- Deploy the frontend through Vercel.
- Deploy the Express backend through Render.
- Configure environment variables in the deployment dashboards.
- Ensure the backend CORS configuration permits the deployed frontend origin.
- Keep database credentials and secrets out of GitHub.

## Testing Checklist

- [ ] Job listings load successfully.
- [ ] Search, filters, and sorting work.
- [ ] Job details open using the correct URL.
- [ ] Login and logout work.
- [ ] Protected pages redirect unauthenticated users.
- [ ] Application forms validate user input.
- [ ] Valid applications are saved in the database.
- [ ] Loading, error, and empty states display correctly.
- [ ] The interface works on mobile and desktop.

## Project Purpose

This project provides a practical platform for students to discover internship opportunities and manage their applications through a simple, responsive web interface.