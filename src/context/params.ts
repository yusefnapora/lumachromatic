import React from 'react'
import type { AllParams } from '../types'
import { Scale } from '@tonaljs/tonal'
import Palette from '../lib/Palette'
import { TwelveToneMap } from '../lib/lumatone/ToneMap'

const defaultHarmonicParams = { 
  scale: Scale.get('C major')
}

const defaultColorParams = {
  palette: new Palette(12),
}

const defaultMappingParams = {
  toneMap: TwelveToneMap('C2')
}

export const defaultParams = {
  harmonic: defaultHarmonicParams,
  color: defaultColorParams,
  mapping: defaultMappingParams,
}

const ParamsContext = React.createContext<AllParams>(defaultParams) 

export default ParamsContext