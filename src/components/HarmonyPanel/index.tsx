import React from 'react'
import { Scale } from '@tonaljs/tonal'
import { useParamsContext } from '../../context/params'
import ScaleCard from '../ScaleCard'

export default function HarmonyPanel() {
  const [{ harmonic }, updateParams] = useParamsContext()

  const onTonicNoteClicked = (note: string) => {
      const name = `${note} ${harmonic.scale.type}`
      const scale = Scale.get(name)
      if (scale) {
          updateParams({ harmonic: { ...harmonic, scale } })
      }
  }

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
      <ScaleCard scale={harmonic.scale} onTonicNoteClicked={onTonicNoteClicked} />
    </div>
  )
}
