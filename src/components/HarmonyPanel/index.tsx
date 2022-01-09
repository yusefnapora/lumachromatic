import React from 'react'
import { Scale } from '@tonaljs/tonal'
import NoteButtonStrip from '../NoteButtonStrip'
import { SCALE_TYPES } from '../../constants'
import { ScaleTypeButton } from '../ScaleTypeButton'
import { useRecoilState } from 'recoil'
import { harmonicParamState } from '../../state/userParams'
import ColorWheel from '../ColorWheel'

export default function HarmonyPanel() {
  const [harmonic, setHarmonicState] = useRecoilState(harmonicParamState)

  const onNoteClicked = (note: string) => {
    const name = `${note} ${harmonic.scale.type}`
    const scale = Scale.get(name)
    if (scale) {
      setHarmonicState({ scale })
    }
  }

  const onScaleTypeClicked = (scaleType: string) => {
    const name = `${harmonic.scale.tonic} ${scaleType}`
    const scale = Scale.get(name)
    if (scale) {
      setHarmonicState({ scale })
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
        flexDirection: 'row',
        height: '100%',
      }}
    >
      <ColorWheel radius={250} />
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
    </div>
  )
}
