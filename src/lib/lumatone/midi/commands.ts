import { CommandId as C, BoardIndex, TEST_ECHO } from './constants'
import { createSysEx, createSysExToggle, createTableSysEx, createExtendedKeyColourSysEx, createExtendedMacroColourSysEx } from './sysex'
import type { EncodedSysex } from './sysex'

/**
 * CMD 00h: Send a single key's functionctional configuration
 */
 export const setKeyFunctionParameters = (boardIndex: BoardIndex, keyIndex: number, noteOrCCNum: number, midiChannel: number, keyType: number, faderUpIsNull: boolean): EncodedSysex => {
  midiChannel = (midiChannel - 1) & 0xf
  const typeByte = faderUpIsNull ? 
    (1 << 4) | keyType :
    keyType
  return createSysEx(boardIndex, C.CHANGE_KEY_NOTE, keyIndex, noteOrCCNum, midiChannel, typeByte)
}

/**
 * CMD 01h: Send a single key's LED channel intensities
 */
export const setKeyLightParameters = (boardIndex: BoardIndex, keyIndex: number, red: number, green: number, blue: number): EncodedSysex => 
  createExtendedKeyColourSysEx(boardIndex, C.SET_KEY_COLOUR, keyIndex, red, green, blue)

/**
 * CMD 02h: Save current configuration to specified preset index
 */
export const MIN_PRESET = 0
export const MAX_PRESET = 9
export const saveProgram = (presetNumber: number): EncodedSysex => {
  if (presetNumber < MIN_PRESET || presetNumber > MAX_PRESET) {
    throw new Error(`Invalid preset number. Range: [${MIN_PRESET}, ${MAX_PRESET}]`)
  }
  return createSysEx(BoardIndex.SERVER, C.SAVE_PROGRAM, presetNumber)
}

/**
 * CMD 03h: Send expression pedal sensivity
 */
export const setExpressionPedalSensivity = (value: number): EncodedSysex => 
  createSysEx(BoardIndex.SERVER, C.SET_FOOT_CONTROLLER_SENSITIVITY, value & 0x7f)


/**
 * CMD 04h: Send parametrization of foot controller
 */
export const invertFootController = (value: boolean): EncodedSysex => 
  createSysExToggle(BoardIndex.SERVER, C.INVERT_FOOT_CONTROLLER, value)

/**
 * CMD 05h: Colour for macro button in active state, 
 * each value should be in range of 0x0-0xF and represents the 
 * upper and lower four bytes of each channel intensity
 */
export const setMacroButtonActiveColour = (red: number, green: number, blue: number): EncodedSysex =>
  createExtendedMacroColourSysEx(C.MACROBUTTON_COLOUR_ON, red, green, blue)

/**
 * CMD 06h: Colour for macro button in inactive state,
 * each value should be in range of 0x0-0xF and represents
 * the upper and lower four bytes of each channel intensity
 */
export const setMacroButtonInactiveColour = (red: number, green: number, blue: number): EncodedSysex =>
createExtendedMacroColourSysEx(C.MACROBUTTON_COLOUR_OFF, red, green, blue)

/**
 * CMD 07h: Send parametrization of light on keystrokes
 */
export const setLightOnKeyStrokes = (active: boolean): EncodedSysex =>
  createSysExToggle(BoardIndex.SERVER, C.SET_LIGHT_ON_KEYSTROKES, active)

/**
 * CMD 08h: Send a value for a velocity lookup table
 */
export const setVelocityConfig = (velocityTable: number[]): EncodedSysex => {
  if (velocityTable.length !== 128) {
    throw new Error('Velocity table has invalid length. must be 128 elements')
  }
  // Values are in reverse order (shortest ticks count is the highest velocity)
  const reversedTable = []
  for (let i = 0; i < 128; i++) {
    reversedTable[i] = velocityTable[127 - i] & 0x7f
  }
  return createTableSysEx(C.SET_VELOCITY_CONFIG, reversedTable)
}

