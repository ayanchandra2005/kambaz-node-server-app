// Kambaz/Quizzes/attempts.schema.js
import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema(
  {
    questionId: String,
    // one of these is used depending on type
    mcqIndex: { type: Number, default: undefined },
    tfValue:   { type: Boolean, default: undefined },
    fibText:   { type: String, default: undefined },

    correct:   { type: Boolean, default: false },
    earned:    { type: Number,  default: 0 },
  },
  { _id: false }
);

const AttemptSchema = new mongoose.Schema(
  {
    _id: String,
    quizId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    attemptNumber: { type: Number, required: true },
    answers: { type: [AnswerSchema], default: [] },
    score:   { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { collection: "quizAttempts", timestamps: true }
);

export default AttemptSchema;