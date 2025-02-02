import express from "express";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import * as fs from "fs";
import sharp from "sharp";
import { Request, Response, NextFunction } from "express";

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

const saveProcessedImage = async (
  filename: string,
  width: number,
  height: number,
) => {
  try {
    // Validate dimensions before processing
    if (width <= 0 || height <= 0) {
      throw new Error("Width and height must be positive numbers");
    }

    const originalPath = path.join(__dirname, "../../images", filename);
    if (!fs.existsSync(originalPath)) {
      throw new Error("Image not found");
    }

    const processedDir = path.join(__dirname, "../../processed_images");
    const processedFilename = `${path.parse(filename).name}_${width}x${height}${path.parse(filename).ext}`;
    const processedPath = path.join(processedDir, processedFilename);

    // Create processed_images directory if it doesn't exist
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir, { recursive: true });
    }

    // Only process and save if the processed version doesn't already exist
    if (!fs.existsSync(processedPath)) {
      console.log("Processing and saving image:", processedPath);

      await sharp(originalPath)
        .resize(width, height, {
          fit: "cover",
          position: "center",
        })
        .toFile(processedPath);

      // Log the save
      const logPath = path.join(__dirname, "../../logs/image-processing.log");
      const timestamp = new Date().toISOString();
      const logEntry = `${timestamp} - Processed: ${filename} to ${width}x${height}\n`;
      fs.appendFileSync(logPath, logEntry);
    }

    return processedPath;
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
};

export const imageResizeMiddleware = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const { filename, width, height } = req.query;

    // Check for missing parameters
    if (!filename || !width || !height) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    const numWidth = parseInt(width as string);
    const numHeight = parseInt(height as string);

    // Validate dimensions are positive numbers
    if (
      isNaN(numWidth) ||
      isNaN(numHeight) ||
      numWidth <= 0 ||
      numHeight <= 0
    ) {
      res
        .status(400)
        .json({ error: "Width and height must be positive numbers" });
      return;
    }

    const processedPath = await saveProcessedImage(
      filename as string,
      numWidth,
      numHeight,
    );

    res.sendFile(processedPath);
  } catch (error: unknown) {
    console.error("Error in image processing middleware:", error);
    if (error instanceof Error) {
      if (error.message.includes("positive numbers")) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Error processing image" });
      }
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
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
        console.log("Serving c file:", filePath);
        saveImageAccess(filePath);
      },
    }),
  );

  // Debug logging for images directory
  const imagesPath = path.join(__dirname, "../../images");
  console.log("Images directory path:", imagesPath);
  console.log("Images directory exists:", fs.existsSync(imagesPath));
  console.log("Contents of images directory:", fs.readdirSync(imagesPath));

  // Add middleware to handle image processing requests
  // app.use("/api/image", imageResizeMiddleware);

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
