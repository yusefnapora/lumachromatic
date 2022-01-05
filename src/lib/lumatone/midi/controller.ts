import { MidiDriver } from './driver'
import type { DeviceConfig, BoardConfig, LumatoneKeyConfig } from '../export'
import { MidiDevice } from './device'
import { setKeyFunctionParameters, setKeyLightParameters } from './commands'
import tinycolor from 'tinycolor2'

/**
 * Public API for interacting with lumatone device.
 */
export class LumatoneController {
  #driver: MidiDriver

  constructor(device: MidiDevice) {
    this.#driver = new MidiDriver(device)
  }

  async sendDeviceConfig(config: DeviceConfig): Promise<void> {
    await Promise.all(config.boards.map(this.sendBoardConfig))
  }

  async sendBoardConfig(config: BoardConfig): Promise<void> {
    const promises = []
    for (const k of config.keys) {
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
      boardIndex,
      config.keyNum,
      config.midiNoteOrCC,
      config.midiChannel,
      config.keyType,
      faderUpIsNull
    )
    const { r, g, b } = tinycolor(config.color).toRgb()
    const setLights = setKeyLightParameters(boardIndex, config.keyNum, r, g, b)

    this.#driver.submitCommand(setFunctions)
    this.#driver.submitCommand(setLights)
  }
}