/**
 * CMD 09h: Save velocity config to EEPROM
 */
export const saveVelocityConfig: EncodedSysex =
  createSysEx(BoardIndex.SERVER, C.SAVE_VELOCITY_CONFIG)

/**
 * CMD 0Ah: Reset velocity config to value from EEPROM
 */
export const resetVelocityConfig: EncodedSysex =
  createSysEx(BoardIndex.SERVER, C.RESET_VELOCITY_CONFIG)

/**
 * CMD 0Bh: Adjust the internal fader look-up table (128 7-bit values)
 */
export const setFaderConfig = (faderTable: number[]): EncodedSysex => 
  createTableSysEx(C.SET_FADER_CONFIG, faderTable)

/**
 * CMD 0Ch: Save the changes made to the fader look-up table
 * @deprecated
 */
export const saveFaderConfiguration: EncodedSysex =
createSysEx(BoardIndex.SERVER, C.SAVE_FADER_CONFIG)

/**
 * CMD 0Dh: Reset the fader lookup table back to its factory fader settings.
 */
export const resetFaderConfig: EncodedSysex =
  createSysEx(BoardIndex.SERVER, C.RESET_FADER_CONFIG)

/**
 * CMD 0Eh: Enable or disable aftertouch functionality
 */
export const setAfterTouchActivation = (active: boolean): EncodedSysex =>
  createSysExToggle(BoardIndex.SERVER, C.SET_AFTERTOUCH_FLAG, active)

/**
 * CMD 0Fh: Initiate aftertouch calibration routine
 */
export const calibrateAfterTouch: EncodedSysex =
  createSysEx(BoardIndex.SERVER, C.CALIBRATE_AFTERTOUCH)

/**
 * CMD 10h: Adjust the internal aftertouch look-up table (size of 128)
 */
export const aftertouchConfig = (aftertouchTable: number[]): EncodedSysex => 
  createTableSysEx(C.SET_AFTERTOUCH_CONFIG, aftertouchTable)

/**
 * CMD 11h: Save the changes made to the aftertouch look-up table
 * @deprecated
 */
export const saveAftertouchConfig: EncodedSysex =
  createSysEx(BoardIndex.SERVER, C.SAVE_AFTERTOUCH_CONFIG)

/**
 * CMD 12h: Reset the aftertouch lookup table back to its factory aftertouch settings.
 */
export const resetAftertouchConfig: EncodedSysex =
  createSysEx(BoardIndex.SERVER, C.RESET_AFTERTOUCH_CONFIG)

/**
 * CMD 13h: Read back the current red intensity of all the keys of the target board.
 */
export const redLEDConfigRequest = (boardIndex: BoardIndex): EncodedSysex =>
  createSysEx(boardIndex, C.GET_RED_LED_CONFIG)

/**
 *  CMD 14h: Read back the current green intensity of all the keys of the target board.
 */
export const greenLEDConfigRequest = (boardIndex: BoardIndex): EncodedSysex =>
  createSysEx(boardIndex, C.GET_GREEN_LED_CONFIG)

/**
 * CMD 15h: Read back the current blue intensity of all the keys of the target board.
 */
export const blueLEDConfigRequest = (boardIndex: BoardIndex): EncodedSysex =>
  createSysEx(boardIndex, C.GET_BLUE_LED_CONFIG)

/**
 * CMD 16h: Read back the current channel configuration of all the keys of the target board.
 */
export const channelConfigRequest = (boardIndex: BoardIndex): EncodedSysex =>
  createSysEx(boardIndex, C.GET_CHANNEL_CONFIG)

/**
 * CMD 17h: Read back the current note configuration of all the keys of the target board.
 */
export const noteConfigRequest = (boardIndex: BoardIndex): EncodedSysex =>
  createSysEx(boardIndex, C.GET_NOTE_CONFIG)

/**
 * CMD 18h: Read back the current key type configuration of all the keys of the target board.
 */
