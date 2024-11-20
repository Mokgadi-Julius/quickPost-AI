# Social Media Content generator

This application generates content based on images and trends.

## Project Structure
- backend/: Flask backend
- frontend/: React frontend
- docker-compose.yml: Docker Compose configuration

## Setup
1. Clone the repository
2. Set up environment variables in .env
3. Run `docker-compose up --build`

## Development
- Backend: Flask app in backend/app.py
- Frontend: React app in frontend/src/

## Deployment
Use Docker Compose to build and run the application.

## Environment Setup
Copy the .env.example files to .env and fill in your actual environment variables:

1. In the root directory: cp .env.example .env
2. In the backend directory: cp backend/.env.example backend/.env

Never commit .env files to the repository.

