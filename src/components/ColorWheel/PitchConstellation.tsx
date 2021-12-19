import React from 'react'
import { Scale, Interval, Note } from '@tonaljs/tonal'
import type { Scale as ScaleType } from '@tonaljs/scale'

import type { HexColor, Point } from '../../types'
import type Palette from '../../lib/Palette'
import { polarToCartesian } from '../../lib/drawing'

interface Props {
  scale: ScaleType
  palette: Palette
  radius: number
  center: Point
}

function PitchConstellation(props: Props): React.ReactElement {
  const { scale, radius, center, palette } = props
  const degreesPerSemitone = 360 / 12
  console.log('scale', scale)
  const strokeWidth = radius * 0.25

  const lineProps: PitchLineProps[] = []
  for (let i = 0; i < scale.notes.length; i++) {
    const note = Note.get(scale.notes[i])
    const intervalName = scale.intervals[i]
    const interval = Interval.get(intervalName)
    const semitones = interval.semitones!
    const angle = degreesPerSemitone * semitones
    lineProps.push({
      strokeWidth,
      angle,
      interval: intervalName,
      center,
      radius,
      color: palette.primary(note.chroma!),
    })
  }
  scale.intervals.map((i) => {})
  const lines = lineProps.map(pitchLine)
  return <g key="pitch-constellation">{...lines}</g>
}

interface PitchLineProps {
  center: Point
  radius: number
  angle: number
  interval: string
  color: HexColor
  strokeWidth: number
}

function pitchLine(props: PitchLineProps) {
  const { center, radius, angle, interval, color, strokeWidth } = props
  const endPoint = polarToCartesian(center, radius, angle)
  // console.log('pitch line', props, center, endPoint)
  const opacity = 0.6
  return (
    <line
      x1={center.x}
      y1={center.y}
      x2={endPoint.x}
      y2={endPoint.y}
      key={interval}
      stroke={color}
      fill={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      opacity={opacity}
    />
  )
}

PitchConstellation.defaultProps = {
  scale: Scale.get('C major'),
  radius: 200,
}

export default PitchConstellation
