"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Each room is a cut-out picture in the dock: the green door, the books, and me (pixel me). */
// tone: what's behind the dock — the lobby and the work table are dark
// scenes; the work room follows the site theme (see .room-nav in globals.css)
const ROOMS = [
  { href: "/", label: "lobby", tone: "dark", icon: "/images/lobby/door.png", w: 380, h: 718 },
  { href: "/works/", label: "work room", tone: "light", icon: "/images/nav/books.png", w: 119, h: 200 },
  { href: "/about/", label: "sumayya's room", tone: "dark", icon: "/images/nav/mayya-cut.png", w: 99, h: 152 },
] as const;

/** The persistent bottom nav, a dock of rooms. Shown in the rooms only: the case study reader has its own header. */
export function RoomNav() {
  const path = usePathname().replace(/\/?$/, "/");
  const room = ROOMS.find((r) => r.href === path);
  if (!room) return null;
  return (
    <nav aria-label="Rooms" className="room-nav" data-tone={room.tone}>
      {ROOMS.map((r) => (
        <Link
          key={r.href}
          href={r.href}
          aria-current={r.href === path ? "page" : undefined}
          className="room-key"
        >
          <Image className="room-icon" src={r.icon} alt="" width={r.w} height={r.h} sizes="96px" aria-hidden="true" />
          <span className="room-label">{r.label}</span>
        </Link>
      ))}
    </nav>
  );
}
