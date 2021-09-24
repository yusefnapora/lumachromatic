import Sentence from 'sysex'

import type { Command, BoardIndex } from './constants'
export type EncodedSysex = number[]

// manufacturer info
const HEADER = '00 21 50 '

// export function createSysEx(boardIndex: BoardIndex, cmd: Command, data1?: number, data2?: number, data3?: number, data4?: number): EncodedSysex {
//   const s = new Sentence(HEADER + 'boardIndex cmd data1 data2 data3 data4')
//   return s.encode({ boardIndex, cmd, data1: data1 ?? 0, data2: data2 ?? 0, data3: data3 ?? 0, data4: data4 ?? 0 })
// }

export function createSysEx(boardIndex: BoardIndex, cmd: Command, ...data: number[]): EncodedSysex {
  const dataStr = data.map(toTwoHexDigits).join(' ')  
  const s = new Sentence(HEADER + 'boardIndex cmd ' + dataStr)
  return s.encode({ boardIndex, cmd })
}

/**
 * Creates a sysex message that sets a boolean toggle.
 */
 export function createSysExToggle(boardIndex: BoardIndex, cmd: Command, state: boolean): EncodedSysex {
  return createSysEx(boardIndex, cmd, state ? 1 : 0)
}

export function createExtendedKeyColourSysEx(boardIndex: BoardIndex, cmd: Command, keyIndex: number, red: number, green: number, blue: number): EncodedSysex {
  const s = new Sentence(HEADER + 'boardIndex cmd keyIndex redUpper redLower greenUpper greenLower blueUpper blueLower')
  const colorPairs = toRGBPairs(red, green, blue)
  return s.encode({boardIndex, cmd, keyIndex, ...colorPairs })
}

export function createExtendedMacroColourSysEx(cmd: Command, red: number, green: number, blue: number): EncodedSysex {
  const s = new Sentence(HEADER + '00 cmd redUpper redLower greenUpper greenLower blueUpper blueLower')
  const colorPairs = toRGBPairs(red, green, blue)
  return s.encode({ cmd, ...colorPairs })
}

export function createTableSysEx(cmd: Command, table: number[]): EncodedSysex {
  const tableDigits = table.map(toTwoHexDigits).join(' ')
  const s = new Sentence(HEADER + '00 cmd ' + tableDigits)
  return s.encode({ cmd })
}


// --- helpers

type RGB4BitPairs = { redUpper: number, redLower: number, greenUpper: number, greenLower: number, blueUpper: number, blueLower: number }
function toRGBPairs(red: number, green: number, blue: number): RGB4BitPairs {
  const redUpper = red >> 4
  const redLower = red & 0xf
  const greenUpper = green >> 4
  const greenLower = green & 0xf
  const blueUpper = blue >> 4
  const blueLower = blue & 0xf
  return { redUpper, redLower, greenUpper, greenLower, blueUpper, blueLower }
}

function toTwoHexDigits(n: number): string {
  n = n & 0x7F // restrict to midi range 
  return n.toString(16).padStart(2, '0')
}
