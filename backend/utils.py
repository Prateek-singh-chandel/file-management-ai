from __future__ import annotations

import hashlib
import json
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Any

# Core category rules used by the scanner and organizer.
CATEGORY_RULES = {
    "Images": {
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".bmp",
        ".webp",
        ".tiff",
        ".tif",
        ".svg",
        ".ico",
        ".heic",
        ".avif",
    },
    "Videos": {
        ".mp4",
        ".mov",
        ".avi",
        ".mkv",
        ".webm",
        ".flv",
        ".wmv",
        ".m4v",
        ".3gp",
    },
    "Documents": {
        ".pdf",
        ".doc",
        ".docx",
        ".ppt",
        ".pptx",
        ".xls",
        ".xlsx",
        ".csv",
        ".txt",
        ".rtf",
        ".md",
        ".odt",
        ".ods",
        ".odp",
        ".log",
    },
    "Code": {
        ".py",
        ".js",
        ".jsx",
        ".ts",
        ".tsx",
        ".html",
        ".htm",
        ".css",
        ".scss",
        ".sass",
        ".json",
        ".yml",
        ".yaml",
        ".xml",
        ".sh",
        ".bat",
        ".ps1",
        ".c",
        ".cpp",
        ".h",
        ".hpp",
        ".java",
        ".go",
        ".rb",
        ".php",
        ".rs",
        ".swift",
        ".kt",
        ".dart",
    },
    "Audio": {
        ".mp3",
        ".wav",
        ".aac",
        ".flac",
        ".ogg",
        ".m4a",
        ".wma",
        ".aiff",
        ".alac",
    },
    "Archives": {
        ".zip",
        ".rar",
        ".7z",
        ".tar",
        ".gz",
        ".bz2",
        ".xz",
        ".tgz",
        ".iso",
    },
}

DEFAULT_CATEGORY = "Others"
ORGANIZER_FOLDER = "Smart File Organizer"
HISTORY_FILE = Path(__file__).with_name("history.json")
IGNORED_DIRS = {
    ".git",
    ".idea",
    ".vscode",
    "__pycache__",
    "node_modules",
    "dist",
    "build",
    ".venv",
    "venv",
    ORGANIZER_FOLDER,
}


def ensure_history_file() -> None:
    """Create the history file if it does not exist yet."""

    if not HISTORY_FILE.exists():
        HISTORY_FILE.write_text(json.dumps({"sessions": []}, indent=2), encoding="utf-8")


def load_history() -> dict[str, Any]:
    """Load the organization history from disk."""

    ensure_history_file()
    try:
        return json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {"sessions": []}


def save_history(history: dict[str, Any]) -> None:
    """Persist the history structure back to disk."""

    ensure_history_file()
    HISTORY_FILE.write_text(json.dumps(history, indent=2), encoding="utf-8")


def now_iso() -> str:
    """Return a human-readable local timestamp."""

    return datetime.now().astimezone().isoformat(timespec="seconds")


def format_bytes(size_in_bytes: int) -> str:
    """Format a byte count into a friendly display string."""

    size = float(max(size_in_bytes, 0))
    units = ["B", "KB", "MB", "GB", "TB"]
    for unit in units:
        if size < 1024 or unit == units[-1]:
            if unit == "B":
                return f"{int(size)} {unit}"
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} TB"


def format_datetime(timestamp: float) -> str:
    """Convert a timestamp to a readable local date/time string."""

    return datetime.fromtimestamp(timestamp).astimezone().isoformat(timespec="seconds")


def normalize_path(path_value: str | os.PathLike[str]) -> Path:
    """Convert user input into an absolute, resolved Path object."""

    return Path(path_value).expanduser().resolve()


def file_category(file_path: Path) -> str:
    """Map a file extension to a friendly content category."""

    extension = file_path.suffix.lower()
    for category, extensions in CATEGORY_RULES.items():
        if extension in extensions:
            return category
    return DEFAULT_CATEGORY


def is_ignored_entry(root: Path, path: Path) -> bool:
    """Skip generated folders and known noisy directories."""

    try:
        relative = path.relative_to(root)
    except ValueError:
        return False

    for part in relative.parts[:-1]:
        if part in IGNORED_DIRS or part.startswith("."):
            return True
    return False


