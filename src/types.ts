import type { Scale as ScaleT } from '@tonaljs/scale'

export type Point = { x: number, y: number }
export type Size = { w: number, h: number }
export type Rect = { origin: Point, size: Size }

export type HexColor = string

export interface HarmonicParams {
  scale: ScaleT
}


/**
 * OffsetCoord is a point on the hex grid in "offset coordinates," using the "odd-r" layout described
 * here: https://www.redblobgames.com/grids/hexagons/#coordinates
 */
export interface OffsetCoord {
  q: number,
  r: number,
}