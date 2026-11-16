import sys
import types
from unittest.mock import MagicMock

import pytest

from pastel_studio.nodes import NODE_CLASS_MAPPINGS, PastelPrompt


class Blocker:
    def __init__(self, message):
        self.message = message


@pytest.fixture
def comfy_execution(monkeypatch):
    graph_utils = types.ModuleType("comfy_execution.graph_utils")
    graph_utils.ExecutionBlocker = Blocker
    package = types.ModuleType("comfy_execution")
    package.graph_utils = graph_utils
    monkeypatch.setitem(sys.modules, "comfy_execution", package)
    monkeypatch.setitem(sys.modules, "comfy_execution.graph_utils", graph_utils)


def test_inputs_use_the_pastel_widget():
    inputs = PastelPrompt.INPUT_TYPES()
    assert inputs["required"]["text"][0] == "PASTEL_PROMPT"
    assert inputs["optional"]["clip"][0] == "CLIP"
    assert PastelPrompt.RETURN_NAMES == ("prompt", "markdown", "conditioning")
    assert NODE_CLASS_MAPPINGS["PastelPrompt"] is PastelPrompt


def test_outputs_plain_and_markdown_and_blocks_conditioning_without_clip(comfy_execution):
    plain, markdown, conditioning = PastelPrompt().run("# Fox\n- **red** fur\n\n")
    assert plain == "Fox\nred fur"
    assert markdown == "# Fox\n- **red** fur"
    assert isinstance(conditioning, Blocker)
    assert "connect a CLIP" in conditioning.message


def test_encodes_the_plain_prompt_with_a_clip():
    clip = MagicMock()
    clip.tokenize.return_value = "tokens"
    clip.encode_from_tokens_scheduled.return_value = "cond"
    plain, _, conditioning = PastelPrompt().run("*soft* light", clip)
    clip.tokenize.assert_called_once_with("soft light")
    assert (plain, conditioning) == ("soft light", "cond")
