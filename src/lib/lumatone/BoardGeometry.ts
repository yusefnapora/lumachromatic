import type { Point, OffsetCoord, Rect } from '../../types'
import { hexagonPoints, rotatedRectBounds } from '../drawing'
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

    const rowOffset = (coord.r % 2 === 0) ? 0 : (this.rowWidth / 2)

    const x = c.x + rowOffset + (coord.q * this.rowWidth)
    const y = c.y + (coord.r * this.rowHeight)

    return this._pointWithOrigin({ x, y })
  }

  allKeyCenterPoints(): Point[] {
    return KeyCoordinates.allCoordinates().map(this.centerPoint)
  }

  hexPath(coord: OffsetCoord): string {
    const center = this.centerPoint(coord)
    return hexagonPoints(center, this.#keyDiameter)
  }

  get keyHeight(): number {
    return this.#keyHeight
  }

  get keyWidth(): number {
    return this.#keyWidth
  }

  get rowHeight(): number {
    return (this.keyHeight * 0.75) + this.#keyMargin
  }

  get rowWidth(): number {
    return this.#keyWidth + this.#keyMargin
  }

  boardWidth(cols: number = 6): number {
    const w = this.#keyWidth + this.#keyMargin
    return (w * (cols + 0.5))
  }

  boardHeight(rows: number = 11): number {
    const h = (this.#keyHeight * 0.75) + this.#keyMargin
    return h * (rows + 0.5)
  }

  rotatedBoundingBox(rotationDegrees: number, cols: number = 6, rows: number = 11): Rect {
    const rect = { 
      origin: this.#origin, 
      size: { 
        w: this.boardWidth(cols),
        h: this.boardHeight(rows) 
      }
    }
    return rotatedRectBounds(rect, rotationDegrees)
  }

  withOrigin(pt: Point): BoardGeometry {
    return new BoardGeometry({ keyDiameter: this.#keyDiameter, keyMargin: this.#keyMargin, origin: pt })
  }

  withOffsetOrigin(pt: Point): BoardGeometry {
    const origin = { x: pt.x + this.#origin.x, y: pt.y + this.#origin.y }
    return this.withOrigin(origin)
  }

  _pointWithOrigin(pt: Point): Point {
    return { x: pt.x + this.#origin.x, y: pt.y + this.#origin.y }
  }
}