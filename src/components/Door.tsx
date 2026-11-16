"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Coming back to the lobby from another room shouldn't replay the preload.
let seen = false;

/** The lobby's preload screen: the front door waits while the library loads, then swings open onto it. */
export function Door() {
  const scene = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [waited, setWaited] = useState(seen);
  const open = seen || (loaded && waited);

  useEffect(() => {
    // The scene can finish loading before React attaches onLoad.
    if (scene.current?.contentDocument?.readyState === "complete") setLoaded(true);
    const t = setTimeout(() => setWaited(true), 1400); // long enough to register the door
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (open) seen = true;
  }, [open]);

  return (
    <div className="lobby" data-open={open}>
      <iframe
        ref={scene}
        src="/library/index.html"
        title="The library lobby"
        className="lobby-scene"
        onLoad={() => setLoaded(true)}
      />
      <div className="lobby-front" role="status" aria-hidden={open}>
        <span className="sr-only">Opening the library</span>
        <div className="door">
          <span className="door-way" aria-hidden="true" />
          <Image
            className="door-leaf"
            src="/images/lobby/door.png"
            alt=""
            width={380}
            height={718}
            priority
          />
        </div>
        <p className="font-display text-lg sm:text-xl">⊹ ࣪ ˖ good things are about to open ⊹ ࣪ ˖</p>
      </div>
    </div>
  );
}
