# Image Processing Middleware 🖼️

A TypeScript Express middleware for image processing with caching, logging, and security features.

## ✨ Features

- 🔄 Image resizing with custom dimensions
- 💾 Cached processed images
- 📝 Access logging
- ⚠️ Error handling
- 🔒 Security middleware (Helmet, CORS)
- ⚡ Rate limiting
- 🗜️ Request compression

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Create required directories
mkdir -p images processed_images logs images
```

### Usage

```bash
# Start the server
npm start
```

### TypeScript Implementation

```typescript
import express from 'express';
import { imageResizeMiddleware } from './config/middleware';

const app = express();
app.use('/api/image', imageResizeMiddleware);
```

## 📡 API Endpoints

### 1. Home Page
```http
GET /
```
Displays a web page with images from the images directory.

**Example:**
```
http://localhost:3000
```

### 2. Resize Image
```http
GET /api/image?filename=example.jpg&width=300&height=200
```

**Query Parameters:**
- `filename`: Name of image file (required)
- `width`: Desired width in pixels (required)
- `height`: Desired height in pixels (required)

### 3. Static Image Access
```http
GET /static/example.jpg
```

## 🛠️ Core Features

### 💾 Caching
- Processed images stored in `processed_images/`
- Cached versions reused for identical dimensions
- Format: `{original_name}_{width}x{height}.{extension}`

### 📝 Logging
- Image access logs in `logs/image-access.log`
- Processing logs in `logs/image-processing.log`
- Timestamps and access details recorded

### 🔒 Security
- Helmet for secure headers
- CORS enabled
- Rate limiting on API endpoints
- Request validation middleware

## 👩‍💻 Development

```bash
# Run tests
npm test

# Start development server
npm start

# Format code
npm run prettier

# Lint code
npm run lint
```

## 📦 Dependencies

### Production
- `express`: Web framework
- `sharp`: Image processing
- `helmet`: Security headers
- `cors`: Cross-origin resource sharing
- `compression`: Response compression
- `morgan`: Request logging
- `dotenv`: Environment configuration
- `express-rate-limit`: API rate limiting

### Development
- `typescript`: Programming language
- `@types/*`: Type definitions
- `jasmine`: Testing framework
- `supertest`: HTTP testing
- `nodemon`: Development server
- `ts-node`: TypeScript execution
- `prettier`: Code formatting
- `eslint`: Code linting

## 🧪 Testing

The project includes unit tests and integration tests using Jasmine.

**Coverage:**
- ✅ Image processing functionality
- ✅ API endpoint responses
- ✅ Error handling
- ✅ Parameter validation

## ⚙️ Configuration

```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "CommonJS",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

## 📝 License

MIT © Rhyno Strydom