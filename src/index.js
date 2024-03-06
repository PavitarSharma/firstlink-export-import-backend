import dotenv from "dotenv";
import app from "./server.js";
import { connectDB } from "./utils/db.js";
import { logger } from "./config/logger.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

// Handling uncaught Exception
process.on("uncaughtException", (error) => {
    logger.log(`Error: ${error.message}`);
    logger.log(`shutting down the server for handling uncaught exception`);
  });

connectDB();

const server = app.listen(PORT, () => logger.info(`Server listening on ${PORT}`));

// unhandled promise rejection
process.on("unhandledRejection", (err) => {
    logger.log(`Shutting down the server for ${err.message}`);
    logger.log(`shutting down the server for unhandle promise rejection`);
  
    server.close(() => {
      process.exit(1);
    });
  });
