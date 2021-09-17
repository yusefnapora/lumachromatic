import React from 'react'
import { polarToCartesian, describeArc, lineTo } from '../lib/drawing'
import type { Point, HexColor } from '../types'

export interface WedgeProps {
  radius: number,
  center: Point,
  color: HexColor,
  label: string,
  textColor: HexColor,
  rotation: number, 
  arcDegrees: number,
  fill?: string,
  stroke?: string,
}

export default function Wedge(props: WedgeProps): React.ReactElement {
  const { radius, center, fill, stroke, color, textColor, label, rotation, arcDegrees } = props
  const halfArc = arcDegrees / 2
  const p1 = polarToCartesian(center, radius, -halfArc)
  const p2 = polarToCartesian(center, radius, halfArc)
  const labelPt = polarToCartesian(center, radius*0.9, 0)

  const wedgePath = [
    describeArc(center, radius, -halfArc, halfArc),
    lineTo(center),
    lineTo(p2), 
  ].join(' ')

  return <g transform={`rotate(${rotation}, ${center.x}, ${center.y})`} fill={fill || color} stroke={stroke || color} key={label} onClick={() => console.log('clicked', label)}>
    <path d={wedgePath} strokeWidth={0} stroke="none" />
    <text textAnchor="middle" x={labelPt.x} y={labelPt.y} stroke={textColor} fill={textColor}>{label}</text>
  </g>
}

