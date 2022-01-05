import React from 'react'
import { useParamsContext } from '../context/params'
import { outlineTextShadow } from '../lib/styleUtils'

interface Props {
  note: string
  disabled?: boolean
  onClick?: (note: string) => any
}

export function NoteButton(props: Props) {
  const [
    {
      color: { palette },
    },
  ] = useParamsContext()
  const colors = palette.noteColors(props.note)

  const { disabled } = props
  const backgroundColor = disabled ? 'white' : 'gray'
  const textColor = colors.primary
  const outlineColor = disabled ? 'clear' : colors.complementary(0.4)

  return (
    <button
      type="button"
      disabled={props.disabled}
      style={{
        backgroundColor,
        color: textColor,
        textShadow: outlineTextShadow(outlineColor),
        fontSize: '2em',
      }}
      onClick={() => props.onClick && props.onClick(props.note)}
    >
      {props.note}
    </button>
  )
}
