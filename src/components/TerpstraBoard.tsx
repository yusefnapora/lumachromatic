import React from 'react'

import HexKey from './HexKey'
import type { HexColor, Point } from '../types'
import { hexagonPoints } from '../lib/drawing'
import Palette from '../lib/Palette'

/**
 * OffsetCoord is a point on the hex grid in "offset coordinates," using the "odd-r" layout described
 * here: https://www.redblobgames.com/grids/hexagons/#coordinates
 */
interface OffsetCoord {
  q: number,
  r: number,
}

const stringifyCoord = (coord: OffsetCoord): string => `${coord.q},${coord.r}`

class CoordinateMap { 
  static #keyCoords: OffsetCoord[]
  static #coordToKeyNum: Record<string, number>

  private static _initialize = (() => {
    const row = (r: number, numCols: number, startCol: number = 0): OffsetCoord[] => {
      const points = []
      const endCol = startCol + numCols
      for (let q = startCol; q < endCol; q++) {
        points.push({q, r})
      }
      return points
    }
  
    CoordinateMap.#keyCoords = [
      ...row(0, 2),       //  <><>
      ...row(1, 5),       //   <><><><><>
      ...row(2, 6),       //  <><><><><><>
      ...row(3, 6),       //   <><><><><><>
      ...row(4, 6),       //  <><><><><><>
      ...row(5, 6),       //   <><><><><><>
      ...row(6, 6),       //  <><><><><><>
      ...row(7, 6),       //   <><><><><><>
      ...row(8, 6),       //  <><><><><><>
      ...row(9, 5, 1),    //     <><><><><>
      ...row(10, 2, 4),   //          <><>
    ]

    CoordinateMap.#coordToKeyNum = {}
    for (let keyNum = 0; keyNum < CoordinateMap.#keyCoords.length; keyNum++) {
      const coord = CoordinateMap.#keyCoords[keyNum]
      this.#coordToKeyNum[stringifyCoord(coord)] = keyNum
    }

  })()

  static coord(key: number): OffsetCoord|undefined {
    if (key < 0 || key >= this.#keyCoords.length){
      throw new Error(`key number ${key} out of range. Valid range: 0-${this.#keyCoords.length}.`)
    }
    return this.#keyCoords[key]
  }

  static allCoordinates(): OffsetCoord[] {
    return this.#keyCoords
  }

  static keyNumber(coord: OffsetCoord): number|undefined {
    return this.#coordToKeyNum[stringifyCoord(coord)]
  }
}



interface BoardGeometryProps {
  keyDiameter: number, // indiameter of individual hex key, or distance from center to any corner
  keyMargin?: number,  // spacing to add between keys, if any. defaults to zero
  origin?: Point,      // location of top-left point to begin layout from. defaults to 0,0
}


class BoardGeometry {
  #keyDiameter: number
  #keyMargin: number
  #origin: Point
  #keyWidth: number
  #keyHeight: number

  constructor(props: BoardGeometryProps) {
    this.#keyDiameter = props.keyDiameter
    this.#keyMargin = props.keyMargin || 0
    this.#origin = props.origin || { x: 0, y: 0 }
    this.#keyWidth = Math.sqrt(3) * this.#keyDiameter
    this.#keyHeight = this.#keyDiameter * 2
  }

  centerPoint(coord: OffsetCoord): Point {
    // center point of "unit key", or key at 0,0
    const c = { 
      x: this.#keyMargin + (this.#keyWidth / 2), 
      y: this.#keyMargin + (this.#keyHeight / 2)
    }

    const strideW = this.#keyWidth + this.#keyMargin
    const strideH = (this.#keyHeight * 0.75) + this.#keyMargin
    const rowOffset = (coord.r % 2 === 0) ? 0 : (strideW / 2)

    const x = c.x + rowOffset + (coord.q * strideW)
    const y = c.y + (coord.r * strideH)

    return this._withOrigin({ x, y })
  }

  allKeyCenterPoints(): Point[] {
    return CoordinateMap.allCoordinates().map(this.centerPoint)
  }

  hexPath(coord: OffsetCoord): string {
    const center = this.centerPoint(coord)
    return hexagonPoints(center, this.#keyDiameter)
  }

  _withOrigin(pt: Point): Point {
    return { x: pt.x + this.#origin.x, y: pt.y + this.#origin.y }
  }
}

interface KeyDefinition {
  color: HexColor,
  label?: string,
  note?: string, // TODO
}

/**
 * Keymap for a single 56-key terpstra board.
 */
class BoardKeymap {
  // #definitions: KeyDefinition[]

  // static fromMap()
}

/**
 * A 56-key arrangement of hexagonal keys - one fifth of a full lumatone layout.
 */
export default function TerpstraBoard(): React.ReactElement {
  const keyDiameter = 30
  const keyMargin = 2
  const geo = new BoardGeometry({ keyDiameter, keyMargin, })
  const width = 1000
  const height = 1000

  // TODO: mappings, etc. for now, rainbow!
  const coords = CoordinateMap.allCoordinates()
  const palette = new Palette(coords.length)

  const keys = coords
    .map(c => <polygon 
      points={geo.hexPath(c)} key={stringifyCoord(c)} 
      fill={palette.primary(CoordinateMap.keyNumber(c)!)} 
      stroke="black" 
    />)

  const rot = -17.42 // matches the angle in the lumatone editor gui
  const translateY = 100 // FIXME: this is just to account for clipping after rotation. could be cleaner
  const transform = `rotate(${rot}) translate(0, ${translateY})`
  return <svg width={width} height={height} >
    <g transform={transform}>
      {keys}
    </g>

  </svg>
}