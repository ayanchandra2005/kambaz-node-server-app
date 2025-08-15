// Kambaz/Courses/routes.js
import * as dao from "./dao.js";
import * as modulesDao from "../Modules/dao.js";
import * as enrollmentsDao from "../Enrollments/dao1.js";

export default function CourseRoutes(app) {
  // CREATE a course
  const createCourse = async (req, res) => {
    try {
      const course = await dao.createCourse(req.body);

      // Auto-enroll the author (if signed in)
      const currentUser = req.session["currentUser"] || req.session.currentUser;
      if (currentUser) {
        await enrollmentsDao.enrollUserInCourse(currentUser._id, course._id);
      }

      res.status(201).json(course);
    } catch (err) {
      console.error("createCourse error:", err);
      res.sendStatus(500);
    }
  };
  app.post("/api/courses", createCourse);

  // GET all courses
  const findAllCourses = async (req, res) => {
    try {
      const courses = await dao.findAllCourses();
      res.json(courses);
    } catch (err) {
      console.error("findAllCourses error:", err);
      res.sendStatus(500);
    }
  };
  app.get("/api/courses", findAllCourses);

  // DELETE a course
  const deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const status = await dao.deleteCourse(courseId);
      res.json(status);
    } catch (err) {
      console.error("deleteCourse error:", err);
      res.sendStatus(500);
    }
  };
  app.delete("/api/courses/:courseId", deleteCourse);

  // UPDATE a course
  const updateCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseUpdates = req.body;
      const status = await dao.updateCourse(courseId, courseUpdates);
      res.json(status);
    } catch (err) {
      console.error("updateCourse error:", err);
      res.sendStatus(500);
    }
  };
  app.put("/api/courses/:courseId", updateCourse);

  // GET modules for a course
  const findModulesForCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const modules = await modulesDao.findModulesForCourse(courseId);
      res.json(modules);
    } catch (err) {
      console.error("findModulesForCourse error:", err);
      res.sendStatus(500);
    }
  };
  app.get("/api/courses/:courseId/modules", findModulesForCourse);

  // CREATE module for a course
  const createModuleForCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const module = { ...req.body, course: courseId };
      const newModule = await modulesDao.createModule(module);
      res.status(201).json(newModule);
    } catch (err) {
      console.error("createModuleForCourse error:", err);
      res.sendStatus(500);
    }
  };
  app.post("/api/courses/:courseId/modules", createModuleForCourse);

  const findUsersForCourse = async (req, res) => {
    try {
      const { cid } = req.params;
      const users = await enrollmentsDao.findUsersForCourse(cid);
      res.json(users);
    } catch (err) {
      console.error("findUsersForCourse error:", err);
      res.sendStatus(500);
    }
  };
  app.get("/api/courses/:cid/users", findUsersForCourse);

}

