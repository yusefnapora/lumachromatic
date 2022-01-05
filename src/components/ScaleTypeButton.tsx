import React from 'react'

interface Props {
  scaleType: string
  disabled?: boolean
  onClick?: (scaleType: string) => any
}

export function ScaleTypeButton(props: Props) {
  const { disabled } = props
  const backgroundColor = disabled ? 'white' : 'gray'
  const color = disabled ? 'black' : 'white'
  return (
    <button
      type="button"
      onClick={() => props.onClick && props.onClick(props.scaleType)}
      disabled={disabled}
      style={{
        color,
        backgroundColor,
        fontSize: '1em',
        padding: '0.5em',
        margin: '2px',
      }}
    >
      <span>{props.scaleType}</span>
    </button>
  )
}
