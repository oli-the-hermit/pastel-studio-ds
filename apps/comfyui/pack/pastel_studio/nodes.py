"""Pastel Studio node definitions."""

from .markdown_plain import markdown_to_plain


class PastelPrompt:
    """A prompt written with Markdown formatting, for reading; the encoder gets plain text."""

    CATEGORY = "Pastel Studio"
    FUNCTION = "run"
    RETURN_TYPES = ("STRING", "STRING", "CONDITIONING")
    RETURN_NAMES = ("prompt", "markdown", "conditioning")
    OUTPUT_TOOLTIPS = (
        "The prompt as plain text, without Markdown marks: connect it to CLIP Text Encode or any text input.",
        "The prompt as written, with its Markdown: for Save Text, notes or another editor.",
        "The plain prompt encoded with the connected CLIP. Only available when a CLIP is connected.",
    )
    DESCRIPTION = "Write a prompt with headings, lists and emphasis to keep it organized. The model only sees the words."
    SEARCH_ALIASES = ["prompt", "text", "markdown", "prompt editor", "pastel"]

    @classmethod
    def INPUT_TYPES(cls):
        return {
            # A custom type: the frontend builds the Pastel Studio editor for it, so ComfyUI
            # creates no default text widget next to ours.
            "required": {"text": ("PASTEL_PROMPT", {"default": ""})},
            "optional": {"clip": ("CLIP", {"tooltip": "Optional: encode the prompt here instead of in a separate CLIP Text Encode node."})},
        }

    def run(self, text: str, clip=None):
        # The editor ends a document with blank lines after a list or heading; they mean nothing.
        text = (text or "").rstrip()
        plain = markdown_to_plain(text)
        if clip is None:
            from comfy_execution.graph_utils import ExecutionBlocker

            conditioning = ExecutionBlocker("Pastel Prompt: connect a CLIP to its clip input to use the conditioning output.")
        else:
            conditioning = clip.encode_from_tokens_scheduled(clip.tokenize(plain))
        return (plain, text, conditioning)


NODE_CLASS_MAPPINGS = {"PastelPrompt": PastelPrompt}
NODE_DISPLAY_NAME_MAPPINGS = {"PastelPrompt": "Pastel Prompt"}
