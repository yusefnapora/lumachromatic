import type { Scale as ScaleT } from '@tonaljs/scale'
import type { ToneMap } from './lib/lumatone/ToneMap'
import type Palette from './lib/Palette'

export type Point = { x: number, y: number }
export type Size = { w: number, h: number }
export type Rect = { origin: Point, size: Size }

export type HexColor = string

export interface HarmonicParams {
  scale: ScaleT
}

export interface ColorParams {
  palette: Palette,
}

export interface MappingParams {
  toneMap: ToneMap
}

export interface AllParams {
  harmonic: HarmonicParams,
  color: ColorParams,
  mapping: MappingParams,
}

/**
 * OffsetCoord is a point on the hex grid in "offset coordinates," using the "odd-r" layout described
 * here: https://www.redblobgames.com/grids/hexagons/#coordinates
 */
export interface OffsetCoord {
  q: number,
  r: number,
}