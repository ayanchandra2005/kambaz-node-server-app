import * as dao from "./dao.js";
import * as attemptsDao from "./attempts.dao.js";

export default function QuizRoutes(app) {
  // ===== Quizzes (by course) =====
  app.get("/api/courses/:courseId/quizzes", async (req, res) => {
    const quizzes = await dao.findQuizzesForCourse(req.params.courseId);
    res.json(quizzes);
  });

  // Get one quiz
  app.get("/api/quizzes/:quizId", async (req, res) => {
    const quiz = await dao.findQuizById(req.params.quizId);
    if (!quiz) return res.sendStatus(404);
    res.json(quiz);
  });

  // Create quiz
  app.post("/api/courses/:courseId/quizzes", async (req, res) => {
    const quiz = await dao.createQuiz(req.params.courseId, req.body);
    res.status(201).json(quiz);
  });

  // Update quiz
  app.put("/api/quizzes/:quizId", async (req, res) => {
    const status = await dao.updateQuiz(req.params.quizId, req.body);
    res.json(status);
  });

  // Delete quiz
  app.delete("/api/quizzes/:quizId", async (req, res) => {
    const status = await dao.deleteQuiz(req.params.quizId);
    res.json(status);
  });

  // Publish / Unpublish
  app.put("/api/quizzes/:quizId/publish", async (req, res) => {
    const { published } = req.body ?? {};
    const status = await dao.setPublish(req.params.quizId, !!published);
    res.json(status);
  });

  // ===== Questions (embedded in quiz) =====
  // List questions for a quiz
  app.get("/api/quizzes/:qid/questions", async (req, res) => {
    const list = await dao.listQuestions(req.params.qid);
    res.json(list);
  });

  // Create question for a quiz
  app.post("/api/quizzes/:qid/questions", async (req, res) => {
    const created = await dao.createQuestion(req.params.qid, req.body);
    res.status(201).json(created);
  });

  // Update a single question (by question id)
  app.put("/api/questions/:questionId", async (req, res) => {
    const updated = await dao.updateQuestion(req.params.questionId, req.body);
    if (!updated) return res.sendStatus(404);
    res.json(updated);
  });

  // Delete a single question (by question id)
  app.delete("/api/questions/:questionId", async (req, res) => {
    const status = await dao.deleteQuestion(req.params.questionId);
    res.json(status);
  });

  // Submit an attempt (grades + persists)
  app.post("/api/quizzes/:qid/attempts", async (req, res) => {
    try {
      const user = req.session?.currentUser;
      if (!user) return res.sendStatus(401);
      const attempt = await attemptsDao.submitAttempt(
        user._id,
        req.params.qid,
        req.body?.answers ?? []
      );
      res.status(201).json(attempt);
    } catch (e) {
      if (e.status) return res.status(e.status).json({ message: e.message });
      console.error(e);
      res.sendStatus(500);
    }
  });

  // Last attempt for current user
  app.get("/api/quizzes/:qid/attempts/me/last", async (req, res) => {
    const user = req.session?.currentUser;
    if (!user) return res.sendStatus(401);
    const last = await attemptsDao.findLastAttempt(user._id, req.params.qid);
    res.json(last ?? null);
  });

  // (Optional) list all attempts for current user
  app.get("/api/quizzes/:qid/attempts/me", async (req, res) => {
    const user = req.session?.currentUser;
    if (!user) return res.sendStatus(401);
    const list = await attemptsDao.listAttemptsForUserQuiz(
      user._id,
      req.params.qid
    );
    res.json(list);
  });

}