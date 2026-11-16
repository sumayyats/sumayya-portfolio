"use client";

import Image from "next/image";
import { useState } from "react";

/** The lobby's front door. It eases ajar as you reach for it; opening it walks you into the library. */
export function Door() {
  const [open, setOpen] = useState(false);
  return (
    <div className="lobby" data-open={open}>
      {open && (
        <iframe src="/library/index.html" title="The library lobby" className="lobby-scene" />
      )}
      <div className="lobby-front" inert={open}>
        <button
          type="button"
          className="door"
          onClick={() => setOpen(true)}
          aria-label="Open the door to the library lobby"
        >
          <span className="door-way" aria-hidden="true" />
          <Image
            className="door-leaf"
            src="/images/lobby/door.png"
            alt=""
            width={380}
            height={718}
            priority
          />
        </button>
        <p className="font-display text-lg sm:text-xl">⊹ ࣪ ˖ good things are about to open ⊹ ࣪ ˖</p>
      </div>
    </div>
  );
}
