import { Note } from '@tonaljs/tonal'
import { KeyCoordinates } from '../coordinates'

import type { Scale as ScaleT } from '@tonaljs/scale'
import type Palette from '../Palette'
import type { ToneMap } from './ToneMap'
import { HexColor } from '../../types'
import { LumatoneKeyType } from './midi/constants'

export type LumatoneKeyConfig = {
  keyNum: number,
  keyType: LumatoneKeyType,
  color: HexColor,
  midiNoteOrCC: number,
  midiChannel: number,
}

export type BoardConfig = {
  boardIndex: number,
  keys: LumatoneKeyConfig[],
}

export type DeviceConfig = {
  boards: BoardConfig[]
  // TODO: velocity curves, other global stuff
}

function configToIni(config: BoardConfig): string {
  let lines = [`[Board${config.boardIndex}]`]
  for (const k of config.keys) {
    lines.push(
      `Key_${k.keyNum}=${k.midiNoteOrCC}`,
      `Chan_${k.keyNum}=${k.midiChannel}`,
      `Col_${k.keyNum}=${k.color}`,
    )
  }
  return lines.join('\n')
}

function singleBoardConfig(boardIndex: number = 0, toneMap: ToneMap, palette: Palette, scale: ScaleT|undefined): BoardConfig {
  const keys: LumatoneKeyConfig[] = []
  for (const c of KeyCoordinates.allCoordinates()) {
    const keyNum = KeyCoordinates.keyNumber(c)
    if (keyNum == null) {
      console.warn('key num not found for ', c)
      continue
    }
    const keyDef = toneMap.get(c)
    if (keyDef == null) {
      console.warn('key definition not found for ', c)
      continue
    }
    const color = palette.colorForNoteName(keyDef.note, scale)?.replace(/^#/, '')
    if (color == null) {
      console.warn('color not found for ', c)
      continue
    }

    const midiNoteOrCC = Note.get(keyDef.note).midi
    if (midiNoteOrCC == null) {
      console.warn('no midi note found for:', keyDef.note)
      continue
    }
    const midiChannel = 1 // TODO: multiple channels
    const keyType = LumatoneKeyType.NoteOnNoteOff // TODO: other key types
    keys[keyNum] = { midiNoteOrCC, midiChannel, color, keyNum , keyType }
  }
  // console.log('lumatone configs', keyConfigs)

  return { boardIndex, keys }
}

export function lumatoneDeviceConfig(toneMap: ToneMap, palette: Palette, scale: ScaleT|undefined, boardTranspose: number = 12): DeviceConfig {
  const boards: BoardConfig[] = []
  for (let i = 0; i < 5; i++) {
    boards.push(singleBoardConfig(i, toneMap.transposed(boardTranspose * i), palette, scale))
  }
  return { boards }
}

export function exportLumatoneIni(toneMap: ToneMap, palette: Palette, scale: ScaleT|undefined, boardTranspose: number = 12): string {
  const { boards } = lumatoneDeviceConfig(toneMap, palette, scale, boardTranspose)
  return boards.map(configToIni).join('\n')
}