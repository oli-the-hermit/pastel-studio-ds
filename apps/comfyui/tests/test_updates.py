import json
from pathlib import Path

from pastel_studio import updates
from pastel_studio.updates import UpdateChecker, current_version, latest_release, parse_version

ROOT = Path(__file__).resolve().parents[1]


def test_version_matches_the_front_end():
    package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
    assert current_version() == package["version"]


def test_latest_release_picks_the_newest_published_pack_release():
    releases = [
        {"tag_name": "comfyui-v0.2.0", "html_url": "u020"},
        {"tag_name": "comfyui-v0.10.0", "html_url": "u0100"},
        {"tag_name": "comfyui-v0.11.0", "html_url": "draft", "draft": True},
        {"tag_name": "comfyui-v0.12.0", "html_url": "pre", "prerelease": True},
        {"tag_name": "v9.0.0", "html_url": "design-system"},
        {"tag_name": "comfyui-vNext", "html_url": "junk"},
    ]
    assert latest_release(releases) == {"version": "0.10.0", "url": "u0100"}
    assert latest_release([]) is None


def test_versions_compare_as_numbers():
    assert parse_version("0.10.0") > parse_version("0.9.9")


def test_checks_once_a_day_unless_forced(monkeypatch):
    monkeypatch.setattr(updates, "current_version", lambda: "0.1.0")
    calls = []
    now = [1000.0]

    def fetch():
        calls.append(1)
        return [{"tag_name": "comfyui-v0.2.0", "html_url": "page"}]

    checker = UpdateChecker(fetch=fetch, clock=lambda: now[0])
    first = checker.check()
    assert first["newer"] is True
    assert (first["current"], first["latest"], first["url"]) == ("0.1.0", "0.2.0", "page")

    now[0] += 3600
    checker.check()
    assert len(calls) == 1
    checker.check(force=True)
    assert len(calls) == 2
    now[0] += updates.DAY
    checker.check()
    assert len(calls) == 3


def test_reports_a_failed_check_and_tries_again_next_time(monkeypatch):
    monkeypatch.setattr(updates, "current_version", lambda: "0.1.0")
    outcomes = [OSError("offline"), [{"tag_name": "comfyui-v0.1.0", "html_url": "same"}]]

    def fetch():
        outcome = outcomes.pop(0)
        if isinstance(outcome, Exception):
            raise outcome
        return outcome

    checker = UpdateChecker(fetch=fetch, clock=lambda: 0.0)
    failed = checker.check()
    assert failed["error"] == "offline"
    assert failed["newer"] is False
    up_to_date = checker.check()
    assert up_to_date["error"] is None
    assert up_to_date["newer"] is False


def test_pyproject_is_registry_ready():
    import tomllib

    data = tomllib.loads((ROOT / "pack" / "pyproject.toml").read_text(encoding="utf-8"))
    assert data["project"]["name"] == "comfyui-pastel-studio"
    assert "web" in data["tool"]["comfy"]["includes"]
