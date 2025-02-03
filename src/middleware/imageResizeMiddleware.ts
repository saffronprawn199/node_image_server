import sharp from "sharp";
import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";

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
  next: NextFunction,
) => {
  try {
    const { filename, width, height } = req.query;

    // Check for missing parameters
    if (!filename || !width || !height) {
      console.log("Missing parameters:", { filename, width, height }); // Added logging
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
      console.log("Invalid dimensions:", { numWidth, numHeight }); // Added logging
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
  next();
};
