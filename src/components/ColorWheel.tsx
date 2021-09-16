import React from 'react'

import type Palette from '../lib/Palette'
import { HexColor } from '../types'


interface Props {
  radius: number,
  palette: Palette,
}


export default function ColorWheel(props: Props): React.ReactElement {
  const { palette, radius } = props
  const divisions = palette.divisions

  const size = radius * 2
  const centerX = radius
  const centerY = radius

  const holeRadius = radius * 0.8

  const arcDegrees = 360 / divisions
  const segments = []
  for (let i = 0; i < divisions; i++) {
    const rotation = arcDegrees * i
    const color = palette.primary(i)
    const textColor = palette.complementary(i, -0.8)
    const label = `${i+1}`
    const s = wheelSegment({ radius, centerX, centerY, rotation, arcDegrees, color, textColor, label })
    segments.push(s)
  }

  return (
    <svg width={size} height={size}>
      <defs>
        <mask id="rim-clip">
          <circle cx={centerX} cy={centerY} r={radius} fill="white" />
          <circle cx={centerX} cy={centerY} r={holeRadius} fill="black" ></circle>
        </mask>
      </defs>
      <g mask="url(#rim-clip)">
        {...segments}
        <circle cx={centerX} cy={centerY} r={holeRadius} onClick={e => e.preventDefault()} />
      </g>
    </svg>
  )
}


function wheelSegment(props: { radius: number, centerX: number, centerY: number, color: HexColor, label: string, textColor: HexColor, rotation: number, arcDegrees: number }): React.ReactElement {
  const { radius, centerX, centerY, color, textColor, label, rotation, arcDegrees } = props
  const halfArc = arcDegrees / 2
  const p1 = polarToCartesian(centerX, centerY, radius, -halfArc)
  const p2 = polarToCartesian(centerX, centerY, radius, halfArc)
  const labelPt = polarToCartesian(centerX, centerY, radius*0.9, 0)


  const arcPath = describeArc(centerX, centerY, radius, -halfArc, halfArc)
  const triangle = `${centerX},${centerY} ${p1.x},${p1.y}, ${p2.x},${p2.y}`

  return <g transform={`rotate(${rotation}, ${centerX}, ${centerY})`} fill={color} stroke={color} key={label} onClick={() => console.log('clicked', label)}>
    <path d={arcPath}/>
    <polygon points={triangle} />
    <line x1={centerX} y1={centerY} x2={p1.x} y2={p1.y} stroke="#333" />
    <line x1={centerX} y1={centerY} x2={p2.x} y2={p2.y} stroke="#333" />
    <text textAnchor="middle" x={labelPt.x} y={labelPt.y} stroke={textColor} fill={textColor}>{label}</text>
  </g>
}


function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number): { x: number, y: number } {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;       
}