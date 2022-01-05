import { CommandId, CMD_ID, PAYLOAD_INIT } from './constants'
import { ErrorId } from './errors';
import { EncodedSysex, isLumatoneMessage, validatePayloadLength } from './sysex';

export type Result<T> = Ok<T> | ErrorResult
export type Ok<T> = { value: T }
export type ErrorResult = { error: ErrorId }

export const isOk = <T>(r: Result<T>): r is Ok<T> => ('value' in r)


export type PingResponse = { pingId: number }
export const decodePing = (msg: EncodedSysex): Result<PingResponse>  => {
  if (!isLumatoneMessage(msg)) {
    return { error: ErrorId.MessageHasIncorrectManufacturerId }
  }
  let err = validatePayloadLength(msg, 4)
  if (err != ErrorId.NoError) {
    return { error: err }
  }
  if (msg[CMD_ID] !== CommandId.LUMA_PING) {
    return { error: ErrorId.MessageIsNotResponseToCommand }
  }
  const payload = msg.slice(PAYLOAD_INIT, 4)
  const pingId = (payload[1] << 14) | (payload[2] << 7) | (payload[3])
  return { value: { pingId } }
}

function unpack7BitPayload(payload: number[]|Uint8Array): number[] {
  return [...payload]
}

function unpack8BitPayload(payload: number[]|Uint8Array): number[] {
  const unpacked = []
  for (let i = 0; i < payload.length - 1; i++) {
    const byte = (payload[i] << 4) | payload[i+1]
    unpacked.push(byte)
  }
  return unpacked
}


// TODO: implement decoders for other responses

