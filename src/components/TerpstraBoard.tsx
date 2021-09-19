import React, { useContext } from 'react'
import { Scale, Note, Interval } from '@tonaljs/tonal'

import type { HexColor, Point } from '../types'
import { hexagonPoints } from '../lib/drawing'
import Palette from '../lib/Palette'
import HarmonicContext from '../context/harmonic'

/**
 * OffsetCoord is a point on the hex grid in "offset coordinates," using the "odd-r" layout described
 * here: https://www.redblobgames.com/grids/hexagons/#coordinates
 */
interface OffsetCoord {
  q: number,
  r: number,
}

const stringifyCoord = (coord: OffsetCoord): string => `${coord.q},${coord.r}`

class CoordinateMap<V> {
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

class KeyCoordinates { 
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
  
    KeyCoordinates.#keyCoords = [
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

    KeyCoordinates.#coordToKeyNum = {}
    for (let keyNum = 0; keyNum < KeyCoordinates.#keyCoords.length; keyNum++) {
      const coord = KeyCoordinates.#keyCoords[keyNum]
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

interface KeyDefinition {
  note: string, // TODO: maybe use Note type from tonaljs
}

type KeyGenerator = Generator<KeyDefinition>

// const generatorIntervals = ['2m', '4P', '5P', '7M']
function *twelveToneGenerator(stepInterval: string = '5P', startNote: string = 'C'): KeyGenerator {
  // if (!generatorIntervals.includes(stepInterval)) {
  //   throw new Error(`Invalid interval. Valid options: ${generatorIntervals.join(', ')}`)
  // }
  const semisPerStep = Interval.semitones(stepInterval)!
  let semitones = 0
  let allNotes = new Set()
  while (true) {
    const note = Note.simplify(Note.transpose(startNote, Interval.fromSemitones(semitones)))
    if (allNotes.add(note)) {
      console.log('notes', allNotes)
    }

    yield { note }
    semitones += semisPerStep
    if (semitones >= 12) {
      semitones -= 12
    }
  }
}


class RectangularToneMap {
  #coords: CoordinateMap<KeyDefinition> = new CoordinateMap()

  constructor(props: {gen: KeyGenerator, oddGen?: KeyGenerator, cols?: number, rows?: number}) {
    const cols = props.cols || 6
    const rows = props.rows || 11
    const { gen } = props
    const oddGen = props.oddGen || gen

    for (let r = 0; r < rows; r++) {
      for (let q = 0; q < cols; q++) {
        let definition
        if ((r % 2) === 0) {
          definition = gen.next().value
        } else {
          definition = oddGen.next().value
        }
        this.#coords.set({ q, r }, definition)
      }
    }
  }

  get(c: OffsetCoord): KeyDefinition|undefined {
    return this.#coords.get(c)
  }
}

interface LabelDef {
  center: Point,
  text: string,
  color: HexColor,
}

/**
 * A 56-key arrangement of hexagonal keys - one fifth of a full lumatone layout.
 */
export default function TerpstraBoard(props: { boardIndex?: number, tx?: number, ty?: number }): React.ReactElement {
  const keyDiameter = 30
  const keyMargin = 2
  const geo = new BoardGeometry({ keyDiameter, keyMargin, })
  const width = 1000
  const height = 1000

  const boardIndex = props.boardIndex || 0

  const { scaleName, tonicNote } = useContext(HarmonicContext)
  const scale = Scale.get([tonicNote, scaleName].join(' '))
  console.log('board scale: ', scale)

  const generatorInterval = '2M'
  const boardShift = 0

  const startNote = Note.transpose('C', Interval.fromSemitones(boardShift * boardIndex))
  const toneMap = new RectangularToneMap({
    gen: twelveToneGenerator(generatorInterval, startNote),
    oddGen: twelveToneGenerator(generatorInterval, Note.transpose(startNote, Interval.fromSemitones(1)))
  })
  const coords = KeyCoordinates.allCoordinates()
  const palette = new Palette(12)

  const keyProps = coords
    .map(c => {
      const def = toneMap.get(c)
      // console.log('key def for coord', c, def)
      if (!def) {
        return null
      }
      const points = geo.hexPath(c)
      const key = stringifyCoord(c)
      const fill = palette.colorForNoteName(def.note, scale)
      const label = {
        text: def.note,
        color: 'black',
        center: geo.centerPoint(c),
      }
      return { points, key, fill, stroke: 'black', label }
    })
    .filter(p => p != null)

  // @ts-ignore
  const keys = keyProps.map(({ label, key, ...polygonProps }) => 
    <g key={key}>
      <polygon {...polygonProps} />
      <text x={label.center.x} y={label.center.y} textAnchor="middle" stroke={label.color} fill={label.color}>
        {label.text}
      </text>
    </g>
  )
  // console.log('keys', keys)

  const rot = -17.42 // matches the angle in the lumatone editor gui

  const xOffset = -202.5 * boardIndex
  const yOffset = -7.5 * boardIndex
  const tx = xOffset
  let ty = yOffset
  const boardTy = 100 // FIXME: this is just to account for clipping after rotation. could be cleaner
  const transform = `rotate(${rot}) translate(0, ${boardTy})`
  return <svg width={width} height={height} transform={`translate(${tx}, ${ty})`}>
    <g transform={transform}>
      {keys}
    </g>

  </svg>
}