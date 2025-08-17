// Kambaz/Quizzes/attempts.model.js
import mongoose from "mongoose";
import AttemptSchema from "./attempts.schema.js";

const AttemptModel = mongoose.model("QuizAttemptModel", AttemptSchema);
export default AttemptModel;