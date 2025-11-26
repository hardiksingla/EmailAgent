# Ocean AI - Prompt-Driven Email Productivity Agent

Ocean AI is a powerful email productivity agent designed to help you manage your inbox more efficiently using the power of Generative AI. It leverages RAG (Retrieval-Augmented Generation) to allow you to chat with your emails, extract insights, and manage tasks using natural language prompts.

## Features

- **Email Ingestion & Vectorization**: Automatically ingests emails and stores them as vectors in Qdrant for semantic search.
- **RAG-based Chat**: Chat with your inbox! Ask questions like "What did John say about the project deadline?" and get answers based on your actual emails.
- **General Chat**: A general-purpose AI chat interface powered by Google's Gemini models.
- **Prompt Brain**: A dedicated space to manage and refine your custom prompts for email processing.
- **Email Insights**: Visualize and analyze your email data.
- **Modern UI**: A sleek, dark-themed user interface built with React and TailwindCSS.

## Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Metadata), Qdrant (Vector Store)
- **AI/LLM**: Google Generative AI (Gemini)
- **Email**: Nodemailer (for sending/processing)

## Prerequisites

Before running the project, ensure you have the following installed/set up:

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Qdrant](https://qdrant.tech/) (Local Docker instance or Cloud)
- [Google Gemini API Key](https://ai.google.dev/)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/hardiksingla/EmailAgent.git
    cd EmailAgent
    ```

2.  **Install dependencies:**
    
    Root (for build scripts):
    ```bash
    npm install
    ```

    Backend:
    ```bash
    cd backend
    npm install
    ```

    Frontend:
    ```bash
    cd frontend
    npm install
    ```

3.  **Environment Configuration:**
    
    Create a `.env` file in the `backend` directory with the following variables:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/email-agent
    GEMINI_API_KEY=your_gemini_api_key
    QDRANT_URL=http://localhost:6333
    # Add other necessary variables
    ```

## Usage

### Development

To run the frontend and backend separately during development:

1.  **Start the Backend:**
    ```bash
    cd backend
    npm start
    ```
    The backend runs on `http://localhost:5000`.

2.  **Start the Frontend:**
    ```bash
    cd frontend
    npm run dev
    ```
    The frontend runs on `http://localhost:5173`.

### Production Build

To build and serve the application as a single unit:

1.  **Build both frontend and backend:**
    ```bash
    npm run build
    ```
    This script installs dependencies and builds the frontend.

2.  **Start the application:**
    ```bash
    npm start
    ```
    This will start the backend server, which is configured to serve the static frontend files. Access the app at `http://localhost:5000`.

## Project Structure

- `backend/`: Node.js/Express server, API routes, and services.
- `frontend/`: React application source code.
- `qdrant_storage/`: Local storage for Qdrant (if using Docker volume).