export const keyTypeConfigRequest = (boardIndex: BoardIndex): EncodedSysex =>
  createSysEx(boardIndex, C.GET_KEYTYPE_CONFIG)

/**
 * CMD 19h: Read back the maximum threshold of all the keys of the target board.
 */
export const maxFaderThresholdRequest = (boardIndex: BoardIndex): EncodedSysex =>
  createSysEx(boardIndex, C.GET_MAX_THRESHOLD)

/**
 * CMD 1Ah: Read back the maximum threshold of all the keys of the target board
 */
 const minFaderThresholdRequest = (boardIndex: BoardIndex): EncodedSysex =>
  createSysEx(boardIndex, C.GET_MIN_THRESHOLD)

/**
 * CMD 1Bh: Read back the aftertouch maximum threshold of all the keys of the target board
 */
export const maxAftertouchThresholdRequest= (boardIndex: BoardIndex): EncodedSysex =>
  createSysEx(boardIndex, C.GET_AFTERTOUCH_MAX)

/**
 * CMD 1Ch: Get back flag whether or not each key of target board meets minimum threshold
 */
export const keyValidityParametersRequest = (boardIndex: BoardIndex): EncodedSysex =>
  createSysEx(boardIndex, C.GET_KEY_VALIDITY)

/**
 * CMD 1Dh: Read back the current velocity look up table of the keyboard.
 */
export const velocityConfigRequest: EncodedSysex =
  createSysEx(BoardIndex.SERVER, C.GET_VELOCITY_CONFIG)

/**
 * CMD 1Eh: Read back the current fader look up table of the keyboard.
 */
 const faderConfigRequest: EncodedSysex =
  createSysEx(BoardIndex.SERVER, C.GET_FADER_CONFIG)

/**
 * CMD 1Fh: Read back the current aftertouch look up table of the keyboard.
 */
export const aftertouchConfigRequest: EncodedSysex =
  createSysEx(BoardIndex.SERVER, C.GET_AFTERTOUCH_CONFIG)

/**
 * CMD 20h: Set the velocity interval table, 127 12-bit values
 */
export const setVelocityIntervalConfig = (velocityIntervalTable: number[]): EncodedSysex => {
  const formattedTable = []
  for (let i = 0; i < velocityIntervalTable.length; i++) {
    formattedTable[2*i]     = (velocityIntervalTable[i] >> 6) & 0x3f
    formattedTable[1 + 2*i] = velocityIntervalTable[i] & 0x3f
  }
  return createTableSysEx(C.SET_VELOCITY_INTERVALS, formattedTable)
}

/**
 * CMD 21h: Read back the velocity interval table
 */
export const velocityIntervalConfigRequest: EncodedSysex =
  createSysEx(BoardIndex.SERVER, C.GET_VELOCITY_INTERVALS)

/**
 * CMD 22h: Read back the fader type of all keys on the targeted board.
 */
export const faderTypeConfigRequest = (boardIndex: BoardIndex): EncodedSysex =>
  createSysEx(boardIndex, C.GET_FADER_TYPE_CONFIGURATION)

/**
 * CMD 23h: This command is used to read back the serial identification number of the keyboard.
 */
export const getSerialIdentityRequest: EncodedSysex =
  createSysEx(BoardIndex.SERVER, C.GET_SERIAL_IDENTITY, TEST_ECHO)

/**
 * CMD 24h: Initiate the key calibration routine; each pair of macro buttons  
 * on each octave must be pressed to return to normal state
 */
export const calibrateKeys: EncodedSysex =
  createSysEx(BoardIndex.SERVER, C.CALIBRATE_KEYS)

/**
 * CMD 25h: Pass in true to enter Demo Mode, or false to exit
 */
export const startDemoMode = (turnOn: boolean): EncodedSysex =>
  createSysExToggle(BoardIndex.SERVER, C.DEMO_MODE, turnOn)

/**
 * CMD 26h: Initiate the pitch and mod wheel calibration routine, pass in false to stop
 */
