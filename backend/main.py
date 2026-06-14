from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import json
import random
from datetime import datetime, timedelta

app = FastAPI(
    title="SynapseAI - Multi-Agent Workplace Intelligence",
    description="AI-powered team productivity platform using multi-agent orchestration",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ───────────────────────────────────────────────────────────────────

class MeetingRequest(BaseModel):
    transcript: str
    meeting_title: Optional[str] = "Team Meeting"
    participants: Optional[List[str]] = []

class FocusRequest(BaseModel):
    user_name: str
    role: Optional[str] = "Team Member"
    pending_tasks: Optional[List[str]] = []

class ContextRequest(BaseModel):
    query: str
    context_type: Optional[str] = "all"

class ChatRequest(BaseModel):
    message: str
    agent: Optional[str] = "orchestrator"
    history: Optional[List[dict]] = []

# ─── Root ─────────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "status": "SynapseAI Backend Running",
        "version": "1.0.0",
        "agents": ["Scribe", "Memory", "Focus", "Connector", "Pulse"],
        "powered_by": "Azure OpenAI GPT-4o + Semantic Kernel"
    }

# ─── Scribe Agent - Meeting Intelligence ──────────────────────────────────────

@app.post("/api/meeting/analyze")
async def analyze_meeting(req: MeetingRequest):
    """
    Scribe Agent: Analyzes meeting transcripts and produces structured intelligence.
    In production: Uses Azure OpenAI GPT-4o via Semantic Kernel.
    """
    transcript_len = len(req.transcript.split())
    
    # Simulate agent processing
    return {
        "agent": "Scribe",
        "meeting_title": req.meeting_title,
        "analyzed_at": datetime.utcnow().isoformat() + "Z",
        "word_count": transcript_len,
        "summary": {
            "executive_summary": f"The team discussed key product roadmap decisions, sprint planning for Q3, and resolved the pending infrastructure bottleneck. Consensus was reached on the new authentication architecture. {req.meeting_title} concluded with clear ownership for all outstanding items.",
            "key_decisions": [
                {"decision": "Adopt Azure AD B2C for authentication layer", "made_by": "Engineering Lead", "impact": "High"},
                {"decision": "Delay v2.1 release by 2 weeks for QA coverage", "made_by": "Product Manager", "impact": "Medium"},
                {"decision": "Migrate CI/CD pipeline to GitHub Actions", "made_by": "DevOps Lead", "impact": "High"}
            ],
            "action_items": [
                {"task": "Set up Azure AD B2C tenant and configure OAuth flows", "assignee": "Alex Chen", "due_date": "2024-01-19", "priority": "Critical"},
                {"task": "Update QA test matrix for mobile regression", "assignee": "Priya Sharma", "due_date": "2024-01-18", "priority": "High"},
                {"task": "Draft GitHub Actions workflow for main branch", "assignee": "Jordan Lee", "due_date": "2024-01-22", "priority": "High"},
                {"task": "Communicate release timeline change to stakeholders", "assignee": "Sarah Kim", "due_date": "2024-01-16", "priority": "Medium"},
                {"task": "Review vendor contracts for new infrastructure", "assignee": "Marcus Johnson", "due_date": "2024-01-25", "priority": "Low"}
            ],
            "blockers": [
                {"blocker": "Azure subscription limits need to be raised before B2C setup", "owner": "Alex Chen", "severity": "High"},
                {"blocker": "QA environment is unstable — needs DevOps attention", "owner": "Jordan Lee", "severity": "Medium"}
            ],
            "topics_discussed": ["Authentication Architecture", "Q3 Sprint Planning", "CI/CD Migration", "Release Timeline", "Infrastructure Costs"],
            "sentiment": "Positive",
            "meeting_health_score": 82,
            "follow_up_required": True
        },
        "knowledge_graph_updated": True,
        "tasks_created": 5,
        "azure_services_used": ["Azure OpenAI GPT-4o", "Azure AI Foundry", "Semantic Kernel"]
    }

# ─── Focus Agent - Daily Briefing ──────────────────────────────────────────────

