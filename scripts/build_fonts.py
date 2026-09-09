# /// script
# requires-python = ">=3.11"
# dependencies = ["fonttools==4.64.0", "brotli==1.2.0"]
# ///
"""Subset the web fonts to the characters the site renders.

Run with `npm run fonts:build`. The source fonts are large, so they stay out of
the repository and download into `.context/fonts/` on first run.
"""

from __future__ import annotations

import io
import sys
import unicodedata
import urllib.request
import zipfile
from dataclasses import dataclass
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".context" / "fonts"
OUTPUT = ROOT / "public" / "fonts"

LINE_SEED_ZIP = "https://seed.line.me/src/images/fonts/LINE_Seed_TW.zip"
SPACE_GROTESK_TTF = (
    "https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf"
)

TEXT_SOURCES = (
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.css",
    "data/*.json",
    "public/data/*.json",
    "scripts/*.mjs",
)

# Punctuation and symbols that the interface can compose at runtime.
EXTRA_TEXT = "、。「」（）《》〈〉：；！？—…～－·‧％‰°×＋／　"

# Space Grotesk carries the digits and the symbols that sit inside a number.
NUMERIC_TEXT = "0123456789,.+-/:%‰–−×"

LAYOUT_FEATURES = ["ccmp", "kern", "liga", "locl", "palt", "halt", "tnum", "lnum"]


@dataclass(frozen=True)
class Target:
    source: Path
    output: Path
    text: str


def download(url: str, destination: Path) -> Path:
    if destination.exists():
        return destination
    destination.parent.mkdir(parents=True, exist_ok=True)
    print(f"download {url}")
    with urllib.request.urlopen(url) as response:
        destination.write_bytes(response.read())
    return destination


def line_seed_sources() -> dict[str, Path]:
    weights = {"Regular": "LINESeedTW_TTF_Rg.ttf", "Bold": "LINESeedTW_TTF_Bd.ttf"}
    paths = {weight: CACHE / name for weight, name in weights.items()}
    if all(path.exists() for path in paths.values()):
        return paths
    archive = download(LINE_SEED_ZIP, CACHE / "LINE_Seed_TW.zip")
    with zipfile.ZipFile(io.BytesIO(archive.read_bytes())) as bundle:
        for weight, name in weights.items():
            member = next(
                entry
                for entry in bundle.namelist()
                if entry.endswith(f"/TTF/{name}") and "__MACOSX" not in entry
            )
            paths[weight].write_bytes(bundle.read(member))
    return paths


def is_visible(character: str) -> bool:
    """Keep letters, marks, symbols and spaces; drop line breaks and control codes."""
    category = unicodedata.category(character)
    return category == "Zs" or category[0] not in "CZ"


def rendered_text() -> str:
    characters = set(EXTRA_TEXT) | {chr(code) for code in range(0x20, 0x7F)}
    for pattern in TEXT_SOURCES:
        for path in ROOT.glob(pattern):
            characters |= set(path.read_text(encoding="utf-8"))
    return "".join(sorted(character for character in characters if is_visible(character)))


def codepoints(font: TTFont) -> set[int]:
    return {code for table in font["cmap"].tables for code in table.cmap}


def write_subset(target: Target) -> set[int]:
    font = TTFont(target.source)
    available = codepoints(font)
    wanted = {ord(character) for character in target.text}
    options = subset.Options(layout_features=LAYOUT_FEATURES, drop_tables=["DSIG", "meta"])
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=wanted & available)
    subsetter.subset(font)
    target.output.parent.mkdir(parents=True, exist_ok=True)
    font.flavor = "woff2"
    font.save(target.output)
    font.close()
    kilobytes = target.output.stat().st_size / 1024
    print(f"  {target.output.relative_to(ROOT)} {kilobytes:.0f} KB")
    return wanted & available


def main() -> int:
    text = rendered_text()
    print(f"{len(text)} characters in the interface and the dataset")
    line_seed = line_seed_sources()
    space_grotesk = download(SPACE_GROTESK_TTF, CACHE / "SpaceGrotesk-Variable.ttf")
    targets = [
        Target(line_seed["Regular"], OUTPUT / "LINESeedTW-Regular.woff2", text),
        Target(line_seed["Bold"], OUTPUT / "LINESeedTW-Bold.woff2", text),
        Target(space_grotesk, OUTPUT / "SpaceGrotesk-Variable.woff2", NUMERIC_TEXT),
    ]
    shipped: set[int] = set()
    for target in targets:
        shipped |= write_subset(target)
    uncovered = sorted({ord(character) for character in text} - shipped)
    if uncovered:
        names = " ".join(f"{chr(code)} U+{code:04X}" for code in uncovered)
        print(f"no glyph in any shipped font, the browser substitutes: {names}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
