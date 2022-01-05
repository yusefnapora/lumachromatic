import React from 'react'
import { useRecoilValue } from 'recoil'
import { useParamsContext } from '../context/params'
import { outlineTextShadow } from '../lib/styleUtils'
import { colorParamState } from '../state/userParams'

interface Props {
  note: string
  disabled?: boolean
  onClick?: (note: string) => any
}

export function NoteButton(props: Props) {
  const { palette } = useRecoilValue(colorParamState)
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
