// Kambaz/Quizzes/dao.js
import model from "./model.js";              // Enrollment: QuizModel from schema.js
import { v4 as uuidv4 } from "uuid";

// ---------- Quizzes (top-level) ----------

export async function findQuizzesForCourse(courseId) {
  return model.find({ course: courseId }).sort({ availableFrom: 1, createdAt: -1 });
}

export async function findQuizById(quizId) {
  return model.findById(quizId);
}

export async function createQuiz(courseId, data = {}) {
  const _id = data._id || uuidv4();
  // Minimal sensible defaults; client may pass more fields
  const doc = await model.create({
    _id,
    course: courseId,
    title: data.title ?? "New Quiz",
    description: data.description ?? "",
    published: data.published ?? false,
    type: data.type ?? "GRADED",
    group: data.group ?? "QUIZZES",
    shuffleAnswers: data.shuffleAnswers ?? true,
    timeLimit: data.timeLimit ?? 20,
    multipleAttempts: data.multipleAttempts ?? false,
    howManyAttempts: data.howManyAttempts ?? 1,
    showCorrectAnswers: data.showCorrectAnswers ?? "Immediately",
    accessCode: data.accessCode ?? "",
    oneQuestionAtATime: data.oneQuestionAtATime ?? true,
    webcamRequired: data.webcamRequired ?? false,
    lockAfterAnswering: data.lockAfterAnswering ?? false,
    due: data.due ?? null,
    availableFrom: data.availableFrom ?? null,
    availableUntil: data.availableUntil ?? null,
    points: data.points ?? 0,
    questions: Array.isArray(data.questions) ? data.questions : [],
  });
  return doc;
}

export async function updateQuiz(quizId, updates = {}) {
  // Never trust client 'points' — recompute from questions if present
  if (Array.isArray(updates.questions)) {
    updates.points = updates.questions.reduce(
      (sum, q) => sum + (Number(q?.points) || 0),
      0
    );
  }
  await model.updateOne({ _id: quizId }, { $set: updates });
  return findQuizById(quizId);
}

export async function deleteQuiz(quizId) {
  return model.deleteOne({ _id: quizId });
}

export async function setPublish(quizId, published) {
  await model.updateOne({ _id: quizId }, { $set: { published: !!published } });
  return findQuizById(quizId);
}

// ---------- Questions (embedded array in Quiz) ----------

export async function listQuestions(quizId) {
  const quiz = await model.findById(quizId, { questions: 1, _id: 0 });
  return quiz?.questions || [];
}

export async function createQuestion(quizId, data = {}) {
  const question = {
    _id: data._id || uuidv4(),
    type: data.type || "MCQ",     // "MCQ" | "TRUE_FALSE" | "FIB" (your client uses these)
    title: data.title ?? "New Question",
    points: Number(data.points) || 1,
    // Editor-friendly fields (optional-by-type)
    prompt: data.prompt ?? "",
    choices: Array.isArray(data.choices) ? data.choices : undefined,     // MCQ
    correctIndex: typeof data.correctIndex === "number" ? data.correctIndex : undefined, // MCQ
    correctTrue: typeof data.correctTrue === "boolean" ? data.correctTrue : undefined,   // TRUE_FALSE
    correctAnswers: Array.isArray(data.correctAnswers) ? data.correctAnswers : undefined // FIB
  };

  await model.updateOne(
    { _id: quizId },
    {
      $push: { questions: question },
      $inc: { points: question.points } // keep top-level points in sync
    }
  );

  // Return the created question
  return question;
}

export async function updateQuestion(questionId, data = {}) {
  // Fetch quiz containing the question to recompute points safely
  const quiz = await model.findOne({ "questions._id": questionId });
  if (!quiz) return null;

  // Find the current question
  const current = quiz.questions.find((q) => q._id === questionId);
  if (!current) return null;

  // Build the new question object by merging fields
  const updated = {
    ...current.toObject(),
    ...data,
    points: Number(data.points ?? current.points) || 0,
  };

  // Update the embedded question using positional operator
  await model.updateOne(
    { "questions._id": questionId },
    { $set: { "questions.$": updated } }
  );

  // Recompute total points
  const refetched = await model.findById(quiz._id);
  const newTotal = (refetched.questions || []).reduce(
    (sum, q) => sum + (Number(q.points) || 0),
    0
  );
  if (newTotal !== refetched.points) {
    await model.updateOne({ _id: quiz._id }, { $set: { points: newTotal } });
  }

  return updated;
}

export async function deleteQuestion(questionId) {
  // Need the question's points to decrement quiz.points accurately
  const quiz = await model.findOne({ "questions._id": questionId });
  if (!quiz) return { deletedCount: 0 };

  const q = quiz.questions.find((it) => it._id === questionId);
  const pts = Number(q?.points || 0);

  const pullRes = await model.updateOne(
    { _id: quiz._id },
    { $pull: { questions: { _id: questionId } }, $inc: { points: -pts } }
  );
  return pullRes;
}