"""Chat routes with Claude AI integration."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.models.chat import ChatMessage
from backend.models.user import User
from backend.auth.decorators import get_current_active_user
from backend.config import settings

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None


def _get_ai_response(message: str, context: Optional[str] = None) -> str:
    """Get response from Claude AI or fall back to a rule-based response."""
    if settings.ANTHROPIC_API_KEY:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            system_prompt = (
                "You are FuelSync AI Assistant, an expert on CNG (Compressed Natural Gas) fuel stations in India. "
                "Help users find the nearest and least crowded CNG pumps, understand CNG pricing, "
                "and provide tips on CNG vehicles. Be concise and helpful."
            )
            if context:
                system_prompt += f"\n\nContext: {context}"
            response = client.messages.create(
                model="claude-opus-4-5",
                max_tokens=1024,
                system=system_prompt,
                messages=[{"role": "user", "content": message}],
            )
            return response.content[0].text
        except Exception:
            pass
    # Rule-based fallback
    msg_lower = message.lower()
    if any(w in msg_lower for w in ["crowd", "busy", "queue", "wait"]):
        return "Current crowd levels vary by pump. Check the map for live crowd indicators — green means low crowd, orange medium, and red high. Try visiting before 8 AM or after 9 PM for shorter queues."
    if any(w in msg_lower for w in ["price", "cost", "rate", "₹"]):
        return "CNG prices in India range from ₹74/kg (Delhi) to ₹84/kg (Pune) approximately. Prices are updated daily. Check the Prices section for real-time city-wise rates."
    if any(w in msg_lower for w in ["near", "close", "nearby", "find"]):
        return "Use the map view or click 'Find Nearby Pumps' to locate CNG stations near you. You can filter by crowd level, rating, and facilities."
    if any(w in msg_lower for w in ["saving", "benefit", "advantage", "cng vs"]):
        return "CNG is 30-40% cheaper than petrol and 20-30% cheaper than diesel. It's also cleaner, producing fewer emissions. For a car running 1500 km/month, you can save ₹3,000-5,000 monthly by switching to CNG."
    return "I'm here to help with CNG pump queries! Ask me about nearby pumps, current crowd levels, prices, or CNG vehicle tips."


@router.post("/message")
def send_message(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    ai_response = _get_ai_response(payload.message, payload.context)
    chat_msg = ChatMessage(
        user_id=current_user.id,
        content=payload.message,
        response=ai_response,
    )
    db.add(chat_msg)
    db.commit()
    db.refresh(chat_msg)
    return {
        "id": str(chat_msg.id),
        "message": payload.message,
        "response": ai_response,
        "timestamp": chat_msg.timestamp.isoformat(),
    }


@router.get("/history")
def chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.timestamp.desc())
        .limit(50)
        .all()
    )
    return {
        "history": [
            {
                "id": str(m.id),
                "message": m.content,
                "response": m.response,
                "timestamp": m.timestamp.isoformat(),
            }
            for m in messages
        ]
    }


@router.delete("/history", status_code=204)
def clear_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).delete()
    db.commit()
