# AI Resume Analyzer

An AI-powered full-stack web application that analyzes resumes using Google Gemini API. Built with React.js, Node.js, Express, and MongoDB.

## Features

- **PDF Parsing** — Server-side PDF text extraction using `pdf-parse`
- **JWT Authentication** — Secure register/login with protected routes
- **AI Analysis** — Resume scoring via Google Gemini API (server-side, API key never exposed)
- **Custom Scoring Layer** — Bonus scoring on top of Gemini for quantified achievements, action verbs, and contact info
- **JD Matching** — Paste a job description to get keyword/skill gap analysis
- **Analysis History** — All analyses saved to MongoDB, viewable and deletable
- **Rate Limiting** — 20 requests per 15 minutes per IP to prevent abuse
- **Input Validation** — `express-validator` on all auth routes

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React.js, React Router, Axios, Dropzone |
| Backend  | Node.js, Express.js                     |
| Database | MongoDB, Mongoose                       |
| Auth     | JWT (jsonwebtoken), bcryptjs            |
| AI       | Google Gemini 1.5 Flash API             |
| Other    | Multer, pdf-parse, express-rate-limit   |

## Project Structure

```
ai-resume-analyzer/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, getMe
│   │   ├── analyzeController.js   # PDF parse + Gemini + custom scoring
│   │   └── historyController.js   # CRUD for analysis history
│   ├── middleware/
│   │   └── auth.js                # JWT protect middleware
│   ├── models/
│   │   ├── User.js                # User schema with bcrypt
│   │   └── Analysis.js            # Analysis history schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── analyze.js             # Multer file upload route
│   │   └── history.js
│   ├── .env.example
│   ├── package.json
│   └── server.js                  # Entry point, rate limiter, CORS
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── ScoreCard.js       # Reusable score ring + sub-score cards
│   │   ├── context/
│   │   │   └── AuthContext.js     # Global auth state
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Analyzer.js        # Main upload + analyze page
│   │   │   ├── History.js         # Past analyses list
│   │   │   └── AnalysisDetail.js  # Single analysis view
│   │   ├── App.js                 # Routes + PrivateRoute
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── .gitignore
└── README.md
```

## Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/resume-analyzer
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
JWT_EXPIRE=7d
```

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com)

```bash
npm run dev
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm start
```

App runs at `http://localhost:3000`

## API Endpoints

| Method | Route             | Access  | Description              |
|--------|-------------------|---------|--------------------------|
| POST   | /api/auth/register | Public  | Register new user        |
| POST   | /api/auth/login    | Public  | Login user               |
| GET    | /api/auth/me       | Private | Get current user         |
| POST   | /api/analyze       | Private | Analyze resume (PDF/TXT) |
| GET    | /api/history       | Private | Get analysis history     |
| GET    | /api/history/:id   | Private | Get single analysis      |
| DELETE | /api/history/:id   | Private | Delete analysis          |

## Security Highlights

- Gemini API key stored in `.env` — never sent to frontend
- Passwords hashed with `bcryptjs` (salt rounds: 10)
- JWT tokens expire in 7 days
- Rate limiting: 20 requests / 15 min / IP
- File type validation: only PDF and TXT allowed
- File size limit: 5MB max
- User can only access their own analysis history

## License
MIT
