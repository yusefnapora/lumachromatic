import React from 'react'

import { KeyCoordinates, stringifyCoord } from '../lib/coordinates'
import type { ToneMap, IPalette as Palette } from '../types'
import type { BoardGeometry } from '../lib/lumatone/BoardGeometry'
import { useParamsContext } from '../context/params'

interface Props {
  geometry: BoardGeometry
  toneMap: ToneMap
  palette: Palette
  key: string
}

/**
 * A 56-key arrangement of hexagonal keys - one fifth of a full lumatone layout.
 */
export default function TerpstraBoard(props: Props): React.ReactElement {
  const { geometry, toneMap, palette } = props

  const [{
    harmonic: { scale },
  }] = useParamsContext()
  console.log('board scale: ', scale)

  const keyProps = KeyCoordinates.allCoordinates()
    .map((c) => {
      const def = toneMap.get(c)
      if (!def) {
        return null
      }
      const points = geometry.hexPath(c)
      const key = stringifyCoord(c)
      const fill = palette.colorForNoteName(def.note, scale)
      const label = {
        text: def.note,
        color: 'white',
        center: geometry.centerPoint(c),
      }
      return { points, key, fill, stroke: 'black', label }
    })
    .filter((p) => p != null)

  // @ts-ignore
  const keys = keyProps.map(({ label, key, ...polygonProps }) => (
    <g key={key}>
      <polygon {...polygonProps} />
      <text
        x={label.center.x}
        y={label.center.y}
        textAnchor="middle"
        stroke={label.color}
        fill={label.color}
      >
        {label.text}
      </text>
    </g>
  ))
  // console.log('keys', keys)

  return <g key={props.key}>{keys}</g>
}
