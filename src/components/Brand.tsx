export function Brand({ hero = false }: { hero?: boolean }) {
  return (
    <span
      className={hero ? "wordmark wordmark-hero" : "wordmark"}
      role="img"
      aria-label="勞工大代誌"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <img
          key={n}
          src={`${import.meta.env.BASE_URL}brand/logo-${n}.svg`}
          alt=""
          width={n === 3 ? 93 : 87}
          height="130"
        />
      ))}
    </span>
  );
}
