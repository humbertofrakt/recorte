/**
 * Viewport camera (owner B).
 *
 * World space is the skeleton space of the spec: X to the right, **Y up**,
 * one unit = one skeleton pixel. Screen space is CSS pixels of the canvas
 * element: X to the right, Y **down**, origin at the top-left corner.
 *
 *   screenX = (worldX - camera.x) * zoom + width  / 2
 *   screenY = (camera.y - worldY) * zoom + height / 2
 *
 * The camera stores the world point shown at the centre of the view plus a
 * zoom in screen pixels per world unit. Nothing here touches the DOM, so the
 * whole file is testable without a browser.
 */

import { clamp, type Vector2 } from '../../../runtime/src/index.js';

/** Smallest zoom allowed: the skeleton is 50x smaller than life size. */
export const MIN_ZOOM = 0.02;
/** Largest zoom allowed: one world unit fills 64 screen pixels. */
export const MAX_ZOOM = 64;

/** How much a wheel notch multiplies the zoom. */
export const ZOOM_STEP = 1.15;

/** A rectangle in world units. `y` is the bottom edge, because Y points up. */
export interface WorldBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Camera {
  /** World point shown at the centre of the view. */
  x = 0;
  y = 0;
  /** Screen pixels per world unit. Always between `MIN_ZOOM` and `MAX_ZOOM`. */
  zoom = 1;
  /** View size in CSS pixels. Never zero, so no division ever blows up. */
  width = 1;
  height = 1;

  /** Records the size of the drawing area, in CSS pixels. */
  setViewSize(width: number, height: number): void {
    this.width = width > 1 ? width : 1;
    this.height = height > 1 ? height : 1;
  }

  /** Zoom, kept inside the allowed range. */
  setZoom(zoom: number): void {
    this.zoom = clamp(Number.isFinite(zoom) ? zoom : 1, MIN_ZOOM, MAX_ZOOM);
  }

  /** Screen (CSS px) -> world. */
  screenToWorld(screenX: number, screenY: number, out: Vector2 = { x: 0, y: 0 }): Vector2 {
    out.x = (screenX - this.width / 2) / this.zoom + this.x;
    out.y = this.y - (screenY - this.height / 2) / this.zoom;
    return out;
  }

  /** World -> screen (CSS px). */
  worldToScreen(worldX: number, worldY: number, out: Vector2 = { x: 0, y: 0 }): Vector2 {
    out.x = (worldX - this.x) * this.zoom + this.width / 2;
    out.y = (this.y - worldY) * this.zoom + this.height / 2;
    return out;
  }

  /** World units covered by `pixels` screen pixels at the current zoom. */
  pixelsToWorld(pixels: number): number {
    return pixels / this.zoom;
  }

  /** Drags the view by a movement measured in screen pixels. */
  panByScreen(screenDX: number, screenDY: number): void {
    this.x -= screenDX / this.zoom;
    this.y += screenDY / this.zoom;
  }

  /** Puts a world point at the centre of the view. */
  centerOn(worldX: number, worldY: number): void {
    this.x = worldX;
    this.y = worldY;
  }

  /**
   * Multiplies the zoom by `factor` while the world point under the given
   * screen position stays exactly under it. This is the wheel behaviour.
   */
  zoomAtScreen(screenX: number, screenY: number, factor: number): void {
    const anchor = this.screenToWorld(screenX, screenY);
    this.setZoom(this.zoom * factor);
    // Solve worldToScreen(anchor) === (screenX, screenY) for the camera centre.
    this.x = anchor.x - (screenX - this.width / 2) / this.zoom;
    this.y = anchor.y + (screenY - this.height / 2) / this.zoom;
  }

  /** One wheel notch in or out at a screen position. */
  zoomBySteps(screenX: number, screenY: number, steps: number): void {
    this.zoomAtScreen(screenX, screenY, Math.pow(ZOOM_STEP, steps));
  }

  /**
   * Frames `bounds` in the view with a margin. `margin` is the fraction of
   * the view left empty around the content (0.1 = ten per cent).
   * Empty or invalid bounds only re-centre the camera.
   */
  fit(bounds: WorldBounds, margin = 0.1): void {
    const m = clamp(margin, 0, 0.45);
    this.x = bounds.x + bounds.width / 2;
    this.y = bounds.y + bounds.height / 2;
    const usableWidth = this.width * (1 - 2 * m);
    const usableHeight = this.height * (1 - 2 * m);
    const wide = bounds.width > 1e-6;
    const tall = bounds.height > 1e-6;
    if (!wide && !tall) return;
    const byWidth = wide ? usableWidth / bounds.width : Number.POSITIVE_INFINITY;
    const byHeight = tall ? usableHeight / bounds.height : Number.POSITIVE_INFINITY;
    this.setZoom(Math.min(byWidth, byHeight));
  }

  /** Back to the default view: origin centred, one world unit per pixel. */
  reset(): void {
    this.x = 0;
    this.y = 0;
    this.zoom = 1;
  }

  /**
   * Sets the canvas transform so drawing can use world coordinates directly.
   * `dpr` is `devicePixelRatio`: the canvas backing store is that many device
   * pixels per CSS pixel. The Y axis is flipped here, once, so everything
   * drawn afterwards has Y pointing up.
   */
  applyTo(ctx: CanvasRenderingContext2D, dpr = 1): void {
    const z = this.zoom * dpr;
    ctx.setTransform(
      z, 0,
      0, -z,
      (this.width / 2 - this.x * this.zoom) * dpr,
      (this.height / 2 + this.y * this.zoom) * dpr,
    );
  }

  /** Copy of the state that is saved inside the document. */
  toState(): { x: number; y: number; zoom: number } {
    return { x: this.x, y: this.y, zoom: this.zoom };
  }

  /** Restores a state saved in the document. Missing or broken values are ignored. */
  fromState(state: { x?: number; y?: number; zoom?: number } | undefined | null): void {
    if (!state) return;
    if (Number.isFinite(state.x)) this.x = state.x as number;
    if (Number.isFinite(state.y)) this.y = state.y as number;
    if (Number.isFinite(state.zoom)) this.setZoom(state.zoom as number);
  }
}

/**
 * Grid spacing that keeps the lines between `minPixels` and `maxPixels` apart
 * on screen. Steps follow 1, 2, 5, 10, 20, 50, ... so the numbers stay round.
 */
export function gridStep(zoom: number, minPixels = 48): number {
  const raw = minPixels / (zoom > 1e-9 ? zoom : 1e-9);
  const power = Math.pow(10, Math.floor(Math.log10(raw)));
  const rest = raw / power;
  const nice = rest <= 1 ? 1 : rest <= 2 ? 2 : rest <= 5 ? 5 : 10;
  return nice * power;
}
