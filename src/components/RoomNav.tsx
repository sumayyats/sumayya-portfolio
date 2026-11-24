"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Each room is an icon in the dock: the green door, a bookshelf, and me. */
const ROOMS = [
  { href: "/", label: "Lobby", icon: "/images/lobby/door.png", fit: "door" },
  { href: "/works/", label: "Work Room", icon: "/images/nav/shelf.png", fit: "fill" },
  // TODO(Sumayya): swap in the analog photo; the pixel avatar stands in until then
  { href: "/about/", label: "Sumayya's Room", icon: "/assistant/ask-mayya.png", fit: "fill" },
] as const;

/** The persistent bottom nav, a dock of rooms. Shown in the rooms only: the case study reader has its own header. */
export function RoomNav() {
  const path = usePathname().replace(/\/?$/, "/");
  if (!ROOMS.some((r) => r.href === path)) return null;
  return (
    <nav aria-label="Rooms" className="room-nav">
      {ROOMS.map((r) => (
        <Link
          key={r.href}
          href={r.href}
          aria-current={r.href === path ? "page" : undefined}
          className="room-key"
        >
          <span className={`room-icon room-icon--${r.fit}`} aria-hidden="true">
            <Image src={r.icon} alt="" fill sizes="64px" />
          </span>
          <span className="room-label">{r.label}</span>
        </Link>
      ))}
    </nav>
  );
}
