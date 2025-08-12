import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

export const createUser = async (user) => {
  const { _id, ...rest } = user || {};
  const toCreate = { ...rest, _id: uuidv4() };
  return model.create(toCreate);
};

export const findAllUsers = async () => model.find();

export const findUsersByRole = async (role) => model.find({ role });

export const findUserById = async (userId) => model.findById(userId);

export const findUserByUsername = async (username) =>
  model.findOne({ username });

export const findUserByCredentials = async (username, password) =>
  model.findOne({ username, password });

export const findUsersByPartialName = (partialName) => {
  const regex = new RegExp(partialName, "i"); // 'i' makes it case-insensitive
  return model.find({
    $or: [{ firstName: { $regex: regex } }, { lastName: { $regex: regex } }],
  });
};

export const updateUser = async (userId, user) =>
  model.updateOne({ _id: userId }, { $set: user });

export const deleteUser = async (userId) =>
  model.deleteOne({ _id: userId });