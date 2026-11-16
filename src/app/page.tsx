import { Door } from "@/components/Door";

export default function Lobby() {
  return (
    <main id="main" className="room-pad flex h-dvh flex-col bg-room-frame p-4 sm:p-6">
      <h1 className="sr-only">Lobby</h1>
      <Door />
    </main>
  );
}
