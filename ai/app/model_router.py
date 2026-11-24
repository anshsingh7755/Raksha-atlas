"""Model routing through LiteLLM with explicit allow-list and safe failure behavior."""
import os
from fastapi import HTTPException


def allowed_models() -> list[str]:
    return [value.strip() for value in os.getenv("AI_ALLOWED_MODELS", "").split(",") if value.strip()]


async def complete(messages: list[dict], model: str | None = None) -> dict:
    configured = allowed_models()
    selected = model or os.getenv("AI_DEFAULT_MODEL", "")
    if not selected or selected not in configured:
        raise HTTPException(status_code=400, detail="Requested model is not in AI_ALLOWED_MODELS.")
    try:
        from litellm import acompletion
        response = await acompletion(model=selected, messages=messages, timeout=45, max_tokens=1800)
        choice = response.choices[0]
        return {"model": response.model or selected, "content": choice.message.content or "",
                "finish_reason": choice.finish_reason}
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="LiteLLM is not installed in this runtime.") from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Configured model provider request failed.") from exc
