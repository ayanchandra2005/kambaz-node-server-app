import * as assignmentsDao from "./dao.js";

export default function AssignmentRoutes(app) {
  const getAssignmentsForCourse = (req, res) => {
    const { courseId } = req.params;
    const result = assignmentsDao.getAssignmentsByCourse(courseId);
    res.send(result);
  };

  const getAssignmentById = (req, res) => {
    const { assignmentId } = req.params;
    const found = assignmentsDao.getAssignment(assignmentId);
    if (!found) {
      res.status(404).json({ message: "Assignment not found" });
      return;
    }
    res.send(found);
  };

  const createAssignment = (req, res) => {
    const { courseId } = req.params;
    const assignment = { ...req.body, course: courseId };
    const newAssignment = assignmentsDao.addAssignment(assignment);
    res.send(newAssignment);
  };

  const updateAssignment = (req, res) => {
    const { assignmentId } = req.params;
    const updates = req.body;
    const updated = assignmentsDao.modifyAssignment(assignmentId, updates);
    if (!updated) {
      res.status(404).json({ message: "Assignment not found" });
      return;
    }
    res.send(updated);
  };

  const deleteAssignment = (req, res) => {
    const { assignmentId } = req.params;
    const status = assignmentsDao.removeAssignment(assignmentId);
    res.send(status);
  };

  app.get("/api/courses/:courseId/assignments", getAssignmentsForCourse);
  app.get("/api/assignments/:assignmentId", getAssignmentById);
  app.post("/api/courses/:courseId/assignments", createAssignment);
  app.put("/api/assignments/:assignmentId", updateAssignment);
  app.delete("/api/assignments/:assignmentId", deleteAssignment);
}