// Adapted from https://github.com/hsstraub/TerpstraSysEx.2014/blob/master/Source/LumatoneFirmwareDefinitions.h
// 2021-09-23 / yusef napora

/*
==============================================================================
System exclusive board definitions
==============================================================================
*/

export const BOARD_SERVER = 0x0
export const BOARD_OCT_1 = 0x1
export const BOARD_OCT_2 = 0x2
export const BOARD_OCT_3 = 0x3
export const BOARD_OCT_4 = 0x4
export const BOARD_OCT_5 = 0x5

export enum BoardIndex {
  SERVER = 0,
  OCTAVE_1,
  OCTAVE_2,
  OCTAVE_3,
  OCTAVE_4,
  OCTAVE_5,
}

/*
==============================================================================
System exclusive command structure
==============================================================================
*/

export const MANUFACTURER_ID_0 = 0x00
export const MANUFACTURER_ID_1 = 0x21
export const MANUFACTURER_ID_2 = 0x50

export const MANUFACTURER_ID = [
  MANUFACTURER_ID_0,
  MANUFACTURER_ID_1,
  MANUFACTURER_ID_2,
]

// index into sysex data of various fields
export const MANU_0 = 0x0
export const MANU_1 = 0x1
export const MANU_2 = 0x2
export const BOARD_IND = 0x3
export const CMD_ID = 0x4
export const MSG_STATUS = 0x5
export const CALIB_MODE = 0x5
export const PAYLOAD_INIT = 0x6

export const ECHO_FLAG = 0x5 // Used to differentiate test responses from MIDI = feedback
export const TEST_ECHO = 0x7f // Should not be returned by Lumatone = firmware

// export const SERIAL_55_KEYS = "00 00 00 00 00 = 00"

export enum LumatoneKeyType {
  NoteOnNoteOff = 1,
  ContinuousController = 2,
  LumaTouch = 3,
  Disabled = 4,
}

/*
==============================================================================
System exclusive command bytes
==============================================================================
*/

export enum CommandId {
  // Start support at 55-keys firmware version, Developmental versions
  CHANGE_KEY_NOTE = 0x00,
  SET_KEY_COLOUR = 0x01,

  SAVE_PROGRAM = 0x02,

  SET_FOOT_CONTROLLER_SENSITIVITY = 0x03,
  INVERT_FOOT_CONTROLLER = 0x04,

  MACROBUTTON_COLOUR_ON = 0x05,
  MACROBUTTON_COLOUR_OFF = 0x06,

  SET_LIGHT_ON_KEYSTROKES = 0x07,

  SET_VELOCITY_CONFIG = 0x08,
  SAVE_VELOCITY_CONFIG = 0x09,
  RESET_VELOCITY_CONFIG = 0x0a,

  SET_FADER_CONFIG = 0x0b,
  SAVE_FADER_CONFIG = 0x0c,
  RESET_FADER_CONFIG = 0x0d,

  SET_AFTERTOUCH_FLAG = 0x0e,
  CALIBRATE_AFTERTOUCH = 0x0f,
  SET_AFTERTOUCH_CONFIG = 0x10,
  SAVE_AFTERTOUCH_CONFIG = 0x11,
  RESET_AFTERTOUCH_CONFIG = 0x12,

  GET_RED_LED_CONFIG = 0x13,
  GET_GREEN_LED_CONFIG = 0x14,
  GET_BLUE_LED_CONFIG = 0x15,
  GET_CHANNEL_CONFIG = 0x16,
  GET_NOTE_CONFIG = 0x17,
  GET_KEYTYPE_CONFIG = 0x18,

  GET_MAX_THRESHOLD = 0x19,
  GET_MIN_THRESHOLD = 0x1a,
  GET_AFTERTOUCH_MAX = 0x1b,
  GET_KEY_VALIDITY = 0x1c,

  GET_VELOCITY_CONFIG = 0x1d,
  GET_FADER_CONFIG = 0x1e,
  GET_AFTERTOUCH_CONFIG = 0x1f,

  // Firmware Version 1.0.3
  SET_VELOCITY_INTERVALS = 0x20,
  GET_VELOCITY_INTERVALS = 0x21,

  // Firmware Version 1.0.4
  GET_FADER_TYPE_CONFIGURATION = 0x22,

  // Start 56-keys, Firmware Version 1.0.5
  GET_SERIAL_IDENTITY = 0x23,
  // 0x23 will acknowledge in 55-keys but will not return serial number

  CALIBRATE_KEYS = 0x24,

  DEMO_MODE = 0x25,

  // Firmware Version 1.0.6
  CALIBRATE_PITCH_MOD_WHEEL = 0x26,
  SET_MOD_WHEEL_SENSITIVITY = 0x27,
  SET_PITCH_WHEEL_SENSITIVITY = 0x28,

  // Firmware Version 1.0.7, Start shipping backers and batches
  SET_KEY_MAX_THRESHOLD = 0x29,
  SET_KEY_MIN_THRESHOLD = 0x2a,
  SET_KEY_FADER_SENSITIVITY = 0x2b,
  SET_KEY_AFTERTOUCH_SENSITIVITY = 0x2c,

  SET_LUMATOUCH_CONFIG = 0x2d,
  SAVE_LUMATOUCH_CONFIG = 0x2e,
  RESET_LUMATOUCH_CONFIG = 0x2f,
  GET_LUMATOUCH_CONFIG = 0x30,

  // Firmware Version 1.0.8
  GET_FIRMWARE_REVISION = 0x31,

  // Firmware Version 1.0.9
  SET_CC_ACTIVE_THRESHOLD = 0x32,
  LUMA_PING = 0x33,

  // Firmware Version 1.0.10
  RESET_BOARD_THRESHOLDS = 0x34,
  SET_KEY_SAMPLING = 0x35,

  // Firmware Version 1.0.11
  RESET_WHEELS_THRESHOLD = 0x36,
  SET_PITCH_WHEEL_CENTER_THRESHOLD = 0x37,
  CALLIBRATE_EXPRESSION_PEDAL = 0x38,
  RESET_EXPRESSION_PEDAL_BOUNDS = 0x39,

  // Firmware Version 1.0.12
  GET_BOARD_THRESHOLD_VALUES = 0x3a,
  GET_BOARD_SENSITIVITY_VALUES = 0x3b,

  // Firmware Version 1.0.13
  SET_PERIPHERAL_CHANNELS = 0x3c,
  GET_PERIPHERAL_CHANNELS = 0x3d,
  PERIPHERAL_CALBRATION_DATA = 0x3e,

  // Firmware Version 1.0.14
  SET_AFTERTOUCH_TRIGGER_DELAY = 0x3f,
  GET_AFTERTOUCH_TRIGGER_DELAY = 0x40,

  // Firmware Version 1.0.15
  SET_LUMATOUCH_NOTE_OFF_DELAY = 0x41,
  GET_LUMATOUCH_NOTE_OFF_DELAY = 0x42,
  SET_EXPRESSION_PEDAL_THRESHOLD = 0x43,
  GET_EXPRESSION_PEDAL_THRESHOLD = 0x44,
  INVERT_SUSTAIN_PEDAL = 0x45,
}

// Answer return codes
export enum FirmwareAnswer {
  NACK = 0x0, // Not recognized
  ACK = 0x01, // Acknowledged, OK
  BUSY = 0x02, // Controller busy
  ERROR = 0x03, // Error
  STATE = 0x04, // Not in MIDI state
}
