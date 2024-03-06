import monggose from "mongoose";
import { DATABASE_URL } from "../config/environment.js";
import { logger } from "../config/logger.js";



export const connectDB = async () => {
 
  try {
    await monggose.connect(DATABASE_URL);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error(`Error connecting to Mongo: ${error.message}`);
  }
};
