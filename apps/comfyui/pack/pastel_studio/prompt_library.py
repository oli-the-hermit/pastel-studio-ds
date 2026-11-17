"""Saved prompts: .md files in the user's folder, next to ComfyUI's workflows.

The front end reads and writes them through ComfyUI's own /userdata API. Only the export (one
.zip for everything) is built here.
"""

from __future__ import annotations

import io
import json
import os
import zipfile
from datetime import datetime, timezone

from .markdown_plain import markdown_to_plain

# Relative to the ComfyUI user's folder (user/<name>/), like "workflows".
PROMPTS_DIR = "pastel_studio/prompts"


def _iso(timestamp: float) -> str:
    return datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat(timespec="seconds")


def saved_prompt_files(folder: str) -> list[str]:
    if not os.path.isdir(folder):
        return []
    return sorted(f for f in os.listdir(folder) if f.lower().endswith(".md") and os.path.isfile(os.path.join(folder, f)))


def build_export(folder: str) -> bytes:
    """Every saved prompt as its own .md, plus prompts.json: names, dates and the plain text."""
    manifest = []
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        for name in saved_prompt_files(folder):
            path = os.path.join(folder, name)
            with open(path, encoding="utf-8") as f:
                markdown = f.read()
            stat = os.stat(path)
            archive.writestr(name, markdown)
            manifest.append(
                {
                    "name": name[: -len(".md")],
                    "file": name,
                    "created": _iso(stat.st_ctime),
                    "modified": _iso(stat.st_mtime),
                    "plain": markdown_to_plain(markdown),
                }
            )
        archive.writestr("prompts.json", json.dumps({"format": "pastel-studio-prompts", "version": 1, "prompts": manifest}, indent=2, ensure_ascii=False))
    return buffer.getvalue()
