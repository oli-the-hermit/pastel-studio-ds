import pytest

from pastel_studio.markdown_plain import markdown_to_plain


@pytest.mark.parametrize(
    ("markdown", "plain"),
    [
        ("", ""),
        ("a cat on a sofa", "a cat on a sofa"),
        # Headings and emphasis
        ("# Subject\nA **red** fox", "Subject\nA red fox"),
        ("## Style ##", "Style"),
        ("*soft* light, __bold__ colours, ~~gloomy~~", "soft light, bold colours, gloomy"),
        ("***very*** bright", "very bright"),
        ("snake_case and 2 * 3 stay", "snake_case and 2 * 3 stay"),
        # Lists, tasks, quotes and rules
        ("- one\n- two\n1. three", "one\ntwo\nthree"),
        ("- [ ] todo\n- [x] done", "todo\ndone"),
        ("> quoted\n>> nested", "quoted\nnested"),
        ("above\n\n---\n\nbelow", "above\n\nbelow"),
        # Links, images, code
        ("[a forest](https://x.test) at dawn", "a forest at dawn"),
        ("![a moodboard](img.png)", "a moodboard"),
        ("see <https://x.test>", "see https://x.test"),
        ("use `masterpiece` tag", "use masterpiece tag"),
        ("```\nraw *text*\n```", "raw *text*"),
        # Tables become comma-separated cells
        ("| subject | style |\n|---|:--:|\n| fox | ink |", "subject, style\nfox, ink"),
        # Paragraph spacing: at most one blank line
        ("one\n\n\n\ntwo", "one\n\ntwo"),
        ("line one  \nline two\\", "line one\nline two"),
        ("<!-- note to self -->kept", "kept"),
    ],
)
def test_markdown_to_plain(markdown, plain):
    assert markdown_to_plain(markdown) == plain


@pytest.mark.parametrize(
    ("markdown", "plain"),
    [
        # ComfyUI prompt syntax passes through untouched.
        ("(masterpiece:1.2), [blurry:0.5]", "(masterpiece:1.2), [blurry:0.5]"),
        ("{red|green|blue} hat", "{red|green|blue} hat"),
        ("embedding:easynegative", "embedding:easynegative"),
        # The editor saves a typed \( as \\( ; it comes back as \( for ComfyUI.
        ("a \\\\(literal\\\\) bracket", "a \\(literal\\) bracket"),
        # Escaped Markdown characters come back as themselves.
        ("5\\* rating, \\_not emphasis\\_", "5* rating, _not emphasis_"),
        # Line starts the editor escaped so they stay text, not headings or lists.
        ("\\# not a heading\n\\- not a list\n1\\. not numbered", "# not a heading\n- not a list\n1. not numbered"),
    ],
)
def test_prompt_syntax_survives(markdown, plain):
    assert markdown_to_plain(markdown) == plain