export const sendCalibratePitchModWheel = (startCalibration: boolean): EncodedSysex =>
  createSysExToggle(BoardIndex.SERVER, C.CALIBRATE_PITCH_MOD_WHEEL, startCalibration)

/**
 * CMD 27h: Set the sensitivity value of the mod wheel, 0x01 to 0x07f
 */
export const setModWheelSensitivity = (sensitivity: number): EncodedSysex => {
  if (sensitivity > 0x7f) sensitivity &= 0x7f  // Restrict to upper bound
  if (sensitivity < 0x01) sensitivity  = 0x01  // Restrict to lower bound
  return createSysEx(BoardIndex.SERVER, C.SET_MOD_WHEEL_SENSITIVITY, sensitivity)
}

/**
 * CMD 28h: Set the sensitivity value of the pitch bend wheel between 0x01 and 0x3FFF
 */
export const setPitchBendSensitivity = (sensitivity: number): EncodedSysex => {
  if (sensitivity > 0x3fff) sensitivity &= 0x3fff // Restrict to upper bound
  if (sensitivity < 0x0001) sensitivity  = 0x0001  // Restrict to lower bound
  return createSysEx(BoardIndex.SERVER, C.SET_PITCH_WHEEL_SENSITIVITY, sensitivity >> 7, sensitivity & 0x7f)
}

/**
 * CMD 29h: Set abs. distance from max value to trigger CA-004 submodule key events, ranging from 0x00 to 0xFE
 */
export const setKeyMaximumThreshold = (boardIndex: BoardIndex, maxThreshold: number, aftertouchMax: number): EncodedSysex => {
  if (maxThreshold  > 0xfe) maxThreshold  &= 0xfe
  if (aftertouchMax > 0xfe) aftertouchMax &= 0xfe
  return createSysEx(boardIndex, C.SET_KEY_MAX_THRESHOLD,
    maxThreshold >> 4, maxThreshold & 0xf, aftertouchMax >> 4, aftertouchMax & 0xf)
}

/**
 * CMD 2Ah: Set abs. distance from min value to trigger CA-004 submodule key events, ranging from 0x00 to 0xFE
 */
export const setKeyMinimumThreshold = (boardIndex: BoardIndex, minThresholdHigh: number, minThresholdLow: number): EncodedSysex => {
  if (minThresholdHigh > 0xfe) minThresholdHigh &= 0xfe
  if (minThresholdLow  > 0xfe) minThresholdLow  &= 0xfe
  return createSysEx(boardIndex, C.SET_KEY_MIN_THRESHOLD, 
    minThresholdHigh >> 4, minThresholdHigh & 0xf, minThresholdLow >> 4, minThresholdLow & 0xf)
}

/**
 * CMD 2Bh: Set the sensitivity for CC events, ranging from 0x00 to 0xFE
 */
export const setFaderKeySensitivity = (boardIndex: BoardIndex, sensitivity: number): EncodedSysex => {
  if (sensitivity > 0xfe) sensitivity &= 0xfe
  return createSysEx(boardIndex, C.SET_KEY_FADER_SENSITIVITY, sensitivity >> 4, sensitivity & 0xf)
}

/**
 * CMD 2Ch: Set the target board sensitivity for aftertouch events, ranging from 0x00 to 0xFE
 */
export const setAftertouchKeySensitivity = (boardIndex: BoardIndex, sensitivity: number): EncodedSysex => {
  if (sensitivity > 0xfe) sensitivity &= 0xfe
  return createSysEx(boardIndex, C.SET_KEY_AFTERTOUCH_SENSITIVITY, sensitivity >> 4, sensitivity & 0xf)
}

/**
 * CMD 2Dh: Adjust the Lumatouch table, a 128 byte array with value of 127 being a key fully pressed
 */
export const setLumatouchConfig = (lumatouchTable: number[]): EncodedSysex => 
  createTableSysEx(C.SET_LUMATOUCH_CONFIG, lumatouchTable)

