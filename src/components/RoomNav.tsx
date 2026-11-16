"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ROOMS = [
  { href: "/", label: "Lobby" },
  { href: "/works/", label: "Work Room" },
  { href: "/about/", label: "Sumayya's Room" },
];

/** The persistent bottom nav. Shown in the rooms only: the case study reader has its own header. */
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
          {r.label}
        </Link>
      ))}
    </nav>
  );
}
