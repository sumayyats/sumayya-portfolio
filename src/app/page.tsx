export default function Lobby() {
  return (
    <main id="main" className="room-pad flex min-h-dvh flex-col bg-room-frame p-4 sm:p-6">
      <h1 className="sr-only">Lobby</h1>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-white text-[#22271f]">
        {/* TODO(phase 2): door illustration, opening into the library lobby */}
        <p className="font-mono text-xs uppercase tracking-widest opacity-60">TODO: door</p>
        <p className="font-script text-lg">⊹ ࣪ ˖ good things are about to open ⊹ ࣪ ˖</p>
      </div>
    </main>
  );
}
