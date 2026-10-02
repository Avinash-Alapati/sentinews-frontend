/**
 * Isometric projection utilities for SentiNews 2D Canvas visualization.
 * Uses standard 2:1 isometric projection math:
 * - X-axis projects down-right (screenX increases, screenY increases)
 * - Z-axis projects down-left  (screenX decreases, screenY increases)
 * - Y-axis projects straight up (screenY decreases)
 */

export const TILE_W_HALF = 48; // Half the width of one isometric tile
export const TILE_H_HALF = 24; // Half the height of one isometric tile (2:1 ratio)
export const ISO_HEIGHT = 32;  // Screen pixels per 1 unit of scene Y height

export interface IsoPoint2D {
  screenX: number;
  screenY: number;
}

/**
 * Projects a 3D isometric coordinate (x, y, z) into 2D canvas screen space.
 */
export function isoProject(
  x: number,
  y: number,
  z: number,
  originX: number,
  originY: number
): IsoPoint2D {
  const screenX = originX + (x - z) * TILE_W_HALF;
  const screenY = originY + (x + z) * TILE_H_HALF - y * ISO_HEIGHT;
  return { screenX, screenY };
}

export interface IsoBoxColors {
  top: string;
  left: string;
  right: string;
  strokeTop?: string;
  strokeLeft?: string;
  strokeRight?: string;
  lineWidth?: number;
}

/**
 * Draws a complete 3D isometric box with top, left, and right visible faces.
 */
export function drawIsoBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  z: number,
  y: number,
  w: number,
  d: number,
  h: number,
  colors: IsoBoxColors,
  originX: number,
  originY: number
): void {
  if (h <= 0.001) return;

  const lw = colors.lineWidth ?? 0.5;

  // 1. Right Face (X = x + w plane, facing down-right / viewer right)
  // Corners in 3D: (x+w, y, z) -> (x+w, y, z+d) -> (x+w, y+h, z+d) -> (x+w, y+h, z)
  const r0 = isoProject(x + w, y, z, originX, originY);
  const r1 = isoProject(x + w, y, z + d, originX, originY);
  const r2 = isoProject(x + w, y + h, z + d, originX, originY);
  const r3 = isoProject(x + w, y + h, z, originX, originY);

  ctx.beginPath();
  ctx.moveTo(r0.screenX, r0.screenY);
  ctx.lineTo(r1.screenX, r1.screenY);
  ctx.lineTo(r2.screenX, r2.screenY);
  ctx.lineTo(r3.screenX, r3.screenY);
  ctx.closePath();
  ctx.fillStyle = colors.right;
  ctx.fill();
  if (colors.strokeRight) {
    ctx.strokeStyle = colors.strokeRight;
    ctx.lineWidth = lw;
    ctx.stroke();
  }

  // 2. Left Face (Z = z + d plane, facing down-left / viewer left)
  // Corners in 3D: (x, y, z+d) -> (x+w, y, z+d) -> (x+w, y+h, z+d) -> (x, y+h, z+d)
  const l0 = isoProject(x, y, z + d, originX, originY);
  const l1 = isoProject(x + w, y, z + d, originX, originY);
  const l2 = isoProject(x + w, y + h, z + d, originX, originY);
  const l3 = isoProject(x, y + h, z + d, originX, originY);

  ctx.beginPath();
  ctx.moveTo(l0.screenX, l0.screenY);
  ctx.lineTo(l1.screenX, l1.screenY);
  ctx.lineTo(l2.screenX, l2.screenY);
  ctx.lineTo(l3.screenX, l3.screenY);
  ctx.closePath();
  ctx.fillStyle = colors.left;
  ctx.fill();
  if (colors.strokeLeft) {
    ctx.strokeStyle = colors.strokeLeft;
    ctx.lineWidth = lw;
    ctx.stroke();
  }

  // 3. Top Face (Y = y + h plane, facing up)
  // Corners in 3D: (x, y+h, z) -> (x+w, y+h, z) -> (x+w, y+h, z+d) -> (x, y+h, z+d)
  const t0 = isoProject(x, y + h, z, originX, originY);
  const t1 = isoProject(x + w, y + h, z, originX, originY);
  const t2 = isoProject(x + w, y + h, z + d, originX, originY);
  const t3 = isoProject(x, y + h, z + d, originX, originY);

  ctx.beginPath();
  ctx.moveTo(t0.screenX, t0.screenY);
  ctx.lineTo(t1.screenX, t1.screenY);
  ctx.lineTo(t2.screenX, t2.screenY);
  ctx.lineTo(t3.screenX, t3.screenY);
  ctx.closePath();
  ctx.fillStyle = colors.top;
  ctx.fill();
  if (colors.strokeTop) {
    ctx.strokeStyle = colors.strokeTop;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}
