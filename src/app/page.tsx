import { Shelf } from "@/components/Shelf";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SoundToggle } from "@/components/SoundToggle";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="fixed right-5 top-5 z-50 flex items-center gap-2">
        <SoundToggle className="bg-paper" />
        <ThemeToggle className="bg-paper" />
      </div>
      <header className="px-16 pt-10 text-center">
        <h1 className="mx-auto max-w-[min(92vw,40ch)] font-display text-xl leading-tight tracking-tight text-ink sm:text-2xl">
          Sumayya&apos;s case studies: selected works
        </h1>
        <p className="mx-auto mt-1 max-w-[min(92vw,52ch)] font-body text-[15px] text-ink-soft">
          {/* TODO: one-line positioning statement. */}
          A shelf of UX case studies: pick one up to read.
        </p>
      </header>

      <div className="flex flex-1 flex-col justify-center py-6">
        <Shelf />
      </div>

    </main>
  );
}
