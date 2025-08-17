// Kambaz/Quizzes/schema.js
import mongoose from "mongoose";

/** Embedded Question schema */
const QuestionSchema = new mongoose.Schema(
  {
    _id: String, // string IDs (uuid) from client
    type: {
      type: String,
      enum: ["MCQ", "TRUE_FALSE", "FIB"],
      default: "MCQ",
    },
    title: { type: String, default: "New Question" },
    points: { type: Number, default: 1 },
    prompt: { type: String, default: "" },

    // MCQ
    choices: { type: [String], default: undefined },
    correctIndex: { type: Number, default: undefined },

    // True/False
    correctTrue: { type: Boolean, default: undefined },

    // Fill in the Blank
    correctAnswers: { type: [String], default: undefined },
  },
  { _id: false }
);

/** Quiz schema */
const QuizSchema = new mongoose.Schema(
  {
    _id: String,
    course: { type: String, ref: "CourseModel", required: true },

    // Display
    title: { type: String, default: "New Quiz" },
    description: { type: String, default: "" },
    published: { type: Boolean, default: false },

    // Meta / configuration
    type: {
      type: String,
      enum: ["GRADED", "PRACTICE", "GRADED_SURVEY", "UNGRADED_SURVEY"],
      default: "GRADED",
    },
    group: {
      type: String,
      enum: ["QUIZZES", "EXAMS", "ASSIGNMENTS", "PROJECT"],
      default: "QUIZZES",
    },
    shuffleAnswers: { type: Boolean, default: true },
    timeLimit: { type: Number, default: 20 }, // minutes
    multipleAttempts: { type: Boolean, default: false },
    howManyAttempts: { type: Number, default: 1 },
    showCorrectAnswers: { type: String, default: "Immediately" },
    accessCode: { type: String, default: "" },
    oneQuestionAtATime: { type: Boolean, default: true },
    webcamRequired: { type: Boolean, default: false },
    lockAfterAnswering: { type: Boolean, default: false },

    // Dates / scoring
    points: { type: Number, default: 0 }, // can be recomputed from questions
    due: { type: Date, default: null },
    availableFrom: { type: Date, default: null },
    availableUntil: { type: Date, default: null },

    // Embedded questions
    questions: { type: [QuestionSchema], default: [] },
  },
  { collection: "quizzes", timestamps: true }
);

export default QuizSchema;