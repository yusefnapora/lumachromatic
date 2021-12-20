import React from 'react'
import type { Scale } from '@tonaljs/scale'
import { Planet } from 'react-planet'
import { NOTES } from '../../constants'
import { useParamsContext } from '../../context/params'

interface Props {
  scale: Scale
  onTonicNoteClicked?: (note: string) => any
}

export default function ScaleCard(props: Props) {
  const [
    {
      color: { palette },
    },
  ] = useParamsContext()
  const { scale } = props

  const tonic = scale.tonic || 'C'
  const tonicColors = palette.noteColors(tonic)

  const size = '3em'

  const noteClicked = (note: string) => {
    props.onTonicNoteClicked && props.onTonicNoteClicked(note)
  }

  const tonicMenu = (
    <Planet
      autoClose
      orbitRadius={130}
      centerContent={
        <div
          style={{
            borderRadius: '50%',
            backgroundColor: tonicColors.primary,
            color: tonicColors.complementary(0),
            width: size,
            height: size,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {tonic}
        </div>
      }
    >
      {NOTES.map((n) => {
        const colors = palette.noteColors(n)
        return (
          <div
            key={n}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: colors.primary,
              color: colors.complementary(0),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => noteClicked(n)}
          >
            {n}
          </div>
        )
      })}
    </Planet>
  )

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      {tonicMenu}
    </div>
  )
}
