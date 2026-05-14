

---

```markdown
# Amaka AI: Multi-Agent Digital Advocacy & Content Studio 🇳🇬📡

**Amaka AI** is a production-ready, stateful **Multi-Agent System** and **MCP-Driven Business Automation pipeline** designed to operate as a digital advocacy, trend-scouting, and multimedia content creation studio. 

The system drives the persona of "Amaka"—a savvy, Pan-Nigerian digital advocate focusing on youth political inclusion. It completely automates the lifecycle of breaking news aggregation, multi-tier fact-checking, creative asset generation (multimedia card attachments), and human-verified global publishing.

### 🌐 Live Production Links
* 🖥️ **Production Command Center (Frontend):** [ai-influencer-livid.vercel.app](https://ai-influencer-livid.vercel.app/)
* ⚙️ **Production Orchestration Engine (Backend):** [ai-influencer-production-cb07.up.railway.app](https://ai-influencer-production-cb07.up.railway.app)
* 📄 **Interactive API Blueprint (Swagger UI):** [ai-influencer-production-cb07.up.railway.app/docs](https://ai-influencer-production-cb07.up.railway.app/docs#/)
---

## 🌍 Content Verticals & Global Reach

Amaka AI actively scans and contextualizes high-velocity global trends across three core pillars, weaving them into civic messaging with international resonance:
- **Political Accountability & Youth Inclusion:** Translating complex legislative frameworks (like the 2026 Digital Economy Bill) into digestible advocacy for tech startups and citizens.
- **Entertainment & Pop Culture Kinetics:** Monitoring music releases, cinematic trends, and cultural shifts to blend pop culture elements with civic empowerment.
- **The Football World Cup & Global Sports:** Capitalizing on the unifying footprint of major sports to build community-driven conversations around national pride, team leadership, and youth potential.

---

## 🚀 Architecture & Tech Stack

- **Frontend (Command Center):** Next.js 16 (TypeScript), Tailwind CSS v4, Shadcn/UI, and Sonner notifications. Hosted on **Vercel**.
- **Backend (Orchestration Engine):** FastAPI (Python), Uvicorn ASGI server, and SQLite/AIOSQLite (`ai_influencer.db`). Hosted on **Railway** with automatic SSL/HTTPS.
- **Agentic Infrastructure:** **CrewAI** (Multi-agent orchestration), **Model Context Protocol (MCP)** for secure tool abstraction, and **Pydantic / Pydantic-Settings** for strict schema validation.
- **Intelligence & Assets:** OpenRouter / Perplexity Sonar (Real-time web search), OpenAI GPT-4o, and **Pillow (PIL)** for programmatic social card generation.
- **Package Management:** `uv` (Python) and `npm` (Node.js).

---

## 🛠 Project Structure

```text
ai-influencer/
├── backend/                # FastAPI Application (Root Dir on Railway: /backend)
│   ├── app/
│   │   ├── agents/         # CrewAI Agent definitions (Fact-Check Crew, Content Director)
│   │   ├── core/
│   │   │   └── config.py   # Pydantic Settings & environment shielding (extra="ignore")
│   │   ├── db/             # Async SQLite models & migrations (ai_influencer.db)
│   │   └── main.py         # Versioned REST API entry point (/api/v1) with CORS configurations
│   ├── pyproject.toml      # Dependency management via uv
│   └── requirements.txt    # Generated build file for cloud environment
└── frontend/               # Next.js Dashboard (Root Dir on Vercel: /frontend)
    ├── app/                # App Router with dynamic polling interfaces
    ├── components/ui/      # Shadcn atomic components
    ├── lib/api.ts          # Typed backend communication via NEXT_PUBLIC_API_URL
    └── tailwind.config.ts  # Tailwind CSS v4 configuration

```

---

## ⚙️ Setup & Installation

### 1. Backend (Python 3.12+)

Navigate to the backend folder and use `uv` for setup.

```bash
cd backend
# Install dependencies and create .venv
uv sync

# Set up environment variables (.env)
echo "OPENROUTER_API_KEY=your_key" >> .env
echo "PERPLEXITY_API_KEY=your_key" >> .env
echo "SERPER_API_KEY=your_key" >> .env
echo "DATABASE_URL=sqlite+aiosqlite:///./ai_influencer.db" >> .env

# Start the server locally
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

```

*For cloud deployment on Railway, ensure `PORT=8000` is defined in service variables and the Start Command uses: `python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT}`.*

### 2. Frontend (Node.js 20+)

Navigate to the frontend folder and configure environment connections.

```bash
cd frontend
npm install

# Configure Vercel/Local Environment Variables targeting production gateway
echo "NEXT_PUBLIC_API_URL=[https://ai-influencer-production-cb07.up.railway.app/api/v1](https://ai-influencer-production-cb07.up.railway.app/api/v1)" >> .env.local

# Start the development server
npm run dev

```

---

## 🚦 Key Asynchronous Workflows (With Attachments)

### Content Lifecycle & State Management

1. **Trigger (`/api/v1/generate`)**: The operator submits a trend topic (e.g., *"World Cup match fixture"* or *"Political Accountability bill"*). FastAPI registers the task and instantly returns a unique `job_id`, allowing the UI to remain responsive.
2. **Scouting & Verification (CrewAI & MCP)**: The *Trend & Context Agent* utilizes MCP search engines (Serper/DuckDuckGo) to crawl real-time data streams. The *Fact-Check Crew* uses Pydantic validation to scrub out misinformation.
3. **Draft Compilation & Image Generation (Pillow)**: The *Content Director* synthesizes the text copy. Simultaneously, **Pillow (PIL)** programmatically generates corresponding multimedia graphic attachments (e.g., social media quote/data cards) using layout templates.
4. **State Polling (`/api/v1/drafts/{job_id}`)**: The Next.js dashboard continuously polls the database status. Once complete, it displays the structured text draft along with its **generated image attachments** directly in the UI queue.
5. **Human-In-The-Loop Approval (`/api/v1/drafts/{job_id}/publish`)**: The post remains held safely in draft state. The operator reviews the text copy, inspects the attached graphic cards, edits if necessary, and triggers final publication to global media distribution channels.

---

## 🛡 Production & Deployment Features

* **Platform Environment Shielding:** Built using `SettingsConfigDict(extra="ignore")`, protecting the application from crashing due to internal runtime variables injected by cloud infrastructure platforms like Railway.
* **Asynchronous Data Layer:** Leverages `aiosqlite` for fully non-blocking database queries, ensuring agent memory writes and job status changes don't clog up incoming frontend requests.
* **Automatic Blueprint Documentation:** Out-of-the-box API routing blueprints accessible at your deployed endpoint via `/docs` or `/redoc` for immediate contract checking between Vercel and Railway layers.
* **Secure Cross-Origin Resource Sharing (CORS):** Fully mapped CORS configurations ensuring secure, authenticated browser handshake protocols between Next.js server-side layers and the remote FastAPI instance.

---

**Developer**: Philip Onuchukwu

**Stack**: Backend Engineer | AI Agent Specialist

```
🤖

```