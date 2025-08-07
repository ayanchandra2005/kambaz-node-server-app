import Database from "../Database/index.js";
import { v4 as generateId } from "uuid";

export const getAssignmentsByCourse = (courseId) => {
  return Database.assignments.filter((a) => a.course === courseId);
};

export const getAssignment = (id) => {
  return Database.assignments.find((a) => a._id === id);
};

export const addAssignment = (assignment) => {
  const assignmentWithId = {
    ...assignment,
    _id: assignment._id ? assignment._id : generateId(),
  };
  Database.assignments = [...Database.assignments, assignmentWithId];
  return assignmentWithId;
};

export const modifyAssignment = (id, updates) => {
  const target = Database.assignments.find((a) => a._id === id);
  if (!target) return null;
  Object.assign(target, updates);
  return target;
};

export const removeAssignment = (id) => {
  Database.assignments = Database.assignments.filter((a) => a._id !== id);
  return { status: "deleted" };
};