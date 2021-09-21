import React, { useContext } from 'react'
import { Scale, Note, Interval } from '@tonaljs/tonal'

import { KeyCoordinates, stringifyCoord } from '../lib/coordinates'
import { RectangularToneMap, twelveToneGenerator } from '../lib/lumatone/ToneMap'
import { BoardGeometry } from '../lib/lumatone/BoardGeometry'
import Palette from '../lib/Palette'
import HarmonicContext from '../context/harmonic'
import { exportLumatoneIni } from '../lib/lumatone/export'

/**
 * A 56-key arrangement of hexagonal keys - one fifth of a full lumatone layout.
 */
export default function TerpstraBoard(props: { boardIndex?: number, tx?: number, ty?: number }): React.ReactElement {
  const keyDiameter = 30
  const keyMargin = 2
  const geo = new BoardGeometry({ keyDiameter, keyMargin, origin: { x: 0, y: 500 }})
  const width = 1000
  const height = 1000

  const boardIndex = props.boardIndex || 0

  const { scaleName, tonicNote } = useContext(HarmonicContext)
  const scale = Scale.get([tonicNote, scaleName].join(' '))
  console.log('board scale: ', scale)

  const generatorInterval = '2M'
  const boardShift = 0

  const startNote = Note.transpose(`C${boardIndex}`, Interval.fromSemitones(boardShift * boardIndex))
  const genTonic = twelveToneGenerator(generatorInterval, startNote)
  const genOffset = twelveToneGenerator(generatorInterval, Note.transpose(startNote, Interval.fromSemitones(1)))
  const toneMap = new RectangularToneMap({
    gen: genTonic,
    oddGen: genOffset,
  })
  const coords = KeyCoordinates.allCoordinates()
  const palette = new Palette(12)

  // FIXME: remove export hack once there's an export button :)
  if (boardIndex === 0) {
    let full = ''
    for (let i = 0; i < 5; i++) {
      const startNote = Note.transpose(`C${i}`, Interval.fromSemitones(boardShift * i))
      const genTonic = twelveToneGenerator(generatorInterval, startNote)
      const genOffset = twelveToneGenerator(generatorInterval, Note.transpose(startNote, Interval.fromSemitones(1)))
      const toneMap = new RectangularToneMap({
        gen: genTonic,
        oddGen: genOffset,
      })
      const lumatoneCfg = exportLumatoneIni(i, toneMap, palette, scale)
      full += lumatoneCfg
    }
    console.log('--- lumatone ini ---')
    console.log(full)
  }
  
  const keyProps = coords
    .map(c => {
      const def = toneMap.get(c)
      // console.log('key def for coord', c, def)
      if (!def) {
        return null
      }
      const points = geo.hexPath(c)
      const key = stringifyCoord(c)
      const fill = palette.colorForNoteName(def.note, scale)
      const label = {
        text: def.note,
        color: 'black',
        center: geo.centerPoint(c),
      }
      return { points, key, fill, stroke: 'black', label }
    })
    .filter(p => p != null)

  // @ts-ignore
  const keys = keyProps.map(({ label, key, ...polygonProps }) => 
    <g key={key}>
      <polygon {...polygonProps} />
      <text x={label.center.x} y={label.center.y} textAnchor="middle" stroke={label.color} fill={label.color}>
        {label.text}
      </text>
    </g>
  )
  // console.log('keys', keys)

  const rot = -17.42 // matches the angle in the lumatone editor gui

  const xOffset = -202.5 * boardIndex
  const yOffset = -7.5 * boardIndex
  const tx = xOffset
  let ty = yOffset
  const boardTy = 100 // FIXME: this is just to account for clipping after rotation. could be cleaner
  const transform = `rotate(${rot}) translate(0, ${boardTy})`
  return <svg width={width} height={height} transform={`translate(${tx}, ${ty})`}>
    <g transform={transform}>
      {keys}
    </g>
  </svg>
}