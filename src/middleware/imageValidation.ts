import { Request, Response, NextFunction } from "express";
import path from "path";

export const validateImage = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const filename = req.query.filename as string;
  const width = req.query.width as string;
  const height = req.query.height as string;

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];

  // Validate filename
  if (!filename) {
    res.status(400).json({ error: "Filename is required" });
    return;
  }

  if (!allowedExtensions.includes(path.extname(filename).toLowerCase())) {
    res.status(400).json({ error: "Invalid image format" });
    return;
  }

  // Validate dimensions if provided
  if (width && isNaN(parseInt(width))) {
    res.status(400).json({ error: "Width must be a number" });
    return;
  }

  if (height && isNaN(parseInt(height))) {
    res.status(400).json({ error: "Height must be a number" });
    return;
  }

  next();
};
