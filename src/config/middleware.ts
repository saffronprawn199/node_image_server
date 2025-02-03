import express from "express";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import * as fs from "fs";

// Add this function before configureMiddleware
const saveImageAccess = (imagePath: string) => {
  try {
    const logPath = path.join(__dirname, "../../logs/image-access.log");
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - Accessed: ${imagePath}\n`;

    // Add debug logging
    console.log("Attempting to save log entry:", logEntry);

    // Ensure logs directory exists
    const logsDir = path.dirname(logPath);
    if (!fs.existsSync(logsDir)) {
      console.log("Creating logs directory:", logsDir);
      fs.mkdirSync(logsDir, { recursive: true });
    }

    fs.appendFileSync(logPath, logEntry);
    console.log("Successfully saved log entry");
  } catch (error) {
    console.error("Error saving image access log:", error);
  }
};

export const configureMiddleware = (app: express.Application) => {
  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "img-src": ["'self'", "data:", "blob:"],
        },
      },
    }),
  );

  // CORS middleware
  app.use(cors());

  // Request logging middleware
  app.use(morgan("dev"));

  // Compression middleware
  app.use(compression());

  // Rate limiting middleware
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    handler: (req, res) => {
      console.log("Rate limit exceeded for IP:", req.ip);
      res.status(429).json({ error: "Too many requests" });
    },
  });
  app.use("/api/", limiter);

  // Body parser middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from the images directory
  app.use(
    "/static",
    express.static(path.join(__dirname, "../../images"), {
      setHeaders: (res, filePath) => {
        console.log("Serving file:", filePath);
        saveImageAccess(filePath);
      },
    }),
  );

  // Debug logging for images directory
  const imagesPath = path.join(__dirname, "../../images");
  console.log("Images directory path:", imagesPath);
  console.log("Images directory exists:", fs.existsSync(imagesPath));
  console.log("Contents of images directory:", fs.readdirSync(imagesPath));

  // Error handling middleware
  app.use(
    (
      err: Error,
      req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error(err.stack);
      res.status(500).send("Something broke!");
    },
  );
};
