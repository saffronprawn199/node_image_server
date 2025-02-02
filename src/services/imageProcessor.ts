import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";
import { logInfo } from "../utils/logger";

export class ImageProcessor {
  private readonly originalDir: string;
  private readonly processedDir: string;

  constructor() {
    this.originalDir = path.join(__dirname, "../../images");
    this.processedDir = path.join(__dirname, "../../processed_images");
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist(): void {
    [this.originalDir, this.processedDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  public async processImage(
    filename: string,
    width: number,
    height: number,
  ): Promise<string> {
    const originalPath = path.join(this.originalDir, filename);
    const processedFilename = `${path.parse(filename).name}_${width}x${height}${path.parse(filename).ext}`;
    const processedPath = path.join(this.processedDir, processedFilename);

    if (!fs.existsSync(originalPath)) {
      throw new Error("Original image does not exist");
    }

    if (!fs.existsSync(processedPath)) {
      await sharp(originalPath)
        .resize(width, height, {
          fit: "fill",
        })
        .toFile(processedPath);

      logInfo({
        message: `Processed image: ${filename} to ${width}x${height}`,
        timestamp: new Date().toISOString(),
      });
    }

    return processedPath;
  }

  public validateDimensions(width: number, height: number): boolean {
    return !isNaN(width) && !isNaN(height) && width > 0 && height > 0;
  }
}

export const imageProcessor = new ImageProcessor();
