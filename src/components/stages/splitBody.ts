import type { CaseStudy, CaseStudySection, MotionStageSpec } from "@/content/types";

export type BodyPart =
  | { kind: "md"; source: string }
  | { kind: "stage"; spec: MotionStageSpec };

/**
 * A section's prose with its motion stages placed in it: straight under the
 * heading (`atTop`), after the paragraph starting with `after`, or after the
 * opening paragraph. Splits only at blank lines, so tables, lists and quotes
 * stay whole.
 */
export function splitBody(study: CaseStudy, section: CaseStudySection): BodyPart[] {
  const stages = study.motionStages.filter((s) => s.sectionId === section.id);
  const paras = section.body.trim().split(/\n\s*\n/);
  const before = new Map<number, MotionStageSpec[]>(); // stages placed before paragraph i
  for (const s of stages) {
    let at: number;
    if (s.atTop) at = 0;
    else if (s.after) {
      const i = paras.findIndex((p) => p.trimStart().startsWith(s.after!));
      if (i < 0 && process.env.NODE_ENV !== "production")
        console.warn(`Motion stage ${s.id}: no paragraph starts with "${s.after}"`);
      at = (i < 0 ? 0 : i) + 1;
    } else at = 1;
    before.set(at, [...(before.get(at) ?? []), s]);
  }

  const parts: BodyPart[] = [];
  let buf: string[] = [];
  const flush = () => {
    if (buf.length) parts.push({ kind: "md", source: buf.join("\n\n") });
    buf = [];
  };
  paras.forEach((p, i) => {
    if (before.has(i)) {
      flush();
      before.get(i)!.forEach((spec) => parts.push({ kind: "stage", spec }));
    }
    buf.push(p);
  });
  flush();
  before.get(paras.length)?.forEach((spec) => parts.push({ kind: "stage", spec }));
  return parts;
}
