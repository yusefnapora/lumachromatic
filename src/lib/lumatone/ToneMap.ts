import { Note, Interval } from '@tonaljs/tonal'
import { CoordinateMap } from '../coordinates'
import type { OffsetCoord } from '../../types'

export interface KeyDefinition {
  note: string, // TODO: maybe use Note type from tonaljs
}

export interface ToneMap {
  get(c: OffsetCoord): KeyDefinition|undefined
}

export type KeyGenerator = Generator<KeyDefinition>

// const generatorIntervals = ['2m', '4P', '5P', '7M']
export function *twelveToneGenerator(stepInterval: string = '5P', startNote: string = 'C'): KeyGenerator {
  // if (!generatorIntervals.includes(stepInterval)) {
  //   throw new Error(`Invalid interval. Valid options: ${generatorIntervals.join(', ')}`)
  // }
  const semisPerStep = Interval.semitones(stepInterval)!
  let semitones = 0
  let allNotes = new Set()
  while (true) {
    const note = Note.simplify(Note.transpose(startNote, Interval.fromSemitones(semitones)))
    if (allNotes.add(note)) {
      // console.log('notes', allNotes)
    }

    yield { note }
    semitones += semisPerStep
    if (semitones >= 12) {
      semitones -= 12
    }
  }
}




export class RectangularToneMap implements ToneMap {
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