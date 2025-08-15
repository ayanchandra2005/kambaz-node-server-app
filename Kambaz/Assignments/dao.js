import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export const getAssignmentsByCourse = (courseId) => {
  return model.find({ course: courseId });
};

export const getAssignment = (id) => {
  return model.findById(id);
};

export const addAssignment = (assignment) => {
  const toCreate = { ...assignment };
  if (!toCreate._id) toCreate._id = uuidv4();
  return model.create(toCreate);
};

export const modifyAssignment = (id, updates) => {
  return model.findOneAndUpdate(
    { _id: id },
    { $set: updates },
    { new: true }         
  );
};

export const removeAssignment = (id) => {
  return model.deleteOne({ _id: id });
};