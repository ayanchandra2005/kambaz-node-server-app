import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao1.js";

export default function UserRoutes(app) {
  // ===== Users CRUD =====
  const createUser = async (req, res) => {
    try {
      const { username, password } = req.body || {};
      if (!username || !password) {
        return res.status(400).json({ message: "username and password are required" });
      }

      const existing = await dao.findUserByUsername(username);
      if (existing) {
        return res.status(409).json({ message: "Username already taken" });
      }

      const user = await dao.createUser(req.body);
      return res.status(201).json(user);
    } catch (err) {
      // handle duplicate key just in case the check races
      if (err?.code === 11000) {
        return res.status(409).json({ message: "Username already taken" });
      }
      console.error("Create user failed:", err);
      return res.status(500).json({ message: "Failed to create user" });
    }
  };


  const deleteUser = async (req, res) => {
    try {
      const status = await dao.deleteUser(req.params.userId);
      res.json(status);
    } catch (e) {
      res.status(500).json({ message: "Delete user failed", error: String(e) });
    }
  };

  const findAllUsers = async (req, res) => {
    const { role, name } = req.query;
    if (role) {
      const users = await dao.findUsersByRole(role);
      res.json(users);
      return;
    }
    if (name) {
      const users = await dao.findUsersByPartialName(name);
      res.json(users);
      return;
    }
    const users = await dao.findAllUsers();
    res.json(users);
  };

  const findUserById = async (req, res) => {
    try {
      const user = await dao.findUserById(req.params.userId);
      res.json(user);
    } catch (e) {
      res.status(500).json({ message: "Fetch user failed", error: String(e) });
    }
  };

  const updateUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const userUpdates = req.body;
      await dao.updateUser(userId, userUpdates);
      const currentUser = req.session["currentUser"];
      if (currentUser && currentUser._id === userId) {
        req.session["currentUser"] = { ...currentUser, ...userUpdates };
      }
      res.json(currentUser);
    } catch (e) {
      res.status(500).json({ message: "Update user failed", error: String(e) });
    }
  };

  // ===== Auth =====
  const signup = async (req, res) => {
    try {
      const exists = await dao.findUserByUsername(req.body.username);
      if (exists) {
        return res.status(400).json({ message: "Username already in use" });
      }
      const currentUser = await dao.createUser(req.body);
      req.session.currentUser = currentUser;
      res.json(currentUser);
    } catch (e) {
      res.status(500).json({ message: "Signup failed", error: String(e) });
    }
  };

  const signin = async (req, res) => {
    try {
      const { username, password } = req.body;
      const currentUser = await dao.findUserByCredentials(username, password);
      if (!currentUser) {
        return res
          .status(401)
          .json({ message: "Unable to login. Try again later." });
      }
      req.session.currentUser = currentUser;
      res.json(currentUser);
    } catch (e) {
      res.status(500).json({ message: "Signin failed", error: String(e) });
    }
  };

  const signout = async (req, res) => {
    req.session.destroy(() => res.sendStatus(200));
  };

  const profile = async (req, res) => {
    const userInSession = req.session.currentUser;
    if (!userInSession) return res.sendStatus(401);
    const fresh = await dao.findUserById(userInSession._id);
    res.json(fresh || userInSession);
  };

  // ===== Courses for a user (kept, now async-safe) =====
  // const findCoursesForEnrolledUser = async (req, res) => {
  //   try {
  //     let { userId } = req.params;
  //     if (userId === "current") {
  //       const currentUser = req.session.currentUser;
  //       if (!currentUser) return res.sendStatus(401);
  //       userId = currentUser._id;
  //     }
  //     const courses = await courseDao.findCoursesForEnrolledUser(userId);
  //     res.json(courses);
  //   } catch (e) {
  //     res
  //       .status(500)
  //       .json({ message: "Fetch enrolled courses failed", error: String(e) });
  //   }
  // };
  // app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);

  const findCoursesForUser = async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    if (currentUser.role === "ADMIN") {
      const courses = await courseDao.findAllCourses();
      res.json(courses);
      return;
    }
    let { uid } = req.params;
    if (uid === "current") {
      uid = currentUser._id;
    }
    const courses = await enrollmentsDao.findCoursesForUser(uid);
    res.json(courses);
  };
  app.get("/api/users/:uid/courses", findCoursesForUser);

  // Faculty create course + auto-enroll creator
  const createCourse = async (req, res) => {
    try {
      const currentUser = req.session.currentUser;
      if (!currentUser)
        return res.status(401).json({ message: "Not signed in" });

      const newCourse = await courseDao.createCourse(req.body);
      await enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
      res.json(newCourse);
    } catch (e) {
      res
        .status(500)
        .json({ message: "Create course failed", error: String(e) });
    }
  };
  app.post("/api/users/current/courses", createCourse);

  const enrollUserInCourse = async (req, res) => {
    let { uid, cid } = req.params;
    if (uid === "current") {
      const currentUser = req.session["currentUser"];
      uid = currentUser._id;
    }
    const status = await enrollmentsDao.enrollUserInCourse(uid, cid);
    res.send(status);
  };
  
  const unenrollUserFromCourse = async (req, res) => {
    let { uid, cid } = req.params;
    if (uid === "current") {
      const currentUser = req.session["currentUser"];
      uid = currentUser._id;
    }
    const status = await enrollmentsDao.unenrollUserFromCourse(uid, cid);
    res.send(status);
  };
  app.post("/api/users/:uid/courses/:cid", enrollUserInCourse);
  app.delete("/api/users/:uid/courses/:cid", unenrollUserFromCourse); 

  // ===== Route bindings =====
  app.post("/api/users", createUser);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);

  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.post("/api/users/profile", profile);
}
