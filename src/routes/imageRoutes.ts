import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { authMiddleware } from "../middleware/auth";
import { validateImage } from "../middleware/imageValidation";
import { imageLogger } from "../middleware/imageLogger";

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

      // If no size parameters, send original image
      if (!width && !height) {
        res.sendFile(imagePath);
        return;
      }

      // Process image with Sharp
      let imageProcessor = sharp(imagePath);

      // Resize if dimensions provided
      if (width || height) {
        imageProcessor = imageProcessor.resize({
          width: width ? parseInt(width as string) : undefined,
          height: height ? parseInt(height as string) : undefined,
          fit: "contain",
        });
      }

      // Send processed image
      res.set("Content-Type", "image/jpeg");
      await new Promise((resolve) => {
        imageProcessor.pipe(res).on("finish", resolve);
      });
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
