# 🚀 MERN Job Portal

A production-ready, full-stack **MERN** (MongoDB · Express · React · Node.js) job portal application featuring three user roles, JWT authentication, AI-powered resume matching, interactive analytics dashboards, and a modern SaaS UI with dark mode support.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-7+-47A248?logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-06B6D4?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Seeding](#-database-seeding)
- [API Documentation](#-api-documentation)
- [Docker Deployment](#-docker-deployment)
- [Cloud Deployment](#-cloud-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with HTTP-only cookies
- Email verification & password reset flow
- Role-based access control (Candidate, Recruiter, Admin)
- Rate limiting, Helmet, CORS, XSS & injection protection

### 👤 Candidate
- Profile management (avatar, resume, skills, education, experience)
- Browse, search & filter jobs with advanced queries
- Save jobs, apply with cover letter, withdraw applications
- Application tracking with status timeline
- AI-powered resume match score & job recommendations
- Personal analytics dashboard

### 🏢 Recruiter
- Company profile management with logo upload
- Full job lifecycle — create, edit, duplicate, close, delete
- Review applications with filters & AI match scores
- Shortlist, reject & schedule interviews
- Email notifications to candidates
- Hiring funnel analytics

### 🛡️ Admin
- System-wide analytics dashboard
- User management (view, suspend, activate)
- Job moderation
- Report management
- Growth trends & traffic analytics

### 🎨 UI / UX
- Modern SaaS design with glassmorphism effects
- Fully responsive (mobile, tablet, desktop)
- Dark / Light mode toggle
- Framer Motion animations & micro-interactions
- Loading skeletons & toast notifications
- Interactive charts (Recharts)

---

## 🛠 Tech Stack

| Layer | Technologies |
|----------|-------------|
| **Frontend** | React 18, Vite, Tailwind CSS 3, Redux Toolkit, React Router, React Hook Form, Framer Motion, Recharts, Axios |
| **Backend** | Node.js, Express.js, Mongoose, JWT, Bcrypt, Multer, Cloudinary, Nodemailer |
| **Database** | MongoDB (Atlas / Local) |
| **DevOps** | Docker, Docker Compose, Nginx |
| **Deploy** | Vercel (Frontend), Render (Backend), MongoDB Atlas |

---

## 📁 Project Structure

```
MERN Job Portal/
│
├── backend/
│   ├── config/          # DB, Cloudinary, Nodemailer configuration
│   ├── controllers/     # Route handler logic
│   ├── middlewares/      # Auth, error handling, rate limiting, uploads
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   ├── services/        # Email templates & business logic
│   ├── utils/           # Helpers (API response, tokens, AI matcher)
│   ├── validators/      # Input validation schemas
│   ├── seed.js          # Database seeder
│   ├── server.js        # Application entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Theme context
│   │   ├── hooks/       # Custom React hooks
│   │   ├── layouts/     # Page layouts (Main, Auth, Dashboard)
│   │   ├── pages/       # Route page components
│   │   ├── redux/       # Redux Toolkit store & slices
│   │   ├── services/    # Axios API services
│   │   ├── utils/       # Constants & helpers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account)
- **npm** or **yarn**
- (Optional) **Docker** & **Docker Compose**

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mern-job-portal.git
cd mern-job-portal
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and (optionally) Cloudinary/SMTP credentials
```

### 3. Install & Run the Backend

```bash
cd backend
npm install
npm run dev        # Starts on http://localhost:5000
```

### 4. Install & Run the Frontend

```bash
cd frontend
npm install
npm run dev        # Starts on http://localhost:3000
```

### 5. Open the App

Navigate to **http://localhost:3000** in your browser.

---

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT signing |
| `JWT_EXPIRE` | | Token expiration (default: `7d`) |
| `COOKIE_EXPIRE` | | Cookie expiry in days (default: `7`) |
| `FRONTEND_URL` | | Frontend URL for CORS (default: `http://localhost:3000`) |
| `CLOUDINARY_*` | | Cloudinary credentials (falls back to local storage) |
| `SMTP_*` | | SMTP credentials (falls back to console logging) |

---

## 🌱 Database Seeding

Populate the database with demo data:

```bash
cd backend
npm run seed
```

This creates:

| Data | Count |
|------|-------|
| Admin user | 1 (`admin@jobportal.com` / `admin123`) |
| Recruiters | 3 |
| Candidates | 5 |
| Companies | 3 |
| Jobs | 15 |
| Applications | 20 |
| Saved Jobs | 10 |
| Notifications | 15 |

---

## 📡 API Documentation

The backend exposes **40+ REST API endpoints** organized by resource:

### Auth — `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login with credentials |
| POST | `/logout` | Clear auth cookie |
| POST | `/verify-email/:token` | Verify email address |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password/:token` | Reset password |
| GET | `/me` | Get current user |

### Users — `/api/users`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get candidate profile |
| PUT | `/profile` | Update profile |
| PUT | `/profile/avatar` | Upload avatar |
| PUT | `/profile/resume` | Upload resume (PDF) |
| GET | `/recommendations` | AI job recommendations |
| GET | `/dashboard/candidate` | Candidate analytics |

### Companies — `/api/companies`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create company |
| GET | `/` | List companies |
| GET | `/:id` | Get company |
| PUT | `/:id` | Update company |

### Jobs — `/api/jobs`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Browse jobs (with filters) |
| GET | `/:id` | Get job details |
| POST | `/` | Create job (recruiter) |
| PUT | `/:id` | Update job |
| DELETE | `/:id` | Delete job |
| POST | `/:id/duplicate` | Duplicate job |
| PATCH | `/:id/status` | Toggle job status |

### Applications — `/api/applications`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/:jobId` | Apply to job |
| GET | `/my-applications` | My applications |
| DELETE | `/:id/withdraw` | Withdraw application |
| GET | `/job/:jobId` | Job applications (recruiter) |
| PATCH | `/:id/status` | Update status |
| POST | `/:id/interview` | Schedule interview |

### Saved Jobs — `/api/saved-jobs`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/:jobId` | Toggle save |
| GET | `/` | Get saved jobs |

### Notifications — `/api/notifications`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get notifications |
| PATCH | `/:id/read` | Mark as read |

### Admin — `/api/admin`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | System analytics |
| GET | `/users` | Manage users |
| PATCH | `/users/:id/status` | Suspend/activate |
| GET | `/jobs` | Moderate jobs |
| POST | `/reports` | Create report |
| GET | `/reports` | View reports |

---

## 🐳 Docker Deployment

Run the entire stack with Docker Compose:

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Seed the database
docker-compose exec backend node seed.js

# Stop services
docker-compose down
```

Services will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

---

## ☁️ Cloud Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Connect the repository to [Vercel](https://vercel.com)
3. Set the root directory to `frontend`
4. Set environment variable: `VITE_API_URL=https://your-backend-url.onrender.com/api`
5. Deploy

### Backend → Render

1. Connect the repository to [Render](https://render.com)
2. Create a new **Web Service**
3. Set the root directory to `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all environment variables from `.env.example`
7. Deploy

### Database → MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist your IP / allow access from anywhere
3. Create a database user
4. Get the connection string and set it as `MONGO_URI`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ using the MERN Stack
</p>
