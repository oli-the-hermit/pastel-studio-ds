import os
import sys

# Tests import the pack's modules directly, without ComfyUI.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
