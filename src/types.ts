import type { Scale as ScaleT } from '@tonaljs/scale'
import { BoardGeometry } from './lib/lumatone/BoardGeometry'
import { RXBArray } from './lib/RXB'

export type Point = { x: number; y: number }
export type Size = { w: number; h: number }
export type Rect = { origin: Point; size: Size }

export type HexColor = string

export interface HarmonicParams {
  scale: ScaleT
}

export interface ColorParams {
  palette: IPalette
}

export interface MappingParams {
  toneMap: ToneMap
}

export interface BoardParams {
  keyDiameter: number
  keyMargin: number
  numBoards: number

  geometry: BoardGeometry
}

export interface AllParams {
  harmonic: HarmonicParams
  color: ColorParams
  mapping: MappingParams
  board: BoardParams
}

/**
 * OffsetCoord is a point on the hex grid in "offset coordinates," using the "odd-r" layout described
 * here: https://www.redblobgames.com/grids/hexagons/#coordinates
 */
export interface OffsetCoord {
  q: number
  r: number
}

export interface IPalette {
  divisions: Readonly<number>
  rainbow: RXBArray[]

  primary(index: number): HexColor
  complementary(index: number, value: number): HexColor
  neutrals(index: number, value: number, count?: number): HexColor[]
  colorForNoteName(
    noteName: string,
    scale: ScaleT | undefined
  ): HexColor | undefined
}

export interface KeyDefinition {
  note: string // TODO: maybe use Note type from tonaljs
}

export interface ToneMap {
  get(c: OffsetCoord): KeyDefinition | undefined

  transposed(semitones: number): ToneMap
}

export type KeyGenerator = Generator<KeyDefinition>
