import type { OffsetCoord } from '../types'

export const stringifyCoord = (coord: OffsetCoord): string => `${coord.q},${coord.r}`

export class CoordinateMap<V> {
  #m: Map<string, V> = new Map()


  set(c: OffsetCoord, v: V) {
    this.#m.set(stringifyCoord(c), v)
  }

  get(c: OffsetCoord): V | undefined {
    return this.#m.get(stringifyCoord(c))
  }

  get size(): number {
    return this.#m.size
  }
}

export class KeyCoordinates { 
  static #keyCoords: OffsetCoord[]
  static #coordToKeyNum: CoordinateMap<number>

  private static _initialize = (() => {
    const row = (r: number, numCols: number, startCol: number = 0): OffsetCoord[] => {
      const points = []
      const endCol = startCol + numCols
      for (let q = startCol; q < endCol; q++) {
        points.push({q, r})
      }
      return points
    }
  
    KeyCoordinates.#keyCoords = [
      ...row(0, 2),       //  <><>........
      ...row(1, 5),       //   <><><><><>..
      ...row(2, 6),       //  <><><><><><>
      ...row(3, 6),       //   <><><><><><>
      ...row(4, 6),       //  <><><><><><>
      ...row(5, 6),       //   <><><><><><>
      ...row(6, 6),       //  <><><><><><>
      ...row(7, 6),       //   <><><><><><>
      ...row(8, 6),       //  <><><><><><>
      ...row(9, 5, 1),    //   ..<><><><><>
      ...row(10, 2, 4),   //  ........<><>
    ]

    KeyCoordinates.#coordToKeyNum = new CoordinateMap()
    for (let keyNum = 0; keyNum < KeyCoordinates.#keyCoords.length; keyNum++) {
      const coord = KeyCoordinates.#keyCoords[keyNum]
      this.#coordToKeyNum.set(coord, keyNum)
      // console.log(`key ${keyNum}: ${stringifyCoord(coord)}`)
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
    return this.#coordToKeyNum.get(coord)
  }
}