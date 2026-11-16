/** Remounts on every navigation, so each room fades in while RoomNav (in the layout) stays put. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="room-in">{children}</div>;
}
