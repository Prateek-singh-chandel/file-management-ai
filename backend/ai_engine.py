"""AI suggestion engine with optional OpenAI and local fallback heuristics."""
from __future__ import annotations

import os
from typing import Dict, List


def generate_ai_suggestions(files: List[Dict], heuristic_suggestions: List[Dict]) -> List[Dict]:
    """Return OpenAI-enhanced suggestions when key exists; otherwise return heuristics."""
    api_key = os.getenv("OPENAI_API_KEY")

    # In this hackathon starter we keep OpenAI optional and safe by default.
    # If key is available, we can build a richer prompt payload for external call.
    if api_key:
        summary = {
            "total_files": len(files),
            "top_extensions": sorted({f["extension"] for f in files})[:10],
            "heuristics": heuristic_suggestions,
        }
        return [
            {
                "type": "ai",
                "title": "OpenAI-enhanced mode active",
                "detail": "API key detected. Wire this payload to GPT for richer personalized cleanup strategies.",
                "payload_preview": summary,
            },
            *heuristic_suggestions,
        ]

    return heuristic_suggestions
