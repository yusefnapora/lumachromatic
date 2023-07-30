import { MidiDriver } from './driver'
import type { DeviceConfig, BoardConfig, LumatoneKeyConfig } from '../export'
import { MidiDevice } from './device'
import { setKeyFunctionParameters, setKeyLightParameters } from './commands'
import tinycolor from 'tinycolor2'

/**
 * Public API for interacting with lumatone device.
 */
export class LumatoneController {
  #driver: MidiDriver[]

  constructor(device: MidiDevice) {
    this.#driver = Array.from(
      { length: 5 },
      (_, i) => new MidiDriver(device, i)
    )
  }

  driver(boardIndex: number): MidiDriver {
    return this.#driver[boardIndex]
  }

  async sendDeviceConfig(config: DeviceConfig): Promise<void> {
    // await this.sendBoardConfig(config.boards[0])
    await Promise.all(config.boards.map((b) => this.sendBoardConfig(b)))
  }

  async sendBoardConfig(config: BoardConfig): Promise<void> {
    const promises = []
    for (const k of config.keys) {
      // console.log('sending key config', k, 'board index:', config.boardIndex)
      promises.push(this.sendKeyConfig(config.boardIndex, k))
    }
    await Promise.all(promises)
  }

  async sendKeyConfig(
    boardIndex: number,
    config: LumatoneKeyConfig
  ): Promise<void> {
    const faderUpIsNull = false // TODO
    const setFunctions = setKeyFunctionParameters(
      boardIndex + 1,
      config.keyNum,
      config.midiNoteOrCC,
      config.midiChannel,
      config.keyType,
      faderUpIsNull
    )
    const { r, g, b } = tinycolor(config.color).toRgb()
    const setLights = setKeyLightParameters(
      boardIndex + 1,
      config.keyNum,
      r,
      g,
      b
    )

    this.#driver[boardIndex].submitCommand(setFunctions)
    this.#driver[boardIndex].submitCommand(setLights)
  }
}
