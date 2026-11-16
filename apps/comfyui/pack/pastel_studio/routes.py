"""HTTP routes the Pastel Studio front end calls. Registered when ComfyUI loads the pack."""

from __future__ import annotations

from datetime import date

from aiohttp import web
from server import PromptServer

from .prompt_library import PROMPTS_DIR, build_export, saved_prompt_files


def register_routes() -> None:
    routes = PromptServer.instance.routes
    user_manager = PromptServer.instance.user_manager

    @routes.get("/pastel/prompts/export")
    async def export_prompts(request):
        # Resolves the requesting ComfyUI user's folder, with ComfyUI's own path checks.
        folder = user_manager.get_request_user_filepath(request, PROMPTS_DIR, create_dir=False)
        if folder is None:
            return web.json_response({"error": "Invalid user"}, status=403)
        if not saved_prompt_files(folder):
            return web.json_response({"error": "No saved prompts"}, status=404)
        filename = f"pastel-prompts-{date.today().isoformat()}.zip"
        return web.Response(
            body=build_export(folder),
            content_type="application/zip",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
