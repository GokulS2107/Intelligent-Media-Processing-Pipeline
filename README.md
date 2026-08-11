# Intelligent Media Processing Pipeline

A full-stack application for AI-powered image analysis, featuring automatic vehicle number plate recognition (OCR), blur detection, brightness analysis, and duplicate detection.

## 🚀 Features

### Core Capabilities
- **📤 Image Upload**: Drag-and-drop interface with support for JPEG, PNG, and WEBP formats
- **🔍 OCR & Plate Recognition**: Extracts text and validates vehicle registration numbers
- **👁️ Blur Detection**: Measures image sharpness using Laplacian variance
- **☀️ Brightness Analysis**: Evaluates exposure levels and classifies images
- **🔄 Duplicate Detection**: Perceptual hashing to identify similar images
- **📊 Real-time Status**: Live progress tracking with polling updates
- **📈 Detailed Results**: Tabbed interface showing comprehensive analysis

### Technical Highlights
- **Event-driven Architecture**: Redis-backed job queue for scalable processing
- **Microservices Design**: Separate backend, worker, and frontend services
- **Docker Containerization**: Easy deployment with Docker Compose
- **Responsive UI**: Mobile-friendly dashboard with dark mode support

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose** (recommended)
- **MongoDB** (v6)
- **Redis** (v7)
- **npm** or **yarn**

## 🛠️ Installation

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/intelligent-media-pipeline.git
cd intelligent-media-pipeline

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
```

### Option 2: Manual Setup

#### Backend

```bash
cd backend
npm install

# Create .env file (see Configuration section)
cp .env.example .env

# Run development server
npm run dev
```

#### Worker

```bash
cd backend
npm run worker
```

#### Frontend

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Run development server
npm run dev
```

## ⚙️ Configuration

### Backend Environment Variables (`.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/media_pipeline

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend Environment Variables (`.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend      │ ──▶ │    Backend      │ ──▶ │   Redis Queue    │
│   (React + Vite) │     │   (Express.js)  │     │   (BullMQ)       │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Database       │ ◀── │   Worker        │ ◀── │   Image          │
│   (MongoDB)      │     │   (Node.js)     │     │   Processing     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Components

- **Frontend**: React SPA with Vite for fast development
- **Backend API**: Express.js REST API with MongoDB
- **Worker Service**: Background job processor using BullMQ
- **Redis**: Job queue and caching layer
- **MongoDB**: Persistent storage for images and results

## 📚 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/images/upload` | Upload an image for processing |
| `GET` | `/api/images/:id/status` | Check processing status |
| `GET` | `/api/images/:id/results` | Retrieve processing results |
| `POST` | `/api/images/:id/retry` | Retry failed processing |
| `GET` | `/api/images` | List all processed images |
| `GET` | `/api/images/stats` | Get processing statistics |

### Example Upload Request

```bash
curl -X POST http://localhost:5000/api/images/upload \
  -F "image=@/path/to/vehicle.jpg"
```

### Example Response

```json
{
  "success": true,
  "processingId": "22FUGV4G2K",
  "message": "Image uploaded successfully",
  "status": "pending"
}
```

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📊 Analysis Modules

### Blur Detection
- Uses Laplacian variance to measure sharpness
- Higher scores indicate sharper images
- Threshold: 100 (heuristic value)

### Brightness Analysis
- Average pixel intensity calculation
- Classification: too_dark (<30), acceptable (30-230), too_bright (>230)

### Duplicate Detection
- Perceptual hashing (pHash)
- Similarity threshold: 0.9
- Returns similar image IDs for manual review

### OCR & Plate Recognition
- Tesseract.js for text extraction
- Indian vehicle plate format validation
- Format examples: KA01AB1234, MH12DE1234

## 🚀 Deployment

### Docker Production Build

```bash
# Build and deploy all services
docker-compose -f docker-compose.prod.yml up -d

# Scale workers as needed
docker-compose up -d --scale worker=3
```

### Manual Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Configure Nginx/Apache to serve the static files

3. Deploy backend:
```bash
cd backend
npm install --production
npm start
```

4. Set up environment variables on production server

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **Backend**: ESLint with Airbnb style guide
- **Frontend**: ESLint with React plugin
- **CSS**: BEM naming convention
- **Commit Messages**: Conventional Commits format

## 🙏 Acknowledgments

- [Tesseract.js](https://github.com/naptha/tesseract.js) for OCR capabilities
- [BullMQ](https://github.com/taskforcesh/bullmq) for job queue management
- [Sharp](https://github.com/lovell/sharp) for image processing
- [MongoDB](https://www.mongodb.com/) for data persistence
- [Redis](https://redis.io/) for caching and queuing
- [React](https://reactjs.org/) for the frontend framework
