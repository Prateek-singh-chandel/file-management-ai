"""Utility helpers for the Smart File Organizer backend."""
from __future__ import annotations

from pathlib import Path
from datetime import datetime, timezone
import hashlib
from typing import Dict, List

# Extension map used for automatic file categorization.
CATEGORY_EXTENSIONS = {
    "Images": {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg", ".heic"},
    "Videos": {".mp4", ".mov", ".mkv", ".avi", ".webm", ".flv"},
    "Documents": {".pdf", ".doc", ".docx", ".txt", ".ppt", ".pptx", ".xls", ".xlsx", ".md", ".csv"},
    "Code": {".py", ".js", ".ts", ".tsx", ".jsx", ".java", ".cpp", ".c", ".cs", ".html", ".css", ".json", ".yaml", ".yml", ".go", ".rs"},
    "Audio": {".mp3", ".wav", ".aac", ".flac", ".ogg", ".m4a"},
    "Archives": {".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"},
}


def human_size(size: int) -> str:
    """Convert raw bytes to a readable size string."""
    suffixes = ["B", "KB", "MB", "GB", "TB"]
    s = float(size)
    for suffix in suffixes:
        if s < 1024 or suffix == suffixes[-1]:
            return f"{s:.2f} {suffix}"
        s /= 1024
    return f"{size} B"


def categorize_extension(extension: str) -> str:
    """Map a file extension into a logical category."""
    ext = extension.lower()
    for category, extensions in CATEGORY_EXTENSIONS.items():
        if ext in extensions:
            return category
    return "Others"


def file_hash(path: Path, chunk_size: int = 8192) -> str:
    """Create an MD5 hash for deduplication logic."""
    digest = hashlib.md5()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(chunk_size), b""):
            digest.update(chunk)
    return digest.hexdigest()


def datetime_to_iso(timestamp: float) -> str:
    """Convert a UNIX timestamp to timezone-aware ISO string."""
    return datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()


def build_tree(paths: List[Path], root: Path) -> Dict:
    """Build nested dictionary tree from path list for preview UI."""
    tree: Dict = {"name": root.name, "type": "folder", "children": []}
    mapping = {root: tree}

    for path in sorted(paths):
        current = root
        for part in path.relative_to(root).parts:
            next_path = current / part
            parent_node = mapping[current]
            existing = next((c for c in parent_node["children"] if c["name"] == part), None)
            is_file = next_path.suffix != "" and next_path == path
            if not existing:
                existing = {
                    "name": part,
                    "type": "file" if is_file else "folder",
                    "children": [] if not is_file else None,
                }
                parent_node["children"].append(existing)
            mapping[next_path] = existing
            current = next_path

    return tree
