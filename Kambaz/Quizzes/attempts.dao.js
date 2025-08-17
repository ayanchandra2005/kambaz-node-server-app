// Kambaz/Quizzes/attempts.dao.js
import { v4 as uuid } from "uuid";
import AttemptModel from "./attempts.model.js";
import QuizModel from "./model.js"; // your quizzes mongoose model

export const listAttemptsForUserQuiz = (userId, quizId) =>
  AttemptModel.find({ userId, quizId }).sort({ attemptNumber: -1 });

export const findLastAttempt = async (userId, quizId) => {
  const docs = await listAttemptsForUserQuiz(userId, quizId).limit(1);
  return docs[0] ?? null;
};

export const canAttempt = async (userId, quiz) => {
  const count = await AttemptModel.countDocuments({
    userId,
    quizId: quiz._id,
  });
  return quiz.multipleAttempts
    ? count < (quiz.howManyAttempts ?? 1)
    : count === 0;
};

function gradeOne(q, ans) {
  let correct = false;
  switch (q.type) {
    case "MCQ":
      correct = Number(ans.mcqIndex) === Number(q.correctIndex);
      break;
    case "TRUE_FALSE":
      correct = Boolean(ans.tfValue) === Boolean(q.correctTrue);
      break;
    case "FIB": {
      const txt = (ans.fibText ?? "").trim().toLowerCase();
      const accepted = (q.correctAnswers ?? []).map((s) =>
        String(s).trim().toLowerCase()
      );
      correct = accepted.includes(txt);
      break;
    }
    default:
      correct = false;
  }
  const pts = Number(q.points) || 0;
  return { correct, earned: correct ? pts : 0 };
}

export const submitAttempt = async (userId, quizId, clientAnswers) => {
  const quiz = await QuizModel.findById(quizId);
  if (!quiz) throw Object.assign(new Error("Quiz not found"), { status: 404 });

  const ok = await canAttempt(userId, quiz);
  if (!ok) throw Object.assign(new Error("No attempts remaining"), { status: 403 });

  // normalize/grade
  const graded = [];
  let total = 0;

  for (const q of quiz.questions) {
    const a = clientAnswers.find((x) => x.questionId === q._id) || {};
    const { correct, earned } = gradeOne(q, a);
    total += earned;

    graded.push({
      questionId: q._id,
      mcqIndex: a.mcqIndex,
      tfValue: a.tfValue,
      fibText: a.fibText,
      correct,
      earned,
    });
  }

  const prevCount = await AttemptModel.countDocuments({ userId, quizId });
  const attempt = await AttemptModel.create({
    _id: uuid(),
    quizId,
    userId,
    attemptNumber: prevCount + 1,
    answers: graded,
    score: total,
  });

  return attempt;
};