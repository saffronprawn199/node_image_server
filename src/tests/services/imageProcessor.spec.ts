import { ImageProcessor } from "../../services/imageProcessor";
import app from "../../index";
import supertest from "supertest";

const request = supertest(app);

describe("ImageProcessor", () => {
  const imageProcessor = new ImageProcessor();
  

  it("should validate correct dimensions", () => {
    expect(imageProcessor.validateDimensions(100, 100)).toBe(true);
    expect(imageProcessor.validateDimensions(0, 100)).toBe(false);
  });
});

describe("Image Processing Endpoint", () => {
  const testImageName = "download.png"; // Use an image that exists in your images folder
  const apiKey = process.env.API_KEY; // Replace with your actual API key

  it("should successfully resize an image", async () => {
    const response = await request.get("/api/image").query({
      filename: testImageName,
      width: "200",
      height: "200",
    })
    .set("x-api-key", apiKey as string);
    expect(response.status).toBe(200);
  });

  it("should return 400 for missing parameters", async () => {
    const response = await request.get("/api/image").query({
      filename: testImageName,
      // Missing width and height
    });

    expect(response.status).toBe(400);
  });

  it("should return 400 for invalid dimensions", async () => {
    const response = await request.get("/api/image").query({
      filename: testImageName,
      width: "-300",
      height: "300",
    });

    expect(response.status).toBe(400);
  });

  it("should return 500 for non-existent image", async () => {
    const response = await request.get("/api/image").query({
      filename: "non-existent.jpg",
      width: "300",
      height: "300",
    });

    expect(response.status).toBe(500);
  });
});
