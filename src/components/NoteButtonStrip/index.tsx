import React from 'react'
import { NOTES } from '../../constants'
import { NoteButton } from '../NoteButton'

interface Props {
  disabledNotes?: string[]
  onNoteClicked?: (note: string) => any
}

export default function NoteButtonStrip(props: Props) {
  const disabledNotes = new Set(props.disabledNotes || [])
  const buttons = NOTES.map((n) => (
    <NoteButton
      key={n}
      note={n}
      onClick={props.onNoteClicked}
      disabled={disabledNotes.has(n)}
    />
  ))

  return (
    <div
      style={{
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: '1fr',
        width: '100%',
      }}
    >
      {buttons}
    </div>
  )
}
