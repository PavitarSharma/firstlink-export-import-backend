import jwt from "jsonwebtoken";
import { ACCESS_TOKEN } from "../config/environment.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new ErrorHandler("Access Denied. No token provided.", 401));
  }

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return next(new ErrorHandler("Access Denied. No token provided.", 401));

  const decoded = jwt.verify(
    token,
    ACCESS_TOKEN
  );

  if (!decoded) {
    return next(new ErrorHandler("Invalid token", 403));
  }

  req.user = decoded.id;
  next();
};
