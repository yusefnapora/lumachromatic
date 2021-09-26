import { CommandId, CMD_ID, PAYLOAD_INIT } from './constants'
import { FirmwareError, ErrorId } from './errors';
import { EncodedSysex, isLumatoneMessage, validatePayloadLength } from './sysex';

export type PingResponse = { value: number }
export const decodePing = (msg: EncodedSysex): PingResponse  => {
  if (!isLumatoneMessage(msg)) {
    throw new FirmwareError(ErrorId.MessageHasIncorrectManufacturerId)
  }
  let err = validatePayloadLength(msg, 4)
  if (err != ErrorId.NoError) {
    throw new FirmwareError(err)
  }
  if (msg[CMD_ID] !== CommandId.LUMA_PING) {
    throw new FirmwareError(ErrorId.MessageIsNotResponseToCommand)
  }
  const payload = msg.slice(PAYLOAD_INIT, 4)
  const value = (payload[1] << 14) | (payload[2] << 7) | (payload[3])
  return { value }
}


