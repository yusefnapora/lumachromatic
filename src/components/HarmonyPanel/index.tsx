import React from 'react'
import { useParamsContext } from '../../context/params'
import ScaleCard from '../ScaleCard'

export default function HarmonyPanel() {
  const { harmonic } = useParamsContext()
  return (
    <div>
      <ScaleCard scale={harmonic.scale} />
    </div>
  )
}
