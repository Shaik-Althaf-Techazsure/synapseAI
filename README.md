# SynapseAI — Multi-Agent Workplace Intelligence Platform

<div align="center">
  <h3>🧠 The Nervous System for Modern Teams</h3>
  <p>Built for Microsoft AI Hackathon 2025 | Azure OpenAI · Semantic Kernel · Azure AI Foundry</p>
</div>

---

## 🎯 Overview

SynapseAI is a **multi-agent AI platform** that acts as the nervous system of a team. It deploys 5 specialized AI agents powered by **Azure OpenAI GPT-4o** and orchestrated by **Semantic Kernel** to eliminate context fragmentation, automate drudgery, and help teams operate with crystal-clear alignment.

> **Problem**: Modern teams waste ~2.5 hours/day searching for context. Decisions get buried. Tasks fall through the cracks. New members never catch up.

> **Solution**: 5 AI agents that listen, learn, and act — turning meeting chaos into structured intelligence, and scattered knowledge into instantly accessible wisdom.

---

## 🤖 The 5-Agent Architecture

| Agent | Role | Technology |
|---|---|---|
| 🎙️ **Scribe Agent** | Meeting transcript → structured summaries, action items, decisions, blockers | Azure OpenAI GPT-4o + Semantic Kernel |
| 🎯 **Focus Agent** | Personalized daily AI briefing with ranked priorities | Microsoft Graph API + GPT-4o |
| 🔗 **Connector Agent** | Semantic knowledge search across team memory | Azure AI Search (RAG) + Cosmos DB |
| 📣 **Pulse Agent** | Real-time team health: velocity, blockers, collaboration gaps | Azure AI Foundry + Event Hub |
| 🧠 **Memory Agent** | Persistent knowledge graph from all team interactions | Azure Cosmos DB + Vector Embeddings |

**Orchestrator**: Semantic Kernel `AgentGroupChat` routes queries to the right agent automatically.

---

## 🛠️ Tech Stack

```
Frontend:   React + TypeScript + Vite + Framer Motion + Recharts
Backend:    Python + FastAPI + Uvicorn
AI:         Azure OpenAI GPT-4o · Semantic Kernel · Azure AI Foundry
Data:       Azure Cosmos DB · Azure AI Search
Integration: Microsoft Graph API (Teams, Outlook, Calendar)
Deployment: Azure App Service · Azure Container Apps
```

---

## 🚀 Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

---

## 📁 Project Structure

```
Microsoft_AI/
├── frontend/               # React + TypeScript dashboard
│   └── src/
│       ├── pages/
│       │   ├── LandingPage.tsx    # Hero + agent overview
│       │   ├── MeetingPage.tsx    # Scribe Agent UI
│       │   ├── FocusPage.tsx      # Focus Agent UI
│       │   ├── ContextPage.tsx    # Connector Agent UI
│       │   ├── PulsePage.tsx      # Pulse Agent dashboard
│       │   └── ChatPage.tsx       # AI Orchestrator chat
│       └── components/
│           └── Sidebar.tsx
├── backend/                # FastAPI multi-agent API
│   ├── main.py             # All 5 agent endpoints
│   └── requirements.txt
└── README.md
```

---

## 🌐 API Endpoints

| Method | Endpoint | Agent |
|---|---|---|
| `POST` | `/api/meeting/analyze` | Scribe — analyze transcript |
| `POST` | `/api/focus/briefing` | Focus — daily briefing |
| `POST` | `/api/context/search` | Connector — knowledge search |
| `GET` | `/api/pulse/team` | Pulse — team health |
| `POST` | `/api/chat` | Orchestrator — route to any agent |

---

## 💡 Key Features

- **🎙️ Meeting Intelligence**: Paste a transcript → get structured summary, decisions, action items, and blockers in seconds
- **🎯 Focus Briefing**: "What should I work on right now?" — answered with full context every morning
- **🔍 Knowledge Search**: Semantic search across all team history with relevance scoring and expert identification
- **📊 Team Pulse**: Real-time dashboard with radar chart, collaboration heatmap, blocker tracking, and AI recommendations
- **💬 AI Chat**: Multi-agent orchestration — ask anything, get routed to the right specialized agent

---

## 🏆 Why This Wins

1. **Multi-agent architecture** — Not a chatbot. A coordinated team of AI agents (what Microsoft judges scored highest in 2025)
2. **Real Microsoft stack** — Azure OpenAI, Semantic Kernel, Azure AI Foundry, Microsoft Graph
3. **Tangible impact** — Solves a universal problem: 2.5hrs/day of context-switching waste
4. **Beautiful UX** — Demo-ready, production-quality design that wows on first impression
5. **Complete system** — Not a one-trick demo; covers the full workflow from meeting to execution

---

*Built with ❤️ for Microsoft AI Hackathon 2025*
=======
# synapseAI

