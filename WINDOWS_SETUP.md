# Change App - Windows 10 Setup Guide

This document provides detailed instructions for setting up the Change App on Windows 10, with both standard installation and Docker options.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Standard Installation](#standard-installation)
3. [Docker Installation (Recommended)](#docker-installation-recommended)
4. [Troubleshooting](#troubleshooting)

## Prerequisites

### For Standard Installation
- Node.js 18+ ([Download](https://nodejs.org/))
- MongoDB Community Server ([Download](https://www.mongodb.com/try/download/community))
- Git ([Download](https://git-scm.com/download/win))

### For Docker Installation
- Docker Desktop for Windows ([Download](https://www.docker.com/products/docker-desktop))

## Standard Installation

### Step 1: Install MongoDB
1. Download MongoDB Community Server from the link above
2. Run the installer and follow the installation wizard
   - Choose "Complete" installation
   - Install MongoDB as a service (default option)
   - Keep the default data directory (`C:\Program Files\MongoDB\Server\X.X\data`)
3. Verify MongoDB is running:
   - Open Command Prompt
   - Type `mongosh` and press Enter
   - You should see the MongoDB shell prompt

### Step 2: Set Up the Backend
1. Extract the Change App ZIP package to a location of your choice
2. Open Command Prompt
3. Navigate to the backend directory:
   ```
   cd "C:\path\to\change-app-complete\backend"
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Create a `.env` file in the backend directory with:
   ```
   MONGO_URI=mongodb://localhost:27017/changeapp
   JWT_SECRET=your_secret_key_here
   PORT=5000
   ```
6. Start the backend:
   ```
   npm start
   ```
   The backend will run on http://localhost:5000

### Step 3: Set Up the Frontend
1. Open a new Command Prompt window
2. Navigate to the frontend directory:
   ```
   cd "C:\path\to\change-app-complete\frontend"
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the frontend:
   ```
   npm start
   ```
   The frontend will automatically open in your browser at http://localhost:3000

## Docker Installation (Recommended)

Docker provides the easiest setup experience with minimal configuration.

### Step 1: Install Docker Desktop
1. Download and install Docker Desktop for Windows from the link above
2. Follow the installation wizard instructions
3. Start Docker Desktop and wait for it to initialize
4. Ensure Docker is running by checking the Docker icon in the system tray

### Step 2: Configure the Application
1. Extract the Change App ZIP package to a location of your choice
2. Navigate to the docker directory:
   ```
   cd "C:\path\to\change-app-complete\docker"
   ```
3. Copy the example environment file:
   ```
   copy .env.example .env
   ```
4. Edit the `.env` file to update the JWT_SECRET to a secure random string

### Step 3: Start the Application
1. From the docker directory, run:
   ```
   docker-compose up -d
   ```
2. Wait for Docker to download images and start containers (this may take a few minutes the first time)
3. Access the application at http://localhost:3000

### Step 4: Monitor the Application
- View logs with:
  ```
  docker-compose logs -f
  ```
- Stop the application with:
  ```
  docker-compose down
  ```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running in Windows Services
- Check if the port 27017 is not being used by another application
- Verify your firewall settings are not blocking MongoDB

### Docker Issues
- Ensure Docker Desktop is running
- Try restarting Docker Desktop if containers fail to start
- Check Docker logs for specific error messages

### Port Conflicts
- If ports 3000 or 5000 are already in use:
  - For standard installation: Edit the port in backend's `.env` file and frontend's `.env` file
  - For Docker: Edit the ports in `docker-compose.yml`

### Node.js Issues
- Ensure you have Node.js version 18 or higher
- Try clearing npm cache: `npm cache clean --force`

For additional help, please refer to the project documentation or contact support.
