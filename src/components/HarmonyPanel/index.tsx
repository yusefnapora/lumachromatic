import React from 'react'
import { Scale } from '@tonaljs/tonal'
import { useParamsContext } from '../../context/params'
import NoteButtonStrip from '../NoteButtonStrip'
import { SCALE_TYPES } from '../../constants'
import { ScaleTypeButton } from '../ScaleTypeButton'

export default function HarmonyPanel() {
  const [{ harmonic }, updateParams] = useParamsContext()

  const onNoteClicked = (note: string) => {
    const name = `${note} ${harmonic.scale.type}`
    const scale = Scale.get(name)
    if (scale) {
      updateParams({ harmonic: { ...harmonic, scale } })
    }
  }

  const onScaleTypeClicked = (scaleType: string) => {
    const name = `${harmonic.scale.tonic} ${scaleType}`
    const scale = Scale.get(name)
    if (scale) {
      updateParams({ harmonic: { ...harmonic, scale } })
    }
  }

  const disabledNotes = [harmonic.scale.tonic || '']

  const scaleTypeButtons = SCALE_TYPES.map((t) => (
    <ScaleTypeButton
      key={t}
      scaleType={t}
      disabled={harmonic.scale.type === t || harmonic.scale.aliases.includes(t)}
      onClick={onScaleTypeClicked}
    />
  ))

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-evenly',
        width: '100%',
        height: '100%',
      }}
    >
      <div>
        <span>Tonic:</span>
        <NoteButtonStrip
          disabledNotes={disabledNotes}
          onNoteClicked={onNoteClicked}
        />
      </div>

      <div style={{}}>{scaleTypeButtons}</div>
    </div>
  )
}
