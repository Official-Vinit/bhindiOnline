# Bhindi Online

Bhindi Online is a full-stack real-time chat application built with the MERN ecosystem. It provides secure user authentication, one-to-one messaging and profile management with image uploads.


## Key Features

- Secure authentication with JWT and HTTP-only cookies
- Real-time private messaging with Socket.IO
- Profile management with optional image upload (Cloudinary)
- Responsive React + Tailwind UI

## Tech Stack

- Frontend: React, Vite, Redux Toolkit, Tailwind CSS, Axios, Socket.IO Client
- Backend: Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT, Multer, Cloudinary

## Project Structure

```
bhindiOnline/
  backend/   # Express + MongoDB + Socket.IO API
  frontend/  # React + Vite client app
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB connection string (Atlas or local)
- Cloudinary account (required if you use profile/image uploads)

## 1) Clone the Repository

```bash
git https://github.com/Official-Vinit/bhindiOnline.git
cd bhindiOnline
```

## 2) Backend Setup

```bash
cd backend
npm install
```

Create a file named `.env` inside `backend/` with the following keys:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Why `PORT=8000`?
- The frontend currently calls `http://localhost:8000` as its API base URL.

Start backend server:

```bash
npm run dev
```

## 3) Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will run at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

## 4) Verify the App

- Open `http://localhost:5173`
- Create an account
- Log in and start chatting

Optional backend health check:
- Open `http://localhost:8000/` and confirm you see `{"message":"Backend is running"}`

## Useful Scripts

Backend (`backend/package.json`):
- `npm run dev` - Start backend with nodemon

Frontend (`frontend/package.json`):
- `npm run dev` - Start Vite development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

- PowerShell blocks npm scripts on Windows:
  - Use `cmd /c npm install` or `cmd /c npm run dev`
- CORS/auth cookie issues:
  - Ensure frontend runs on `http://localhost:5173`
  - Ensure backend runs on `PORT=8000`
- Image upload fails:
  - Recheck Cloudinary environment variables in `backend/.env`

## Author

Vinit Kumar Gupta