
import { CMD_ID, BOARD_IND, MANUFACTURER_ID, PAYLOAD_INIT } from './constants'
import type { CommandId, BoardIndex } from './constants'
import { ErrorId, FirmwareError } from './errors'
export type EncodedSysex = number[] | Uint8Array


// FIXME: the sysex module seems to have some kind of circular import internnally that vite's production bundler doesn't like
// Either replace sysex with hand-rolled encoder or figure out the bundler issue

// import Sentence from 'sysex'
class Sentence {
  constructor(s: string) {

  }

  encode(args: any) {
    return new Uint8Array()
  }
}

/**
 * Creates a sysex command payload representing a lumatone command.
 * 
 * @param boardIndex lumatone board index, with 0 indicating the "server" board responsible for global operations.
 * @param cmd command id
 * @param data command-specific data. each array element will be truncated to 0x7F to fit into midi range.
 * @returns encoded sysex message as number[]
 */
export function createSysex(boardIndex: BoardIndex, cmd: CommandId, ...data: number[]): EncodedSysex {
  const dataStr = data.map(toTwoHexDigits).join(' ')  
  const s = new Sentence('boardIndex cmd ' + dataStr)
  return s.encode({ boardIndex, cmd })
}

/**
 * Creates a sysex message that sets a boolean toggle.
 * @param boardIndex lumatone board index, with 0 indicating the "server" board responsible for global operations.
 * @param cmd command id
 * @param state toggle value
 * @returns encoded sysex message as number[]
 */
 export function createSysexToggle(boardIndex: BoardIndex, cmd: CommandId, state: boolean): EncodedSysex {
  return createSysex(boardIndex, cmd, state ? 1 : 0)
}

/**
 * Creates a sysex message that encodes an RGB colour triplet into three pairs of 4-bit values, for setting the color value of a specific key.
 * @param boardIndex lumatone board index, with 0 indicating the "server" board responsible for global operations.
 * @param cmd command id
 * @param keyIndex key index. range: [0, 55]
 * @param red red colour component. range: [0, 0xFF]
 * @param green green colour component. range: [0, 0xFF]
 * @param blue blue colour component. range: [0, 0xFF]
 * @returns encoded sysex message as number[]
 */
export function createExtendedKeyColourSysex(boardIndex: BoardIndex, cmd: CommandId, keyIndex: number, red: number, green: number, blue: number): EncodedSysex {
  const s = new Sentence('boardIndex cmd keyIndex redUpper redLower greenUpper greenLower blueUpper blueLower')
  const colorPairs = toRGBPairs(red, green, blue)
  return s.encode({boardIndex, cmd, keyIndex, ...colorPairs })
}

/**
 * Creates a sysex message that sets one of the global "macro" button colors (preset buttons).
 * @param cmd command id
 * @param red red colour component. range: [0, 0xFF]
 * @param green green colour component. range: [0, 0xFF]
 * @param blue blue colour component. range: [0, 0xFF]
 * @returns encoded sysex message as number[]
 */
export function createExtendedMacroColourSysex(cmd: CommandId, red: number, green: number, blue: number): EncodedSysex {
  const s = new Sentence('00 cmd redUpper redLower greenUpper greenLower blueUpper blueLower')
  const colorPairs = toRGBPairs(red, green, blue)
  return s.encode({ cmd, ...colorPairs })
}

/**
 * Creates a command that sends tabular data. Size of data table is command-specific.
 * @param cmd command id
 * @param table table data as a linear array
 * @returns encoded sysex message as number[]
 */
export function createTableSysex(cmd: CommandId, table: number[]): EncodedSysex {
  const tableDigits = table.map(toTwoHexDigits).join(' ')
  const s = new Sentence('00 cmd ' + tableDigits)
  return s.encode({ cmd })
}

/**
 * Checks whether a recieved message has the correct response type for the given outgoing messsage.
 * @param outgoing an encoded sysex command message
 * @param incoming an encoded sysex response message
 * @returns true if `incoming` is a valid response to `outgoing`
 */
export function messageIsResponseToMessage(outgoing: EncodedSysex, incoming: EncodedSysex): boolean {
  if (!isLumatoneMessage(incoming)) {
    return false
  }

  // outgoing messages don't include manufacturer id header,
  // so we prepend it here to make comparison simpler
  const o = [...MANUFACTURER_ID, ...outgoing]

  return o[CMD_ID] === incoming[CMD_ID] && o[BOARD_IND] === incoming[BOARD_IND]
}

/**
 * @param msg a sysex message payload
 * @returns 
 */
export function isLumatoneMessage(msg: EncodedSysex) {
  if (msg.length < MANUFACTURER_ID.length) {
    return false
  }
  for (let i = 0; i < 3; i++) {
    if (msg[i] !== MANUFACTURER_ID[i]) {
      return false
    }
  }
  return true
}

/**
 * Checks if a message payload has the expected length
 * @param msg a recieved message
 * @param length the length of the payload (length of message, excluding manufacturer id, board index, and command id)
 * @returns ErrorId.NoError if payload has expected length, MessageTooShort or MessageTooLong otherwise.
 */
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

/**
 * Gets the command id out of a sysex message
 * @param msg the message to check
 * @returns a command id
 */
export function getCommandId(msg: EncodedSysex): CommandId {
  if (msg.length <= CMD_ID) {
    throw new FirmwareError(ErrorId.MessageTooShort)
  }
  return msg[CMD_ID]
}

export function getBoardIndex(msg: EncodedSysex): BoardIndex {
  if (msg.length <= BOARD_IND) {
    throw new FirmwareError(ErrorId.MessageTooShort)
  }
  return msg[BOARD_IND]
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
