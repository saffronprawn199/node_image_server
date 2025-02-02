import { Request, Response, NextFunction } from "express";

export const imageLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(`Image requested: ${req.params.imageName}`);
  console.log(`Request IP: ${req.ip}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  next();
};
