import { describe, it, expect } from "vite-plus/test";
import { readFileSync, readdirSync } from "node:fs";
import { openSync } from "fontkit";

const numeric = "0123456789,.+-/:%‰–−×";

const sources = [
  "src/styles.css",
  ...["src/components", "src/routes", "src/lib"].flatMap((directory) =>
    readdirSync(directory).map((name) => `${directory}/${name}`),
  ),
  ...readdirSync("data")
    .filter((name) => name.endsWith(".json"))
    .map((name) => `data/${name}`),
];

/** Emoji come from the system emoji font, so only the text plane must be in the subsets. */
const rendered = new Set(
  sources
    .flatMap((path) => Array.from(readFileSync(path, "utf8")))
    .filter((character) => {
      const code = character.codePointAt(0) ?? 0;
      return code > 0x7f && code <= 0xffff;
    }),
);

const open = (name: string) => {
  const font = openSync(`public/fonts/${name}.woff2`);
  if ("fonts" in font) throw new Error(`${name} is a collection, not a single font`);
  return font;
};

describe("shipped font subsets", () => {
  it("covers every character the interface and the dataset render", () => {
    const digits = open("SpaceGrotesk-Variable");
    for (const weight of ["Regular", "Bold"]) {
      const text = open(`LINESeedTW-${weight}`);
      const missing = Array.from(rendered).filter((character) => {
        const code = character.codePointAt(0) ?? 0;
        return !text.hasGlyphForCodePoint(code) && !digits.hasGlyphForCodePoint(code);
      });
      expect(missing, `LINESeedTW-${weight} lacks glyphs; run npm run fonts:build`).toEqual([]);
    }
  });

  it("keeps every digit and numeric symbol in Space Grotesk", () => {
    const font = open("SpaceGrotesk-Variable");
    const missing = Array.from(numeric).filter(
      (character) => !font.hasGlyphForCodePoint(character.codePointAt(0) ?? 0),
    );
    expect(missing).toEqual([]);
    expect(font.variationAxes.wght).toMatchObject({ min: 300, max: 700 });
  });
});
