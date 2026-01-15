import { User } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export const createUser = async ({
  name,
  email,
  password
}: CreateUserInput) => {

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const user = await User.create({
    name,
    email,
    password
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
};

interface LoginUserInput {
  email: string;
  password: string;
}

export const authenticateUser = async ({ email, password }: LoginUserInput) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const userWithMethod: any = user;
  const isValidPassword = await userWithMethod.verifyPassword(password);

  if (!isValidPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
};