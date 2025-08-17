// Kambaz/Enrollments/routes.js
import * as dao from "./dao1.js";

export default function EnrollmentRoutes(app) {
  // Enroll (create)
  app.post("/api/users/:userId/enrollments/:courseId", async (req, res) => {
    try {
      const { userId, courseId } = req.params;
      await dao.enrollUserInCourse(userId, courseId);
      res.json({ message: "Enrolled successfully" });
    } catch (e) {
      console.error("Enroll error:", e);
      res.status(500).json({ message: "Failed to enroll" });
    }
  });

  // Unenroll (delete)
  app.delete("/api/users/:userId/enrollments/:courseId", async (req, res) => {
    try {
      const { userId, courseId } = req.params;
      await dao.unenrollUserFromCourse(userId, courseId);
      res.json({ message: "Unenrolled successfully" });
    } catch (e) {
      console.error("Unenroll error:", e);
      res.status(500).json({ message: "Failed to unenroll" });
    }
  });

  // List enrollments for a user
  app.get("/api/users/:userId/enrollments", async (req, res) => {
    try {
      const { userId } = req.params;
      const docs = await dao.findEnrollmentsByUserId(userId);
      // ensure circular-ref-free JSON
      const safe = Array.isArray(docs)
        ? docs.map((d) => (typeof d?.toObject === "function" ? d.toObject({ getters: true }) : d))
        : [];
      res.json(safe);
    } catch (e) {
      console.error("List enrollments error:", e);
      res.status(500).json({ message: "Failed to load enrollments" });
    }
  });
}