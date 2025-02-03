import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { authMiddleware } from "../middleware/auth";
import { validateImage } from "../middleware/imageValidation";
import { imageLogger } from "../middleware/imageLogger";
import { imageProcessor } from "../services/imageProcessor"; // Ensure you import the imageProcessor


const router = express.Router();

// Protected route for images with query parameters
router.get(
  "/",
  authMiddleware,
  validateImage,
  imageLogger,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { filename, width, height } = req.query;
      if (!filename) {
        res.status(400).json({ error: "Filename is required" });
        return;
      }

      const numWidth = parseInt(width as string);
      const numHeight = parseInt(height as string);

      const imagePath = path.join(
        __dirname,
        "../../images",
        filename as string,
      );

      console.log("API Request for image:", filename);
      console.log("Full image path:", imagePath);
      console.log("File exists:", fs.existsSync(imagePath));

      if (!fs.existsSync(imagePath)) {
        res.status(404).json({ error: "Image not found" });
        return;
      }

      // Process image with Sharp
      const processedPath = await imageProcessor.processImage(filename as string, numWidth as number, numHeight as number);

      // Send processed image
      res.set("Content-Type", "image/jpeg");
      res.sendFile(processedPath);
      
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ error: "Error processing image" });
    }
  },
);

router.get("/test-auth", authMiddleware, (req: Request, res: Response) => {
  res.json({ message: "Authenticated!" });
});

export default router;
