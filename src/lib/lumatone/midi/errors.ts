import decamelize from 'decamelize'

export class FirmwareError extends Error {
  errorId: ErrorId
  constructor(errorId: ErrorId, msg?: string) {
    super(errorMessage(errorId) + msg ? ' ' + msg : '')
    this.errorId = errorId
  }
}

export enum ErrorId {
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

export const errorMessage = (e: ErrorId): string => 
  toSentenceCase(ErrorId[e])

const toSentenceCase = (s: string): string => {
  const s2 = decamelize(s, { separator: ' ' })
  return s2.slice(0, 1) + s2.slice(1).toLowerCase()
}
