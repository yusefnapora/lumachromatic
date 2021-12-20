import React, { useRef } from 'react'
import { Note } from '@tonaljs/tonal'

import { useParamsContext } from '../../context/params'

import Wedge from './Wedge'
import PitchConstellation from './PitchConstellation'
import { useLayoutContext } from '../../context/layout'

interface Props {
  radius: number
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export default function ColorWheel(props: Props): React.ReactElement {
  // ref to capture width and height of wrapper div
  const wrapper = useRef<HTMLDivElement>(null)
  // force re-render when layout changes (e.g. window or dock tab resizes)
  useLayoutContext()

  let { radius } = props
  const [
    {
      harmonic: { scale },
      color: { palette },
    },
  ] = useParamsContext()
  const divisions = palette.divisions

  if (wrapper.current) {
    const w = wrapper.current.offsetWidth
    const h = wrapper.current.offsetHeight
    radius = Math.min(w, h) / 2
    console.log('container w/h', w, h, ' - radius: ', radius)
  } else {
    console.log('no wrapper ref...')
  }

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
    const wedge = Wedge({
      radius,
      center,
      rotation,
      arcDegrees,
      color,
      textColor,
      label,
    })
    wedges.push(wedge)
  }

  const constellationRadius = holeRadius
  const constellation = PitchConstellation({
    scale,
    radius: constellationRadius,
    center,
    palette,
  })

  const ringRotation = wheelRotation(scale.tonic!)
  return (
    <div
      ref={wrapper}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={size} height={size}>
        <defs>
          <mask id="rim-clip">
            <circle cx={center.x} cy={center.y} r={radius} fill="white" />
            <circle
              cx={center.x}
              cy={center.y}
              r={holeRadius}
              fill="black"
            ></circle>
          </mask>
        </defs>
        <g
          mask="url(#rim-clip)"
          transform={`rotate(${ringRotation}, ${center.x}, ${center.y})`}
        >
          {...wedges}
          <circle
            cx={center.x}
            cy={center.y}
            r={holeRadius}
            onClick={(e) => e.preventDefault()}
          />
        </g>
        {constellation}
      </svg>
    </div>
  )
}

function wheelRotation(tonicNote: string): number {
  const note = Note.get(tonicNote)
  // 30deg counter clockwise for each semitone offset
  return -30 * (note.chroma || 0)
}
