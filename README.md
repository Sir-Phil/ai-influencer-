This README is designed for your specific dual-stack setup: **FastAPI (Python/uv)** for the AI heavy lifting and **Next.js (TypeScript/npm)** for the command center.

---

# Amaka AI: Political Mission Control 🇳🇬

**Amaka AI** is a production-ready, Human-in-the-Loop AI Influencer platform. It leverages **CrewAI** and **Perplexity** to research Nigerian political developments in real-time and drafts high-impact social media content.

The system is designed for "Amaka," a digital persona that translates complex policy (like the 2026 Digital Economy Bill) into digestible advocacy for Nigerian tech startups and citizens.

## 🚀 Architecture

-   **Backend**: FastAPI, CrewAI (Multi-agent orchestration), PydanticAI, and SQLAlchemy.
-   **Frontend**: Next.js 16, Tailwind CSS v4, Shadcn/UI, and Sonner.
-   **Intelligence**: Perplexity Sonar (Real-time web search) & OpenAI GPT-4o.
-   **Env Management**: `uv` (Python) and `npm` (Node.js).

---

## 🛠 Project Structure

```text
ai-influencer/
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── agents/         # CrewAI Agent definitions
│   │   ├── db/             # SQLite/PostgreSQL models & migrations
│   │   └── main.py         # FastAPI entry point (Lifespan handlers)
│   ├── .venv/              # Isolated python environment (uv)
│   └── pyproject.toml      # Dependency management
├── frontend/               # Next.js Dashboard
│   ├── app/                # App Router (Pages & Layouts)
│   ├── components/ui/      # Shadcn atomic components
│   ├── lib/api.ts          # Typed backend communication
│   └── tailwind.config.ts  # Tailwind CSS v4 configuration
└── .vscode/                # Workspace settings for Pylance/TS
```

---

## ⚙️ Setup & Installation

### 1. Backend (Python 3.12+)
Navigate to the backend folder and use `uv` for lightning-fast setup.

```bash
cd backend
# Install dependencies and create .venv
uv sync

# Set up environment variables (.env)
echo "OPENAI_API_KEY=your_key" >> .env
echo "PERPLEXITY_API_KEY=your_key" >> .env
echo "DATABASE_URL=sqlite+aiosqlite:///./amaka.db" >> .env

# Start the server
uv run uvicorn app.main:app --reload
```

### 2. Frontend (Node.js 20+)
Navigate to the frontend folder and install dependencies.

```bash
cd frontend
npm install

# Start the development server
npm run dev
```

---

## 🚦 Key Workflows

### AI Content Generation
1.  **Trigger**: User submits a topic (e.g., "Minimum Wage impact in Lagos") via the dashboard.
2.  **Research**: CrewAI initializes a "Political Researcher" agent using the **Perplexity Sonar** model to crawl live news.
3.  **Drafting**: A "Copywriter" agent transforms the research into Amaka's unique voice.
4.  **Review**: The backend saves the draft with a `review_required` status.
5.  **Approval**: The user edits and approves the post, which can then be dispatched to social APIs.

---

## 🛡 Features

-   **Lifespan Events**: Backend uses modern FastAPI `lifespan` for clean DB connection management.
-   **Agentic Search**: Unlike standard LLMs, this project uses Perplexity to ensure facts are grounded in 2026 reality.
-   **Sonner Notifications**: Real-time "toast" feedback for long-running AI background tasks.
-   **Type Safety**: End-to-end TypeScript interfaces and Pydantic models.

---

## 📝 Future Roadmap
-   [ ] **Twitter/X Integration**: Direct posting after approval.
-   [ ] **Sentiment Analysis**: Dashboard showing real-time feedback on Amaka's posts.
-   [ ] **Image Generation**: Integrating DALL-E 3 for auto-generating post graphics.

---

**Developer**: Philip Onuchukwu  
**Stack**: Backend Engineer | AI Agent Specialist