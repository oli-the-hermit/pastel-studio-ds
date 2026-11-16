import io
import json
import zipfile

from pastel_studio.prompt_library import build_export, saved_prompt_files


def test_lists_only_markdown_files(tmp_path):
    (tmp_path / "fox.md").write_text("# Fox", encoding="utf-8")
    (tmp_path / "notes.txt").write_text("x", encoding="utf-8")
    (tmp_path / "sub").mkdir()
    assert saved_prompt_files(str(tmp_path)) == ["fox.md"]
    assert saved_prompt_files(str(tmp_path / "missing")) == []


def test_export_holds_each_prompt_and_a_manifest(tmp_path):
    (tmp_path / "fox in snow.md").write_text("# Subject\nA **red** fox", encoding="utf-8")
    (tmp_path / "café.md").write_text("- warm light", encoding="utf-8")

    archive = zipfile.ZipFile(io.BytesIO(build_export(str(tmp_path))))
    assert sorted(archive.namelist()) == ["café.md", "fox in snow.md", "prompts.json"]
    assert archive.read("fox in snow.md").decode("utf-8") == "# Subject\nA **red** fox"

    manifest = json.loads(archive.read("prompts.json"))
    assert manifest["format"] == "pastel-studio-prompts"
    fox = next(p for p in manifest["prompts"] if p["file"] == "fox in snow.md")
    assert fox["name"] == "fox in snow"
    assert fox["plain"] == "Subject\nA red fox"
    assert fox["modified"].endswith("+00:00")