/**
 * CMD 2Eh: Save Lumatouch table changes
 * @deprecated
 */
export const saveLumatoneConfig: EncodedSysex =
  createSysEx(BoardIndex.SERVER, C.SAVE_LUMATOUCH_CONFIG)

/**
 * CMD 2Fh: Reset the Lumatouch table back to factory settings
 */
export const resetLumatouchConfig: EncodedSysex =
  createSysEx(BoardIndex.SERVER, C.RESET_LUMATOUCH_CONFIG)

/**
 * CMD 30h: Read back the Lumatouch table
 */
export const lumatouchConfigRequest: EncodedSysex =
  createSysEx(BoardIndex.SERVER, C.GET_LUMATOUCH_CONFIG)

/**
 * CMD 31h: This command is used to read back the current Lumatone firmware revision.
 */
export const getFirmwareRevisionRequest: EncodedSysex =
  createSysEx(BoardIndex.SERVER, C.GET_FIRMWARE_REVISION)

/**
 * CMD 32h: Set the thresold from key’s min value to trigger CA - 004 submodule CC events, ranging from 0x00 to 0xFE
 */
export const setCCActiveThreshold = (boardIndex: BoardIndex, sensitivity: number): EncodedSysex => {
  if (sensitivity > 0xfe) sensitivity &= 0xfe
  return createSysEx(boardIndex, C.SET_CC_ACTIVE_THRESHOLD, sensitivity >> 4, sensitivity & 0xf)
}


/**
 * CMD 33h: Echo the payload, 0x00-0x7f, for use in connection monitoring
 */
export const ping = (value: number): EncodedSysex => {
  value &= 0xFFFFFFF; // Limit 28-bits
  return createSysEx(BoardIndex.SERVER, C.LUMA_PING, TEST_ECHO,
    (value >> 14) & 0x7f,
    (value >> 7) & 0x7f, 
    value & 0x7f
  )
}

/**
 * CMD 34h: Reset the thresholds for events and sensitivity for CC & aftertouch on the target board
 */
export const resetBoardThresholds = (boardIndex: BoardIndex): EncodedSysex =>
  createSysEx(boardIndex, C.RESET_BOARD_THRESHOLDS)

/**
 * CMD 35h: Enable/disable key sampling over SSH for the target key and board
 */
export const setKeySampling = (boardIndex: BoardIndex, turnSamplingOn: boolean): EncodedSysex => 
  createSysExToggle(boardIndex, C.SET_KEY_SAMPLING, turnSamplingOn)

/**
 * CMD 36h: Set thresholds for the pitch and modulation wheel to factory settings
 */
export const resetWheelsThresholds: EncodedSysex =
  createSysEx(BoardIndex.SERVER, C.RESET_WHEELS_THRESHOLD)


/**
 * CMD 37h: Set the bounds from the calibrated zero adc value of the pitch wheel, 0x00 to 0x7f
 */
export const setPitchWheelZeroThreshold = (threshold: number): EncodedSysex => {
  if (threshold > 0x7f) threshold &= 0x7f
  return createSysEx(BoardIndex.SERVER, C.SET_PITCH_WHEEL_CENTER_THRESHOLD, threshold)
}

/**
 * CMD 38h: Pass in true to initiate the expression pedal calibration routine, or false to stop
 */
export const calibrateExpressionPedal = (startCalibration: boolean) =>
  createSysExToggle(BoardIndex.SERVER, C.CALLIBRATE_EXPRESSION_PEDAL, startCalibration)

/**
 * CMD 39h: Reset expression pedal minimum and maximum bounds to factory settings
 */
export const resetExpressionPedalBounds =
  createSysEx(BoardIndex.SERVER, C.RESET_EXPRESSION_PEDAL_BOUNDS)

/**
 * CMD 3Ah: Retrieve the threshold values of target board
 */
export const getBoardThresholdValues = (boardIndex: BoardIndex): EncodedSysex => 
  createSysEx(boardIndex, C.GET_BOARD_THRESHOLD_VALUES)

