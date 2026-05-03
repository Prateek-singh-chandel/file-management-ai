from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any

def _compact_stats(scan_report: dict[str, Any]) -> dict[str, Any]:
    """Reduce the scan payload to the signals an AI assistant needs."""

    stats = scan_report.get("stats", {})
    largest = stats.get("largestFiles", [])[:5]
    duplicate_groups = stats.get("duplicateGroups", [])[:5]
    return {
        "folderPath": scan_report.get("folderPath"),
        "totalFiles": stats.get("totalFiles", 0),
        "totalSizeHuman": stats.get("totalSizeHuman", "0 B"),
        "storageCleanedHuman": stats.get("storageCleanedHuman", "0 B"),
        "duplicateCount": stats.get("duplicateCount", 0),
        "largeFileCount": stats.get("largeFileCount", 0),
        "oldFileCount": stats.get("oldFileCount", 0),
        "screenshotCount": stats.get("screenshotCount", 0),
        "categoryDistribution": stats.get("categoryDistribution", []),
        "largestFiles": [
            {
                "name": item["name"],
                "sizeHuman": item["sizeHuman"],
                "category": item["category"],
                "path": item["relativePath"],
            }
            for item in largest
        ],
        "duplicateGroups": [
            {
                "count": group["count"],
                "reclaimableBytes": group["reclaimableBytes"],
                "sample": [item["relativePath"] for item in group["files"][:3]],
            }
            for group in duplicate_groups
        ],
    }


def _default_cards(scan_report: dict[str, Any]) -> list[dict[str, Any]]:
    """Create local heuristics when OpenAI is not available."""

    stats = scan_report.get("stats", {})
    cards: list[dict[str, Any]] = []

    duplicate_count = stats.get("duplicateCount", 0)
    if duplicate_count:
        cards.append(
            {
                "title": "Duplicate clusters detected",
                "value": f"{duplicate_count} duplicates",
                "description": f"Estimated reclaimable space: {stats.get('storageCleanedHuman', '0 B')}. Review repeated copies before organizing.",
                "tone": "amber",
                "action": "Review duplicates",
            }
        )

    large_files = stats.get("largeFiles", [])[:4]
    if large_files:
        cards.append(
            {
                "title": "Large file pressure",
                "value": f"{len(large_files)} large files",
                "description": "Files larger than 500 MB may belong in an archive or external storage tier.",
                "tone": "rose",
                "action": "Move to archive",
            }
        )

    screenshot_count = stats.get("screenshotCount", 0)
    if screenshot_count >= 3:
        cards.append(
            {
                "title": "Screenshot clutter",
                "value": f"{screenshot_count} screenshots",
                "description": "A screenshot folder or batch cleanup rule would remove a lot of noise here.",
                "tone": "sky",
                "action": "Create screenshot folder",
            }
        )

    old_count = stats.get("oldFileCount", 0)
    if old_count:
        cards.append(
            {
                "title": "Old unused files",
                "value": f"{old_count} stale files",
                "description": "Files untouched for a year or longer are strong candidates for archiving.",
                "tone": "emerald",
                "action": "Archive older files",
            }
        )

    category_distribution = stats.get("categoryDistribution", [])
    if category_distribution:
        top_category = category_distribution[0]
        cards.append(
            {
                "title": "Organizing opportunity",
                "value": f"{top_category['category']} lead",
                "description": f"{top_category['count']} files already belong to {top_category['category']}, so the folder structure will feel instantly cleaner.",
                "tone": "violet",
                "action": "Sort by category",
            }
        )

    if not cards:
        cards.append(
            {
                "title": "Folder is already tidy",
                "value": "Low clutter",
                "description": "No strong cleanup signals were found, so a category sort is the best safe first step.",
                "tone": "emerald",
                "action": "Run organization",
            }
        )

    summary = (
        f"Scanned {stats.get('totalFiles', 0)} files and found "
        f"{stats.get('duplicateCount', 0)} duplicate files, "
        f"{stats.get('largeFileCount', 0)} large files, and "
        f"{stats.get('oldFileCount', 0)} stale files."
    )

    recommendations = [
        "Move repeated copies into a deduplicated review queue before deleting anything.",
        "Route large media files into an archive folder so the working directory stays fast to browse.",
        "Keep screenshots separate from documents and project files to reduce clutter.",
    ]

    if old_count:
        recommendations.append("Archive anything older than one year unless it is part of an active project.")

    return {
        "mode": "local",
        "summary": summary,
        "cards": cards,
        "recommendations": recommendations,
        "signals": _compact_stats(scan_report),
    }


def _extract_openai_text(response_data: dict[str, Any]) -> str:
    """Read the assistant message content from a chat-completions response."""

    choices = response_data.get("choices", [])
    if not choices:
        return ""
    message = choices[0].get("message", {})
    return message.get("content", "") or ""


def _call_openai(scan_report: dict[str, Any]) -> dict[str, Any] | None:
    """Optional OpenAI integration using the REST API and JSON output."""

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    payload = {
        "model": model,
        "temperature": 0.2,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an expert digital-file cleanup assistant. "
                    "Return JSON only with keys: summary, cards, recommendations. "
                    "Each card must have title, value, description, tone, action."
                ),
            },
            {
                "role": "user",
                "content": json.dumps(_compact_stats(scan_report), indent=2),
            },
        ],
    }

    request = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            response_data = json.loads(response.read().decode("utf-8"))
        text = _extract_openai_text(response_data)
        text = text.strip().removeprefix("```json").removesuffix("```").strip()
        parsed = json.loads(text)
        parsed.setdefault("mode", "openai")
        parsed.setdefault("signals", _compact_stats(scan_report))
        return parsed
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError, KeyError):
        return None


def generate_suggestions(scan_report: dict[str, Any]) -> dict[str, Any]:
    """Produce either OpenAI-backed or heuristic cleanup guidance."""

    if not scan_report:
        return {
            "mode": "local",
            "summary": "No scan data available yet.",
            "cards": [],
            "recommendations": [],
            "signals": {},
        }

    openai_result = _call_openai(scan_report)
    if openai_result:
        return openai_result
    return _default_cards(scan_report)
