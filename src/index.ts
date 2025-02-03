import express from "express";
import { configureMiddleware } from "./config/middleware";
import { imageResizeMiddleware } from "./middleware/imageResizeMiddleware";
import viewRoutes from "./routes/viewRoutes";
import imageRoutes from "./routes/imageRoutes";
import dotenv from 'dotenv';
import path from "path";

const app = express();

dotenv.config();

// Configure middleware including the rate limiter
configureMiddleware(app);

// Serve static files
app.use("/static", express.static(path.join(__dirname, "../images")));

// Configure middleware
app.use("/api/image",imageResizeMiddleware ,imageRoutes);

// Add view routes
app.use("/", viewRoutes);

// Start server if this file is run directly
if (require.main === module) {
  const port = 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

// Export for testing
export default app;
