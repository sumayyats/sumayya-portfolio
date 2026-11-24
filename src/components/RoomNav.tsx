"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Each room is a cut-out picture in the dock: the green door, the books, and me. */
const ROOMS = [
  { href: "/", label: "lobby", icon: "/images/lobby/door.png", w: 380, h: 718 },
  { href: "/works/", label: "work room", icon: "/images/nav/books.png", w: 119, h: 200 },
  // TODO(Sumayya): swap in the analog photo, cut out; the pixel avatar stands in until then
  { href: "/about/", label: "sumayya's room", icon: "/assistant/ask-mayya.png", w: 200, h: 200 },
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
          <Image className="room-icon" src={r.icon} alt="" width={r.w} height={r.h} sizes="96px" aria-hidden="true" />
          <span className="room-label">{r.label}</span>
        </Link>
      ))}
    </nav>
  );
}
