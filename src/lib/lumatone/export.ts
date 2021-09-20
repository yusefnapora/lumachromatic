import { Note } from '@tonaljs/tonal'
import { KeyCoordinates } from '../coordinates'

import type { Scale as ScaleT } from '@tonaljs/scale'
import type Palette from '../Palette'
import type { ToneMap } from './ToneMap'

export function exportLumatoneIni(boardIndex: number = 0, toneMap: ToneMap, palette: Palette, scale: ScaleT|undefined): string {
  const keyConfigs: Record<number, string> = {}
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

    const midiNote = Note.get(keyDef.note).midi
    if (midiNote == null) {
      console.warn('no midi note found for:', keyDef.note)
      continue
    }
    const midiChannel = 1 // TODO: multiple channels
    keyConfigs[keyNum] = [
      `Key_${keyNum}=${midiNote}`,
      `Chan_${keyNum}=${midiChannel}`,
      `Col_${keyNum}=${color}`
    ].join('\n')
  }
  // console.log('lumatone configs', keyConfigs)

  const lines = [`[Board${boardIndex}]`]
  for (let i = 0; i < 56; i++) {
    const cfg = keyConfigs[i] || ''
    lines.push(cfg)
  }
  lines.push('')
  return lines.join('\n')
}