/**
 * CMD 3Bh: Retrieve the sensitivity values of target board
 */
export const getBoardSensitivityValues = (boardIndex: BoardIndex): EncodedSysex =>
  createSysEx(boardIndex, C.GET_BOARD_SENSITIVITY_VALUES)

/**
 * CMD 3Ch: Set the MIDI channels for peripheral controllers
 */
export const setPeripheralChannels = (pitchWheelChannel: number, modWheelChannel: number, expressionChannel: number, sustainChannel: number): EncodedSysex => {
  // For now set default channel to 1
  if (pitchWheelChannel > 0xf) pitchWheelChannel &= 0x00
  if (modWheelChannel   > 0xf) modWheelChannel   &= 0x00
  if (expressionChannel > 0xf) expressionChannel &= 0x00
  if (sustainChannel    > 0xf) sustainChannel    &= 0x00

  return createSysEx(BoardIndex.SERVER, C.SET_PERIPHERAL_CHANNELS,
    pitchWheelChannel, modWheelChannel, expressionChannel, sustainChannel)
  }

/**
 * CMD 3Dh: Retrieve the MIDI channels for peripheral controllers
 */
export const getPeripheralChannels =
  createSysEx(BoardIndex.SERVER, C.GET_PERIPHERAL_CHANNELS)

/**
 * CMD 3Fh: Set the 8-bit aftertouch trigger delay value, 
 * the time between a note on event and the initialization of aftertouch events
 */
export const setAfterTouchTriggerDelay = (boardIndex: BoardIndex, aftertouchTriggerValue: number): EncodedSysex =>
  createSysEx(boardIndex, C.SET_AFTERTOUCH_TRIGGER_DELAY,
    aftertouchTriggerValue >> 4, 
    aftertouchTriggerValue & 0xf
  )

/**
 * CMD 40h: Retrieve the aftertouch trigger delay of the given board
 */
export const getAftertouchTriggerDelayRequest = (boardIndex: BoardIndex): EncodedSysex =>
  createSysEx(boardIndex, C.GET_AFTERTOUCH_TRIGGER_DELAY)

/**
 * CMD 41h: Set the Lumatouch note-off delay value, an 11-bit integer representing the amount of 1.1ms ticks before
 * sending a note-off event after a Lumatone-configured key is released. 
 */
export const setLumatouchNoteOffDelay = (boardIndex: BoardIndex, delayValue: number) =>
  createSysEx(boardIndex, C.SET_LUMATOUCH_NOTE_OFF_DELAY,
    (delayValue >> 8) & 0xf,
    (delayValue >> 4) & 0xf,
    delayValue & 0xf
  )

/**
 * CMD 42h: Retrieve the note-off delay value of the given board
 */
export const getLumatouchNoteOffDelayRequest = (boardIndex: BoardIndex): EncodedSysex =>
  createSysEx(boardIndex, C.GET_LUMATOUCH_NOTE_OFF_DELAY)

/**
 * CMD 44h: Get the current expression pedal ADC threshold value
 */
export const getExpressionPedalADCThresholdRequest = 
  createSysEx(BoardIndex.SERVER, C.GET_EXPRESSION_PEDAL_THRESHOLD)

/**
 * CMD 43h: Set expression pedal ADC threshold value, a 12-bit integer
 * @param thresholdValue new threshold, as a 12-bit integer value
 */
export const setExpressionPedalADCThreshold = (thresholdValue: number) =>
  createSysEx(BoardIndex.SERVER, C.SET_EXPRESSION_PEDAL_THRESHOLD, 
    (thresholdValue >> 8) & 0xf,
    (thresholdValue >> 4) & 0xf,
    thresholdValue & 0xf
  )

/**
 * CMD 45h: Sets whether to invert the sustain pedal.
 */
export const invertSustainPedal = (invert: boolean): EncodedSysex => 
  createSysExToggle(BoardIndex.SERVER, C.INVERT_SUSTAIN_PEDAL, invert)

