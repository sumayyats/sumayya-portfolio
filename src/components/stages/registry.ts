import type { ComponentType } from "react";
import type { SceneDef } from "./timeline";
import { SceneAstaImpact, astaImpact } from "./scenes/SceneAstaImpact";
import { SceneKyrosDesign, kyrosDesign } from "./scenes/SceneKyrosDesign";
import { SceneGutTesting, gutTesting } from "./scenes/SceneGutTesting";
import {
  SceneAstaOverview,
  astaOverview,
  SceneKyrosOverview,
  kyrosOverview,
  SceneGutOverview,
  gutOverview,
} from "./scenes/Overviews";

/** Built scenes, keyed by motion stage id (content/case-studies.ts). */
export const scenes: Record<string, { Scene: ComponentType; def: SceneDef }> = {
  "asta-overview": { Scene: SceneAstaOverview, def: astaOverview },
  "asta-impact": { Scene: SceneAstaImpact, def: astaImpact },
  "kyros-overview": { Scene: SceneKyrosOverview, def: kyrosOverview },
  "kyros-design": { Scene: SceneKyrosDesign, def: kyrosDesign },
  "gut-overview": { Scene: SceneGutOverview, def: gutOverview },
  "gut-testing": { Scene: SceneGutTesting, def: gutTesting },
};
