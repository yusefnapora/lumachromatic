import React, { useEffect, useRef, useState } from 'react'
import { Note } from '@tonaljs/tonal'
import type { Scale } from '@tonaljs/scale'

import Wedge from './Wedge'
import PitchConstellation from './PitchConstellation'
import { useLayoutContext } from '../../context/layout'
import { NOTES } from '../../constants'
import { IPalette } from '../../types'
import { useRecoilValue } from 'recoil'
import { colorParamState, harmonicParamState } from '../../state/userParams'

interface Props {
  radius: number
  scale?: Scale
  palette?: IPalette
}

export default function ColorWheel(props: Props): React.ReactElement {
  // ref to capture width and height of wrapper div
  const wrapper = useRef<HTMLDivElement>(null)

  // to manually trigger a re-render when the wrapper ref is initialized
  const [, forceRender] = useState(false)

  // force re-render when layout changes (e.g. window or dock tab resizes)
  useLayoutContext()

  const scale = props.scale || useRecoilValue(harmonicParamState).scale
  const palette = props.palette || useRecoilValue(colorParamState).palette

  let { radius } = props
  const divisions = palette.divisions

  const updateRadius = () => {
    if (wrapper.current != null) {
      const w = wrapper.current.offsetWidth
      const h = wrapper.current.offsetHeight
      radius = Math.min(w, h) / 2
      console.log('container w/h', w, h, ' - radius: ', radius)
    }
  }

  useEffect(() => {
    updateRadius()
    forceRender(true)
  }, [wrapper.current])

  updateRadius()

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
