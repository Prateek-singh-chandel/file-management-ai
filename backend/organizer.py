from __future__ import annotations

import shutil
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from utils import (
    ORGANIZER_FOLDER,
    build_category_distribution,
    build_largest_files,
    build_tree,
    compute_md5,
    detect_screenshot_file,
    extract_path_preview,
    file_category,
    format_bytes,
    format_datetime,
    is_ignored_entry,
    load_history,
    now_iso,
    normalize_path,
    remove_empty_parents,
    save_history,
    unique_destination,
)

LARGE_FILE_THRESHOLD = 500 * 1024 * 1024
OLD_FILE_THRESHOLD_DAYS = 365


def _file_record(root: Path, file_path: Path) -> dict[str, Any]:
    """Extract all metadata required for the dashboard and preview."""

    stat = file_path.stat()
    category = file_category(file_path)
    relative_path = file_path.relative_to(root).as_posix()
    modified_at = datetime.fromtimestamp(stat.st_mtime)
    created_at = datetime.fromtimestamp(stat.st_ctime)

    return {
        "name": file_path.name,
        "extension": file_path.suffix.lower() or "",
        "size": stat.st_size,
        "sizeHuman": format_bytes(stat.st_size),
        "createdAt": format_datetime(stat.st_ctime),
        "modifiedAt": format_datetime(stat.st_mtime),
        "createdTimestamp": stat.st_ctime,
        "modifiedTimestamp": stat.st_mtime,
        "path": str(file_path),
        "relativePath": relative_path,
        "category": category,
        "md5": compute_md5(file_path),
        "ageDays": (datetime.now() - modified_at).days,
        "isOld": datetime.now() - modified_at > timedelta(days=OLD_FILE_THRESHOLD_DAYS),
        "isLarge": stat.st_size >= LARGE_FILE_THRESHOLD,
        "isScreenshot": detect_screenshot_file(
            {
                "name": file_path.name,
                "extension": file_path.suffix.lower(),
                "category": category,
            }
        ),
        "parentFolder": str(file_path.parent),
        "createdAtRaw": created_at.isoformat(timespec="seconds"),
    }


def _scan_records(root: Path) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    """Walk the directory tree and collect file metadata."""

    records: list[dict[str, Any]] = []
    issues: list[dict[str, str]] = []

    for candidate in root.rglob("*"):
        if not candidate.is_file():
            continue
        if is_ignored_entry(root, candidate):
            continue
        try:
            records.append(_file_record(root, candidate))
        except (OSError, PermissionError) as exc:
            issues.append({"path": str(candidate), "error": str(exc)})

    return records, issues


def _preview_paths(root: Path, records: list[dict[str, Any]], organized: bool = False) -> list[str]:
    """Convert file records into tree-friendly preview paths."""

    preview_paths: list[str] = []
    for record in records:
        preview_paths.append(extract_path_preview(root, Path(record["path"]), organized=organized))
    return preview_paths


def _summarize(records: list[dict[str, Any]]) -> dict[str, Any]:
    """Create a compact analytics summary from the scanned files."""

    total_size = sum(record["size"] for record in records)
    duplicate_groups = []
    by_hash = defaultdict(list)
    for record in records:
        by_hash[record["md5"]].append(record)
    for md5, items in by_hash.items():
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

    duplicate_count = sum(group["count"] - 1 for group in duplicate_groups)
    large_files = [record for record in records if record["isLarge"]]
    old_files = [record for record in records if record["isOld"]]
    screenshot_files = [record for record in records if record["isScreenshot"]]
    category_distribution = build_category_distribution(records)
    largest_files = build_largest_files(records)
    storage_cleaned_bytes = sum(group["reclaimableBytes"] for group in duplicate_groups)

    return {
        "totalFiles": len(records),
        "totalSize": total_size,
        "totalSizeHuman": format_bytes(total_size),
        "storageCleanedBytes": storage_cleaned_bytes,
        "storageCleanedHuman": format_bytes(storage_cleaned_bytes),
        "duplicateCount": duplicate_count,
        "duplicateGroups": duplicate_groups,
        "largeFiles": large_files,
        "oldFiles": old_files,
        "screenshotFiles": screenshot_files,
        "categoryDistribution": category_distribution,
        "largestFiles": largest_files,
        "largestFile": largest_files[0] if largest_files else None,
        "oldFileCount": len(old_files),
        "screenshotCount": len(screenshot_files),
        "largeFileCount": len(large_files),
        "categoryCount": len(category_distribution),
    }


def scan_folder(folder_path: str | Path) -> dict[str, Any]:
    """Scan a folder and return a production-ready analytics payload."""

    root = normalize_path(folder_path)
    if not root.exists():
        raise FileNotFoundError(f"Folder does not exist: {root}")
    if not root.is_dir():
        raise NotADirectoryError(f"Path is not a folder: {root}")

    records, issues = _scan_records(root)
    summary = _summarize(records)
    before_tree = build_tree(_preview_paths(root, records, organized=False))
    after_tree = build_tree(_preview_paths(root, records, organized=True))

    return {
        "folderPath": str(root),
        "scannedAt": now_iso(),
        "files": records,
        "issues": issues,
        "stats": summary,
        "beforePreview": before_tree,
        "afterPreview": after_tree,
    }


