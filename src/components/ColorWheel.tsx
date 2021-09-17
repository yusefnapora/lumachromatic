import React, { useContext } from 'react'
import { Scale, Note } from '@tonaljs/tonal'

import HarmonicContext from '../context/harmonic'

import type Palette from '../lib/Palette'
import type { HexColor, Point } from '../types'

import Wedge from './Wedge'
import PitchConstellation from './PitchConstellation'


interface Props {
  radius: number,
  palette: Palette,
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']


export default function ColorWheel(props: Props): React.ReactElement {
  const { palette, radius } = props
  const { scaleName, tonicNote } = useContext(HarmonicContext)
  const divisions = palette.divisions

  const size = radius * 2
  const center = { x: radius, y: radius }

  const holeRadius = radius * 0.8

  const arcDegrees = 360 / divisions
  const wedges = []
  for (let i = 0; i < divisions; i++) {
    const rotation = arcDegrees * i
    const color = palette.primary(i)
    const textColor = palette.complementary(i, -0.8)
    const note = NOTES[i]
    let label = note
    if (Note.enharmonic(note) !== note) {
      label += ' / ' + Note.enharmonic(note)
    }
    const wedge = Wedge({ radius, center, rotation, arcDegrees, color, textColor, label })
    wedges.push(wedge)
  }

  const constellationRadius = holeRadius
  const constellation = PitchConstellation({scale: Scale.get(tonicNote + " " + scaleName), radius: constellationRadius, center, palette })

  const ringRotation = wheelRotation(tonicNote)
  return (
    <svg width={size} height={size}>
      <defs>
        <mask id="rim-clip">
          <circle cx={center.x} cy={center.y} r={radius} fill="white" />
          <circle cx={center.x} cy={center.y} r={holeRadius} fill="black" ></circle>
        </mask>
      </defs>
      <g mask="url(#rim-clip)" transform={`rotate(${ringRotation}, ${center.x}, ${center.y})`}>
        {...wedges}
        <circle cx={center.x} cy={center.y} r={holeRadius} onClick={e => e.preventDefault()} />
      </g>
      {constellation}
    </svg>
  )
}


function wheelRotation(tonicNote: string): number {
  const note = Note.get(tonicNote)
  // 30deg counter clockwise for each semitone offset
  return -30 * (note.chroma || 0)
}
