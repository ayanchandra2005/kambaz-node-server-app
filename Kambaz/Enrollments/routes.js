import * as dao from "./Dao.js";

export default function EnrollmentRoutes(app) {
  app.post("/api/users/:userId/enrollments/:courseId", (req, res) => {
    const { userId, courseId } = req.params;
    dao.enrollUserInCourse(userId, courseId);
    res.json({ message: "Enrolled successfully" });
  });

  app.delete("/api/users/:userId/enrollments/:courseId", (req, res) => {
    const { userId, courseId } = req.params;
    dao.unenrollUserFromCourse(userId, courseId);
    res.json({ message: "Unenrolled successfully" });
  });

  app.get("/api/users/:userId/enrollments", (req, res) => {
    const { userId } = req.params;
    const enrollments = dao.findEnrollmentsByUserId(userId);
    res.json(enrollments);
  });
}