def _safe_move(source: Path, destination: Path) -> Path:
    """Move a file to its destination and preserve a unique name."""

    destination.parent.mkdir(parents=True, exist_ok=True)
    final_destination = unique_destination(destination)
    shutil.move(str(source), str(final_destination))
    return final_destination


def organize_folder(folder_path: str | Path) -> dict[str, Any]:
    """Move all unorganized files into category folders."""

    root = normalize_path(folder_path)
    report = scan_folder(root)
    records = report["files"]

    moved: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    bytes_moved = 0
    organizer_root = root / ORGANIZER_FOLDER

    for record in records:
        source = Path(record["path"])
        try:
            relative = source.relative_to(root)
            if relative.parts and relative.parts[0] == ORGANIZER_FOLDER:
                skipped.append({"path": str(source), "reason": "already_organized"})
                continue
        except ValueError:
            skipped.append({"path": str(source), "reason": "outside_selected_folder"})
            continue

        relative_parent = source.relative_to(root).parent
        destination = organizer_root / record["category"]
        if relative_parent != Path("."):
            destination = destination / relative_parent
        destination = destination / source.name

        try:
            final_destination = _safe_move(source, destination)
            moved.append(
                {
                    "source": str(source),
                    "destination": str(final_destination),
                    "category": record["category"],
                    "size": record["size"],
                    "sizeHuman": record["sizeHuman"],
                }
            )
            bytes_moved += record["size"]
            remove_empty_parents(source.parent, root)
        except (OSError, PermissionError) as exc:
            skipped.append({"path": str(source), "reason": str(exc)})

    session = {
        "id": f"session_{datetime.now().timestamp():.0f}",
        "root": str(root),
        "organizedRoot": str(organizer_root),
        "createdAt": now_iso(),
        "moves": moved,
        "bytesMoved": bytes_moved,
    }

    history = load_history()
    history.setdefault("sessions", []).append(session)
    save_history(history)

    updated_preview_paths = [
        str(Path(ORGANIZER_FOLDER) / record["category"] / source.relative_to(root).parent / source.name).replace("\\", "/")
        if source.relative_to(root).parent != Path(".")
        else str(Path(ORGANIZER_FOLDER) / record["category"] / source.name).replace("\\", "/")
        for record, source in [(record, Path(record["path"])) for record in records if Path(record["path"]).exists()]
    ]
    after_tree = build_tree(updated_preview_paths)

    return {
        "folderPath": str(root),
        "organizedAt": now_iso(),
        "sessionId": session["id"],
        "movedCount": len(moved),
        "skippedCount": len(skipped),
        "bytesMoved": bytes_moved,
        "bytesMovedHuman": format_bytes(bytes_moved),
        "destinationRoot": str(organizer_root),
        "moves": moved,
        "skipped": skipped,
        "beforePreview": report["beforePreview"],
        "afterPreview": after_tree,
        "stats": report["stats"],
    }


def undo_last_organization(folder_path: str | Path | None = None) -> dict[str, Any]:
    """Restore the most recent organization session."""

    history = load_history()
    sessions = history.get("sessions", [])
    if not sessions:
        raise ValueError("No organization history found.")

    root = normalize_path(folder_path) if folder_path else None
    target_index = None
    for index in range(len(sessions) - 1, -1, -1):
        session = sessions[index]
        if root is None or normalize_path(session["root"]) == root:
            target_index = index
            break

    if target_index is None:
        raise ValueError("No matching organization session found for the selected folder.")

    session = sessions.pop(target_index)
    restored: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []

    for move in reversed(session.get("moves", [])):
        source = Path(move["source"])
        destination = Path(move["destination"])

        if not destination.exists():
            skipped.append({"path": str(destination), "reason": "missing_destination_file"})
            continue

        try:
            source.parent.mkdir(parents=True, exist_ok=True)
            final_source = unique_destination(source)
            shutil.move(str(destination), str(final_source))
            restored.append(
                {
                    "source": str(final_source),
                    "destination": str(destination),
                    "category": move["category"],
                    "size": move["size"],
                }
            )
            remove_empty_parents(destination.parent, Path(session["organizedRoot"]))
        except (OSError, PermissionError) as exc:
            skipped.append({"path": str(destination), "reason": str(exc)})

    history["sessions"] = sessions
    save_history(history)

    try:
        organized_root = Path(session["organizedRoot"])
        remove_empty_parents(organized_root, Path(session["root"]))
    except Exception:
        pass

    return {
        "folderPath": session["root"],
        "sessionId": session["id"],
        "restoredCount": len(restored),
        "skippedCount": len(skipped),
        "restored": restored,
        "skipped": skipped,
        "restoredAt": now_iso(),
    }


def build_stats_only(folder_path: str | Path) -> dict[str, Any]:
    """Return only the statistics block for the /stats endpoint."""

    return scan_folder(folder_path)["stats"]

