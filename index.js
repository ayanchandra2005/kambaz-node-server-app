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

/* -------------------- CORS -------------------- */
/* Echoes back the request Origin and allows cookies.
   Handles preflight automatically. This works for:
   - Local dev (Vite)
   - Netlify production + branch deploys
   - Any preview URL
*/
app.use(cors({ origin: true, credentials: true }));
app.options("*", cors({ origin: true, credentials: true }));

/* -------------- Session / Cookies -------------- */
/* For cross-site cookies (Netlify -> Render) you need:
   - trust proxy (Render)
   - secure cookies
   - SameSite=None
*/
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
  cookie: {},
};

if (!IS_DEV) {
  app.set("trust proxy", 1);           // required on Render for secure cookies
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,   // 7 days
  };
  // IMPORTANT: do NOT set a hardcoded cookie "domain" unless you know it.
  // A wrong domain prevents the browser from storing the cookie.
}

app.use(session(sessionOptions));

/* -------------------- Body Parsing -------------------- */
app.use(express.json());

/* -------------------- Routes -------------------- */
UserRoutes(app);
CourseRoutes(app);
Lab5(app);
ModuleRoutes(app);
AssignmentRoutes(app);
EnrollmentRoutes(app);
QuizRoutes(app);

/* -------------------- Start -------------------- */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});