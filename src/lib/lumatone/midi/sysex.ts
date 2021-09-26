import Sentence from 'sysex'

import { MANUFACTURER_ID, PAYLOAD_INIT } from './constants'
import type { CommandId, BoardIndex } from './constants'
import { ErrorId } from './errors'
export type EncodedSysex = number[]


// export function createSysEx(boardIndex: BoardIndex, cmd: Command, data1?: number, data2?: number, data3?: number, data4?: number): EncodedSysex {
//   const s = new Sentence(HEADER + 'boardIndex cmd data1 data2 data3 data4')
//   return s.encode({ boardIndex, cmd, data1: data1 ?? 0, data2: data2 ?? 0, data3: data3 ?? 0, data4: data4 ?? 0 })
// }

export function createSysEx(boardIndex: BoardIndex, cmd: CommandId, ...data: number[]): EncodedSysex {
  const dataStr = data.map(toTwoHexDigits).join(' ')  
  const s = new Sentence('boardIndex cmd ' + dataStr)
  return s.encode({ boardIndex, cmd })
}

/**
 * Creates a sysex message that sets a boolean toggle.
 */
 export function createSysExToggle(boardIndex: BoardIndex, cmd: CommandId, state: boolean): EncodedSysex {
  return createSysEx(boardIndex, cmd, state ? 1 : 0)
}

export function createExtendedKeyColourSysEx(boardIndex: BoardIndex, cmd: CommandId, keyIndex: number, red: number, green: number, blue: number): EncodedSysex {
  const s = new Sentence('boardIndex cmd keyIndex redUpper redLower greenUpper greenLower blueUpper blueLower')
  const colorPairs = toRGBPairs(red, green, blue)
  return s.encode({boardIndex, cmd, keyIndex, ...colorPairs })
}

export function createExtendedMacroColourSysEx(cmd: CommandId, red: number, green: number, blue: number): EncodedSysex {
  const s = new Sentence('00 cmd redUpper redLower greenUpper greenLower blueUpper blueLower')
  const colorPairs = toRGBPairs(red, green, blue)
  return s.encode({ cmd, ...colorPairs })
}

export function createTableSysEx(cmd: CommandId, table: number[]): EncodedSysex {
  const tableDigits = table.map(toTwoHexDigits).join(' ')
  const s = new Sentence('00 cmd ' + tableDigits)
  return s.encode({ cmd })
}

export function messageIsResponseToMessage(outgoing: EncodedSysex, incoming: EncodedSysex): boolean {
  if (outgoing.length < 5 || incoming.length < 5) {
    return false
  }
  // responses have the same manufacturer id, board index, and command id, so the first 5 bytes will
  // be equal
  for (let i = 0; i < 5; i++) {
    if (outgoing[i] !== incoming[i]) {
      return false
    }
  }
  return true
}

export function fromMidiData(data: Uint8Array): EncodedSysex {
  return [...data]
}

export function isLumatoneMessage(msg: Uint8Array | EncodedSysex) {
  if (msg instanceof Uint8Array) {
    msg = fromMidiData(msg)
  }
  if (msg.length < 3) {
    return false
  }
  for (let i = 0; i < 3; i++) {
    if (msg[i] !== MANUFACTURER_ID[i]) {
      return false
    }
  }
  return true
}

export function validatePayloadLength(msg: EncodedSysex, length: number): ErrorId {
  const expected = PAYLOAD_INIT + length
  if (msg.length === expected) {
    return ErrorId.NoError
  }
  if (msg.length < expected) {
    return ErrorId.MessageTooShort
  }
  return ErrorId.MessageTooLong
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
