// index.js
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

// DB connect
mongoose
  .connect(CONNECTION_STRING)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((e) => {
    console.error("❌ MongoDB connection error:", e);
    process.exit(1);
  });

const app = express();
const IS_DEV = process.env.NODE_ENV !== "production";

/* ---------- CORS (minimal + works for Netlify/Render/localhost) ---------- */
// Reflect the request Origin and allow credentials (sets ACAO dynamically)
app.use(cors({ origin: true, credentials: true }));
// app.options("*", cors({ origin: true, credentials: true }));

/* ---------- Sessions ---------- */
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
  // MemoryStore is fine for this course project. (Render may restart; users re-login.)
  cookie: IS_DEV
    ? { sameSite: "lax" } // dev: no HTTPS needed
    : { sameSite: "none", secure: true }, // prod: cross-site cookie
};

if (!IS_DEV) {
  // Required behind Render proxy so secure cookies are accepted
  app.set("trust proxy", 1);
}
app.use(session(sessionOptions));

/* ---------- Body parsing ---------- */
app.use(express.json());

/* ---------- Routes ---------- */
UserRoutes(app);
CourseRoutes(app);
Lab5(app);
ModuleRoutes(app);
AssignmentRoutes(app);
EnrollmentRoutes(app);
QuizRoutes(app);

/* ---------- Start ---------- */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`NODE_ENV=${process.env.NODE_ENV}`);
});