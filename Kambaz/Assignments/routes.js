import * as assignmentsDao from "./dao.js";

export default function AssignmentRoutes(app) {
  const getAssignmentsForCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const result = await assignmentsDao.getAssignmentsByCourse(courseId);
      res.json(result);
    } catch (err) {
      console.error("getAssignmentsForCourse error:", err);
      res.sendStatus(500);
    }
  };

  const getAssignmentById = async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const found = await assignmentsDao.getAssignment(assignmentId);
      if (!found) return res.status(404).json({ message: "Assignment not found" });
      res.json(found);
    } catch (err) {
      console.error("getAssignmentById error:", err);
      res.sendStatus(500);
    }
  };

  const createAssignment = async (req, res) => {
    try {
      const { courseId } = req.params;
      const assignment = { ...req.body, course: courseId };
      const newAssignment = await assignmentsDao.addAssignment(assignment);
      res.status(201).json(newAssignment);
    } catch (err) {
      console.error("createAssignment error:", err);
      res.sendStatus(500);
    }
  };

  const updateAssignment = async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const updates = req.body;
      const updated = await assignmentsDao.modifyAssignment(assignmentId, updates);
      if (!updated) return res.status(404).json({ message: "Assignment not found" });
      res.json(updated);
    } catch (err) {
      console.error("updateAssignment error:", err);
      res.sendStatus(500);
    }
  };

  const deleteAssignment = async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const status = await assignmentsDao.removeAssignment(assignmentId);
      res.json(status);
    } catch (err) {
      console.error("deleteAssignment error:", err);
      res.sendStatus(500);
    }
  };

  app.get("/api/courses/:courseId/assignments", getAssignmentsForCourse);
  app.get("/api/assignments/:assignmentId", getAssignmentById);
  app.post("/api/courses/:courseId/assignments", createAssignment);
  app.put("/api/assignments/:assignmentId", updateAssignment);
  app.delete("/api/assignments/:assignmentId", deleteAssignment);
}