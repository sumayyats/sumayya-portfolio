/**
 * Sumayya's Room: the work table, a standalone page in public/room/ (built
 * outside Next, like the library scene), shown full-bleed with the room dock
 * floating over the desk — no band reserved beneath it.
 */
export default function SumayyasRoom() {
  return (
    <main id="main" className="flex h-dvh flex-col">
      <h1 className="sr-only">Sumayya&apos;s Room</h1>
      <iframe
        src="/room/index.html"
        title="Sumayya's work table"
        className="block w-full flex-1 border-0"
      />
    </main>
  );
}
