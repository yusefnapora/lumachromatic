
import type { RXBArray } from './lib/RXB'
import type { Note, Scale } from '@tonaljs/tonal'

interface ChromaSpace {
  /** number of equal divisions per "octave". Defaults to 12 for 12-tone equal temperment. */
  tonesPerPeriod?: number,


}

export type HexColor = string
