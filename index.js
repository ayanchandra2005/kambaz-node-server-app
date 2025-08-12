import express from "express";
import mongoose from "mongoose";

import Lab5 from "./Lab5/index.js";
import cors from "cors";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import "dotenv/config";
import session from "express-session";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import AssignmentRoutes from "./Kambaz/Assignments/routes.js";
import EnrollmentRoutes from "./Kambaz/Enrollments/routes.js";

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz"

mongoose
  .connect(CONNECTION_STRING)
  .then(() => console.log("Connected to MongoDB"))
  .catch((e) => {
    console.error("MongoDB connection error:", e);
    process.exit(1);
  });

const app = express();

// CORS
app.use(
  cors({
    credentials: true,
    origin:
      process.env.SERVER_ENV === "development"
        ? "http://localhost:5173"
        : process.env.CLIENT_URL, 
  })
);

// Session setup
// SESSION
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
};

if (process.env.SERVER_ENV !== "development") {
  // We're behind a proxy on Render; needed so secure cookies work
  app.set("trust proxy", 1);
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",  // REQUIRED for cross-site
    secure: true,      // REQUIRED on HTTPS
    // Do NOT set 'domain' unless you really know you need it
  };
}

app.use(session(sessionOptions));

// JSON parsing
app.use(express.json());

// Routes
UserRoutes(app);
CourseRoutes(app);
Lab5(app);
ModuleRoutes(app);
AssignmentRoutes(app);
EnrollmentRoutes(app);

// Server listen
app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT || 4000}`);
});