@app.post("/api/focus/briefing")
async def get_focus_briefing(req: FocusRequest):
    """
    Focus Agent: Generates a personalized daily AI briefing.
    In production: Pulls from Microsoft Graph API + Azure AI.
    """
    return {
        "agent": "Focus",
        "user": req.user_name,
        "role": req.role,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "briefing": {
            "good_morning_message": f"Good morning, {req.user_name}! Here's your AI-curated intelligence briefing. You have a focused day ahead — 3 critical items need your attention before noon.",
            "focus_score": 78,
            "top_priorities": [
                {
                    "rank": 1,
                    "task": "Review and approve the Azure AD B2C architecture proposal",
                    "reason": "Blocking 3 team members. Decision needed by 10am.",
                    "estimated_time": "25 mins",
                    "urgency": "Critical"
                },
                {
                    "rank": 2,
                    "task": "Respond to Sarah's message about the Q3 budget allocation",
                    "reason": "48-hour SLA breach in 2 hours. Cross-team dependency.",
                    "estimated_time": "10 mins",
                    "urgency": "High"
                },
                {
                    "rank": 3,
                    "task": "Finalize the sprint retrospective doc for stakeholder review",
                    "reason": "Stakeholder meeting at 2pm requires this as pre-read.",
                    "estimated_time": "40 mins",
                    "urgency": "High"
                }
            ],
            "team_updates": [
                {"update": "Alex Chen completed the OAuth flow setup — 1 day ahead of schedule!", "type": "positive"},
                {"update": "QA environment is still unstable. Jordan Lee is investigating.", "type": "blocker"},
                {"update": "New Jira ticket #847 assigned to your team by Product.", "type": "info"}
            ],
            "meetings_today": [
                {"title": "Sprint Planning Q3", "time": "10:00 AM", "duration": "60 min", "prep_needed": True},
                {"title": "1:1 with Engineering Lead", "time": "2:00 PM", "duration": "30 min", "prep_needed": False}
            ],
            "insights": [
                "⚡ You're 23% more productive on Tuesdays — schedule deep work now.",
                "🔗 3 decisions from last week are still pending follow-up.",
                "📈 Your team's velocity increased 15% this sprint."
            ],
            "focus_time_available": "2.5 hours",
            "overdue_tasks": 2
        },
        "data_sources": ["Microsoft Teams", "Outlook Calendar", "Azure DevOps", "Microsoft Graph API"]
    }

# ─── Connector Agent - Context Search ─────────────────────────────────────────

@app.post("/api/context/search")
async def search_context(req: ContextRequest):
    """
    Connector Agent: Surfaces relevant knowledge from team memory.
    In production: Uses Azure AI Search (RAG) + Cosmos DB knowledge graph.
    """
    return {
        "agent": "Connector",
        "query": req.query,
        "searched_at": datetime.utcnow().isoformat() + "Z",
        "results": [
            {
                "type": "Decision",
                "title": "Authentication Architecture Decision (Jan 15)",
                "snippet": "Team agreed to use Azure AD B2C after evaluating Auth0 and Cognito. Key factor: native Microsoft 365 integration and enterprise SSO support.",
                "relevance_score": 0.97,
                "source": "Team Meeting - Sprint 23",
                "date": "2024-01-15",
                "people_involved": ["Alex Chen", "Sarah Kim", "Engineering Lead"]
            },
            {
                "type": "Document",
                "title": "Azure B2C Implementation Guide (Internal)",
                "snippet": "Step-by-step setup for our tenant configuration. Includes OAuth 2.0 flows, user attributes, and custom policies for our enterprise requirements.",
                "relevance_score": 0.91,
                "source": "Confluence",
                "date": "2024-01-16",
                "people_involved": ["Alex Chen"]
            },
            {
                "type": "Conversation",
                "title": "Teams Chat: Security concerns with B2C",
                "snippet": "Priya raised concerns about token expiry for mobile clients. Alex confirmed 24-hour refresh tokens with silent renewal. Issue resolved.",
                "relevance_score": 0.85,
                "source": "Microsoft Teams",
                "date": "2024-01-17",
                "people_involved": ["Priya Sharma", "Alex Chen"]
            },
            {
                "type": "Expert",
                "title": "Subject Matter Expert: Alex Chen",
                "snippet": "Alex has worked on 3 Azure AD implementations. Referenced in 12 related conversations. Recommended contact for auth questions.",
                "relevance_score": 0.82,
                "source": "Knowledge Graph",
                "date": "2024-01-10",
                "people_involved": ["Alex Chen"]
            }
        ],
        "knowledge_graph": {
            "nodes": 47,
            "connections": 183,
            "topic_clusters": ["Authentication", "Azure Services", "Security", "Sprint 23"]
        },
        "azure_services_used": ["Azure AI Search", "Azure Cosmos DB", "Azure OpenAI Embeddings"]
    }

# ─── Pulse Agent - Team Health ─────────────────────────────────────────────────

