import type { Point, OffsetCoord } from '../../types'
import { hexagonPoints } from '../drawing'
import { KeyCoordinates } from '../coordinates'


export interface BoardGeometryProps {
  keyDiameter: number, // indiameter of individual hex key, or distance from center to any corner
  keyMargin?: number,  // spacing to add between keys, if any. defaults to zero
  origin?: Point,      // location of top-left point to begin layout from. defaults to 0,0
}

export class BoardGeometry {
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
    const y = c.y - (coord.r * strideH)

    return this._withOrigin({ x, y })
  }

  allKeyCenterPoints(): Point[] {
    return KeyCoordinates.allCoordinates().map(this.centerPoint)
  }

  hexPath(coord: OffsetCoord): string {
    const center = this.centerPoint(coord)
    return hexagonPoints(center, this.#keyDiameter)
  }

  _withOrigin(pt: Point): Point {
    return { x: pt.x + this.#origin.x, y: pt.y + this.#origin.y }
  }
}