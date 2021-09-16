
import type { HexColor } from '../types'
import RXB from './RXB'
import type { RXBArray } from './RXB'

export default class Palette {
  divisions: number
  rainbow: RXBArray[]
  constructor(divisions: number = 12) {
    this.divisions = divisions
    this.rainbow = RXB.rainbow(divisions)
  }

  primary(index: number): HexColor {
    this._checkIndex(index)
    return toHex(this.rainbow[index])
  }

  complementary(index: number, value: number): HexColor {
    this._checkIndex(index)
    const p = this.rainbow[index]
    return toHex(RXB.complementary(p, value))
  }

  neutrals(index: number, value: number, count?: number): HexColor[] {
    this._checkIndex(index)
    const p = this.rainbow[index]
    return RXB.neutrals(p, value, count).map(toHex)
  }

  _checkIndex(index: number) {
    if (index < 0 || index >= this.divisions) {
      throw new Error(`Invalid color index ${index}. Valid range: 0-${this.divisions}`)
    }
  }
}

function toHex(color: RXBArray | string): HexColor {
  if (typeof color === 'string') {
    if (!color.startsWith('#')) {
      return '#' + color
    }
    return color
  }
  return '#' + RXB.rxb2hex(RXB.ryb2rgb(color))
}