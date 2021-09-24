import decamelize from 'decamelize'

export enum FirmwareError {
  NoError = 0,
  NoMidiOutputSet,
  DeviceIsBusy,
  MessageTooShort,
  MessageTooLong,
  MessageIsAnEcho,
  MessageHasIncorrectManufacturerId,
  MessageHasInvalidBoardIndex,
  MessageHasInvalidStatusByte,
  MessageIsNotResponseToCommand,
  MessageIsNotSysEx,
  UnknownCommand,
  ExternalError
}

export const errorMessage = (e: FirmwareError): string => 
  toSentenceCase(FirmwareError[e])

const toSentenceCase = (s: string): string => {
  const s2 = decamelize(s, { separator: ' ' })
  return s2.slice(0, 1) + s2.slice(1).toLowerCase()
}
