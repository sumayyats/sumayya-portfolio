/**
 * Sumayya's Room: the work table, a standalone page in public/room/ (built
 * outside Next, like the library scene), shown full-bleed above the room nav.
 */
export default function SumayyasRoom() {
  return (
    <main id="main" className="room-pad flex h-dvh flex-col bg-[#1d120b]">
      <h1 className="sr-only">Sumayya&apos;s Room</h1>
      <iframe
        src="/room/index.html"
        title="Sumayya's work table"
        className="block w-full flex-1 border-0"
      />
    </main>
  );
}
