

export type Point = { x: number, y: number }

export type HexColor = string

export interface HarmonicParams {
  tonicNote: string,
  scaleName: string,
}


/**
 * OffsetCoord is a point on the hex grid in "offset coordinates," using the "odd-r" layout described
 * here: https://www.redblobgames.com/grids/hexagons/#coordinates
 */
export interface OffsetCoord {
  q: number,
  r: number,
}