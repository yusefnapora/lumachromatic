import React from 'react'
import type { HarmonicParams } from '../types'
import { Scale } from '@tonaljs/tonal'

export const defaultHarmonicParams = { 
  scale: Scale.get('C major')
}

const HarmonicContext = React.createContext<HarmonicParams>(defaultHarmonicParams) 

export default HarmonicContext