import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import "dotenv/config";

import Lab5 from "./Lab5/index.js";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import AssignmentRoutes from "./Kambaz/Assignments/routes.js";
import EnrollmentRoutes from "./Kambaz/Enrollments/routes.js";
import QuizRoutes from "./Kambaz/Quizzes/routes.js";

const CONNECTION_STRING =
  process.env.MONGO_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz";

mongoose
  .connect(CONNECTION_STRING)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((e) => {
    console.error("❌ MongoDB connection error:", e);
    process.exit(1);
  });

const app = express();
const IS_DEV = process.env.NODE_ENV !== "production";

/** ---------- CORS ---------- **/
/* Allow your local dev origin AND your Netlify site(s). You can add more by env. */
const KNOWN_NETLIFY =
  process.env.NETLIFY_URL || "https://kambaz-react-web-app-su2-2025-ayan.netlify.app";

/* Optional: allow branch/preview deploys too (subdomain prefix before --). */
const NETLIFY_PATTERN = /\.netlify\.app$/;

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  KNOWN_NETLIFY,
  process.env.ADDITIONAL_ORIGIN_1,
  process.env.ADDITIONAL_ORIGIN_2,
].filter(Boolean);

const corsOptions = {
  credentials: true,
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl/postman or same-origin
    const ok =
      ALLOWED_ORIGINS.includes(origin) || NETLIFY_PATTERN.test(origin);
    cb(ok ? null : new Error("Not allowed by CORS"), ok);
  },
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

/** ---------- Sessions ---------- **/
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
};

if (!IS_DEV) {
  // Behind Render's proxy; needed for secure cookies
  app.set("trust proxy", 1);
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    // IMPORTANT: don't set `domain` for cross-site unless you truly need it.
    // Let the browser scope the cookie to your Render API host.
  };
}

app.use(session(sessionOptions));

/** ---------- Body parsing ---------- **/
app.use(express.json());

/** ---------- Routes ---------- **/
UserRoutes(app);
CourseRoutes(app);
Lab5(app);
ModuleRoutes(app);
AssignmentRoutes(app);
EnrollmentRoutes(app);
QuizRoutes(app);

/** ---------- Start ---------- **/
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`NODE_ENV=${process.env.NODE_ENV}`);
  console.log(`Allowed origins:`, ALLOWED_ORIGINS);
});