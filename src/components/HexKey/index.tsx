import React from 'react'
import { hexagonPoints } from '../../lib/drawing';
import { HexColor } from '../../types';

export interface Props {
  color: HexColor,
  size: number,
}

const DEFAULT_ROTATION_ANGLE = -0.809175 * (180/Math.PI)

export default function HexKey(props: Props): React.ReactElement {
  const { size, color } = props
  const points = hexagonPoints({x: size, y: size}, size)
  const angle = DEFAULT_ROTATION_ANGLE // TODO: add to props
  return <svg width={size*2} height={size*2} >
    <polygon points={points} fill={color} stroke="black" />
  </svg>
}
