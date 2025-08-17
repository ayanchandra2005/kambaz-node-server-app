// import Database from "../Database/index.js";
// import { v4 as uuidv4 } from "uuid";

// let { enrollments } = Database;

// export function enrollUserInCourse(userId, courseId) {
//   const exists = enrollments.some(
//     (e) => e.user === userId && e.course === courseId
//   );
//   if (!exists) {
//     enrollments.push({ _id: uuidv4(), user: userId, course: courseId });
//   }
// }

// export function unenrollUserFromCourse(userId, courseId) {
//   enrollments = enrollments.filter(
//     (e) => !(e.user === userId && e.course === courseId)
//   );
//   Database.enrollments = enrollments; 
// }

// export function findEnrollmentsByUserId(userId) {
//   return enrollments.filter((e) => e.user === userId);
// }

import model from "./model.js";
export async function findCoursesForUser(userId) {
 const enrollments = await model.find({ user: userId }).populate("course");
 return enrollments.map((enrollment) => enrollment.course);
}
export async function findUsersForCourse(courseId) {
 const enrollments = await model.find({ course: courseId }).populate("user");
 return enrollments.map((enrollment) => enrollment.user);
}
export function enrollUserInCourse(user, course) {
  const newEnrollment = { user, course, _id: `${user}-${course}` };
  return model.create(newEnrollment);
}
export function unenrollUserFromCourse(user, course) {
  return model.deleteOne({ user, course });
}

export const findEnrollmentsByUserId = (userId) =>
  model.find({ user: userId }).populate("course");