def compute_md5(file_path: Path, chunk_size: int = 1024 * 1024) -> str:
    """Compute an MD5 hash for duplicate detection."""

    digest = hashlib.md5()
    with file_path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(chunk_size), b""):
            digest.update(chunk)
    return digest.hexdigest()


def unique_destination(target_path: Path) -> Path:
    """Add a numeric suffix when the target path already exists."""

    if not target_path.exists():
        return target_path

    stem = target_path.stem
    suffix = target_path.suffix
    counter = 1
    while True:
        candidate = target_path.with_name(f"{stem} ({counter}){suffix}")
        if not candidate.exists():
            return candidate
        counter += 1


def remove_empty_parents(start_path: Path, stop_at: Path) -> None:
    """Remove empty folders created during a move operation."""

    current = start_path
    while current != stop_at and stop_at in current.parents:
        try:
            current.rmdir()
        except OSError:
            break
        current = current.parent


def build_tree(paths: list[str]) -> dict[str, Any]:
    """Build a nested tree structure from relative paths."""

    root: dict[str, Any] = {"name": "Root", "kind": "folder", "children": []}
    index: dict[str, dict[str, Any]] = {"": root}

    for raw_path in sorted(paths):
        parts = Path(raw_path).parts
        running_key_parts: list[str] = []
        parent = root

        for depth, part in enumerate(parts):
            running_key_parts.append(part)
            key = "/".join(running_key_parts)
            node = index.get(key)
            if node is None:
                node = {
                    "name": part,
                    "kind": "file" if depth == len(parts) - 1 else "folder",
                    "children": [],
                }
                parent["children"].append(node)
                index[key] = node
            parent = node

    def sort_children(node: dict[str, Any]) -> None:
        node["children"].sort(key=lambda entry: (entry["kind"] == "file", entry["name"].lower()))
        for child in node["children"]:
            if child["kind"] == "folder":
                sort_children(child)

    sort_children(root)
    return root


def extract_path_preview(root: Path, file_path: Path, organized: bool = False) -> str:
    """Return the path used in the before/after preview tree."""

    relative = file_path.relative_to(root)
    if not organized:
        return relative.as_posix()

    category = file_category(file_path)
    parent = relative.parent.as_posix()
    segments = [ORGANIZER_FOLDER, category]
    if parent and parent != ".":
        segments.append(parent)
    segments.append(file_path.name)
    return Path(*segments).as_posix()


def find_duplicate_groups(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Group files by hash and keep only real duplicates."""

    buckets: dict[str, list[dict[str, Any]]] = {}
    for record in records:
        buckets.setdefault(record["md5"], []).append(record)

    duplicate_groups: list[dict[str, Any]] = []
    for md5, items in buckets.items():
        if len(items) < 2:
            continue
        duplicate_groups.append(
            {
                "md5": md5,
                "count": len(items),
                "files": sorted(items, key=lambda item: item["path"]),
                "reclaimableBytes": sum(item["size"] for item in items[1:]),
            }
        )

    duplicate_groups.sort(key=lambda group: (-group["count"], group["files"][0]["path"]))
    return duplicate_groups


def build_category_distribution(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Summarize how many files and bytes belong to each category."""

    totals: dict[str, dict[str, int]] = {}
    for record in records:
        bucket = totals.setdefault(record["category"], {"count": 0, "size": 0})
        bucket["count"] += 1
        bucket["size"] += record["size"]

    total_files = max(len(records), 1)
    distribution = []
    for category, bucket in sorted(totals.items(), key=lambda item: (-item[1]["count"], item[0])):
        distribution.append(
            {
                "category": category,
                "count": bucket["count"],
                "size": bucket["size"],
                "sizeHuman": format_bytes(bucket["size"]),
                "percentage": round((bucket["count"] / total_files) * 100, 1),
            }
        )
    return distribution


def build_largest_files(records: list[dict[str, Any]], limit: int = 8) -> list[dict[str, Any]]:
    """Return the largest files for dashboard ranking cards."""

    ordered = sorted(records, key=lambda record: (-record["size"], record["path"]))
    return ordered[:limit]


def detect_screenshot_file(file_record: dict[str, Any]) -> bool:
    """Spot screenshot clutter using filename clues and image extensions."""

    name = file_record["name"].lower()
    extension = file_record["extension"].lower()
    return bool(re.search(r"(screenshot|screen shot|screen-shot|capture|snip)", name)) or (
        file_record["category"] == "Images" and any(token in name for token in ("screen", "shot", "capture", "snip"))
    )
