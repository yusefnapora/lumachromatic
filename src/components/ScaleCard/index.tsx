import React from 'react'
import type { Scale } from '@tonaljs/scale'
import { Planet } from 'react-planet'
import { NOTES } from '../../constants'
import { useParamsContext } from '../../context/params'

interface Props {
  scale: Scale
}

export default function ScaleCard(props: Props) {
  const {
    color: { palette },
  } = useParamsContext()
  const { scale } = props

  const tonic = scale.tonic || 'C'
  const tonicColor = palette.colorForNoteName(tonic, undefined)

  const size = '2em'

  const tonicMenu = (
    <Planet
      autoClose
      centerContent={
        <div
          style={{
            borderRadius: '50%',
            backgroundColor: tonicColor,
            width: size,
            height: size,
          }}
        >
          {tonic}
        </div>
      }
    >
      {NOTES.map((n) => (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: palette.colorForNoteName(n, undefined),
          }}
        >
          {n}
        </div>
      ))}
    </Planet>
  )

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {tonicMenu}
      <span>{scale.name}</span>
    </div>
  )
}
