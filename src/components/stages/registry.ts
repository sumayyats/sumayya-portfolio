import type { ComponentType } from "react";
import type { SceneDef } from "./timeline";
import { SceneAstaImpact, astaImpact } from "./scenes/SceneAstaImpact";
import { SceneKyrosDesign, kyrosDesign } from "./scenes/SceneKyrosDesign";
import { SceneGutTesting, gutTesting } from "./scenes/SceneGutTesting";

/** Built scenes, keyed by motion stage id (content/case-studies.ts). */
export const scenes: Record<string, { Scene: ComponentType; def: SceneDef }> = {
  "asta-impact": { Scene: SceneAstaImpact, def: astaImpact },
  "kyros-design": { Scene: SceneKyrosDesign, def: kyrosDesign },
  "gut-testing": { Scene: SceneGutTesting, def: gutTesting },
};
