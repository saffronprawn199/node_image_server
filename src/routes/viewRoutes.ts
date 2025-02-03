import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// Route to serve the HTML file
router.get(
  "/",
  (req: Request, res: Response) => {
    const filePath: string = path.join(__dirname, "..", "views", "index.html");

    fs.readFile(
      filePath,
      "utf8",
      (err: NodeJS.ErrnoException | null, data: string) => {
        if (err) {
          console.error(err);
          res.status(500).send("Internal Server Error");
          return;
        }

        res.setHeader("Content-Type", "text/html");
        res.status(200).send(data);
      },
    );
  },
);

export default router;