@app.get("/api/pulse/team")
async def get_team_pulse():
    """
    Pulse Agent: Real-time team health and alignment monitoring.
    In production: Continuous monitoring via Azure Functions + Event Hub.
    """
    return {
        "agent": "Pulse",
        "team": "Engineering Pod Alpha",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "health_score": 74,
        "trend": "+8 from last week",
        "metrics": {
            "velocity": {"value": 87, "label": "Velocity", "trend": "up", "change": "+15%"},
            "alignment": {"value": 72, "label": "Alignment", "trend": "stable", "change": "+2%"},
            "communication": {"value": 91, "label": "Communication", "trend": "up", "change": "+5%"},
            "blocker_rate": {"value": 58, "label": "Blocker Resolution", "trend": "down", "change": "-12%"}
        },
        "active_blockers": [
            {
                "id": "B-001",
                "title": "QA environment instability blocking 4 engineers",
                "severity": "High",
                "duration": "18 hours",
                "owner": "Jordan Lee",
                "escalation_needed": True
            },
            {
                "id": "B-002",
                "title": "Azure subscription quota request pending approval",
                "severity": "Medium",
                "duration": "6 hours",
                "owner": "Alex Chen",
                "escalation_needed": False
            }
        ],
        "knowledge_gaps": [
            {"topic": "GitHub Actions migration", "severity": "Medium", "affected_members": 3},
            {"topic": "Azure B2C custom policies", "severity": "High", "affected_members": 5}
        ],
        "collaboration_graph": [
            {"member": "Alex Chen", "interactions": 34, "role": "Hub"},
            {"member": "Sarah Kim", "interactions": 28, "role": "Connector"},
            {"member": "Priya Sharma", "interactions": 19, "role": "Contributor"},
            {"member": "Jordan Lee", "interactions": 15, "role": "Isolated"}
        ],
        "ai_recommendations": [
            {"action": "Schedule knowledge transfer session on Azure B2C custom policies", "impact": "High", "effort": "Low"},
            {"action": "Escalate QA environment issue to infrastructure team immediately", "impact": "Critical", "effort": "Low"},
            {"action": "Pair Jordan Lee with Sarah Kim on next feature — low interaction detected", "impact": "Medium", "effort": "Low"}
        ],
        "sprint_progress": {
            "total_points": 64,
            "completed_points": 41,
            "remaining_days": 5,
            "predicted_completion": "On Track"
        }
    }

# ─── Chat Agent - Orchestrator ─────────────────────────────────────────────────

@app.post("/api/chat")
async def chat_with_agent(req: ChatRequest):
    """
    Orchestrator: Routes user queries to the appropriate specialized agent.
    In production: Uses Semantic Kernel's AgentGroupChat for multi-agent reasoning.
    """
    message_lower = req.message.lower()
    
    # Simple intent routing (in production: semantic routing via SK)
    if any(word in message_lower for word in ["meeting", "summary", "transcript", "action item"]):
        agent_used = "Scribe"
        response = "I've analyzed your meeting context. The key decisions were around **Azure AD B2C adoption** and the **2-week release delay**. I've created 5 action items and assigned them to the relevant team members. Would you like me to send notifications to the assignees?"
    elif any(word in message_lower for word in ["priority", "focus", "today", "what should", "briefing"]):
        agent_used = "Focus"
        response = "Based on your calendar, pending tasks, and team dependencies, your **#1 priority right now** is reviewing the Azure AD B2C proposal — it's blocking Alex Chen and 2 others. After that, Sarah Kim needs your response on budget allocation within the next 2 hours. Want me to draft that response?"
    elif any(word in message_lower for word in ["find", "search", "who", "previous", "context", "know", "history"]):
        agent_used = "Connector"
        response = "I searched the team knowledge graph and found **4 highly relevant items**. The authentication decision from Jan 15 is most relevant — Alex Chen is your expert here with 3 prior implementations. I also found an unresolved concern Priya raised about mobile token expiry. Should I loop her in?"
    elif any(word in message_lower for word in ["team", "pulse", "health", "blocker", "stuck", "velocity"]):
        agent_used = "Pulse"
        response = "Team health is at **74/100** — up 8 points from last week! 🟡 Main concern: Jordan Lee is showing isolation patterns with only 15 interactions this sprint. The QA environment blocker has been active for 18 hours and is now critical. I recommend escalating immediately. Want me to draft an escalation message?"
    else:
        agent_used = "Orchestrator"
        response = f"I've routed your query across all 5 SynapseAI agents. Here's what I found: Your team is currently dealing with 2 active blockers, your top personal priority is the B2C architecture review, and there are 47 knowledge nodes relevant to your current sprint. How can I help you dig deeper? Try asking me about your **priorities**, **meeting summaries**, **team health**, or to **find context** on any topic."
    
    return {
        "agent": agent_used,
        "message": req.message,
        "response": response,
        "responded_at": datetime.utcnow().isoformat() + "Z",
        "confidence": 0.94,
        "sources_consulted": ["Microsoft Teams", "Azure DevOps", "Knowledge Graph", "Calendar"],
        "follow_up_actions": []
    }
