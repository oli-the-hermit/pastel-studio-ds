"""The pack's version, and whether GitHub has a newer release of it.

Releases are tagged comfyui-v<version> in the design system's repository. The check is the
pack's only internet request: it runs when the front end asks (the "Check for updates" setting),
at most once a day unless the person presses "Check now".
"""

from __future__ import annotations

import json
import os
import re
import time
import tomllib
import urllib.request

RELEASES_URL = "https://api.github.com/repos/oli-the-hermit/pastel-studio-ds/releases?per_page=30"
TAG = re.compile(r"^comfyui-v(\d+)\.(\d+)\.(\d+)$")
DAY = 24 * 60 * 60

_PYPROJECT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "pyproject.toml")


def current_version() -> str:
    with open(_PYPROJECT, "rb") as f:
        return tomllib.load(f)["project"]["version"]


def parse_version(version: str) -> tuple[int, int, int]:
    major, minor, patch = (int(part) for part in version.split("."))
    return major, minor, patch


def latest_release(releases: list[dict]) -> dict | None:
    """The newest published, non-prerelease comfyui-v* release: its version and page."""
    best = None
    for release in releases:
        match = TAG.match(str(release.get("tag_name", "")))
        if not match or release.get("draft") or release.get("prerelease"):
            continue
        version = tuple(int(g) for g in match.groups())
        if best is None or version > best[0]:
            best = (version, release.get("html_url", ""))
    if best is None:
        return None
    return {"version": ".".join(str(n) for n in best[0]), "url": best[1]}


def fetch_releases(timeout: float = 8.0) -> list[dict]:
    request = urllib.request.Request(
        RELEASES_URL,
        headers={"Accept": "application/vnd.github+json", "User-Agent": f"comfyui-pastel-studio/{current_version()}"},
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.load(response)


class UpdateChecker:
    """Remembers the last answer for a day, so opening nodes or pages doesn't ask GitHub again."""

    def __init__(self, fetch=fetch_releases, clock=time.time):
        self._fetch = fetch
        self._clock = clock
        self._last: dict | None = None

    def check(self, force: bool = False) -> dict:
        now = self._clock()
        if not force and self._last is not None and now - self._last["checked"] < DAY:
            return self._last
        current = current_version()
        result = {"current": current, "latest": None, "url": None, "newer": False, "checked": now, "error": None}
        try:
            latest = latest_release(self._fetch())
        except Exception as e:  # Offline, rate-limited, GitHub down: say so, try again next time.
            result["error"] = str(e) or type(e).__name__
            return result
        if latest:
            result.update(latest=latest["version"], url=latest["url"], newer=parse_version(latest["version"]) > parse_version(current))
        self._last = result
        return result
