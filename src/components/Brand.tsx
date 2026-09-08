/** Each wordmark SVG is cropped to its own ink bounds, so heights are scaled back to a shared em box. */
const em = 131;
const glyphs = [
  { file: "logo-1.svg", width: 87, height: 129 },
  { file: "logo-2.svg", width: 74, height: 122 },
  { file: "logo-3.svg", width: 80, height: 131 },
  { file: "logo-4.svg", width: 93, height: 128 },
  { file: "logo-5.svg", width: 87, height: 130 },
];
export function Brand({ hero = false }: { hero?: boolean }) {
  return (
    <span
      className={hero ? "wordmark wordmark-hero" : "wordmark"}
      role="img"
      aria-label="勞工大代誌"
    >
      {glyphs.map((glyph) => (
        <img
          key={glyph.file}
          src={`${import.meta.env.BASE_URL}brand/${glyph.file}`}
          alt=""
          width={glyph.width}
          height={glyph.height}
          style={{ height: `${(glyph.height / em) * 100}%` }}
        />
      ))}
    </span>
  );
}
