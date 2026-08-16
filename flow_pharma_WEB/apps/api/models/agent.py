"""
AI Multi-Agent Execution & Tool Observability Models
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from apps.api.database import Base


class AgentRun(Base):
    """
    Structured trace of an agent workflow run.
    """
    __tablename__ = "agent_runs"

    id = Column(Integer, primary_key=True, index=True)
    trace_id = Column(String(100), index=True, nullable=False)
    agent_name = Column(String(100), index=True, nullable=False)  # ConversationAgent, SafetyPolicyAgent, RefillAgent, ActionAgent, Orchestrator
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    session_id = Column(String(100), nullable=True)
    input_payload_json = Column(JSON, nullable=True)
    output_payload_json = Column(JSON, nullable=True)
    status = Column(String(50), default="COMPLETED", nullable=False)  # RUNNING, COMPLETED, FAILED, REVIEW_REQUIRED
    duration_ms = Column(Integer, default=0, nullable=False)
    model_name = Column(String(100), default="local-model", nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    tool_calls = relationship("AgentToolCall", back_populates="agent_run", cascade="all, delete-orphan")
    user = relationship("User")


class AgentToolCall(Base):
    """
    Explicit tool invocations made by agents.
    """
    __tablename__ = "agent_tool_calls"

    id = Column(Integer, primary_key=True, index=True)
    agent_run_id = Column(Integer, ForeignKey("agent_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    trace_id = Column(String(100), index=True, nullable=False)
    tool_name = Column(String(100), nullable=False)
    input_json = Column(JSON, nullable=True)
    output_json = Column(JSON, nullable=True)
    duration_ms = Column(Integer, default=0, nullable=False)
    is_error = Column(Boolean, default=False, nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    agent_run = relationship("AgentRun", back_populates="tool_calls")
