/** The pointer that drives a scene. Its frames position it from the canvas origin. */
export function Cursor({ k, light = false }: { k: string; light?: boolean }) {
  return (
    <span className="sc-cursor" data-k={k}>
      <svg viewBox="0 0 16 22" aria-hidden="true">
        <path
          d="M1.5 1.5v16.2l4.3-4 2.7 6.3 3-1.3-2.7-6.2h5.9z"
          fill={light ? "#fff" : "#16180f"}
          stroke={light ? "#16180f" : "#fff"}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
