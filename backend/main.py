from __future__ import annotations

from typing import Optional

from fastapi import Body, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ai_engine import generate_suggestions
from organizer import build_stats_only, organize_folder, scan_folder, undo_last_organization


class FolderRequest(BaseModel):
    """Request payload for endpoints that need a folder path."""

    path: str = Field(..., min_length=1, description="Absolute folder path to scan or organize")


class UndoRequest(BaseModel):
    """Optional target root for undo operations."""

    path: Optional[str] = Field(default=None, description="Absolute folder path to match a specific session")


app = FastAPI(
    title="Smart File Organizer + AI Suggestions",
    version="1.0.0",
    description="A production-style hackathon demo for scanning, organizing, and cleaning up messy folders.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, object]:
    """Health-check style entrypoint for the API."""

    return {
        "name": "Smart File Organizer + AI Suggestions",
        "status": "ok",
        "endpoints": ["/scan-folder", "/organize", "/undo", "/stats", "/ai-suggestions"],
    }


@app.post("/scan-folder")
def scan_folder_route(payload: FolderRequest = Body(...)) -> dict[str, object]:
    """Scan a selected folder and return the full analytics payload."""

    try:
        report = scan_folder(payload.path)
        report["suggestions"] = generate_suggestions(report)
        return report
    except (FileNotFoundError, NotADirectoryError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive guard for demo stability.
        raise HTTPException(status_code=500, detail=f"Scan failed: {exc}") from exc


@app.post("/organize")
def organize_route(payload: FolderRequest = Body(...)) -> dict[str, object]:
    """Move files into category-based folders and store the history session."""

    try:
        return organize_folder(payload.path)
    except (FileNotFoundError, NotADirectoryError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Organization failed: {exc}") from exc


@app.post("/undo")
def undo_route(payload: UndoRequest = Body(default_factory=UndoRequest)) -> dict[str, object]:
    """Restore the most recent organization session."""

    try:
        return undo_last_organization(payload.path)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Undo failed: {exc}") from exc


@app.get("/stats")
def stats_route(path: str = Query(..., min_length=1)) -> dict[str, object]:
    """Return only the metrics portion for lightweight dashboard refreshes."""

    try:
        return build_stats_only(path)
    except (FileNotFoundError, NotADirectoryError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Stats failed: {exc}") from exc


@app.get("/ai-suggestions")
def ai_suggestions_route(path: str = Query(..., min_length=1)) -> dict[str, object]:
    """Run a scan and return AI cleanup suggestions in one request."""

    try:
        report = scan_folder(path)
        return generate_suggestions(report)
    except (FileNotFoundError, NotADirectoryError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"AI suggestions failed: {exc}") from exc

