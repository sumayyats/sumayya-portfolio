/** Small printed emblem near the foot of a spine. Varies by index for texture. */
export function FootEmblem({
  variant,
  className = "",
}: {
  variant: number;
  className?: string;
}) {
  const v = ((variant % 5) + 5) % 5;
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      {v === 0 && <path d="M12 3v18M6 8l6-5 6 5M6 16l6 5 6-5" />}
      {v === 1 && (
        <>
          <circle cx="12" cy="12" r="7" />
          <path d="M12 5v14M5 12h14" />
        </>
      )}
      {v === 2 && <path d="M4 18l4-6 4 6M12 12l4-6 4 6M4 20h16" />}
      {v === 3 && (
        <>
          <path d="M12 4v16" />
          <path d="M8 8l4-4 4 4M8 16l4 4 4-4" />
        </>
      )}
      {v === 4 && (
        <>
          <circle cx="12" cy="12" r="2.2" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" />
        </>
      )}
    </svg>
  );
}
