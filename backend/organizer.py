"""Core folder scanning and organizing logic."""
from __future__ import annotations

from pathlib import Path
from datetime import datetime, timezone, timedelta
from collections import Counter, defaultdict
from typing import Dict, List, Tuple
import shutil

from utils import categorize_extension, file_hash, datetime_to_iso, human_size, build_tree


class FolderOrganizer:
    """Service class that manages scanning, planning, and moving files."""

    def scan(self, folder: str) -> Dict:
        root = Path(folder).expanduser().resolve()
        if not root.exists() or not root.is_dir():
            raise ValueError("Provided path is not a valid folder.")

        files = []
        file_paths = []
        for file_path in root.rglob("*"):
            if not file_path.is_file():
                continue
            stat = file_path.stat()
            category = categorize_extension(file_path.suffix)
            file_paths.append(file_path)
            files.append(
                {
                    "filename": file_path.name,
                    "extension": file_path.suffix.lower() or "",
                    "size": stat.st_size,
                    "size_human": human_size(stat.st_size),
                    "created_date": datetime_to_iso(stat.st_ctime),
                    "modified_date": datetime_to_iso(stat.st_mtime),
                    "file_path": str(file_path),
                    "category": category,
                }
            )

        stats = self._stats(files)
        before_tree = build_tree(file_paths, root)
        after_tree = self.predict_tree(root, files)
        return {"folder": str(root), "files": files, "stats": stats, "before_tree": before_tree, "after_tree": after_tree}

    def _stats(self, files: List[Dict]) -> Dict:
        counter = Counter(f["category"] for f in files)
        largest = sorted(files, key=lambda x: x["size"], reverse=True)[:5]
        return {
            "total_files": len(files),
            "total_size": sum(f["size"] for f in files),
            "total_size_human": human_size(sum(f["size"] for f in files)),
            "category_distribution": counter,
            "largest_files": largest,
        }

    def detect_duplicates(self, files: List[Dict]) -> List[List[str]]:
        hash_map = defaultdict(list)
        for f in files:
            path = Path(f["file_path"])
            try:
                hash_map[file_hash(path)].append(str(path))
            except OSError:
                continue
        return [group for group in hash_map.values() if len(group) > 1]

    def heuristic_suggestions(self, files: List[Dict]) -> Tuple[List[Dict], Dict]:
        now = datetime.now(tz=timezone.utc)
        duplicates = self.detect_duplicates(files)
        large_files = [f for f in files if f["size"] > 500 * 1024 * 1024]
        screenshots = [f for f in files if "screenshot" in f["filename"].lower()]
        old_files = [f for f in files if datetime.fromisoformat(f["modified_date"]) < now - timedelta(days=365)]

        suggestions = []
        if duplicates:
            suggestions.append({"type": "duplicates", "title": "Duplicate files detected", "detail": f"{len(duplicates)} duplicate groups found."})
        if large_files:
            suggestions.append({"type": "large_files", "title": "Large files detected", "detail": f"{len(large_files)} files over 500MB."})
        if len(screenshots) >= 10:
            suggestions.append({"type": "screenshots", "title": "Screenshot clutter detected", "detail": f"{len(screenshots)} screenshots found. Consider archiving."})
        if old_files:
            suggestions.append({"type": "old_files", "title": "Old unused files found", "detail": f"{len(old_files)} files not modified in a year."})
        if not suggestions:
            suggestions.append({"type": "clean", "title": "Folder health looks good", "detail": "No critical clutter patterns detected."})

        extra = {
            "duplicate_count": sum(len(g) for g in duplicates),
            "duplicates": duplicates,
            "large_files": large_files[:10],
            "old_files": old_files[:10],
        }
        return suggestions, extra

    def predict_tree(self, root: Path, files: List[Dict]) -> Dict:
        categorized_paths = []
        for file in files:
            original = Path(file["file_path"])
            categorized_paths.append(root / file["category"] / original.name)
        return build_tree(categorized_paths, root)

    def organize(self, folder: str, files: List[Dict]) -> List[Dict]:
        root = Path(folder)
        history = []
        for file in files:
            source = Path(file["file_path"])
            if not source.exists():
                continue
            target_dir = root / file["category"]
            target_dir.mkdir(parents=True, exist_ok=True)
            target = target_dir / source.name
            counter = 1
            while target.exists():
                target = target_dir / f"{source.stem}_{counter}{source.suffix}"
                counter += 1
            shutil.move(str(source), str(target))
            history.append({"from": str(source), "to": str(target), "moved_at": datetime.now(timezone.utc).isoformat()})
        return history

    def undo(self, moves: List[Dict]) -> int:
        restored = 0
        for move in reversed(moves):
            src = Path(move["to"])
            dst = Path(move["from"])
            if src.exists():
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.move(str(src), str(dst))
                restored += 1
        return restored
