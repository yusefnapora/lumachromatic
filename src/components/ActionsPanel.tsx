import React from 'react'
import { useParamsContext } from '../context/params'
import { exportLumatoneIni } from '../lib/lumatone/export'

export function ActionsPanel() {
  const [params] = useParamsContext()

  const onExport = () => {
    console.log('exporting lumatone config')
    const {
      harmonic: { scale },
      color: { palette },
      mapping: { toneMap },
    } = params
    const ini = exportLumatoneIni(toneMap, palette, scale)
    const blob = new Blob([ini], { type: 'text/plain;charset=utf-8' })
    const filename = scale.name + '.ltn'
    saveAs(blob, filename)
  }

  return (
    <div>
      <button type="button" onClick={() => onExport()}>
        Export Lumatone Config File
      </button>
    </div>
  )
}
