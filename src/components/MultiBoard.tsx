import React, { useContext } from 'react'

import type { BoardGeometry } from '../lib/lumatone/BoardGeometry'
import TerpstraBoard from './TerpstraBoard'
import { rotatedRectBounds } from '../lib/drawing'
import ParamsContext from '../context/params'

interface Props {
  numBoards?: number,
  geometry: BoardGeometry,
}

export default function MultiBoard(props: Props): React.ReactElement {
  const numBoards = props.numBoards || 2
  const { mapping: { toneMap: tm }, color: { palette } } = useContext(ParamsContext)

  const { geometry: geo, } = props
  const boards = []
  const xOffset = (geo.boardWidth() - (geo.rowWidth / 2))
  const yOffset = (geo.rowHeight * 2)
  for (let i = 0; i < numBoards; i++) {
    const key = i.toString()
    const x = xOffset * i
    const y = yOffset * i
    const geometry = geo.withOffsetOrigin({x, y})
    const toneMap = tm.transposed(i * 12)
    const b = TerpstraBoard({ key, palette, toneMap, geometry })
    boards.push(b)
  }

  const rot = -17.42
  const w = (geo.boardWidth() * numBoards)
  const h = geo.boardHeight() + ((numBoards-1) * yOffset)
  const bounds = rotatedRectBounds({ origin: { x: 0, y: 0 }, size: { w, h }}, rot)
  const tx = (bounds.size.w - w) + geo.keyWidth
  const ty = 0//(bounds.origin.y)
  console.log('w/h', w, h)
  console.log(`bounds: ${bounds.origin.x}, ${bounds.origin.y} / ${bounds.size.w}, ${bounds.size.h}`)

  const transform = `translate(${tx}, ${ty}) rotate(${rot}, ${bounds.size.w/2}, ${bounds.size.h/2})`
  return <svg width={bounds.size.w} height={h}>
    <g transform={transform}>
      {...boards}
    </g>
  </svg>
}