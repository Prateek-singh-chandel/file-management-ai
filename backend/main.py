"""FastAPI app for Smart File Organizer + AI Suggestions."""
from __future__ import annotations

from pathlib import Path
from typing import Dict, Optional
import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from organizer import FolderOrganizer
from ai_engine import generate_ai_suggestions

app = FastAPI(title="Smart File Organizer API", version="1.0.0")
organizer = FolderOrganizer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

history_file = Path(__file__).resolve().parent / "history.json"
last_scan: Dict = {}


class FolderRequest(BaseModel):
    folder_path: str


@app.get("/")
def root() -> Dict:
    return {"message": "Smart File Organizer API running"}


@app.post("/scan-folder")
def scan_folder(payload: FolderRequest) -> Dict:
    global last_scan
    try:
        data = organizer.scan(payload.folder_path)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    suggestions, extra = organizer.heuristic_suggestions(data["files"])
    data["ai_suggestions"] = generate_ai_suggestions(data["files"], suggestions)
    data["insights"] = extra
    last_scan = data
    return data


@app.post("/organize")
def organize_files(payload: Optional[FolderRequest] = None) -> Dict:
    if not last_scan:
        raise HTTPException(status_code=400, detail="Scan a folder first.")
    folder = payload.folder_path if payload else last_scan["folder"]
    moves = organizer.organize(folder, last_scan["files"])
    history_file.write_text(json.dumps(moves, indent=2), encoding="utf-8")
    return {"message": "Files organized successfully", "moved": len(moves), "history": moves}


@app.post("/undo")
def undo_organize() -> Dict:
    if not history_file.exists():
        raise HTTPException(status_code=404, detail="No history file found")
    moves = json.loads(history_file.read_text(encoding="utf-8"))
    restored = organizer.undo(moves)
    history_file.write_text("[]", encoding="utf-8")
    return {"message": "Undo completed", "restored": restored}


@app.get("/stats")
def stats() -> Dict:
    if not last_scan:
        raise HTTPException(status_code=400, detail="No scan data available")
    return last_scan["stats"]


@app.get("/ai-suggestions")
def ai_suggestions() -> Dict:
    if not last_scan:
        raise HTTPException(status_code=400, detail="No scan data available")
    return {"ai_suggestions": last_scan.get("ai_suggestions", []), "insights": last_scan.get("insights", {})}
