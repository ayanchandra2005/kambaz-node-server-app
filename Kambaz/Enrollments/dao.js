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