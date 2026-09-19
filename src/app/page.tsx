import { Shelf } from "@/components/Shelf";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col">
      <header className="flex items-start justify-between gap-4 px-[max(1rem,8vw)] pt-10">
        <div className="max-w-[46ch]">
          <h1 className="font-display text-2xl leading-tight tracking-tight text-ink sm:text-[1.7rem]">
            Case studies — selected works
          </h1>
          <p className="mt-1 text-[15px] text-ink-soft">
            {/* TODO: one-line positioning statement. */}
            A shelf of UX case studies — pick one up to read.
          </p>
        </div>
        <ThemeToggle className="mt-1 shrink-0" />
      </header>

      <div className="flex flex-1 flex-col justify-center py-6">
        <Shelf />
      </div>

      <footer className="px-[max(1rem,8vw)] py-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
        Three featured case studies · eight more on Behance
      </footer>
    </main>
  );
}
