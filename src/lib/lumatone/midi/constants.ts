// Adapted from https://github.com/hsstraub/TerpstraSysEx.2014/blob/master/Source/LumatoneFirmwareDefinitions.h
// 2021-09-23 / yusef napora

/*
==============================================================================
System exclusive board definitions
==============================================================================
*/

export const BOARD_SERVER = 0x0
export const BOARD_OCT_1  = 0x1
export const BOARD_OCT_2  = 0x2
export const BOARD_OCT_3  = 0x3
export const BOARD_OCT_4  = 0x4
export const BOARD_OCT_5  = 0x5

/*
==============================================================================
System exclusive command structure
==============================================================================
*/

export const MANUFACTURER_ID_0 = 0x00
export const MANUFACTURER_ID_1 = 0x21
export const MANUFACTURER_ID_2 = 0x50

export const MANU_0       = 0x0
export const MANU_1       = 0x1
export const MANU_2       = 0x2
export const BOARD_IND    = 0x3
export const CMD_ID       = 0x4
export const MSG_STATUS   = 0x5
export const CALIB_MODE   = 0x5
export const PAYLOAD_INIT = 0x6

export const ECHO_FLAG   = 0x5  // Used to differentiate test responses from MIDI = feedback
export const TEST_ECHO   = 0x7F // Should not be returned by Lumatone = firmware

export const SERIAL_55_KEYS = "00 00 00 00 00 = 00"

/*
==============================================================================
System exclusive command bytes
==============================================================================
*/

// Start support at 55-keys firmware version, Developmental versions
export const CHANGE_KEY_NOTE = 0x00
export const SET_KEY_COLOUR = 0x01

export const SAVE_PROGRAM = 0x02

export const SET_FOOT_CONTROLLER_SENSITIVITY = 0x03
export const INVERT_FOOT_CONTROLLER = 0x04

export const MACROBUTTON_COLOUR_ON = 0x05
export const MACROBUTTON_COLOUR_OFF = 0x06

export const SET_LIGHT_ON_KEYSTROKES = 0x07

export const SET_VELOCITY_CONFIG = 0x08
export const SAVE_VELOCITY_CONFIG = 0x09
export const RESET_VELOCITY_CONFIG = 0x0A

export const SET_FADER_CONFIG = 0x0B
export const SAVE_FADER_CONFIG = 0x0C
export const RESET_FADER_CONFIG = 0x0D

export const SET_AFTERTOUCH_FLAG = 0x0E
export const CALIBRATE_AFTERTOUCH = 0x0F
export const SET_AFTERTOUCH_CONFIG = 0x10
export const SAVE_AFTERTOUCH_CONFIG = 0x11
export const RESET_AFTERTOUCH_CONFIG = 0x12

export const GET_RED_LED_CONFIG = 0x13
export const GET_GREEN_LED_CONFIG = 0x14
export const GET_BLUE_LED_CONFIG = 0x15
export const GET_CHANNEL_CONFIG = 0x16
export const GET_NOTE_CONFIG = 0x17
export const GET_KEYTYPE_CONFIG = 0x18

export const GET_MAX_THRESHOLD = 0x19
export const GET_MIN_THRESHOLD = 0x1A
export const GET_AFTERTOUCH_MAX = 0x1B
export const GET_KEY_VALIDITY = 0x1C

export const GET_VELOCITY_CONFIG = 0x1D
export const GET_FADER_CONFIG = 0x1E
export const GET_AFTERTOUCH_CONFIG = 0x1F

// Firmware Version 1.0.3
export const SET_VELOCITY_INTERVALS = 0x20
export const GET_VELOCITY_INTERVALS = 0x21

// Firmware Version 1.0.4
export const GET_FADER_TYPE_CONFIGURATION = 0x22

// Start 56-keys, Firmware Version 1.0.5
export const GET_SERIAL_IDENTITY = 0x23
// 0x23 will acknowledge in 55-keys but will not return serial number

export const CALIBRATE_KEYS = 0x24

export const DEMO_MODE = 0x25

// Firmware Version 1.0.6
export const CALIBRATE_PITCH_MOD_WHEEL = 0x26
export const SET_MOD_WHEEL_SENSITIVITY = 0x27
export const SET_PITCH_WHEEL_SENSITIVITY = 0x28

// Firmware Version 1.0.7, Start shipping backers and batches
export const SET_KEY_MAX_THRESHOLD = 0x29
export const SET_KEY_MIN_THRESHOLD = 0x2A
export const SET_KEY_FADER_SENSITIVITY = 0x2B
export const SET_KEY_AFTERTOUCH_SENSITIVITY = 0x2C

export const SET_LUMATOUCH_CONFIG = 0x2D
export const SAVE_LUMATOUCH_CONFIG = 0x2E
export const RESET_LUMATOUCH_CONFIG = 0x2F
export const GET_LUMATOUCH_CONFIG = 0x30

// Firmware Version 1.0.8
export const GET_FIRMWARE_REVISION = 0x31

// Firmware Version 1.0.9
export const SET_CC_ACTIVE_THRESHOLD = 0x32
export const LUMA_PING = 0x33

// Firmware Version 1.0.10
export const RESET_BOARD_THRESHOLDS = 0x34
export const SET_KEY_SAMPLING = 0x35

// Firmware Version 1.0.11
export const RESET_WHEELS_THRESHOLD = 0x36
export const SET_PITCH_WHEEL_CENTER_THRESHOLD = 0x37
export const CALLIBRATE_EXPRESSION_PEDAL = 0x38
export const RESET_EXPRESSION_PEDAL_BOUNDS = 0x39

// Firmware Version 1.0.12
export const GET_BOARD_THRESHOLD_VALUES = 0x3A
export const GET_BOARD_SENSITIVITY_VALUES = 0x3B

// Firmware Version 1.0.13
export const SET_PERIPHERAL_CHANNELS = 0x3C
export const GET_PERIPHERAL_CHANNELS = 0x3D
export const PERIPHERAL_CALBRATION_DATA = 0x3E

// Firmware Version 1.0.14
export const SET_AFTERTOUCH_TRIGGER_DELAY = 0x3F
export const GET_AFTERTOUCH_TRIGGER_DELAY = 0x40

// Firmware Version 1.0.15
export const SET_LUMATOUCH_NOTE_OFF_DELAY = 0x41
export const GET_LUMATOUCH_NOTE_OFF_DELAY = 0x42
export const SET_EXPRESSION_PEDAL_THRESHOLD = 0x43
export const GET_EXPRESSION_PEDAL_THRESHOLD = 0x44
export const INVERT_SUSTAIN_PEDAL = 0x45
