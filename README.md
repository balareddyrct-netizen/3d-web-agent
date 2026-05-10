# 🤖 3D AI Coding Agent

A powerful, monorepo-based application that pairs a high-performance **React Native / React Three Fiber** frontend with an intelligent **Python FastAPI / LangChain** backend. This project acts as an interactive 3D coding assistant, capable of dynamically generating and rendering 3D shapes (boxes, spheres, toruses) and scaffolding React Three Fiber scenes on the fly based on natural language prompts.

## 🌟 Features
- **Dynamic 3D Rendering**: The UI automatically generates, scales, and colors 3D shapes inside a React Three Fiber canvas based on the AI's real-time reasoning and JSON outputs.
- **Python AI Backend**: Powered by `langchain-google-genai` and FastAPI. The backend acts as the "Brain", equipped with custom tools to fetch GLTF models, scaffold code, and generate procedural shapes.
- **Turbo Monorepo Architecture**: Clean separation of concerns with frontend workspaces (`apps/mobile`, `apps/web`), shared packages (`packages/state`), and an isolated backend.
- **Concurrent Start Environment**: Spin up both the mobile frontend and the Python backend using a single `npm start` command.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- A Google Gemini API Key

### 1. Backend Setup
Create an `.env` file inside the `backend` folder and add your Gemini API Key:
```env
GEMINI_API_KEY=your_api_key_here
```
Install the Python dependencies:
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 2. Frontend Setup
Install the Node modules for the Turborepo:
```bash
npm install
```

### 3. Run the App
From the root directory, simply run:
```bash
npm start
```
This single command uses `concurrently` to boot up the FastAPI server on `http://127.0.0.1:8000` and the Expo React Native app simultaneously!

## 🧠 Customizing the AI Brain
You can extend the agent's capabilities by adding new LangChain `@tool` functions in `backend/agent.py`. The backend exposes a `/chat` REST endpoint and an example `/api/custom` endpoint that you can modify for your own data pipelines.
