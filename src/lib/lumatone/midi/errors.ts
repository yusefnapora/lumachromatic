

enum FirmwareError {
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

