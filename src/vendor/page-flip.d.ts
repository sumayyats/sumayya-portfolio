/** Minimal typings for the vendored page-flip v2.0.7 (see page-flip.js). */

export type FlipOrientation = "portrait" | "landscape";
export type FlipState = "user_fold" | "fold_corner" | "flipping" | "read";
export type FlipCorner = "top" | "bottom";

export interface FlipSettings {
  startPage: number;
  size: "fixed" | "stretch";
  width: number;
  height: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  drawShadow: boolean;
  flippingTime: number;
  usePortrait: boolean;
  startZIndex: number;
  autoSize: boolean;
  maxShadowOpacity: number;
  showCover: boolean;
  mobileScrollSupport: boolean;
  swipeDistance: number;
  clickEventForward: boolean;
  useMouseEvents: boolean;
  showPageCorners: boolean;
  disableFlipByClick: boolean;
}

export interface FlipEvent<T> {
  data: T;
  object: PageFlip;
}

export class PageFlip {
  constructor(element: HTMLElement, settings: Partial<FlipSettings>);
  loadFromHTML(items: ArrayLike<HTMLElement>): void;
  updateFromHtml(items: ArrayLike<HTMLElement>): void;
  destroy(): void;
  update(): void;
  flipNext(corner?: FlipCorner): void;
  flipPrev(corner?: FlipCorner): void;
  flip(page: number, corner?: FlipCorner): void;
  turnToPage(page: number): void;
  getCurrentPageIndex(): number;
  getPageCount(): number;
  getOrientation(): FlipOrientation;
  getSettings(): FlipSettings;
  getState(): FlipState;
  on(event: "flip", cb: (e: FlipEvent<number>) => void): this;
  on(event: "changeState", cb: (e: FlipEvent<FlipState>) => void): this;
  on(
    event: "changeOrientation",
    cb: (e: FlipEvent<FlipOrientation>) => void
  ): this;
  on(
    event: "init" | "update",
    cb: (e: FlipEvent<{ page: number; mode: FlipOrientation }>) => void
  ): this;
  off(event: string): void;
}
