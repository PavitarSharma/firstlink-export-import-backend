import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import routes from "./routes/index.js"
import cookieParser from "cookie-parser"
import { errorHandler } from "./middlewares/error.middleware.js";
import { CLIENT_URL } from "./config/environment.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

const app = express();

app.use(
  cors({
    origin: [CLIENT_URL, "*"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    message: "Success",
  });
});

app.use("/api", routes);

app.use("*", (req, res) => {
  res.status(404).json({
    status: 404,
    message: "Not Found",
  });
});

app.use(errorHandler);

export default app;
