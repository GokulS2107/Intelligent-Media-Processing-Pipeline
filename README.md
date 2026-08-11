# Intelligent Media Processing Pipeline

## Overview

A full-stack application for uploading vehicle images and performing automated quality analysis and OCR processing. The system uses asynchronous processing with BullMQ and Redis to handle image analysis in the background, providing real-time status updates and detailed analysis results.

## Features

- 📤 Image upload with validation (JPEG, PNG, WEBP)
- 🔄 Asynchronous processing via BullMQ/Redis
- 🔍 Multiple image analysis checks:
  - Blur detection (Laplacian variance)
  - Brightness analysis
  - Duplicate detection (perceptual hashing)
  - OCR text extraction (Tesseract.js)
  - Indian vehicle number format validation
- 📊 Real-time processing status
- 📈 Detailed analysis results
- 🔁 Retry failed jobs
- 🖥️ React dashboard with live updates
- 🐳 Docker containerization

## Architecture

Client (React)
      ↓
API (Express)
      ↓
MongoDB + Redis
      ↓
BullMQ Queue
      ↓
  Worker
      ↓
Image Analyzers
      ↓
  MongoDB
      ↓
Results API
      ↓
React Dashboard


## Processing Flow

1. User uploads image via API
2. Image metadata stored in MongoDB
3. Processing job added to BullMQ queue
4. Worker picks up job
5. Image analyzed by multiple analyzers
6. Results stored in MongoDB
7. Status updated (pending → processing → completed/failed)
8. User polls for status/results

## Tech Stack

### Backend
- **Node.js/Express**: REST API server
- **MongoDB/Mongoose**: Document database
- **Redis/BullMQ**: Message queue
- **Sharp**: Image processing
- **Tesseract.js**: OCR
- **Jest/Supertest**: Testing

### Frontend
- **React**: UI framework
- **Vite**: Build tool
- **Axios**: HTTP client
- **CSS**: Responsive styling

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

Running with Docker

# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend