import React from 'react'
import ScrollContainer from 'react-indiana-drag-scroll'

import type { BoardGeometry } from '../lib/lumatone/BoardGeometry'
import TerpstraBoard from './TerpstraBoard'
import { rotatedRectBounds } from '../lib/drawing'
import { useRecoilValue } from 'recoil'
import { colorParamState, toneMappingParamState } from '../state/userParams'
import { useLayoutContext } from '../context/layout'

interface Props {
  numBoards?: number
  geometry: BoardGeometry
}

export default function MultiBoard(props: Props): React.ReactElement {
  const layout = useLayoutContext()
  console.log('layout: ', layout)
  const numBoards = props.numBoards || 2
  const { toneMap: tm } = useRecoilValue(toneMappingParamState)
  const { palette } = useRecoilValue(colorParamState)

  const { geometry: geo } = props
  const boards = []
  const xOffset = geo.boardWidth() - geo.rowWidth / 2
  const yOffset = geo.rowHeight * 2
  let w = 0
  let h = 0
  for (let i = 0; i < numBoards; i++) {
    const key = i.toString()
    const x = xOffset * i
    const y = yOffset * i
    const geometry = geo.withOffsetOrigin({ x, y })
    const toneMap = tm.transposed(i * 12)
    const b = TerpstraBoard({ key, palette, toneMap, geometry })
    boards.push(b)
    w = x + geo.boardWidth()
    h = y + geo.boardHeight()
  }

  const rot = -17.42

  const bounds = rotatedRectBounds(
    { origin: { x: 0, y: 0 }, size: { w, h } },
    rot
  )
  const tx = -1 * bounds.origin.x
  const ty = 0 //(bounds.origin.y)
  // console.log('w/h', w, h)
  // console.log(
  //   `bounds: ${bounds.origin.x}, ${bounds.origin.y} / ${bounds.size.w}, ${bounds.size.h}`
  // )

  const transform = `rotate(${rot}, ${w / 2}, ${
    h / 2
  }) translate(${tx}, ${ty}) `
  return (
    <ScrollContainer className="scroll-container" hideScrollbars={false}>
      <div style={{ width: bounds.size.w, height: bounds.size.h }}>
        <svg width={bounds.size.w} height={h} transform="translate(0, -120)">
          <g transform={transform}>{...boards}</g>
        </svg>
      </div>
    </ScrollContainer>
  )
}
